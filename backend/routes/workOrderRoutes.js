import express from "express";
import { createWorkOrder, getWorkOrders } from "../controllers/workOrderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createWorkOrder);
router.get("/", protect, getWorkOrders);

export default router;
