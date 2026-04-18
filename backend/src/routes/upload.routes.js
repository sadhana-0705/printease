const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");
const { validateUploadedFile } = require("../middlewares/validation.middleware");
const { uploadDocument } = require("../controllers/upload.controller");

router.post(
  "/",
  auth,
  upload.single("file"),
  validateUploadedFile,
  uploadDocument
);

module.exports = router;
