const { GetUserSubscriptionPlan } = require('../../models/user-subscription-plan-services');

const GetUserSubscriptionPlanDetails = async ({
  userId
}) => {
  const userSubscriptionPlanDetails = await GetUserSubscriptionPlan({
    filterParams: { userId }
  });

  return {
    userSubscriptionPlanDetails
  }
};

module.exports = GetUserSubscriptionPlanDetails;
