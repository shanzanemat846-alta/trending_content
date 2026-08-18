const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema({
  projectid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "project",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  localImage: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("store", storeSchema);