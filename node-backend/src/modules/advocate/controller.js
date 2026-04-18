import AdvocateService from "./service.js";
import ApiResponse from "../../utils/apiResponse.js";
import { ApiError } from "../../utils/apiError.js";
import {
  escalateGrievanceParamSchema,
  complaintIdParamSchema,
  openGrievancesQuerySchema,
} from "./validation.js";

class AdvocateController {
  static async getOpenGrievances(req, res, next) {
    try {
      const role = req.user?.role;

      if (role !== "advocate" && role !== "admin") {
        throw new ApiError(
          403,
          "Only advocate or admin can access open grievances",
        );
      }

      const queryValidation = openGrievancesQuerySchema.safeParse(req.query);

      if (!queryValidation.success) {
        throw new ApiError(
          400,
          "Invalid query parameters",
          queryValidation.error.flatten(),
        );
      }

      const grievances = await AdvocateService.getOpenGrievances(
        queryValidation.data,
      );

      return ApiResponse.success(
        res,
        "Open grievances fetched successfully",
        200,
        grievances,
      );
    } catch (error) {
      return next(error);
    }
  }

  static async getComplaintById(req, res, next) {
    try {
      const role = req.user?.role;

      if (role !== "advocate" && role !== "admin") {
        throw new ApiError(
          403,
          "Only advocate or admin can access complaint details",
        );
      }

      const paramsValidation = complaintIdParamSchema.safeParse(req.params);

      if (!paramsValidation.success) {
        throw new ApiError(
          400,
          "Invalid complaint id",
          paramsValidation.error.flatten(),
        );
      }

      const { complaint_id: complaintId } = paramsValidation.data;
      const complaint = await AdvocateService.getComplaintById(complaintId);

      if (!complaint) {
        throw new ApiError(404, "Complaint not found");
      }

      return ApiResponse.success(
        res,
        "Complaint details fetched successfully",
        200,
        complaint,
      );
    } catch (error) {
      return next(error);
    }
  }

  static async escalateOpenGrievance(req, res, next) {
    try {
      const role = req.user?.role;
      const loggedInUserId = req.user?.userId;

      if (role !== "advocate" && role !== "admin") {
        throw new ApiError(
          403,
          "Only advocate or admin can escalate grievances",
        );
      }

      const paramsValidation = escalateGrievanceParamSchema.safeParse(
        req.params,
      );

      if (!paramsValidation.success) {
        throw new ApiError(
          400,
          "Invalid route parameters",
          paramsValidation.error.flatten(),
        );
      }

      const { advocate_id: advocateId, grievance_id: grievanceId } =
        paramsValidation.data;

      if (role === "advocate" && loggedInUserId !== advocateId) {
        throw new ApiError(
          403,
          "You are not allowed to escalate on behalf of another advocate",
        );
      }

      const escalationResult = await AdvocateService.escalateOpenGrievance({
        advocateId,
        grievanceId,
      });

      if (escalationResult.error === "ADVOCATE_NOT_FOUND") {
        throw new ApiError(404, "Advocate not found");
      }

      if (escalationResult.error === "GRIEVANCE_NOT_FOUND") {
        throw new ApiError(404, "Grievance not found");
      }

      if (escalationResult.error === "GRIEVANCE_NOT_OPEN") {
        throw new ApiError(400, "Only open grievances can be escalated");
      }

      return ApiResponse.success(
        res,
        "Grievance escalated successfully",
        200,
        escalationResult,
      );
    } catch (error) {
      return next(error);
    }
  }
}

export default AdvocateController;
