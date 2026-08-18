const Chat = require("../models/chatgpt.model");
const axios = require("axios");
const { isEmpty } = require('lodash');

const { GetProject } = require('../models/project-services');
const { GetUser } = require("../models/user-services");
const { GetUserSubscriptionPlan } = require("../models/user-subscription-plan-services");
const { GetOpenAIModel } = require("../models/open-ai-models-services");

const { CalculateCreditDeduction, DeductCreditsAndLogHistory } = require('../utils/helpers');
const { GetDecodedOpenAIKey } = require("../utils/open-ai-encryption");

const { CHAT_GPT_ENDPOINTS, COSTING_TYPES, DEFAULT_GPT_MODEL, GPT_4_MODEL, DEFAULT_ADMIN_KEY } = require('../utils/constants');

const chatGptToken = process.env.CHAT_GPT_TOKEN;

module.exports.addChat = async (req, res, next) => {
  try {
    const userId = req.userId;

    const { projectid, title, message } = req.body;
    console.log("title", title, projectid);

    // // Find existing chat or create a new one if not exists
    let chat = await Chat.findOne({ projectid, title });

    if (!chat) {
      chat = new Chat({
        projectid,
        title,
        chat: [{ user: "user", message }],
      });
    } 
    // else {
    //   return res.json({ errors: "Unable to create a chat beacuse its already existed", status: false });
    // }

    const messages = [
      { role: 'system', content: 'Respond only using valid HTML tags (<h1>, <p>, <strong>, <ul>, <li>, <code>, etc.) where needed. Do not include <html>, <head>, or <body>. Return only the HTML fragment, ready for rendering.'  },
      { role: 'user', content: message },
    ];

    const { additionCredits } = await GetUserSubscriptionPlan({ filterParams: { userId }});

    const { deductionAmount = 0, gptConsumedTokens = 0 } = await CalculateCreditDeduction({
      userId,
      projectId: projectid,
      type: COSTING_TYPES.GPT,
      words: message,
      additionCredits
    });
    const { assistantResponse, tokenUsage } = await getAssistantResponse({ messages, projectId: projectid, userId });

    await DeductCreditsAndLogHistory({
      userId,
      type: COSTING_TYPES.GPT,
      deductionAmount,
      projectId: projectid,
      title,
      gptConsumedTokens,
      actualTokenConsumed: tokenUsage
    });
    // Add assistant response to the chat
    chat.chat.push({ user: "assistant", message: assistantResponse });

    // Save chat
    await chat.save();

    res.json({ response: assistantResponse, chat, message: `${deductionAmount} credit used!` });
  } catch (error) {
    console.log('Chat addChat error:', {
      message: error?.message,
      status: error?.status || error?.response?.status,
      response: error?.response?.data || null,
      stack: error?.stack,
    });
    const status = error?.response?.status || error?.status || 500;
    const serverError = error?.response?.data?.error;
    const detailedMessage =
      (typeof serverError === 'string' && serverError) ||
      serverError?.message ||
      error?.error ||
      error?.message ||
      'Server Error!';
    res.status(status).json({ success: false, error: detailedMessage });
  }
};

module.exports.chat_update = async (req, res) => {
  try {
    const { id, message } = req.body;

    const userId = req.userId;

    console.log("title", id, message);

    let chat = await Chat.findById(id).sort({ date: -1 });
    chat.chat.push({ user: "user", message });

    console.log("chat", chat);

    const { projectid } = chat;
  
    // Keep Message History
    let messages = [];
    chat.chat.map((item) => {
      const subitem = { role: item.user, content: item.message };
      messages.push(subitem);
    });

    const { additionCredits } = await GetUserSubscriptionPlan({ filterParams: { userId }});

    const { deductionAmount = 0, gptConsumedTokens = 0 } = await CalculateCreditDeduction({
      userId,
      projectId: projectid,
      type: COSTING_TYPES.GPT,
      words: messages,
      additionCredits
    });
    const { assistantResponse, tokenUsage } = await getAssistantResponse({ messages, projectId: projectid, userId });

   // Add assistant response to the chat
    chat.chat.push({ user: "assistant", message: assistantResponse });

    await DeductCreditsAndLogHistory({
      userId,
      type: COSTING_TYPES.GPT,
      deductionAmount,
      chatId: id,
      projectId: projectid,
      title: chat.title,
      gptConsumedTokens,
      actualTokenConsumed: tokenUsage
    });
   
    // Save chat
    await chat.save();

    res.json({ response: assistantResponse, chat, message: `${deductionAmount} credit used!` });
  } catch (e) {
    console.log('Chat chat_update error:', {
      message: e?.message,
      status: e?.status || e?.response?.status,
      response: e?.response?.data || null,
      stack: e?.stack,
    });
    const status = e?.response?.status || e?.status || 500;
    const serverError = e?.response?.data?.error;
    const detailedMessage =
      (typeof serverError === 'string' && serverError) ||
      serverError?.message ||
      e?.error ||
      e?.message ||
      'Server Error!';
    res.status(status).json({ success: false, error: detailedMessage });
  }
};

async function getAssistantResponse({ messages, projectId, userId }) {
  const projectResponse = await GetProject({
    filterParams: { _id: projectId },
    selectParams: { chatgpttype: 1, projectOpenAI: 1 }
  });

  console.log('projectResponse: ', projectResponse);
  const { chatgpttype, projectOpenAI } = projectResponse;
  const { key: projectAIKey } = projectOpenAI || {};

  const chatGptModelType = chatgpttype || DEFAULT_GPT_MODEL;

  let openAIKey = '';

  if (!isEmpty(projectAIKey)) {
    openAIKey = projectAIKey
  } else {
    const userDetails = await GetUser({
      filterParams: { _id: userId },
      selectParams: { globalOpenAI: 1 }
    });

    console.log('userDetails: ', userDetails);
    const { globalOpenAI } = userDetails;
    const { key: globalOpenAIKey } = globalOpenAI || {};

    const adminDetails = await GetOpenAIModel({
      filterParams: { isDefault: true },
      selectParams: { apiKey: 1, modelName: 1 }
    });

    console.log('adminDetails: ', adminDetails);
    const { apiKey } = adminDetails;

    if (!isEmpty(globalOpenAIKey)) {
      openAIKey = globalOpenAIKey;
    } else if (!isEmpty(apiKey)) {
      openAIKey = apiKey;
    } else {
      const error = new Error();

      error.error = `Open API Key is not set for the selected model ${chatGptModelType} Please set it at Project Level or Globally in User Profile`;
      error.status = 400;
      throw error;
    }
  }

  openAIKey = GetDecodedOpenAIKey(openAIKey);

  console.log({ chatGptModelType, openAIKey });
  try {
    const response = await axios.post(
      CHAT_GPT_ENDPOINTS.CREATE_CHAT_COMPLETION,
      {
        model: chatGptModelType,
        messages
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAIKey}`,
        },
      }
    );
    // console.log("chatgpt message", response.data.choices[0].message.content);
    return {
      assistantResponse: response?.data?.choices[0]?.message?.content,
      tokenUsage: {
        promptTokens: response?.data?.usage.prompt_tokens,
        completionTokens: response?.data?.usage.completion_tokens,
        totalTokens: response?.data?.usage.total_tokens,
      }
    }
  } catch (err) {
    console.log('getAssistantResponse error:', {
      message: err?.message,
      status: err?.response?.status,
      response: err?.response?.data,
      stack: err?.stack,
    });
    const { error } = err?.response?.data || {};

    if (error?.code === 'invalid_api_key') {
      const errorMessage = new Error();
      errorMessage.status = err?.response?.status || 401;
      errorMessage.error = error?.message || 'Open AI key at Project Level or Globally in User Profile is not valid!';
      throw errorMessage;
    }

    const wrapped = new Error();
    wrapped.status = err?.response?.status || err?.status || 500;
    wrapped.error = error?.message || error || err?.message || 'Server Error!';
    throw wrapped;
  }
}

module.exports.getChats = async (req, res, next) => {
  try {
    const { projectid } = req.query; // Assuming projectid is passed as a query parameter
    console.log("projectid", projectid);
    // Check if projectid is provided
    if (!projectid) {
      return res.status(400).json({ errors: "Project ID is required" });
    }

    // Find threads for the specified projectid
    const chats = await Chat.find({ projectid }).sort({ date: -1 });

    return res.json(chats);
  } catch (ex) {
    next(ex);
  }
};

module.exports.chat_delete = (req, res) => {
  Chat.findById(req.params.id, function (err, chat) {
    if (!chat) {
      res.status(404).send("Prompt not found");
    } else {
      Chat.findByIdAndRemove(req.params.id)
        .then(function () {
          res.status(200).json("chat deleted");
        })
        .catch(function (err) {
          res.status(400).send("chat delete failed.");
        });
    }
  });
};
