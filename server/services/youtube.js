const axios = require('axios');

const { MAX_YOUTUBE_COMMENT_THREADS, YOUTUBE_ENDPOINTS } = require('../utils/constants');

const { NEXT_PUBLIC_YOUTUBE_API_KEY } = process.env;

const SearchYouTubeVideos = async ({ 
  searchQuery,
  limit = 50,
  publishedBefore,
  publishedAfter
}) => {
  try {
    let url = `${YOUTUBE_ENDPOINTS.YOUTUBE_SEARCH}?key=${NEXT_PUBLIC_YOUTUBE_API_KEY}&q=${encodeURIComponent(searchQuery)}&order=viewCount&part=snippet&type=video&maxResults=${limit}`;

    if (publishedBefore) {
      url += `&publishedBefore=${publishedBefore}`;
    }

    if (publishedAfter) {
      url += `&publishedAfter=${publishedAfter}`;
    }

    console.log('\n\n url', url);
    const response = await axios.get(url);

    const data = response.data;

    const youTubeVideos = data.items.map((child) => ({
      videoId: child.id.videoId,
      title: child.snippet.title,
      imageUrl: child.snippet.thumbnails.high.url,
    }
    ));
    return youTubeVideos;
  } catch (error) {
    console.log('\n\n error :', error.message);

    const err = new Error();
    err.statusCode = 400;
    err.error = 'Error in syncing youtube videos!';
    throw err;
  }
};

const FetchVideoStatistics = async ({ idsList, limit = 50 }) => {
  try {
    const url = `${YOUTUBE_ENDPOINTS.YOUTUBE_VIDEOS}?key=${NEXT_PUBLIC_YOUTUBE_API_KEY}&id=${idsList.join(',')}&part=statistics,contentDetails&maxResults=${limit}`;

    const response = await axios.get(url);

    const data = response.data;
    const videoStats = data.items.map((child) =>
    ({
      viewCount: child.statistics.viewCount,
      likeCount: child.statistics.likeCount,
      favoriteCount: child.statistics.favoriteCount,
      commentCount: child.statistics.commentCount,
      url: `https://www.youtube.com/watch?v=${child.id}`,
      id: child.id,
      duration: child.contentDetails?.duration
    })
    );
    return videoStats;
  } catch (error) {
    console.log('\n\n fetch video statistics error :', error.message);

    const err = new Error();
    err.statusCode = 400;
    err.error = 'Error in fetching statics of youtube videos!';
    throw err;
  }
};

const FetchYouTubeVideoCommentThreads = async ({ videoId, order = 'time', part = 'snippet' }) => {
  try {
    const url = YOUTUBE_ENDPOINTS.COMMENT_THREADS;

    const commentsList = [];
    let nextPageToken = null;

    const params = {
      part,
      videoId,
      maxResults: MAX_YOUTUBE_COMMENT_THREADS,
      order,
      key: NEXT_PUBLIC_YOUTUBE_API_KEY,
    };

    do {
      if (nextPageToken) {
        params.pageToken = nextPageToken;
      }

      const response = await axios.get(url, { params });

      if (response.data.items) {
        commentsList.push(...response.data.items);
      }

      if (commentsList.length < MAX_YOUTUBE_COMMENT_THREADS && response.data.nextPageToken) {
        nextPageToken = response.data.nextPageToken;
      } else {
        nextPageToken = null;
      }
    } while (nextPageToken);

    return commentsList;
  } catch (error) {
    if (error.response?.data?.error?.errors?.[0]?.reason === "commentsDisabled") {
      console.log(`Skipping video ${videoId}: Comments are disabled.`);
      return [];
    }

    return [];
  }
};

const FetchYouTubeVideos = async ({
  searchQuery,
  limit = 50,
  publishedBefore,
  publishedAfter,
}) => {
  try {
    const videosData = await SearchYouTubeVideos({ searchQuery, limit, publishedBefore, publishedAfter });
    const videoIdsList = videosData.map(row => row.videoId);
    const videosStats = await FetchVideoStatistics({ idsList: videoIdsList, limit });

    return {
      videosData,
      videosStats
    };
  } catch (error) {
    console.log('\n\n fetch youtube videos', error);

    const err = new Error();
    err.statusCode = 400;
    err.error = 'Error in fetching youtube videos!';
    throw err;
  }
};

module.exports = {
  FetchYouTubeVideos,
  FetchYouTubeVideoCommentThreads
};
