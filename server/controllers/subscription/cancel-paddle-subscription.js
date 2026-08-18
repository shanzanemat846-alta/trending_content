const axios = require('axios');

const CancelPaddleSubscription = async ({ subscriptionId }) => {
  if (!subscriptionId) {
    const error = new Error("Subscription ID is required");
    error.status = 400;
    throw error;
  }

  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_PADDLE_URL}/subscriptions/${subscriptionId}/cancel`,
    {
      effective_from: "immediately",
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_PADDLE_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );

  const resData = response?.data;

  if (!resData || resData.error) {
    const error = new Error(resData?.error?.message || "Invalid response from Paddle API");
    error.status = response?.status || 500;
    throw error;
  }

  const status = resData?.data?.status;

  if (status === "canceled") {
    return { message: "Subscription cancelled successfully!" };
  }

  const error = new Error("Failed to cancel subscription");
  error.status = 500;
  throw error;
};

module.exports = CancelPaddleSubscription;
