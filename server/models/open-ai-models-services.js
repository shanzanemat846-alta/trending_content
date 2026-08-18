const OpenAIModel = require('../models/open-ai-model');

const { ThrowMissingParamsError } = require('../utils/throw-missing-params-error');

const SaveOpenAIModel = async ({
  modelName,
  apiKey,
  last4Digits,
  isDefault
}) => {
  const saveParams = {
    modelName,
    apiKey,
    last4Digits,
    isDefault
  };

  const newOpenAIModel = new OpenAIModel(saveParams);
  await newOpenAIModel.save();

  return newOpenAIModel;
}

const GetOpenAIModels = async ({
  filterParams = {},
  selectParams = {},
  sortBy = { createdAt: -1 },
  limit,
}) => {
  ThrowMissingParamsError([filterParams]);

  const response = await OpenAIModel
    .find(filterParams)
    .select(selectParams)
    .sort(sortBy)
    .limit(limit)

  return response;
};

const GetOpenAIModel = async ({
  filterParams,
}) => {
  ThrowMissingParamsError([filterParams]);

  const response = await OpenAIModel.findOne(filterParams);

  return response;
};


const DeleteOpenAIModel = async ({ filterParams }) => {
  ThrowMissingParamsError([filterParams]);

  const response = await OpenAIModel.deleteOne(filterParams);
  return response;
};

const UpdateOpenAIModel = async ({
  filterParams,
  updateParams = {},
  unsetParams = {},
  incParams = {}
}) => {
  ThrowMissingParamsError([filterParams]);

  const response = await OpenAIModel.findOneAndUpdate(
    { ...filterParams },
    {
      $set: updateParams,
      $inc: incParams,
      $unset: unsetParams,
    },
    { new: true }
  );

  return response;
};

const UpdateOpenAIModels = async ({
  filterParams,
  updateParams = {},
  unsetParams = {},
  incParams = {}
}) => {
  ThrowMissingParamsError([filterParams]);

  const response = await OpenAIModel.updateMany(
    { ...filterParams },
    {
      $set: {
        ...updateParams
      },
      $inc: incParams,
      $unset: unsetParams
    }
  );

  return response;
};

module.exports = {
  GetOpenAIModel,
  GetOpenAIModels,
  SaveOpenAIModel,
  DeleteOpenAIModel,
  UpdateOpenAIModel,
  UpdateOpenAIModels
};
