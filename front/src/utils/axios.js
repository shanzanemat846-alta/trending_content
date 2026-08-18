import axios from 'axios';
// config
import { HOST_API } from 'src/config-global';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: HOST_API });

axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong')
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async (args) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosInstance.get(url, { ...config });

  return res.data;
};

// ----------------------------------------------------------------------

export const endpoints = {
  chat: '/api/chat',
  kanban: '/api/kanban',

  auth: {
    user: '/api/auth/user',
    login: '/api/auth/login',
    googleLogin: '/api/auth/google-login',
    register: '/api/auth/register',
    verify: '/api/auth/verify',
  },
  user: {
    check: '/api/user/check',
    updateUser: '/api/user/'
  },

  // mail: {
  //   list: '/api/mail/list',
  //   details: '/api/mail/details',
  //   labels: '/api/mail/labels',
  // },
  post: {
    list: '/api/post/list',
    details: '/api/post/details',
    latest: '/api/post/latest',
    search: '/api/post/search',
  },
  product: {
    list: '/api/product/list',
    details: '/api/product/details',
    search: '/api/product/search',
  },
};
