const mongoose = require("mongoose");
const Gallery = require("../models/Gallery");

// ============================================================
// COMMON HELPERS
// ============================================================

const DATA_URL_REGEX =
  /^data:(image\/(?:png|jpeg|jpg|webp|gif));base64,([A-Za-z0-9+/=\r\n]+)$/i;

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB


const validateObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};


const parseDataUrl = (dataUrl) => {
  if (typeof dataUrl !== "string") {
    return null;
  }

  const cleanDataUrl = dataUrl.trim();

  const match = cleanDataUrl.match(DATA_URL_REGEX);

  if (!match) {
    return null;
  }

  const mimeType = match[1].toLowerCase();

  const base64Data = match[2]
    .replace(/\s/g, "");

  let buffer;

  try {
    buffer = Buffer.from(base64Data, "base64");
  } catch (error) {
    return null;
  }

  if (!buffer || buffer.length === 0) {
    return null;
  }

  if (buffer.length > MAX_IMAGE_SIZE) {
    return {
      tooLarge: true,
      mimeType,
      buffer,
    };
  }

  return {
    mimeType,
    base64Data,
    buffer,
    dataUrl: `data:${mimeType};base64,${base64Data}`,
  };
};


// ============================================================
// GET ALL GALLERY IMAGES
// GET /api/gallery
// ============================================================

exports.getGalleryImages = async (req, res) => {
  try {
    const images = await Gallery.find({})
      .sort({ createdAt: -1 })
      .select("-dataUrl");

    const formattedImages = images.map((image) => ({
      _id: image._id,
      id: image._id,
      name: image.name,

      // IMPORTANT:
      // Frontend PhotoGallery and GalleryContext expect path
      path:
        image.path ||
        `/gallery/image/${image._id}`,

      createdAt: image.createdAt,
      updatedAt: image.updatedAt,
    }));

    return res.status(200).json({
      success: true,
      count: formattedImages.length,
      data: formattedImages,
    });
  } catch (error) {
    console.error(
      "GET GALLERY IMAGES ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load gallery images",
      error: error.message,
    });
  }
};


// ============================================================
// GET SINGLE IMAGE
// GET /api/gallery/image/:id
// ============================================================

exports.getGalleryImage = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid gallery image ID",
      });
    }

    const image = await Gallery.findById(id).select(
      "+dataUrl"
    );

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Gallery image not found",
      });
    }

    if (
      !image.dataUrl ||
      typeof image.dataUrl !== "string"
    ) {
      return res.status(404).json({
        success: false,
        message: "Image data not available",
      });
    }

    const parsed = parseDataUrl(image.dataUrl);

    if (!parsed || parsed.tooLarge) {
      return res.status(500).json({
        success: false,
        message: "Stored gallery image data is invalid",
      });
    }

    res.setHeader(
      "Content-Type",
      parsed.mimeType
    );

    res.setHeader(
      "Content-Length",
      parsed.buffer.length
    );

    // Browser caching
    res.setHeader(
      "Cache-Control",
      "public, max-age=31536000, immutable"
    );

    // Allow image to be displayed from frontend domain
    res.setHeader(
      "Cross-Origin-Resource-Policy",
      "cross-origin"
    );

    return res.send(parsed.buffer);
  } catch (error) {
    console.error(
      "GET GALLERY IMAGE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load gallery image",
      error: error.message,
    });
  }
};


// ============================================================
// UPLOAD GALLERY IMAGE
// POST /api/gallery/upload
// ============================================================

exports.uploadGalleryImage = async (req, res) => {
  try {
    const {
      name,
      dataUrl,
    } = req.body;

    console.log(
      "Gallery upload request received"
    );

    console.log(
      "Gallery name:",
      name
    );

    console.log(
      "Gallery dataUrl received:",
      !!dataUrl
    );

    if (
      typeof dataUrl !== "string" ||
      dataUrl.trim() === ""
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Image dataUrl is required",
      });
    }

    const parsed = parseDataUrl(dataUrl);

    if (!parsed) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid image format. Only PNG, JPEG, JPG, WEBP and GIF images are supported.",
      });
    }

    if (parsed.tooLarge) {
      return res.status(413).json({
        success: false,
        message:
          "Image is too large. Maximum allowed size is 10 MB.",
      });
    }

    const imageName =
      typeof name === "string" &&
      name.trim() !== ""
        ? name.trim()
        : "gallery-image";

    // --------------------------------------------------------
    // IMPORTANT:
    // Image is saved directly inside MongoDB.
    // No fs.writeFile
    // No uploads folder
    // No Plesk folder permission
    // --------------------------------------------------------

    const galleryImage =
      new Gallery({
        name: imageName,

        dataUrl: parsed.dataUrl,

        path: "",
      });

    await galleryImage.save();

    // Frontend expects "path"
    galleryImage.path =
      `/gallery/image/${galleryImage._id}`;

    await galleryImage.save();

    console.log(
      "Gallery image saved successfully:",
      galleryImage._id.toString()
    );

    return res.status(201).json({
      success: true,
      message:
        "Gallery image uploaded successfully",

      data: {
        _id: galleryImage._id,
        id: galleryImage._id,
        name: galleryImage.name,

        path:
          `/gallery/image/${galleryImage._id}`,

        createdAt:
          galleryImage.createdAt,

        updatedAt:
          galleryImage.updatedAt,
      },
    });
  } catch (error) {
    console.error(
      "UPLOAD GALLERY IMAGE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to upload gallery image",
      error: error.message,
    });
  }
};


// ============================================================
// UPDATE GALLERY IMAGE
// PUT /api/gallery/:id
// ============================================================

exports.updateGalleryImage = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid gallery image ID",
      });
    }

    const image =
      await Gallery.findById(id);

    if (!image) {
      return res.status(404).json({
        success: false,
        message:
          "Gallery image not found",
      });
    }

    const {
      name,
      dataUrl,
    } = req.body;

    // --------------------------------------------------------
    // UPDATE NAME
    // --------------------------------------------------------

    if (
      typeof name === "string" &&
      name.trim() !== ""
    ) {
      image.name = name.trim();
    }

    // --------------------------------------------------------
    // UPDATE IMAGE
    // --------------------------------------------------------

    if (
      typeof dataUrl === "string" &&
      dataUrl.trim() !== ""
    ) {
      const parsed =
        parseDataUrl(dataUrl);

      if (!parsed) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid image format",
        });
      }

      if (parsed.tooLarge) {
        return res.status(413).json({
          success: false,
          message:
            "Image is too large. Maximum allowed size is 10 MB.",
        });
      }

      image.dataUrl =
        parsed.dataUrl;
    }

    // Keep frontend-compatible path
    image.path =
      `/gallery/image/${image._id}`;

    await image.save();

    return res.status(200).json({
      success: true,
      message:
        "Gallery image updated successfully",

      data: {
        _id: image._id,
        id: image._id,
        name: image.name,
        path:
          `/gallery/image/${image._id}`,
        createdAt:
          image.createdAt,
        updatedAt:
          image.updatedAt,
      },
    });
  } catch (error) {
    console.error(
      "UPDATE GALLERY IMAGE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update gallery image",
      error: error.message,
    });
  }
};


// ============================================================
// DELETE GALLERY IMAGE
// DELETE /api/gallery/:id
// ============================================================

exports.deleteGalleryImage = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid gallery image ID",
      });
    }

    const image =
      await Gallery.findById(id);

    if (!image) {
      return res.status(404).json({
        success: false,
        message:
          "Gallery image not found",
      });
    }

    await Gallery.findByIdAndDelete(id);

    console.log(
      "Gallery image deleted:",
      id
    );

    return res.status(200).json({
      success: true,
      message:
        "Gallery image deleted successfully",
      data: {
        _id: id,
      },
    });
  } catch (error) {
    console.error(
      "DELETE GALLERY IMAGE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete gallery image",
      error: error.message,
    });
  }
};
