import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import IssueCard from "../components/IssueCard";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { Grid, List, Search, SortAsc, RefreshCw, SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function IssuesFeed() {
  const { issues } = useApp();

  // Search & Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  
  // Sorting State
  const [sortBy, setSortBy] = useState("newest");
  
  // Layout State: grid vs list
  const [layoutMode, setLayoutMode] = useState("grid");

  // Simulated Loader State
  const [isLoading, setIsLoading] = useState(false);

  // Trigger brief simulation of loading whenever filters change
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [categoryFilter, severityFilter, statusFilter, sortBy]);

  // Handle clearing
  const handleClearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("All");
    setSeverityFilter("All");
    setStatusFilter("All");
    setSortBy("newest");
  };

  // Filter and Sort calculation
  const processIssues = () => {
    let result = [...issues];

    // Search matches
    if (searchTerm) {
      result = result.filter(
        (issue) =>
          issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          issue.location.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category Filter
    if (categoryFilter !== "All") {
      result = result.filter((issue) => issue.category === categoryFilter);
    }

    // Severity Filter
    if (severityFilter !== "All") {
      result = result.filter((issue) => issue.severity === severityFilter);
    }

    // Status Filter
    if (statusFilter !== "All") {
      result = result.filter((issue) => issue.status === statusFilter);
    }

    // Sorting
    if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortBy === "upvotes") {
      result.sort((a, b) => b.upvotes - a.upvotes);
    } else if (sortBy === "priority") {
      result.sort((a, b) => b.priorityScore - a.priorityScore);
    }

    return result;
  };

  const processedIssues = processIssues();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 transition-colors duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-display font-extrabold text-slate-900 dark:text-white">Issues Feed</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Track ongoing incident resolution workflows, upvote community concerns, and inspect timelines.
          </p>
        </div>

        {/* Layout Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200/40 dark:border-slate-800/40">
          <button
            onClick={() => setLayoutMode("grid")}
            className={`p-2 rounded-xl cursor-pointer ${
              layoutMode === "grid"
                ? "bg-white text-slate-950 dark:bg-slate-800 dark:text-white shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
            title="Grid View"
          >
            <Grid className="h-4.5 w-4.5" />
          </button>
          
          <button
            onClick={() => setLayoutMode("list")}
            className={`p-2 rounded-xl cursor-pointer ${
              layoutMode === "list"
                ? "bg-white text-slate-950 dark:bg-slate-800 dark:text-white shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
            title="List View"
          >
            <List className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {/* Search & Filters block */}
      <div className="glass-card rounded-2xl p-5 border-slate-200/50 dark:border-slate-800/80 shadow-md space-y-4">
        
        {/* Row 1: Search & Sorting */}
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full md:flex-1">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
              <Search className="h-4.5 w-4.5" />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by keywords (e.g. pothole, Sector 7, broken)..."
              className="block w-full pl-10.5 pr-4 py-2.5 bg-slate-100/50 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-900 focus:bg-white dark:focus:bg-dark-900 border border-slate-200 dark:border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-xl text-xs font-semibold outline-none transition-all"
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto shrink-0 items-center justify-between">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
              <SortAsc className="h-4 w-4 text-sky-500" />
              Sort By:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold outline-none cursor-pointer"
            >
              <option value="newest">Newest Reports</option>
              <option value="upvotes">Most Upvoted</option>
              <option value="priority">Highest Priority</option>
            </select>
          </div>
        </div>

        {/* Row 2: Category, Severity, Status Filters */}
        <div className="pt-2 border-t border-slate-150/40 dark:border-slate-800/40 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap items-center gap-3.5">
            {/* Category select */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Category</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-100/50 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800 rounded-xl text-xs font-semibold outline-none cursor-pointer"
              >
                <option value="All">All Categories</option>
                <option value="Road Damage">Road Damage</option>
                <option value="Waste Management">Waste Management</option>
                <option value="Streetlight Failures">Streetlight Failures</option>
                <option value="Water Supply">Water Supply</option>
                <option value="Public Facilities">Public Facilities</option>
                <option value="Utility Failures">Utility Failures</option>
              </select>
            </div>

            {/* Severity select */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Severity</span>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-100/50 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800 rounded-xl text-xs font-semibold outline-none cursor-pointer"
              >
                <option value="All">All Severities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* Status select */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Status</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-100/50 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800 rounded-xl text-xs font-semibold outline-none cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Reported">Reported</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>

          {/* Reset button */}
          {(searchTerm || categoryFilter !== "All" || severityFilter !== "All" || statusFilter !== "All" || sortBy !== "newest") && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 hover:bg-slate-250 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Stream results container */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <LoadingSkeleton type={layoutMode === "list" ? "list" : "card"} count={layoutMode === "list" ? 4 : 6} />
            </motion.div>
          ) : processedIssues.length > 0 ? (
            <motion.div
              key="feed-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={
                layoutMode === "list"
                  ? "flex flex-col gap-4 w-full"
                  : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              }
            >
              {processedIssues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} viewMode={layoutMode} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="py-16 text-center glass-card rounded-3xl border-slate-200/50 dark:border-slate-800/80 p-8 max-w-md mx-auto space-y-4"
            >
              <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-500 flex items-center justify-center border border-slate-200/20 mx-auto">
                <SlidersHorizontal className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">No issues found</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Try adjusting your search criteria, category filters, or severities to find matches.
                </p>
              </div>
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs rounded-xl shadow transition-colors"
              >
                Clear all filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
