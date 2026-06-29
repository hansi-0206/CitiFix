import Issue from "../models/Issue.js";
import User from "../models/User.js";
import { uploadToCloudinary } from "../middleware/uploadMiddleware.js";
import { analyzeIssueWithAI } from "../services/geminiService.js";

// @desc    Check for duplicate reports within 100 meters
// @route   POST /api/issues/check-duplicate
// @access  Private
export const checkDuplicateIssue = async (req, res) => {
  const { latitude, longitude, category } = req.body;

  if (!latitude || !longitude || !category) {
    return res.status(400).json({ message: "Latitude, longitude and category are required" });
  }

  try {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    const query = {
      "ai.category": category,
      status: { $ne: "Resolved" },
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },
          $maxDistance: 100, // 100 meters
        },
      },
    };

    const duplicate = await Issue.findOne(query).populate("reportedBy", "name points badge");

    if (duplicate) {
      return res.json({
        duplicateFound: true,
        existingIssue: duplicate,
      });
    }

    res.json({ duplicateFound: false });
  } catch (error) {
    console.error("Check Duplicate Error Details:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Analyze uploaded image + description with Gemini AI
// @route   POST /api/issues/analyze
// @access  Private
export const analyzeIssue = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload an image snapshot for AI analysis" });
    }
    const { description } = req.body;

    const aiInference = await analyzeIssueWithAI(
      description || "",
      req.file.buffer,
      req.file.mimetype
    );

    res.json(aiInference);
  } catch (error) {
    console.error("AI Analysis Error Details:", error);
    res.status(500).json({ 
      message: error.message || "AI analysis unavailable. Please try again." 
    });
  }
};

// @desc    Create a new issue report
// @route   POST /api/issues
// @access  Private
export const createIssue = async (req, res) => {
  const { 
    title, 
    description, 
    category, 
    latitude, 
    longitude, 
    address, 
    bypassDuplicateCheck,
    aiCategory,
    aiSeverity,
    aiPriorityScore,
    aiConfidence,
    aiRecommendedAction,
    aiSummary
  } = req.body;

  if (!description || !category || !latitude || !longitude || !address) {
    return res.status(400).json({ message: "Please fill in all required fields" });
  }

  try {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    // 1. Image upload check
    if (!req.file) {
      return res.status(400).json({ message: "Please upload an image snapshot of the issue" });
    }

    // 2. Perform duplicate check before saving (unless user bypassed it)
    console.log("--- CREATE ISSUE DUPLICATE CHECK ---");
    console.log("bypassDuplicateCheck value:", bypassDuplicateCheck);
    console.log("Category for duplicate check:", category);
    console.log("Coordinates for duplicate check: [", lng, ",", lat, "]");

    if (bypassDuplicateCheck !== "true") {
      const query = {
        "ai.category": category,
        status: { $ne: "Resolved" },
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [lng, lat],
            },
            $maxDistance: 100,
          },
        },
      };

      const duplicate = await Issue.findOne(query);

      if (duplicate) {
        return res.status(409).json({
          duplicateFound: true,
          message: "Similar issue detected nearby. Choose to upvote that or bypass.",
          existingIssueId: duplicate._id,
        });
      }
    }

    // 3. Upload image buffer to Cloudinary
    const imageUrl = await uploadToCloudinary(req.file.buffer);

    // 4. Run Gemini AI classification on the uploaded file + description, or use pre-analyzed payload
    let aiInference;
    if (aiCategory && aiSeverity && aiPriorityScore) {
      aiInference = {
        category: aiCategory,
        severity: aiSeverity,
        priorityScore: parseInt(aiPriorityScore, 10),
        confidence: parseInt(aiConfidence, 10) || 100,
        recommendedAction: aiRecommendedAction,
        summary: aiSummary,
      };
    } else {
      aiInference = await analyzeIssueWithAI(
        description,
        req.file.buffer,
        req.file.mimetype
      );
    }

    // 5. Save the issue report with nested AI attributes
    const newIssue = await Issue.create({
      title: title || `${aiInference.category} Report`,
      description,
      imageUrl,
      address,
      reportedBy: req.user._id,
      location: {
        type: "Point",
        coordinates: [lng, lat],
      },
      ai: {
        category: aiInference.category,
        severity: aiInference.severity,
        priorityScore: aiInference.priorityScore,
        confidence: aiInference.confidence,
        recommendedAction: aiInference.recommendedAction,
        summary: aiInference.summary,
      },
    });

    // 6. Award +20 points to the reporter
    const user = await User.findById(req.user._id);
    if (user) {
      user.points += 20;
      await user.save();
    }

    // Populate user info for client return
    const populatedIssue = await Issue.findById(newIssue._id).populate("reportedBy", "name points badge");

    res.status(201).json(populatedIssue);
  } catch (error) {
    console.error("Create Issue Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all issues with filter criteria
// @route   GET /api/issues
// @access  Public
export const getIssues = async (req, res) => {
  const { category, severity, status, search } = req.query;

  try {
    let query = {};

    if (category && category !== "All") {
      query["ai.category"] = category;
    }

    if (severity && severity !== "All") {
      query["ai.severity"] = severity;
    }

    if (status && status !== "All") {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
      ];
    }

    const issues = await Issue.find(query)
      .populate("reportedBy", "name points badge")
      .sort({ createdAt: -1 });

    res.json(issues);
  } catch (error) {
    console.error("Get Issues Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single issue details
// @route   GET /api/issues/:id
// @access  Public
export const getIssueById = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id).populate("reportedBy", "name points badge");

    if (!issue) {
      return res.status(404).json({ message: "Issue report not found" });
    }

    res.json(issue);
  } catch (error) {
    console.error("Get Issue By ID Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update issue status
// @route   PATCH /api/issues/:id/status
// @access  Private
export const updateIssueStatus = async (req, res) => {
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: "Status value is required" });
  }

  const validStatuses = ["Reported", "In Progress", "Pending Verification", "Resolved"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ message: "Issue report not found" });
    }

    const userRole = req.user.role || "Citizen";

    // Role-based permissions check
    if (userRole === "Citizen") {
      return res.status(403).json({ message: "Citizens cannot modify issue status directly" });
    }

    if (userRole === "Municipal Officer") {
      const current = issue.status;
      if (current === "Reported" && status !== "In Progress") {
        return res.status(403).json({ message: "Municipal Officers can only move 'Reported' to 'In Progress'" });
      }
      if (current === "In Progress" && status !== "Pending Verification") {
        return res.status(403).json({ message: "Municipal Officers can only move 'In Progress' to 'Pending Verification'" });
      }
      if (current === "Pending Verification") {
        return res.status(403).json({ message: "Municipal Officers cannot modify status when it is Pending Verification" });
      }
      if (current === "Resolved") {
        return res.status(403).json({ message: "Municipal Officers cannot modify status of Resolved issues" });
      }
    }

    const previousStatus = issue.status;
    issue.status = status;
    await issue.save();

    // If status is updated to 'Resolved' and it wasn't previously resolved, award +30 points to original reporter
    if (status === "Resolved" && previousStatus !== "Resolved") {
      const reporter = await User.findById(issue.reportedBy);
      if (reporter) {
        reporter.points += 30;
        await reporter.save();
      }
    }

    const updatedIssue = await Issue.findById(req.params.id).populate("reportedBy", "name points badge");
    res.json(updatedIssue);
  } catch (error) {
    console.error("Update Status Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upvote an issue report
// @route   POST /api/issues/:id/upvote
// @access  Private
export const upvoteIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ message: "Issue report not found" });
    }

    // Check if user already upvoted
    const userIdStr = req.user._id.toString();
    const hasUpvoted = issue.upvotes.some((id) => id.toString() === userIdStr);

    if (hasUpvoted) {
      return res.status(400).json({ message: "You have already supported this report" });
    }

    // Append upvote
    issue.upvotes.push(req.user._id);
    await issue.save();

    // Award +5 points to the original reporter
    const reporter = await User.findById(issue.reportedBy);
    if (reporter) {
      reporter.points += 5;
      await reporter.save();
    }

    const updatedIssue = await Issue.findById(req.params.id).populate("reportedBy", "name points badge");
    res.json(updatedIssue);
  } catch (error) {
    console.error("Upvote Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get nearby issues within specific coordinates radius
// @route   GET /api/issues/nearby
// @access  Public
export const getNearbyIssues = async (req, res) => {
  const { lat, lng, radius } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ message: "Latitude (lat) and longitude (lng) coordinates are required" });
  }

  try {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const distanceLimit = parseFloat(radius) || 5000; // default 5km

    const issues = await Issue.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          $maxDistance: distanceLimit,
        },
      },
    }).populate("reportedBy", "name points badge");

    res.json(issues);
  } catch (error) {
    console.error("Get Nearby Issues Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Citizen confirms issue resolution
// @route   POST /api/issues/:id/confirm-resolved
// @access  Private
export const confirmIssueResolved = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ message: "Issue report not found" });
    }

    if (issue.status !== "Pending Verification") {
      return res.status(400).json({ message: "Confirmations are only allowed for issues pending verification" });
    }

    const userIdStr = req.user._id.toString();
    const alreadyConfirmed = issue.confirmations.some((id) => id.toString() === userIdStr);

    if (alreadyConfirmed) {
      return res.status(400).json({ message: "You have already confirmed this resolution" });
    }

    // Add confirmation
    issue.confirmations.push(req.user._id);

    // If confirmation threshold (e.g. 3) is reached, automatically mark as Resolved
    const threshold = 3;
    if (issue.confirmations.length >= threshold) {
      const previousStatus = issue.status;
      issue.status = "Resolved";

      if (previousStatus !== "Resolved") {
        const reporter = await User.findById(issue.reportedBy);
        if (reporter) {
          reporter.points += 30;
          await reporter.save();
        }
      }
    }

    await issue.save();

    const updatedIssue = await Issue.findById(req.params.id).populate("reportedBy", "name points badge");
    res.json(updatedIssue);
  } catch (error) {
    console.error("Confirm Resolved Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/issues/dashboard/stats
// @access  Public
export const getDashboardStats = async (req, res) => {
  try {
    // 1. Fetch community members (total registered users) using countDocuments
    const communityMembers = await User.countDocuments();

    // 2. Fetch active reports (status != Resolved)
    const activeReports = await Issue.countDocuments({ status: { $ne: "Resolved" } });

    // 3. Fetch resolved issues (status == Resolved)
    const resolvedIssues = await Issue.countDocuments({ status: "Resolved" });

    // 4. Calculate participation score
    const reportedUsers = await Issue.distinct("reportedBy");
    const upvotedUsers = await Issue.distinct("upvotes");

    const uniqueParticipants = new Set([
      ...reportedUsers.map((id) => id.toString()),
      ...upvotedUsers.map((id) => id.toString()),
    ]);

    const participantCount = uniqueParticipants.size;
    const participationScore = communityMembers > 0
      ? Math.min(100, Math.round((participantCount / communityMembers) * 100))
      : 0;

    res.json({
      activeReports,
      resolvedIssues,
      communityMembers,
      participationScore,
    });
  } catch (error) {
    console.error("Get Dashboard Stats Error:", error);
    res.status(500).json({ message: error.message });
  }
};
