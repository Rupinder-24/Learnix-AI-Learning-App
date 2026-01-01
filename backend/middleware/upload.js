import multer from "multer";
import cloudinaryStorage from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = cloudinaryStorage({
  cloudinary, // MUST be v2 instance
  params: {
    folder: "documents",
    resource_type: "raw",
    allowed_formats: ["pdf"],
    public_id: (req, file) => {
      return `${Date.now()}-${file.originalname}`;
    },
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      cb(new Error("Only PDF files are allowed"));
    } else {
      cb(null, true);
    }
  },
});

console.log("Cloudinary ready:", !!cloudinary.uploader);


export default upload;
