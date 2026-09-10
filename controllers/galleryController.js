
const Gallery = require("../models/Gallery");

// ============================================================
// UPLOAD IMAGE FROM BASE64 DATA URL
// ============================================================
exports.uploadFromDataUrl = async (req, res) => {
  try {
    const { name, dataUrl } = req.body || {};

    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------
    if (!name || !dataUrl) {
      return res.status(400).json({
        success: false,
        error: "Name and dataUrl are required",
      });
    }

    // --------------------------------------------------------
    // PARSE BASE64 DATA URL
    // PNG / JPEG / JPG / WEBP
    // --------------------------------------------------------
    const matches = String(dataUrl).match(
      /^data:(image\/(?:png|jpeg|jpg|webp));base64,(.+)$/i
    );

    if (!matches) {
      return res.status(400).json({
        success: false,
        error: "Invalid image data. Only PNG, JPEG, JPG and WEBP are allowed.",
      });
    }

    const mimeType = matches[1].toLowerCase();
    const base64Data = matches[2];

    // --------------------------------------------------------
    // BASIC BASE64 VALIDATION
    // --------------------------------------------------------
    if (!base64Data || base64Data.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Empty image data",
      });
    }

    // --------------------------------------------------------
    // OPTIONAL SIZE CHECK
    // Approximately 10 MB maximum
    // 100 KB images are fully supported.
    // --------------------------------------------------------
    const estimatedSizeInBytes =
      Math.floor((base64Data.length * 3) / 4);

    const maxSizeInBytes = 10 * 1024 * 1024;

    if (estimatedSizeInBytes > maxSizeInBytes) {
      return res.status(413).json({
        success: false,
        error: "Image size is too large. Maximum allowed size is 10 MB.",
      });
    }

    // --------------------------------------------------------
    // SAFE NAME
    // --------------------------------------------------------
    const safeName = String(name)
      .trim()
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");

    const finalName = safeName || "image";

    // --------------------------------------------------------
    // FILE EXTENSION
    // --------------------------------------------------------
    let ext = "jpg";

    if (mimeType === "image/png") {
      ext = "png";
    } else if (mimeType === "image/jpeg") {
      ext = "jpeg";
    } else if (mimeType === "image/jpg") {
      ext = "jpg";
    } else if (mimeType === "image/webp") {
      ext = "webp";
    }

    // --------------------------------------------------------
    // KEEP ORIGINAL DATA URL
    // IMAGE WILL BE STORED DIRECTLY IN MONGODB
    // --------------------------------------------------------
    const completeDataUrl =
      `data:${mimeType};base64,${base64Data}`;

    // --------------------------------------------------------
    // SAVE TO MONGODB
    // NO FS / NO PLESK UPLOAD FOLDER REQUIRED
    // --------------------------------------------------------
    const gallery = await Gallery.create({
      name: String(name).trim(),
      filename: `${finalName}.${ext}`,
      mimeType: mimeType,
      dataUrl: completeDataUrl,
    });

    // --------------------------------------------------------
    // RESPONSE
    // --------------------------------------------------------
    return res.status(201).json({
      success: true,
      message: "Gallery image uploaded successfully",
      data: gallery,
    });

  } catch (error) {
    console.error("======================================");
    console.error("GALLERY UPLOAD ERROR");
    console.error("======================================");
    console.error(error);
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);

    return res.status(500).json({
      success: false,
      error: error.message || "Gallery upload failed",
    });
  }
};

// ============================================================
// GET ALL GALLERY IMAGES
// ============================================================
exports.getGalleryImages = async (req, res) => {
  try {
    const galleryImages = await Gallery.find()
      .sort({
        createdAt: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      data: galleryImages,
    });

  } catch (error) {
    console.error("Get gallery images error:", error);

    return res.status(500).json({
      success: false,
      error: error.message || "Server error",
    });
  }
};

// ============================================================
// DELETE GALLERY IMAGE
// DELETE /api/gallery/:id
// ============================================================
exports.deleteGalleryImage = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Gallery image ID is required",
      });
    }

    const deletedImage =
      await Gallery.findByIdAndDelete(id);

    if (!deletedImage) {
      return res.status(404).json({
        success: false,
        error: "Gallery image not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Gallery image deleted successfully",
      data: deletedImage,
    });

  } catch (error) {
    console.error("Delete gallery image error:", error);

    return res.status(500).json({
      success: false,
      error: error.message || "Server error",
    });
  }
};


