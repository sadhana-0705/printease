// src/services/netCentreService.js
import api from "./api";

export const getNetCentres = async () => {
  const res = await api.get("/netcentres");
  return res.data;
};

export const updateOrderStatus = async (orderId, status) => {
  const res = await api.patch(`/orders/${orderId}/status`, { status });
  return res.data;
};

export const acceptOrder = async (orderId) => {
  const res = await api.patch(`/orders/${orderId}/status`, { status: "accepted" });
  return res.data;
};

export const rejectOrder = async (orderId) => {
  const res = await api.patch(`/orders/${orderId}/status`, { status: "rejected" });
  return res.data;
};

export const clearOrder = async (orderId) => {
  const res = await api.patch(`/orders/${orderId}/status`, { status: "cleared" });
  return res.data;
};
