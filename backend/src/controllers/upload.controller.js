const fs = require("fs/promises");
const path = require("path");
const mongoose = require("mongoose");

const Document = require("../models/Document");
const Order = require("../models/Order");

function toDocumentResponse(document, usedInOrder = false) {
  return {
    _id: document._id,
    originalName: document.originalName,
    filename: document.filename,
    path: document.path,
    mimeType: document.mimeType,
    size: document.size,
    usedInOrder,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt
  };
}

async function getUsedFilePathSet(userId, filePaths) {
  if (!Array.isArray(filePaths) || filePaths.length === 0) {
    return new Set();
  }

  const orders = await Order.find({
    studentId: userId,
    "documents.fileUrl": { $in: filePaths }
  })
    .select("documents.fileUrl")
    .lean();

  return new Set(
    orders.flatMap((order) =>
      (order.documents || []).map((document) => document.fileUrl)
    )
  );
}

exports.uploadDocument = async (req, res, next) => {
  try {
    const storedPath = `/uploads/${req.file.filename}`;
    const document = await Document.create({
      uploadedBy: req.user.id,
      originalName: req.file.originalname,
      filename: req.file.filename,
      path: storedPath,
      mimeType: req.file.mimetype,
      size: req.file.size || 0
    });

    res.status(201).json({
      message: "File uploaded successfully",
      file: {
        filename: req.file.filename,
        path: storedPath,
        type: req.file.mimetype
      },
      document: toDocumentResponse(document)
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyUploadedDocuments = async (req, res, next) => {
  try {
    const documents = await Document.find({ uploadedBy: req.user.id })
      .sort({ createdAt: -1 });

    const usedFilePaths = await getUsedFilePathSet(
      req.user.id,
      documents.map((document) => document.path)
    );

    res.json(
      documents.map((document) =>
        toDocumentResponse(document, usedFilePaths.has(document.path))
      )
    );
  } catch (error) {
    next(error);
  }
};

exports.deleteUploadedDocument = async (req, res, next) => {
  try {
    const { documentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(documentId)) {
      return res.status(400).json({ message: "Invalid document ID" });
    }

    const document = await Document.findOne({
      _id: documentId,
      uploadedBy: req.user.id
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    const linkedOrder = await Order.findOne({
      studentId: req.user.id,
      "documents.fileUrl": document.path
    })
      .select("_id")
      .lean();

    if (linkedOrder) {
      return res.status(400).json({
        message: "This document is already used in an order and cannot be deleted"
      });
    }

    await Document.deleteOne({ _id: document._id });

    const filePath = path.join(__dirname, "../../", document.path.replace(/^\//, ""));
    await fs.unlink(filePath).catch((error) => {
      if (error.code !== "ENOENT") {
        throw error;
      }
    });

    res.json({ message: "Document deleted successfully" });
  } catch (error) {
    next(error);
  }
};
