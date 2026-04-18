// src/services/orderService.js
import api from "./api";

/* ---------- STUDENT ---------- */

export const createOrder = async (orderData) => {
  const res = await api.post("/orders", orderData);
  return res.data;
};

export const getMyOrders = async () => {
  const res = await api.get("/orders/my");
  return res.data;
};

/* ---------- STUDENT ORDER DELETION ---------- */

export const deleteOrder = async (orderId) => {
  const res = await api.delete(`/orders/${orderId}`);
  return res.data;
};

/* ---------- NETCENTRE ADMIN ---------- */

export const getNetCentreOrders = async () => {
  const res = await api.get("/orders/netcentre");
  return res.data;
};

export const updateOrderStatus = async (orderId, status) => {
  const res = await api.patch(`/orders/${orderId}/status`, {
    status,
  });
  return res.data;
};
