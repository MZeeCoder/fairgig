import axios from "axios";
import { getAccessToken } from "@/lib/clientAuth";

const isProduction = process.env.NODE_ENV === "production";
const productionFastApiUrl =
  process.env.NEXT_PUBLIC_FAST_API_URL_PRODUCTION ||
  "https://independent-acceptance-production-ac94.up.railway.app";

const fastApi = axios.create({
  baseURL: isProduction
    ? productionFastApiUrl
    : process.env.NEXT_PUBLIC_FAST_API_URL,
});

fastApi.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

fastApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        // Clear expired token and redirect to login
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default fastApi;
