import Document from "../models/Document.js"
import Flashcard from "../models/Flashcard.js"
import Quiz from "../models/Quiz.js"
import { extractTextFromPDF } from "../utils/pdfParser.js"
import { chunkText } from "../utils/textChunker.js"
import fs from "fs/promises"
import mongoose from "mongoose"
import { uploadPdfToCloudinary } from "../utils/cloudinaryUpload.js"













// ─── Upload ──────────────────────────────────────────────────────────────────
 const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const buffer = req.file.buffer;

    if (!buffer || buffer.length === 0) {
      return res.status(400).json({ message: 'File buffer is empty' });
    }

    console.log('📄 File received:', req.file.originalname, '|', buffer.length, 'bytes');

    // 1️⃣ Upload to Cloudinary + Extract text IN PARALLEL
    // Both use the same buffer — no HTTP fetching needed
    const [uploadResult, extractResult] = await Promise.allSettled([
      uploadPdfToCloudinary(buffer, req.file.originalname),
      extractTextFromPDF(buffer),
    ]);

    // 2️⃣ Handle upload result
    if (uploadResult.status === 'rejected') {
      console.error('Cloudinary upload failed:', uploadResult.reason);
      return res.status(500).json({ message: 'Failed to upload to Cloudinary' });
    }

    const cloudinaryData = uploadResult.value;

    // 3️⃣ Handle text extraction result
    const text   = extractResult.status === 'fulfilled' ? extractResult.value.text : '';
    const chunks = text ? chunkText(text, 500, 50) : [];
    const status = extractResult.status === 'fulfilled' ? 'ready' : 'failed';

    if (extractResult.status === 'rejected') {
      console.error('Text extraction failed:', extractResult.reason);
    }

    // 4️⃣ Save to MongoDB — single write, everything ready
    const document = await Document.create({
      userId:        req.user._id,
      title,
      fileName:      req.file.originalname,
      filePath:      cloudinaryData.secure_url,  // Cloudinary URL
      publicId:      cloudinaryData.public_id,
      extractedText: text,
      fileSize:      req.file.size,
      chunks,
      status,
    });

    console.log(`✅ Document saved: ${document._id} | status: ${status}`);

    return res.status(201).json({
      success: true,
      data:    document,
      message: status === 'ready'
        ? 'Document uploaded and processed successfully'
        : 'Document uploaded but text extraction failed',
    });

  } catch (error) {
    console.error('Upload error:', error.message);
    return res.status(500).json({ message: 'Upload failed', error: error.message });
  }
};

const getDocuments = async (req, res, next) => {
  try {
    const documents = await Document.aggregate([
      {
        $match: { userId: new mongoose.Types.ObjectId(req.user._id) }
      },
      {
        $lookup: {
          from: 'flashcards',
          localField: '_id',
          foreignField: 'documentId',
          as: 'flashcardSets'

        }
      },
      {
        $lookup: {
          from: 'quizzes',
          localField: '_id',
          foreignField: 'documentId',
          as: 'quizzes'

        }
      }, { //i find error in FlashcardCount
        $addFields: {
          FlashcardCount: { $size: '$flashcardSets' },
          quizCount: { $size: '$quizzes' }

        }
      },
      {
        $project: {
          extractedText: 0,
          chunks: 0,
          flashcardSets: 0,
          quizzes: 0
        }
      }, {
        $sort: {
          uploadDate: -1
        }
      }
    ]);

    res.status(200).json({
      count: documents.length,
      data: documents


    })


  } catch (error) {

    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
    next();



  }
}

const getDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    if (!document) {
      return res.status(404).json({
        error: 'Document not found',
        statusCode: 404
      });

    }
    // get counts assaciated flashcards ans quizzes
    const flashcardCount = await Flashcard.countDocuments({
      documentId: document._id,
      userId: req.user._id
    });
    const quizCount = await Quiz.countDocuments({
      documentId: document._id,
      userId: req.user._id
    });

    // update last accessed
    document.lastAccessed = Date.now();
    await document.save();

    // combine document data with counts
    const documentData = document.toObject();
    documentData.flashcardCount = flashcardCount;
    documentData.quizCount = quizCount;




    res.status(200).json({ success: true, data: documentData });


  } catch (error) {
    next(error);


  }
}

const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({ _id: req.params.id, userId: req.user._id });
    if (!document) {
      return res.status(404).json({ error: 'Document not found', statusCode: 404 });
    }
    //  Delete file from filesystem 
    await fs.unlink(document.filePath).catch(() => { });
    // Delete related data (VERY IMPORTANT) 
    await Flashcard.deleteMany({ documentId: document._id });
    await Quiz.deleteMany({ documentId: document._id });
    // Delete document 
    await document.deleteOne();
    res.status(200).json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    console.error(error);
    next(error);
  }
}








export {
  getDocument,
  getDocuments,
  deleteDocument,

  uploadDocument
}





