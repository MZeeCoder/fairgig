import UserService from "./service.js";
import ApiResponse from "../../utils/apiResponse.js";
import { REFRESH_TOKEN_COOKIE_AGE } from "../../constants/config.js";

class UserController {
  static async signup(req, res, next) {
    try {
      const result = await UserService.signup(req.validatedData);
      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: REFRESH_TOKEN_COOKIE_AGE,
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

  static async login(req, res, next) {
    const result = await UserService.login(req.validatedData);
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: REFRESH_TOKEN_COOKIE_AGE,
    });

    return ApiResponse.success(res, "User login successfully", 201, {
      user: {
        id: result.id,
        name: result.name,
        role: result.role,
        phone: result.phone,
        city: result.city,
      },
      accessToken: result.accessToken,
    });
  }
}

export default UserController;
