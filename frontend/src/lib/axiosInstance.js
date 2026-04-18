import axios from "axios";
import { clearClientAuth, getAccessToken } from "@/lib/clientAuth";

const isProduction = process.env.NODE_ENV === "production";
const productionApiUrl =
  process.env.NEXT_PUBLIC_API_URL_PRODUCTION ||
  "https://stellar-renewal-production-31b1.up.railway.app";

const normalizeApiBaseUrl = (rawUrl) => {
  const fallback = "http://localhost:5000";
  const base = (rawUrl || fallback).replace(/\/+$/, "");

  if (base.endsWith("/api/v1")) {
    return base;
  }

  if (base.endsWith("/api")) {
    return `${base}/v1`;
  }

  return `${base}/api/v1`;
};

const api = axios.create({
  baseURL: normalizeApiBaseUrl(
    isProduction ? productionApiUrl : process.env.NEXT_PUBLIC_API_URL,
  ),
  withCredentials: true,
});

// request interceptor
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  },
);

// unauthorized errors globally
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      console.log("Unauthorized! Kicking user back to login...");
      if (typeof window !== "undefined") {
        clearClientAuth();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
