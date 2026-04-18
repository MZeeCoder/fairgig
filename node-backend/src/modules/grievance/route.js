import { Router } from "express";
import GrievanceController from "./controller.js";
import auth from "../../middlewares/auth.js";
import validate from "../../middlewares/validate.js";
import { createGrievanceSchema } from "./validation.js";

const grievanceRouter = Router();

grievanceRouter.post(
  "/",
  auth,
  validate(createGrievanceSchema),
  GrievanceController.create,
);

grievanceRouter.get("/user/:userId", auth, GrievanceController.getByUserId);

export default grievanceRouter;
