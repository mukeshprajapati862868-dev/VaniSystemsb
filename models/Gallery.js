const mongoose = require("mongoose");

const gallerySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Complete base64 data URL
    // Example:
    // data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...
    dataUrl: {
      type: String,
      required: true,
    },

    // Frontend expects this field
    // Example:
    // /gallery/image/66c123456789
    path: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Gallery", gallerySchema);
