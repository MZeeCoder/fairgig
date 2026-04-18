import User from "./model.js";
import { ApiError } from "../../utils/apiError.js";
import { generateAuthTokens } from "../../utils/jwt.js";

class UserService {
  static async signup(payload) {
    const existingUser = await User.findOne({ phone: payload.phone });

    if (existingUser) {
      throw new ApiError(409, "User with this phone already exists");
    }

    const user = await User.create({
      name: payload.name,
      email: payload.email,
      password: payload.password,
      role: payload.role,
      phone: payload.phone,
      city: payload.city,
      platforms: payload.platforms,
      verificationDocuments: payload.verificationDocuments,
    });

    const { accessToken, refreshToken } = generateAuthTokens({
      userId: user._id.toString(),
      role: user.role,
      phone: user.phone,
    });

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return {
      id: user._id,
      name: user.name,
      role: user.role,
      phone: user.phone,
      city: user.city,
      platforms: user.platforms,
      accountStatus: user.accountStatus,
      verificationDocuments: user.verificationDocuments,
      adminNotes: user.adminNotes,
      accessToken,
      refreshToken,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

export default UserService;
