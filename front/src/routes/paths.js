// utils
import { _id, _postTitles } from 'src/_mock/assets';
import { paramCase } from 'src/utils/change-case';

// ----------------------------------------------------------------------

const MOCK_ID = _id;

const MOCK_TITLE = _postTitles[2];

const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
};


// ----------------------------------------------------------------------

export const paths = {
  comingSoon: '/coming-soon',
  maintenance: '/maintenance',
  pricing: '/pricing',
  payment: '/payment',
  faqs: '/faqs',
  page403: '/error/403',
  page404: '/error/404',
  page500: '/error/500',
  components: '/components',
  docs: 'https://docs.minimals.cc',
  changelog: 'https://docs.minimals.cc/changelog',
  zoneUI: 'https://mui.com/store/items/zone-landing-page/',
  minimalUI: 'https://mui.com/store/items/minimal-dashboard/',
  freeUI: 'https://mui.com/store/items/minimal-dashboard-free/',
  figma:
    'https://www.figma.com/file/hjxMnGUJCjY7pX8lQbS7kn/%5BPreview%5D-Minimal-Web.v5.4.0?type=design&node-id=0-1&mode=design&t=2fxnS70DuiTLGzND-0',
  // AUTH
  auth: {
    googleLoginCallBack: `${ROOTS.AUTH}/google-login-call-back`,
    jwt: {
      login: `${ROOTS.AUTH}/jwt/login`,
      register: `${ROOTS.AUTH}/jwt/register`,
      forgotPassword: `${ROOTS.AUTH}/jwt/forgot-password`,
      resetPassword: `${ROOTS.AUTH}/jwt/reset-password`,
    },

  },
  // DASHBOARD
  dashboard: {
    // root: ROOTS.DASHBOARD,
    root: `${ROOTS.DASHBOARD}/`,
    chat: `${ROOTS.DASHBOARD}/chatgpt`,
    kanban: `${ROOTS.DASHBOARD}/kanban`,
    general: {
      app: `${ROOTS.DASHBOARD}/app`,
      analytics: `${ROOTS.DASHBOARD}/analytics`,

    },
    user: {
      root: `${ROOTS.DASHBOARD}/user`,
      new: `${ROOTS.DASHBOARD}/user/new`,
      cards: `${ROOTS.DASHBOARD}/user/cards`,
      list: `${ROOTS.DASHBOARD}/user/list`,
      // profile: `${ROOTS.DASHBOARD}/user/profile`,
      account: `${ROOTS.DASHBOARD}/user/account`,
      edit: (id) => `${ROOTS.DASHBOARD}/user/${id}/edit`,
      demo: {
        edit: `${ROOTS.DASHBOARD}/user/${MOCK_ID}/edit`,
      },
    },
    product: {
      root: `${ROOTS.DASHBOARD}/threads`,
      new: `${ROOTS.DASHBOARD}/threads/new`,
      // details: (id) => `${ROOTS.DASHBOARD}/threads/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/threads/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/threads/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/threads/${MOCK_ID}/edit`,
      },
    },
    // job: {
    //   root: `${ROOTS.DASHBOARD}/campaigns`,
    //   new: `${ROOTS.DASHBOARD}/campaigns/new`,
    //   details: (id) => `${ROOTS.DASHBOARD}/campaigns/${id}`,
    //   edit: (id) => `${ROOTS.DASHBOARD}/campaigns/${id}/edit`,
    //   demo: {
    //     details: `${ROOTS.DASHBOARD}/campaigns/${MOCK_ID}`,
    //     edit: `${ROOTS.DASHBOARD}/campaigns/${MOCK_ID}/edit`,
    //   },
    // },
    post: {
      root: `${ROOTS.DASHBOARD}/prompts`,
      new: `${ROOTS.DASHBOARD}/prompts/new`,
      details: (id) => `${ROOTS.DASHBOARD}/prompts/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/prompts/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/prompts/${paramCase(MOCK_TITLE)}`,
        edit: `${ROOTS.DASHBOARD}/prompts/${paramCase(MOCK_TITLE)}/edit`,
      },
    },
    //  store: {
    //   root: `${ROOTS.DASHBOARD}/store`,
    //   new: `${ROOTS.DASHBOARD}/store/new`,
    //   details: (id) => `${ROOTS.DASHBOARD}/store/${id}`,
    //   edit: (id) => `${ROOTS.DASHBOARD}/store/${id}/edit`,
    //   demo: {
    //     details: `${ROOTS.DASHBOARD}/store/${paramCase(MOCK_TITLE)}`,
    //     edit: `${ROOTS.DASHBOARD}/store/${paramCase(MOCK_TITLE)}/edit`,
    //   },
    // },

    tour: {
      root: `${ROOTS.DASHBOARD}/projects`,
      new: `${ROOTS.DASHBOARD}/projects/new`,
      threads: (id) => `${ROOTS.DASHBOARD}/projects/${id}/threads`,
      edit: (id) => `${ROOTS.DASHBOARD}/projects/${id}/edit`,
      chatgpt: (id) => `${ROOTS.DASHBOARD}/projects/${id}/chatgpt`,
      store: {
        root: (id) =>`${ROOTS.DASHBOARD}/projects/${id}/store`,
        edit: (id) => `${ROOTS.DASHBOARD}/projects/store/${id}/edit`, 
        details: (id) => `${ROOTS.DASHBOARD}/projects/store/${id}`,
      },
      job: {
        root: (id) => `${ROOTS.DASHBOARD}/projects/${id}/campaigns`,
        edit: (id) => `${ROOTS.DASHBOARD}/projects/campaigns/${id}/edit`,
        new: (id) => `${ROOTS.DASHBOARD}/projects/${id}/campaigns/new`
      },

      demo: {
        threads: `${ROOTS.DASHBOARD}/projects/${MOCK_ID}/threads`,
        chatgpt: `${ROOTS.DASHBOARD}/projects/${MOCK_ID}/chatgpt`,
        store: `${ROOTS.DASHBOARD}/projects/${MOCK_ID}/store`
      },
    },
    userProfile: {
      root: `${ROOTS.DASHBOARD}/user-profile`,
      edit: (id) => {
        console.log('path id : ', id);
       return `${ROOTS.DASHBOARD}/user-profile/${id}/edit`
      }
    },
    demography: {
      root: `${ROOTS.DASHBOARD}/demography`
    },
    creditsHistory: {
      root: `${ROOTS.DASHBOARD}/credits-history`
    }
  }
};
