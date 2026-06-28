import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { ThumbsUp, Share2, MapPin, Calendar, User, Award, ShieldAlert, Sparkles, CheckCircle2, AlertTriangle, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function IssueDetails() {
  const { id } = useParams();
  const { 
    issues, 
    upvoteIssue, 
    resolveIssue, 
    currentUser, 
    workOrders, 
    createWorkOrder, 
    confirmResolved,
    updateWorkOrderStatus 
  } = useApp();
  const navigate = useNavigate();

  const [shareSuccess, setShareSuccess] = useState(false);
  const [isCreatingWorkOrder, setIsCreatingWorkOrder] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
  };

  const issue = issues.find((i) => i.id === id);
  const workOrder = workOrders?.find((wo) => wo.issueId === issue?.id);
  const workOrderExists = !!workOrder;

  const handleCreateWorkOrder = async () => {
    try {
      setIsCreatingWorkOrder(true);
      let assignedDepartment = "Municipal Public Works";
      if (issue.category === "Waste Management") assignedDepartment = "Sanitation & Waste Cleanups";
      if (issue.category === "Streetlight Failures") assignedDepartment = "Electrical Grid Maintenance";
      if (issue.category === "Water Supply") assignedDepartment = "Water Supply Infrastructure";
      if (issue.category === "Utility Failures") assignedDepartment = "Electrical Grid Maintenance";
      if (issue.category === "Public Facilities") assignedDepartment = "Public Infrastructure Repair";

      await createWorkOrder({
        issueId: issue.id,
        category: issue.category,
        priority: issue.severity || "Medium",
        assignedDepartment,
        recommendation: issue.recommendedAction || "Inspect and resolve issue.",
      });
      setIsCreatingWorkOrder(false);
      showToast("✓ Work Order Created Successfully");
    } catch (error) {
      setIsCreatingWorkOrder(false);
      if (error.status === 409) {
        setIsModalOpen(true);
        showToast("Work order already exists.", "info");
      } else {
        showToast("Unable to create work order.", "error");
      }
    }
  };

  const handleUpvote = async () => {
    try {
      await upvoteIssue(issue.id);
      showToast("✓ Support Registered Successfully");
    } catch (err) {
      showToast("Unable to support report.", "error");
    }
  };

  const handleConfirmResolved = async () => {
    try {
      await confirmResolved(issue.id);
      showToast("✓ Resolution Confirmed Successfully");
    } catch (err) {
      showToast("Unable to confirm resolution.", "error");
    }
  };

  const handleResolveIssue = async (targetStatus) => {
    try {
      await resolveIssue(issue.id, targetStatus);
      if (targetStatus === "Resolved") {
        showToast("✓ Issue Marked as Resolved");
      } else {
        showToast(`✓ Issue Status Updated to ${targetStatus}`);
      }
    } catch (err) {
      showToast("Unable to update status.", "error");
    }
  };

  const handleUpdateWorkOrderStatus = async (status) => {
    try {
      await updateWorkOrderStatus(workOrder._id || workOrder.id, status);
      showToast("✓ Work Order Updated Successfully");
      if (status === "Resolved") {
        showToast("✓ Issue Marked as Resolved");
      }
    } catch (err) {
      showToast("Unable to update work order.", "error");
    }
  };

  if (!issue) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <AlertTriangle className="h-12 w-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Issue Not Found</h2>
        <p className="text-sm text-slate-500">The requested ticket does not exist or has been archived.</p>
        <Link to="/feed" className="inline-block px-4 py-2 bg-sky-500 text-white font-semibold text-xs rounded-xl shadow">
          Back to Feed
        </Link>
      </div>
    );
  }

  // Handle sharing (mock clipboard copy)
  const handleShare = () => {
    const dummyUrl = `${window.location.origin}/#/issue/${issue.id}`;
    navigator.clipboard.writeText(dummyUrl).then(() => {
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    });
  };

  const formattedDate = new Date(issue.date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  const getSeverityColor = (sev) => {
    switch (sev?.toLowerCase()) {
      case "critical": return "text-rose-500 bg-rose-500/10 border-rose-500/20";
      case "high": return "text-amber-500 bg-amber-500/10 border-amber-500/20";
      case "medium": return "text-sky-500 bg-sky-500/10 border-sky-500/20";
      default: return "text-slate-500 bg-slate-500/10 border-slate-500/20";
    }
  };

  const getStatusColor = (stat) => {
    switch (stat?.toLowerCase()) {
      case "resolved": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
      case "in progress": return "text-blue-500 bg-blue-500/10 border-blue-500/20";
      default: return "text-violet-500 bg-violet-500/10 border-violet-500/20";
    }
  };

  // Helper to determine timeline step indices
  const getTimelineStepIndex = (status) => {
    switch (status?.toLowerCase()) {
      case "resolved": return 3;
      case "pending verification": return 2;
      case "in progress": return 1;
      default: return 0;
    }
  };

  const getCitizenStepIndex = (status) => {
    switch (status?.toLowerCase()) {
      case "resolved": return 4;
      case "pending verification": return 3;
      case "in progress": return 3;
      case "work order created": return 2;
      case "under review": return 1;
      default: return 0;
    }
  };

  const getDepartmentName = (cat) => {
    const categoryMapping = {
      "Road Damage": "Public Works",
      "Streetlight Failures": "Electrical Department",
      "Waste Management": "Sanitation",
      "Water Supply": "Water Department",
      "Public Facilities": "Parks & Recreation",
      "Utility Failures": "Utility Services",
    };
    return categoryMapping[cat] || "Public Works";
  };

  const isCitizen = currentUser?.role === "Citizen";

  const stepsToShow = isCitizen ? [
    { title: "Reported", desc: "Validated by AI coprocessor engine." },
    { title: "Under Review", desc: "Municipal team reviewing details." },
    { title: "Work Order Created", desc: "Work order assigned to department." },
    { title: "In Progress", desc: "Crews dispatched conducting repairs." },
    { title: "Resolved", desc: "Case successfully closed." }
  ] : [
    { title: "Reported", desc: "Validated by AI coprocessor engine." },
    { title: "In Progress", desc: "Crews dispatched conducting repairs." },
    { title: "Pending Verification", desc: "Citizens confirm resolution to close ticket." },
    { title: "Resolved", desc: "Case successfully closed." }
  ];

  const currentStepIndex = isCitizen ? getCitizenStepIndex(issue?.status) : getTimelineStepIndex(issue?.status);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 transition-colors duration-300">
      
      {/* Back to feed navigation */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to list
        </button>
      </div>

      {/* Grid structure: Left main info, Right AI insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column (2 Cols wide) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Info Card */}
          <div className="glass-card rounded-3xl border-slate-200/50 dark:border-slate-800/80 shadow-xl overflow-hidden">
            {/* Cover Image */}
            <div className="relative h-64 sm:h-96 overflow-hidden">
              <img
                src={issue.imageUrl}
                alt={issue.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent"></div>
              
              <div className="absolute bottom-5 left-5 right-5 text-white space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-sky-400">
                  {issue.category}
                </span>
                <h3 className="text-xl sm:text-2xl font-display font-extrabold leading-snug">
                  {issue.title}
                </h3>
              </div>
            </div>

            {/* Incident profile details */}
            <div className="p-6 sm:p-8 space-y-6">
              
              {/* Badges & Meta strip */}
              <div className="flex flex-wrap gap-4 items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex gap-2">
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase border ${getSeverityColor(issue.severity)}`}>
                    {issue.severity} Severity
                  </span>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase border ${getStatusColor(issue.status)}`}>
                    {issue.status}
                  </span>
                </div>

                <div className="flex gap-3">
                  {/* Upvote */}
                  <button
                    onClick={handleUpvote}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-350 transition-colors"
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                    <span>{issue.upvotes} Upvotes</span>
                  </button>

                  {/* Share */}
                  <div className="relative">
                    <button
                      onClick={handleShare}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 rounded-xl text-slate-700 dark:text-slate-350 transition-colors"
                      title="Copy Share Link"
                    >
                      <Share2 className="h-4.5 w-4.5" />
                    </button>
                    <AnimatePresence>
                      {shareSuccess && (
                        <motion.span
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-2.5 py-1 rounded bg-slate-900 text-white dark:bg-white dark:text-slate-950 text-[9px] font-bold tracking-wide whitespace-nowrap shadow-md"
                        >
                          Link copied!
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Citizen Description</h4>
                <p className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed font-medium">
                  {issue.description}
                </p>
              </div>

              {/* Reporter Info & Date */}
              <div className="p-4 bg-slate-100/50 dark:bg-slate-900/50 rounded-2xl border border-slate-200/20 dark:border-slate-800/40 grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Reporter profile */}
                <div className="flex items-center gap-3">
                  <img
                    src={issue.userAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80"}
                    alt={issue.reportedBy}
                    className="h-10 w-10 rounded-full border border-sky-100 dark:border-sky-500/20"
                  />
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase leading-none">Reported By</span>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight mt-0.5">{issue.reportedBy}</p>
                  </div>
                </div>

                {/* Date reported */}
                <div className="flex items-center gap-3 sm:pl-4 sm:border-l border-slate-200/50 dark:border-slate-800/50">
                  <div className="h-10 w-10 rounded-full bg-sky-500/10 text-sky-500 flex items-center justify-center border border-sky-500/10">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase leading-none">Date Logged</span>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight mt-0.5">{formattedDate}</p>
                  </div>
                </div>
              </div>

              {/* Precise Location info */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Spatial Location Details</h4>
                <div className="flex items-start gap-2.5">
                  <MapPin className="h-5 w-5 text-sky-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{issue.location.address}</p>
                    <span className="text-[10px] text-slate-500 font-semibold uppercase">
                      GPS coordinates: lat {issue.location.lat.toFixed(6)}, lng {issue.location.lng.toFixed(6)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Resolution Status Timeline */}
          <div className="glass-card rounded-3xl border-slate-200/50 dark:border-slate-800/80 shadow-md p-6 sm:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-4">
              <div className="space-y-0.5">
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Workflow Timeline</h4>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Lifecycle tracking</p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {/* 1. CITIZEN PERMISSIONS */}
                {currentUser?.role === "Citizen" && (
                  <div className="flex flex-col gap-3">
                    {workOrderExists && (
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                          ✓ Work Order Created
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsModalOpen(true)}
                          className="px-3 py-1 bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 font-bold text-xs rounded-xl transition-all cursor-pointer"
                        >
                          View Progress
                        </button>
                      </div>
                    )}
 
                    {issue.status === "Pending Verification" && (
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                          Confirmations: {issue.confirmations?.length || 0} / 3
                        </span>
                        {issue.confirmations?.includes(currentUser.id) ? (
                          <button
                            type="button"
                            disabled
                            className="px-3 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs rounded-xl border border-emerald-500/20 cursor-not-allowed"
                          >
                            ✓ Confirmed Resolution
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={handleConfirmResolved}
                            className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/10 cursor-pointer transition-all"
                          >
                            ✓ Confirm Issue Resolved
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
                {/* 2. MUNICIPAL OFFICER ACTIONS */}
                {(currentUser?.role === "Officer" || currentUser?.role === "Municipal Officer") && (
                  <div className="flex flex-wrap gap-2">
                    {workOrderExists ? (
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                      >
                        View Work Order
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={isCreatingWorkOrder}
                        onClick={handleCreateWorkOrder}
                        className={`px-3 py-1.5 font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer ${
                          isCreatingWorkOrder
                            ? "bg-slate-200 dark:bg-slate-800 text-slate-455 dark:text-slate-650 cursor-not-allowed"
                            : "bg-slate-955 text-white hover:bg-slate-900 dark:bg-white dark:text-slate-955 dark:hover:bg-slate-100"
                        }`}
                      >
                        {isCreatingWorkOrder ? "Creating Work Order..." : "Create Work Order"}
                      </button>
                    )}

                    {issue.status === "Reported" && (
                      <button
                        type="button"
                        onClick={() => handleResolveIssue("In Progress")}
                        className="px-3 py-1.5 bg-blue-500 hover:bg-blue-655 text-white font-bold text-xs rounded-xl cursor-pointer"
                      >
                        Move to In Progress
                      </button>
                    )}

                    {issue.status === "In Progress" && (
                      <button
                        type="button"
                        onClick={() => handleResolveIssue("Pending Verification")}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl cursor-pointer"
                      >
                        Move to Pending Verification
                      </button>
                    )}
                  </div>
                )}

                {/* 3. ADMIN ACTIONS */}
                {currentUser?.role === "Admin" && (
                  <div className="flex flex-wrap gap-2 items-center">
                    {workOrderExists ? (
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                      >
                        View Work Order
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={isCreatingWorkOrder}
                        onClick={handleCreateWorkOrder}
                        className={`px-3 py-1.5 font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer ${
                          isCreatingWorkOrder
                            ? "bg-slate-200 dark:bg-slate-800 text-slate-455 dark:text-slate-650 cursor-not-allowed"
                            : "bg-slate-950 text-white hover:bg-slate-900 dark:bg-white dark:text-slate-955 dark:hover:bg-slate-100"
                        }`}
                      >
                        {isCreatingWorkOrder ? "Creating Work Order..." : "Create Work Order"}
                      </button>
                    )}
 
                    <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Admin Overrides:</span>
                    
                    {issue.status !== "In Progress" && (
                      <button
                        type="button"
                        onClick={() => handleResolveIssue("In Progress")}
                        className="px-2.5 py-1.5 bg-blue-500 hover:bg-blue-655 text-white font-bold text-[10px] rounded-lg cursor-pointer"
                      >
                        In Progress
                      </button>
                    )}
 
                    {issue.status !== "Pending Verification" && (
                      <button
                        type="button"
                        onClick={() => handleResolveIssue("Pending Verification")}
                        className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] rounded-lg cursor-pointer"
                      >
                        Pending Verification
                      </button>
                    )}
 
                    {issue.status !== "Resolved" && (
                      <button
                        type="button"
                        onClick={() => handleResolveIssue("Resolved")}
                        className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-650 text-white font-bold text-[10px] rounded-lg cursor-pointer"
                      >
                        Resolve
                      </button>
                    )}
 
                    {issue.status === "Resolved" && (
                      <button
                        type="button"
                        onClick={() => handleResolveIssue("Reported")}
                        className="px-2.5 py-1.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-[10px] rounded-lg cursor-pointer"
                      >
                        Reopen Issue
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Custom SVG/CSS timeline node sequence */}
            <div className="relative pl-6 space-y-6 border-l-2 border-slate-200 dark:border-slate-800">
              {stepsToShow.map((step, idx) => {
                const isActive = currentStepIndex >= idx;
                const isFinal = idx === stepsToShow.length - 1;
                return (
                  <div key={idx} className="relative">
                    <div className={`absolute -left-[31px] top-0.5 h-4 w-4 rounded-full border-2 bg-white dark:bg-dark-950 ${
                      isActive 
                        ? (isFinal ? "border-emerald-500 bg-emerald-500 dark:bg-emerald-500" : "border-sky-500 bg-sky-500 dark:bg-sky-500") 
                        : "border-slate-200 dark:border-slate-800"
                    }`}></div>
                    <div className="space-y-0.5">
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white">{step.title}</h5>
                      <p className="text-[10px] text-slate-400">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: AI Summary Card & Priority details */}
        <div className="space-y-6">
          
          {/* AI Info Card */}
          <div className="glass-card rounded-3xl border-slate-200/50 dark:border-slate-800/80 shadow-md p-6 space-y-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-5 pointer-events-none">
              <Sparkles className="h-16 w-16 text-sky-500" />
            </div>

            <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
              <Sparkles className="h-5 w-5 text-sky-500" />
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">AI Diagnostics Card</h4>
                <p className="text-[9px] text-slate-400 font-bold uppercase leading-none">Calculated Inference Parameters</p>
              </div>
            </div>

            <div className="space-y-4 text-xs font-medium">
              
              {/* Category */}
              <div className="flex justify-between items-center py-2 border-b border-slate-100/50 dark:border-slate-850">
                <span className="text-slate-400">Recommended Category</span>
                <span className="font-bold text-slate-900 dark:text-white">{issue.category}</span>
              </div>

              {/* Priority */}
              <div className="flex justify-between items-center py-2 border-b border-slate-100/50 dark:border-slate-850">
                <span className="text-slate-400">Priority Score Index</span>
                <span className="font-extrabold text-rose-500 font-display">{issue.priorityScore}/100</span>
              </div>

              {/* Confidence */}
              <div className="flex justify-between items-center py-2 border-b border-slate-100/50 dark:border-slate-850">
                <span className="text-slate-400">Model Confidence</span>
                <span className="font-bold text-emerald-500">{issue.aiConfidence}%</span>
              </div>

              {/* Est Resolution */}
              <div className="flex justify-between items-center py-2 border-b border-slate-100/50 dark:border-slate-850">
                <span className="text-slate-400">Estimated Resolution Time</span>
                <span className="font-bold text-slate-900 dark:text-white">{issue.estimatedResolution}</span>
              </div>

              {/* Recommended Action */}
              <div className="p-3 bg-slate-100/60 dark:bg-slate-900/60 rounded-xl space-y-1.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Recommended Action</span>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{issue.recommendedAction}</p>
              </div>

              {/* AI Summary */}
              <div className="p-3 bg-sky-500/5 rounded-xl space-y-1.5 border border-sky-500/10">
                <span className="text-[9px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider block">Inference Summary</span>
                <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed italic">
                  "{issue.aiSummary}"
                </p>
              </div>
            </div>
          </div>

          {/* Gamification Reputation Reward Info */}
          <div className="p-5 bg-gradient-to-tr from-sky-500/10 to-indigo-500/5 rounded-3xl border border-sky-500/10 space-y-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500">
              <Award className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Civic Engagement Points</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                By participating in upvoting or reporting issues, you help the AI model prioritize high-traffic failures. Reporting grants <span className="font-bold text-sky-500">+10 pts</span>, upvoting awards the original reporter <span className="font-bold text-sky-500">+20 pts</span>, and verifying resolution awards <span className="font-bold text-emerald-500">+30 pts</span>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Work Order Details / Progress Modal */}
      <AnimatePresence>
        {isModalOpen && workOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            ></motion.div>

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    {currentUser?.role === "Citizen" ? "Work Order Progress" : "Work Order Management"}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                    WO-ID: {workOrder._id || workOrder.id}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-8 w-8 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 flex items-center justify-center transition-colors text-lg font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-6 overflow-y-auto space-y-6 text-sm font-medium">
                {/* Linked Issue Title & Category */}
                <div className="flex gap-4 items-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200/25 dark:border-slate-800/40">
                  <img
                    src={issue.imageUrl}
                    alt=""
                    className="w-16 h-16 rounded-xl object-cover border border-slate-200/20 shrink-0"
                  />
                  <div>
                    <span className="text-[10px] font-bold text-sky-500 uppercase tracking-wide">
                      {issue.category}
                    </span>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white line-clamp-1 mt-0.5">
                      {issue.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                      {issue.location.address}
                    </p>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Assigned Department
                    </span>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {getDepartmentName(issue.category)}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Priority Level
                    </span>
                    <p className="text-xs font-bold text-rose-500 uppercase">
                      {workOrder.priority || issue.severity}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Created Date
                    </span>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-350">
                      {new Date(workOrder.createdAt || Date.now()).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Last Updated
                    </span>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-350">
                      {new Date(workOrder.updatedAt || Date.now()).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </p>
                  </div>
                </div>

                {/* AI Recommended Action */}
                <div className="p-4 bg-sky-500/5 rounded-2xl border border-sky-500/10 space-y-1.5">
                  <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider block">
                    AI Recommended Action
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
                    {issue.recommendedAction || "Inspect and resolve issue."}
                  </p>
                </div>

                {/* Status Section */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200/20 dark:border-slate-800/40 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Current Status
                    </span>
                    <span className="inline-block mt-1.5 px-3 py-1 bg-sky-500/10 text-sky-500 font-black text-xs uppercase rounded-full tracking-wide">
                      {workOrder.status}
                    </span>
                  </div>

                  {/* Actions for Officers / Admins */}
                  {currentUser?.role !== "Citizen" && workOrder.status !== "Resolved" && (
                    <div className="flex gap-2">
                      {workOrder.status === "Pending" && (
                        <button
                          type="button"
                          onClick={() => handleUpdateWorkOrderStatus("In Progress")}
                          className="px-3 py-1.5 bg-blue-500 hover:bg-blue-650 text-white font-bold text-[11px] rounded-xl cursor-pointer shadow-sm transition-all"
                        >
                          Start Repair
                        </button>
                      )}
                      {(workOrder.status === "Pending" || workOrder.status === "In Progress") && (
                        <button
                          type="button"
                          onClick={() => handleUpdateWorkOrderStatus("Completed")}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] rounded-xl cursor-pointer shadow-sm transition-all"
                        >
                          Mark Completed
                        </button>
                      )}
                      {workOrder.status !== "Resolved" && (
                        <button
                          type="button"
                          onClick={() => handleUpdateWorkOrderStatus("Resolved")}
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-650 text-white font-bold text-[11px] rounded-xl cursor-pointer shadow-sm transition-all"
                        >
                          Mark Resolved
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-5 right-5 z-[60] flex items-center gap-2.5 px-4.5 py-3.5 bg-slate-900 text-white dark:bg-white dark:text-slate-955 rounded-2xl shadow-2xl border border-slate-805 dark:border-slate-200"
          >
            <span className="text-xs font-black tracking-wide">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
