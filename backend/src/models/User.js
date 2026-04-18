const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  address: {
    type: String,
    default: ""
  },

  role: {
    type: String,
    enum: ["student", "netcentre_admin", "netcentre_staff", "delivery_boy"],
    required: true
  },

  netCentreId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "NetCentre",
    default: null
  },

  location: {
    lat: {
      type: Number,
      default: null
    },
    lng: {
      type: Number,
      default: null
    }
  }
}, { timestamps: true });

userSchema.index({ role: 1 });

module.exports = mongoose.model("User", userSchema);
