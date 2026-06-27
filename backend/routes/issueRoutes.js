import express from "express";
import {
  createIssue,
  checkDuplicateIssue,
  getIssues,
  getIssueById,
  updateIssueStatus,
  upvoteIssue,
  getNearbyIssues,
  analyzeIssue,
  confirmIssueResolved,
} from "../controllers/issueController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getIssues);
router.get("/nearby", getNearbyIssues);
router.get("/:id", getIssueById);

// Protected routes
router.post("/", protect, upload.single("image"), createIssue);
router.post("/check-duplicate", protect, checkDuplicateIssue);
router.post("/analyze", protect, upload.single("image"), analyzeIssue);
router.patch("/:id/status", protect, updateIssueStatus);
router.post("/:id/upvote", protect, upvoteIssue);
router.post("/:id/confirm-resolved", protect, confirmIssueResolved);

export default router;
