import jwt from "jsonwebtoken";
import { config } from "../constants/config.js";

const signToken = (payload, expiresIn) => {
  if (!config.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing");
  }

  return jwt.sign(payload, config.JWT_SECRET, { expiresIn });
};

export const generateAccessToken = (payload) => {
  return signToken(payload, "15m");
};

export const generateRefreshToken = (payload) => {
  return signToken(payload, "30d");
};

export const generateAuthTokens = (payload) => {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return {
    accessToken,
    refreshToken,
  };
};
