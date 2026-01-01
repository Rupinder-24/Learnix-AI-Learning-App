import express from 'express'

import {
    uploadDocument,
    getDocuments,
    getDocument,
    deleteDocument,
    // updateDocument
} from '../controllers/documentController.js'
import protect from "../middleware/auth.js"
// import upload from '../config/multer.js';
import upload from "../middleware/upload.js";
import {uploadToCloudinary } from "../middleware/cloudinaryUpload.js";
const router=express.Router();

router.use(protect);
router.post("/upload",upload.single('file'),uploadToCloudinary,uploadDocument);

router.get("/",getDocuments);
router.get("/:id",getDocument);
router.delete("/:id",deleteDocument);
// router.put("/:id",updateDocument);


export default router;
