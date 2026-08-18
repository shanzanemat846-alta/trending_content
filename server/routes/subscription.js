const axios = require('axios');
const CryptoJS = require("crypto-js");

const SECRET_KEY = process.env.CARD_SECRET_KEY || "my_super_secret_key"; // Use a strong key!

const encryptCardId = (cardId) => {
  return CryptoJS.AES.encrypt(cardId, SECRET_KEY).toString();
};

const decryptCardId = (encryptedId) => {
  const bytes = CryptoJS.AES.decrypt(encryptedId, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

const {
  GetUserSubscriptionPlan,
  CancelPaddleSubscription,
  UpdatePaddleSubscription
} = require("../controllers/subscription");

const { getContentCount, UpdateUserSubscriptionPlan } = require("../models/user-subscription-plan-services");

const router = require("express").Router();
const { isEmpty } = require('lodash');

const AuthenticateToken = require('../middleware/auth-token');

const { CatchResponse, TryResponse } = require('../utils/helpers');

const { ENDPOINTS, SUBSCRIPTION_PLANS } = require('../utils/constants');

router.get(ENDPOINTS.SUBSCRIPTION.USER_SUBSCRIPTION_PLAN, AuthenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    console.log('userId: ', userId);
    const response = await GetUserSubscriptionPlan({
      userId
    });

    const { userSubscriptionPlanDetails } = response;

    TryResponse({
      res,
      data: { userSubscriptionPlanDetails }
    });
  } catch (err) {
    CatchResponse({
      res,
      err
    });
  }
});

router.post(
  ENDPOINTS.SUBSCRIPTION.CANCELED_SUBSCRIPTION,
  AuthenticateToken,
  async (req, res) => {
    try {
      const { subscriptionId } = req.params;

      if (!subscriptionId) {
        return CatchResponse({ res, err: "Subscription ID is required" });
      }

      const result = await CancelPaddleSubscription({ subscriptionId });
      return TryResponse({
        res,
        message: result.message,
        data: {}
      });

    } catch (err) {
      console.error('Paddle API Error:', err.status || 500, err.message || err);
      return CatchResponse({ res, err: err.message || "Internal Server Error" });
    }
  }
);

router.patch(
  `${ENDPOINTS.SUBSCRIPTION.UPDATE_PADDLE_SUBSCRIPTION}`,
  AuthenticateToken,
  async (req, res) => {
    try {
      const { userSubscriptionPlanId } = req.params;
      const { subscriptionPriceId, plan, isYearly } = req.body;

      if (plan !== SUBSCRIPTION_PLANS.FREE) {
        const result = await UpdatePaddleSubscription({
          userSubscriptionPlanId,
          subscriptionPriceId,
          plan,
          isYearly
        });

        return TryResponse({
          res,
          message: result?.message,
          data: result?.data || {}
        });
      }
      return CatchResponse({ res, err: "Not valid plan to update" });
    } catch (err) {
      console.log('err: ', err);
      return CatchResponse({ res, err: err.message || "Internal Server Error" });
    }
  }
);

router.get(ENDPOINTS.SUBSCRIPTION.GET_CONTENT_COUNT, AuthenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    const response = await getContentCount({ userId });

    TryResponse({
      res,
      data: { contentCount: response }
    });
  } catch (err) {
    CatchResponse({
      res,
      err
    });
  }
});

router.patch(ENDPOINTS.SUBSCRIPTION.UPDATE_FREE_CREDIT_ACCESS, AuthenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { freeCreditAccess } = req.body;

    if (freeCreditAccess === undefined || freeCreditAccess === null || !userId) {
      return CatchResponse({ res, err: "Invalid request" });
    }    

    await UpdateUserSubscriptionPlan({
      filterParams: { userId },
      updateParams: { freeCreditAccess }
    });

    TryResponse({
      res,
      message: "Free credit access updated successfully!",
    });    
  } catch (err) {
    CatchResponse({
      res,
      err
    });
  }
});

module.exports = router;