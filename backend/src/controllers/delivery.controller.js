const Order = require("../models/Order");
const User = require("../models/User");
const {
  buildOrderResponse,
  buildOrdersResponse
} = require("../helpers/orderResponse.helper");
const {
  getAvailableOrdersForDeliveryBoy
} = require("../helpers/deliveryMatching.helper");

async function getOwnedDeliveryOrder(orderId, deliveryBoyId) {
  return Order.findOne({
    _id: orderId,
    deliveryBoyId,
    deliveryType: "delivery"
  });
}

async function getCurrentDeliveryBoy(userId) {
  return User.findById(userId).select("_id location");
}

async function updateOwnedOrderStatus(req, res, next, currentStatus, nextStatus, successMessage) {
  try {
    const { orderId } = req.params;
    const order = await getOwnedDeliveryOrder(orderId, req.user.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== currentStatus) {
      return res.status(400).json({
        message: `Order must be in ${currentStatus} status`
      });
    }

    order.status = nextStatus;
    await order.save();

    const responseOrder = await buildOrderResponse(order);

    res.json({
      message: successMessage,
      order: responseOrder
    });
  } catch (error) {
    next(error);
  }
}

exports.getAvailableDeliveryOrders = async (req, res, next) => {
  try {
    const deliveryBoy = await getCurrentDeliveryBoy(req.user.id);

    if (!deliveryBoy) {
      return res.status(404).json({ message: "Delivery boy not found" });
    }

    if (
      typeof deliveryBoy.location?.lat !== "number" ||
      typeof deliveryBoy.location?.lng !== "number"
    ) {
      return res.status(400).json({
        message: "Update your location before viewing available deliveries"
      });
    }

    const rankedOrders = await getAvailableOrdersForDeliveryBoy(deliveryBoy);
    const responseOrders = await buildOrdersResponse(
      rankedOrders.map((entry) => entry.order)
    );

    const ordersWithDistance = responseOrders.map((order, index) => ({
      ...order,
      distanceKm: rankedOrders[index]?.distanceKm ?? null
    }));

    res.json(ordersWithDistance);
  } catch (error) {
    next(error);
  }
};

exports.getMyDeliveryOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({
      deliveryBoyId: req.user.id,
      deliveryType: "delivery",
      deliveryBoyCleared: { $ne: true }
    })
      .sort({ createdAt: -1 });

    const responseOrders = await buildOrdersResponse(orders);
    res.json(responseOrders);
  } catch (error) {
    next(error);
  }
};

exports.claimDeliveryOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { claimVersion } = req.body || {};
    const deliveryBoy = await getCurrentDeliveryBoy(req.user.id);

    if (!deliveryBoy) {
      return res.status(404).json({ message: "Delivery boy not found" });
    }

    if (
      typeof deliveryBoy.location?.lat !== "number" ||
      typeof deliveryBoy.location?.lng !== "number"
    ) {
      return res.status(400).json({
        message: "Update your location before accepting deliveries"
      });
    }

    if (!Number.isInteger(claimVersion) || claimVersion < 0) {
      return res.status(400).json({
        message: "A valid claim version is required"
      });
    }

    const availableOrders = await getAvailableOrdersForDeliveryBoy(deliveryBoy);
    const targetOrder = availableOrders.find(
      (entry) =>
        String(entry.order._id) === orderId &&
        entry.order.claimVersion === claimVersion
    );

    if (!targetOrder) {
      const existingOrder = await Order.findById(orderId);

      if (
        existingOrder &&
        String(existingOrder.deliveryBoyId) === String(req.user.id)
      ) {
        const responseOrder = await buildOrderResponse(existingOrder);

        return res.json({
          message: "Delivery is already assigned to you",
          order: responseOrder
        });
      }

      return res.status(409).json({
        message: "Delivery is no longer available to claim with this version"
      });
    }

    const claimedOrder = await Order.findOneAndUpdate(
      {
        _id: orderId,
        deliveryType: "delivery",
        status: "available",
        deliveryBoyId: null,
        claimVersion,
        rejectedByDeliveryBoys: { $ne: req.user.id }
      },
      {
        $set: {
          deliveryBoyId: req.user.id,
          status: "assigned"
        },
        $inc: {
          claimVersion: 1
        },
        $pull: {
          rejectedByDeliveryBoys: req.user.id
        }
      },
      {
        new: true
      }
    );

    if (!claimedOrder) {
      const existingOrder = await Order.findById(orderId);

      if (
        existingOrder &&
        String(existingOrder.deliveryBoyId) === String(req.user.id)
      ) {
        const responseOrder = await buildOrderResponse(existingOrder);

        return res.json({
          message: "Delivery is already assigned to you",
          order: responseOrder
        });
      }

      return res.status(409).json({
        message: "Another delivery boy already claimed or refreshed this order"
      });
    }

    const responseOrder = await buildOrderResponse(claimedOrder);

    res.json({
      message: "Delivery accepted successfully",
      order: responseOrder
    });
  } catch (error) {
    next(error);
  }
};

exports.rejectDeliveryOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const deliveryBoy = await getCurrentDeliveryBoy(req.user.id);

    if (!deliveryBoy) {
      return res.status(404).json({ message: "Delivery boy not found" });
    }

    const order = await Order.findOneAndUpdate(
      {
        _id: orderId,
        deliveryType: "delivery",
        status: "available",
        deliveryBoyId: null,
        rejectedByDeliveryBoys: { $ne: req.user.id }
      },
      {
        $addToSet: {
          rejectedByDeliveryBoys: req.user.id
        }
      },
      {
        new: true
      }
    );

    if (!order) {
      return res.status(404).json({
        message: "Delivery is no longer available to reject"
      });
    }

    res.json({
      message: "Delivery rejected for your dashboard"
    });
  } catch (error) {
    next(error);
  }
};

exports.pickupOrder = async (req, res, next) => {
  return updateOwnedOrderStatus(
    req,
    res,
    next,
    "assigned",
    "picked_up",
    "Order picked up successfully"
  );
};

exports.markOutForDelivery = async (req, res, next) => {
  return updateOwnedOrderStatus(
    req,
    res,
    next,
    "picked_up",
    "out_for_delivery",
    "Order marked as out for delivery"
  );
};

exports.markDelivered = async (req, res, next) => {
  return updateOwnedOrderStatus(
    req,
    res,
    next,
    "out_for_delivery",
    "delivered",
    "Order delivered successfully"
  );
};

exports.clearDeliveredOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await getOwnedDeliveryOrder(orderId, req.user.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "delivered") {
      return res.status(400).json({
        message: "Only delivered orders can be cleared"
      });
    }

    order.deliveryBoyCleared = true;
    await order.save();

    res.json({
      message: "Order cleared successfully"
    });
  } catch (error) {
    next(error);
  }
};
