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

const frontendDistPath = path.join(__dirname, "../../frontend/dist");
const frontendIndexPath = path.join(frontendDistPath, "index.html");
const hasFrontendBuild = fs.existsSync(frontendIndexPath);

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

if (hasFrontendBuild) {
  app.use(express.static(frontendDistPath));

  app.get(/^(?!\/api|\/uploads).*/, (req, res) => {
    res.sendFile(frontendIndexPath);
  });
} else {
  app.get("/", (req, res) => {
    res.send("PrintEase Backend Running");
  });
}

app.use((req, res, next) => {
  if (req.url.startsWith("/api/")) {
    return res
      .status(404)
      .json({ message: `Route ${req.method} ${req.url} not found` });
  }

  return next();
});

app.use(errorHandler);

module.exports = app;
