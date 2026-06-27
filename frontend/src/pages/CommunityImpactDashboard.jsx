import React from "react";
import { useApp } from "../context/AppContext";
import { useTheme } from "../context/ThemeContext";
import StatsCard from "../components/StatsCard";
import RecommendationCard from "../components/RecommendationCard";
import { FileText, CheckCircle, AlertCircle, TrendingUp, Sparkles, BarChart3, PieChart as PieIcon, LineChart } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, AreaChart, Area, CartesianGrid } from "recharts";
import { motion } from "framer-motion";

export default function CommunityImpactDashboard() {
  const { issues, getMetrics, workOrders, createWorkOrder } = useApp();
  const { theme } = useTheme();
  
  const { total, active, resolved, rate } = getMetrics();

  // Helper to calculate distance in meters
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // metres
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) *
        Math.cos(phi2) *
        Math.sin(deltaLambda / 2) *
        Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in metres
  };

  // Dynamic Category Calculation
  const getCategoryData = () => {
    const counts = {};
    issues.forEach((issue) => {
      if (issue.category) {
        counts[issue.category] = (counts[issue.category] || 0) + 1;
      }
    });

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  };

  // Dynamic Severity Calculation
  const getSeverityData = () => {
    const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    issues.forEach((issue) => {
      if (counts[issue.severity] !== undefined) {
        counts[issue.severity]++;
      }
    });

    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  };

  // Dynamic Monthly Progress (June onwards)
  const getMonthlyProgressData = () => {
    const monthlyData = {};

    issues.forEach(issue => {
      const date = new Date(issue.date);
      const monthName = date.toLocaleString("en-US", { month: "short" });
      const year = date.getFullYear();
      const key = `${monthName} ${year}`;
      
      const monthNum = date.getMonth();
      // Only display months starting June 2026
      if (year < 2026 || (year === 2026 && monthNum < 5)) {
        return;
      }

      if (!monthlyData[key]) {
        monthlyData[key] = { name: monthName, Reported: 0, Resolved: 0, order: year * 12 + monthNum };
      }
      monthlyData[key].Reported++;
      
      if (issue.status === "Resolved") {
        monthlyData[key].Resolved++;
      }
    });

    const sorted = Object.values(monthlyData).sort((a, b) => a.order - b.order);

    if (sorted.length === 0) {
      return [{ name: "Jun", Reported: 0, Resolved: 0 }];
    }

    return sorted.map(({ name, Reported, Resolved }) => ({ name, Reported, Resolved }));
  };

  // Dynamic AI Recommendations based on unresolved issues within ~300m grouping
  const getRecommendations = () => {
    const unresolved = issues.filter(i => i.status !== "Resolved");
    const groups = [];

    unresolved.forEach(issue => {
      let added = false;
      for (const group of groups) {
        if (group.category === issue.category) {
          const representative = group.issues[0];
          const distance = getDistance(
            issue.location.lat,
            issue.location.lng,
            representative.location.lat,
            representative.location.lng
          );
          if (distance <= 300) {
            group.issues.push(issue);
            added = true;
            break;
          }
        }
      }
      if (!added) {
        groups.push({
          category: issue.category,
          issues: [issue]
        });
      }
    });

    return groups.map((group, index) => {
      const first = group.issues[0];
      const area = first.location.address.split(",")[0] || "Specified Area";
      const count = group.issues.length;
      
      let action = "";
      let priority = "Medium";

      const hasCritical = group.issues.some(i => i.severity === "Critical");
      const hasHigh = group.issues.some(i => i.severity === "High");
      if (hasCritical || count >= 3) {
        priority = "High";
      } else if (hasHigh) {
        priority = "Medium";
      } else {
        priority = "Low";
      }

      switch (group.category) {
        case "Road Damage":
          action = `Schedule urgent resurfacing and overlay works for ${count} pothole/crack clusters.`;
          break;
        case "Waste Management":
          action = `Increase sanitation clearance frequency and deploy additional dumpster bins at ${area}.`;
          break;
        case "Streetlight Failures":
          action = `Dispatch utility crew to replace broken bulbs and inspect electrical wiring junctions.`;
          break;
        case "Water Supply":
          action = `Coordinate structural plumbing inspection to locate and patch pipeline leakages immediately.`;
          break;
        case "Utility Failures":
          action = `Request power grid maintenance crew to secure snapped cables and inspect high voltage installations.`;
          break;
        case "Public Facilities":
          action = `Assign municipal repair crew to reinforce safety fences and restore public infrastructure objects.`;
          break;
        default:
          action = `Deploy municipal maintenance teams to resolve reported local anomalies in the ${area} sector.`;
      }

      return {
        id: `rec-${index}`,
        issueId: first.id,
        area: area,
        issueCount: count,
        category: group.category,
        action: action,
        priority: priority,
      };
    });
  };

  const categoryData = getCategoryData();
  const severityData = getSeverityData();
  const trendData = getMonthlyProgressData();
  const recommendations = getRecommendations();

  // Recharts color palettes
  const COLORS = ["#0ea5e9", "#10b981", "#8b5cf6", "#f59e0b", "#f97316", "#ef4444"];
  const isDark = theme === "dark";

  // Recharts styling configs
  const textFill = isDark ? "#94a3b8" : "#475569";
  const gridStroke = isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(148, 163, 184, 0.1)";

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 transition-colors duration-300">
      
      {/* Title block */}
      <div className="space-y-1 text-center md:text-left">
        <h2 className="text-3xl font-display font-extrabold text-slate-900 dark:text-white">Community Impact Dashboard</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Analyze municipal response metrics, systemic issue distribution, and AI recommendations.
        </p>
      </div>

      {/* KPI Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatsCard title="Total Tickets Logged" value={total} icon={FileText} color="sky" />
        <StatsCard title="Active Inquiries" value={active} icon={AlertCircle} color="amber" />
        <StatsCard title="Resolved Issues" value={resolved} icon={CheckCircle} color="emerald" />
        <StatsCard title="Resolution Efficiency" value={`${rate}%`} icon={TrendingUp} color="violet" />
      </div>

      {/* Charts Grid section */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        
        {/* Category distribution donut */}
        <motion.div
          variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
          className="glass-card rounded-3xl border-slate-200/50 dark:border-slate-800/80 p-5 lg:col-span-1 shadow-md space-y-4"
        >
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <PieIcon className="h-4.5 w-4.5 text-sky-500" />
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Category Distribution
            </h4>
          </div>
          
          <div className="h-60 flex items-center justify-center">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? "#0f172a" : "#ffffff",
                      borderColor: isDark ? "#1e293b" : "#e2e8f0",
                      borderRadius: "12px",
                      color: isDark ? "#f8fafc" : "#0f172a"
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <span className="text-xs text-slate-400">No chart data</span>
            )}
          </div>
          
          {/* Custom legend grid */}
          <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-500">
            {categoryData.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-1.5 truncate">
                <span
                  className="inline-block w-2.5 h-2.5 rounded-sm shrink-0"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                ></span>
                <span className="truncate">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Severity distribution bar */}
        <motion.div
          variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
          className="glass-card rounded-3xl border-slate-200/50 dark:border-slate-800/80 p-5 lg:col-span-1 shadow-md space-y-4"
        >
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <BarChart3 className="h-4.5 w-4.5 text-sky-500" />
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Severity Analysis
            </h4>
          </div>
          
          <div className="h-68">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="name" tick={{ fill: textFill, fontSize: 10 }} />
                <YAxis tick={{ fill: textFill, fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? "#0f172a" : "#ffffff",
                    borderColor: isDark ? "#1e293b" : "#e2e8f0",
                    borderRadius: "12px"
                  }}
                />
                <Bar dataKey="count" fill="#38bdf8" radius={[6, 6, 0, 0]}>
                  {severityData.map((entry, index) => {
                    const color =
                      entry.name === "Critical"
                        ? "#f43f5e"
                        : entry.name === "High"
                        ? "#f59e0b"
                        : entry.name === "Medium"
                        ? "#0ea5e9"
                        : "#64748b";
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Resolution monthly area trend */}
        <motion.div
          variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
          className="glass-card rounded-3xl border-slate-200/50 dark:border-slate-800/80 p-5 lg:col-span-1 shadow-md space-y-4"
        >
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <LineChart className="h-4.5 w-4.5 text-sky-500" />
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Monthly Progress
            </h4>
          </div>
          
          <div className="h-68">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReported" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="name" tick={{ fill: textFill, fontSize: 10 }} />
                <YAxis tick={{ fill: textFill, fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? "#0f172a" : "#ffffff",
                    borderColor: isDark ? "#1e293b" : "#e2e8f0",
                    borderRadius: "12px"
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "10px", fontWeight: "bold" }} />
                <Area type="monotone" dataKey="Reported" stroke="#38bdf8" fillOpacity={1} fill="url(#colorReported)" strokeWidth={2.5} />
                <Area type="monotone" dataKey="Resolved" stroke="#34d399" fillOpacity={1} fill="url(#colorResolved)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </motion.div>

      {/* AI Recommendations Municipal Panel */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-sky-500" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI Municipal Recommendations</h3>
        </div>
        
        <div className="flex flex-col gap-4">
          {recommendations.length > 0 ? (
            recommendations.map((rec) => (
              <RecommendationCard
                key={rec.id}
                recommendation={rec}
                workOrders={workOrders}
                onCreateWorkOrder={createWorkOrder}
              />
            ))
          ) : (
            <div className="p-6 text-center rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-slate-450 font-medium text-xs">
              No pending verification requests.
            </div>
          )}
        </div>
      </div>

      {/* Active Work Orders Section */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-sky-500" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Active Work Orders</h3>
        </div>
        {workOrders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workOrders.map((wo) => (
              <div key={wo._id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 dark:border-slate-850 dark:bg-slate-900/40 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/10">
                    {wo.category}
                  </span>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/10">
                    {wo.status}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  Assigned: {wo.assignedDepartment}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {wo.recommendation}
                </p>
                <div className="text-[9px] text-slate-400 font-semibold uppercase pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between">
                  <span>Priority: {wo.priority}</span>
                  <span>Created: {new Date(wo.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-slate-450 font-medium text-xs">
            No work orders available.
          </div>
        )}
      </div>

    </div>
  );
}
