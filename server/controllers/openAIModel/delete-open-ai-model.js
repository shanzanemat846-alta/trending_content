const { DeleteOpenAIModel } = require('../../models/open-ai-models-services');

const DeleteTheOpenAIModel = async ({ _id }) => {
  await DeleteOpenAIModel({
    filterParams: { _id }
  });

  return {
    message: 'OpenAI Model deleted successfully'
  }
};

module.exports = DeleteTheOpenAIModel;
