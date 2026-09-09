const express = require("express");

const {
  body,
  validationResult
} = require("express-validator");

const galleryController = require("../controllers/galleryController");

const router = express.Router();


// ============================================================
// UPLOAD GALLERY IMAGE
// POST /api/gallery/upload
// ============================================================

router.post(
  "/upload",

  [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required"),

    body("dataUrl")
      .trim()
      .notEmpty()
      .withMessage("dataUrl is required")
  ],

  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    return galleryController.uploadFromDataUrl(
      req,
      res
    );
  }
);


// ============================================================
// GET ALL GALLERY IMAGES
// GET /api/gallery
// ============================================================

router.get(
  "/",
  galleryController.getGalleryImages
);


module.exports = router;
