
const CHAT_GPT_ENDPOINTS = {
  CREATE_CHAT_COMPLETION: 'https://api.openai.com/v1/chat/completions'
};

const ENDPOINTS = {
  USER: {
    UPDATE_USER: '/:id',
    GET_USER: '/:id',
    UPDATE_MEDIA: '/update-media/:userId',
    MEDIA: '/media/:userId',
    DELETE_MEDIA: '/media/:userId'
  },
  YOUTUBE: {
    SYNC_YOUTUBE_VIDEOS: '/sync_youtube_videos/:campaignId'
  },
  CAMPAIGN: {
    SAVE_CAMPAIGN_AND_SYNC_THREADS: 'save-campaign-and-sync-threads'
  },
  THREAD: {
    THREAD_COMMENTS: '/thread-comments/:threadId',
    FETCH_AND_SAVE_CAPTIONS: '/fetch-and-save-captions/:threadId',
    FETCH_AND_SAVE_YOUTUBE_THREAD_CAPTIONS: '/fetch-and-save-youtube-threads-captions',
    FETCH_REDDIT_THREAD_DETAILS: '/fetch-reddit-thread-details',
    GET_REDDIT_DATA_COUNT: '/reddit-data-count/:projectId',
    GET_SAVE_THREADS: '/save-threads/:projectId',
    SUMMARIZE_THREADS: '/summarize-threads',
    DOWNLOAD_THREADS: '/export-threads'
  },
  CHATGPT: {
    CREATE_CONTENT: '/create-content'
  },
  PROJECT: {
    UPDATE_PROJECT: '/update-project/:projectId',
    GET_PROJECT: '/get-project/:projectId'
  },
  ADMIN: {
    USERS: '/users',
    USER: '/user/:userId',
    GET_ADMIN_DEFAULT_MODEL: '/admin-default-model',
    UPDATE_USER_SUBSCRIPTION: '/user-subscription/:userId'
  },
  SUBSCRIPTION: {
    USER_SUBSCRIPTION_PLAN: `/user-subscription-plan/:userId`,
    CHECKOUT_PAYMENT: '/checkout-payment',
    CREATE_CHECKOUT_CUSTOMER_AND_INSTRUMENT: '/create-checkout-customer-and-instrument',
    GET_CHECKOUT_CUSTOMER: '/checkout-customer',
    REMOVE_CARD: '/remove-card',
    CANCELED_SUBSCRIPTION: '/cancel-subscription/:subscriptionId',
    GET_CONTENT_COUNT: '/content-count/:userId',
    UPDATE_FREE_CREDIT_ACCESS: '/update-free-credit-access/:userId',
    UPDATE_PADDLE_SUBSCRIPTION: '/paddle-subscription/:userSubscriptionPlanId'
  },
  INVOICE: {
    GET_INVOICES: '/invoices/:userId',
    DOWNLOAD_INVOICE: '/download-invoice/:userId'
  },
  CREDIT_HISTORY: {
    GET_CREDIT_HISTORY: '/credit-history/:userId',
    GET_TOP_DEMOGRAPHICS: '/top-demographics',
    GET_CREDITS_HISTORY: '/credits-history',
  },
  MODELS: {
    OPEN_AI_MODELS: '/open-ai-models',
    SAVE_OPEN_AI_MODEL: '/open-ai-model',
    DELETE_OPEN_AI_MODEL: '/open-ai-model',
    UPDATE_OPEN_AI_MODEL: '/open-ai-model'
  }
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const DEFAULT_GPT_MODEL = 'gpt-4o';
const GPT_4_MODEL = 'gpt-4';

const COMMENTS_COUNT = 20;

const CAPTIONS_CHARACTERS_LIMIT = 5000;  // For 5,000 characters: Tokens ≈ 5,000 ÷ 4 = 1,250 tokens

const COMMENTS_CHARACTERS_LIMIT = 1000;

const YOUTUBE_ENDPOINTS = {
  YOUTUBE_SEARCH: 'https://www.googleapis.com/youtube/v3/search',
  YOUTUBE_VIDEOS: 'https://www.googleapis.com/youtube/v3/videos',
  COMMENT_THREADS: 'https://www.googleapis.com/youtube/v3/commentThreads'
};

const YOUTUBE_VIDEOS_LIMIT = 50;
const MAX_YOUTUBE_COMMENT_THREADS = 100;

const PLATFORMS = {
  REDDIT: 'reddit',
  TWITTER: 'twitter',
  YOUTUBE: 'youtube',
  MULTIPLE_PLATFORMS: 'multiplePlatforms'
}

const REDDIT_ENDPOINTS = {
  BASE_REDDIT_URL: 'https://oauth.reddit.com'
};

const CAMPAIGN_MODE = {
  SUB_REDDIT: 'Sub-reddit',
  KEYWORDS: 'Keyword'
};

const MATCH_TYPE = {
  EXACT: 'exact',
  PHRASE: 'phrase'
};

const COMMENTS_LIMIT = 20;

const PRICE_PER_TOKEN = 2;

const JWT_TOKEN_EXPIRY_DATE = '365d';

const USER_STATUS = {
  ALL: 'all',
  ACCEPTED: 'accepted',
  INVITED: 'invited',
  PENDING: 'pending',
  DISABLED: 'disabled'
};

const COSTING_TYPES = {
  GPT: 'GPT',
  MULTI_PLATFORM_CAMPAIGN: 'MULTI_PLATFORM_CAMPAIGN',
  YOUTUBE_CAMPAIGN: 'YOUTUBE_CAMPAIGN',
  REDDIT_CAMPAIGN: 'REDDIT_CAMPAIGN',
  SAVE_CONTENT: 'SAVE_CONTENT',
  GPT_SUMMARY: "SUMMARIZE"
};

const GPT_COSTING = {
  COST_PER_TOKEN: 0.05
};

const COSTING_AMOUNT = {
  MULTI_PLATFORM_CAMPAIGN: 1,
  YOUTUBE_CAMPAIGN: 0.5,
  REDDIT_CAMPAIGN: 0.5,
  SAVE_CONTENT: 1
};

const ADDITIONAL_COSTING_AMOUNT = {
  MULTI_PLATFORM_CAMPAIGN: 1.5,
  YOUTUBE_CAMPAIGN: 1.5,
  REDDIT_CAMPAIGN: 1.5,
  SAVE_CONTENT: 1.5
};

const SUBSCRIPTION_PLANS = {
  FREE: 'free',
  STARTER: "starter",
  ADVANCED: "advanced"
};

const INVOICE_DOWNLOAD_SHEET = [{
  header: 'Status', key: 'status', width: 25
}, {
  header: 'Date', key: 'date', width: 25
}, {
  header: 'Amount', key: 'amount', width: 25
}, {
  header: 'Currency', key: 'currency', width: 25
},  {
  header: 'Subscription Plan', key: 'subscriptionPlan', width: 25
}, {
  header: 'Subscription Type', key: 'subscriptionType', width: 25
},
{ header: 'Payment Type', key: 'paymentType', width: 20 }
];

const PAYMENT_TYPE = {
  PURCHASE_TOKENS: "purchased_tokens",
  SUBSCRIPTION: "subscription"
};

const CREDIT_TYPE_LABELS = {
  GPT: "GPT",
  MULTI_PLATFORM_CAMPAIGN: "Multi Platform",
  YOUTUBE_CAMPAIGN: "YouTube",
  REDDIT_CAMPAIGN: "Reddit",
  SAVE_CONTENT: "Saved Content"
};

const PLAN_PRICING = {
  FREE_MONTHLY: 0,
  FREE_YEARLY: 0,
  STARTER_MONTHLY: 49,
  STARTER_YEARLY: 399,
  ADVANCED_MONTHLY: 99,
  ADVANCED_YEARLY: 999
};

const SUBSCRIPTION_TYPE = {
  MONTHLY: "monthly",
  YEARLY: "yearly"
}

const PLANS_AND_CREDITS = {
  free: 100,
  starter: {
    monthlyEarnedCredits: 1000,
    monthlyFreeCredits: 1500,
    yearlyEarnedCredits: 10000,
    yearlyFreeCredits: 1500,
  },
  advanced: {
    monthlyEarnedCredits: 5000,
    monthlyFreeCredits: 5000,
    yearlyEarnedCredits: 5000,
    yearlyFreeCredits: 50000,
  }
}

const STATIC_PREDEFINED_PROMPT = `
You are a summarization assistant. The user will provide multiple discussion threads. 
Return the result strictly in this JSON object format:

{
  "summary": "Core Idea\\n...\\n\\nKey Takeaways\\n...\\n\\nContrasting Opinions\\n...\\n\\nPopular Phrases / Quotes\\n...",
  "faqs": [
    "Question 1?",
    "Question 2?",
    "Question 3?"
  ],
  "threads": [
    "¹ Thread Title One",
    "² Thread Title Two",
    "³ Thread Title Three"
  ]
}

Rules for each field:

- "summary": Must contain ONLY these four labeled sections:
  1. Core Idea (1–2 sentences about the central topic)
  2. Key Takeaways (bullet points, each ending with a superscript number matching a thread)
  3. Contrasting Opinions (different viewpoints, with superscript references)
  4. Popular Phrases / Quotes (short direct quotes, with superscript references)

- "faqs": Must contain ONLY 3–4 frequently asked questions, no answers. Do NOT include FAQs inside summary.

- "threads": Must contain ONLY thread references, each prefixed with a superscript number that matches the numbers used in summary.

Formatting Rules:
- All keys and strings must use double quotes.
- Do not include null, undefined, or trailing commas.
- Do not include any other sections beyond summary, faqs, and threads.
- Do not return markdown, explanations, or extra labels (e.g., "assistantResponse:").
- Return a valid JSON object, not a string.
`;

// const STATIC_PREDEFINED_PROMPT = `You are a summarization assistant. The user will provide multiple discussion threads. Your task is to return the result in the following JavaScript object structure, and follow the format exactly.
// {
//   "summary": "Include all sections here: Core Idea\\n...\\n\\nKey Takeaways\\n...\\n\\nContrasting Opinions\\n...\\n\\nPopular Phrases / Quotes\\n...",
//   "faqs": [
//     "faq question 1?",
//     "faq question 2?",
//     "faq question 3?"
//   ],
//   "threads": [
//     " ¹ Thread Title One",
//     " ² Thread Title Two",
//     " 3 Thread Title Two"
//     ...
//   ]
// }

// "summary"
// Section Descriptions:

// Core Idea  
// Briefly describe the central topic or focus of the discussions in 1–2 sentences.

// Key Takeaways  
// Summarize the most important insights mentioned across the threads in bullet points. Each must include a superscript number (¹, ², ³, ...) that links to a thread title.

// Contrasting Opinions  
// Highlight different viewpoints or debates from the threads. Each opinion must be attributed using a superscript number.

// Popular Phrases / Quotes  
// Extract short, engaging quotes or phrases. Include superscript references.

// FAQs  
// Include 3–4 frequently asked questions based on the discussions (only questions, no answers).

// Thread References  
// ¹ [Thread Title One]
// ² [Thread Title Two]
// ³ [Thread Title Three]
// …

// Notes:
// All superscript numbers (e.g., ¹, ², ³) in the summary must clearly match the thread titles listed below.

// Instructions:
// - Return only a valid JSON object — no markdown, no explanation, no code formatting, and no comments.
// - All keys and strings must use **double quotes**.
// - Do not include any outer quotes, triple backticks , or non-JSON content.
// - Use \\n in the summary where line breaks are needed.
// - Do not return the data as a string — return the actual object.
// - Do not include null, undefined, or trailing commas.
// `;

const WEIGHTS = {
  keywordMatch: {
    level0: 1.0,    // Exact match (highest)
    level1: 0.8,    // Level 1 semantic match
    level2: 0.5,    // Level 2 semantic match
    level3: 0.3     // Level 3 semantic match (lowest)
  },
  upvotes: 0.5,    // Example weight - adjust based on your needs
  comments: 0.3,   // Example weight
  recency: 0.0001  // Small value since ageInSeconds is large
};

const YT_WEIGHTS = {
  keywordMatch: {
    level0: 1.0,    // Exact match (highest)
    level1: 0.8,    // Level 1 semantic match
    level2: 0.5,    // Level 2 semantic match
    level3: 0.3     // Level 3 semantic match (lowest)
  },
  views: 0.8,
  likes: 0.5,    // Example weight - adjust based on your needs
  comments: 0.3,   // Example weight
  recency: 0.0001  // Small value since ageInSeconds is large
}

const DEFAULT_ADMIN_KEY = {
  BASIC: 'basic',
  ADVANCED: 'advanced'
};

const THRESHOLD = 55;

const MAX_THREADS = 200;

module.exports = {
  ADDITIONAL_COSTING_AMOUNT,
  CAMPAIGN_MODE,
  CAPTIONS_CHARACTERS_LIMIT,
  COMMENTS_CHARACTERS_LIMIT,
  COMMENTS_COUNT,
  COMMENTS_LIMIT,
  CHAT_GPT_ENDPOINTS,
  COSTING_AMOUNT,
  COSTING_TYPES,
  DEFAULT_GPT_MODEL,
  DEFAULT_ADMIN_KEY,
  SUBSCRIPTION_PLANS,
  ENDPOINTS,
  GPT_COSTING,
  INVOICE_DOWNLOAD_SHEET,
  JWT_TOKEN_EXPIRY_DATE,
  MATCH_TYPE,
  MAX_FILE_SIZE,
  REDDIT_ENDPOINTS,
  PLATFORMS,
  PLAN_PRICING,
  PLANS_AND_CREDITS,
  MAX_YOUTUBE_COMMENT_THREADS,
  USER_STATUS,
  YOUTUBE_ENDPOINTS,
  YOUTUBE_VIDEOS_LIMIT,
  PRICE_PER_TOKEN,
  CREDIT_TYPE_LABELS,
  GPT_4_MODEL,
  PAYMENT_TYPE,
  SUBSCRIPTION_TYPE,
  STATIC_PREDEFINED_PROMPT,
  WEIGHTS,
  YT_WEIGHTS,
  THRESHOLD,
  MAX_THREADS
};
