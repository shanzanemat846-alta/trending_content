const { GetThreads } = require('../../models/thread-services');

const { GetAccessToken, FetchRedditThreadByUrl } = require('../../services/reddit');

const { REDDIT_ENDPOINTS } = require('../../utils/constants');

// Enhanced Reddit content formatter
const formatRedditContent = (postTitle, postBody, comments) => {
  // Clean and normalize all text inputs
  const cleanText = (text) => {
    return (text || '')
      .replace(/\n+/g, ' ')       // Replace newlines with spaces
      .replace(/\s+/g, ' ')       // Collapse multiple spaces
      .replace(/^\s+|\s+$/g, ''); // Trim whitespace
  };

  const sections = [
    `=== SOURCE: REDDIT ===`,
    `Thread Title: ${cleanText(postTitle)}\n`,
    `Post Body Text:`,
    cleanText(postBody),
    `\nPublic Comments:`,
    ...comments.map((comment, index) => 
      `- Comment ${index + 1}: ${cleanText(comment)}`
    ),
    `\n` // Add space between different sources
  ];
  
  console.log('\n\n sections: ', sections);
  return sections.join('\n');
};

const FetchRedditDetails = async ({
  url,
  accessToken
}) => {
  try {
    const response = await FetchRedditThreadByUrl({
      url,
      accessToken
    })
  
    const data = response.data;
    const postTitle = data[0]?.data?.children[0]?.data?.title || '';
    const postBody = data[0]?.data?.children[0]?.data?.selftext || '';
    const comments = data[1]?.data?.children || [];
    const commentsBody = comments.map(comment => comment?.data?.body || '');
  
    const formattedText = formatRedditContent(postTitle, postBody, commentsBody);

    return { 
      postTitle, 
      formattedText: formattedText 
    };
  } catch (error) {
    console.log('\n\n error occur: ', error);
    return { 
      postTitle: '', 
      formattedText: '' 
    };
  }
};

const RedditInstructionsForGPT = async ({
  selectedRedditThreadsList
}) => {
  const accessToken = await GetAccessToken();

  const redditIds = selectedRedditThreadsList.map(row => row.threadId);

  const threads = await GetThreads({
    filterParams: {
      _id: { $in: redditIds }
    },
    selectParams: {
      url: 1,
      title: 1
    }
  });

  const urls = threads.map(({ url }) => 
    FetchRedditDetails({ url: `${REDDIT_ENDPOINTS.BASE_REDDIT_URL}${url}.json`, accessToken })
  );

  const prePromptResults = await Promise.all(urls);

  const postTitles = prePromptResults.map(result => result.postTitle);
  const formattedTexts = prePromptResults.map(result => result.formattedText);

  let combinedPostTitle = '';


  if (postTitles.length) {
    if (postTitles.length === 1) {
      combinedPostTitle = postTitles[0];
    } else {
      let numberOfLetters = Math.ceil(12 / Math.sqrt(postTitles.length));
  
      if (numberOfLetters < 3) {
        numberOfLetters = 3;
      } else if (numberOfLetters > 12) {
        numberOfLetters = 12;
      }
  
      combinedPostTitle = `combined${postTitles.length} ${postTitles.slice(0, 3).map(title => title.slice(0, numberOfLetters)).join(', ')}`;
    }
  }
  
  const combinedFormattedText = formattedTexts.join('\n');

  return {
    combineThreadTitles: combinedPostTitle,
    injectionContent: combinedFormattedText
  }
};

module.exports = RedditInstructionsForGPT;
