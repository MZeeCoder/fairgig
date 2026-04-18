import express from "express";
import { createServer } from "http";
import { config, configInit } from "./constants/config.js";
import routes from "./routes/index.js";
import connectDb from "./config/dbConfig.js";
import { globalError } from "./utils/apiError.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import { initializeSocket } from "./socket/index.js";

const app = express();
const httpServer = createServer(app);
const frontendOrigin =
  config.NODE_ENV === "production"
    ? config.FRONTEND_URL_PRODUCTION
    : config.FRONTEND_URL || "http://localhost:3000";

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use(
  cors({
    origin: frontendOrigin,
    credentials: true,
  }),
);

app.use(cookieParser());

routes(app);

app.use(globalError);

const PORT = config.PORT || 5000;

const startServer = async () => {
  try {
    await configInit();
    await connectDb();
    const io = initializeSocket(httpServer);
    app.set("io", io);

    httpServer.listen(PORT,"0.0.0.0", () => {
      console.log(`Server is connected http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to the database:", error);
    process.exit(1);
  }
};

startServer();
