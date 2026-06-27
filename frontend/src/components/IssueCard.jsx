import React from "react";
import { Link } from "react-router-dom";
import { ThumbsUp, Calendar, MapPin, Award, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { useApp } from "../context/AppContext";

export default function IssueCard({ issue, viewMode = "grid" }) {
  const { upvoteIssue } = useApp();
  const [imgError, setImgError] = React.useState(false);

  const getSeverityStyles = (severity) => {
    switch (severity?.toLowerCase()) {
      case "critical":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20";
      case "high":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20";
      case "medium":
        return "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20";
      default:
        return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20";
    }
  };

  const getStatusStyles = (status) => {
    switch (status?.toLowerCase()) {
      case "resolved":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20";
      case "in progress":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20";
      default:
        return "bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20";
    }
  };

  const getPriorityColor = (score) => {
    if (score >= 90) return "text-rose-500 dark:text-rose-400";
    if (score >= 70) return "text-amber-500 dark:text-amber-400";
    return "text-sky-500 dark:text-sky-400";
  };

  const handleUpvote = (e) => {
    e.preventDefault();
    e.stopPropagation();
    upvoteIssue(issue.id);
  };

  const formattedDate = new Date(issue.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  if (viewMode === "list") {
    return (
      <motion.div
        variants={cardVariants}
        layout
        className="glass-card p-5 rounded-2xl flex flex-col md:flex-row gap-5 items-start md:items-center justify-between border-slate-200/60 dark:border-slate-800 hover:shadow-md hover:shadow-sky-500/5 transition-all"
      >
        <div className="flex gap-4 items-start md:items-center flex-1">
          {issue.imageUrl && !imgError && (
            <img
              src={issue.imageUrl}
              alt={issue.title}
              onError={() => setImgError(true)}
              className="w-20 h-20 md:w-24 md:h-24 rounded-xl object-cover border border-slate-200/50 dark:border-slate-800/80"
            />
          )}
          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                {issue.category}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${getSeverityStyles(issue.severity)}`}>
                {issue.severity}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${getStatusStyles(issue.status)}`}>
                {issue.status}
              </span>
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1 hover:text-sky-500 transition-colors">
              <Link to={`/issue/${issue.id}`}>{issue.title}</Link>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 max-w-xl">
              {issue.description}
            </p>
            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-[11px] text-slate-400 font-medium">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {issue.location.address}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formattedDate}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800 justify-between md:justify-end">
          <div className="flex flex-col items-center md:items-end">
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Priority Score</span>
            <span className={`text-lg font-extrabold font-display ${getPriorityColor(issue.priorityScore)}`}>
              {issue.priorityScore}/100
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleUpvote}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors"
            >
              <ThumbsUp className="h-3.5 w-3.5" />
              <span>{issue.upvotes}</span>
            </button>

            <Link
              to={`/issue/${issue.id}`}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs shadow-sm hover:shadow transition-all"
            >
              Details
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid view by default
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -4 }}
      layout
      className="glass-card overflow-hidden rounded-2xl flex flex-col h-full border-slate-200/60 dark:border-slate-800 hover:shadow-lg hover:shadow-sky-500/5 transition-all"
    >
      {/* Card Image */}
      {issue.imageUrl && (
        <div className="relative h-48 overflow-hidden group bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
          {!imgError ? (
            <img
              src={issue.imageUrl}
              alt={issue.title}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="text-xs font-bold text-slate-400">No Image Available</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/10 to-transparent opacity-60"></div>
          <div className="absolute top-3 left-3 flex gap-1.5">
            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold tracking-wide uppercase ${getSeverityStyles(issue.severity)}`}>
              {issue.severity}
            </span>
            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold tracking-wide uppercase ${getStatusStyles(issue.status)}`}>
              {issue.status}
            </span>
          </div>
          <div className="absolute bottom-3 right-3 glass-card px-2 py-1 rounded-lg border-white/30 dark:border-white/10 flex items-center gap-1 shadow-sm">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Priority:</span>
            <span className={`text-xs font-black font-display ${getPriorityColor(issue.priorityScore)}`}>
              {issue.priorityScore}
            </span>
          </div>
        </div>
      )}

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
              {issue.category}
            </span>
            <span className="text-[10px] font-semibold text-slate-400">{formattedDate}</span>
          </div>
          <h4 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-sky-500 transition-colors">
            <Link to={`/issue/${issue.id}`}>{issue.title}</Link>
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3">
            {issue.description}
          </p>
        </div>

        {/* Card Footer */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold max-w-[140px] truncate">
            <MapPin className="h-3 w-3 shrink-0" />
            {issue.location.address}
          </span>

          <div className="flex gap-2">
            <button
              onClick={handleUpvote}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 font-bold text-[11px] transition-colors"
            >
              <ThumbsUp className="h-3 w-3" />
              <span>{issue.upvotes}</span>
            </button>

            <Link
              to={`/issue/${issue.id}`}
              className="flex items-center gap-0.5 px-2.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-bold text-[11px] transition-colors"
            >
              Details
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
