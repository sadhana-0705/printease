const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const authRoutes = require("./routes/auth.routes");
const netcentreRoutes = require("./routes/netcentre.routes");
const orderRoutes = require("./routes/order.routes");
const deliveryRoutes = require("./routes/delivery.routes");
const uploadRoutes = require("./routes/upload.routes");
const { requestLogger, errorHandler } = require("./utils/logger");

const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const logsDirPath = path.join(__dirname, "../logs");
if (!fs.existsSync(logsDirPath)) {
  fs.mkdirSync(logsDirPath, { recursive: true });
}

const frontendDistPath = path.resolve(__dirname, "../../frontend/dist");
const frontendIndexPath = path.join(frontendDistPath, "index.html");

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.use("/api/auth", authRoutes);
app.use("/api/netcentres", netcentreRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/upload", uploadRoutes);

app.use("/uploads", express.static(uploadsDir));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Static serving
app.use(express.static(frontendDistPath));

// SPA Fallback: Send index.html for any request that doesn't match an API or static file
app.get("(.*)", (req, res) => {
  if (req.url.startsWith("/api/") || req.url.startsWith("/uploads/")) {
    return res.status(404).json({ message: "Not Found" });
  }
  
  if (fs.existsSync(frontendIndexPath)) {
    res.sendFile(frontendIndexPath);
  } else {
    res.send("PrintEase Backend Running (Frontend build not found)");
  }
});

app.use(errorHandler);

module.exports = app;
