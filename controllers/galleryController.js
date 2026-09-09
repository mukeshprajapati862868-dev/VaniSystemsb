const fs = require("fs");
const path = require("path");
const Gallery = require("../models/Gallery");


// ============================================================
// UPLOAD GALLERY IMAGE
// ============================================================

const uploadFromDataUrl = async (req, res) => {
  try {

    const { name, dataUrl } = req.body;


    // --------------------------------------------------------
    // VALIDATE NAME
    // --------------------------------------------------------

    if (!name) {
      return res.status(400).json({
        success: false,
        error: "Image name is required"
      });
    }


    // --------------------------------------------------------
    // VALIDATE DATA URL
    // --------------------------------------------------------

    if (!dataUrl) {
      return res.status(400).json({
        success: false,
        error: "Image data is required"
      });
    }


    if (typeof dataUrl !== "string") {
      return res.status(400).json({
        success: false,
        error: "Invalid image data"
      });
    }


    // --------------------------------------------------------
    // CHECK IMAGE FORMAT
    // --------------------------------------------------------

    const match = dataUrl.match(
      /^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/i
    );


    if (!match) {
      return res.status(400).json({
        success: false,
        error:
          "Invalid image format. Only PNG, JPG, JPEG and WEBP are allowed."
      });
    }


    const extension = match[1].toLowerCase();

    const base64Data = match[2];


    // --------------------------------------------------------
    // UPLOAD DIRECTORY
    // --------------------------------------------------------

    const uploadDirectory = path.join(
      __dirname,
      "..",
      "uploads",
      "gallery"
    );


    fs.mkdirSync(
      uploadDirectory,
      {
        recursive: true
      }
    );


    // --------------------------------------------------------
    // SAFE FILE NAME
    // --------------------------------------------------------

    const safeName = String(name)
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9-_]/g, "_")
      .substring(0, 100);


    const filename =
      `${safeName || "gallery"}_${Date.now()}.${extension}`;


    const filePath = path.join(
      uploadDirectory,
      filename
    );


    // --------------------------------------------------------
    // BASE64 → BUFFER
    // --------------------------------------------------------

    let imageBuffer;

    try {

      imageBuffer = Buffer.from(
        base64Data,
        "base64"
      );

    } catch (bufferError) {

      console.error(
        "IMAGE BUFFER ERROR:",
        bufferError
      );

      return res.status(400).json({
        success: false,
        error: "Invalid Base64 image data"
      });
    }


    // --------------------------------------------------------
    // CHECK EMPTY IMAGE
    // --------------------------------------------------------

    if (
      !imageBuffer ||
      imageBuffer.length === 0
    ) {
      return res.status(400).json({
        success: false,
        error: "Image data is empty"
      });
    }


    // --------------------------------------------------------
    // SAVE ACTUAL IMAGE FILE
    // --------------------------------------------------------

    fs.writeFileSync(
      filePath,
      imageBuffer
    );


    // --------------------------------------------------------
    // PUBLIC IMAGE PATH
    // --------------------------------------------------------

    const imagePath =
      `/uploads/gallery/${filename}`;


    // --------------------------------------------------------
    // SAVE IMAGE INFORMATION IN MONGODB
    // --------------------------------------------------------

    const galleryImage =
      await Gallery.create({
        name: String(name).trim(),
        filename,
        path: imagePath
      });


    // --------------------------------------------------------
    // SUCCESS RESPONSE
    // --------------------------------------------------------

    return res.status(201).json({
      success: true,
      message: "Gallery image uploaded successfully",
      data: galleryImage
    });


  } catch (error) {

    console.error(
      "================================================"
    );

    console.error(
      "GALLERY UPLOAD ERROR:"
    );

    console.error(error);

    console.error(
      "================================================"
    );


    return res.status(500).json({
      success: false,
      error:
        error.message ||
        "Gallery image upload failed"
    });
  }
};



// ============================================================
// GET GALLERY IMAGES
// ============================================================

const getGalleryImages = async (req, res) => {

  try {

    const images = await Gallery.find()
      .sort({
        createdAt: -1
      })
      .lean();


    return res.status(200).json({
      success: true,
      data: images
    });


  } catch (error) {

    console.error(
      "GET GALLERY ERROR:",
      error
    );


    return res.status(500).json({
      success: false,
      error:
        error.message ||
        "Failed to load gallery images"
    });
  }
};



module.exports = {
  uploadFromDataUrl,
  getGalleryImages
};
