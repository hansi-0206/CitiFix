import React from "react";
import { motion } from "framer-motion";

export default function StatsCard({ title, value, icon: Icon, change, isPositive, color }) {
  // Map Tailwind gradient colors based on prop
  const colorMap = {
    sky: "from-sky-500/10 to-blue-500/5 text-sky-600 dark:text-sky-400 dark:from-sky-500/15 dark:to-transparent",
    emerald: "from-emerald-500/10 to-teal-500/5 text-emerald-600 dark:text-emerald-400 dark:from-emerald-500/15 dark:to-transparent",
    amber: "from-amber-500/10 to-orange-500/5 text-amber-600 dark:text-amber-400 dark:from-amber-500/15 dark:to-transparent",
    violet: "from-violet-500/10 to-indigo-500/5 text-violet-600 dark:text-violet-400 dark:from-violet-500/15 dark:to-transparent",
  };

  const selectedColorClass = colorMap[color] || colorMap.sky;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.3 }}
      className="glass-card glass-card-hover p-6 rounded-2xl flex items-center justify-between"
    >
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        <h3 className="text-3xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
          {value}
        </h3>
        
        {change && (
          <div className="flex items-center gap-1.5 pt-1">
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                isPositive
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
              }`}
            >
              {change}
            </span>
            <span className="text-[10px] font-medium text-slate-400">vs last month</span>
          </div>
        )}
      </div>

      <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${selectedColorClass} flex items-center justify-center border border-white/20 dark:border-white/5 shadow-sm`}>
        <Icon className="h-6 w-6" />
      </div>
    </motion.div>
  );
}
