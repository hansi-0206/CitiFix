import React from "react";
import { Sparkles, Check, Brain, ShieldAlert, Cpu, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AIAnalysisCard({ analysis, isScanning }) {
  const { category, severity, priorityScore, confidence, action, summary, error } = analysis;

  const getSeverityBadgeColor = (sev) => {
    switch (sev?.toLowerCase()) {
      case "critical":
        return "bg-rose-500/10 text-rose-500 border border-rose-500/20";
      case "high":
        return "bg-amber-500/10 text-amber-500 border border-amber-500/20";
      case "medium":
        return "bg-sky-500/10 text-sky-500 border border-sky-500/20";
      default:
        return "bg-slate-500/10 text-slate-500 border border-slate-500/20";
    }
  };

  const getPriorityColor = (score) => {
    if (score >= 90) return "text-rose-500";
    if (score >= 70) return "text-amber-500";
    return "text-sky-500";
  };

  return (
    <div className="glass-card rounded-2xl p-6 border-slate-200/60 dark:border-slate-800/80 shadow-md relative overflow-hidden h-full">
      {/* Background glow */}
      <div className="absolute -top-12 -right-12 h-24 w-24 rounded-full bg-sky-500/10 blur-xl"></div>
      <div className="absolute -bottom-12 -left-12 h-24 w-24 rounded-full bg-indigo-500/10 blur-xl"></div>

      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-500">
            <Cpu className="h-4.5 w-4.5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">CitiFix AI Engine</h3>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Real-time inference</span>
          </div>
        </div>
        <span className="flex h-5 items-center gap-1 px-2.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-500/10 text-sky-600 dark:text-sky-400">
          <Sparkles className="h-3 w-3" />
          Gemini 3.5 Coprocessor
        </span>
      </div>

      <div className="mt-5 relative min-h-[220px] flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {isScanning ? (
            <motion.div
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center space-y-4 py-8"
            >
              {/* Spinning / pulsing scanner animation */}
              <div className="relative h-16 w-16 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-sky-500/10 border-t-sky-500 animate-spin"></div>
                <Brain className="h-8 w-8 text-sky-500 animate-pulse" />
              </div>
              <div className="space-y-1.5 text-center">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Analyzing report attributes...</p>
                <p className="text-xs text-slate-400 animate-pulse">Running object detection & local prioritization models</p>
              </div>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center space-y-3 py-8 text-center px-4"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-500 shrink-0">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <p className="text-xs font-bold text-rose-600 dark:text-rose-400 leading-relaxed max-w-xs break-words">
                {typeof error === "string" ? error : "AI analysis unavailable. Please try again."}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* Category, Severity, Priority grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Suggested Category</span>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white">{category || "Unclassified"}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Severity Level</span>
                  <div>
                    <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${getSeverityBadgeColor(severity)}`}>
                      {severity || "Pending"}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Priority Score</span>
                  <p className={`text-xl font-display font-black leading-none ${getPriorityColor(priorityScore)}`}>
                    {priorityScore || "--"}/100
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confidence Level</span>
                  <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                    <Check className="h-3.5 w-3.5" />
                    {confidence || 0}%
                  </p>
                </div>
              </div>

              {/* Recommended action */}
              <div className="p-3 bg-slate-100/50 dark:bg-slate-800/40 rounded-xl space-y-1 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <ShieldAlert className="h-3 w-3 text-sky-500" />
                  Recommended Action
                </span>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {action || "Inspection required to verify anomaly details."}
                </p>
              </div>

              {/* Generated summary */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Generated Summary</span>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic">
                  "{summary || "Submit descriptive text or photos to generate automatic incident brief."}"
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
