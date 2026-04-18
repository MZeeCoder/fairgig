import { Server } from "socket.io";
import { config } from "../constants/config.js";

let io;
const frontendOrigin =
  config.NODE_ENV === "production"
    ? config.FRONTEND_URL_PRODUCTION
    : config.FRONTEND_URL || "http://localhost:3000";

export const initializeSocket = (httpServer) => {
  if (io) {
    return io;
  }

  io = new Server(httpServer, {
    cors: {
      origin: frontendOrigin,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("disconnect", (reason) => {
      console.log(`Socket disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io has not been initialized");
  }

  return io;
};
