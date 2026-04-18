// Input Validation Middleware

exports.validateRegistration = (req, res, next) => {
  const { name, email, password, role } = req.body;

  // Name validation
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ 
      message: "Name must be at least 2 characters long" 
    });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ 
      message: "Please provide a valid email address" 
    });
  }

  // Password validation
  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ 
      message: "Password must be at least 6 characters long" 
    });
  }

  // Role validation
  const validRoles = ["student", "netcentre_admin", "netcentre_staff", "delivery_boy"];
  if (!role || !validRoles.includes(role)) {
    return res.status(400).json({ 
      message: "Invalid role specified" 
    });
  }

  // NetCentre ID validation for net centre staff/admin roles only
  const { netCentreId } = req.body;
  if (
    (role === "netcentre_admin" || role === "netcentre_staff") &&
    !netCentreId
  ) {
    return res.status(400).json({ 
      message: "NetCentre ID is required for staff and admin roles" 
    });
  }

  next();
};

exports.validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ 
      message: "Email and password are required" 
    });
  }

  if (typeof email !== 'string' || email.trim().length === 0) {
    return res.status(400).json({ 
      message: "Email must be a non-empty string" 
    });
  }

  if (typeof password !== 'string' || password.length === 0) {
    return res.status(400).json({ 
      message: "Password must be a non-empty string" 
    });
  }

  next();
};

exports.validateLocationUpdate = (req, res, next) => {
  const { location } = req.body;

  if (!location || typeof location !== 'object') {
    return res.status(400).json({ 
      message: "Location object is required" 
    });
  }

  const { lat, lng } = location;

  if (lat === undefined || lng === undefined) {
    return res.status(400).json({ 
      message: "Both latitude and longitude are required" 
    });
  }

  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return res.status(400).json({ 
      message: "Latitude and longitude must be numbers" 
    });
  }

  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return res.status(400).json({ 
      message: "Invalid coordinate values" 
    });
  }

  next();
};

exports.validateNetCentreCreation = (req, res, next) => {
  const { name, address, city, lat, lng } = req.body;

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return res.status(400).json({
      message: "Net centre name must be at least 2 characters long"
    });
  }

  if (!address || typeof address !== "string" || address.trim().length < 3) {
    return res.status(400).json({
      message: "Address must be at least 3 characters long"
    });
  }

  if (!city || typeof city !== "string" || city.trim().length < 2) {
    return res.status(400).json({
      message: "City must be at least 2 characters long"
    });
  }

  if (typeof lat !== "number" || typeof lng !== "number") {
    return res.status(400).json({
      message: "Latitude and longitude must be numbers"
    });
  }

  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return res.status(400).json({
      message: "Invalid coordinate values"
    });
  }

  next();
};

exports.validateUploadedFile = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      message: "A supported file upload is required"
    });
  }

  next();
};
