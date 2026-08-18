const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema({
  projectid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "project",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  mode: {
    type: Object,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  dateRange: {
    type: Array
  }, 
  platforms: {
    type: Object
  },
  matchType: {
    type: String
  }
}, {
  timestamps: true,
  strict: false
});

module.exports = mongoose.model("campaign", campaignSchema);
