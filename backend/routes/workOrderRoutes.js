import express from "express";
import { createWorkOrder, getWorkOrders, updateWorkOrderStatus } from "../controllers/workOrderController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, restrictTo("Officer", "Municipal Officer", "Admin"), createWorkOrder);
router.get("/", protect, getWorkOrders);
router.patch("/:id/status", protect, restrictTo("Officer", "Municipal Officer", "Admin"), updateWorkOrderStatus);

export default router;
