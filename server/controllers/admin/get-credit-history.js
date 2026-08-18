const { GetCreditHistoryByAggregate } = require('../../models/credit-history-services');

const GetUserCreditHistory = async ({ userId, startDate, endDate }) => {
  const chartData = await GetCreditHistoryByAggregate({ userId, startDate, endDate });
  return chartData;
};

module.exports = GetUserCreditHistory;
