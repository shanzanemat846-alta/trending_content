const Comment = require('./comment.model');

const { ThrowMissingParamsError } = require('../utils/throw-missing-params-error');

const BulkWriteComment = async (bulkWriteData) => {
  ThrowMissingParamsError([bulkWriteData]);

  const response = await Comment.bulkWrite(bulkWriteData);

  return response;
};

const DeleteComments = async ({ filterParams }) => {
  ThrowMissingParamsError([filterParams]);

  const response = await Comment.deleteMany(filterParams);

  return response;
};

const GetComments = async ({
  filterParams,
  selectParams = {},
  sortBy = { createdAt: -1 },
  limit
}) => {
  ThrowMissingParamsError([filterParams]);

  const response = await Comment
    .find(filterParams)
    .select(selectParams)
    .sort(sortBy)
    .limit(limit);

  return response;
};

module.exports = {
  BulkWriteComment,
  DeleteComments,
  GetComments
};
