import User from "./model.js";
import bcrypt from "bcryptjs";
import { ApiError } from "../../utils/apiError.js";
import { generateAuthTokens } from "../../utils/jwt.js";

class UserService {
  static async signup(payload) {
    const email = payload.email;
    const phone = payload.phone;

    const existingUser = await User.findOne({
      $or: [{ phone }, { email }],
    });

    if (existingUser) {
      throw new ApiError(409, "User with this phone or email already exists");
    }

    const user = await User.create({
      name: payload.name,
      email,
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
    await user.save();

    return {
      id: user._id,
      name: user.name,
      role: user.role,
      phone: user.phone,
      city: user.city,
      platforms: user.platforms,
      accessToken,
      refreshToken,
    };
  }

  static async login(payload) {
    const email = payload.email.toLowerCase();
    const password = payload.password;

    const user = await User.findOne({ email });

    if (!user) {
      throw new ApiError(401, "Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid email or password");
    }

    const { accessToken, refreshToken } = generateAuthTokens({
      userId: user._id.toString(),
      role: user.role,
      phone: user.phone,
    });

    user.refreshToken = refreshToken;
    await user.save();

    return {
      id: user._id,
      name: user.name,
      role: user.role,
      phone: user.phone,
      city: user.city,
      platforms: user.platforms,
      accessToken,
      refreshToken,
    };
  }
}

export default UserService;
