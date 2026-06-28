import WorkOrder from "../models/WorkOrder.js";
import Issue from "../models/Issue.js";

// @desc    Create a new Work Order
// @route   POST /api/workorders
// @access  Private
export const createWorkOrder = async (req, res) => {
  const { issueId, category, priority, recommendation, title, assignedOfficer } = req.body;

  if (!issueId || !category || !priority) {
    return res.status(400).json({ message: "issueId, category, and priority are required" });
  }

  try {
    // Prevent duplicate work orders: If a work order already exists for that issue, do NOT create another.
    const existingWorkOrder = await WorkOrder.findOne({ issueId });
    if (existingWorkOrder) {
      return res.status(409).json({
        message: "Work order already exists.",
        workOrderId: existingWorkOrder._id,
      });
    }

    // Determine assigned department based on AI category
    const categoryMapping = {
      "Road Damage": "Public Works",
      "Streetlight Failures": "Electrical Department",
      "Waste Management": "Sanitation",
      "Water Supply": "Water Department",
      "Public Facilities": "Parks & Recreation",
      "Utility Failures": "Utility Services",
    };
    const assignedDept = req.body.assignedDepartment || categoryMapping[category] || "Public Works";

    const workOrderTitle = title || `Work Order: ${category} Repair`;
    const officerName = assignedOfficer || req.user.name || "Municipal Officer";

    const workOrder = await WorkOrder.create({
      title: workOrderTitle,
      issueId,
      category,
      priority,
      assignedDepartment: assignedDept,
      recommendation: recommendation || "Inspect and resolve issue.",
      assignedOfficer: `${officerName} (${assignedDept})`,
      status: "Pending",
    });

    // Automatically update the status of the issue to "Work Order Created"
    await Issue.findByIdAndUpdate(issueId, { status: "Work Order Created" });

    res.status(201).json(workOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all Work Orders
// @route   GET /api/workorders
// @access  Private
export const getWorkOrders = async (req, res) => {
  try {
    const workOrders = await WorkOrder.find().populate("issueId");
    res.json(workOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Work Order Status
// @route   PATCH /api/workorders/:id/status
// @access  Private
export const updateWorkOrderStatus = async (req, res) => {
  const { status } = req.body;

  console.log("[BACKEND REQUEST LOGS] - updateWorkOrderStatus");
  console.log("-> req.params:", req.params);
  console.log("-> req.body:", req.body);
  console.log("-> Work Order ID (from param):", req.params.id);
  console.log("-> Requested new status:", status);

  if (!status) {
    return res.status(400).json({ message: "Status value is required" });
  }

  const validStatuses = ["Pending", "Assigned", "In Progress", "Completed", "Resolved"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  try {
    const workOrder = await WorkOrder.findById(req.params.id);
    if (!workOrder) {
      console.log("-> Work order NOT found.");
      return res.status(404).json({
        success: false,
        message: "Work order not found."
      });
    }

    console.log("-> Work Order document fetched from MongoDB:", JSON.stringify(workOrder, null, 2));
    console.log("-> Linked Issue ID stored in WorkOrder:", workOrder.issueId);

    const issue = await Issue.findById(workOrder.issueId);
    if (!issue) {
      console.log("-> Linked issue NOT found.");
      return res.status(404).json({
        success: false,
        message: "Linked issue not found."
      });
    }

    console.log("-> Linked Issue document fetched from MongoDB:", JSON.stringify(issue, null, 2));
    console.log("-> Current status of WorkOrder:", workOrder.status);
    console.log("-> Current status of Issue:", issue.status);

    // Save transition status on WorkOrder
    if (!workOrder.title) {
      workOrder.title = `Work Order: ${workOrder.category || "Municipal"} Repair`;
    }
    workOrder.status = status;
    if (status === "Completed" || status === "Resolved") {
      workOrder.completedAt = new Date();
    }
    const savedWorkOrder = await workOrder.save();
    console.log("-> Save WorkOrder result:", JSON.stringify(savedWorkOrder, null, 2));

    // Immediately update issue status
    let issueStatus = "Work Order Created";
    if (status === "In Progress") {
      issueStatus = "In Progress";
    } else if (status === "Completed") {
      issueStatus = "Pending Verification";
    } else if (status === "Resolved") {
      issueStatus = "Resolved";
    }

    issue.status = issueStatus;
    const savedIssue = await issue.save();
    console.log("-> Save Issue result:", JSON.stringify(savedIssue, null, 2));

    res.json(savedWorkOrder);
  } catch (error) {
    console.error("Update Work Order Error:", error);
    console.error(error.stack);
    res.status(500).json({ message: error.message });
  }
};
