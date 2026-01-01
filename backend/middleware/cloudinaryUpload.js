import cloudinary from "../config/cloudinary.js";

export const uploadToCloudinaryAsync = async (file) => {
  if (!file) return null;

  return new Promise((resolve, reject) => {
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

    stream.end(file.buffer);
  });
};
