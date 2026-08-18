const { GetProject } = require('../../models/project-services');
const { GetThreads } = require('../../models/thread-services');

const GetSaveThreads = async ({ projectId }) => {
  console.log('projectId skip limit : ', projectId);

  const projectDetails = await GetProject({ filterParams: { _id: projectId } });

  console.log('projectDetails : ', projectDetails);

  const { selectedThreadsList } = projectDetails || {};
  let { redditThreadsIds = [], youtubeThreadsIds = [] } = selectedThreadsList || {};

  redditThreadsIds = redditThreadsIds.map(row => row.threadId);
  youtubeThreadsIds = youtubeThreadsIds.map(row => row.threadId);

  console.log('redditThreadsIds: ', redditThreadsIds, 'youtubeThreadsIds', youtubeThreadsIds);
  const allThreads = [...redditThreadsIds, ...youtubeThreadsIds];

  console.log('allThreads: ', allThreads);

  const threadDetails = await GetThreads({
    filterParams: { _id: { $in: allThreads } },
    selectParams: {
      url: 1,
      title: 1,
      captions: 1,
      platform: 1,
      category: 1,
      imageurl: 1,
      upvotes: 1,
      comments: 1,
      youtubeVideoDetails: 1
    }
  });

  return { saveThreads: threadDetails };
};

module.exports = GetSaveThreads;
