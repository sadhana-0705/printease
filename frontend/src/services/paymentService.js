// src/services/paymentService.js

export const getPaymentModes = () => {
  return [
    { id: "cash", label: "Cash on Pickup" },
    { id: "online", label: "Online Payment (Coming Soon)" }
  ];
};
