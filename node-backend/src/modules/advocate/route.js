import { Router } from "express";
import auth from "../../middlewares/auth.js";
import AdvocateController from "./controller.js";

const advocateRouter = Router();

advocateRouter.get(
  "/grievances/open",
  auth,
  AdvocateController.getOpenGrievances,
);
advocateRouter.get(
  "/grievances/:complaint_id",
  auth,
  AdvocateController.getComplaintById,
);
advocateRouter.patch(
  "/grievances/:grievance_id/escalate/:advocate_id",
  auth,
  AdvocateController.escalateOpenGrievance,
);

export default advocateRouter;
