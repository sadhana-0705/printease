const Order = require("../models/Order");
const NetCentre = require("../models/NetCentre");
const User = require("../models/User");
const mongoose = require("mongoose");
const {
  buildOrderResponse,
  buildOrdersResponse
} = require("../helpers/orderResponse.helper");
const {
  normalizeDocumentForPricing,
  calculateOrderTotal
} = require("../helpers/orderPricing.helper");

// STUDENT: Create Order
exports.createOrder = async (req, res, next) => {
  try {
    const { netCentreId, documents, paymentMode, pickupOption, location } = req.body;

    if (!mongoose.Types.ObjectId.isValid(netCentreId)) {
      return res.status(400).json({ message: "Invalid NetCentre ID" });
    }

    if (!Array.isArray(documents) || documents.length === 0) {
      return res.status(400).json({ message: "Documents must be a non-empty array" });
    }

    const netCentre = await NetCentre.findById(netCentreId);

    if (!netCentre) {
      return res.status(404).json({ message: "NetCentre not found" });
    }

    if (
      location &&
      typeof location.lat === "number" &&
      typeof location.lng === "number"
    ) {
      await User.findByIdAndUpdate(req.user.id, {
        $set: {
          location: {
            lat: location.lat,
            lng: location.lng
          }
        }
      });
    }

    const normalizedDocuments = documents.map(normalizeDocumentForPricing);
    const calculatedTotalCost = calculateOrderTotal(normalizedDocuments);

    const order = await Order.create({
      studentId: req.user.id,
      netCentreId,
      documents: normalizedDocuments,
      paymentMode,
      pickupOption,
      deliveryType: pickupOption === "delivery" ? "delivery" : "pickup",
      totalCost: calculatedTotalCost
    });

    const responseOrder = await buildOrderResponse(order);

    res.status(201).json({
      message: "Order placed successfully",
      order: responseOrder
    });
  } catch (error) {
    next(error);
  }
};

// STUDENT: View own orders
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({
      studentId: req.user.id,
      studentCleared: { $ne: true }
    })
      .sort({ createdAt: -1 });

    const responseOrders = await buildOrdersResponse(orders);
    res.json(responseOrders);
  } catch (error) {
    next(error);
  }
};

// STUDENT: Delete own order
exports.deleteOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    // Check if the order belongs to the current user
    if (order.studentId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Unauthorized to delete this order" });
    }
    
    // Allow cancellation only before delivery is in progress or finished
    const clearableStatuses = ["completed", "delivered", "rejected"];
    if (clearableStatuses.includes(order.status)) {
      order.studentCleared = true;
      await order.save();

      return res.json({ message: "Order cleared successfully" });
    }

    const cancellableStatuses = ["pending", "accepted", "printing", "ready", "assigned"];
    if (!cancellableStatuses.includes(order.status)) {
      return res.status(400).json({ message: "Cannot cancel order in its current status" });
    }
    
    await Order.findByIdAndDelete(orderId);
    
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// NETCENTRE: View orders
exports.getOrdersForNetCentre = async (req, res, next) => {
  try {
    const netCentreId = req.user.netCentreId;

    if (!netCentreId) {
      return res.status(400).json({
        message: "NetCentre not linked to user"
      });
    }

    const orders = await Order.find({ netCentreId }).sort({ createdAt: -1 });
    const visibleOrders = orders.filter((order) => !order.netCentreCleared);
    const responseOrders = await buildOrdersResponse(visibleOrders);
    const safeResponseOrders = Array.isArray(responseOrders) ? responseOrders : [];

    // Transform the data to include student name directly in the order object
    const transformedOrders = safeResponseOrders.map(order => ({
      ...order,
      studentName: order.studentId?.name || 'Unknown Student',
      studentEmail: order.studentId?.email
    }));

    res.json(transformedOrders);
  } catch (error) {
    next(error);
  }
};

// NETCENTRE: Update order status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const allowedStatus = [
      "accepted",
      "printing",
      "ready",
      "available",
      "assigned",
      "picked_up",
      "out_for_delivery",
      "delivered",
      "completed",
      "rejected",
      "cleared"
    ];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // If status is "cleared", actually delete the order from database
    if (status === "cleared") {
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      order.netCentreCleared = true;
      await order.save();

      return res.json({ message: "Order cleared successfully" });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    let nextStatus = status;

    if (status === "ready" && order.deliveryType === "delivery") {
      nextStatus = "available";
      order.deliveryBoyId = null;
      order.claimVersion += 1;
    }

    order.status = nextStatus;
    await order.save();

    const responseOrder = await buildOrderResponse(order);

    res.json({
      message: "Order status updated",
      order: responseOrder
    });
  } catch (error) {
    next(error);
  }
};
