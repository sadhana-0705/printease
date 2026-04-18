const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  netCentreId: { type: mongoose.Schema.Types.ObjectId, ref: "NetCentre" },

  documents: [{
    fileUrl: String,
    fileType: String, // pdf, ppt, docx
    copies: Number,
    color: Boolean,
    sides: { type: String, enum: ["single", "double"] },
    pages: Number, // number of pages
    costPerPage: Number, // cost per page
    colorCost: Number, // additional cost for color printing
    bindingCost: Number, // additional cost for binding
    binding: Boolean // whether binding is requested
  }],

  paymentMode: {
    type: String,
    enum: ["cash", "online"]
  },

  pickupOption: {
    type: String,
    enum: ["self", "delivery"]
  },

  deliveryType: {
    type: String,
    enum: ["pickup", "delivery"],
    default: "pickup"
  },

  deliveryBoyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },

  rejectedByDeliveryBoys: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],

  studentCleared: {
    type: Boolean,
    default: false
  },

  netCentreCleared: {
    type: Boolean,
    default: false
  },

  deliveryBoyCleared: {
    type: Boolean,
    default: false
  },

  claimVersion: {
    type: Number,
    default: 0
  },

  totalCost: Number, // Total cost of the order

  status: {
    type: String,
    enum: ["pending", "accepted", "printing", "ready", "available", "completed", "rejected", "assigned", "picked_up", "out_for_delivery", "delivered", "cancelled"],
    default: "pending"
  }
}, { timestamps: true });

orderSchema.index({ deliveryBoyId: 1 });

module.exports = mongoose.model("Order", orderSchema);
