import axios from 'axios';

import { HOST_API } from 'src/config-global';

const STORAGE_KEY = 'accessToken';

const service = axios.create({
  baseURL: HOST_API
});

const AxiosBaseUrl = () => service;

service.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEY);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

service.interceptors.response.use(
  (response) => response,
  (error) =>  Promise.reject(error)
);

export {
  AxiosBaseUrl
};
