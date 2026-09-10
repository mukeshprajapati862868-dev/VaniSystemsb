const express = require("express");

const router = express.Router();

const galleryController = require("../controllers/galleryController");


// ============================================================
// GET ALL GALLERY IMAGES
// GET /api/gallery
// ============================================================

router.get(
  "/",
  galleryController.getGalleryImages
);


// ============================================================
// UPLOAD NEW GALLERY IMAGE
// POST /api/gallery/upload
// ============================================================

router.post(
  "/upload",
  galleryController.uploadGalleryImage
);


// ============================================================
// GET ACTUAL IMAGE
// GET /api/gallery/image/:id
// ============================================================

router.get(
  "/image/:id",
  galleryController.getGalleryImage
);


// ============================================================
// UPDATE GALLERY IMAGE
// PUT /api/gallery/:id
// ============================================================

router.put(
  "/:id",
  galleryController.updateGalleryImage
);


// ============================================================
// DELETE GALLERY IMAGE
// DELETE /api/gallery/:id
// ============================================================

router.delete(
  "/:id",
  galleryController.deleteGalleryImage
);


module.exports = router;
