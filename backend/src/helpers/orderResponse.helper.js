const Order = require("../models/Order");

const ORDER_RESPONSE_POPULATE = [
  { path: "netCentreId", select: "name address location" },
  { path: "studentId", select: "name email location" },
  { path: "deliveryBoyId", select: "name email location" }
];

async function populateOrderRelations(orderOrOrders) {
  return Order.populate(orderOrOrders, ORDER_RESPONSE_POPULATE);
}

function attachLocationFields(order) {
  const orderObject = typeof order.toObject === "function" ? order.toObject() : order;

  return {
    ...orderObject,
    netCentreLocation: orderObject.netCentreId?.location || null,
    studentLocation: orderObject.studentId?.location || null,
    deliveryBoyLocation: orderObject.deliveryBoyId?.location || null
  };
}

async function buildOrderResponse(order) {
  const populatedOrder = await populateOrderRelations(order);
  return attachLocationFields(populatedOrder);
}

async function buildOrdersResponse(orders) {
  const normalizedOrders = Array.isArray(orders) ? orders : [];
  const populatedOrders = await populateOrderRelations(normalizedOrders);
  const safeOrders = Array.isArray(populatedOrders) ? populatedOrders : [];

  return safeOrders.map(attachLocationFields);
}

module.exports = {
  buildOrderResponse,
  buildOrdersResponse
};
