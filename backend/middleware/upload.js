import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "documents",
    resource_type: "raw", // IMPORTANT for PDF, DOCX
    allowed_formats: ["pdf"],
    public_id: (req, file) => {
      return `${Date.now()}-${file.originalname}`;
    },
  },
});

const upload = multer({ storage });

export default upload;
