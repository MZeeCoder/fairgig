import userRouter from "../modules/user/route.js";

const routes = (app) => {
  app.get("/", (req, res) => {
    res.status(200).json({ message: "Backend is running" });
  });

  app.use("/api/v1/users", userRouter);
};

export default routes;
