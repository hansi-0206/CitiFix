import mongoose from "mongoose";

const workOrderSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: false,
      default: "Work Order",
      trim: true,
    },
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
      default: "",
    },
    recommendation: {
      type: String,
      default: "",
    },
    assignedOfficer: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      default: "Pending",
      enum: ["Pending", "Assigned", "In Progress", "Completed", "Resolved"],
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const WorkOrder = mongoose.model("WorkOrder", workOrderSchema);
export default WorkOrder;
