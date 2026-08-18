const {
  addCampaign,
  getCampaigns,
  campaign_delete,
  getCampaign,
  campaign_update,
  GetCampaignTitles,
  getProjectData,
  SaveCampaignAndSaveThreads,
} = require("../controllers/campaignController");

const router = require("express").Router();

const { CatchResponse, TryResponse } = require('../utils/helpers');
const { GetSubRedditSearch, GetSubRedditCommunity } = require('../services/reddit');

const AuthenticateToken = require('../middleware/auth-token');

router.get('/subreddit-search', async (req, res) => {
  try {
    const query = req.query;
    
    const response = await GetSubRedditSearch({
      query
    });

    const communityValue = await GetSubRedditCommunity({
      query
    });

    console.log('communityValue: ', communityValue, 'response', response);

    TryResponse({
      res,
      data: {
        redditSearchResults: response,
        community: communityValue
      }
    });
  } catch (err) {
    CatchResponse({
      res,
      err
    });
  }
});

router.get("/pull", getCampaigns);
router.get("/getData", getProjectData);
router.get("/:id", getCampaign);
router.post("/", addCampaign);
router.patch("/:id", campaign_update);
router.delete("/:id", campaign_delete);

router.post('/save-campaign-and-sync-threads', AuthenticateToken, async (req, res) => {
  try {
    const { campaignDetails, reSyncThreads } = req.body;
    console.log('\n\n', { campaignDetails, reSyncThreads });

    const response = await SaveCampaignAndSaveThreads({
      campaignDetails,
      reSyncThreads
    });

    const { campaignId, message = 'Successfully saved the campaign and threads', redditThreadsLogsDetails } = response;
   
    TryResponse({
      res,
      message,
      data: { campaignId, redditThreadsLogsDetails }
    });
  } catch (err) {
    console.log('err : ', err);
    CatchResponse({
      res,
      err
    });
  }
});

router.get('/campaigns/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    let { filters } = req.query;
    filters = JSON.parse(filters);

    const response = await GetCampaignTitles({
      projectId,
      filters
    });

    const { campaignsList } = response;

    TryResponse({
      res,
      data: {
        projectId,
        campaignsList
      }
    });
  } catch (err) {
    CatchResponse({
      res,
      err
    });
  }
});

module.exports = router;
