// src/services/authService.js
import api from "./api";

export const login = async (email, password) => {
  const res = await api.post("/auth/login", {
    email,
    password,
  });

  localStorage.setItem("token", res.data.token);
  localStorage.setItem("user", JSON.stringify(res.data.user));

  return res.data;
};

export const register = async (data) => {
  return api.post("/auth/register", data);
};

export const updateMyLocation = async (location) => {
  const res = await api.patch("/auth/location", { location });

  if (res.data?.user) {
    localStorage.setItem("user", JSON.stringify(res.data.user));
  }

  return res.data;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};
