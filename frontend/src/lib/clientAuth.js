"use client";

export const getAccessToken = () => {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem("accessToken");
};

export const getUserRole = () => {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem("userRole");
};

export const setClientAuth = ({ accessToken, userRole }) => {
  if (typeof window === "undefined") {
    return;
  }

  if (accessToken) {
    localStorage.setItem("accessToken", accessToken);
  }

  if (userRole) {
    localStorage.setItem("userRole", userRole);
  }
};

export const clearClientAuth = () => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem("accessToken");
  localStorage.removeItem("userRole");
};
