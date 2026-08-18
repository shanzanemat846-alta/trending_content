const {
  addThread,
  getThreads,
  thread_delete,
  getThread,
  threads_update,
  // thread_update,
} = require("../controllers/threadController");

const { 
   GetCaption, 
   GetCaptions,
   GetRedditDetails,
   GetThreadComments,
   GetRedditDataCount,
   GetSaveThreads,
   SummarizeThreads,
   DownloadThreads
} = require('../controllers/threadsController');

const router = require("express").Router();

const AuthenticateToken = require('../middleware/auth-token');

const { CatchResponse, TryResponse } = require('../utils/helpers');

const { ENDPOINTS } = require('../utils/constants');

router.get(ENDPOINTS.THREAD.THREAD_COMMENTS, AuthenticateToken, async (req, res) => {
  try {
    const { threadId } = req.params;

    const response = await GetThreadComments({
      threadId
    });

    const { threadComments } = response;
   
    TryResponse({
      res,
      data: { threadComments }
    });
  } catch (err) {
    CatchResponse({
      res,
      err
    });
  }
});

router.get(ENDPOINTS.THREAD.FETCH_AND_SAVE_CAPTIONS, AuthenticateToken, async (req, res) => {
  try {
    const { threadId } = req.params;

    const response = await GetCaption({
      threadId
    });

    const { captions } = response;
   
    TryResponse({
      res,
      data: { captions }
    });
  } catch (err) {
    CatchResponse({
      res,
      err
    });
  }
});

router.post(ENDPOINTS.THREAD.FETCH_AND_SAVE_YOUTUBE_THREAD_CAPTIONS, AuthenticateToken, async (req, res) => {
  try {
    const { youtubeThreadsId } = req.body;

    const response = await GetCaptions({
      youtubeThreadsId
    });

    const { youtubeThreadsData } = response;
   
    TryResponse({
      res,
      data: { youtubeThreadsData }
    });
  } catch (err) {
    CatchResponse({
      res,
      err
    });
  }
});

router.post(ENDPOINTS.THREAD.FETCH_REDDIT_THREAD_DETAILS, AuthenticateToken, async (req, res) => {
  try {
    const { redditThreadsId } = req.body;

    const response = await GetRedditDetails({
      redditThreadsId
    });

    const { redditThreadsData } = response;
   
    TryResponse({
      res,
      data: { redditThreadsData }
    });
  } catch (err) {
    CatchResponse({
      res,
      err
    });
  }
});

router.get(ENDPOINTS.THREAD.GET_REDDIT_DATA_COUNT, AuthenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;

    const response = await GetRedditDataCount({
      projectId
    });

    const { redditDataCount } = response;
   
    TryResponse({
      res,
      data: { redditDataCount }
    });
  } catch (err) {
    CatchResponse({
      res,
      err
    });
  }
});

router.get(ENDPOINTS.THREAD.GET_SAVE_THREADS, AuthenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;

    const response = await GetSaveThreads({
      projectId
    });

    const { saveThreads } = response;
   
    TryResponse({
      res,
      data: { saveThreads }
    });
  } catch (err) {
    CatchResponse({
      res,
      err
    });
  }
});

router.post(ENDPOINTS.THREAD.SUMMARIZE_THREADS, AuthenticateToken, async (req, res) => {
  try {
    const { threadsList } = req.body;

    const response = await SummarizeThreads({
      threadsList
    });

    const { message, summaryFindingDetails } = response;
   
    TryResponse({
      res,
      message,
      data: { summaryFindingDetails }
    });
  } catch (err) {
    CatchResponse({
      res,
      err
    });
  }
});

router.get(ENDPOINTS.THREAD.DOWNLOAD_THREADS, async (req, res) => {
  try {
    const { threadsList } = req.query;

    // Parse the JSON string back to an array
    const threadIds = JSON.parse(threadsList || '[]');

    const { csvData, fileName } = await DownloadThreads({ 
      threadsList: threadIds
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    res.status(200).send(csvData);
  } catch (error) {
    console.log('error: ', error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/pull", getThreads);
router.get("/:id", getThread);
router.post("/", addThread);
router.post("/update", threads_update);
// router.patch("/:id", thread_update);
router.delete("/:id", thread_delete);

module.exports = router;
