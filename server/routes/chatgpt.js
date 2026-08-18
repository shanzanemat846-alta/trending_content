const {
  addChat,
  getChats,
  chat_delete,
  chat_update,
} = require("../controllers/chatgptController");
const { CreateContent } = require("../controllers/gptController");

const router = require("express").Router();

const AuthenticateToken = require('../middleware/auth-token');

const { CatchResponse, TryResponse } = require('../utils/helpers');

const { ENDPOINTS } = require('../utils/constants');

router.post(ENDPOINTS.CHATGPT.CREATE_CONTENT, AuthenticateToken, async (req, res) => {
  try {
    const { contentCreationParams, platform, promptId } = req.body;
    const userId = req.userId;
  
    const response = await CreateContent({
      userId,
      contentCreationParams,
      platform,
      promptId
    });

    const { assistantResponse, chat, message } = response;

    TryResponse({
      res,
      message,
      data: { assistantResponse, chat }
    });
  } catch (err) {
    CatchResponse({
      res,
      err
    });
  }
});

router.get("/pull", getChats);
router.post("/", AuthenticateToken, addChat);
router.post("/update", AuthenticateToken, chat_update);
router.delete("/:id", chat_delete);

module.exports = router;