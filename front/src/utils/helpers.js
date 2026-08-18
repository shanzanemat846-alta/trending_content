import React from 'react';
import { plural, isSingular, singular  }  from 'pluralize';

import { CHAT_GPT_ENDPOINTS, COSTING_AMOUNT, SUBSCRIPTION_PLANS, COSTING_TYPES, PLATFORMS } from 'src/utils/constants';

const FormatFileSize = (bytes) => {
  console.log('\n\n bytes: ', bytes);
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

const ValidateAIKey = async ({ aIKey, modelName }) => {
  try {
    if (!aIKey) {
      return { valid: false, message: 'Missing AI Key' };
    }
    if (!modelName) {
      return { valid: false, message: 'Missing model name' };
    }

    const response = await fetch(CHAT_GPT_ENDPOINTS.GET_MODELS, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${aIKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: 'user', content: 'ping' }
        ],
      })
    });

    if (response.ok) {
      return { valid: true, message: 'AI Key is valid' };
    }

    let errorMessage = 'Invalid AI Key';
    try {
      const errorData = await response.json();
      errorMessage = errorData?.error?.message || errorMessage;
    } catch (_) {
      // ignore parse error
    }
    return { valid: false, message: errorMessage };
  } catch (error) {
    return { valid: false, message: 'Failed to validate AI Key' };
  }
};

const cleanString = (input) => (input.trim());

const matchWord = (keywordWord, threadWord) => {
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

const FilterExactMatch = (threads, keywordString) => {
  const cleanedKeywordString = cleanString(keywordString);
  const keywords = cleanedKeywordString.split(' ').map(keyword => keyword.trim());

  const fThreads = threads.filter(thread => {
    const cleanedTitle = cleanString(thread?.title);
    const titleWords = cleanedTitle.split(' ');

    if (titleWords.length === keywords.length) {
      const allMatch = titleWords.every((word, index) => matchWord(keywords[index], word));
      return allMatch;
    }

    return false;
  });

  return fThreads;
}

const FilterPhraseMatch = (threads, keywordString) => {
  const fThreads = [];

  for (const thread of threads) {
    const { title } = thread;
    if (title.toLowerCase().includes(keywordString.toLowerCase())) {
      fThreads.push(thread);
    }
  }

  console.log('\n\n fThreads.length', fThreads.length);
  return fThreads;
};


const DecodeHtmlEntities = (input) => {
  // Comprehensive map for HTML entities
  const htmlEntities = {
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&lt;': '<',
    '&gt;': '>',
    '&amp;': '&',
    '&nbsp;': ' ', // Non-breaking space
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

const CustomScale = (value) => Math.log10(value + 1);

const InverseCustomScale = (value) => 10 ** value - 1;

const FormatNumber = (num) => {
  if (num >= 1000000000) {
    return `${(num / 1000000000).toFixed(1)}B`;
  }
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return `${num}`;
};

const ParseDuration = (duration) => {
  const match = duration?.match(/PT(\d+H)?(\d+M)?(\d+S)?/) || [];

  const hours = match[1] ? parseInt(match[1], 10) : 0;
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const seconds = match[3] ? parseInt(match[3], 10) : 0;

  return `${hours > 0 ? `${hours}h ` : ''}${minutes > 0 ? `${minutes}m ` : ''}${seconds > 0 ? `${seconds}s` : ''}`.trim();
  // return `${hours > 0 ? hours + 'h ' : ''}${minutes > 0 ? minutes + 'm ' : ''}${seconds > 0 ? seconds + 's' : ''}`.trim()
};

const ParseDurationToMinutes = (duration) => {
  const match = duration?.match(/PT(\d+H)?(\d+M)?(\d+S)?/) || [];

  const hours = match[1] ? parseInt(match[1], 10) : 0;
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const seconds = match[3] ? parseInt(match[3], 10) : 0;

  // Convert everything to total minutes
  const totalMinutes = hours * 60 + minutes + Math.ceil(seconds / 60);

  return totalMinutes || 0;
};

const FormatNumberWithSuffix = (value) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  }  
  return `${value}`;
};

const FormatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60); // Removes milliseconds
  return `${mins}:${secs.toString().padStart(2, '0')}`; // Ensures two-digit seconds
}

const checkCreditAvailable = ({ costingType, platforms, credits }) => {
  const { used = 0, total = 0 } = credits || {};

  let errorMessage = '';
  let isCreditUnavailable = false;
  let tokenToBeConsumed = 0;

  if (costingType === COSTING_TYPES.SAVE_CONTENT) {
    tokenToBeConsumed = used + COSTING_AMOUNT.SAVE_CONTENT;
    if (tokenToBeConsumed > total) {
      errorMessage = `Insufficient credits! You need ${(COSTING_AMOUNT.SAVE_CONTENT)?.toFixed(2)} credits to process this request, but only ${(total - used)?.toFixed(2)} credits are available.`;
      isCreditUnavailable = true;
    }
  }

  if (platforms?.reddit && platforms?.youtube) {
    tokenToBeConsumed = used + COSTING_AMOUNT.MULTI_PLATFORM_CAMPAIGN;
    if (tokenToBeConsumed > total) {
      errorMessage = `Insufficient credits! You need ${(COSTING_AMOUNT.MULTI_PLATFORM_CAMPAIGN)?.toFixed(2)} credits to process this request, but only ${(total - used)?.toFixed(2)} credits are available.`;
      isCreditUnavailable = true;
    }
  } else if (platforms?.reddit) {
    tokenToBeConsumed = used + COSTING_AMOUNT.REDDIT_CAMPAIGN;
    if (tokenToBeConsumed > total) {
      errorMessage = `Insufficient credits! You need ${(COSTING_AMOUNT.REDDIT_CAMPAIGN)?.toFixed(2)} credits to process this request, but only ${(total - used)?.toFixed(2)} credits are available.`;
      isCreditUnavailable = true;
    }
  } else if (platforms?.youtube) {
    tokenToBeConsumed = used + COSTING_AMOUNT.YOUTUBE_CAMPAIGN;
    if (tokenToBeConsumed > total) {
      errorMessage = `Insufficient credits! You need ${(COSTING_AMOUNT.YOUTUBE_CAMPAIGN)?.toFixed(2)} credits to process this request, but only ${(total - used)?.toFixed(2)} credits are available.`;
      isCreditUnavailable = true;
    }
  }

  return { isCreditUnavailable, errorMessage };
};

const SplitText = (text) => {
  const segments = text?.split('.').map(s => s.trim()).filter(Boolean);

  console.log('here inside the split text: ', text);
  return (
    <>
      {segments.map((segment, index) => (
        <React.Fragment key={index}>
          {segment}
          <br />
        </React.Fragment>
      ))}
    </>
  );
};

const FormatRedditContent = (postTitle, postBody, comments) => {
  // Clean and normalize all text inputs
  const cleanText = (text) => (text && typeof text === 'string' ? text : '').replace(/\n+/g, ' ')       // Replace newlines with spaces
      .replace(/\s+/g, ' ')       // Collapse multiple spaces
      .replace(/^\s+|\s+$/g, ''); // Trim whitespace

  const sections = [
    `=== SOURCE: REDDIT ===`,
    `Thread Title: ${cleanText(postTitle)}\n`,
    `Post Body Text:`,
    cleanText(postBody),
    `\nPublic Comments:`,
    ...comments.map((comment, index) => {
      const commentText = (typeof comment === 'object' && comment.comment) ? cleanText(comment.comment) : cleanText(comment);
      return `- Comment ${index + 1}: ${commentText}`;
    }),
    `\n` // Add space between different sources
  ];
  
  console.log('\n\n sections: ', sections);
  return sections.join('\n');
};

const BuildUserMessage = (promptContent, redditContent) => {
  let message = `INSTRUCTIONS:\n${promptContent}\n\nCONTENT SOURCES:\n`;
  
  if (redditContent) {
    message += `${redditContent}`;
  }
  else {
    message += 'No content sources provided - create original content';
  }

  // Concise formatting tips
  message += `\n\nNOTE: Use clear sections, Markdown formatting, and a professional tone. Start with a **bold title**, include a 160-char meta description, and highlight key points with **bold** or bullet lists (if relevant).`;

  console.log('message: ', message);
  return message;
};

const GetColumnForThreadsMobileView = (platform) => {
  const youtubeColumns = {
    likes: {
      label: 'Likes',
      icon: '/assets/like-icon-1.svg',
      id: 'likeCount' // YouTube API field name
    },
    views: {
      label: 'Views',
      icon: '/assets/eye-icon.svg',
      id: 'viewCount' // YouTube API field name
    },
    comments: {
      label: 'Comments',
      icon: '/assets/comment-icon-1.svg',
      id: 'comments' // YouTube API field name
    }
  };

  const redditColumns = {
    likes: {
      label: 'Upvotes',
      icon: '/assets/like-icon-1.svg',
      id: 'upvotes' // Reddit API field name
    },
    comments: {
      label: 'Comments',
      icon: '/assets/comment-icon-1.svg',
      id: 'comments' // Reddit API field name
    }
  };

  return platform === PLATFORMS.YOUTUBE ? youtubeColumns : redditColumns;
};

const FormatNumberWithPostFix = (num) => {
  if (!num && num !== 0) return '0';

  const numValue = typeof num === 'string' ? parseFloat(num) : num;

  if (numValue >= 1_000_000) {
    const millions = numValue / 1_000_000;
    return millions % 1 === 0 ? `${millions}M` : `${millions.toFixed(1)}M`;
  }

  if (numValue >= 1_000) {
    const thousands = numValue / 1_000;
    return thousands % 1 === 0 ? `${thousands}K` : `${thousands.toFixed(1)}K`;
  }

  return `${numValue}`;
};


export {
  BuildUserMessage,
  checkCreditAvailable,
  CustomScale,
  DecodeHtmlEntities,
  FilterExactMatch,
  FilterPhraseMatch,
  FormatFileSize,
  FormatNumber,
  FormatTime,
  FormatNumberWithSuffix,
  InverseCustomScale,
  ParseDuration,
  ParseDurationToMinutes,
  ValidateAIKey,
  SplitText,
  FormatRedditContent,
  GetColumnForThreadsMobileView,
  FormatNumberWithPostFix
};
