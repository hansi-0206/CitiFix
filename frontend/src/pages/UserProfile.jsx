import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Award, Calendar, Mail, FileText, CheckCircle, ThumbsUp, LogOut, ArrowRight, Shield } from "lucide-react";
import { motion } from "framer-motion";

export default function UserProfile() {
  const { currentUser, issues, logout } = useApp();
  const navigate = useNavigate();

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-5">
        <div className="h-14 w-14 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-500 flex items-center justify-center border border-slate-200/20 mx-auto">
          <Shield className="h-7 w-7" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Profile Restricted</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Please log in or sign up to view your community reputation status and report history.
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <Link to="/login" className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs rounded-xl shadow-md">
            Sign In
          </Link>
          <Link to="/signup" className="px-5 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 font-semibold text-xs rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900">
            Sign Up
          </Link>
        </div>
      </div>
    );
  }

  // Filter issues reported by this user
  const userIssues = issues.filter((issue) => issue.reportedBy === currentUser.name);
  
  // Count upvotes received by this user's reports
  const totalUpvotesReceived = userIssues.reduce((sum, issue) => sum + issue.upvotes, 0);

  const formattedJoinDate = (() => {
    if (!currentUser.joinedDate) return "Recently Joined";
    const date = new Date(currentUser.joinedDate);
    if (isNaN(date.getTime())) return "Recently Joined";
    const month = date.toLocaleDateString("en-US", { month: "long" });
    const year = date.getFullYear();
    const day = date.getDate();
    return `Joined ${day} ${month} ${year}`;
  })();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Badge tier configuration
  const getBadgeTierDetails = (badge) => {
    switch (badge) {
      case "Civic Champion":
        return {
          color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
          desc: "Top 2% contributor. Authorized to verify community anomalies.",
          colorHex: "#f59e0b"
        };
      case "Community Guardian":
        return {
          color: "text-sky-500 bg-sky-500/10 border-sky-500/20",
          desc: "Active citizen. Awarded priority reporting channels.",
          colorHex: "#0ea5e9"
        };
      default:
        return {
          color: "text-slate-500 bg-slate-500/10 border-slate-500/20",
          desc: "Contributor. Onboarding completed.",
          colorHex: "#64748b"
        };
    }
  };

  const badgeDetails = getBadgeTierDetails(currentUser.badge);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 transition-colors duration-300">
      
      {/* Upper grid: User Profile details & Badge stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Profile Details Block (2 cols wide) */}
        <div className="lg:col-span-2 glass-card rounded-3xl border-slate-200/50 dark:border-slate-800/80 shadow-md p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-center sm:items-start justify-between">
          <div className="flex flex-col sm:flex-row gap-6 items-center text-center sm:text-left">
            {/* Avatar */}
            <div className="h-20 w-20 rounded-full border-4 border-sky-500/20 overflow-hidden shrink-0">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Info */}
            <div className="space-y-3">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight">{currentUser.name}</h3>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase mt-0.5">
                  Citizen Account
                </span>
              </div>

              <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span>{currentUser.email}</span>
                </div>
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span>Joined {formattedJoinDate}</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1 px-4 py-2 border border-rose-500/20 hover:bg-rose-500/10 rounded-xl text-xs font-bold text-rose-500 transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>

        {/* Reputation Badge Widget (1 col) */}
        <div className="glass-card rounded-3xl border-slate-200/50 dark:border-slate-800/80 shadow-md p-6 flex flex-col justify-between space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/10">
              <Award className="h-5.5 w-5.5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase leading-none">Reputation Badge</h4>
              <span className={`inline-block text-xs font-black uppercase mt-1 px-2.5 py-0.5 rounded-full ${badgeDetails.color}`}>
                {currentUser.badge}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
            {badgeDetails.desc}
          </p>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-400">Total Score:</span>
            <span className="font-extrabold text-slate-900 dark:text-white font-display text-base">
              {currentUser.reputationPoints} pts
            </span>
          </div>
        </div>
      </div>

      {/* Stats Counter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Total reports */}
        <div className="glass-card p-5 rounded-2xl border-slate-250/20 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reports Logged</span>
            <h4 className="text-2xl font-display font-extrabold text-slate-900 dark:text-white">{userIssues.length}</h4>
          </div>
          <div className="h-10 w-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center">
            <FileText className="h-5 w-5" />
          </div>
        </div>

        {/* Resolved reports */}
        <div className="glass-card p-5 rounded-2xl border-slate-250/20 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Verified Resolved</span>
            <h4 className="text-2xl font-display font-extrabold text-emerald-500">
              {userIssues.filter(i => i.status === "Resolved").length}
            </h4>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <CheckCircle className="h-5 w-5" />
          </div>
        </div>

        {/* Upvotes received */}
        <div className="glass-card p-5 rounded-2xl border-slate-250/20 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Upvotes Received</span>
            <h4 className="text-2xl font-display font-extrabold text-slate-900 dark:text-white">{totalUpvotesReceived}</h4>
          </div>
          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <ThumbsUp className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* User's Reports list */}
      <div className="space-y-4">
        <div className="space-y-1">
          <h4 className="text-lg font-bold text-slate-900 dark:text-white">Your Filing History</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">List of issues reported under your account</p>
        </div>

        {userIssues.length > 0 ? (
          <div className="space-y-4">
            {userIssues.map((issue) => (
              <div
                key={issue.id}
                className="glass-card p-4 rounded-2xl border-slate-200/40 dark:border-slate-800 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:shadow transition-shadow"
              >
                <div className="flex gap-4 items-center flex-1">
                  <img
                    src={issue.imageUrl}
                    alt=""
                    className="w-14 h-14 rounded-xl object-cover border border-slate-200/20"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-sky-500">
                        {issue.category}
                      </span>
                      <span className={`text-[9px] font-bold px-2 rounded-full uppercase ${
                        issue.status === "Resolved"
                          ? "bg-emerald-500/15 text-emerald-500"
                          : "bg-blue-500/15 text-blue-500"
                      }`}>
                        {issue.status}
                      </span>
                    </div>
                    <h5 className="text-xs font-bold text-slate-950 dark:text-white line-clamp-1 mt-0.5">
                      {issue.title}
                    </h5>
                    <span className="text-[10px] text-slate-400 font-medium">{issue.location.address.split(",")[0]}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                  <div className="flex flex-col items-start sm:items-end">
                    <span className="text-[9px] text-slate-400 font-bold uppercase">Priority Score</span>
                    <span className="text-sm font-black text-rose-500 leading-none">{issue.priorityScore}/100</span>
                  </div>
                  <Link
                    to={`/issue/${issue.id}`}
                    className="flex items-center gap-0.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 rounded-xl text-[10px] font-bold text-slate-700 dark:text-slate-350 transition-colors"
                  >
                    <span>Inspect</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center glass-card rounded-2xl border-dashed border-slate-200 dark:border-slate-800 text-slate-450">
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400">You haven't reported any civic issues yet.</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Your reports will show up here once you file one.</p>
            <Link to="/report" className="inline-block mt-3 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs rounded-xl shadow-sm">
              Report First Anomaly
            </Link>
          </div>
        )}
      </div>

    </div>
  );
}
