import userRouter from "../modules/user/route.js";
import grievanceRouter from "../modules/grievance/route.js";
import verifierRouter from "../modules/verifier/route.js";
import advocateRouter from "../modules/advocate/route.js";

const routes = (app) => {
  app.get("/", (req, res) => {
    res.status(200).json({ message: "Backend is running" });
  });

  app.use("/api/v1/users", userRouter);
  app.use("/api/v1/grievances", grievanceRouter);
  app.use("/api/v1/verifier", verifierRouter);
  app.use("/api/v1/advocate", advocateRouter);
};

export default routes;
