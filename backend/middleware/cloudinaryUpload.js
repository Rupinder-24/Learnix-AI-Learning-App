import cloudinary from "../config/cloudinary.js";

export const uploadToCloudinary = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "documents",
          resource_type: "raw", // PDFs
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      stream.end(req.file.buffer);
    });

    // 🔥 Normalize Cloudinary response
    req.file.cloudinary = {
      url: result.secure_url,
      publicId: result.public_id,
      size: result.bytes,
      originalName: req.file.originalname,
    };

    next();
  } catch (err) {
    next(err);
  }
};
