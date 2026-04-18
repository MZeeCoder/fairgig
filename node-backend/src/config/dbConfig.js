import mongoose from "mongoose";
import { config } from "../constants/config.js";

const connectDb = async () => {
  if (!config.MONGO_URI) {
    throw new Error("MONGO_URI is missing");
  }
  await mongoose.connect(config.MONGO_URI);
  console.log("Mongo db is connected");
};

export default connectDb;
