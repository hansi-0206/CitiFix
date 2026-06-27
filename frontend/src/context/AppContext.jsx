import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authAPI, issuesAPI, workOrdersAPI } from "../services/api";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [issues, setIssues] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all issues from backend database
  const fetchIssues = useCallback(async (filters = {}) => {
    try {
      const data = await issuesAPI.getIssues(filters);
      // Map database format to frontend schema formatting if needed
      const formatted = data.map((issue) => {
        const severity = issue.ai?.severity || issue.severity || "Medium";
        return {
          id: issue._id,
          title: issue.title,
          category: issue.ai?.category || issue.category,
          description: issue.description,
          aiSummary: issue.ai?.summary || issue.aiSummary,
          severity: severity,
          priorityScore: issue.ai?.priorityScore || issue.priorityScore || 50,
          aiConfidence: issue.ai?.confidence || 95,
          status: issue.status,
          upvotes: issue.upvotes.length,
          upvotedUsers: issue.upvotes, // track who upvoted
          date: issue.createdAt,
          reportedBy: issue.reportedBy?.name || "Anonymous Citizen",
          userAvatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(issue.reportedBy?.name || "Citizen")}`,
          location: {
            address: issue.address,
            lat: issue.location.coordinates[1], // latitude is index 1
            lng: issue.location.coordinates[0], // longitude is index 0
            distance: "300m away", // visual default
          },
          imageUrl: issue.imageUrl,
          confirmations: issue.confirmations || [],
          recommendedAction: issue.ai?.recommendedAction || issue.recommendedDepartment + " Dispatch Action",
          estimatedResolution:
            severity === "Critical"
              ? "1 day"
              : severity === "High"
              ? "3 days"
              : severity === "Medium"
              ? "5 days"
              : "7 days",
        };
      });
      setIssues(formatted);
    } catch (error) {
      console.error("Error fetching issues from MERN backend:", error);
    }
  }, []);

  // Fetch current logged-in user profile
  const fetchUserProfile = useCallback(async () => {
    const token = localStorage.getItem("citifix_token");
    if (!token) {
      setCurrentUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const profile = await authAPI.getProfile();
      setCurrentUser({
        id: profile._id,
        name: profile.name,
        email: profile.email,
        reputationPoints: profile.points,
        badge: profile.badge,
        role: profile.role || "Citizen",
        avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(profile.name)}`,
        joinedDate: profile.createdAt,
      });
    } catch (error) {
      console.error("Session expired or token invalid:", error);
      localStorage.removeItem("citifix_token");
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch all work orders from backend database
  const fetchWorkOrders = useCallback(async () => {
    try {
      const data = await workOrdersAPI.getWorkOrders();
      setWorkOrders(data);
    } catch (error) {
      console.error("Error fetching work orders:", error);
    }
  }, []);

  const createWorkOrder = async (workOrderData) => {
    try {
      const data = await workOrdersAPI.createWorkOrder(workOrderData);
      await fetchWorkOrders();
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Error creating work order");
    }
  };

  // Initialize MERN loading sequence
  useEffect(() => {
    const initializeApp = async () => {
      await fetchUserProfile();
      await fetchIssues();
      await fetchWorkOrders();
    };
    initializeApp();
  }, [fetchUserProfile, fetchIssues, fetchWorkOrders]);

  // Sign In function
  const login = async (email, password) => {
    try {
      const data = await authAPI.login({ email, password });
      localStorage.setItem("citifix_token", data.token);
      setCurrentUser({
        id: data._id,
        name: data.name,
        email: data.email,
        reputationPoints: data.points,
        badge: data.badge,
        role: data.role || "Citizen",
        avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(data.name)}`,
        joinedDate: data.createdAt,
      });
      await fetchIssues();
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Invalid credentials");
    }
  };

  // Sign Up function
  const signup = async (name, email, password) => {
    try {
      const data = await authAPI.register({ name, email, password });
      localStorage.setItem("citifix_token", data.token);
      setCurrentUser({
        id: data._id,
        name: data.name,
        email: data.email,
        reputationPoints: data.points,
        badge: data.badge,
        role: data.role || "Citizen",
        avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(data.name)}`,
        joinedDate: data.createdAt,
      });
      await fetchIssues();
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Registration failed");
    }
  };

  // Sign Out function
  const logout = () => {
    localStorage.removeItem("citifix_token");
    setCurrentUser(null);
  };

  // Upvote issue
  const upvoteIssue = async (issueId) => {
    try {
      await issuesAPI.upvoteIssue(issueId);
      // Re-fetch profile and issues to sync points & upvote count
      await fetchUserProfile();
      await fetchIssues();
    } catch (error) {
      console.warn("Upvote check warning:", error.response?.data?.message || error.message);
    }
  };

  // Submit a new issue (handles multipart/form-data for real photo upload)
  const reportIssue = async (newIssueFormData) => {
    try {
      const result = await issuesAPI.createIssue(newIssueFormData);
      await fetchUserProfile();
      await fetchIssues();
      return result;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Error filing report");
    }
  };

  // Run dynamic Gemini AI analysis on the uploaded photo + optional description
  const analyzeIssue = async (analyzeFormData) => {
    try {
      const result = await issuesAPI.analyzeIssue(analyzeFormData);
      return result;
    } catch (error) {
      throw new Error(error.response?.data?.message || "AI analysis unavailable. Please try again.");
    }
  };

  // Check duplicate near coordinates within 100 meters
  const checkForDuplicate = async (lat, lng, category) => {
    if (!lat || !lng) return null;
    try {
      const data = await issuesAPI.checkDuplicate({
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
        category,
      });
      if (data.duplicateFound) {
        // Format duplicate issue structure to match frontend layout
        const dup = data.existingIssue;
        return {
          id: dup._id,
          title: dup.title,
          category: dup.ai?.category || dup.category,
          description: dup.description,
          reportedBy: dup.reportedBy?.name || "Citizen",
          upvotes: dup.upvotes?.length || 0,
        };
      }
      return null;
    } catch (error) {
      console.error("Duplicate check error:", error);
      return null;
    }
  };

  // Update status (marks as In Progress or Resolved)
  const resolveIssue = async (issueId, targetStatus = "Resolved") => {
    try {
      await issuesAPI.updateStatus(issueId, targetStatus);
      await fetchUserProfile();
      await fetchIssues();
    } catch (error) {
      console.error("Error updating issue status:", error);
      throw error;
    }
  };

  // Citizen confirms resolution
  const confirmResolved = async (issueId) => {
    try {
      await issuesAPI.confirmResolved(issueId);
      await fetchUserProfile();
      await fetchIssues();
    } catch (error) {
      console.error("Error confirming resolved status:", error);
      throw error;
    }
  };

  // Get metrics for dashboard
  const getMetrics = () => {
    const total = issues.length;
    const active = issues.filter((i) => i.status !== "Resolved").length;
    const resolved = issues.filter((i) => i.status === "Resolved").length;
    const rate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    return {
      total,
      active,
      resolved,
      rate,
    };
  };

  return (
    <AppContext.Provider
      value={{
        issues,
        workOrders,
        currentUser,
        isLoading,
        login,
        signup,
        logout,
        upvoteIssue,
        reportIssue,
        analyzeIssue,
        checkForDuplicate,
        resolveIssue,
        confirmResolved,
        getMetrics,
        createWorkOrder,
        refreshDashboard: async () => {
          await fetchIssues();
          await fetchWorkOrders();
        },
        refreshIssues: fetchIssues,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
