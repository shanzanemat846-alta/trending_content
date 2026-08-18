const { GetOpenAIModels } = require('../../models/open-ai-models-services');

const GetOpenAIModelsDetails = async () => {
  const openAIModelsList = await GetOpenAIModels({
    filterParams: {},
    selectParams: "modelName isDefault last4Digits",
  });

  return {
    openAIModelsList
  };
};

module.exports = GetOpenAIModelsDetails;
