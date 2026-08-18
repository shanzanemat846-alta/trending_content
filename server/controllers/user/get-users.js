const { extend, isEmpty } = require('lodash');

const { GetUsers: GetUsersList, CountOfUsers } = require('../../models/user-services');
const { GetUsersSubscriptionPlan } = require('../../models/user-subscription-plan-services');
const { CreditHistoryAggregate } = require('../../models/credit-history-services');

const {
  CreateExpressionWithRegexValue,
  CreateExpressionWithValue
} = require('../../utils/helpers');

const GetUsers = async ({
  filters,
  skip,
  limit,
  sortBy
}) => {
  const {
    signUpDate, statusChangeDate
  } = sortBy || {};

  const sortUsers = {};

  if (!isEmpty(signUpDate)) {
    extend(sortUsers, { createdAt: signUpDate === 'asc' ? 1 : -1 });
  } else if (!isEmpty(statusChangeDate)) {
    extend(sortUsers, { statusUpdatedAt: statusChangeDate === 'asc' ? 1 : -1 });
  } else {
    extend(sortUsers, { createdAt: -1 });
  }
  const userSelector = {};

  const {
    searchByKeyWords: { keys = [], value = '' } = {},
    status
  } = filters || {};

  if (!status.includes('all')) {
    extend(userSelector, {
      status: { $in: status }
    });
  }

  extend(userSelector, { role: 'user' });

  if (keys.length) {
    if (value.includes(' ')) {
      const regexExpression = CreateExpressionWithRegexValue({ keys, value });
      extend(userSelector, regexExpression);
    } else {
      const regexExpression = CreateExpressionWithValue({ keys, value });
      extend(userSelector, regexExpression);
    }
  }

  const totalUsers = await CountOfUsers({ filterParams: userSelector });

  const users = await GetUsersList({
    filterParams: userSelector,
    skip,
    limit,
    sortBy: sortUsers
  });

  const usersIdList = users.map(row => row._id);

  const tokenUsageDetails = await CreditHistoryAggregate({
    pipeline: [
      {
        $match: {
          userId: { $in: usersIdList }
        }
      },
      {
        $group: {
          _id: "$userId",
          totalTokensConsumed: { $sum: "$actualTokenConsumed.totalTokens" }
        }
      }
    ]
  });

  console.log('tokenUsageDetails: ', tokenUsageDetails);

  const userSubscriptionDetails = await GetUsersSubscriptionPlan({
    filterParams: {
      userId: { $in: usersIdList }
    }
  });

  const userData = users.map(user => {
    const { _id } = user;

    const subscriptionDetails = userSubscriptionDetails.find(row => String(row.userId) === String(_id));
    const tokenUsage = tokenUsageDetails.find(row => String(row._id) === String(_id));

    return {
      ...user,
      subscriptionDate: subscriptionDetails?.subscriptionDate,
      credits: subscriptionDetails?.credits,
      subscriptionPlan: subscriptionDetails?.subscriptionPlan,
      subscriptionType: subscriptionDetails?.subscriptionType,
      subscriptionStatus: subscriptionDetails?.status,
      freeCreditAccess: subscriptionDetails?.freeCreditAccess,
      totalAITokenConsumed: tokenUsage?.totalTokensConsumed || 0
    }
  });

  return {
    users: userData,
    totalUsers
  }
};

module.exports = GetUsers;
