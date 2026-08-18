const REDDIT_ENDPOINTS = {
  SUB_REDDIT_LIST: 'https://oauth.reddit.com/r',
  SUB_REDDIT_SEARCH: 'https://oauth.reddit.com/search.json',
  AUTH: 'https://www.reddit.com/api/v1/access_token',
  BASE_URL: 'https://oauth.reddit.com',
  REDDIT_SEARCH: 'https://oauth.reddit.com/api/search_reddit_names.json'
};

const ENDPOINTS = {
  USER: {
    UPDATE_USER: (id) => `/${id}`,
    UPDATE_MEDIA: (id) => `/update-media/${id}`,
    GET_USER: (id) => `/${id}`,
    GET_MEDIA: (id) => `/media/${id}`,
    DELETE_MEDIA: (id) => `/media/${id}`,
  },
  YOUTUBE: {
    SYNC_YOUTUBE_VIDEOS: (id) => `/sync_youtube_videos/${id}`
  },
  CAMPAIGN: {
    SAVE_CAMPAIGN_AND_SYNC_THREADS: 'save-campaign-and-sync-threads',
    SUB_REDDIT_SEARCH: 'subreddit-search'
  },
  THREAD: {
    THREAD_COMMENTS: (threadId) => `thread-comments/${threadId}`,
    CAPTIONS: (threadId) => `fetch-and-save-captions/${threadId}`,
    FETCH_AND_SAVE_YOUTUBE_THREAD_CAPTIONS: 'fetch-and-save-youtube-threads-captions',
    FETCH_REDDIT_THREAD_DETAILS: 'fetch-reddit-thread-details',
    GET_REDDIT_DATA_COUNT: (projectId) => `reddit-data-count/${projectId}`,
    GET_SAVE_THREADS: (projectId) => `save-threads/${projectId}`,
    SUMMARIZE_THREADS: 'summarize-threads',
    DOWNLOAD_THREADS: 'export-threads'
  },
  CHATGPT: {
    CREATE_CONTENT: `create-content`
  },
  PROJECT: {
    UPDATE_PROJECT: (id) => `update-project/${id}`,
    GET_PROJECT: (id) => `get-project/${id}`,
  },
  ADMIN: {
    USERS: `users`,
    USER: (id) => `user/${id}`,
    GET_ADMIN_DEFAULT_KEY: '/admin-default-model',
    UPDATE_USER_SUBSCRIPTION: (userId) => `/user-subscription/${userId}`
  },
  AUTH: {
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password'
  },
  SUBSCRIPTION: {
    USER_SUBSCRIPTION_PLAN: (id) => `/user-subscription-plan/${id}`,
    CHECKOUT_PAYMENT: '/checkout-payment',
    CREATE_CHECKOUT_CUSTOMER_AND_INSTRUMENT: '/create-checkout-customer-and-instrument',
    GET_CHECKOUT_CUSTOMER: '/checkout-customer',
    REMOVE_CARD: '/remove-card',
    CANCELED_SUBSCRIPTION: (id) => `/cancel-subscription/${id}`,
    GET_CONTENT_COUNT: (id) => `/content-count/${id}`,
    UPDATE_FREE_CREDIT_ACCESS: (id) => `/update-free-credit-access/${id}`,
    UPDATE_PADDLE_SUBSCRIPTION: (id) => `/paddle-subscription/${id}`,
  },
  INVOICE: {
    GET_INVOICES: (userId) => `/invoices/${userId}`,
    DOWNLOAD_INVOICE: (userId) =>  `/download-invoice/${userId}`
  },
  CREDIT_HISTORY: {
    GET_CREDIT_HISTORY: (userId) => `/credit-history/${userId}`,
    GET_TOP_DEMOGRAPHICS: '/top-demographics',
    GET_CREDITS_HISTORY: "credits-history",
  },
  MODELS: {
    OPEN_AI_MODELS: '/open-ai-models',
    SAVE_OPEN_AI_MODEL: '/open-ai-model',
    DELETE_OPEN_AI_MODEL: '/open-ai-model',
    UPDATE_OPEN_AI_MODEL: '/open-ai-model'
  }
};

const MAX_CONTENT_IMAGES_COUNT = 10;

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const STORAGE_KEY = 'accessToken';

const PAID_GPT_MODELS = ['gpt-4'];

const VIDEO_DURATION = 22;

const CHAT_GPT_ENDPOINTS = {
  GET_MODELS: 'https://api.openai.com/v1/chat/completions',
  GET_ALL_MODELS: 'https://api.openai.com/v1/models'
};

const PLATFORMS = {
  REDDIT: 'reddit',
  TWITTER: 'twitter',
  YOUTUBE: 'youtube',
  MULTIPLE_PLATFORMS: 'multiplePlatforms'
};

const CAMPAIGN_MODE = {
  SUB_REDDIT: 'Sub-reddit',
  KEYWORD: 'Keyword'
};

const DEFAULT_YOUTUBE_CAMPAIGN_CRITERIA = {
  VIEWS: {
    MIN_VIEWS: 1000,
    MAX_VIEWS: 10000000, // if increase the range then also increase the step size to 
    STEP_SIZE: 10000
  },
  COMMENTS: {
    MIN_COMMENTS: 1,
    MAX_COMMENTS: 1000000, // if increase the range then also increase the step size to 
    STEP_SIZE: 1000
  },
  LIKES: {
    MIN_LIKES: 1,
    MAX_LIKES: 1000000, // if increase the range then also increase the step size to 
    STEP_SIZE: 1000
  }
};

const DEFAULT_REDDIT_CAMPAIGN_CRITERIA = {
  THREADS: {
    MIN_THREADS: 0,
    MAX_THREADS: 300,
    STEP_SIZE: 1
  },
  UP_VOTES: {
    MIN_UP_VOTES: 0,
    MAX_UP_VOTES: 100,
    STEP_SIZE: 1
  },
  COMMENTS: {
    MIN_COMMENTS: 0,
    MAX_COMMENTS: 100,
    STEP_SIZE: 1
  },
};

const SORTING_COLUMNS_REDDIT = ['Comments', 'Upvotes'];
const SORTING_COLUMNS_YOUTUBE = ['Comments', 'Views', 'Likes']

// const THREAD_COMMENTS_HEADER = [
//   { id: 'author', label: 'Author',  width: 20 },
//   { id: 'comment', label: 'Comment', width: 30 },
//   { id: 'likeCount', label: 'Likes',  width: 20 },
//   { id: 'publishAt', label: 'Publish At',  width: 10 },
// ];

// const THREAD_CAPTIONS_HEADER = [
//   { id: 'duration', label: 'Duration',  width: 20,  minWidth: 20 },
//   { id: 'Captions', label: 'Captions' }
// ];


const THREAD_COMMENTS_HEADER = [
  { id: 'author', label: 'Author' },
  { id: 'comment', label: 'Comment', width: 40, minWidth: 40},
  { id: 'likeCount', label: 'Likes' },
  { id: 'publishAt', label: 'Publish At' },
];

const THREAD_CAPTIONS_HEADER = [
  { id: 'duration', label: 'Duration' },
  { id: 'Captions', label: 'Captions' }
];

const MAX_LENGTH = 11;

const MAX_THREADS = 600;

const LOADING_SCREEN_STYLES = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  zIndex: 9999
};

const USER_STATUS = {
  ALL: 'all',
  ACCEPTED: 'accepted',
  INVITED: 'invited',
  PENDING: 'pending',
  DISABLED: 'disabled'
};

const STATUSES = [
  { label: "Show All", value: "all" },
  { label: "Accepted", value: "accepted" },
  { label: "Active", value: "active" },
  { label: "Invited", value: "invited" },
  { label: "Pending", value: "pending" },
  { label: "Disabled", value: "disabled" }
];

const USER_TABLE_HEADER = [
  // { id: 'checkBox', label: '' },
  { id: 'name', label: 'Name' },
  { id: 'email', label: 'Email', width: 150 },
  { id: 'status', label: 'Status', width: 100 },
  { id: 'subscription', label: 'Subscription', width: 100 },
  { id: 'totalAITokenConsumed', label: 'AI Token Consumption', width: 100 },
  { id: 'createdAt', label: 'SignUpDate', width: 180 },
  { id: 'free_credit_access', label: 'Free Credits', width: 180 },
  { id: 'invoice', label: 'Invoices', width: 100 },
  { id: 'demographics', label: 'Demographics', width: 100 },
  { id: 'actions', label:'Actions', width: 88 },
];

const USERS_ROLE = {
  ADMIN: 'admin',
  USER: 'user'
}

const SUBSCRIPTION_PLANS = {
  FREE: 'free',
  STARTER: "starter",
  ADVANCED: "advanced"
};

const COSTING_AMOUNT = {
  MULTI_PLATFORM_CAMPAIGN: 1,
  YOUTUBE_CAMPAIGN: 0.5,
  REDDIT_CAMPAIGN: 0.5,
  SAVE_CONTENT: 1
};

const COSTING_TYPES = {
  GPT: 'GPT',
  MULTI_PLATFORM_CAMPAIGN: 'MULTI_PLATFORM_CAMPAIGN',
  YOUTUBE_CAMPAIGN: 'YOUTUBE_CAMPAIGN',
  REDDIT_CAMPAIGN: 'REDDIT_CAMPAIGN',
  SAVE_CONTENT: 'SAVE_CONTENT',
};

const SUBSCRIPTION_STATUS = {
  ACTIVE: "active",
  PENDING: "pending",
  FAILED: "failed",
  EXPIRED: "expired",
  CANCELED: "canceled",
  CARD_MISSING: "cardMissing",
  SUSPENDED: "suspended",
  DELETED: "deleted"
};

const SUBSCRIPTION_PRICE_IDS = {
  STARTER_YEARLY: process.env.NEXT_PUBLIC_STARTER_YEARLY_PRICE_ID,
  STARTER_MONTHLY: process.env.NEXT_PUBLIC_STARTER_MONTHLY_PRICE_ID,
  ADVANCED_YEARLY: process.env.NEXT_PUBLIC_ADVANCED_YEARLY_PRICE_ID,
  ADVANCED_MONTHLY: process.env.NEXT_PUBLIC_ADVANCED_MONTHLY_PRICE_ID,
  PURCHASED_TOKEN: process.env.NEXT_PUBLIC_PURCHASED_TOKEN_PRICE_ID,
};

const PLAN_PRICING = {
  FREE_MONTHLY: 0,
  FREE_YEARLY: 0,
  STARTER_MONTHLY: 49,
  STARTER_YEARLY: 399,
  ADVANCED_MONTHLY: 99,
  ADVANCED_YEARLY: 999
};

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

const PRICE_PER_TOKEN = 2;

const SUBSCRIPTION_TYPE = {
  MONTHLY: "monthly",
  YEARLY: "yearly"
}

const DEFAULT_GPT_MODEL = 'gpt-4o';

module.exports = {
  CAMPAIGN_MODE,
  CHAT_GPT_ENDPOINTS,
  COSTING_AMOUNT,
  COSTING_TYPES,
  DEFAULT_REDDIT_CAMPAIGN_CRITERIA,
  DEFAULT_YOUTUBE_CAMPAIGN_CRITERIA,
  ENDPOINTS,
  LOADING_SCREEN_STYLES,
  MAX_CONTENT_IMAGES_COUNT,
  MAX_FILE_SIZE,
  MAX_LENGTH,
  MAX_THREADS,
  PAID_GPT_MODELS,
  PLATFORMS,
  REDDIT_ENDPOINTS,
  STORAGE_KEY,
  SORTING_COLUMNS_REDDIT,
  SORTING_COLUMNS_YOUTUBE,
  SUBSCRIPTION_PLANS,
  SUBSCRIPTION_STATUS,
  THREAD_COMMENTS_HEADER,
  THREAD_CAPTIONS_HEADER,
  VIDEO_DURATION,
  USERS_ROLE,
  USER_STATUS,
  USER_TABLE_HEADER,
  STATUSES,
  SUBSCRIPTION_TYPE,
  SUBSCRIPTION_PRICE_IDS,
  PLAN_PRICING,
  PLANS_AND_CREDITS,
  PRICE_PER_TOKEN,
  DEFAULT_GPT_MODEL
};
