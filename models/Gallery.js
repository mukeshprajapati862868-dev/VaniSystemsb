const mongoose = require("mongoose");

const GallerySchema = new mongoose.Schema({

  name: {
    type: String,
    required: true,
    trim: true
  },

  filename: {
    type: String,
    required: true,
    trim: true
  },

  path: {
    type: String,
    required: true,
    trim: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

});


module.exports =
  mongoose.model(
    "Gallery",
    GallerySchema
  );
