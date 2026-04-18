import GrievanceService from "./service.js";
import ApiResponse from "../../utils/apiResponse.js";

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
}

export default GrievanceController;
