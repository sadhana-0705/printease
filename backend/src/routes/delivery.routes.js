const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware");
const deliveryOnly = require("../middlewares/delivery.middleware");
const {
  getAvailableDeliveryOrders,
  getMyDeliveryOrders,
  claimDeliveryOrder,
  rejectDeliveryOrder,
  clearDeliveredOrder,
  pickupOrder,
  markOutForDelivery,
  markDelivered
} = require("../controllers/delivery.controller");

router.get(
  "/available",
  auth,
  deliveryOnly,
  getAvailableDeliveryOrders
);

router.get(
  "/my-orders",
  auth,
  deliveryOnly,
  getMyDeliveryOrders
);

router.put(
  "/claim/:orderId",
  auth,
  deliveryOnly,
  claimDeliveryOrder
);

router.put(
  "/reject/:orderId",
  auth,
  deliveryOnly,
  rejectDeliveryOrder
);

router.put(
  "/pickup/:orderId",
  auth,
  deliveryOnly,
  pickupOrder
);

router.put(
  "/out-for-delivery/:orderId",
  auth,
  deliveryOnly,
  markOutForDelivery
);

router.put(
  "/delivered/:orderId",
  auth,
  deliveryOnly,
  markDelivered
);

router.put(
  "/clear/:orderId",
  auth,
  deliveryOnly,
  clearDeliveredOrder
);

module.exports = router;
