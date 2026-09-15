const express = require("express");

const router = express.Router();

const videoGalleryController = require("../controllers/videoGalleryController");

// GET ALL VIDEOS
router.get(
  "/",
  videoGalleryController.getVideoGallery
);

// UPLOAD VIDEO
router.post(
  "/upload",
  videoGalleryController.uploadVideo
);

// GET VIDEO FILE
router.get(
  "/video/:id",
  videoGalleryController.getVideo
);

// UPDATE VIDEO
router.put(
  "/:id",
  videoGalleryController.updateVideo
);

// DELETE VIDEO
router.delete(
  "/:id",
  videoGalleryController.deleteVideo
);

module.exports = router;