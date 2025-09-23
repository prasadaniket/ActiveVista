import axios from "axios";

const API_URL = "http://localhost:4000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("fittrack-app-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const loginUser = async (userData) => {
  const response = await api.post("/user/signin", userData);
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await api.post("/user/signup", userData);
  return response.data;
};

// Dashboard API
export const getDashboardDetails = async (token) => {
  const response = await api.get("/user/dashboard", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Workout API
export const getWorkouts = async (token, query = "") => {
  const response = await api.get(`/user/workout${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const addWorkout = async (token, workoutData) => {
  const response = await api.post("/user/workout", workoutData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateWorkout = async (token, workoutId, workoutData) => {
  const response = await api.put(`/user/workout/${workoutId}`, workoutData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deleteWorkout = async (token, workoutId) => {
  const response = await api.delete(`/user/workout/${workoutId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export default api;
