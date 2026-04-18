import { Router } from "express";
import UserController from "./controller.js";
import validate from "../../middlewares/validate.js";
import { signupSchema } from "./validation.js";
import { uploadDocuments } from "../../middlewares/cloudinaryUpload.js";

const userRouter = Router();

userRouter.post(
  "/signup",
  uploadDocuments,
  validate(signupSchema),
  UserController.signup,
);

export default userRouter;
