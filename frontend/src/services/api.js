import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Auto-attach JWT bearer tokens to all outgoing requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("citifix_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API Endpoints
export const authAPI = {
  register: async (userData) => {
    const response = await API.post("/auth/register", userData);
    return response.data;
  },
  login: async (credentials) => {
    const response = await API.post("/auth/login", credentials);
    return response.data;
  },
  getProfile: async () => {
    const response = await API.get("/auth/profile");
    return response.data;
  },
};

// Issues API Endpoints
export const issuesAPI = {
  getIssues: async (filters = {}) => {
    const { category, severity, status, search } = filters;
    const params = new URLSearchParams();
    if (category) params.append("category", category);
    if (severity) params.append("severity", severity);
    if (status) params.append("status", status);
    if (search) params.append("search", search);

    const response = await API.get(`/issues?${params.toString()}`);
    return response.data;
  },
  getIssueById: async (id) => {
    const response = await API.get(`/issues/${id}`);
    return response.data;
  },
  createIssue: async (formData) => {
    // Send multipart/form-data for file uploads
    const response = await API.post("/issues", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  analyzeIssue: async (formData) => {
    // Send multipart/form-data for AI analysis
    const response = await API.post("/issues/analyze", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  checkDuplicate: async (locationData) => {
    const response = await API.post("/issues/check-duplicate", locationData);
    return response.data;
  },
  updateStatus: async (id, status) => {
    const response = await API.patch(`/issues/${id}/status`, { status });
    return response.data;
  },
  upvoteIssue: async (id) => {
    const response = await API.post(`/issues/${id}/upvote`);
    return response.data;
  },
  confirmResolved: async (id) => {
    const response = await API.post(`/issues/${id}/confirm-resolved`);
    return response.data;
  },
  getDashboardStats: async () => {
    const response = await API.get("/issues/dashboard/stats");
    return response.data;
  },
  getNearbyIssues: async (lat, lng, radius = 5000) => {
    const response = await API.get(`/issues/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
    return response.data;
  },
};

// Work Orders API Endpoints
export const workOrdersAPI = {
  createWorkOrder: async (workOrderData) => {
    const response = await API.post("/work-orders", workOrderData);
    return response.data;
  },
  getWorkOrders: async () => {
    const response = await API.get("/work-orders");
    return response.data;
  },
  updateStatus: async (id, status) => {
    const response = await API.patch(`/work-orders/${id}/status`, { status });
    return response.data;
  },
};
