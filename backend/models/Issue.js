import mongoose from "mongoose";

const issueSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "Reported",
      enum: ["Reported", "Under Review", "Work Order Created", "In Progress", "Pending Verification", "Resolved", "Verified", "Assigned"],
    },
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    ai: {
      category: {
        type: String,
        required: true,
        enum: [
          "Road Damage",
          "Waste Management",
          "Streetlight Failures",
          "Water Supply",
          "Public Facilities",
          "Utility Failures",
        ],
      },
      severity: {
        type: String,
        required: true,
        enum: ["Low", "Medium", "High", "Critical"],
      },
      priorityScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },
      confidence: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },
      recommendedAction: {
        type: String,
        required: true,
      },
      summary: {
        type: String,
        required: true,
      },
    },
    confirmations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create spatial index for geo queries
issueSchema.index({ location: "2dsphere" });

const Issue = mongoose.model("Issue", issueSchema);

export default Issue;
