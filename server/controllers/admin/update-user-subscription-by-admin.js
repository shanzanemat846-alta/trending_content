const { isEmpty, extend } = require('lodash');

const { UpdateUserSubscriptionPlan, GetUserSubscriptionPlan } = require('../../models/user-subscription-plan-services');
const { SaveCreditHistory } = require("../../models/credit-history-services");

const UpdateUserSubscriptionByAdmin = async ({
  userId,
  addedBy,
  updateParams: data
}) => {
  const incParams = {};

  const { newCredits } = data;

  console.log('newCredits: ', newCredits);

  const userSubscriptionDetail = await GetUserSubscriptionPlan({ filterParams: { userId }});
  if (!isEmpty(userId)) {
    extend(incParams, { "credits.total": Number(newCredits) });
  }

  await UpdateUserSubscriptionPlan({
    filterParams: { userId },
    incParams
  });

  await SaveCreditHistory({
    type: "MANUAL_CREDITS",
    userId,
    additionalCredits: newCredits,
    prevCredits: userSubscriptionDetail?.credits,
    addedBy
  });

  return {
    message: 'User subscription updated successfully!',
    updatedUserDetails: { userId, updateParams: data }
  }
};

module.exports = UpdateUserSubscriptionByAdmin;
