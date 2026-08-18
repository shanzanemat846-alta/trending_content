const mongoose = require("mongoose");

const { PLANS_AND_CREDITS } = require("../utils/constants");


const userSubscriptionPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  checkoutCustomerId: {
    type: String,
  },
  subscriptionPlan: {
    type: String,
    enum: ['free', 'starter', 'advanced'],
    default: 'free'
  },
  subscriptionType: {
    type: String,
    enum: ['monthly', 'yearly']
  },
  status: {
    type: String,
    enum: ['active', 'past_due']
  },
  card: {
    cardType: { type: String },
    issuer: { type: String },
    expiryMonth: { type: String },
    expiryYear: { type: String },
    last4: { type: String }
  },
  credits: {
    total: {
      type: Number, default: PLANS_AND_CREDITS.free
    },
    used: {
      type: Number, default: 0
    }
  },
  freeCreditsDate: {
    type: Date,
    default: Date.now,
  },
  freeCreditAccess: {
    type: Boolean,
    default: true
  },
  subscriptionDate: {
    type: Date
  }
}, {
  timestamps: true,
  strict: false
});

module.exports = mongoose.model("userSubscriptionPlan", userSubscriptionPlanSchema, "userSubscriptionPlans");