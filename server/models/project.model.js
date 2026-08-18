const mongoose = require("mongoose");
const { GetEncodedOpenAIKey } = require("../utils/open-ai-encryption");

const encryptValue = (value) => {
  return GetEncodedOpenAIKey(value);
}
const projectSchema = new mongoose.Schema({
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  chatgpttype: {
    type: Object,
    required: true,
  },
  docfile: {
    type: String,
  },
  imgfile: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  projectOpenAI: {
    last4Digit: {
      type: String
    },
    key: {
      type: String,
      set: encryptValue,
    },
  },
  selectedThreadsList: {
    type: {
      redditThreadsIds: {
        type: [],
        default: []
      },
      youtubeThreadsIds: {
        type: [],
        default: []
      }
    },
    default: {},
    _id: false
  }
}, {
  timestamps: true,
  strict: false,
  toJSON: { getters: true },
  toObject: { getters: true }
});

module.exports = mongoose.model("project", projectSchema);