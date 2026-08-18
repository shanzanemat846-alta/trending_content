const { CountOfThreads } = require('../../models/thread-services');

const { CAMPAIGN_MODE, PLATFORMS } = require('../../utils/constants');

const GetRedditDataCount = async ({ projectId }) => {
  const subRedditCount = await CountOfThreads({
    filterParams: {
      projectid: projectId,
      platform: PLATFORMS.REDDIT,
      mode: CAMPAIGN_MODE.SUB_REDDIT
    }
  });

  const keywordsCount = await CountOfThreads({
    filterParams: {
      projectid: projectId,
      platform: PLATFORMS.REDDIT,
      mode: CAMPAIGN_MODE.KEYWORDS
    }
  });

  return {
    redditDataCount: {
      subReddit: subRedditCount,
      keywords: keywordsCount
    }
  };
};

module.exports = GetRedditDataCount;
