import React from "react";
import { Sparkles, ArrowRight, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

export default function RecommendationCard({ recommendation, workOrders = [], onCreateWorkOrder }) {
  const { id, issueId, area, issueCount, category, action, priority } = recommendation;
  const [loading, setLoading] = React.useState(false);

  const alreadyExists = workOrders.some((wo) => wo.issueId === issueId);

  const getPriorityStyles = (pri) => {
    switch (pri?.toLowerCase()) {
      case "high":
        return "bg-rose-500/10 text-rose-500 dark:text-rose-400";
      case "medium":
        return "bg-amber-500/10 text-amber-500 dark:text-amber-400";
      default:
        return "bg-sky-500/10 text-sky-500 dark:text-sky-400";
    }
  };

  const handleCreate = async () => {
    if (alreadyExists || loading) return;
    setLoading(true);
    try {
      let assignedDepartment = "Municipal Public Works";
      if (category === "Waste Management") assignedDepartment = "Sanitation & Waste Cleanups";
      if (category === "Streetlight Failures") assignedDepartment = "Electrical Grid Maintenance";
      if (category === "Water Supply") assignedDepartment = "Water Supply Infrastructure";
      if (category === "Utility Failures") assignedDepartment = "Electrical Grid Maintenance";
      if (category === "Public Facilities") assignedDepartment = "Public Infrastructure Repair";

      await onCreateWorkOrder({
        issueId,
        category,
        priority,
        assignedDepartment,
        recommendation: action,
      });
      alert("✓ Work Order Created Successfully!");
    } catch (error) {
      alert(error.message || "Failed to create work order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/40 relative overflow-hidden flex flex-col md:flex-row gap-4 items-start justify-between"
    >
      <div className="absolute top-0 right-0 p-3 opacity-5 dark:opacity-10 pointer-events-none">
        <Sparkles className="h-16 w-16 text-sky-500" />
      </div>

      <div className="space-y-3 flex-1">
        <div className="flex items-center gap-2">
          <span className="flex h-5 items-center gap-1 px-2.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-500/10 text-sky-600 dark:text-sky-400">
            <Sparkles className="h-3 w-3 animate-pulse" />
            AI Insight
          </span>
          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${getPriorityStyles(priority)}`}>
            {priority} Priority
          </span>
        </div>

        <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
          Systemic anomaly detected in <span className="text-sky-500 dark:text-sky-400">{area}</span>
        </h4>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
          We detected <span className="font-bold text-slate-800 dark:text-slate-200">{issueCount} {category.toLowerCase()} reports</span> within a 300m radius in the last 30 days. This indicates recurring structural failure.
        </p>

        <div className="flex items-start gap-2 bg-sky-50/50 dark:bg-sky-950/20 border border-sky-100/60 dark:border-sky-500/10 p-3.5 rounded-xl">
          <ShieldAlert className="h-4.5 w-4.5 text-sky-500 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Recommended Action:</span>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{action}</p>
          </div>
        </div>
      </div>

      <div className="w-full md:w-auto self-end md:self-center shrink-0">
        <button
          onClick={handleCreate}
          disabled={alreadyExists || loading}
          className={`flex w-full md:w-auto items-center justify-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer ${
            alreadyExists
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 cursor-not-allowed"
              : "bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 disabled:opacity-50"
          }`}
        >
          <span>{alreadyExists ? "✓ Work Order Created" : loading ? "Creating..." : "Create Work Order"}</span>
          {!alreadyExists && <ArrowRight className="h-4 w-4" />}
        </button>
      </div>
    </motion.div>
  );
}
