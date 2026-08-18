const axios = require('axios');

const { GetUserSubscriptionPlan } = require('../../models/user-subscription-plan-services');

const { SUBSCRIPTION_TYPE } = require('../../utils/constants');

const UpdatePaddleSubscription = async ({ userSubscriptionPlanId, subscriptionPriceId, plan, isYearly }) => {
  if (!userSubscriptionPlanId) {
    const error = new Error();
    error.status = 400;
    error.error = "Sorry no user subscription plan found against this user!";
    throw error;
  }

  if (!subscriptionPriceId) {
    const error = new Error();
    error.status = 400;
    error.error = "Price ID is required to update subscription";
    throw error;
  }

  const userSubscriptionPlan = await GetUserSubscriptionPlan({ 
    filterParams: { _id: userSubscriptionPlanId } 
  });

  const { userId } = userSubscriptionPlan;

  if (!userSubscriptionPlan?.subscriptionId) {
    const error = new Error();
    error.status = 400;
    error.error = "No subscription ID found for this user";
    throw error;
  }

  const updateData = {
    items: [{ price_id: subscriptionPriceId, quantity: 1 }],
    custom_data: {
      userId,
      subscriptionPlan: plan,
      subscriptionType: isYearly ? SUBSCRIPTION_TYPE.YEARLY : SUBSCRIPTION_TYPE.MONTHLY
    },
    proration_billing_mode: "full_immediately"
  };

  console.log('\n\n updateData: ', updateData);
  try {
    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_PADDLE_URL}/subscriptions/${userSubscriptionPlan.subscriptionId}`,
      updateData,
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_PADDLE_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      message: "Subscription update in progress. Refresh the page shortly to view the latest status.",
      data: response.data.data,
    };
  } catch (error) {
    console.error('Paddle API Error:', JSON.stringify(error.response?.data, null, 4) || error.message);
    
    // More specific error handling
    if (error.response?.data?.error?.code === 'bad_request') {
      const paddleError = new Error();
      paddleError.status = 400;
      paddleError.error = `Paddle API validation error: ${error.response.data.error.detail}`;
      throw paddleError;
    }
    
    const apiError = new Error();
    apiError.status = error.response?.status || 500;
    apiError.error = 'Failed to update subscription'
    throw apiError;
  }
};

module.exports = UpdatePaddleSubscription;