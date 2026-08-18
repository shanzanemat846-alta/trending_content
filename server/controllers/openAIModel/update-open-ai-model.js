const { isEmpty, extend } = require("lodash");
const { UpdateOpenAIModel, GetOpenAIModel } = require("../../models/open-ai-models-services");

const UpdateOpenAIModelDetails = async ({ _id, updateParams = {} }) => {
  const setParams = {};
  const { apiKey, modelName, isDefault } = updateParams;

  if (!isEmpty(apiKey)) {
    extend(setParams, {
      apiKey,
      last4Digits: apiKey.slice(-4),
    });
  }

  if (!isEmpty(modelName)) {
    extend(setParams, { modelName });
  }

  if (typeof isDefault === "boolean") {
    extend(setParams, { isDefault });
  }

  let previousDefaultModel = null;

  if (isDefault === true) {
    const existingDefault = await GetOpenAIModel({
      filterParams: { isDefault: true, _id: { $ne: _id } },
    });

    if (existingDefault) {
      previousDefaultModel = await UpdateOpenAIModel({
        filterParams: { _id: existingDefault._id },
        updateParams: { isDefault: false },
      });
    }
  }

  const updatedModel = await UpdateOpenAIModel({
    filterParams: { _id },
    updateParams: setParams,
  });

  return {
    message: "OpenAI model updated successfully",
    updatedModel,
    previousDefaultModel,
  };
};

module.exports = UpdateOpenAIModelDetails;
