const { GetThreads } = require('../../models/thread-services');

const { GetAccessToken, FetchRedditThreadByUrl } = require('../../services/reddit');

const { REDDIT_ENDPOINTS } = require('../../utils/constants');

const GetRedditDetails = async ({ redditThreadsId }) => {
  console.log('redditThreadsId : ', redditThreadsId.length);

  const threadDetails = await GetThreads({
    filterParams: { _id: { $in: redditThreadsId } },
    selectParams: {
      url: 1,
      platform: 1,
      title: 1,
      platform: 1,
      url: 1,
      mode: 1
    }
  });

  const redditThreadsData = [];

  for (let i = 0; i < threadDetails.length; i += 1) {
    const { title, url, platform, _id: threadId, mode } = threadDetails[i];
    
    try {
      const accessToken = await GetAccessToken();

      const response = await FetchRedditThreadByUrl({
        url: `${REDDIT_ENDPOINTS.BASE_REDDIT_URL}${url}.json`,
        accessToken
      })

      const data = response.data;

      const postBody = data[0]?.data?.children[0]?.data?.selftext || '';
      const comments = data[1]?.data?.children || [];
      const commentsBody = comments.map(comment => ({
        comment: comment?.data.body || '',
        author: comment?.data.author || '',
        ups: comment?.data.ups || 0,
      }));

      redditThreadsData.push({
        threadId,
        title,
        url,
        platform,
        postBody,
        commentsBody,
        mode
      });
      
    } catch (error) {
      console.log('\n\n error occur: ', error);

      redditThreadsData.push({
        threadId,
        title,
        url,
        platform,
        mode,
        redditError: 'Sorry error in getting post details try again!',
        postBody: '',
        commentsBody: ''
      });
    }
  }

  return { redditThreadsData };
};

module.exports = GetRedditDetails;
