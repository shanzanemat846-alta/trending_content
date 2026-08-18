const { Types } = require('mongoose');
const { GetComments } = require('../../models/comment-services');
const { GetPrompt } = require('../../models/prompt-services');
const { GetThreads } = require('../../models/thread-services');
const { GetCaptions } = require('../../models/caption-services');
const { FetchCaptionsAndSave } = require('../../utils/helpers');
const { PLATFORMS } = require('../../utils/constants');
const { ObjectId } = Types;

// Enhanced YouTube formatter
const formatYouTubeContent = (videoTitle, transcription, comments) => {
  const sections = [
    `=== SOURCE: YOUTUBE ===`,
    `Video Title: ${videoTitle}\n`,
    `Transcription:`,
    transcription,
    `\nPublic Comments:`,
    ...comments.map((comment, index) => `- Comment ${index + 1}: ${comment}`),
    `\n` // Add space between different sources
  ];
  
  return sections.join('\n');
};

const YoutubeInstructionsForGPT = async ({
  selectedYoutubeThreadsList
}) => {
  const threadIdsList = selectedYoutubeThreadsList.map(row => new ObjectId(row.threadId));

  const threads = await GetThreads({
    filterParams: {
      _id: { $in: threadIdsList },
      platform: PLATFORMS.YOUTUBE
    }
  });

  const urlsList = threads.map(row => row.url);

  // Fetch or create captions for all URLs
  const prevCaptions = await GetCaptions({
    filterParams: {
      platform: PLATFORMS.YOUTUBE,
      url: { $in: urlsList }
    }
  });

  const includedUrls = prevCaptions.map(caption => caption.url);
  const notIncludedUrls = urlsList.filter(url => !includedUrls.includes(url));

  // Fetch missing captions in parallel
  await Promise.all(notIncludedUrls.map(url => 
    FetchCaptionsAndSave({ url, platform: PLATFORMS.YOUTUBE })
  ));

  const allCaptions = await GetCaptions({
    filterParams: {
      url: { $in: urlsList },
      platform: PLATFORMS.YOUTUBE
    }
  });

  let threadTitlesList = [];
  let injectionContent = '';
  let projectId = null;

  let canCreateContent = false;
  const videoTitlesWithNoCaptions = [];

  for (const thread of threads) {
    const { _id, title: threadTitle, url, projectid } = thread;
    projectId = projectId || projectid;

    const selectedComments = selectedYoutubeThreadsList.find(row => row.threadId === String(_id));
    const selectedCaptions = selectedYoutubeThreadsList.find(row => row.threadId === String(_id));
    const captionDetails = allCaptions.find(row => row.url.trim() === url.trim());
    const { captions = [] } = captionDetails || {};

    if (captions.length) {
      canCreateContent = true;
      threadTitlesList.push(threadTitle);

      // Get transcription based on selection
      const transcription = selectedCaptions.captions === 'all'
        ? captions.map(row => row.transcription).join(' ')
        : captions.filter(obj => selectedCaptions.captions.includes(obj.id))
                 .map(row => row.transcription).join(' ');

      // Get comments based on selection
      let commentsList = [];
      if (selectedComments.comments === 'top') {
        commentsList = await GetComments({
          filterParams: {},
          sortBy: { likeCount: -1 },
          limit: 5
        });
      } else if (Array.isArray(selectedComments.comments)) {
        commentsList = await GetComments({
          filterParams: { _id: { $in: selectedComments.comments } },
          selectParams: { comment: 1 }
        });
      }

      const commentsContent = commentsList.map(row => row.comment);
      injectionContent += formatYouTubeContent(threadTitle, transcription, commentsContent);
    } else {
      videoTitlesWithNoCaptions.push(threadTitle);
    }
  }

  // Generate combined title
  let combinedPostTitle = '';
  if (threadTitlesList.length) {
    if (threadTitlesList.length === 1) {
      combinedPostTitle = threadTitlesList[0];
    } else {
      const numberOfLetters = Math.min(12, Math.max(3, Math.ceil(12 / Math.sqrt(threadTitlesList.length))));
      combinedPostTitle = `combined${threadTitlesList.length} ${threadTitlesList.slice(0, 3).map(title => title.slice(0, numberOfLetters)).join(', ')}`;
    }
  }

  return {
    projectId,
    combineThreadTitles: combinedPostTitle,
    canCreateContent,
    injectionContent,
    videoTitlesWithNoCaptions
  };
};

module.exports = YoutubeInstructionsForGPT;
