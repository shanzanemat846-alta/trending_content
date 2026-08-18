const { GetComments } = require('../../models/comment-services');

const { COMMENTS_LIMIT } = require('../../utils/constants');

const GetThreadComments = async ({
  threadId
}) => {
  const threadComments = await GetComments({
    filterParams: { threadId },
    selectParams: {
      author: 1,
      comment: 1,
      publishedAt: 1,
      likeCount: 1
    },
    sortBy: { likeCount: -1 },
    limit: COMMENTS_LIMIT
  });

  return { threadComments };
};

module.exports = GetThreadComments;
