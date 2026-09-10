
const mongoose = require("mongoose");

const GallerySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    filename: {
      type: String,
      required: true,
      trim: true,
    },

    mimeType: {
      type: String,
      required: true,
      trim: true,
    },

    // ========================================================
    // ACTUAL IMAGE DATA
    // Base64 Data URL stored directly in MongoDB
    // ========================================================
    dataUrl: {
      type: String,
      required: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "gallery",
  }
);

module.exports =
  mongoose.models.Gallery ||
  mongoose.model("Gallery", GallerySchema);
