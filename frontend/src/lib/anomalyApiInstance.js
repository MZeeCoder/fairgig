import axios from "axios";
import { getAccessToken } from "@/lib/clientAuth";

const isProduction = process.env.NODE_ENV === "production";
const productionAnomalyApiUrl =
  process.env.NEXT_PUBLIC_ANOMALY_API_URL_PRODUCTION 

const anomalyApi = axios.create({
  baseURL: isProduction
    ? productionAnomalyApiUrl
    : process.env.NEXT_PUBLIC_ANOMALY_API_URL 
});

anomalyApi.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

anomalyApi.interceptors.response.use(
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

export default anomalyApi;
