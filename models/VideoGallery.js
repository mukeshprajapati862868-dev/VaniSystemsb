const mongoose = require("mongoose");

const videoGallerySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    dataUrl: {
      type: String,
      required: true,
    },

    path: {
      type: String,
      default: "",
    },

    mimeType: {
      type: String,
      default: "video/mp4",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "VideoGallery",
  videoGallerySchema
);