import axios from 'axios';

const fastApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_FAST_API_URL, 
});

fastApi.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default fastApi;