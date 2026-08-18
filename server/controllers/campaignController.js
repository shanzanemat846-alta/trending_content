const mongoose = require('mongoose');
const { isEmpty, extend } = require('lodash');

const Campaign = require("../models/campaign.model");
const Thread = require("../models/thread.model");

const { CreateCampaign, GetCampaignsData, GetCampaign } = require('../models/campaign-services');
const { GetUserSubscriptionPlan } = require("../models/user-subscription-plan-services");
const { GetProject, UpdateProject } = require('../models/project-services');

const { FetchAndSaveYoutubeVideos, FetchAndSaveRedditThreads } = require('./threadsController');

const { CalculateCreditDeduction, DeductCreditsAndLogHistory } = require('../utils/helpers');

const { COSTING_TYPES, COSTING_AMOUNT, PLATFORMS, SUBSCRIPTION_PLANS } = require('../utils/constants');

const { GetThreads } = require('../models/thread-services');

const { ObjectId } = mongoose.Types;

module.exports.addCampaign = async (req, res, next) => {
  try {
    const {
      projectid,
      mode,
      title,
      dateRange,
      platforms,
      matchType
    } = req.body;
    // const campaignCheck = await Campaign.findOne({ title, projectid });
    // if (campaignCheck)
    //   return res.json({ errors: "campaign already existed", status: false });
    console.log(res.json.errors )
    const campaign = await Campaign.create({
      projectid,
      title,
      mode,
      dateRange,
      platforms,
      matchType
    });
    return res.json({ status: true, campaign });
  } catch (ex) {
    next(ex);
  }
};

module.exports.getCampaigns = async (req, res, next) => {
  try {
    const { projectid } = req.query; // Assuming projectid is passed as a query parameter
    console.log("projectid", projectid);
    // Check if projectid is provided
    if (!projectid) {
      return res.status(400).json({ errors: "Project ID is required" });
    }

    const campaigns = await Campaign.find({ projectid }).sort({ date: -1 });

    return res.json(campaigns);
  } catch (ex) {
    next(ex);
  }
};

module.exports.getProjectData = async (req, res, next) => {
  try {
    const { projectid } = req.query;
    if (!projectid) {
      return res.status(400).json({ errors: "Project ID is required" });
    }

    const result = await Campaign.aggregate([
      {
        $match: { projectid: mongoose.Types.ObjectId(projectid) },
      },
      {
        $group:
          {
            _id: "$projectid",
            campaigns: {
              $push: "$$ROOT"
            },
            projectid: {
              $first: "$projectid"
            }
          }
      },
      {
        $lookup: {
          from: "stores",
          localField: "projectid",
          foreignField: "projectid",
          as: "stores"
        }
      },
      {
        $lookup: {
          from: "threads",
          localField: "projectid",
          foreignField: "projectid",
          as: "threads"
        }
      },
      {
        $project: {
          campaigns: 1,
          stores: 1,
          threads: 1
        }
      }
    ]);

    return res.json(result);
  } catch (ex) {
    next(ex);
  }
};

module.exports.getCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const campaign = await Campaign.findById(id);
    return res.json(campaign);
  } catch (e) {
    throw e;
  }
};

module.exports.campaign_update = async (req, res) => {
  try {
    const { id } = req.params;
    // console.log(req.body);
    // console.log("id", id);

    console.log('here update the campaign req.body: ', req.body);
    const campaign = await Campaign.findByIdAndUpdate(id, req.body);
    // console.log("updateCampaign", campaign);
    return res.json({ campaign });
  } catch (e) {
    throw e;
  }
};

module.exports.campaign_delete = async (req, res) => {
  try {
    const campaignId = req.params.id;

    // Fetch the campaign details
    const campaign = await GetCampaign({ filterParams: { _id: campaignId } });
    if (!campaign) {
      return res.status(404).send("Campaign not found");
    }

    const { projectid } = campaign;

    // Fetch the associated project
    const project = await GetProject({ filterParams: { _id: projectid } });
    if (!project) {
      return res.status(404).send("Associated project not found");
    }

    const { selectedThreadsList = {} } = project;

    // Fetch all threads related to the campaign
    const threads = await Thread.find({ campaignID: campaignId });

    // Separate Reddit and YouTube threads
    const redditThreadIds = threads
      .filter((thread) => thread.platform === PLATFORMS.REDDIT)
      .map((thread) => String(thread._id));

    const youtubeThreadIds = threads
      .filter((thread) => thread.platform === PLATFORMS.YOUTUBE)
      .map((thread) => String(thread._id));

    // Update the thread lists in the project
    const updatedThreads = {
      redditThreadsIds: selectedThreadsList.redditThreadsIds.filter(
        (id) => !redditThreadIds.includes(String(id))
      ),
      youtubeThreadsIds: selectedThreadsList.youtubeThreadsIds.filter(
        (id) => !youtubeThreadIds.includes(String(id.threadId))
      ),
    };

    // Delete all threads in a single call
    await Thread.deleteMany({ _id: { $in: [...redditThreadIds, ...youtubeThreadIds] } });

    // Update the project with the modified thread list
    await UpdateProject({
      filterParams: { _id: projectid },
      updateParams: { selectedThreadsList: updatedThreads },
    });

    // Delete the campaign
    await Campaign.deleteOne({ _id: campaignId });

    res.status(200).json("Campaign and related threads deleted successfully");
  } catch (error) {
    console.error("Error in campaign_delete:", error);
    res.status(500).send("An error occurred while deleting the campaign");
  }
};

module.exports.GetCampaignTitles = async ({
  projectId,
  filters
}) => {
  const { mode, platform, saveThreads } = filters;

  const { selectedThreadsList } = await GetProject({ filterParams: { _id: projectId } })

  const filterParams = {
    projectid: projectId,
    mode,
    [`platforms.${platform}`]: { $exists: true }
  };

  if (saveThreads) {
    const { redditThreadsIds = [], youtubeThreadsIds = [] } = selectedThreadsList || {};

    const youtubeThreads = youtubeThreadsIds.map(row => row.threadId);

    const campaigns = await GetThreads({ 
      filterParams: { _id : { $in: [...redditThreadsIds, ...youtubeThreads] } },
      selectParams: { campaignID: 1 }
     });
  
    const campaignIds = campaigns.map(row => row.campaignID);

    extend(filterParams, { _id: { $in: campaignIds} });
  }


  const campaignsList = await GetCampaignsData({
    filterParams,
    selectParams: { title: 1 }
  });

  return { campaignsList };
};

module.exports.SaveCampaignAndSaveThreads = async ({
  campaignDetails,
  reSyncThreads = false
}) => {
  const {
    projectid,
    mode,
    title,
    dateRange,
    platforms,
    matchType,
    allDateRange
  } = campaignDetails;

  const { reddit, youtube, twitter } = platforms;
  const projectDetails = await GetProject({ filterParams: { _id: projectid } });

  const { subscriptionPlan, additionCredits } = await GetUserSubscriptionPlan({ filterParams: { userId: projectDetails.userid }});

  if (reSyncThreads) {
    if (subscriptionPlan === SUBSCRIPTION_PLANS.STARTER || subscriptionPlan === SUBSCRIPTION_PLANS.FREE) {
      const error = new Error();
      error.status = 500;
      error.error = "Need to update the plan to advanced to enable this feature";
      throw error;
    }
  }

  let platformErrors = {
    reddit: false,
    youtube: false,
    twitter: false
  };

  let redditMessage = '';
  let youtubeMessage = '';
  let twitterMessage = '';

  let campaignId = new ObjectId();

  let type;
  let deductionAmount = 0;
  if (!isEmpty(reddit) && !isEmpty(youtube)) {
    type = COSTING_TYPES.MULTI_PLATFORM_CAMPAIGN;
    ({ deductionAmount = 0 } = await CalculateCreditDeduction({
      type,
      userId: projectDetails.userid,
      additionCredits
    }));
  } else if (!isEmpty(reddit)) {
    type = COSTING_TYPES.REDDIT_CAMPAIGN;
    ({ deductionAmount = 0 } = await CalculateCreditDeduction({
      type,
      userId: projectDetails.userid,
      additionCredits
    }));
  } else if (!isEmpty(youtube)) {
    type = COSTING_TYPES.YOUTUBE_CAMPAIGN;
    ({ deductionAmount = 0 } = await CalculateCreditDeduction({
      type,
      userId: projectDetails.userid,
      additionCredits
    }));
  }

  let newCampaignId;
  if (!reSyncThreads) {
    const isCampaignExists = await GetCampaign({
      filterParams: { projectid, title }
    });


    const campaign = await CreateCampaign({
      campaignId,
      projectId: projectid,
      title,
      mode,
      dateRange: allDateRange ? 'allDateRange' : dateRange,
      platforms,
      matchType
    });
    newCampaignId = campaign._id;
  } else {
    campaignId = campaignDetails._id;
  }

  let redditThreadsLogsDetails = {};
  if (!isEmpty(reddit)) {
    try {
      const { message, loggerDetails } = await FetchAndSaveRedditThreads({
        projectId: projectid,
        userId: projectDetails.userid,
        campaignId,
        reSyncThreads,
        matchType,
        title,
        dateRange: allDateRange ? 'allDateRange' : dateRange,
        redditFilters: reddit,
        mode
      });

      redditThreadsLogsDetails = loggerDetails
      redditMessage = message;
      redditThreadsFetched = true;
    } catch(error) {
      console.log('error reddit: ', error);
      platformErrors.reddit = true;
      redditMessage = 'Failed to fetch the reddit threads.'
    }
  }

  if (!isEmpty(youtube)) {
    try {
      const { message } = await FetchAndSaveYoutubeVideos({
        reSyncThreads,
        projectId: projectid,
        campaignId,
        title,
        dateRange,
        youtubeFilters: youtube,
        matchType,
        allDateRange
      });

      youtubeMessage = message;
      youtubeThreadsFetched = true;
    } catch(error) {
      console.log('error youtube: ', error);
      platformErrors.youtube = true;
      youtubeMessage = 'Failed to fetch the youtube videos.';
    }
  }

  const filteredPlatformErrors = Object.keys(platformErrors)
  .reduce((acc, key) => {
    if (platformErrors[key]) acc[key] = true;
    return acc;
  }, {});

  if (type === COSTING_TYPES.MULTI_PLATFORM_CAMPAIGN) {
    if (platformErrors.reddit === true) {
      deductionAmount -= COSTING_AMOUNT[type]
    }
    if (platformErrors.youtube === true) {
      deductionAmount -= COSTING_AMOUNT[type]
    }
  }
  await DeductCreditsAndLogHistory({
    type,
    userId: projectDetails.userid,
    deductionAmount,
    reSyncThreads,
    campaignId: reSyncThreads ? campaignId : newCampaignId,
    platformErrors: filteredPlatformErrors
  });

  let message = `${deductionAmount} credit used. Campaign has been created successfully.`;
  let messageParts = [];

  if (reSyncThreads) {
    messageParts.push(`${deductionAmount} credit used. Campaign re-synced successfully.`);
  } else {
    messageParts.push(`${deductionAmount} credit used. Campaign has been created successfully.`);
  }

  if (!isEmpty(redditMessage))  messageParts.push(redditMessage);
  if (!isEmpty(youtubeMessage))  messageParts.push(youtubeMessage);

  const finalMessage = messageParts.join(' & ');

  return { campaignId: campaignId.toString(), message: finalMessage, redditThreadsLogsDetails };
};
