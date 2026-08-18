const mongoose = require("mongoose");

const chatgptSchema = new mongoose.Schema({
  projectid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "project",
    required: true,
  },
  title: {
    type: String,
    required: true
  },
  chat: [{
    user: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
   date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("chatgpt", chatgptSchema);