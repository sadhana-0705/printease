const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware");
const role = require("../middlewares/role.middleware");
const {
  validateCreateOrder,
  validateUpdateOrderStatus
} = require("../middlewares/order.validation.middleware");

const {
  createOrder,
  getOrdersForNetCentre,
  updateOrderStatus,
  getMyOrders,
  deleteOrder
} = require("../controllers/order.controller");

// Student creates order
router.post(
  "/",
  auth,
  role(["student"]),
  validateCreateOrder,
  createOrder
);

// Student views own orders
router.get(
  "/my",
  auth,
  role(["student"]),
  getMyOrders
);

// Student deletes own order
router.delete(
  "/:orderId",
  auth,
  role(["student"]),
  deleteOrder
);

// NetCentre views incoming orders
router.get(
  "/netcentre",
  auth,
  role(["netcentre_admin", "netcentre_staff"]),
  getOrdersForNetCentre
);

// NetCentre updates order status
router.patch(
  "/:orderId/status",
  auth,
  role(["netcentre_admin", "netcentre_staff"]),
  validateUpdateOrderStatus,
  updateOrderStatus
);

// NetCentre clears/completes order (alternative endpoint)
router.delete(
  "/:orderId/clear",
  auth,
  role(["netcentre_admin", "netcentre_staff"]),
  (req, res, next) => {
    req.body.status = "cleared";
    next();
  },
  updateOrderStatus
);

module.exports = router;
