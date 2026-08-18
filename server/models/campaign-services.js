const Campaign = require('./campaign.model');
const { extend } = require('lodash');

const { ThrowMissingParamsError } = require('../utils/throw-missing-params-error');

const BulkWriteCampaign = async (bulkWriteData) => {
  ThrowMissingParamsError([bulkWriteData]);

  const response = await Campaign.bulkWrite(bulkWriteData);

  return response;
};

const GetCampaignsData = async ({ filterParams, selectParams = {} }) => {
  ThrowMissingParamsError([filterParams]);

  const response = await Campaign.find(filterParams).select(selectParams);

  return response;
};

const GetCampaign = async ({ filterParams, selectParams = {} }) => {
  ThrowMissingParamsError([filterParams]);

  const response = await Campaign.findOne(filterParams).select(selectParams);

  return response;
};

const CreateCampaign = async ({ 
  campaignId,
  projectId, 
  title,
  mode,
  dateRange,
  platforms,
  matchType
 }) => {
  ThrowMissingParamsError([projectId, title]);

  const parameters = {
    projectid: projectId,
    title,
    mode,
    dateRange,
    platforms,
    matchType
  };

  if (campaignId) extend(parameters, { _id: campaignId });
  if (matchType) extend(parameters, { matchType });

  const saveCampaign = new Campaign(parameters);
  return await saveCampaign.save();
};

module.exports = {
  BulkWriteCampaign,
  CreateCampaign,
  GetCampaignsData,
  GetCampaign
};
