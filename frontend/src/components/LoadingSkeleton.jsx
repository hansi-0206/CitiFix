import React from "react";

export default function LoadingSkeleton({ type = "card", count = 3 }) {
  const cards = Array(count).fill(0);

  if (type === "list") {
    return (
      <div className="space-y-4 w-full">
        {cards.map((_, i) => (
          <div
            key={i}
            className="w-full h-24 rounded-2xl bg-slate-200/50 dark:bg-slate-800/40 animate-pulse border border-slate-200/20 dark:border-slate-800/20 flex items-center justify-between p-4"
          >
            <div className="flex gap-4 items-center w-2/3">
              <div className="w-16 h-16 rounded-xl bg-slate-300 dark:bg-slate-700 shrink-0"></div>
              <div className="space-y-2 w-full">
                <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-1/3"></div>
                <div className="h-3 bg-slate-300 dark:bg-slate-700 rounded w-2/3"></div>
                <div className="h-2.5 bg-slate-300 dark:bg-slate-700 rounded w-1/2"></div>
              </div>
            </div>
            <div className="w-16 h-8 rounded-lg bg-slate-300 dark:bg-slate-700"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      {cards.map((_, i) => (
        <div
          key={i}
          className="h-[340px] rounded-2xl bg-slate-200/50 dark:bg-slate-800/40 animate-pulse border border-slate-200/20 dark:border-slate-800/20 flex flex-col justify-between p-5"
        >
          <div className="space-y-4">
            <div className="w-full h-40 rounded-xl bg-slate-300 dark:bg-slate-700"></div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-1/2"></div>
              <div className="h-3 bg-slate-300 dark:bg-slate-700 rounded w-5/6"></div>
              <div className="h-3 bg-slate-300 dark:bg-slate-700 rounded w-2/3"></div>
            </div>
          </div>
          <div className="h-8 bg-slate-300 dark:bg-slate-700 rounded-lg w-1/3 self-end"></div>
        </div>
      ))}
    </div>
  );
}
