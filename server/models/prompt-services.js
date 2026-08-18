const Prompt = require('./prompt.model');

const { ThrowMissingParamsError } = require('../utils/throw-missing-params-error');

const GetPrompt = async ({ filterParams, selectParams = {} }) => {
  ThrowMissingParamsError([filterParams]);

  const response = await Prompt.findOne(filterParams).select(selectParams);

  return response;
};

module.exports = {
  GetPrompt
};
