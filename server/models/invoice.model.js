const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    paymentId: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "USD",
    },
    status: {
      type: String,
      enum: ["paid", "unpaid"],
      required: true,
    },
    subscriptionPlan: {
      type: String,
      enum: ["starter", "advanced"],
    },
    subscriptionType: {
      type: String,
      enum: ["monthly", "yearly"],
    },
    paymentType: {
      type: String,
      enum: ["subscription", "purchased_tokens"],
    },
    transactionDetails: {
      authCode: { type: String },
      responseCode: { type: String },
      responseSummary: { type: String },
    },
    cardDetails: {
      last4: { type: String },
      expiryMonth: { type: String },
      expiryYear: { type: String },
      cardType: { type: String },
      issuer: { type: String },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { 
    timestamps: true,
    strict: false
  }
);

module.exports = mongoose.model("invoice", invoiceSchema, "invoices");
