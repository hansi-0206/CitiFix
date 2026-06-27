import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AppProvider } from "./context/AppContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ReportIssue from "./pages/ReportIssue";
import CommunityMap from "./pages/CommunityMap";
import IssuesFeed from "./pages/IssuesFeed";
import IssueDetails from "./pages/IssueDetails";
import UserProfile from "./pages/UserProfile";
import CommunityImpactDashboard from "./pages/CommunityImpactDashboard";

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <Router>
          <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/report" element={<ReportIssue />} />
                <Route path="/map" element={<CommunityMap />} />
                <Route path="/feed" element={<IssuesFeed />} />
                <Route path="/issue/:id" element={<IssueDetails />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/impact" element={<CommunityImpactDashboard />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AppProvider>
    </ThemeProvider>
  );
}
