const { GetOpenAIModels, SaveOpenAIModel } = require('../../models/open-ai-models-services');

const SaveOpenAIModelDetails = async ({ modelName, apiKey }) => {

  const allModels = await GetOpenAIModels({filterParams: {} });

  const existingModelByName = allModels.find(m => m.modelName === modelName);
  if (existingModelByName) {
    throw new Error(`Model with name "${modelName}" already exists`);
  }

  const isFirstModel = allModels.length === 0;

  const newModel = await SaveOpenAIModel({
    modelName,
    apiKey,
    last4Digits: apiKey.slice(-4),
    isDefault: isFirstModel,
  });

  return {
    message: "OpenAI model saved successfully",
    model: newModel,
  };
};

module.exports = SaveOpenAIModelDetails;
