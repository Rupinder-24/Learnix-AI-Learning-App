import multer from "multer";
import cloudinaryStorage from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = cloudinaryStorage({
  cloudinary,
  params: {
    folder: "documents",
    resource_type: "raw", // required for PDFs
    allowed_formats: ["pdf"],
    public_id: (req, file) =>
      `${Date.now()}-${file.originalname}`,
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB
  },
});


export default upload;
