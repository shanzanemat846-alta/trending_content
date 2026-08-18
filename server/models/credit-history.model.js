const { Schema, model, Types } = require('mongoose');

const creditHistorySchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true
    },
    addedBy: {
      type: Types.ObjectId,
      ref: "User",
    },
    campaignId: {
      type: Types.ObjectId,
      ref: "campaign",
    },
    storeId: {
      type: Types.ObjectId,
      ref: "store",
    },
    chatId: {
      type: Types.ObjectId,
      ref: "chatgpt",
    },
    projectId: {
      type: Types.ObjectId,
      ref: "project",
    },
    type: {
      type: String,
      required: true,
      trim: true,
      enum: ["GPT", "SUMMARIZE", "MULTI_PLATFORM_CAMPAIGN", "YOUTUBE_CAMPAIGN", "REDDIT_CAMPAIGN", "SAVE_CONTENT", "MANUAL_CREDITS"]
    },
    title : {
      type: String,
    },
    deductionAmount: {
      type: Number,
    },
    gptConsumedTokens: {
      type: Number,
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    platformErrors: {
      type: Object
    }
  }, {
    timestamps: true,
    strict: false
  }
);

const CreditHistory = model("creditHistory", creditHistorySchema, "creditHistories");

module.exports = CreditHistory;
