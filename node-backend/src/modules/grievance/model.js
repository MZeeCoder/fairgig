import mongoose from "mongoose";

const grievanceSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId(),
    },
    worker_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Unfair Deactivation",
        "Commission Rate Change",
        "Incorrect Earnings Calculation",
        "Payment Delay",
        "Safety & Harassment",
        "App / Technical Issue",
        "Other",
      ],
    },
    platform: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["open", "escalated", "resolved"],
      default: "open",
    },
  },
  {
    timestamps: true,
  },
);

const Grievance = mongoose.model("Grievance", grievanceSchema);

export default Grievance;
