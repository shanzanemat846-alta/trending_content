const { GetTopDemographics } = require('../../models/credit-history-services');

const GetTopDemographicsHistory = async ({ startDate, endDate }) => {
  const demographicsList = await GetTopDemographics({ startDate, endDate });
  return demographicsList;
};

module.exports = GetTopDemographicsHistory;
