const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");
const {
  validateRegistration,
  validateLogin,
  validateLocationUpdate
} = require("../middlewares/validation.middleware");
const {
  register,
  login,
  updateLocation
} = require("../controllers/auth.controller");

router.post("/register", validateRegistration, register);
router.post("/login", validateLogin, login);
router.patch("/location", auth, validateLocationUpdate, updateLocation);

module.exports = router;
