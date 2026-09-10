const express = require("express");
const {
  body,
  validationResult,
} = require("express-validator");

const galleryController = require(
  "../controllers/galleryController"
);

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
      .withMessage("dataUrl is required"),
  ],

  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      return await galleryController.uploadFromDataUrl(
        req,
        res
      );

    } catch (error) {
      console.error(
        "Gallery route error:",
        error
      );

      return res.status(500).json({
        success: false,
        error: error.message || "Gallery route failed",
      });
    }
  }
);

// ============================================================
// GET ALL GALLERY IMAGES
// GET /api/gallery
// ============================================================
router.get(
  "/",
  async (req, res) => {
    return galleryController.getGalleryImages(
      req,
      res
    );
  }
);

// ============================================================
// DELETE GALLERY IMAGE
// DELETE /api/gallery/:id
// ============================================================
router.delete(
  "/:id",
  async (req, res) => {
    return galleryController.deleteGalleryImage(
      req,
      res
    );
  }
);

module.exports = router;

