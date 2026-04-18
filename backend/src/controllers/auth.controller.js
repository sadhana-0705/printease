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

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      address: address || "",
      role,
      netCentreId: role !== "student" ? netCentreId : null,
      location: {
        lat: location?.lat ?? null,
        lng: location?.lng ?? null
      }
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

    const user = await User.findOne({ email });
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
      { expiresIn: "7d" }
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
