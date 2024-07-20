import axios from 'axios';
import axiosRetry from 'axios-retry';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

axiosRetry(api, {
  retries: 3,
  retryDelay: (retryCount) => {
    return retryCount * 1000;
  },
  retryCondition: (error) => {
    return error.response && error.response.status >= 500;
  },
});

export default api;
