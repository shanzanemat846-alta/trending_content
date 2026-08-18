const path = require('path');
const fs = require('fs');
const { plural, isSingular, singular } = require('pluralize');
const xml2js = require('xml2js');
const axios = require('axios');
const { uniq, extend } = require('lodash');
const { HttpsProxyAgent } = require('https-proxy-agent');
const tiktoken = require("tiktoken");
const moment = require("moment");
const fuzz = require("fuzzball");

const { InsertCaptions } = require('../models/caption-services');
const { GetUserSubscriptionPlan, GetUsersSubscriptionPlan, UpdateUserSubscriptionPlan, BulkUpdateUserSubscriptionPlan } = require('../models/user-subscription-plan-services');
const { SaveCreditHistory } = require('../models/credit-history-services');
const { GetProject } = require('../models/project-services');

const {
  ADDITIONAL_COSTING_AMOUNT,
  COSTING_TYPES,
  COSTING_AMOUNT,
  GPT_COSTING,
  DEFAULT_GPT_MODEL,
  SUBSCRIPTION_PLANS,
  WEIGHTS,
  YT_WEIGHTS,
  PLANS_AND_CREDITS,
  THRESHOLD
} = require('./constants');

const CatchResponse = ({
  res,
  err
}) => {
  let statusCode = 500;
  let error = 'Server Error';
  if (err.statusCode) {
    ({ statusCode } = err);
  }
  if (err.error) {
    ({ error } = err);
  }
  console.log('\n\n ', { err });
  res.status(statusCode).json({
    success: false,
    error: error
  });
};

const TryResponse = ({
  res,
  ...rest
}) => {
  res.status(200).send({
    success: true,
    ...rest
  });
};

const ExtractImageFileName = ({ imagesList }) => {
  const imagesFiles = imagesList.map(url => {
    const imageName = url.substring(url.lastIndexOf('/') + 1);
    return imageName;
  });

  return imagesFiles;
}

const ExtractImageUrls = ({ htmlString }) => {
  const imgUrls = [];
  const imgRegex = /<img[^>]+src="([^">]+)"/g;

  while ((match = imgRegex.exec(htmlString)) !== null) {
    imgUrls.push(match[1]);
  }

  return imgUrls;
}

const ClearDirectory = ({ dir, keepFiles = [] }) => {
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach((file) => {
      const filePath = path.join(dir, file);

      if (!keepFiles.includes(file)) {

        fs.unlinkSync(filePath);
        console.log(`Deleted: ${filePath}`);
      }
    });
  } else {
    console.log(`Directory not found: ${dir}`);
  }
};

const FormatFileSize = (bytes) => {
  if (bytes >= 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
  if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  }

  return `${bytes} bytes`;
};

const GetFirstImageFromPost = (post) => {
  // Helper function to clean and fix Reddit image URLs
  const cleanRedditUrl = (url) => {
    if (!url) return null;
    
    // Convert preview.redd.it to i.redd.it
    url = url.replace('preview.redd.it', 'i.redd.it');
    
    // Remove tracking parameters
    url = url.split('?')[0];
    
    // Handle Reddit media proxy links
    if (url.startsWith('https://www.reddit.com/media?')) {
      try {
        const mediaUrl = new URL(url).searchParams.get('url');
        if (mediaUrl) return decodeURIComponent(mediaUrl);
      } catch (e) {
        console.warn('Failed to parse media URL', url);
      }
    }
    
    return url;
  };

  // 1. Check for gallery posts (media_metadata exists)
  if (post.media_metadata) {

    const firstMediaId = Object.keys(post.media_metadata)[0];
    const media = post.media_metadata[firstMediaId];
    // Get highest resolution available
    const imageUrl = media.s?.u || media.p[media.p.length - 1]?.u;
    return cleanRedditUrl(imageUrl);
  }

  // 2. Check for single image posts (url is an image)
  if (post.url && /\.(jpg|jpeg|png|gif|webp)$/i.test(post.url)) {
    return cleanRedditUrl(post.url);
  }

  // 3. Check for preview images
  if (post.preview?.images?.[0]?.source?.url) {
    return cleanRedditUrl(post.preview.images[0].source.url);
  }

  // 4. Check for crossposts
  if (post.crosspost_parent_list?.[0]) {
     console.log('crosspost_parent_list url')
    return GetFirstImageFromPost(post.crosspost_parent_list[0]);
  }

  // 5. Check for text posts with embedded images in selftext
  if (post.selftext) {
     console.log('selftext url')

    const imgRegex = /https?:\/\/[^\s]+?\.(jpg|jpeg|png|gif|webp)/gi;
    const matches = post.selftext.match(imgRegex);
    if (matches && matches.length > 0) {
      return cleanRedditUrl(matches[0]);
    }
  }

  // 6. Fallback to thumbnail if it's not the default
  if (post.thumbnail && post.thumbnail !== 'default' && post.thumbnail !== 'self') {
     console.log('thumbnail url')

    return cleanRedditUrl(post.thumbnail);
  }

  return null; // No image found
}

const CheckImageExtension = ({ url }) => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff', 'svg'];
  const fileExtension = url?.split('.').pop().toLowerCase();

  return imageExtensions.includes(fileExtension) ? url : 'empty';
};

const MatchWord = (keywordWord, threadWord) => {
  keywordWord = keywordWord?.trim()?.toLowerCase();
  threadWord = threadWord?.trim()?.toLowerCase();

  const isSing = isSingular(keywordWord);

  if (keywordWord === threadWord) {
    return true;
  }
  if (isSing && plural(keywordWord) === threadWord) {
    return true;
  }
  if (!isSing && singular(keywordWord) === threadWord) {
    return true;
  }

  return false;
}

const CleanString = (input) => (input.trim());

const SearchedWordsList = ({
  currentSearchedWordsList,
  word
}) => {
  const isPresentInCurrentSearchList = currentSearchedWordsList.some(keyword =>
    keyword === word ||
    (isSingular(word) && plural(word) === keyword) ||
    (plural(keyword) === word)
  );

  if (!isPresentInCurrentSearchList) {
    currentSearchedWordsList.push(word);
  }

  return currentSearchedWordsList;
};

const isKeywordPresent = ({ word, searchKeyWordsList }) => {
  // Normalize word to lowercase and trim
  const normalizedWord = word?.trim()?.toLowerCase();

  return searchKeyWordsList.some((keyword) => {
    const normalizedKeyword = keyword?.toLowerCase();

    // Check if the word matches the keyword (ignoring case)
    const isExactMatch = normalizedKeyword === normalizedWord;

    // Check if the word is the singular form of the keyword or vice versa
    const isSingularPluralMatch = (isSingular(normalizedWord) && plural(normalizedWord) === normalizedKeyword) ||
      (plural(normalizedKeyword) === normalizedWord);

    return isExactMatch || isSingularPluralMatch;
  });
};

const FilterPhraseMatch = (threads, keywordString) => {
  // console.log('\n\n threads title: ', threads.map(row =>row.title));

  const cleanedKeywordString = CleanString(keywordString);
  const searchKeyWordsList = cleanedKeywordString.split(' ').filter(Boolean);
  const uniqueSearchKeyWordsList = uniq(searchKeyWordsList);

  if (uniqueSearchKeyWordsList.length === 0) return [];

  let matchPhraseList = [];

  if (uniqueSearchKeyWordsList.length > 1) {
    matchPhraseList = threads.map(row => {
      const { title } = row;

      const cleanedTitle = CleanString(title);
      const thread = cleanedTitle.split(' ');

      let currentSearchedWordsList = [];
      let keywordFound = false;

      for (let i = 0; i < thread.length - 1; i += 1) {
        const inputWord = thread[i];

        if (isKeywordPresent({ word: inputWord, searchKeyWordsList })) {
          currentSearchedWordsList = SearchedWordsList({
            currentSearchedWordsList,
            word: inputWord
          });

          for (let j = i + 1; j < thread.length; j += 1) {
            const nextWord = thread[j];

            if (isKeywordPresent({ word: nextWord, searchKeyWordsList })) {
              currentSearchedWordsList = SearchedWordsList({
                currentSearchedWordsList,
                word: nextWord
              });
              if (currentSearchedWordsList.length === uniqueSearchKeyWordsList.length) {
                keywordFound = true;
                break;
              }
            } else {
              currentSearchedWordsList = []
              break;
            }
          }
        } else {
          currentSearchedWordsList = []
        }
      }

      if (keywordFound) return row;

      return null;
    });
  } else {
    matchPhraseList = threads.map(row => {
      const { title } = row;

      const cleanedTitle = CleanString(title);
      const thread = cleanedTitle.split(' ');

      if (isKeywordPresent({ word: uniqueSearchKeyWordsList[0], searchKeyWordsList: thread })) {
        return row;
      }

      return null
    });
  }

  matchPhraseList = matchPhraseList.filter(row => row != null);

  console.log('\n\n matchPhraseList Count: ', matchPhraseList.length);

  return matchPhraseList;
};

const FilterExactMatch = (threads, keywordString) => {
  const fThreads = [];
  // console.log('\n\n threads title: ', threads.map(row =>row.title));

  for (const thread of threads) {
    const { title } = thread;
    if (title && keywordString && title.toLowerCase().includes(keywordString.toLowerCase())) {
      fThreads.push(thread);
    }
  }

  console.log('\n\n phrase match fThreads.length', fThreads.length);
  return fThreads;
};


const DecodeHtmlEntities = (input) => {
  const htmlEntities = {
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&lt;': '<',
    '&gt;': '>',
    '&amp;': '&',
    '&nbsp;': ' ',
    '&cent;': '¢',
    '&pound;': '£',
    '&yen;': '¥',
    '&euro;': '€',
    '&copy;': '©',
    '&reg;': '®',
    '&trade;': '™',
    '&deg;': '°',
    '&bull;': '•',
    '&hellip;': '…',
    '&lsquo;': '‘',
    '&rsquo;': '’',
    '&ldquo;': '“',
    '&rdquo;': '”',
    '&mdash;': '—',
    '&ndash;': '–',
    '&iexcl;': '¡',
    '&iquest;': '¿',
    '&laquo;': '«',
    '&raquo;': '»',
    '&frasl;': '/',
    '&pi;': 'π',
    '&sigma;': 'σ',
    '&alpha;': 'α',
    '&beta;': 'β',
    '&infin;': '∞',
    '&hearts;': '♥',
    '&spades;': '♠',
    '&clubs;': '♣',
    '&diams;': '♦',
  };

  // Replace entities using the map
  let result = input;
  for (const [entity, char] of Object.entries(htmlEntities)) {
    result = result.replace(new RegExp(entity, 'g'), char);
  }

  // Replace <br> tags with newlines
  result = result.replace(/<br\s*\/?>/g, '\n');

  return result;
};

const ReplaceEncodedAmpersand = (url) => {
  if (typeof url !== 'string') {
    throw new Error('Input must be a string');
  }
  return url.replace(/\\u0026/g, '&');
};

const GetYoutubeVideoCaptions = async ({ url }) => {
  try {
    console.log('url : ', url, 'PROXY_URL', process.env.PROXY_URL);

    const proxyAgent = new HttpsProxyAgent(process.env.PROXY_URL);

    const response = await axios.get(url, { httpsAgent: proxyAgent });

    const { data } = response;

    const regex = /"captionTracks":\[\{(.*?)\}\]/g;
    const htmlContent = data.match(regex);

    if (!htmlContent) {
      throw CreateError(400, 'No caption tracks found!');
    }

    // Extract and decode base URLs for captions
    const contentString = htmlContent?.join('');
    const baseUrlRegex = /"baseUrl":"(https:\/\/[^\"]+)"/g;
    const matches = Array.from(contentString?.matchAll(baseUrlRegex))?.map(match =>
      ReplaceEncodedAmpersand(match[1])
    ) || [];

    console.log('Caption URLs: ', matches);

    // Find English subtitles URL
    const englishSubTitleUrl = matches?.find(url => url.includes('lang=en'));

    if (!englishSubTitleUrl) {
      return { captions: [], engCaptionsNotAvailable: true, matches };
      // throw CreateError(400, 'English subtitles not found!');
    }

    console.log('Found English subtitles URL: ', englishSubTitleUrl);

    // Fetch and parse English captions
    if (englishSubTitleUrl) {
      const transformedCaptions = await FetchAndConvertCaption(englishSubTitleUrl)

      return { captions: transformedCaptions, engCaptionsNotAvailable: false };
    }

    return { data, matches };
  } catch (err) {
    console.error('Error in GetYoutubeVideoCaptions: ', err);

    return { captions: [], engCaptionsNotAvailable: true, captionTrackNotFound: true };
    // throw CreateError(400, `GetYoutubeVideoCaptions error: ${err.error}`);
  }
};

const FetchAndConvertCaption = async (englishSubTitleUrl) => {
  try {
    const { data: captionText } = await axios.get(englishSubTitleUrl);

    const parser = new xml2js.Parser({ explicitArray: false });
    const parsedData = await parser.parseStringPromise(captionText);

    if (!parsedData.transcript || !Array.isArray(parsedData.transcript.text)) {
      throw new Error("Unexpected XML structure: Missing 'transcript' or 'text'");
    }

    const transformedCaptions = parsedData.transcript.text.map((text, index) => ({
      id: index,
      start: text.$.start,
      end: text.$.dur,
      transcription: text._,
    }));

    console.log('Transformed Captions:', transformedCaptions?.length);

    return transformedCaptions;
  } catch (error) {
    console.error('Error fetching or converting caption:', error.message);
    throw error;
  }
};

const CreateError = (statusCode, errorMessage) => {
  const error = new Error();
  error.error = errorMessage;
  error.statusCode = statusCode;
  return error;
};

const FetchCaptionsAndSave = async ({
  url,
  platform
}) => {
  const { captions: transcriptions, engCaptionsNotAvailable, matches = [], captionTrackNotFound } = await GetYoutubeVideoCaptions({ url });

  const insertParams = {
    url,
    platform,
    captions: !engCaptionsNotAvailable ? transcriptions : []
  };

  if (captionTrackNotFound) {
    extend(insertParams, { captionTrackNotFound: true });
  } else if (engCaptionsNotAvailable) {
    extend(insertParams, { matches, engCaptionsNotAvailable: true });
  }

  await InsertCaptions({ insertParams });
};

const ParseViewOption = (optionValue) => {
  if (optionValue.includes("-")) {
    const [min, max] = optionValue.split("-").map(Number);
    return { value: max, sign: 'lessThan' };
  } else if (optionValue.includes("+")) {
    const min = parseInt(optionValue.replace("+", ""), 10);
    return { value: min, sign: 'greaterThan' };
  } else {
    return { value: Number(optionValue), sign: 'greaterThanEqual' };
  }
};

const FileReNamer = (filename) => {
  const queHoraEs = Date.now();
  const regex = /[\s_-]/gi;
  const fileTemp = filename.replace(regex, ".");
  let arrTemp = [fileTemp.split(".")];
  return `${arrTemp[0]
    .slice(0, arrTemp[0].length - 1)
    .join("_")}${queHoraEs}.${arrTemp[0].pop()}`;
};

const DeleteFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        // File does not exist
        return reject(new Error('File not found'));
      }

      fs.unlink(filePath, (err) => {
        if (err) {
          // Error occurred while deleting
          return reject(new Error('Error deleting file: ' + err.message));
        }

        resolve('File deleted successfully');
      });
    });
  });
}

const CreateExpressionWithRegexValue = ({ keys, value }) => {
  value = value.trim();
  value = value.replace(/([\.\*\+\?\[\]\(\)\/])/g, '[$1]');
  value = value.replace(/\\/g, '\\\\');
  value = value.replace(/\^/g, '[\\^]');

  const regexExpressionArray = keys.map((key) => ({
    [key]: { $regex: value, $options: 'i' }
  }));

  regexExpressionArray.push({
    $expr: {
      $regexMatch: {
        input: { $concat: ['$firstName', ' ', '$lastName'] },
        regex: value,
        options: 'i'
      }
    }
  });

  return {
    $or: regexExpressionArray
  };
};

const CreateExpressionWithValue = ({ keys, value }) => {
  value = value.trim();
  value = value.replace(/([\.\*\+\?\[\]\(\)\/])/g, '[$1]');
  value = value.replace(/\\/g, '\\\\');
  value = value.replace(/\^/g, '[\\^]');
  const regexExpressionArray = keys.map((key) => {
    if (key === 'email') {
      return { [key]: { $regex: `.*${value}.*`, $options: 'i' } };
    }

    return {
      [key]: { $regex: value, $options: 'i' }
    };
  });

  const regexExpression = {
    $or: regexExpressionArray
  };

  return regexExpression;
};

const GetUserGPTModal = async ({
  projectId
}) => {
  const projectResponse = await GetProject({
    filterParams: { _id: projectId },
    selectParams: { chatgpttype: 1 }
  });

  const { chatgpttype } = projectResponse;
  const chatGptModelType = chatgpttype || DEFAULT_GPT_MODEL;

  return chatGptModelType;
};

const CountTokens = async ({ text, projectId }) => {
  let modal = await GetUserGPTModal({ projectId });

  if (!modal || !["gpt-4", "gpt-4-turbo", "gpt-3.5-turbo"].includes(modal)) {
    modal = "gpt-3.5-turbo";
  }

  console.log('\n\n modal: ', modal);
  const encoder = tiktoken.encoding_for_model(modal);
  let tokens = 0;

  if (typeof text === "string") {
    tokens = encoder.encode(text).length;
  } else if (Array.isArray(text)) {
    tokens = text.reduce((acc, item) => {
      if (item && typeof item.content === "string") {
        return acc + encoder.encode(item.content).length;
      }
      return acc;
    }, 0);
  } else {
    const error = new Error();
    error.status = 500;
    error.error = `Invalid input: Expected a string or an array, got ${typeof text}`
    throw error;
  }

  console.log('\n\n tokens: ', tokens);
  return tokens;
};

const CalculateCreditDeduction = async ({ additionCredits = false, projectId, userId, type, words }) => {
  let deductionAmount = 0;

  console.log('userId: ', userId)
  const userSubscriptionDetail = await GetUserSubscriptionPlan({ filterParams: { userId } });
  console.log('userSubscriptionDetail: ', userSubscriptionDetail)

  if (!userSubscriptionDetail) throw new Error("User subscription not found");

  let { total, used } = userSubscriptionDetail.credits;
  let gptConsumedTokens;

  if (type === COSTING_TYPES.GPT || type === COSTING_TYPES.GPT_SUMMARY) {
    gptConsumedTokens = await CountTokens({ text: words, projectId});
    deductionAmount = (gptConsumedTokens) * GPT_COSTING.COST_PER_TOKEN;
  } else if (COSTING_TYPES[type] !== undefined) {

    if (additionCredits) deductionAmount = ADDITIONAL_COSTING_AMOUNT[type];
    else deductionAmount = COSTING_AMOUNT[type];
  } else {
    throw new Error("Invalid costing type");
  }

  if ((used + deductionAmount) > total) {
    const error = new Error();
    error.error = `Insufficient credits! You need ${(deductionAmount)?.toFixed(2)} credits to process this request, but only ${(total - used)?.toFixed(2)} credits are available.`
    throw error;
  }

  return {
    deductionAmount: Number((deductionAmount)?.toFixed(2)),
    gptConsumedTokens: Number((gptConsumedTokens)?.toFixed(2))
  };
};

const DeductCreditsAndLogHistory = async ({
  type,
  userId,
  projectId,
  deductionAmount,
  campaignId,
  storeId,
  title,
  platformErrors,
  gptConsumedTokens,
  chatId,
  reSyncThreads,
  actualTokenConsumed
}) => {
  try {
    const userSubscriptionDetail = await GetUserSubscriptionPlan({ filterParams: { userId } });
    if (!userSubscriptionDetail) throw new Error("User subscription not found");

    let { used } = userSubscriptionDetail.credits;
    used += deductionAmount;

    await UpdateUserSubscriptionPlan({
      filterParams: { userId },
      updateParams: { 'credits.used': used }
    });

    await SaveCreditHistory({
      type,
      userId,
      campaignId,
      storeId,
      deductionAmount,
      title,
      projectId,
      platformErrors,
      gptConsumedTokens,
      chatId,
      campaignReSynced: reSyncThreads,
      actualTokenConsumed
    });
  } catch (err) {
    const error = new Error();
    error.status = 500;
    error.error = `Error in deducting credits and keeping history ${err.message}`
    throw error;
  }
};

const HandleFreeCredits = async () => {
  try {
    const today = moment().startOf('day');

    const userList = await GetUsersSubscriptionPlan({
      filterParams: {
        freeCreditAccess: true,
        subscriptionPlan: SUBSCRIPTION_PLANS.FREE,
        freeCreditsDate: {
          $lte: today.subtract(30, 'days').toDate()
        }
      }
    });

    if (!userList || userList.length === 0) {
      console.log('No users eligible for free credits update.');
      return;
    }

    const bulkOperations = userList.map((user) => ({
      updateOne: {
        filter: { userId: user.userId },
        update: {
          $inc: { "credits.total": PLANS_AND_CREDITS.free },
          $set: {
            freeCreditsDate: new Date(),
            updatedAt: new Date()
          }
        }
      }
    }));

    console.log('\n\n bulkOperations: ', bulkOperations.length);
    if (bulkOperations.length) {
      const bulkResult = await BulkUpdateUserSubscriptionPlan(bulkOperations);
      console.log(`Updated ${bulkResult.modifiedCount} users with additional free credits.`);
    }
  } catch (error) {
    console.error('Error in handleFreeCredits:', error);
  }
};

const BuildUserMessage = (promptContent, redditContent, youtubeContent) => {

  console.log({
    promptContent,
    redditContent,
    youtubeContent
  })
  let message = `INSTRUCTIONS:\n${promptContent}\n\nCONTENT SOURCES:\n`;

  if (redditContent && youtubeContent) {
    message += `${redditContent}\n`;
    message += `\n${youtubeContent}`;
  }
  else if (redditContent) {
    message += `${redditContent}`;
  }
  else if (youtubeContent) {
    message += `${youtubeContent}`;
  }
  else {
    message += 'No content sources provided - create original content';
  }

  // Concise formatting tips
  message += `\n\nNOTE: Use clear sections, Markdown formatting, and a professional tone. Start with a **bold title**, include a 160-char meta description, and highlight key points with **bold** or bullet lists (if relevant).`;

  console.log('message: ', message);
  return message;
};

const DownloadAndSaveProfileImage = async (imageUrl, userId) => {
  try {
    const storagePath = path.join(__dirname, '../images', 'userProfiles');
    if (!fs.existsSync(storagePath)) {
      fs.mkdirSync(storagePath, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const ext = path.extname(new URL(imageUrl).pathname.split("?")[0]) || '.jpg';
    const newFileName = `${userId}-${timestamp}${ext}`;
    const newFilePath = path.join(storagePath, newFileName);

    // Fetch image as a stream
    const response = await axios.get(imageUrl, { responseType: 'stream' });

    // Save to file
    const writer = fs.createWriteStream(newFilePath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    // Delete older images for the same user
    fs.readdirSync(storagePath).forEach((file) => {
      if (file.startsWith(userId) && file !== newFileName) {
        fs.unlinkSync(path.join(storagePath, file));
      }
    });

    console.log(`Profile image saved for user ${userId}`);

    return newFileName;
  } catch (err) {
    console.error('Failed to download profile image:', err.message);
  }
};

const ScoreThread = (thread, level) => {
  const now = Date.now();

  let ageInSeconds = 0;
  let recencyBoost = 0;

  if (thread?.created_utc) {
    ageInSeconds = (now - thread.created_utc * 1000) / 1000;
    recencyBoost= (1 / (1 + ageInSeconds)) * WEIGHTS.recency; // Newer = higher boost
  }

  const score =  WEIGHTS.keywordMatch[level] + (thread.ups || 0) * WEIGHTS.upvotes + (thread.num_comments || 0) * WEIGHTS.comments + recencyBoost

  return parseFloat(score.toFixed(4));
};

const ScoreYoutubeVideos = (video, level) => {
  const score =  YT_WEIGHTS.keywordMatch[level] + ((Number(video.likeCount) || 0) * YT_WEIGHTS.likes) + ((Number(video.commentCount) || 0) * YT_WEIGHTS.comments) + ((Number(video.viewCount) || 0) * YT_WEIGHTS.views);

  return parseFloat(score.toFixed(4));
};

const FindTheBestMatchFuss = (threads, keywordString, threshold = THRESHOLD) => {
  let results = threads
    .map(t => ({
      ...t,
      score: fuzz.token_sort_ratio(keywordString, t.title)
    }))
    
  let resultsWithScoring = results
    .sort((a, b) => b.score - a.score)
    .map(r => (`${r.title} -> ${r.score}`))

  results = results
    .filter(r => r.score >= threshold)
    .sort((a, b) => b.score - a.score);

  return { filteredThreads: results, resultsWithScoring } 
};


module.exports = {
  BuildUserMessage,
  CatchResponse,
  CheckImageExtension,
  ClearDirectory,
  CreateExpressionWithRegexValue,
  CreateExpressionWithValue,
  CalculateCreditDeduction,
  DeductCreditsAndLogHistory,
  DecodeHtmlEntities,
  DeleteFile,
  DownloadAndSaveProfileImage,
  ExtractImageFileName,
  ExtractImageUrls,
  FetchCaptionsAndSave,
  FileReNamer,
  FilterExactMatch,
  FilterPhraseMatch,
  FormatFileSize,
  GetYoutubeVideoCaptions,
  ParseViewOption,
  TryResponse,
  HandleFreeCredits,
  ScoreThread,
  ScoreYoutubeVideos,
  GetFirstImageFromPost,
  FindTheBestMatchFuss
};
