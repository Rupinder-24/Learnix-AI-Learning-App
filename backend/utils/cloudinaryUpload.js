import cloudinary from "../config/cloudinary.js";

export const uploadPdfToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        folder: "learnix/pdfs",
      },
      (error, result) => {
        if (error) return reject(error);
        result.inline_url = `${result.secure_url}?fl=attachment:false`;
        resolve(result);
      }
    ).end(buffer);
  });
};
