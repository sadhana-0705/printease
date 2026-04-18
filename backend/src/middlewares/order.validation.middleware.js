const mongoose = require("mongoose");

exports.validateCreateOrder = (req, res, next) => {
  const { netCentreId, documents, paymentMode, pickupOption } = req.body;

  // Validate netCentreId
  if (!netCentreId || !mongoose.Types.ObjectId.isValid(netCentreId)) {
    return res.status(400).json({ 
      message: "Valid NetCentre ID is required" 
    });
  }

  // Validate documents array
  if (!documents || !Array.isArray(documents) || documents.length === 0) {
    return res.status(400).json({ 
      message: "At least one document is required" 
    });
  }

  // Validate each document
  for (let i = 0; i < documents.length; i++) {
    const doc = documents[i];
    
    // File URL validation
    if (!doc.fileUrl || typeof doc.fileUrl !== 'string') {
      return res.status(400).json({ 
        message: `Document ${i + 1}: fileUrl is required` 
      });
    }

    // Copies validation
    if (doc.copies === undefined || doc.copies === null) {
      return res.status(400).json({ 
        message: `Document ${i + 1}: copies is required` 
      });
    }
    
    if (typeof doc.copies !== 'number' || doc.copies < 1 || doc.copies > 100) {
      return res.status(400).json({ 
        message: `Document ${i + 1}: copies must be between 1 and 100` 
      });
    }

    // Pages validation
    if (doc.pages === undefined || doc.pages === null) {
      return res.status(400).json({ 
        message: `Document ${i + 1}: pages is required` 
      });
    }
    
    if (typeof doc.pages !== 'number' || doc.pages < 1 || doc.pages > 1000) {
      return res.status(400).json({ 
        message: `Document ${i + 1}: pages must be between 1 and 1000` 
      });
    }

    // Cost per page validation
    if (doc.costPerPage === undefined || doc.costPerPage === null) {
      return res.status(400).json({ 
        message: `Document ${i + 1}: costPerPage is required` 
      });
    }
    
    if (typeof doc.costPerPage !== 'number' || doc.costPerPage < 0) {
      return res.status(400).json({ 
        message: `Document ${i + 1}: costPerPage must be a non-negative number` 
      });
    }

    // Sides validation
    const validSides = ["single", "double"];
    if (doc.sides && !validSides.includes(doc.sides)) {
      return res.status(400).json({ 
        message: `Document ${i + 1}: sides must be either "single" or "double"` 
      });
    }

    // Color validation
    if (doc.color !== undefined && typeof doc.color !== 'boolean') {
      return res.status(400).json({ 
        message: `Document ${i + 1}: color must be a boolean` 
      });
    }

    // Binding validation
    if (doc.binding !== undefined && typeof doc.binding !== 'boolean') {
      return res.status(400).json({ 
        message: `Document ${i + 1}: binding must be a boolean` 
      });
    }
  }

  // Payment mode validation
  const validPaymentModes = ["cash", "online"];
  if (!paymentMode || !validPaymentModes.includes(paymentMode)) {
    return res.status(400).json({ 
      message: "Payment mode must be either 'cash' or 'online'" 
    });
  }

  // Pickup option validation
  const validPickupOptions = ["self", "delivery"];
  if (!pickupOption || !validPickupOptions.includes(pickupOption)) {
    return res.status(400).json({ 
      message: "Pickup option must be either 'self' or 'delivery'" 
    });
  }

  // Total cost validation
  const { totalCost } = req.body;
  if (totalCost !== undefined) {
    if (typeof totalCost !== 'number' || totalCost < 0) {
      return res.status(400).json({ 
        message: "Total cost must be a non-negative number" 
      });
    }
  }

  // Location validation (optional)
  const { location } = req.body;
  if (location) {
    if (typeof location !== 'object' || 
        typeof location.lat !== 'number' || 
        typeof location.lng !== 'number') {
      return res.status(400).json({ 
        message: "Invalid location coordinates" 
      });
    }

    if (location.lat < -90 || location.lat > 90 || 
        location.lng < -180 || location.lng > 180) {
      return res.status(400).json({ 
        message: "Invalid coordinate values" 
      });
    }
  }

  next();
};

exports.validateUpdateOrderStatus = (req, res, next) => {
  const { status } = req.body;

  const validStatuses = [
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

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ 
      message: `Status must be one of: ${validStatuses.join(", ")}` 
    });
  }

  next();
};
