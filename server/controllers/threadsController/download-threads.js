const { GetThreads } = require('../../models/thread-services');
const GetRedditDetails = require('./get-reddit-details');
const GetVideoCaptions = require('./get-captions');
const { PLATFORMS } = require('../../utils/constants');
const { json2csv } = require('json-2-csv');

const DownloadThreads = async ({ threadsList }) => {
  console.log('\n\n threadsList: ', threadsList);
  const threads = await GetThreads({ filterParams: { _id: { $in: threadsList } } });

  if (!threads?.length) {
    throw new Error('No threads found for the given IDs.');
  }

  const youtubeThreads = threads.filter(row => row.platform === PLATFORMS.YOUTUBE);
  const redditThreads = threads.filter(row => row.platform === PLATFORMS.REDDIT);

  let youtubeDetails = [];
  if (youtubeThreads.length) {
    const { youtubeThreadsData } = await GetVideoCaptions({ youtubeThreadsId: youtubeThreads });

    youtubeDetails = youtubeThreads.map(thread => {
      // Find matching data from API response
      const apiData = youtubeThreadsData.find(item => item.threadId.toString() === thread._id.toString());

      // Convert captions array to string if needed
      const captions = Array.isArray(apiData?.captions) 
        ? apiData.captions.join('\n') 
        : apiData?.captions || '';

      console.log('captions: ', captions);

      return {
        Title: thread.title || '',
        Description: captions || '',
        URL: thread.url || apiData?.url || '',
        Image: thread.imageurl || '',
        Platform: 'youtube',
        Category: thread.category || '',
        Likes: thread?.youtubeVideoDetails?.likeCount || 0,
        Comments: thread?.youtubeVideoDetails?.comments || '',
      };
    });
  }

  let redditDetails = [];
  if (redditThreads.length) {
    const { redditThreadsData } = await GetRedditDetails({ redditThreadsId: redditThreads });

    redditDetails = redditThreads.map(thread => {
      // Find matching data from API response
      const apiData = redditThreadsData.find(item => item.threadId.toString() === thread._id.toString());

      return {
        Title: thread.title || '',
        Description: apiData?.postBody || '',
        URL: thread.url || apiData?.url || '',
        Image: thread.thumbnail || apiData?.image || '',
        Platform: 'reddit',
        Category: thread.subreddit || '',
        Likes: thread?.upvotes || 0,
        Comments: thread?.comments || '',
      };
    });
  }

  const combinedDetails = [...youtubeDetails, ...redditDetails];

  if (!combinedDetails.length) {
    throw new Error('No thread details available for export.');
  }

  // Define CSV fields
  const fields = ['Title', 'Description', 'URL', 'Image', 'Platform', 'Category', 'Comments', 'Likes'];
  const opts = { fields };

  try {
    // Convert JSON to CSV
    const csv = await json2csv(combinedDetails);

    return {
      csvData: csv,
      fileName: `threads_export_${Date.now()}.csv`
    };
  } catch (err) {
    throw new Error('Error generating CSV file: ' + err.message);
  }
};

module.exports = DownloadThreads;
