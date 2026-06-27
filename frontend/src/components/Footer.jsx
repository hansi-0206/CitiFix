import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, Github, Twitter, Globe, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-12 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Logo & Description */}
          <div className="space-y-4 md:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500 shadow-md shadow-sky-500/20">
                <ShieldAlert className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="font-display text-lg font-bold tracking-tight text-white">
                Citi<span className="text-sky-400">Fix</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm">
              An AI-powered civic platform bridging the gap between active citizens and municipal corporations. Report local issues, track resolution timelines, and earn community recognition.
            </p>
            <p className="text-xs text-slate-500">
              CitiFix &copy; 2026. Made with precision for hackathon demos.
            </p>
          </div>

          {/* Site Map */}
          <div>
            <h3 className="font-display text-sm font-semibold text-slate-200 tracking-wider uppercase mb-4">
              Explore
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/map" className="hover:text-white transition-colors">
                  Community Map
                </Link>
              </li>
              <li>
                <Link to="/feed" className="hover:text-white transition-colors">
                  Issues Feed
                </Link>
              </li>
              <li>
                <Link to="/impact" className="hover:text-white transition-colors">
                  Impact Dashboard
                </Link>
              </li>
              <li>
                <Link to="/report" className="hover:text-white transition-colors font-semibold text-sky-400 hover:text-sky-300">
                  Report an Issue
                </Link>
              </li>
            </ul>
          </div>

          {/* Socials & Support */}
          <div>
            <h3 className="font-display text-sm font-semibold text-slate-200 tracking-wider uppercase mb-4">
              Resources
            </h3>
            <ul className="space-y-2 text-sm mb-4">
              <li>
                <span className="hover:text-white cursor-pointer transition-colors">Municipal API Portal</span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
              </li>
            </ul>
            <div className="flex gap-4">
              <span className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer hover:bg-slate-700 transition-all">
                <Twitter className="h-4 w-4" />
              </span>
              <span className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer hover:bg-slate-700 transition-all">
                <Github className="h-4 w-4" />
              </span>
              <span className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer hover:bg-slate-700 transition-all">
                <Globe className="h-4 w-4" />
              </span>
            </div>
          </div>
        </div>

        {/* Footer bottom */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <span>Admin Control Panel (Demo mode active)</span>
          </div>
          <div className="flex items-center gap-1 mt-4 sm:mt-0">
            <span>Powered by Gemini &amp; Antigravity</span>
            <Heart className="h-3 w-3 text-rose-500 fill-rose-500" />
            <span>in standard workspace</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
