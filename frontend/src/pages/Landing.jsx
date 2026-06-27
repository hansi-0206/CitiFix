import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { AlertCircle, MapPin, Users, Award, ShieldAlert, ArrowRight, Brain, Zap, Heart, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import StatsCard from "../components/StatsCard";
import { issuesAPI } from "../services/api";

export default function Landing() {
  const { issues } = useApp();
  const [nearbyIssues, setNearbyIssues] = useState([]);
  const [useRealGPS, setUseRealGPS] = useState(false);

  useEffect(() => {
    const fetchNearby = async (latitude, longitude) => {
      try {
        const data = await issuesAPI.getNearbyIssues(latitude, longitude, 10000); // 10km radius
        const formatted = data.slice(0, 4).map((issue) => ({
          id: issue._id,
          category: issue.category,
          title: issue.title,
          imageUrl: issue.imageUrl,
          location: {
            address: issue.address,
            distance: "Within 10km"
          }
        }));
        setNearbyIssues(formatted);
      } catch (error) {
        console.error("Error fetching nearby issues:", error);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUseRealGPS(true);
          fetchNearby(position.coords.latitude, position.coords.longitude);
        },
        () => {
          fetchNearby(12.9716, 77.5946); // Default coordinates
        }
      );
    } else {
      fetchNearby(12.9716, 77.5946);
    }
  }, []);

  // Get first 3 recent active reports
  const recentReports = issues.slice(0, 3);

  // Statistics summaries
  const stats = [
    { title: "Active Reports", value: issues.filter(i => i.status !== "Resolved").length, icon: AlertCircle, color: "sky" },
    { title: "Resolved Issues", value: issues.filter(i => i.status === "Resolved").length, icon: CheckCircle2, color: "emerald" },
    { title: "Community Members", value: 1842, icon: Users, color: "violet" },
    { title: "Participation Score", value: "84%", icon: Award, color: "amber" }
  ];

  const features = [
    {
      title: "AI Analysis Engine",
      description: "Gemini models automatically extract categories, priority index, and recommend municipal dispatch targets.",
      icon: Brain
    },
    {
      title: "Duplicate Safeguards",
      description: "Our system cross-references GPS tags within 150 meters to prevent duplicate civic tickets.",
      icon: ShieldAlert
    },
    {
      title: "Reputation Mechanics",
      description: "Submit verified reports, support neighbors' filings, and earn community points and honorary titles.",
      icon: Award
    },
    {
      title: "Instant Verification",
      description: "Integrates flow sensors and automated community validation algorithms for instant confirmation.",
      icon: Zap
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-white transition-colors duration-300 relative overflow-hidden bg-grid-pattern pb-12">
      
      {/* Background radial gradients for premium feel */}
      <div className="absolute top-0 left-1/4 h-[400px] w-[400px] rounded-full bg-sky-500/10 dark:bg-sky-500/5 blur-3xl -z-10"></div>
      <div className="absolute top-1/3 right-1/4 h-[500px] w-[500px] rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-3xl -z-10"></div>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 md:pt-24 md:pb-20 text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/25">
            <Brain className="h-3.5 w-3.5" />
            AI-Driven Civic Technology
          </span>
          
          <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight md:leading-none">
            CitiFix – AI-Powered Community <span className="text-gradient">Issue Detection</span> &amp; Resolution Platform
          </h1>
          
          <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium">
            Report. Track. Improve Your Community. Bridging the gap between active citizens and municipal operations through real-time AI classification.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link
              to="/report"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold shadow-lg shadow-sky-500/20 hover:shadow-sky-500/35 transition-all duration-300"
            >
              Report an Issue
              <ArrowRight className="h-5 w-5" />
            </Link>
            
            <Link
              to="/map"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-slate-900 border border-slate-200/80 hover:bg-slate-50 dark:bg-slate-900 dark:text-white dark:border-slate-800 dark:hover:bg-slate-800 font-bold shadow-sm transition-all duration-300"
            >
              Explore Community Map
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Statistics Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, i) => (
            <StatsCard
              key={i}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
            />
          ))}
        </div>
      </section>

      {/* Two-Column Content: Nearby Issues & Feature Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Nearby Issues Widget (1 Col) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="glass-card p-6 rounded-3xl border-slate-200/60 dark:border-slate-800/80 shadow-md space-y-6"
        >
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="h-5 w-5 text-sky-500 animate-bounce" />
              Issues Near You
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Based on mock GPS georeferencing</p>
          </div>

          <div className="space-y-3">
            {(nearbyIssues.length > 0 ? nearbyIssues : issues.slice(0, 4)).map((issue, idx) => (
              <Link
                to={`/issue/${issue.id}`}
                key={issue.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-100/50 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-900 border border-slate-200/20 dark:border-slate-800/20 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200/20">
                    <img src={issue.imageUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-950 dark:text-white group-hover:text-sky-500 transition-colors">
                      {issue.category}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-medium">{issue.location.address.split(",")[0]}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    {issue.location.distance || "300m away"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Features list (2 Cols) */}
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-2">
            <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest">Platform Core</span>
            <h2 className="text-2xl md:text-3xl font-display font-extrabold text-slate-900 dark:text-white leading-tight">
              A Platform Engineered for Accountability
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl">
              Using advanced algorithms, CitiFix automates categorizations, checks redundancy, and tracks resolution timelines down to the minute.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card p-5 rounded-2xl border-slate-200/50 dark:border-slate-800/60 shadow-sm flex items-start gap-4"
                >
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center border border-sky-500/10">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">{feature.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{feature.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Recent Reports Carousel / Feed Block */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-end justify-between mb-8">
          <div className="space-y-1">
            <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest">Community Stream</span>
            <h3 className="text-2xl font-display font-extrabold text-slate-900 dark:text-white">Recent Reports</h3>
          </div>
          <Link
            to="/feed"
            className="flex items-center gap-1 text-sm font-bold text-sky-600 dark:text-sky-400 hover:gap-2 transition-all"
          >
            <span>View All Stream</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentReports.map((issue) => (
            <motion.div
              key={issue.id}
              whileHover={{ y: -4 }}
              className="glass-card rounded-2xl overflow-hidden border-slate-200/65 dark:border-slate-850 flex flex-col justify-between shadow-sm"
            >
              <div className="h-40 overflow-hidden relative">
                <img src={issue.imageUrl} alt="" className="w-full h-full object-cover" />
                <span className="absolute top-3 left-3 text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-slate-950/85 backdrop-blur-md text-amber-400">
                  {issue.category}
                </span>
                <span className="absolute bottom-3 right-3 text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-rose-500 text-white">
                  Priority: {issue.priorityScore}
                </span>
              </div>
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <h4 className="text-sm font-extrabold text-slate-950 dark:text-white line-clamp-1">
                    {issue.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {issue.description}
                  </p>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span>Reported by {issue.reportedBy}</span>
                  <span className="font-bold text-sky-500">{issue.status}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
      
    </div>
  );
}
