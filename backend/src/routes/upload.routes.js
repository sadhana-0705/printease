const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");
const { validateUploadedFile } = require("../middlewares/validation.middleware");
const {
  uploadDocument,
  getMyUploadedDocuments,
  deleteUploadedDocument
} = require("../controllers/upload.controller");

router.get("/my", auth, getMyUploadedDocuments);

router.post(
  "/",
  auth,
  upload.single("file"),
  validateUploadedFile,
  uploadDocument
);

router.delete("/:documentId", auth, deleteUploadedDocument);

module.exports = router;
