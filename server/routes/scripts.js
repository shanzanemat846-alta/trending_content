const axios = require('axios');
const { mongoose } = require('mongoose');
const { isEmpty, extend } = require('lodash');
const { HttpsProxyAgent } = require('https-proxy-agent');

const { BulkWriteCampaign, GetCampaignsData } = require('../models/campaign-services');
const { BulkWriteUser } = require('../models/user-services');
const { BulkWriteThread } = require('../models/thread-services');

const { UpdateUserSubscriptionPlan, GetUserSubscriptionPlan, BulkUpdateUserSubscriptionPlan, AddUserSubscriptionPlan } = require("../models/user-subscription-plan-services");
const { AddInvoice } = require("../models/invoice-services");
const { GetProjects, BulkWriteProject } = require('../models/project-services');
const { SaveOpenAIModel } = require('../models/open-ai-models-services');

const { PRICE_PER_TOKEN, PAYMENT_TYPE, SUBSCRIPTION_TYPE, PLAN_PRICING, PLANS_AND_CREDITS } = require('../utils/constants');

const { GetSemanticWordsByGPT } = require('../services/chatgpt');

const validator = require("validator");
const jwt = require("jsonwebtoken");

const { ObjectId } = mongoose.Types;

const {
  AddNewUser,
  GetUser,
  UpdateUser,
  GetUsers
} = require("../models/user-services");


const { GetYoutubeVideoCaptions, DownloadAndSaveProfileImage } = require('../utils/helpers');
const { SUBSCRIPTION_PLANS, USER_STATUS } = require('../utils/constants');

const router = require("express").Router();

router.get("/update-campaigns-and-threads-data", async (req, res) => {
  try {
    console.log('Script method called!');

    const allCampaigns = await GetCampaignsData({
      filterParams: {
        $or: [{ platforms: { $exists: false } }, { 'mode.type': { $exists: true } }]
      }
    });

    console.log('\n\n Campaigns length', allCampaigns.length);

    const threadsBulkUpdate = [];

    const bulkUpdateCampaignData = allCampaigns.map(row => {
      const { _id, upvote, upcomment, threads, mode } = row;
      const { type } = mode;

      const updateParams = {
        platforms: {
          reddit: {
            upVotes: upvote || 0,
            comments: upcomment || 0,
            threads: threads || 0
          }
        },
        mode: type
      }

      threadsBulkUpdate.push({
        updateMany: {
          filter: {
            campaignID: _id
          },
          update: {
            platform: 'reddit'
          }
        },
      });

      return {
        updateOne: {
          filter: { _id },
          update: {
            $set: updateParams,
            $unset: { upvote: 1, upcomment: 1, threads: 1 }
          }
        }
      }
    });

    console.log('\n\n bulkWrite: campaign', bulkUpdateCampaignData.length);
    if (bulkUpdateCampaignData.length) {
      await BulkWriteCampaign(bulkUpdateCampaignData);
    }

    console.log('\n\n bulkWrite: threads', threadsBulkUpdate.length);
    if (threadsBulkUpdate.length) {
      await BulkWriteThread(threadsBulkUpdate);
    }

    res.status(200).json({
      message: 'Data updated!'
    });
  } catch (error) {
    console.log('error : ', error);
    res.status(400).json({
      error
    });
  }
});

router.get("/fetch-youtube-captions", async (req, res) => {
  try {
    console.log('Script method called!');

    const {
      url = 'https://www.youtube.com/watch?v=KxPKu3kXeTM'
    } = req.query;
    console.log('Here params: ', { url });

    const { data, captionDetails, matches } = await GetYoutubeVideoCaptions({ url });

    res.status(200).json({
      url,
      matches,
      captionDetails,
      data,
    });
  } catch (error) {
    console.log('error : ', error);
    res.status(400).json({
      error
    });
  }
});

const FetchYouTubeVideoWithProxy = async ({ videoId }) => {
  const youtubeApiUrl = `https://www.youtube.com/watch?v=${videoId}`;

  try {
    const proxyAgent = new HttpsProxyAgent(process.env.PROXY_URL);

    const response = await axios.get(youtubeApiUrl, { httpsAgent: proxyAgent });

    console.log('response: ', response.data);

    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error(`Failed to fetch video. Status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error fetching YouTube video:', error);
    return `Error: ${error.message}`;
  }
}

router.get("/fetch-youtube-video-via-proxy", async (req, res) => {
  try {
    const { videoId = 'KxPKu3kXeTM', proxyUrl = "" } = req.query;


    const youtubeResponse = await FetchYouTubeVideoWithProxy({
      videoId,
      proxyUrl
    });

    res.status(200).send({ html: youtubeResponse });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/redirect-url", async (req, res) => {
  try {
    // Step 1: Get the authorization code from the query parameters
    const authorizationCode = req.query.code;

    if (!authorizationCode) {
      return res.redirect(`${process.env.NEXT_PUBLIC_HOST_API}/auth/jwt/login`);

      // return res.status(400).json({ error: 'Authorization code is missing' });
    }

    // Step 2: Exchange the authorization code for access and refresh tokens
    const tokenRequestBody = new URLSearchParams({
      code: authorizationCode,
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,  // Google Client ID
      client_secret: process.env.GOOGLE_CLIENT_SECRET,    // Google Client Secret
      redirect_uri: process.env.RE_DIRECT_URL,  // Same as in Google Console
      grant_type: 'authorization_code',
    }).toString();  // Convert the URLSearchParams object to a query string

    console.log('tokenRequestBody: ', tokenRequestBody);

    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', tokenRequestBody, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    console.log('tokenResponse.data', tokenResponse.data);

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    // Step 3: Use the access token to fetch user profile details
    const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    console.log('userInfoResponse: ', userInfoResponse.data);
    const { given_name, family_name, email, picture } = userInfoResponse.data;

    console.log({
      firstName: given_name,
      lastName: family_name,
      email,
      accessToken: access_token,
      refreshToken: refresh_token,
    });

    let error = false;
    let errorMessage = '';

    if (validator.isEmpty(email)) {
      error = true;
      errorMessage = 'Email is required!';
    }
    if (!validator.isEmail(email)) {
      error = true;
      errorMessage = 'Email is invalid!';
    }


    if (!error) {
      let userDetails = await GetUser({
        filterParams: { email }
      });

      let userObjectId = userDetails?._id;
      let imagePath = '';
      if (isEmpty(userDetails)) {
        userObjectId = new ObjectId()
      }
     
      if (!isEmpty(picture)) {
        console.log('\n\n data ', picture);
        imagePath = await DownloadAndSaveProfileImage(picture, userObjectId)
      }

      console.log('user details : ', userDetails);

      if (!userDetails) {
        const insertParams = {
          _id: userObjectId,
          firstName: given_name,
          lastName: family_name,
          email,
          isVerified: true,
          status: 'accepted',
          accessToken: access_token,
          refreshToken: refresh_token,
          expires: expires_in,
          loginWithGoogle: true,
          guideUserAboutAppOverView: true
        }

        if (!isEmpty(imagePath)) extend(insertParams, { image: imagePath });

        userDetails = await AddNewUser(insertParams);

        await AddUserSubscriptionPlan({
          userId: userDetails._id
        });
      } else {
        const updateParams = {
          firstName: given_name,
          lastName: family_name,
          accessToken: access_token,
          expires: expires_in,
        }
        if (!isEmpty(imagePath)) extend(updateParams, { image: imagePath });

        const updateUserRes = await UpdateUser({
          filterParams: { _id: userDetails._id },
          updateParams
        });

        console.log('here the value: ', updateUserRes);
      }

      return res.redirect(`${process.env.NEXT_PUBLIC_HOST_API}/auth/google-login-call-back?userId=${userDetails._id}`);
    } else {
      return res.redirect(`${process.env.NEXT_PUBLIC_HOST_API}/auth/jwt/login`);
    }
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

const CancelSubscription = async ({ userId }) => {
  try {
    let userSubscription = await GetUserSubscriptionPlan({
      filterParams: { userId }
    });

    if (!userSubscription) {
      console.warn("User subscription not found for User:", userId);
      res.status(200).send("ok");
      return;
    }
    const unsetParams = {
      subscriptionType: 1,
      subscriptionId: 1,
      paymentType: 1,
      billingAmount: 1,
      card: 1,
      checkoutCustomerId: 1,
      nextBillingDate: 1,
      subscriptionDate: 1,
      status: 1,
    };

    const updateParams = {
      subscriptionPlan: "free",
      freeCreditsDate: new Date(),
    };


    const responsePlan = await UpdateUserSubscriptionPlan({
      filterParams: { userId },
      updateParams,
      unsetParams
    });

    console.log("responsePlan:", responsePlan);

    console.log(`User ${userId} downgraded to free plan.`);
  } catch (error) {
    console.error("Failed to update user subscription:", error);
  }
};

router.post("/paddle-checkout-web-hook", async (req, res) => {
  try {
    const { event_type, data } = req.body;

    console.log('\n\n hook trigger : ', {
      event_type,
      data
    });
    if (event_type === "subscription.updated") {
      console.log('here the new hook is getting trigger update');
      const { id, status, first_billed_at, customer_id, custom_data, next_billed_at } = data;
      const { subscriptionPlan: plan, subscriptionType: type, userId } = custom_data;

      const amount = PLAN_PRICING[`${plan.toUpperCase()}_${type.toUpperCase()}`] || 0;

      let userSubscription = await GetUserSubscriptionPlan({
        filterParams: { userId }
      });

      if (!userSubscription) {
        console.warn("User subscription not found for User:", userId);
        res.status(200).send("ok");
        return;
      }
      if (status === 'canceled') {
        return res.status(200).send("ok");
      }
  
      let subscriptionPlan;
      let subscriptionType;
      let { credits: { total, used } } = userSubscription;
      let earnCredits = 0;

      if (plan === "advanced" && type === "yearly") {
        subscriptionPlan = "advanced";
        subscriptionType = "yearly";
        earnCredits = PLANS_AND_CREDITS[subscriptionPlan].yearlyEarnedCredits +
          PLANS_AND_CREDITS[subscriptionPlan].yearlyFreeCredits;
      } else if (plan === "advanced" && type === "monthly") {
        subscriptionPlan = "advanced";
        subscriptionType = "monthly";
        earnCredits = PLANS_AND_CREDITS[subscriptionPlan].monthlyEarnedCredits +
          PLANS_AND_CREDITS[subscriptionPlan].monthlyFreeCredits;
      } else if (plan === "starter" && type === "yearly") {
        subscriptionPlan = "starter";
        subscriptionType = "yearly";
        earnCredits = PLANS_AND_CREDITS[subscriptionPlan].yearlyEarnedCredits +
          PLANS_AND_CREDITS[subscriptionPlan].yearlyFreeCredits;
      } else if (plan === "starter" && type === "monthly") {
        subscriptionPlan = "starter";
        subscriptionType = "monthly";
        earnCredits = PLANS_AND_CREDITS[subscriptionPlan].monthlyEarnedCredits +
          PLANS_AND_CREDITS[subscriptionPlan].monthlyFreeCredits;
      } else {
        console.error("Invalid subscription plan or type:", { plan, type });
        res.status(200).send("ok");
        return;
      }

      console.log('update subscription: ', {
        earnCredits,
        total
      });
      total += earnCredits;

       try {
        const updateResponse = await UpdateUserSubscriptionPlan({
          filterParams: { userId },
          updateParams: {
            subscriptionType: type,
            subscriptionPlan: plan,
            status: status,
            billingAmount: amount,
            subscriptionDate: first_billed_at,
            nextBillingDate: next_billed_at,
            credits: { total, used },
          }
        });

        console.log('updateResponse: ', updateResponse);
      } catch (subError) {
        console.error("Error updating subscription:", subError);
      }
    } else if (event_type === "subscription.activated") {
      const { id, status, first_billed_at, customer_id, custom_data, next_billed_at } = data;
      const { subscriptionPlan: plan, subscriptionType: type, userId } = custom_data;

      let userSubscription = await GetUserSubscriptionPlan({
        filterParams: { userId }
      });

      if (!userSubscription) {
        console.warn("User subscription not found for User:", userId);
        res.status(200).send("ok");
        return;
      }

      let subscriptionPlan;
      let subscriptionType;
      let { credits: { total, used } } = userSubscription;
      let earnCredits = 0;

      if (plan === "advanced" && type === "yearly") {
        subscriptionPlan = "advanced";
        subscriptionType = "yearly";
        earnCredits = PLANS_AND_CREDITS[subscriptionPlan].yearlyEarnedCredits +
          PLANS_AND_CREDITS[subscriptionPlan].yearlyFreeCredits;
      } else if (plan === "advanced" && type === "monthly") {
        subscriptionPlan = "advanced";
        subscriptionType = "monthly";
        earnCredits = PLANS_AND_CREDITS[subscriptionPlan].monthlyEarnedCredits +
          PLANS_AND_CREDITS[subscriptionPlan].monthlyFreeCredits;
      } else if (plan === "starter" && type === "yearly") {
        subscriptionPlan = "starter";
        subscriptionType = "yearly";
        earnCredits = PLANS_AND_CREDITS[subscriptionPlan].yearlyEarnedCredits +
          PLANS_AND_CREDITS[subscriptionPlan].yearlyFreeCredits;
      } else if (plan === "starter" && type === "monthly") {
        subscriptionPlan = "starter";
        subscriptionType = "monthly";
        earnCredits = PLANS_AND_CREDITS[subscriptionPlan].monthlyEarnedCredits +
          PLANS_AND_CREDITS[subscriptionPlan].monthlyFreeCredits;
      } else {
        console.error("Invalid subscription plan or type:", { plan, type });
        res.status(200).send("ok");
        return;
      }

      total += earnCredits;

      const amount = PLAN_PRICING[`${subscriptionPlan.toUpperCase()}_${subscriptionType.toUpperCase()}`] || 0;

      try {
        const updateResponse = await UpdateUserSubscriptionPlan({
          filterParams: { userId },
          updateParams: {
            subscriptionType,
            subscriptionPlan,
            status: status,
            billingAmount: amount,
            credits: { total, used },
            subscriptionDate: first_billed_at,
            subscriptionId: id,
            checkoutCustomerId: customer_id,
            nextBillingDate: next_billed_at
          }
        });

        console.log('updateResponse: ', updateResponse);
      } catch (subError) {
        console.error("Error updating subscription:", subError);
      }
    } else if (event_type === "transaction.paid") {
      const { id, status, custom_data, currency_code, payments } = data;
      const { subscriptionPlan: plan, subscriptionType: type, userId, purchaseTokens } = custom_data;

      const paymentDetails = payments?.[0] || {};
      const cardDetails = paymentDetails.method_details?.card || {};

      console.log({
        purchaseTokens,
        plan,
        type
      });
      const amount = purchaseTokens
        ? PRICE_PER_TOKEN * purchaseTokens
        : PLAN_PRICING[`${plan.toUpperCase()}_${type.toUpperCase()}`] || 0;

      try {
        let userSubscription = await GetUserSubscriptionPlan({ filterParams: { userId } });

        if (!userSubscription) {
          console.warn("User subscription not found for User:", userId);
          res.status(200).send("ok");
          return;
        }

        console.log('userSubscription: ', userSubscription);

        let { credits: { total, used } } = userSubscription;
        total += Number(purchaseTokens) || 0;
        const paymentType = purchaseTokens ? PAYMENT_TYPE.PURCHASE_TOKENS  : PAYMENT_TYPE.SUBSCRIPTION;

        const invoiceData = {
          userId,
          paymentId: id,
          amount,
          currency: currency_code,
          status,
          paymentType,
          transactionDetails: {
            authCode: paymentDetails.payment_attempt_id || null,
            responseCode: paymentDetails.status || null,
            responseSummary: paymentDetails.error_code || "Success",
          },
          cardDetails: {
            last4: cardDetails.last4 || null,
            expiryMonth: cardDetails.expiry_month || null,
            expiryYear: cardDetails.expiry_year || null,
            cardType: cardDetails.type || null,
            issuer: cardDetails.cardholder_name || null,
          },
          createdAt: new Date(),
        };

        if (!purchaseTokens) {
          invoiceData.subscriptionPlan = plan;
          invoiceData.subscriptionType = type;
        }

        const addInvoice = await AddInvoice(invoiceData);

        console.log('Invoice Created:', addInvoice);

        console.log('here the value: ', {
           credits: { total, used }
        })
        const updateCredits = await UpdateUserSubscriptionPlan({
          filterParams: { userId },
          updateParams: {
            credits: { total, used },
          }
        });

        console.log('Updated User Credits:', updateCredits);
      } catch (error) {
        console.error("Error processing transaction.paid:", error);
      }
    } else if (event_type === "subscription.canceled") {
      const { custom_data } = data;
      const { userId } = custom_data || {};

      if (!userId) {
        console.warn("User ID is missing in subscription.canceled event");
        res.status(200).send("ok");
      }
      await CancelSubscription({
        userId
      });
    } else if (event_type === "subscription.past_due") {
      const { custom_data } = data;
      const { userId } = custom_data || {};

      if (!userId) {
        console.warn("User ID is missing in subscription.past_due event");
        res.status(200).send("ok");
        return;
      }

      try {
        await UpdateUserSubscriptionPlan({
          filterParams: { userId },
          updateParams: { status: "past_due" }
        });
        console.log(`User ${userId} subscription marked as past due.`);
      } catch (error) {
        console.error("Failed to update user subscription to past_due:", error);
      }
    } else if (event_type === "subscription.resumed") {
      const { custom_data } = data;
      const { userId } = custom_data || {};

      if (!userId) {
        console.warn("User ID is missing in subscription.resumed event");
        res.status(200).send("ok");
        return;
      }

      try {
        await UpdateUserSubscriptionPlan({
          filterParams: { userId },
          updateParams: { status: "active" }
        });
        console.log(`User ${userId} subscription resumed.`);
      } catch (error) {
        console.error("Failed to update user subscription to active:", error);
      }
    } 
    // else if (event_type === "subscription.updated") {
    //   const { id, status, first_billed_at, customer_id, custom_data, next_billed_at } = data;
    //   const { subscriptionPlan: plan, subscriptionType: type, userId } = custom_data;

    //   const amount = PLAN_PRICING[`${subscriptionPlan.toUpperCase()}_${subscriptionType.toUpperCase()}`] || 0;

    //   await UpdateUserSubscriptionPlan({
    //     filterParams: {
    //       userId
    //     },
    //     updateParams : {
    //         subscriptionType: type,
    //         subscriptionPlan: plan,
    //         status,
    //         billingAmount: amount,
    //         credits: { total, used },
    //         subscriptionDate: first_billed_at,
    //         subscriptionId: id,
    //         checkoutCustomerId: customer_id,
    //         nextBillingDate: next_billed_at
    //     }
    //   })
    // }
    res.status(200).send("ok");
  } catch (error) {
    console.error("Unhandled Webhook Error:", error);

    res.status(200).send("ok");
  }
});

router.get("/add-user-subscription-plan", async (req, res) => {
  try {
    const usersList = await GetUsers({
      filterParams: { status: "accepted", role: 'user' }
    });

    console.log('\n\n usersList: ', usersList.length);

    const bulkUsersPlan = usersList.map(row => {
      return ({
        updateOne: {
          filter: {
            userId: row._id,
            status: USER_STATUS.ACCEPTED
          },
          update: {
            $set: {
              subscriptionPlan: SUBSCRIPTION_PLANS.FREE,
              freeCreditAccess: true,
              freeCreditsDate: new Date(),
              credits: {
                total: 3000,
                used: 0
              }
            }
          },
          upsert: true
        }
      })
    });

    if (bulkUsersPlan.length) {
      console.log('here the ', bulkUsersPlan.length);
      await BulkUpdateUserSubscriptionPlan(bulkUsersPlan);
    }

    res.status(200).send({ message: `user subscription plans added for total ${bulkUsersPlan.length}` });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});


const parseButtonOptionValue = (value) => {
  console.log('value: ', value);
  if (value === 'custom') return { mode: 'custom' };
  
  if (value.includes('+')) {
    const num = parseFloat(value.replace('+', ''));
    return { mode: 'morethan', value: num };
  }
  
  if (value.includes('-')) {
    const [min, max] = value.split('-').map(n => parseFloat(n));
    return { mode: 'range', min, max };
  }
  
  // Plain number
  return { mode: 'morethan', value: parseFloat(value) };
}

const MAX_VALUE = 10000000;

async function mapFiltersToPlatforms() {
  const campaigns = await GetCampaignsData({
    filterParams: {
      $or: [
        {
          "platforms.reddit": { $exists: true, $type: "object" },
          "platforms.reddit.threads": { $exists: true },
          "platforms.reddit.upVotes": { $exists: true },
          "platforms.reddit.comments": { $exists: true },
          "platforms.reddit.customThreads": { $exists: true },
          "platforms.reddit.customUpVotes": { $exists: true },
          "platforms.reddit.customComments": { $exists: true }
        },
        {
          "platforms.youtube": { $exists: true, $type: "object" },
          "platforms.youtube.views": { $exists: true },
          "platforms.youtube.comments": { $exists: true },
          "platforms.youtube.likes": { $exists: true },
          "platforms.youtube.customViews": { $exists: true },
          "platforms.youtube.customLikes": { $exists: true },
          "platforms.youtube.customComments": { $exists: true }
        }
      ]
    }
  });

  console.log('campaigns: ', campaigns);

  return campaigns.map(row => {
    const { platforms: { reddit, youtube } } = row;
    const result = {};
    
    if (reddit) {
      result.reddit = {};
      
      // Threads
      if (reddit.threads === "custom") {
        result.reddit.threads = { 
          min: parseFloat(reddit.customThreads) || 0, 
          max: MAX_VALUE, 
          mode: 'upto' 
        };
      } else {
        result.reddit.threads = {
          min: 0,
          max: Number(reddit.threads),
          mode: "upto"
        };
      }
      
      // UpVotes
      if (reddit.upVotes === "custom") {
        result.reddit.upVotes = { 
          min: parseFloat(reddit.customUpVotes) || 0, 
          max: MAX_VALUE, 
          mode: 'morethan' 
        };
      } else {
        const parsed = parseButtonOptionValue(reddit.upVotes);
        if (parsed.mode === 'range') {
          result.reddit.upVotes = { min: 0, max: parsed.max, mode: 'upto' };
        } else {
          result.reddit.upVotes = { min: parsed.value, max: MAX_VALUE, mode: 'morethan' };
        }
      }
      
      // Comments
      if (reddit.comments === "custom") {
        result.reddit.comments = { 
          min: parseFloat(reddit.customComments) || 0, 
          max: MAX_VALUE, 
          mode: 'morethan' 
        };
      } else {
        const parsed = parseButtonOptionValue(reddit.comments);
        if (parsed.mode === 'range') {
          result.reddit.comments = { min: 0, max: parsed.max, mode: 'upto' };
        } else {
          result.reddit.comments = { min: parsed.value, max: MAX_VALUE, mode: 'morethan' };
        }
      }
    }
    
    if (youtube) {
      result.youtube = {};
      
      // Views
      if (youtube.views === "custom") {
        result.youtube.views = { 
          min: parseFloat(youtube.customViews) || 0, 
          max: MAX_VALUE, 
          mode: 'morethan' 
        };
      } else {
        const parsed = parseButtonOptionValue(youtube.views);
        if (parsed.mode === 'range') {
          result.youtube.views = { min: 0, max: parsed.max, mode: 'upto' };
        } else {
          result.youtube.views = { min: parsed.value, max: MAX_VALUE, mode: 'morethan' };
        }
      }
      
      // Likes
      if (youtube.likes === "custom") {
        result.youtube.likes = { 
          min: parseFloat(youtube.customLikes) || 0, 
          max: MAX_VALUE, 
          mode: 'morethan' 
        };
      } else {
        const parsed = parseButtonOptionValue(youtube.likes);
        if (parsed.mode === 'range') {
          result.youtube.likes = { min: 0, max: parsed.max, mode: 'upto' };
        } else {
          result.youtube.likes = { min: parsed.value, max: MAX_VALUE, mode: 'morethan' };
        }
      }
      
      // Comments
      if (youtube.comments === "custom") {
        result.youtube.comments = { 
          min: parseFloat(youtube.customComments) || 0, 
          max: MAX_VALUE, 
          mode: 'morethan' 
        };
      } else {
        const parsed = parseButtonOptionValue(youtube.comments);
        if (parsed.mode === 'range') {
          result.youtube.comments = { min: 0, max: parsed.max, mode: 'upto' };
        } else {
          result.youtube.comments = { min: parsed.value, max: MAX_VALUE, mode: 'morethan' };
        }
      }
    }
    
    const newPlatform = {};

    if (result.reddit) extend(newPlatform, { reddit: result.reddit });
    if (result.youtube) extend(newPlatform, { youtube: result.youtube });

    return {
      threadId: row._id,
      previousFilter: row.platforms,
      platforms: {
        reddit: result.reddit,
        youtube: result.youtube
      }
    };
  });
}

router.get("/map-campaign-filter", async (req, res) => {
  try {
    const response = await mapFiltersToPlatforms();


    const bulkUpdateCampaignData = response.map(row => {
      return {
        updateOne: {
          filter: { _id: row.threadId },
          update: {
            $set: { platforms: row.platforms },
          }
        }
      }
    });

    if (bulkUpdateCampaignData.length) {
      console.log('here the bulk update campaign data', bulkUpdateCampaignData.length);
      await BulkWriteCampaign(bulkUpdateCampaignData);
    }

    console.log("response: ", response);
    res.status(200).json({
      data: {
        total: bulkUpdateCampaignData.length,
        ...response,
      }
    });
  } catch (error) {

    console.log('here the error: ', error);
  }
});

router.post("/find-the-semantic-match-for-keywords", async (req, res) => {
  try {
    console.log("req.params: ", res.params, "req.query: ", req.query);
    const { keyword, projectId, userId } = req.query;

    const { instructionPrompt } = req.body;

    console.log('keyword : ', keyword);

    const keywordsSearch = await GetSemanticWordsByGPT({
        keyword,
        projectId,
        userId,
        instructionPrompt
    });

    console.log("keywordsSearch: ", keywordsSearch);
    res.status(200).json({
      data: {
        keywordsSearch
      }
    });
  } catch (error) {

    console.log('here the error: ', error);
  }
});

router.get("/encrypt-keys", async (req, res) => {
  try {

    const { openAI } = await GetUser({
      filterParams: { role: 'admin', openAI: { $exists: true }  },
      selectParams: { openAI: 1 }
    });

    console.log('openAI: ', openAI);
    if (openAI?.apiKey) {
      const { model, apiKey } = openAI;

      const adminDefaultModelSaved = await SaveOpenAIModel({
        modelName: model,
        apiKey: apiKey,
        last4Digits: openAI.apiKey.slice(-4),
        isDefault: true
      });

    }

    const projectsList = await GetProjects({
      filterParams: {
        projectAIKey: { $exists: true, $ne: "" }
      },
      selectParams: { projectAIKey: 1 }
    });

    const usersList = await GetUsers({
      filterParams: {
        role: 'user',
        globalOpenAIKey: { $exists: true, $ne: "" }
      },
      selectParams: { globalOpenAIKey: 1 }
    });

    console.log('\n\n usersList: ', usersList.length);
    console.log('\n\n usersList: ', projectsList.length);

    const bulkUpdateUsers = usersList.map(row => {
      const last4Digit = row.globalOpenAIKey.slice(-4);

      return {
        updateMany: {
          filter: {
            _id: row._id
          },
          update: {
            globalOpenAI: {
              key: row.globalOpenAIKey,
              last4Digit
            }
          }
        },
      }
    });

    if (bulkUpdateUsers.length) { 
      console.log('bulkUpdate: ', bulkUpdateUsers.length, 'details: ', JSON.stringify(bulkUpdateUsers, null, 4));
      await BulkWriteUser(bulkUpdateUsers)
    }

     const bulkUpdateProjects = projectsList.map(row => {
      const last4Digit = row.projectAIKey.slice(-4) || "";

      return {
        updateMany: {
          filter: {
            _id: row._id
          },
          update: {
            projectAIKey: {
              key: row.projectAIKey || "",
              last4Digit
            }
          }
        },
      }
    });

    if (bulkUpdateProjects.length) { 
      console.log('bulkUpdateProjects: ', bulkUpdateProjects.length, 'details: ', JSON.stringify(bulkUpdateProjects, null, 4));
      await BulkWriteProject(bulkUpdateProjects)
    }
  
    res.status(200).json({
      data: {
        message: "bulk update done"
      }
    });
  } catch (error) {

    console.log('here the error: ', error);
  }
});

module.exports = router;
