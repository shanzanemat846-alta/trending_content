const mongoose = require('mongoose');
const { isEmpty, extend } = require('lodash');

const Thread = require("../models/thread.model");

const { BulkWriteThread, DeleteThreads, GetThreads, CountOfThreads, GetThread } = require("../models/thread-services")
const { GetProject, UpdateProject } = require("../models/project-services")

const { CatchResponse } = require("../utils/helpers");

const { CAMPAIGN_MODE, PLATFORMS } = require("../utils/constants");

module.exports.addThread = async (req, res, next) => {
  try {
    const threads = req.body;
    threads.map(async (t) => {
      const { projectid, campaignID, title, url, imageurl, upvotes, viewCount, likeCount, favoriteCount, comments, mode, category } = t;
      console.log("thread", threads.length);
      const threadCheck = await Thread.findOne({ title, projectid });
      if (threadCheck)
        return res.json({ errors: "thread already existed", status: false });
      console.log(res.json.errors)
      try {
        const thread = await Thread.create({
          projectid,
          campaignID,
          title,
          url,
          imageurl,
          upvotes,
          favoriteCount,
          likeCount,
          viewCount,
          comments,
          mode,
          category,
          platform: PLATFORMS.REDDIT
        });
        return res.json({ status: true, thread });
      }
      catch (error) {
        //     console.error('Error posting thread:', error);
        //     throw error;
        //   }
      }
    })
  } catch (ex) {
    next(ex);
  }
};

module.exports.threads_update = async (req, res) => {
  try {
    const { id, threads } = req.body;
    console.log("id, threads", id, threads.length);
    await DeleteThreads({ filterParams: { campaignID: id } });

    const threadTitlesList = [];
    const projectIdList = [];

    for (let i = 0; i < threads.length; i += 1) {
      threadTitlesList.push(threads[i].title);
      projectIdList.push(threads[i].projectid?.toString());
    }

    const uniqueThreadTitles = [...new Set(threadTitlesList)];
    const uniqueProjectIds = [...new Set(projectIdList)];


    const prevThreads = await GetThreads({
      filterParams: { projectid: { $in: uniqueProjectIds }, title: { $in: uniqueThreadTitles } },
      selectParams: { title: 1 }
    });

    const bulkWriteThreadData = [];

    for (let i = 0; i < threads.length; i += 1) {
      const {
        projectid,
        campaignID,
        title,
        url,
        imageurl,
        upvotes,
        comments,
        mode,
        category,
        subreddit,
        viewCount,
        likeCount,
        favoriteCount
      } = threads[i];

      const threadExists = prevThreads
        .find((row) => row.title === title
          && String(row.projectid) === String(projectid));

      if (!threadExists) {
        bulkWriteThreadData.push({
          insertOne: {
            document: {
              projectid,
              campaignID,
              title,
              url,
              imageurl,
              upvotes,
              comments,
              viewCount,
              likeCount,
              favoriteCount,
              mode,
              category,
              subreddit,
              platform: PLATFORMS.REDDIT
            }
          }
        });
      }
    }

    console.log('\n\n bulkWriteThreadData: ', bulkWriteThreadData.length);
    if (bulkWriteThreadData.length) {
      await BulkWriteThread(bulkWriteThreadData);
    }

    return res.json({ status: true });
  } catch (e) {
    CatchResponse({
      err: e,
      res
    });
  }
};


module.exports.getThreads = async (req, res, next) => {
  try {
    const {
      projectid,
      name,
      stock,
      publish,
      subReddit,
      keywords,
      mode,
      keywordSubreddits,
      orderBy,
      order,
      skip = 0,
      limit = 10,
      platform,
      saveThreads = false
    } = req.query;

    if (!projectid) {
      return res.status(400).json({ errors: "Project ID is required" });
    }

    
    const projectDetails = await GetProject({ filterParams: { _id: projectid } });

    const filterConditions = { projectid, platform };

    const { selectedThreadsList } = projectDetails;

    let { redditThreadsIds = [], youtubeThreadsIds = [] } = selectedThreadsList || {};


    if (platform === PLATFORMS.REDDIT) {
      redditThreadsIds = redditThreadsIds.filter(row => row.threadId && row.mode === mode).map(row => row.threadId);

      if (redditThreadsIds.length) extend(filterConditions, { _id: { $nin: redditThreadsIds } });
    } else if (platform === PLATFORMS.YOUTUBE) {
      youtubeThreadsIds = youtubeThreadsIds.map(row => row.threadId);

      if (youtubeThreadsIds.length)  extend(filterConditions, { _id: { $nin: youtubeThreadsIds } });
    }

    if (mode) {
      filterConditions.mode = { $regex: new RegExp(mode, 'i') };
    }

    if (name) {
      filterConditions.title = { $regex: new RegExp(name, 'i') };
    }


    if (subReddit && mode === CAMPAIGN_MODE.SUB_REDDIT) {
      const subRedditArray = subReddit.split(',').map(id => mongoose.Types.ObjectId(id));
      filterConditions.campaignID = { $in: subRedditArray };
    }

    let sortCondition = {};

    if (orderBy && order) {
      if (platform === 'youtube') {
        sortCondition[`youtubeVideoDetails.${orderBy}`] = order === 'asc' ? 1 : -1;
      } else if (platform === 'reddit') {
        sortCondition[orderBy] = order === 'asc' ? 1 : -1;
      }
    }

    sortCondition['_id'] = -1;
    sortCondition['date'] = -1;

    if (!orderBy && !order) {
      sortCondition = { date: -1, _id: -1 };
    }


    let keywordThreads = [];
    let relatedSubreddits = [];

    if (keywords || keywordSubreddits) {
      const keywordsArray = keywords ? keywords.split(',') : [];
      const keywordSubredditsArray = keywordSubreddits ? keywordSubreddits.split(',') : [];

      if (keywordsArray.length) {
        filterConditions.campaignID = { $in: keywordsArray };
      }

      const allSubredditThreads = await GetThreads({
        filterParams: filterConditions,
        sort: sortCondition
      });
        
      relatedSubreddits = [...new Set(allSubredditThreads.map(thread => thread.subreddit))];

      if (keywordSubredditsArray.length) {
        filterConditions.subreddit = { $in: keywordSubredditsArray };
      }

      keywordThreads = await GetThreads({
        filterParams: filterConditions,
        sortParams: sortCondition,
        skip: parseInt(skip),
        limit: parseInt(limit)
      })

      const totalCount = await CountOfThreads({ filterParams: filterConditions });

      return res.json({ keywordThreads, subRedditThreads: relatedSubreddits, totalCount });
    }

    if (mode === 'Keyword') {
      if (keywords) {
        const keywordsArray = keywords.split(',');
        filterConditions.campaignID = { $in: keywordsArray };
      }

      keywordThreads = await GetThreads({
        filterParams: filterConditions,
        sortParams: sortCondition,
        skip: parseInt(skip),
        limit: parseInt(limit)
      });

      const allSubreddits = await GetThreads({
        filterParams: filterConditions,
        selectParams: 'subreddit',
        sortParams: sortCondition
      });

      const totalCount = await CountOfThreads({ filterParams: filterConditions });

      const uniqueSubreddits = [...new Set(allSubreddits.map(thread => thread.subreddit))];

      return res.json({ keywordThreads, subRedditThreads: uniqueSubreddits, totalCount });
    }

    const totalCount = await CountOfThreads({ filterParams: filterConditions });

    const threads = await GetThreads({
      filterParams: filterConditions,
      sortParams: sortCondition,
      skip: parseInt(skip),
      limit: parseInt(limit)
    })

    return res.json({ threads, totalCount });
  } catch (ex) {
    next(ex);
  }
};

module.exports.getThread = async (req, res) => {
  try {
    const { id } = req.params;
    const thread = await Thread.findById(id);
    return res.json(thread);
  } catch (e) {
    throw e;
  }
};

module.exports.thread_delete = async (req, res) => {
  try {
    const threadId = req.params.id;

    // Retrieve thread details
    const thread = await GetThread({
      filterParams: { _id: threadId },
      selectParams: { projectid: 1, platform: 1 },
    });

    if (isEmpty(thread)) {
      return res.status(404).send("Thread not found");
    }

    const { projectid, platform } =  thread;
 
    // Retrieve project details
    const project = await GetProject({ filterParams: { _id: projectid } });
    const { selectedThreadsList = {} } = project;

    const {
      redditThreadsIds = [],
      youtubeThreadsIds = [],
    } = selectedThreadsList;

    // Update the thread list based on the platform
    const updatedThreads = {
      redditThreadsIds:
        platform === PLATFORMS.REDDIT
          ? redditThreadsIds.filter((id) => String(id) !== String(threadId))
          : redditThreadsIds,
      youtubeThreadsIds:
        platform === PLATFORMS.YOUTUBE
          ? youtubeThreadsIds.filter((id) => String(id.threadId) !== String(threadId))
          : youtubeThreadsIds,
    };

    console.log('updatedThreads: ', updatedThreads);
    // Update project with the modified thread list
    await UpdateProject({
      filterParams: { _id: projectid },
      updateParams: { selectedThreadsList: updatedThreads },
    });

    // Attempt to delete the thread
    const deleteResult = await Thread.deleteOne({ _id: threadId });

    res.status(200).json("Thread deleted successfully");
  } catch (err) {
    console.error("Error deleting thread:", err);
    res.status(500).send("Thread deletion failed");
  }
};