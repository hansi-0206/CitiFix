import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { ThumbsUp, Share2, MapPin, Calendar, User, Award, ShieldAlert, Sparkles, CheckCircle2, AlertTriangle, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function IssueDetails() {
  const { id } = useParams();
  const { issues, upvoteIssue, resolveIssue, currentUser, workOrders, createWorkOrder, confirmResolved } = useApp();
  const navigate = useNavigate();

  const [shareSuccess, setShareSuccess] = useState(false);

  const issue = issues.find((i) => i.id === id);

  const workOrderExists = workOrders?.some((wo) => wo.issueId === issue?.id);

  const handleCreateWorkOrder = async () => {
    try {
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
      alert("✓ Work Order Created Successfully!");
    } catch (error) {
      alert(error.message || "Failed to create work order.");
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

  const currentStep = getTimelineStepIndex(issue.status);

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
                    onClick={() => upvoteIssue(issue.id)}
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
                {/* 1. CITIZEN PERMISSIONS: Confirm Resolution */}
                {currentUser?.role === "Citizen" && issue.status === "Pending Verification" && (
                  <div className="flex items-center gap-3">
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
                        onClick={() => confirmResolved(issue.id)}
                        className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/10 cursor-pointer transition-all"
                      >
                        ✓ Confirm Issue Resolved
                      </button>
                    )}
                  </div>
                )}

                {/* 2. MUNICIPAL OFFICER ACTIONS */}
                {(currentUser?.role === "Officer" || currentUser?.role === "Municipal Officer") && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={workOrderExists}
                      onClick={handleCreateWorkOrder}
                      className={`px-3 py-1.5 font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer ${
                        workOrderExists
                          ? "bg-slate-200 dark:bg-slate-800 text-slate-455 dark:text-slate-650 cursor-not-allowed"
                          : "bg-slate-950 text-white hover:bg-slate-900 dark:bg-white dark:text-slate-955 dark:hover:bg-slate-100"
                      }`}
                    >
                      {workOrderExists ? "Work Order Exists" : "Create Work Order"}
                    </button>

                    {issue.status === "Reported" && (
                      <button
                        type="button"
                        onClick={() => resolveIssue(issue.id, "In Progress")}
                        className="px-3 py-1.5 bg-blue-500 hover:bg-blue-650 text-white font-bold text-xs rounded-xl cursor-pointer"
                      >
                        Move to In Progress
                      </button>
                    )}

                    {issue.status === "In Progress" && (
                      <button
                        type="button"
                        onClick={() => resolveIssue(issue.id, "Pending Verification")}
                        className="px-3 py-1.5 bg-amber-505 hover:bg-amber-600 text-white font-bold text-xs rounded-xl cursor-pointer"
                      >
                        Move to Pending Verification
                      </button>
                    )}
                  </div>
                )}

                {/* 3. ADMIN ACTIONS */}
                {currentUser?.role === "Admin" && (
                  <div className="flex flex-wrap gap-2 items-center">
                    <button
                      type="button"
                      disabled={workOrderExists}
                      onClick={handleCreateWorkOrder}
                      className={`px-3 py-1.5 font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer ${
                        workOrderExists
                          ? "bg-slate-200 dark:bg-slate-800 text-slate-455 dark:text-slate-650 cursor-not-allowed"
                          : "bg-slate-955 text-white hover:bg-slate-900 dark:bg-white dark:text-slate-955 dark:hover:bg-slate-100"
                      }`}
                    >
                      {workOrderExists ? "Work Order Exists" : "Create Work Order"}
                    </button>

                    <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Admin Overrides:</span>
                    
                    {issue.status !== "In Progress" && (
                      <button
                        type="button"
                        onClick={() => resolveIssue(issue.id, "In Progress")}
                        className="px-2.5 py-1.5 bg-blue-500 hover:bg-blue-650 text-white font-bold text-[10px] rounded-lg cursor-pointer"
                      >
                        In Progress
                      </button>
                    )}

                    {issue.status !== "Pending Verification" && (
                      <button
                        type="button"
                        onClick={() => resolveIssue(issue.id, "Pending Verification")}
                        className="px-2.5 py-1.5 bg-amber-505 hover:bg-amber-600 text-white font-bold text-[10px] rounded-lg cursor-pointer"
                      >
                        Pending Verification
                      </button>
                    )}

                    {issue.status !== "Resolved" && (
                      <button
                        type="button"
                        onClick={() => resolveIssue(issue.id, "Resolved")}
                        className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-650 text-white font-bold text-[10px] rounded-lg cursor-pointer"
                      >
                        Resolve
                      </button>
                    )}

                    {issue.status === "Resolved" && (
                      <button
                        type="button"
                        onClick={() => resolveIssue(issue.id, "Reported")}
                        className="px-2.5 py-1.5 bg-rose-500 hover:bg-rose-605 text-white font-bold text-[10px] rounded-lg cursor-pointer"
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
              
              {/* Step 1: Reported */}
              <div className="relative">
                <div className={`absolute -left-[31px] top-0.5 h-4 w-4 rounded-full border-2 bg-white dark:bg-dark-950 ${
                  currentStep >= 0 ? "border-sky-500 bg-sky-500 dark:bg-sky-500" : "border-slate-200 dark:border-slate-800"
                }`}></div>
                <div className="space-y-0.5">
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">Issue Reported</h5>
                  <p className="text-[10px] text-slate-400">Validated by AI coprocessor engine.</p>
                </div>
              </div>

              {/* Step 2: In Progress */}
              <div className="relative">
                <div className={`absolute -left-[31px] top-0.5 h-4 w-4 rounded-full border-2 bg-white dark:bg-dark-950 ${
                  currentStep >= 1 ? "border-sky-500 bg-sky-500 dark:bg-sky-500" : "border-slate-200 dark:border-slate-800"
                }`}></div>
                <div className="space-y-0.5">
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">In Progress</h5>
                  <p className="text-[10px] text-slate-400">Crews dispatched on-site conducting repairs.</p>
                </div>
              </div>

              {/* Step 3: Pending Verification */}
              <div className="relative">
                <div className={`absolute -left-[31px] top-0.5 h-4 w-4 rounded-full border-2 bg-white dark:bg-dark-950 ${
                  currentStep >= 2 ? "border-sky-500 bg-sky-500 dark:bg-sky-500" : "border-slate-200 dark:border-slate-800"
                }`}></div>
                <div className="space-y-0.5">
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">Pending Verification</h5>
                  <p className="text-[10px] text-slate-400">Citizens confirm resolution to close ticket.</p>
                </div>
              </div>

              {/* Step 4: Resolved */}
              <div className="relative">
                <div className={`absolute -left-[31px] top-0.5 h-4 w-4 rounded-full border-2 bg-white dark:bg-dark-950 ${
                  currentStep >= 3 ? "border-emerald-500 bg-emerald-500 dark:bg-emerald-500" : "border-slate-200 dark:border-slate-800"
                }`}></div>
                <div className="space-y-0.5">
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">Resolved Case</h5>
                  <p className="text-[10px] text-slate-400">Resolution successfully verified by community audits.</p>
                </div>
              </div>
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
    </div>
  );
}
