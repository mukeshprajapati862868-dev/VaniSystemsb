const mongoose = require("mongoose");
const VideoGallery = require("../models/VideoGallery");

const MAX_VIDEO_SIZE = 10 * 1024 * 1024; // 10 MB

const DATA_URL_REGEX =
  /^data:(video\/[a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=\r\n]+)$/;

const validateObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const parseDataUrl = (dataUrl) => {
  if (typeof dataUrl !== "string") {
    return null;
  }

  const match = dataUrl.match(DATA_URL_REGEX);

  if (!match) {
    return null;
  }

  const mimeType = match[1];
  const base64 = match[2].replace(/\s/g, "");

  let buffer;

  try {
    buffer = Buffer.from(base64, "base64");
  } catch (error) {
    return null;
  }

  if (!buffer || buffer.length === 0) {
    return null;
  }

  return {
    mimeType,
    base64,
    buffer,
  };
};

// ======================================================
// GET ALL VIDEOS
// ======================================================
exports.getVideoGallery = async (req, res) => {
  try {
    const videos = await VideoGallery.find({})
      .select("-dataUrl")
      .sort({ createdAt: -1 })
      .lean();

    const formattedVideos = videos.map((video) => ({
      ...video,
      id: video._id,
      path: `/api/videos/video/${video._id}`,
      url: `/api/videos/video/${video._id}`,
    }));

    res.status(200).json({
      success: true,
      count: formattedVideos.length,
      data: formattedVideos,
    });
  } catch (error) {
    console.error("Get video gallery error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch videos",
      error: error.message,
    });
  }
};

// ======================================================
// GET SINGLE VIDEO FILE
// ======================================================
exports.getVideo = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid video ID",
      });
    }

    const video = await VideoGallery.findById(id).lean();

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    const parsed = parseDataUrl(video.dataUrl);

    if (!parsed) {
      return res.status(500).json({
        success: false,
        message: "Invalid stored video data",
      });
    }

    // IMPORTANT:
    // Browser video player needs the actual binary video
    // with the correct Content-Type.
    res.setHeader("Content-Type", parsed.mimeType);
    res.setHeader("Content-Length", parsed.buffer.length);

    res.setHeader(
      "Cache-Control",
      "public, max-age=31536000, immutable"
    );

    res.setHeader("Accept-Ranges", "bytes");

    res.setHeader(
      "Cross-Origin-Resource-Policy",
      "cross-origin"
    );

    return res.status(200).send(parsed.buffer);
  } catch (error) {
    console.error("Get video error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load video",
      error: error.message,
    });
  }
};

// ======================================================
// UPLOAD VIDEO
// ======================================================
exports.uploadVideo = async (req, res) => {
  try {
    const { name, dataUrl } = req.body;

    if (!name || !dataUrl) {
      return res.status(400).json({
        success: false,
        message: "Video name and dataUrl are required",
      });
    }

    const parsed = parseDataUrl(dataUrl);

    if (!parsed) {
      return res.status(400).json({
        success: false,
        message: "Invalid video Data URL",
      });
    }

    if (parsed.buffer.length > MAX_VIDEO_SIZE) {
      return res.status(413).json({
        success: false,
        message:
          "Video size must be less than or equal to 10 MB",
      });
    }

    const allowedTypes = [
      "video/mp4",
      "video/webm",
      "video/ogg",
      "video/mpeg",
      "video/quicktime",
    ];

    if (!allowedTypes.includes(parsed.mimeType)) {
      return res.status(400).json({
        success: false,
        message:
          "Unsupported video format. Please upload MP4, WebM, OGG or MOV.",
      });
    }

    const video = await VideoGallery.create({
      name: String(name).trim(),
      dataUrl: dataUrl,
      mimeType: parsed.mimeType,
      path: "",
    });

    video.path = `/api/videos/video/${video._id}`;

    await video.save();

    res.status(201).json({
      success: true,
      message: "Video uploaded successfully",

      data: {
        _id: video._id,
        id: video._id,
        name: video.name,
        path: video.path,
        url: video.path,
        mimeType: video.mimeType,
        createdAt: video.createdAt,
        updatedAt: video.updatedAt,
      },
    });
  } catch (error) {
    console.error("Upload video error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to upload video",
      error: error.message,
    });
  }
};

// ======================================================
// UPDATE VIDEO
// ======================================================
exports.updateVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, dataUrl } = req.body;

    if (!validateObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid video ID",
      });
    }

    const video = await VideoGallery.findById(id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    if (name) {
      video.name = String(name).trim();
    }

    if (dataUrl) {
      const parsed = parseDataUrl(dataUrl);

      if (!parsed) {
        return res.status(400).json({
          success: false,
          message: "Invalid video Data URL",
        });
      }

      if (parsed.buffer.length > MAX_VIDEO_SIZE) {
        return res.status(413).json({
          success: false,
          message:
            "Video size must be less than or equal to 10 MB",
        });
      }

      const allowedTypes = [
        "video/mp4",
        "video/webm",
        "video/ogg",
        "video/mpeg",
        "video/quicktime",
      ];

      if (!allowedTypes.includes(parsed.mimeType)) {
        return res.status(400).json({
          success: false,
          message:
            "Unsupported video format. Please upload MP4, WebM, OGG or MOV.",
        });
      }

      video.dataUrl = dataUrl;
      video.mimeType = parsed.mimeType;
    }

    video.path = `/api/videos/video/${video._id}`;

    await video.save();

    res.status(200).json({
      success: true,
      message: "Video updated successfully",

      data: {
        _id: video._id,
        id: video._id,
        name: video.name,
        path: video.path,
        url: video.path,
        mimeType: video.mimeType,
        createdAt: video.createdAt,
        updatedAt: video.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update video error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update video",
      error: error.message,
    });
  }
};

// ======================================================
// DELETE VIDEO
// ======================================================
exports.deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid video ID",
      });
    }

    const video = await VideoGallery.findByIdAndDelete(id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Video deleted successfully",
    });
  } catch (error) {
    console.error("Delete video error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete video",
      error: error.message,
    });
  }
};