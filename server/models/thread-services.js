const Thread = require('./thread.model');

const { ThrowMissingParamsError } = require('../utils/throw-missing-params-error');

const BulkWriteThread = async (bulkWriteData) => {
  ThrowMissingParamsError([bulkWriteData]);

  const response = await Thread.bulkWrite(bulkWriteData);

  return response;
};

const DeleteThreads = async ({ filterParams }) => {
  ThrowMissingParamsError([filterParams]);

  const response = await Thread.deleteMany(filterParams);

  return response;
};

const GetThreads = async ({
  filterParams, selectParams = {}, sortParams='', skip = 0, limit
}) => {
  ThrowMissingParamsError([filterParams]);

  const response = await Thread
    .find(filterParams)
    .select(selectParams)
    .sort(sortParams)
    .skip(Number(skip))
    .limit(Number(limit));

  return response;
};

const GetThread = async ({ filterParams, selectParams = {} }) => {
  ThrowMissingParamsError([filterParams]);

  const response = await Thread.findOne(filterParams).select(selectParams);

  return response;
};

const CountOfThreads = async ({ filterParams }) => {
  ThrowMissingParamsError([filterParams]);

  return await Thread.find(filterParams).countDocuments();
};

module.exports = {
  BulkWriteThread,
  CountOfThreads,
  DeleteThreads,
  GetThread,
  GetThreads
};
