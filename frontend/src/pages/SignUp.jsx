import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Eye, EyeOff, Mail, Lock, User, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function SignUp() {
  const { signup } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    try {
      setError("");
      await signup(name, email, password);
      setSuccess(true);
      setTimeout(() => {
        navigate("/profile");
      }, 1500);
    } catch (err) {
      setSuccess(false);
      setError(err.message || "Registration failed. Please check your credentials.");
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-dark-950 flex flex-col justify-start items-center px-4 relative overflow-hidden bg-grid-pattern lg:pt-8 md:pt-6 pt-4 lg:pb-16 md:pb-12 pb-8 transition-colors duration-300">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-sky-500/10 dark:bg-sky-500/5 blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 h-[500px] w-[500px] rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-3xl pointer-events-none -z-10"></div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[560px] z-10 flex flex-col items-center"
      >
        {/* Logo Shield Header */}
        <div className="flex flex-col items-center mb-4 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 shadow-md">
            <AlertCircle className="h-6 w-6 text-white" />
          </div>
          <h1 className="font-display text-xl font-bold tracking-tight text-slate-905 dark:text-white mt-3">
            Citi<span className="text-sky-500 dark:text-sky-400">Fix</span>
          </h1>
        </div>

        {/* Auth Card */}
        <div className="glass-card rounded-[24px] border-slate-200/60 dark:border-slate-800/80 shadow-2xl p-8 sm:p-10 w-full">
          {/* Header text */}
          <div className="text-center">
            <h2 className="font-display text-[38px] font-black text-slate-900 dark:text-white leading-tight">
              Join CitiFix
            </h2>
            <p className="text-[17px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed mt-2.5">
              Create your citizen account and start improving your community.
            </p>
          </div>

          {/* Secure Portal Info Card */}
          <div className="p-5 rounded-2xl bg-sky-500/5 dark:bg-sky-500/5 border border-sky-500/10 dark:border-sky-500/15 space-y-2 mt-5">
            <div className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 font-black text-[13px] uppercase tracking-wider">
              🛡 Secure Municipal Portal
            </div>
            <p className="text-xs font-semibold text-sky-655 dark:text-sky-400 leading-normal text-left">
              Municipal Officers do not register here. Officer accounts are created by the city administration.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-bold text-rose-500 mt-4">
              {error}
            </div>
          )}

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center text-center space-y-4 py-8"
            >
              <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Account Created!</h3>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">Awarded +10 Points &amp; Civic Contributor Badge</p>
                <p className="text-xs text-slate-400">Redirecting to profile...</p>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 mt-6">
              <div className="space-y-1.5">
                <label className="text-[15px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                    <User className="h-5 w-5" />
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-100/50 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-900 focus:bg-white dark:focus:bg-dark-900 border border-slate-200 dark:border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-2xl text-[16px] font-semibold outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[15px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                    <Mail className="h-5 w-5" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-100/50 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-900 focus:bg-white dark:focus:bg-dark-900 border border-slate-200 dark:border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-2xl text-[16px] font-semibold outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[15px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                    <Lock className="h-5 w-5" />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-11 pr-10 py-3.5 bg-slate-100/50 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-900 focus:bg-white dark:focus:bg-dark-900 border border-slate-200 dark:border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-2xl text-[16px] font-semibold outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-sky-500/15 hover:shadow-sky-500/25 transition-all cursor-pointer text-[17px] mt-2 pt-3.5 pb-3.5"
              >
                Create Account
              </button>
            </form>
          )}

          <div className="text-center pt-5">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Already have an account?{" "}
              <Link to="/login" className="font-bold text-sky-500 hover:underline">
                Sign In
              </Link>
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
