import axios from "axios";

// Set base URL here - centralized configuration
const axiosInstance = axios.create({
  baseURL: "http://localhost:4000/api", // Backend server URL
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token automatically
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("fittrack-app-token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("Global Axios Error:", error);
    
    if (!error.response) {
      // Network error - log only, let component handle
      console.error("Network error! Backend not reachable. Please check if the server is running.");
    } else if (error.response.status === 401) {
      // Token expired or invalid - redirect to login
      localStorage.removeItem("fittrack-app-token");
      window.location.href = "/auth";
    }
    // For other errors (4xx, 5xx), let the calling component handle it
    // via error.response.data — do NOT alert() here

    return Promise.reject(error);
  }
);

export default axiosInstance;
