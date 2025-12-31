import axiosInstance from "../utils/axiosInstance.js"
import { API_PATHS } from "../utils/apiPaths.js";



// generate flashcard document

const generateFlashcards = async (documentId,options) => {
    try {
        const response=await axiosInstance.post(API_PATHS.AI.GENERATE_FLASHCARDS,{documentId,options});
        return response.data;

    } catch (error) {
        throw error.response?.data ||{message:"Failed to generate flashcards"};
        
        // next(error);

    }
}

// generate Quiz from document

const generateQuiz = async (documentId,options) => {
    try {
        const response=await axiosInstance.post(API_PATHS.AI.GENERATE_QUIZ,{documentId,options});
        return response.data;
       

    } catch (error) {
        throw error.response?.data ||{message:"Failed to generate quiz"};
        

    }

}

// generate document summary

const generateSummary = async (documentId) => {
    try {
        const response=await axiosInstance.post(API_PATHS.AI.GENERATE_SUMMARY,{documentId});
        return response.data;
       

    } catch (error) {
        throw error.response?.data ||{message:"Failed to generate summary"};
        

    }
}

// chat with document

const chat = async (documentId,message) => {
   try {
        const response=await axiosInstance.post(API_PATHS.AI.CHAT,{documentId,question:message});
        return response.data;
       

    } catch (error) {
        throw error.response?.data ||{message:"Failed to generate chat"};
        

    }
}

// explain concept of document
const explainConcept = async (documentId,concept) => {
  try {
        const response=await axiosInstance.post(API_PATHS.AI.EXPLAIN_CONCEPT,{documentId,concept});
        return response.data;
       

    } catch (error) {
        throw error.response?.data ||{message:"Failed to explain concept"};
        

    }

}

// get chat history

const getChatHistory = async (documentId) => {
   try {
        const response=await axiosInstance.get(API_PATHS.AI.GET_CHAT_HISTORY(documentId));
        return response.data;
       

    } catch (error) {
        throw error.response?.data ||{message:"Failed to fetch chat history"};
        

    }
}

const aiService={
    generateFlashcards,
    generateQuiz,
    generateSummary,
    chat,
    explainConcept,
    getChatHistory,
}

export default aiService;