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
advocateRouter.get(
  "/analytics",
  auth,
  AdvocateController.getAnalyticsDashboard,
);
advocateRouter.get(
  "/analytics/commission-trend",
  auth,
  AdvocateController.getCommissionTrendLast30Days,
);
advocateRouter.get(
  "/volatility",
  auth,
  AdvocateController.getVolatilityByCityZone,
);

export default advocateRouter;
