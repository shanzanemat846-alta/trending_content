const { extend, uniqBy, filter } = require('lodash');

const { GetAccessToken, SyncThreads } = require('../../services/reddit');

const { BulkWriteThread, DeleteThreads, GetThreads } = require('../../models/thread-services');

const { CheckImageExtension, ScoreThread, GetFirstImageFromPost } = require('../../utils/helpers');

const { PLATFORMS, CAMPAIGN_MODE, MATCH_TYPE } = require("../../utils/constants");

const { GetSemanticWordsByGPT } = require('../../services/chatgpt');

const SaveRedditThreads = async ({
  projectId,
  campaignId,
  category,
  mode,
  threadsList
}) => {
  const threadTitlesList = [];
  const bulkWriteThreadData = [];

  for (let i = 0; i < threadsList.length; i += 1) {
    threadTitlesList.push(threadsList[i].title);
  }

  const uniqueThreadTitles = [...new Set(threadTitlesList)];

  const prevThreads = await GetThreads({
    filterParams: {
      projectid: projectId,
      platform: PLATFORMS.REDDIT,
      title: { $in: uniqueThreadTitles },
    },
    selectParams: { title: 1 }
  });

  console.log('\n\n prevThreads: ', prevThreads.length);

  for (let i = 0; i < threadsList.length; i += 1) {
    const {
      title,
      ups,
      num_comments,
      url,
      permalink,
      subreddit,
      thumbnail,
      searchDetails,
      weight
    } = threadsList[i];

    const urlImage = GetFirstImageFromPost(threadsList[i])

    const imageUrl = urlImage ? CheckImageExtension({ url: urlImage }) : 'empty';

    const postPermalink = permalink;

    const threadExists = prevThreads
      .find((row) => row.title === title
        && String(row.projectid) === String(projectId));

    const additionalParams = {};

    if (mode === CAMPAIGN_MODE.KEYWORDS) {
      extend(additionalParams, { subreddit });

      if (searchDetails) {
        extend(additionalParams, { searchDetails: { ...searchDetails, weight } });
      }
    }

    if (!threadExists) {
      bulkWriteThreadData.push({
        insertOne: {
          document: {
            projectid: projectId,
            campaignID: campaignId,
            url: postPermalink,
            imageurl: imageUrl,
            upvotes: ups,
            comments: num_comments,
            mode,
            title,
            category,
            platform: 'reddit',
            ...additionalParams
          }
        }
      });
    }
  }

  console.log('\n\n update bulkWriteThreadData: ', bulkWriteThreadData.length);
  if (bulkWriteThreadData.length) {
    await BulkWriteThread(bulkWriteThreadData);
  }
};

const FetchAndSaveRedditThreads = async ({
  campaignId,
  userId,
  projectId,
  matchType,
  title,
  dateRange,
  redditFilters,
  mode,
  reSyncThreads,
  level = "level0",
}) => {
  let {
    threads: { min: minThreads, max: maxThreads, mode: threadsMode },
    upVotes: { min: minUpVotes, max: maxUpVotes, mode: upVotesMode },
    comments: { min: minComments, max: maxComments, mode: commentsMode },
  } = redditFilters;

  console.log("redditFilters: ", {
    minThreads,
    maxThreads,
    threadsMode,
    minUpVotes,
    maxUpVotes,
    upVotesMode,
    minComments,
    maxComments,
    commentsMode,
  });

  console.log('here getting the acces token')
  const accessToken = await GetAccessToken();

  if (reSyncThreads) {
    const deleteResponse = await DeleteThreads({
      filterParams: { campaignID: campaignId, platform: PLATFORMS.REDDIT },
    });
    console.log("\n\n deleteResponse: ", deleteResponse);
  }

  const syncThreadsParams = {
    accessToken,
    matchType,
    dateRange,
    threadsCount: redditFilters.threads,
    upVotes: redditFilters.upVotes,
    comments: redditFilters.comments,
    mode,
  };

  let threadsList = [];

  // -------------------- Initialize logger --------------------
  const loggerDetails = {
    level0: {
      keywords: "",
      allThreads: [],
      filteredThreads: []
    },
    level1: {
      semanticSearch1: {
        keywords: "",
        allThreads: [],
        filteredThreads: []
      },
      semanticSearch2: {
        keywords: "",
        allThreads: [],
        filteredThreads: []
      },
      semanticSearch3: {
        keywords: "",
        allThreads: [],
        filteredThreads: []
      }
    },
    level2: {
      semanticSearch1: {
        keywords: "",
        allThreads: [],
        filteredThreads: []
      },
      semanticSearch2: {
        keywords: "",
        allThreads: [],
        filteredThreads: []
      },
      semanticSearch3: {
        keywords: "",
        allThreads: [],
        filteredThreads: []
      }
    }
  };

  // -------------------- Exact match (level0) --------------------
  const { allFetchedThreadsTitle, filteredThreads: exactMatchThreads } =
    await SyncThreads({
      ...syncThreadsParams,
      subReddit: title,
      semanticMatch: false,
    });

  threadsList.push(
    ...exactMatchThreads.map((thread) => ({
      thread,
      weight: ScoreThread(thread, "level0"),
      searchDetails: {
        level: "level0",
        semanticMatch: false,
        actualKeyword: title,
      },
    }))
  );

  loggerDetails.level0.keywords = title;
  loggerDetails.level0.allThreads.push(...allFetchedThreadsTitle);
  loggerDetails.level0.filteredThreads.push(
    ...threadsList.map((t) => ({
      title: t.thread.title,
      weight: t.weight,
    }))
  );

  // -------------------- Check if more threads needed --------------------
  let threadsCount = 0;
  const shouldFetchMore = ({ threadsList }) => {
    if (threadsMode === "morethan" && threadsList.length < minThreads) {
      threadsCount = minThreads;
      return true;
    }
    if (threadsMode === "upto" && threadsList.length < maxThreads) {
      threadsCount = maxThreads;
      return true;
    }
    if (threadsMode === "range" && threadsList.length < maxThreads) {
      threadsCount = maxThreads;
      return true;
    }
    threadsCount = maxThreads;
    return false;
  };

  const syncSemanticSearch = shouldFetchMore({ threadsList });
  console.log(
    "\n\n syncSemanticSearch: ",
    syncSemanticSearch,
    "filter more threads: ",
    threadsList.length
  );

  // -------------------- Semantic expansion (level1 / level2) --------------------
  if (syncSemanticSearch && matchType !== MATCH_TYPE.EXACT) {
    const semanticSearchResults = await GetSemanticWordsByGPT({
      projectId,
      userId,
      keyword: title,
    });

    console.log("\n\n semanticSearchResults: ", semanticSearchResults);

    for (const [semanticLevel, keywords] of Object.entries(
      semanticSearchResults
    )) {
      let findMore = true;
      let keywordIndex = 0;

      for (const keyword of keywords) {
        // Determine which semanticSearch slot to use (semanticSearch1, semanticSearch2, semanticSearch3)
        const searchKey = `semanticSearch${keywordIndex + 1}`;
        const levelKey = semanticLevel.startsWith("level1") ? "level1" : "level2";
        
        // Skip if we've exceeded our 3 semantic search slots
        if (keywordIndex >= 3) break;

        const {
          allFetchedThreadsTitle,
          filteredThreads: semThreads,
        } = await SyncThreads({
          ...syncThreadsParams,
          subReddit: keyword,
          semanticMatch: true,
        });

        // Log to the specific semantic search slot
        loggerDetails[levelKey][searchKey].keywords = keyword;
        loggerDetails[levelKey][searchKey].allThreads.push(...allFetchedThreadsTitle);

        threadsList.push(
          ...semThreads.map((thread) => ({
            thread,
            weight: ScoreThread(thread, semanticLevel),
            searchDetails: {
              level: semanticLevel,
              semanticMatch: true,
              keyword,
              actualKeyword: title,
            },
          }))
        );

        threadsList = uniqBy(threadsList, (item) => item?.thread?.permalink);

        // Update filtered threads for this specific search
        loggerDetails[levelKey][searchKey].filteredThreads = semThreads.map((thread) => ({
          title: thread.title,
          weight: ScoreThread(thread, semanticLevel),
        }));

        keywordIndex++;
        findMore = shouldFetchMore({ threadsList });
        if (!findMore) break;
      }

      if (!findMore) break;
    }
  }

  // -------------------- Finalize top threads --------------------
  console.log("here the values: ", threadsList.length, "threadsCount", threadsCount);
  threadsList.sort((a, b) => b.weight - a.weight);
  const topThreads = threadsList.slice(0, threadsCount).map((t) => t.thread);

  await SaveRedditThreads({
    projectId,
    campaignId,
    category: title,
    mode,
    threadsList: topThreads,
  });

  return {
    message: "Reddit threads fetched and saved successfully.",
    loggerDetails,
  }
};

module.exports = FetchAndSaveRedditThreads;
