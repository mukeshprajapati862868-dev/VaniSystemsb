const mongoose = require('mongoose');

const GallerySchema = new mongoose.Schema({
  name: { type: String, required: true },
  filename: { type: String, required: true },
  path: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Gallery', GallerySchema);
