const Gallery = require("../models/Gallery");
const fs = require("fs");
const path = require("path");

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
    // Supports:
    // PNG / JPEG / JPG / WEBP
    // --------------------------------------------------------
    const matches = String(dataUrl).match(
      /^data:(image\/(?:png|jpeg|jpg|webp));base64,(.+)$/i
    );

    if (!matches) {
      return res.status(400).json({
        success: false,
        error: "Invalid image data",
      });
    }

    const mimeType = matches[1].toLowerCase();
    const base64Data = matches[2];

    // --------------------------------------------------------
    // GET FILE EXTENSION
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
    // SAFE FILE NAME
    // --------------------------------------------------------
    const safeName = String(name)
      .trim()
      .replace(/[^a-zA-Z0-9._-]/g, "-")
      .replace(/-+/g, "-");

    const filename =
      Date.now() +
      "-" +
      safeName +
      "." +
      ext;

    // --------------------------------------------------------
    // UPLOAD DIRECTORY
    // --------------------------------------------------------
    const uploadDir = path.join(
      __dirname,
      "..",
      "uploads",
      "gallery"
    );

    // Create folder if not exists
    fs.mkdirSync(uploadDir, {
      recursive: true,
    });

    // --------------------------------------------------------
    // FILE PATH
    // --------------------------------------------------------
    const filePath = path.join(
      uploadDir,
      filename
    );

    // --------------------------------------------------------
    // WRITE FILE
    // --------------------------------------------------------
    fs.writeFileSync(
      filePath,
      Buffer.from(base64Data, "base64")
    );

    // --------------------------------------------------------
    // PUBLIC IMAGE PATH
    // --------------------------------------------------------
    const imagePath =
      `/uploads/gallery/${filename}`;

    // --------------------------------------------------------
    // SAVE DATA IN MONGODB
    // --------------------------------------------------------
    const gallery = await Gallery.create({
      name: String(name).trim(),
      filename,
      path: imagePath,
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
    console.error(
      "Gallery upload error:",
      error
    );

    return res.status(500).json({
      success: false,
      error:
        error.message ||
        "Server error",
    });
  }
};

// ============================================================
// GET ALL GALLERY IMAGES
// ============================================================
exports.getGalleryImages = async (
  req,
  res
) => {
  try {
    const galleryImages =
      await Gallery.find()
        .sort({
          createdAt: -1,
        })
        .lean();

    return res.status(200).json({
      success: true,
      data: galleryImages,
    });
  } catch (error) {
    console.error(
      "Get gallery images error:",
      error
    );

    return res.status(500).json({
      success: false,
      error:
        error.message ||
        "Server error",
    });
  }
};
