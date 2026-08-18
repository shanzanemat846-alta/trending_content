const { isEmpty, extend, orderBy } = require('lodash');

const { BulkWriteCaptions, GetCaptions } = require('../../models/caption-services');
const { GetComments } = require('../../models/comment-services');
const { GetThreads } = require('../../models/thread-services');

const { GetYoutubeVideoCaptions } = require('../../utils/helpers');

const { PLATFORMS } = require('../../utils/constants');

const GetVideoCaptions = async ({ youtubeThreadsId }) => {
  console.log('\n\n youtubeThreadsId: ', youtubeThreadsId.length);

  const threadDetails = await GetThreads({
    filterParams: { _id: { $in: youtubeThreadsId } },
    selectParams: {
      url: 1,
      platform: 1,
      title: 1,
      platform: 1,
      url: 1
    }
  });

  const urlsList = threadDetails.map(row => row.url);

  const captions = await GetCaptions({
    filterParams: {
      platform: PLATFORMS.YOUTUBE,
      url: urlsList
    }
  });

  const captionsToSave = [];

  for (let i = 0; i < threadDetails.length; i += 1) {
    const { url, platform } = threadDetails[i];

    const alreadyCaptions = captions.find(row => (row.url).trim() === (url).trim());

    if (isEmpty(alreadyCaptions)) {
      const {
        captions: transcriptions,
        engCaptionsNotAvailable,
        matches = [],
        captionTrackNotFound
      } = await GetYoutubeVideoCaptions({ url });

      const insertParams = {
        url,
        platform,
        captions: !engCaptionsNotAvailable ? transcriptions : []
      };

      if (captionTrackNotFound) {
        extend(insertParams, { captionTrackNotFound: true });
      } else if (engCaptionsNotAvailable) {
        extend(insertParams, { matches, engCaptionsNotAvailable: true });
      }

      captionsToSave.push({
        insertOne: {
          document: {
            ...insertParams
          }
        }
      });
    }
  }

  console.log('captionsToSave ', captionsToSave.length);
  if (captionsToSave.length) {
    await BulkWriteCaptions(captionsToSave);
  }

  // fetch the captions
  const allCaptions = await GetCaptions({ filterParams: { url: { $in: urlsList } } });

  // fetch the comments
  const allComments = await GetComments({ 
    filterParams: { threadId: { $in: youtubeThreadsId } },
    selectParams: { author: 1, comment: 1, publishedAt: 1, likeCount: 1, threadId: 1 },
    sortParams: { likeCount: 1 },
  });

  const youtubeThreadsData = threadDetails.map(row => {
    const { url, platform, title, _id: threadId, } = row;
  
    const captionDetails = allCaptions.find(row => (row.url).trim() === (url).trim());
    let comments = allComments.filter(row => String(row.threadId) === String(threadId));

    comments = orderBy(comments, ['likeCount'], ['desc']);

    const { captionTrackNotFound, engCaptionsNotAvailable, captions } = captionDetails

    return {
      threadId,
      title,
      platform,
      url,
      engCaptionsNotAvailable,
      captionTrackNotFound,
      captions,
      comments: comments.slice(0, 20),
    }
  });

  return { youtubeThreadsData };
};

module.exports = GetVideoCaptions;
