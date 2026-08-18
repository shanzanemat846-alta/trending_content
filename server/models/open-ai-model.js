const mongoose = require("mongoose");
const { GetEncodedOpenAIKey } = require("../utils/open-ai-encryption");

const encryptValue = (value) => {
  return GetEncodedOpenAIKey(value);
}
const openAIModelsSchema = new mongoose.Schema(
  {
    modelName: {
      type: String,
      required: true,
      trim: true,
    },
    apiKey: {
      type: String,
      required: true,
      trim: true,
      set: encryptValue,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    last4Digits: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    strict: false,
    toJSON: { getters: true },
    toObject: { getters: true }
  }
);

module.exports = mongoose.model("OpenAIModel", openAIModelsSchema);
