import ApiResponse from "./apiResponse.js";

export class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const globalError = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  const details = err.details || null;

  return ApiResponse.error(res, message, statusCode, details);
};
