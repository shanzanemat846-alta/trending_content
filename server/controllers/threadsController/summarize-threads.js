const { GetThreads } = require('../../models/thread-services');
const GetRedditDetails = require('./get-reddit-details');
const GetVideoCaptions = require('./get-captions');
const { GetAssistantResponse } = require('../../services/chatgpt');
const { GetProject } = require('../../models/project-services');

const { CalculateCreditDeduction, DeductCreditsAndLogHistory } = require('../../utils/helpers');

const { PLATFORMS, STATIC_PREDEFINED_PROMPT, COSTING_TYPES } = require('../../utils/constants');
const { isEmpty } = require('lodash');

const SummarizeThreads = async ({ threadsList }) => {
  const threads = await GetThreads({ filterParams: { _id: { $in: threadsList } } });

  if (!threads?.length) {
    throw new Error('No threads found for the given IDs.');
  }

  const { projectid } = threads[0];
  const projectDetails = await GetProject({ filterParams: { _id: projectid } });
  const { userid } = projectDetails;

  console.log('\n\n projectDetails', projectDetails)

  const youtubeThreads = threads.filter(row => row.platform === PLATFORMS.YOUTUBE);
  const redditThreads = threads.filter(row => row.platform === PLATFORMS.REDDIT);

  let youtubeDetails = [];

  if (youtubeThreads.length) {
    ({ youtubeThreadsData: youtubeDetails } = await GetVideoCaptions({ youtubeThreadsId: youtubeThreads }))
    youtubeDetails = youtubeDetails.map(row => ({
      title: row.title,
      postContent: row.captions,
      comments: row.comments,
      platform: 'youtube'
    }));
  }

  let redditDetails = [];
  let subRedditList = [];
  if (redditThreads.length) {
    const { redditThreadsData } = await GetRedditDetails({ redditThreadsId: redditThreads });

    redditDetails = redditThreadsData.map(row => {
      const bodyPart = row.postBody?.trim() ? `Post: ${row.postBody.trim()}\n\n` : '';
      const commentPart = Array.isArray(row.comments) && row.comments.length
        ? `Comments:\n${row.comments.map(c => c.message || '').join('\n')}`
        : '';

      return {
        title: row.title,
        postContent: `${bodyPart}${commentPart}`.trim() || '[No content]',
        platform: 'reddit'
      };
    });

    subRedditList = redditThreadsData.map(row => {
      const matched = redditThreads.find(rowData => rowData.title === row.title);
      return matched?.subreddit || null;
    }).filter(Boolean);

    subRedditList =  [...new Set(subRedditList)]
  }

  const combinedDetails = [...youtubeDetails, ...redditDetails];

  if (!combinedDetails.length) {
    throw new Error('No thread details available for summarization.');
  }

  const { deductionAmount = 0, gptConsumedTokens = 0 } = await CalculateCreditDeduction({
    userId: userid,
    projectId: projectid,
    type: COSTING_TYPES.GPT_SUMMARY,
    words: JSON.stringify(combinedDetails),
  });

  console.log('deductionAmount, gptConsumedTokens', {
    deductionAmount,
    gptConsumedTokens
  });

  const messages = [
    {
      role: 'system',
      content: STATIC_PREDEFINED_PROMPT
    },
    {
      role: 'user',
      content: JSON.stringify(combinedDetails)
    }
  ];


  console.log('messages: ', messages);

  const result = await GetAssistantResponse({
    messages,
    projectId: projectid,
    userId: userid,
  });
  
  let { assistantResponse, tokenUsage } = result;

  console.log('here the token usage: ', tokenUsage, "assistantResponse", assistantResponse);

  if (!isEmpty(assistantResponse)) {
    console.log("deduct the tokens:");
    await DeductCreditsAndLogHistory({
      userId: userid,
      type: COSTING_TYPES.GPT_SUMMARY,
      deductionAmount,
      projectId: projectid,
      title: "Combined Threads Summary",
      gptConsumedTokens,
      actualTokenConsumed: tokenUsage
    });
  }

  const jsonStart = assistantResponse.indexOf('{');
  const jsonEnd = assistantResponse.lastIndexOf('}') + 1;
  const jsonString = assistantResponse.slice(jsonStart, jsonEnd);

  // Clean up any trailing commas or invalid characters
  const cleanJsonString = jsonString.replace(/,\s*$/, '');

  assistantResponse = JSON.parse(cleanJsonString);
  console.log('assistantResponse:', assistantResponse);


  return {
    message: `${deductionAmount} credit used.`,
    summaryFindingDetails: {
      summary: assistantResponse?.summary || "",
      subReddit: subRedditList,
      faqs: assistantResponse?.faqs || [],
      threads: assistantResponse?.threads || []
    }
  };
};

module.exports = SummarizeThreads;
