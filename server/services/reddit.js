const axios = require('axios');
const moment = require('moment');
const { isEmpty, uniqBy } = require('lodash');

const { FilterExactMatch, FilterPhraseMatch, ParseViewOption, 
  FindTheBestMatchFuss,
 } = require('../utils/helpers');

const { CAMPAIGN_MODE, REDDIT_ENDPOINTS, MATCH_TYPE, MAX_THREADS } = require('../utils/constants');

const clientId = process.env.NEXT_PUBLIC_REDDIT_CLIENT_ID;
const clientSecret = process.env.NEXT_PUBLIC_REDDIT_CLIENT_SECRET;

const GetAccessToken = async () => {
  try {
    const response = await axios.post(
      `${REDDIT_ENDPOINTS.BASE_REDDIT_URL}/api/v1/access_token`,
      {
        grant_type: 'client_credentials'
      },
      {
        auth: {
          username: clientId,
          password: clientSecret
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'trendingContent_test'
        }
      }
    );

    const accessToken = response?.data?.access_token;
    return accessToken;
  } catch (error) {
    const err = new Error();
    err.statusCode = 400;
    err.error = 'Access Token Error!';
    throw err;
  }
};

function sortType(text) {
  // Regex looks for "vs" or "verse" with spaces around (case-insensitive)
  const regex = /\b(vs|verse)\b/i;
  return regex.test(text);
}

const GetUrl = ({
  mode, subReddit, limit, after
}) => {
  let url = '';

  if (mode === CAMPAIGN_MODE.SUB_REDDIT) {
    url = `${REDDIT_ENDPOINTS.BASE_REDDIT_URL}/r/${encodeURIComponent(subReddit)}/new.json?t=new&limit=${limit}${after ? `&after=${after}` : ''
    }`;
  } else if (mode === CAMPAIGN_MODE.KEYWORDS) {
    const sortBy = sortType(subReddit) ? 'hot' : 'relevance'

    console.log('sortBy: ', sortBy)
    url = `${REDDIT_ENDPOINTS.BASE_REDDIT_URL}/search?q=${encodeURIComponent(subReddit)}&limit=${limit}&sort=${sortBy}${after ? `&after=${after}` : ''
    }`;
  }

  console.log('Generated Reddit URL:', url); // Debug log to check the generated URL
  return url;
};

const FilterThreads = ({
  subReddit,
  threads,
  upVotes,
  comments,
  dateRange,
  matchType,
  semanticMatch
}) => {
  let threadsWithScoring = []
  if (matchType === MATCH_TYPE.EXACT && !semanticMatch) {
    threads = FilterExactMatch(threads, subReddit);
    threadsWithScoring = []; // For exact match, threads are the scoring results
  } else if (matchType === MATCH_TYPE.PHRASE && !semanticMatch) {
    threads = FilterPhraseMatch(threads, subReddit);
    threadsWithScoring = []; // For phrase match, threads are the scoring results
  } else {
    const { filteredThreads, resultsWithScoring } = FindTheBestMatchFuss(threads, subReddit);
    threads= filteredThreads;
    threadsWithScoring= resultsWithScoring;
    console.log('Filtered threads with threshold: ', filteredThreads.length)
  }

  const getCondition = (value, key, { mode, min, max }) => {
    // console.log('value : ',  { [key]:value, mode, min, max })
    switch (mode) {
      case "upto":
        return value <= max;
      case "morethan":
        return value >= min;
      case "range":
        return value >= min && value <= max;
      default:
        return true; // No filtering
    }
  };
  const filteredThreads = threads.filter((thread) => {

    const upsCondition = getCondition(thread.ups, 'ups', upVotes);
    const commentsCondition = getCondition(thread.num_comments, 'comments', comments);

    if (dateRange === 'allDateRange') {
      return (
        upsCondition &&
        commentsCondition
      )
    }

    return (
      upsCondition &&
      commentsCondition &&
      moment(thread.created * 1000).isBetween(dateRange[0], dateRange[1])
    );
  });

  console.log('Filtered threads after other filter (like, comment, date): ', filteredThreads.length)
  // unique the threads 
  const uniqThreads = uniqBy(filteredThreads, 'permalink');
  console.log('Filtered threads after uniq: ', filteredThreads.length)
  return { uniqThreads, threadsWithScoring}
};

// fetchThread 
const SyncThreads = async ({
  subReddit,
  threadsCount,
  threadsList = [],
  limit = 100,
  after = '',
  upVotes,
  comments,
  dateRange,
  mode,
  accessToken,
  matchType,
  semanticMatch,
  totalFetched = 0,
  allFetchedThreadsTitle = [],
  maxFetchLimit = MAX_THREADS // Add configurable limit per search
}) => {
  try {
    const url = GetUrl({
      mode,
      subReddit,
      limit,
      after
    });

    console.log('\n\n url: ', url);

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'trendingContent_test:v0.0.1 (by /u/Last-Mycologist-5096)'
      }
    });
    const { children, after: newAfter } = response?.data?.data || [];

    const newThreads = children?.map((child) => child.data) || [];
    threadsList = threadsList.concat(newThreads);
    after = newAfter;

    totalFetched += newThreads.length;
    console.log('\n\n total Fetched threads: ', totalFetched);

    const { uniqThreads: filteredThreads, threadsWithScoring } = FilterThreads({
      subReddit,
      threads: threadsList, // Only filter new threads to avoid reprocessing
      upVotes,
      comments,
      dateRange,
      matchType,
      semanticMatch
    });

    allFetchedThreadsTitle = threadsWithScoring

    const shouldFetchMore = (() => {
      if (!after) return false;

      switch (threadsCount.mode) {
        case "morethan":
          return true; // keep fetching as long as after exists

        case "upto":
          return filteredThreads.length < threadsCount.max;

        case "range":
          return filteredThreads.length < threadsCount.max; // stop when max reached

        default:
          return false;
      }
    })();

    console.log('shouldFetchMore:', shouldFetchMore, 'totalFetched', totalFetched, 'filteredThreads: ', filteredThreads.length, 'threadsCount', threadsCount, 'after', after);

    if (shouldFetchMore && totalFetched < maxFetchLimit) {
      return SyncThreads({
        subReddit,
        threadsCount,
        threadsList,
        after: newAfter,
        upVotes,
        comments,
        dateRange,
        mode,
        accessToken,
        matchType,
        semanticMatch,
        totalFetched,
        allFetchedThreadsTitle,
        maxFetchLimit
      });
    }

    return { allFetchedThreadsTitle, filteredThreads };
  } catch (error) {
    console.log('error: ', error);
    const err = new Error();
    err.statusCode = 400;
    err.error = 'Error in syncing threads!';
    throw err;
  }
};

const FetchRedditThreadByUrl = async ({ url, accessToken }) => {
  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'trendingContent_test:v0.0.1 (by /u/Last-Mycologist-5096)',
      },
    });

    return response;
  } catch (error) {
    console.log('error: ', error);
    const err = new Error();
    err.statusCode = 400;
    err.error = 'Error in syncing reddit thread!';
    throw err;
  }
};

const GetSubRedditSearch = async ({ query }) => {
  try {
    const accessToken = await GetAccessToken();
    const url = `${REDDIT_ENDPOINTS.BASE_REDDIT_URL}/api/subreddit_autocomplete_v2?query=${encodeURIComponent(query.query)}`;

    const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'User-Agent': 'trendingContent_test:v0.0.1 (by /u/Last-Mycologist-5096)',
        },
      }
    );

    const data =response.data;

    const subredditNames = 
      data?.data?.children?.map(c => c.data.display_name) || 
      data?.children?.map(c => c.data.display_name) || 
    [];

    return subredditNames.filter(Boolean);
  } catch (error) {
    console.error('Error searching subreddits:', error);

    if (error.response) {
      const err = new Error(error.response.data?.message || 'Reddit API Error');
      err.statusCode = error.response.status;
      throw err;
    } else if (error.request) {
      throw new Error('No response from Reddit API');
    } else {
      throw new Error('Error setting up Reddit API request');
    }
  }
};

const GetSubRedditCommunity = async ({ query }) => {
  try {
    const accessToken = await GetAccessToken();

    // First, try exact subreddit `/about`
    const aboutUrl = `https://oauth.reddit.com/r/${query.query}/about`;

    try {
      const aboutRes = await axios.get(aboutUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "User-Agent": "trendingContent_test:v0.0.1 (by /u/Last-Mycologist-5096)",
        },
      });

      const communityValue = aboutRes.data?.data;

      return {
        publicDescription: communityValue?.public_description || "",
        subscribers: communityValue?.subscribers || 0,
        activeUserCount: communityValue?.active_user_count || 0,
      };
    } catch (aboutErr) {
      // If /about fails (likely invalid subreddit), fall back to search
      if (aboutErr.response?.status === 404) {
        const searchUrl = `https://oauth.reddit.com/subreddits/search?q=${encodeURIComponent(query.query)}`;

        console.log('searchUrl: ', searchUrl);
        const searchRes = await axios.get(searchUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "User-Agent": "trendingContent_test:v0.0.1 (by /u/Last-Mycologist-5096)",
          },
        });

        const firstMatch = searchRes.data?.data?.children?.[0]?.data;

        if (!firstMatch) {
          throw new Error("No matching subreddit found");
        }

        return {
          publicDescription: firstMatch?.public_description || "",
          subscribers: firstMatch?.subscribers || 0,
          activeUserCount: firstMatch?.active_user_count || 0,
        };
      }

      throw aboutErr; // rethrow if not a 404
    }
  } catch (error) {
    console.error("Error fetching subreddit community:", error.message);
    return {
      publicDescription: "",
      subscribers: 0,
      activeUserCount: 0,
    };
  }
};


module.exports = {
  FetchRedditThreadByUrl,
  GetAccessToken,
  SyncThreads,
  GetSubRedditSearch,
  GetSubRedditCommunity
};