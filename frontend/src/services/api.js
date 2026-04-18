// src/services/api.js
import axios from "axios";
import { apiBaseUrl } from "../config/api";

const api = axios.create({
  baseURL: apiBaseUrl,
});

// Automatically attach token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;

