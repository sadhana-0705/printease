import api from "./api";

export const getAvailableDeliveries = async () => {
  const res = await api.get("/delivery/available");
  return res.data;
};

export const getMyDeliveries = async () => {
  const res = await api.get("/delivery/my-orders");
  return res.data;
};

export const claimDelivery = async (orderId, claimVersion) => {
  const res = await api.put(`/delivery/claim/${orderId}`, { claimVersion });
  return res.data;
};

export const rejectDelivery = async (orderId) => {
  const res = await api.put(`/delivery/reject/${orderId}`);
  return res.data;
};

export const markPickedUp = async (orderId) => {
  const res = await api.put(`/delivery/pickup/${orderId}`);
  return res.data;
};

export const startDelivery = async (orderId) => {
  const res = await api.put(`/delivery/out-for-delivery/${orderId}`);
  return res.data;
};

export const markDelivered = async (orderId) => {
  const res = await api.put(`/delivery/delivered/${orderId}`);
  return res.data;
};

export const clearDeliveredOrder = async (orderId) => {
  const res = await api.put(`/delivery/clear/${orderId}`);
  return res.data;
};
