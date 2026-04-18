import GrievanceService from "./service.js";
import ApiResponse from "../../utils/apiResponse.js";
import { ApiError } from "../../utils/apiError.js";
import mongoose from "mongoose";

class GrievanceController {
  static async create(req, res, next) {
    try {
      const workerId = req.user?.userId;
      const grievance = await GrievanceService.create(
        req.validatedData,
        workerId,
      );

      return ApiResponse.success(
        res,
        "Grievance created successfully",
        201,
        grievance,
      );
    } catch (error) {
      return next(error);
    }
  }

  static async getByUserId(req, res, next) {
    try {
      const { userId } = req.params;
      const loggedInUserId = req.user?.userId;
      const role = req.user?.role;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Invalid user id");
      }

      if (role !== "admin" && loggedInUserId !== userId) {
        throw new ApiError(
          403,
          "You are not allowed to access these grievances",
        );
      }

      const grievances = await GrievanceService.getByWorkerId(userId);

      return ApiResponse.success(
        res,
        "Grievances fetched successfully",
        200,
        grievances,
      );
    } catch (error) {
      return next(error);
    }
  }
}

export default GrievanceController;
