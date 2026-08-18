const DeleteUsers = require('./delete-users');
const UpdateUserByAdmin = require('./update-user-by-admin');
const GetUserCreditHistory = require('./get-credit-history');
const GetCreditsHistory = require('./get-credits-history');
const GetTopDemographicsHistory = require('./get-credit-demographics');
const UpdateUserSubscriptionByAdmin = require('./update-user-subscription-by-admin');

module.exports = {
  DeleteUsers,
  UpdateUserByAdmin,
  GetUserCreditHistory,
  GetCreditsHistory,
  GetTopDemographicsHistory,
  UpdateUserSubscriptionByAdmin
};
