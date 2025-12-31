import Document from "../models/Document.js"
import Flashcard from "../models/Flashcard.js"
import Quiz from "../models/Quiz.js"
import { extractTextFromPDF } from "../utils/pdfParser.js"
import { chunkText } from "../utils/textChunker.js"
import fs from "fs/promises"
import mongoose from "mongoose"


// upload pdf document
const uploadDocument = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload pdf file",
                statusCode: 400
            });
        }
        const { title } = req.body;
        if (!title) {
            // Delete upload file if no title
            await fs.unlink(req.file.path);
            return res.status(400).json({ message: "Please provive document title" });
        }
        // construct the URl to upload file
        const baseUrl = `https://localhost:${process.env.PORT || 8000}`;
        const fileUrl = `${baseUrl}/uploads/documents/${req.file.filename}`;

        // create document
        const document = await Document.create({
            userId: req.user._id,
            title,
            fileName: req.file.originalname,
            filePath: fileUrl,
            fileSize: req.file.size,
            status: "processing"
        })
        // Process pdf in background
        processPDF(document._id, req.file.path).catch(err => {
            console.error('PDF processing error:', err);
        });
        res.status(201).json({
            success: true,
            data: document,
            message: "Document upload successfuly"
        })



    } catch (error) {
        console.error(error);
        // clean up file error
        if (req.file) {
            await fs.unlink(req.file.path).catch(() => { })
        }
        next();

    }
}

// helper function to process pdf
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

        // Delete file from filesystem
        // await fs.unlink(document.filePath).catch(() => { });
        // ✅ Convert URL → filesystem path
    if (document.filePath && process.env.BASE_URL) {
      const relativePath = document.filePath.replace(process.env.BASE_URL, "");
      const absolutePath = path.join(process.cwd(), relativePath);

      await fs.unlink(absolutePath).catch(() => {});
    }
        // Delete related data (VERY IMPORTANT)
        await Flashcard.deleteMany({ documentId: document._id });
        await Quiz.deleteMany({ documentId: document._id });
        // Delete document
        await document.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Document deleted successfully'
        });



    } catch (error) {
        console.error(error);
        next(error);


    }
}

// export const updateDocument = async (res, req, next) => {
//     try {


//     } catch (error) {


//     }
// }

export {
    getDocument,
    getDocuments,
    deleteDocument,

    uploadDocument
}