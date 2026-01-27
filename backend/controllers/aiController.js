import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";
import ChatHistory from "../models/ChatHistory.js";
import * as geminiService from "../utils/geminiService.js"
import { findRelevantChunks } from "../utils/textChunker.js";


// generate flashcard document

export const generateFlashcards = async (req, res, next) => {
    try {
        const { documentId, count = 10 } = req.body;

        if (!documentId) {
            return res.status(400).json({
                success: false,
                error: 'Please provide documentId',
                statusCode: 400
            });
        }

        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'ready'
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found or not ready',
                statusCode: 404
            });

        }
        
        const cards = await geminiService.generateFlashcards(
            document.extractedText,
            Number(count)
        );
        
        const flashcardSet= await Flashcard.create({
            userId: req.user._id,
            documentId: document._id,
            cards:cards.map(card => ({
                question: card.question,
                answer: card.answer,
                difficulty: card.difficulty,
                reviewCount: 0,
                isStarred: false
            })),
        });
        res.status(200).json({
            success: true,
            data: flashcardSet,
            message: "Flashcards generated successfuly"
        });


    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
        next(error);

    }
}

// generate Quiz from document

export const generateQuiz = async (req, res, next) => {
    try {
        const { documentId, numQuestions = 5, title } = req.body;
        if (!documentId) {
            return res.status(400).json({
                success: false,
                error: "Please provide documentId",
                statusCode: 400
            });
        }

        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: "ready"
        });
        if (!document) {
            return res.status(404).json({
                success: false,
                error: "Document not found or not ready",
                statusCode: 404
            });

        }
        // Generate quiz using gemini

        const questions =await geminiService.generateQuiz(
            document.extractedText,
            Number(numQuestions)
        );
        // save to database
        const quiz = await Quiz.create({
            userId: req.user._id,
            documentId: document._id,
            title: title || `${document.title}- Quiz`,
            questions: questions,
            totalQuestions: questions.length,
            userAnswers: [],
            score: 0
        });
        res.status(201).json({
            success: true,
            data: quiz,
            message: "Quiz generated successfuly"
        });

    } catch (error) {
        console.error(error);

        next(error);

    }

}

// generate document summary

export const generateSummary = async (req, res, next) => {
    try {
        const { documentId } = req.body;
        if (!documentId) {
            return res.status(400).json({
                success: false,
                error: "Please provide documentId",
                statusCode: 400
            })
        }
        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: "ready"
        });
        if (!document) {
            return res.status(404).json({
                success: false,
                error: "Document not found or not ready",
                statusCode: 404
            })
        }
        // Generate summary
        const summary = await geminiService.generateSummary(document.extractedText);
        res.status(200).json({
            success: true,
            data: {
                documentId: document._id,
                title: document.title,
                summary
            },
            message: "Summary generated successfuly"
        });

    } catch (error) {
        next(error);
    }
}

// chat with document

export const chat = async (req,res,next) => {
    try {
        const {documentId,question}=req.body;
        if(!documentId || !question){
            return res.status(400).json({
                success:false,
                error:"Please provide documentId and question",
                statusCode:400
            });
        }
        const document=await Document.findOne({
            _id:documentId,
            userId:req.user._id,
            status:"ready"
        });

        if(!document){
            return res.status(404).json({
                success:false,
                error:"Document not found or not ready",
                statusCode:404

            });
        }

        // Find relevant chunks
        const relevantChunks=findRelevantChunks(document.chunks,question,3);
        const chunkIndices=relevantChunks.map(c => c.chunkIndex);

        // Get or create chat history
        let chatHistory=await ChatHistory.findOne({
            userId:req.user._id,
            documentId:document._id,

        });

        if(!chatHistory){
            chatHistory=await ChatHistory.create({
                userId:req.user._id,
                documentId:document._id,
                message:[]
            });
        }

        // Generate response using gemini

        const answer=await geminiService.chatWithContext(question,relevantChunks);
        // save conversation
        chatHistory.message.push(
            {
                role:"user",
                content:question,
                timestamp:new Date(),
                relevantChunks:[]

            },
            {
                role:"assistant",
                content:answer,
                timestamp:new Date(),
                relevantChunks:chunkIndices

            },
        );
        await chatHistory.save();

        res.status(200).json({
            success:true,
            data:{
                question,
                answer,
                relevantChunks:chunkIndices,
                chatHistory:chatHistory._id,
            },
            message:"Response generated successfuly"
        });

    } catch (error) {
        console.error(error);
        next(error);

    }
}

// explain concept of document
export const explainConcept = async (req, res, next) => {
    try {
        const {documentId,concept}=req.body;
        if(!documentId || !concept){
            return res.status(400).json({
                success:false,
                error:"Please provide documentId and question",
                statusCode:400
            });
        }
        const document=await Document.findOne({
            _id:documentId,
            userId:req.user._id,
            status:"ready"
        });
        if(!document){
            return res.status(404).json({
                success:false,
                error:"Document not found or not ready",
                statusCode:404

            });
        }
         // Find relevant chunks
        const relevantChunks=findRelevantChunks(document.chunks,concept,3);
        const context=relevantChunks.map(c => c.content).join('\n\n');

         // Generate response using gemini

        const explanation=await geminiService.explainConcept(concept,context);

        res.status(200).json({
            success:true,
            data:{
                concept,
                explanation,
                relevantChunks:relevantChunks.map(c=>c.chunkIndex),
                
            },
            message:"Explanation  generated successfuly"
        });



    } catch (error) {
        next();

    }

}

// get chat history

export const getChatHistory = async (req,res,next) => {
    try {
        const {documentId}=req.params;
        if(!documentId){
            return res.status(400).json({
                success:false,
                error:"Please provide documentId ",
                statusCode:400
            });
        }
         const chatHistory=await ChatHistory.findOne({
            userId:req.user._id,
            documentId:documentId,

        }).select('message');//only retriev the data

        if(!chatHistory){
            return res.status(200).json({
                success:true,
                data:[],
                message:"No chat history found"
            });
        }

        res.status(200).json({
            success:true,
            data:chatHistory.message,
            message:"Chat history retrievd successfuly"
        })




    } catch (error) {
        console.error(error);
        next(error);

    }
}