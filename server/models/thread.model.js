const mongoose = require("mongoose");

const threadSchema = new mongoose.Schema({
  projectid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "project",
    required: true,
  },
  campaignID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "campaign",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  url: {
    type: String,
  },
  imageurl: {
    type: String,
  },
  upvotes: {
    type: Number,
  },
  comments: {
    type: Number,
  },
  mode: {
    type: String,
  },
  category: {
    type: String,
  },
  subreddit: {
    type: String
  },
  youtubeVideoDetails: {
    favoriteCount: {
      type: Number
    },
    likeCount: {
      type: Number
    },
    viewCount: {
      type: Number
    },
    comments: {
      type: Number
    },
  },
  date: {
    type: Date,
    default: Date.now,
  },
  platform: {
    type: String,
    required: true,
    trim: true,
    enum: ['youtube', 'reddit', 'twitter']
  }
}, {
  timestamps: true,
  strict: false
});

// Compound indexes for your search patterns
threadSchema.index({ projectid: 1, campaignID: 1 }); // For project+campaign queries
threadSchema.index({ projectid: 1, platform: 1 }); // For project+platform queries
threadSchema.index({ projectid: 1, mode: 1 }); // For project+mode queries
threadSchema.index({ projectid: 1, platform: 1, mode: 1 }); // For combined queries

module.exports = mongoose.model("thread", threadSchema);