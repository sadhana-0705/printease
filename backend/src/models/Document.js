const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    filename: {
      type: String,
      required: true
    },
    path: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

documentSchema.index({ uploadedBy: 1, createdAt: -1 });

module.exports = mongoose.model("Document", documentSchema);
