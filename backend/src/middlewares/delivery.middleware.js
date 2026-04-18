module.exports = (req, res, next) => {
  if (req.user.role !== "delivery_boy") {
    return res.status(403).json({ message: "Access denied" });
  }

  next();
};
