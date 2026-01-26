import Document from "../models/Document.js"
import Flashcard from "../models/Flashcard.js"
import Quiz from "../models/Quiz.js"
import { extractTextFromPDF } from "../utils/pdfParser.js"
import { chunkText } from "../utils/textChunker.js"
import fs from "fs/promises"
import mongoose from "mongoose"
import { uploadPdfToCloudinary } from "../utils/cloudinaryUpload.js"



// upload pdf document (Cloudinary version)

// (async function () {
//   try {
//     // Upload a PDF document
//     const uploadResult = await cloudinary.uploader.upload(
//       "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
//       {
//         resource_type: "raw", // 🔴 REQUIRED for PDF
//         public_id: "sample_pdf",
//         folder: "learnix/pdfs",
//       }
//     );

//     console.log("PDF uploaded:", uploadResult.secure_url);

//     // Access PDF URL
//     const pdfUrl = cloudinary.url(uploadResult.public_id, {
//       resource_type: "raw",
//     });

//     console.log("PDF URL:", pdfUrl);

//   } catch (error) {
//     console.error("Upload error:", error);
//   }
// })();



// const uploadDocument = async (req, res, next) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({
//         success: false,
//         message: "Please upload pdf file",
//         statusCode: 400
//       });
//     }
//     const { title } = req.body;
//     if (!title) {
//       // Delete upload file if no title
//       await fs.unlink(req.file.path);
//       return res.status(400).json({ message: "Please provive document title" });
//     }
//     // construct the URl to upload file
//     // const baseUrl = "https://learnix-ai-learning-app.onrender.com";
//     const baseUrl = "http://localhost:8000";
//     const fileUrl = `${baseUrl}/uploads/documents/${req.file.filename}`;

//     // create document
//     const document = await Document.create({
//       userId: req.user._id,
//       title,
//       fileName: req.file.originalname,
//       filePath: fileUrl,
//       fileSize: req.file.size,
//       status: "processing"
//     })
//     // Process pdf in background
//     processPDF(document._id, req.file.path).catch(err => {
//       console.error('PDF processing error:', err);
//     });
//     res.status(201).json({
//       success: true,
//       data: document,
//       message: "Document upload successfuly"
//     })



//   } catch (error) {
//     console.error(error);
//     // clean up file error
//     if (req.file) {
//       await fs.unlink(req.file.path).catch(() => { })
//     }
//     next();

//   }
// }

// upload pdf document (Cloudinary version)



const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    console.log("UPLOAD DEBUG:", {
      size: req.file.size,
      bufferLength: req.file.buffer.length,
    });

    // 1️⃣ Upload to Cloudinary
    const uploadResult = await uploadPdfToCloudinary(req.file.buffer);

    console.log("CLOUDINARY DEBUG:", {
      bytes: uploadResult.bytes,
    });
    

    // 2️⃣ Extract text
    const { text } = await extractTextFromPDF(uploadResult.secure_url);

    // 3️⃣ Chunk text
    const chunks = chunkText(text, 500, 50);

    // 4️⃣ Save document
    // const fileUrl = `${uploadResult.secure_url}`;
    const baseUrl = "https://learnix-ai-learning-app.onrender.com";
    const fileUrl = `${baseUrl}/uploads/documents/${uploadResult.secure_url}`;
    const document = await Document.create({
      userId: req.user._id,
      title,
      fileName: req.file.originalname,
      filePath:fileUrl,
      publicId: uploadResult.public_id,
      extractedText: text,
      fileSize: req.file.size,
      chunks,
      status: "processing",
    });

    return res.status(201).json({
      success: true,
      data: document,
    });

  } catch (error) {
    console.error("Upload document error:", error);
    return res.status(500).json({ message: "Upload failed" });
  }
};

const processPDF = async (documentId, filePath) => {
  try {
    const { text } = await extractTextFromPDF(filePath);

    // create chunk
    const chunks = chunkText(text, 500, 50);

    // update document
    await Document.findByIdAndUpdate(documentId, {
      extractedText: text,
      chunks: chunks,
      status: 'ready'
    });

    console.log(`Document ${documentId} processed successfully`);


  } catch (error) {
    console.error(`Error processing document ${documentId}`, error);
    await Document.findByIdAndUpdate(documentId, {
      status: "failed"

    });

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





