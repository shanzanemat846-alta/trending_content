const { isEmpty } = require('lodash');

const Chatgpt = require('./chatgpt.model');

const { ThrowMissingParamsError } = require('../utils/throw-missing-params-error');

const GetChat = async ({ filterParams, selectParams = {} }) => {
  ThrowMissingParamsError([filterParams]);

  const response = await Chatgpt.findOne(filterParams).select(selectParams);

  return response;
};

const UpdateChat = async ({ filterParams, updateParams, upsertParams = false }) => {
  ThrowMissingParamsError([filterParams, updateParams]);

  const response = await Chatgpt.updateOne(filterParams, {
    $set: updateParams
  }, {
    upsert: upsertParams
  });

  return response;
};

const InsertChat = async ({ projectId, title, chat }) => {
  if (!projectId || isEmpty(title)) {

    const error = new Error();
    error.statusCode = 400;
    error.error = 'ProjectId, Title both are required to save the chat!';

    throw error;
  }

  const newChat = new Chatgpt({
    projectid: projectId,
    title,
    chat
  });

  await newChat.save();

  return newChat;
};

module.exports = {
  GetChat,
  InsertChat,
  UpdateChat
};
