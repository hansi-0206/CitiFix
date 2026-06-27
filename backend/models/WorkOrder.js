import mongoose from "mongoose";

const workOrderSchema = new mongoose.Schema(
  {
    issueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Issue",
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      required: true,
      enum: ["Low", "Medium", "High", "Critical"],
    },
    assignedDepartment: {
      type: String,
      required: true,
    },
    recommendation: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "Pending",
      enum: ["Pending", "In Progress", "Completed"],
    },
  },
  {
    timestamps: true,
  }
);

const WorkOrder = mongoose.model("WorkOrder", workOrderSchema);
export default WorkOrder;
