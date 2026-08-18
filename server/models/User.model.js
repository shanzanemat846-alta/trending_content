const { model, Schema, default: mongoose } = require("mongoose");
const { GetEncodedOpenAIKey } = require("../utils/open-ai-encryption");

const encryptValue = (value) => {
  return GetEncodedOpenAIKey(value);
}

// The "users" collection will have the following structure
const userSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    min: 3,
    max: 20,
  },
  lastName: {
    type: String,
    min: 3,
    max: 20,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    max: 50,
  },
  password: {
    type: String,
    min: 8,
  },
  role: {
    type: String,
    required: true,
    default: "user",
  },
  status: {
    type: String,
    required: true,
    default: "pending",
  },
  globalOpenAI: {
    last4Digit: {
      type: String
    },
    key: {
      type: String,
      set: encryptValue,
    },
  },
  isVerified: {
    type: Boolean
  },
  verificationToken: {
    type: String
  },
  image: {
    type: String
  },
  guideUserAboutAppOverView: {
    type: Boolean,
    default: true
  },
}, {
  timestamps: true,
  strict: false
});

const User = mongoose.model("User", userSchema);

module.exports = User;
