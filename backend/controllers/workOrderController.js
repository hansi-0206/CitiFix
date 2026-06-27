import WorkOrder from "../models/WorkOrder.js";

// @desc    Create a new Work Order
// @route   POST /api/work-orders
// @access  Private
export const createWorkOrder = async (req, res) => {
  const { issueId, category, priority, assignedDepartment, recommendation } = req.body;

  if (!issueId || !category || !priority || !assignedDepartment || !recommendation) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Prevent duplicate work orders: If a work order already exists for that issue, do NOT create another.
    const existingWorkOrder = await WorkOrder.findOne({ issueId });
    if (existingWorkOrder) {
      return res.status(409).json({ message: "Work Order Already Exists" });
    }

    const workOrder = await WorkOrder.create({
      issueId,
      category,
      priority,
      assignedDepartment,
      recommendation,
      status: "Pending",
    });

    res.status(201).json(workOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all Work Orders
// @route   GET /api/work-orders
// @access  Private
export const getWorkOrders = async (req, res) => {
  try {
    const workOrders = await WorkOrder.find();
    res.json(workOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
