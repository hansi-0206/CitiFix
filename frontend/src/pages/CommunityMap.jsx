import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import MapView from "../components/MapView";
import { Search, Map, Activity, Filter, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

export default function CommunityMap() {
  const { issues } = useApp();
  
  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSeverity, setSelectedSeverity] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  
  // View Toggle State: standard map vs heatmap
  const [isHeatmap, setIsHeatmap] = useState(false);

  // Filter Issues
  const filteredIssues = issues.filter((issue) => {
    const matchesSearch =
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.location.address.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === "All" || issue.category === selectedCategory;
    const matchesSeverity = selectedSeverity === "All" || issue.severity === selectedSeverity;
    const matchesStatus = selectedStatus === "All" || issue.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesSeverity && matchesStatus;
  });

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setSelectedSeverity("All");
    setSelectedStatus("All");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 transition-colors duration-300">
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-display font-extrabold text-slate-900 dark:text-white">Community Map</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time geospatial layout of local complaints. Toggle heatmap view to analyze density clusters.
          </p>
        </div>

        {/* View togglers */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 self-start md:self-center">
          <button
            onClick={() => setIsHeatmap(false)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              !isHeatmap
                ? "bg-white text-slate-950 dark:bg-slate-800 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Map className="h-4 w-4" />
            Standard Pins
          </button>
          
          <button
            onClick={() => setIsHeatmap(true)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              isHeatmap
                ? "bg-white text-slate-950 dark:bg-slate-800 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Activity className="h-4 w-4" />
            Heatmap View
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card rounded-2xl p-5 border-slate-200/50 dark:border-slate-800/80 shadow-md space-y-4">
        
        {/* Search */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
            <Search className="h-4.5 w-4.5" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search issues by keyword, title, neighborhood..."
            className="block w-full pl-10.5 pr-4 py-3 bg-slate-100/50 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-900 focus:bg-white dark:focus:bg-dark-900 border border-slate-200 dark:border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-xl text-sm font-semibold outline-none transition-all"
          />
        </div>

        {/* Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
          {/* Category */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="block w-full px-3 py-2 bg-slate-100/60 dark:bg-slate-900 border border-slate-250/20 dark:border-slate-800 rounded-xl text-xs font-semibold outline-none"
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

          {/* Severity */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Severity</span>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="block w-full px-3 py-2 bg-slate-100/60 dark:bg-slate-900 border border-slate-250/20 dark:border-slate-800 rounded-xl text-xs font-semibold outline-none"
            >
              <option value="All">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Status */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="block w-full px-3 py-2 bg-slate-100/60 dark:bg-slate-900 border border-slate-250/20 dark:border-slate-800 rounded-xl text-xs font-semibold outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Reported">Reported</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          {/* Reset / Actions */}
          <div className="pt-5 flex justify-end">
            {(searchTerm || selectedCategory !== "All" || selectedSeverity !== "All" || selectedStatus !== "All") ? (
              <button
                onClick={clearFilters}
                className="flex w-full sm:w-auto items-center justify-center gap-1.5 px-4 py-2 bg-slate-200 hover:bg-slate-350 dark:bg-slate-850 dark:hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Clear Filters
              </button>
            ) : (
              <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                <Filter className="h-3.5 w-3.5 text-sky-500" />
                <span>Showing {filteredIssues.length} points</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Vector Map Container */}
      <MapView issues={filteredIssues} isHeatmap={isHeatmap} />

    </div>
  );
}
