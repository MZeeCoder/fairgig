import axios from "axios";

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
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export default fastApi;
