const UserSubscriptionPlan = require('../models/user-subscription-plan.model');
const Store = require('../models/store.model');

const { ThrowMissingParamsError } = require('../utils/throw-missing-params-error');

const AddUserSubscriptionPlan = async ({
  userId
}) => {
  const newUserSubscriptionPlan = new UserSubscriptionPlan({
    userId
  });

  await newUserSubscriptionPlan.save();

  return newUserSubscriptionPlan;
}

const GetUserSubscriptionPlan = async ({ filterParams, selectParams = {} }) => {
  ThrowMissingParamsError([filterParams]);

  const response = await UserSubscriptionPlan
    .findOne(filterParams)
    .select(selectParams);

  return response;
};

const GetUsersSubscriptionPlan = async ({ filterParams, selectParams = {} }) => {
  ThrowMissingParamsError([filterParams]);

  const response = await UserSubscriptionPlan
    .find(filterParams)
    .select(selectParams);

  return response;
};

const UpdateUserSubscriptionPlan = async ({
  filterParams,
  updateParams = {},
  unsetParams = {},
  incParams = {}
}) => {
  ThrowMissingParamsError([filterParams]);

  const response = await UserSubscriptionPlan.updateOne({
    ...filterParams
  }, {
    $set: {
      ...updateParams
    },
    $inc: incParams,
    $unset: unsetParams
  });  

  return response;
}

const getContentCount = async ({ userId }) => {

  const storeContentCount = await Store.countDocuments({
    userId
  });

  return storeContentCount;
}

const BulkUpdateUserSubscriptionPlan = async (bulkWriteData) => {
  ThrowMissingParamsError([bulkWriteData]);

  const response = await UserSubscriptionPlan.bulkWrite(bulkWriteData);

  return response;
};

module.exports = {
  AddUserSubscriptionPlan,
  BulkUpdateUserSubscriptionPlan,
  GetUserSubscriptionPlan,
  GetUsersSubscriptionPlan,
  UpdateUserSubscriptionPlan,
  getContentCount
};
