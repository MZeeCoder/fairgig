import jwt from "jsonwebtoken";
import { config } from "../constants/config.js";
import { ApiError } from "../utils/apiError.js";

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new ApiError(401, "Authorization token is required"));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (error) {
    return next(new ApiError(401, "Invalid or expired token"));
  }
};

export default auth;
