const mongoose = require('mongoose');
const { uniqBy } = require('lodash');

const { FetchYouTubeVideos, FetchYouTubeVideoCommentThreads } = require('../../services/youtube');

const { BulkWriteThread, DeleteThreads } = require('../../models/thread-services');
const { BulkWriteComment, DeleteComments } = require('../../models/comment-services');

const { GetSemanticWordsByGPT } = require('../../services/chatgpt');

const { FilterExactMatch, FilterPhraseMatch, ParseViewOption, ScoreYoutubeVideos } = require('../../utils/helpers');

const { YOUTUBE_VIDEOS_LIMIT, PLATFORMS, MATCH_TYPE } = require('../../utils/constants');
const { GetProject } = require('../../models/project-services');

const { ObjectId } = mongoose.Types;

const GetVideosComments = async ({ videoIdsList }) => {
  const commentThreadsData = [];

  for (let i = 0; i < videoIdsList.length; i +=1 ) {
    const commentResponse = await FetchYouTubeVideoCommentThreads({
      videoId: videoIdsList[i],
      order: 'relevance'
    });

    const comments = commentResponse?.map(item => {
      const {
        snippet: {
          topLevelComment: {
            snippet: {
              authorDisplayName = '',
              textDisplay = '',
              publishedAt = '',
              likeCount = 0
            } = {}
          } = {}
        } = {}
      } = item;

      return {
        videoId: videoIdsList[i],
        author: authorDisplayName,
        comment: textDisplay,
        publishedAt: publishedAt,
        likeCount
      }
    });

    commentThreadsData.push(...comments);
  }

  return commentThreadsData;
};

// 1. Data Processing Functions
const FormatYouTubeData = (videosData, videosStats, title, matchType, youtubeFilters) => {
  // Combine data
  let combined = videosData.map((item) => {
    const videoStats = videosStats.find(stat => stat.id === item.videoId);
    return {
      ...videoStats,
      ...item
    };
  });

  console.log('combined: ', combined.length);

  // Apply content matching
  if (matchType === MATCH_TYPE.EXACT) {
    combined = FilterExactMatch(combined, title);
  } else if (matchType === MATCH_TYPE.PHRASE) {
    combined = FilterPhraseMatch(combined, title);
  }

  console.log('combined: ', combined.length);

  const { likes: youtubeLikes, views: youtubeViews, comments: youtubeComments } = youtubeFilters;

  const getCondition = (value, key, { mode, min, max }) => {
    // console.log({
    //   [key]: value,
    //    mode, min, max
    // })
    switch (mode) {
      case "upto":
        return value <= max;
      case "morethan":
        return value >= min;
      case "range":
        return value >= min && value <= max;
      default:
        return true; // if mode is invalid or missing, accept all
    }
  };

  return combined.filter((video) => {
    const likeCount = Number(video.likeCount || 0);
    const commentCount = Number(video.commentCount || 0);
    const viewCount = Number(video.viewCount || 0);

    const likeCondition = getCondition(likeCount, 'likes', youtubeLikes);
    const commentCondition = getCondition(commentCount, 'comments', youtubeComments);
    const viewCondition = getCondition(viewCount, 'views', youtubeViews);

    return likeCondition && commentCondition && viewCondition;
  });
};

const CompareValues = (value, sign, threshold) => {
  switch (sign) {
    case "lessThan": return value < threshold;
    case "greaterThan": return value > threshold;
    default: return value >= threshold;
  }
};

// 2. Data Saving Function
const SaveYouTubeData = async ({
  formattedVideos,
  projectId,
  campaignId,
  title,
  mode = 'Keyword'
}) => {
  if (!formattedVideos.length) {
    return { threadsSaved: 0, commentsSaved: 0 };
  }

  // Get all video IDs for comment fetching
  const videoIdsList = formattedVideos.map(video => video.videoId);
  const commentThreads = await GetVideosComments({ videoIdsList });

  // Prepare operations
  const { threadOperations, commentOperations } = PrepareBulkOperations(
    formattedVideos,
    commentThreads,
    projectId,
    campaignId,
    title,
    mode
  );

  // Execute bulk operations
  if (threadOperations.length) {
    console.log(`Saving ${threadOperations.length} YouTube threads`);
    await BulkWriteThread(threadOperations);
  }

  if (commentOperations.length) {
    console.log(`Saving ${commentOperations.length} YouTube comments`);
    await BulkWriteComment(commentOperations);
  }

  return {
    threadsSaved: threadOperations.length,
    commentsSaved: commentOperations.length
  };
};

const PrepareBulkOperations = (videos, comments, projectId, campaignId, title, mode) => {
  const threadOperations = [];
  const commentOperations = [];

  videos.forEach(video => {
    const threadId = new ObjectId();

    // Prepare thread document
    threadOperations.push({
      insertOne: {
        document: {
          _id: threadId,
          projectid: projectId,
          campaignID: campaignId,
          mode,
          platform: PLATFORMS.YOUTUBE,
          category: title,
          title: video?.title,
          url: video?.url,
          imageurl: video.imageUrl,
          youtubeVideoDetails: {
            favoriteCount: Number(video.favoriteCount || 0),
            likeCount: Number(video.likeCount || 0),
            viewCount: Number(video.viewCount || 0),
            comments: Number(video.commentCount || 0),
          },
          duration: video.duration
        }
      }
    });

    // Prepare comments for this video
    const videoComments = comments.filter(c => c.videoId === video.videoId);
    videoComments.forEach(comment => {
      commentOperations.push({
        insertOne: {
          document: {
            threadId,
            platform: PLATFORMS.YOUTUBE,
            videoId: video.videoId,
            author: comment.author,
            comment: comment.comment,
            publishedAt: comment.publishedAt,
            likeCount: comment.likeCount
          }
        }
      });
    });
  });

  return { threadOperations, commentOperations };
};

const FetchAndSaveYoutubeVideos = async ({
  title,
  reSyncThreads,
  projectId,
  campaignId,
  dateRange,
  youtubeFilters,
  matchType,
  allDateRange,
}) => {
  const videoThreads = await FetchYouTubeVideos({
    searchQuery: title,
    limit: YOUTUBE_VIDEOS_LIMIT,
    publishedBefore: !allDateRange ? dateRange[1] : null,
    publishedAfter: !allDateRange ? dateRange[0] : null
  });

  const {
    videosData,
    videosStats
  } = videoThreads;

  if (reSyncThreads) {
    // delete youtube videos
    const deleteResponse = await DeleteThreads({ filterParams: { campaignID: campaignId, platform: PLATFORMS.YOUTUBE } });
    console.log('\n\n deleteResponse: ', deleteResponse);

    const deleteComments = await DeleteComments({ filterParams: { campaignId, platform: PLATFORMS.YOUTUBE } });
    console.log('\n\n deleteComments: ', deleteComments);
  }

  // Format and filter data
  let formattedVideos = FormatYouTubeData(
    videosData,
    videosStats,
    title,
    matchType,
    youtubeFilters
  );

  formattedVideos = uniqBy(formattedVideos, "url")

  if (formattedVideos.length < YOUTUBE_VIDEOS_LIMIT && matchType !== MATCH_TYPE.EXACT) {
  let relatedVideo = [];
    const projectDetails = await GetProject({
      filterParams: {
        _id: projectId
      }
    });

    const { userid: userId } = projectDetails;

    const semanticSearchResults = await GetSemanticWordsByGPT({
      projectId,
      userId,
      keyword: title,
    });

    console.log('semanticSearchResults: ', semanticSearchResults);

    relatedVideo.push(...formattedVideos.map((video) => ({
      video,
      weight: ScoreYoutubeVideos(video, 'level0'),
    }))); // save the original search

    // console.log('relatedVideo', relatedVideo);
    for (const [semanticLevel, keywords] of Object.entries(semanticSearchResults)) {
      for (const keyword of keywords) {
        const videoThreads = await RelatedVideos({
          title: keyword,
          YOUTUBE_VIDEOS_LIMIT,
          allDateRange,
          dateRange
        });

        const { videosData, videosStats } = videoThreads;
        // Format and filter data
        formattedVideos = FormatYouTubeData(
          videosData,
          videosStats,
          title,
          null,
          youtubeFilters,
        );

        // console.log('relatedVideo: ', formattedVideos.length);

        // relatedVideo.push(...formattedVideos);

        relatedVideo.push(
          ...formattedVideos.map((video) => ({
            video,
            weight: ScoreYoutubeVideos(video, semanticLevel),
          }))
        );
        relatedVideo = uniqBy(relatedVideo, (item) => item?.video?.url);
      }
    }

    // console.log('relatedVideo: ', relatedVideo);
    const sorted = relatedVideo.sort((a, b) => b.weight - a.weight);
    const top50 = sorted.slice(0, YOUTUBE_VIDEOS_LIMIT);

    // console.log('\n\n top50: ', top50);
    const result = top50.map(item => item.video)
      .filter(video => video !== null && video !== undefined);

    console.log('total video: ', result.length);
    
    await SaveYouTubeData({
      formattedVideos: result,
      projectId,
      campaignId,
      title
    });
  } else {
    await SaveYouTubeData({
      formattedVideos,
      projectId,
      campaignId,
      title
    });
  }

  return { message: 'Youtube threads fetched and saved successfully.' };
};

const RelatedVideos = async ({
  title,
  YOUTUBE_VIDEOS_LIMIT,
  allDateRange,
  dateRange
}) => {

  const videoThreads = await FetchYouTubeVideos({
    searchQuery: title,
    limit: YOUTUBE_VIDEOS_LIMIT,
    publishedBefore: !allDateRange ? dateRange[1] : null,
    publishedAfter: !allDateRange ? dateRange[0] : null
  });

  return videoThreads;
}

module.exports = FetchAndSaveYoutubeVideos;
