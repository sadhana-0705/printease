const mongoose = require("mongoose");

const netCentreSchema = new mongoose.Schema({
  name: String,
  address: String,

  location: {
    lat: Number,
    lng: Number
  },

  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("NetCentre", netCentreSchema);
