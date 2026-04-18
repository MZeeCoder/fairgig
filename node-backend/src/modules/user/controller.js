import UserService from "./service.js";
import ApiResponse from "../../utils/apiResponse.js";

class UserController {
  static async signup(req, res, next) {
    try {
      const result = await UserService.signup(req.validatedData);
      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      return ApiResponse.success(res, "User signed up successfully", 201, {
        user: {
          id: result.id,
          name: result.name,
          role: result.role,
          phone: result.phone,
          city: result.city,
        },
        accessToken: result.accessToken,
      });
    } catch (error) {
      return next(error);
    }
  }
}

export default UserController;
