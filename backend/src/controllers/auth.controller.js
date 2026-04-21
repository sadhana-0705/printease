const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User");

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, netCentreId, location, address } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const locationData = {
      lat: null,
      lng: null
    };

    if (
      location &&
      typeof location.lat === "number" &&
      typeof location.lng === "number" &&
      location.lat >= -90 &&
      location.lat <= 90 &&
      location.lng >= -180 &&
      location.lng <= 180
    ) {
      locationData.lat = location.lat;
      locationData.lng = location.lng;
    }

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      address: address || "",
      role,
      netCentreId: role !== "student" ? netCentreId : null,
      location: locationData
    });

    res.status(201).json({
      message: "Registered successfully",
      user: {
        id: user._id,
        role: user.role,
        address: user.address,
        location: user.location
      }
    });

  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = await User.findOne({ email: email.trim() });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        netCentreId: user.netCentreId || null
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        netCentreId: user.netCentreId,
        address: user.address,
        location: user.location
      }
    });

  } catch (error) {
    next(error);
  }
};

exports.updateLocation = async (req, res, next) => {
  try {
    const { location } = req.body;

    if (
      !location ||
      typeof location.lat !== "number" ||
      typeof location.lng !== "number"
    ) {
      return res.status(400).json({ message: "Valid location is required" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          location: {
            lat: location.lat,
            lng: location.lng
          }
        }
      },
      {
        new: true
      }
    ).select("_id name email role netCentreId address location");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Location updated successfully",
      user
    });
  } catch (error) {
    next(error);
  }
};
