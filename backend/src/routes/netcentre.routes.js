const express = require("express");
const router = express.Router();
const { validateNetCentreCreation } = require("../middlewares/validation.middleware");
const { createNetCentre, getAllNetCentres } = require("../controllers/netcentre.controller");

router.post("/", validateNetCentreCreation, createNetCentre);
router.get("/", getAllNetCentres);

module.exports = router;
