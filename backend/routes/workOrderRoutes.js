import express from "express";
import { createWorkOrder, getWorkOrders, updateWorkOrderStatus } from "../controllers/workOrderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createWorkOrder);
router.get("/", protect, getWorkOrders);
router.patch("/:id/status", protect, updateWorkOrderStatus);

export default router;
