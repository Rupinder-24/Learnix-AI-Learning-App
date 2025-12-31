import axiosInstance from "../utils/axiosInstance.js";
import { API_PATHS } from "../utils/apiPaths.js";


// get all flashcards sets

 const getQuizzesForDocument=async(documentId)=>{
   try {
        const response=await axiosInstance.get(API_PATHS.QUIZZES.GET_QUIZZES_FOR_DOC(documentId));
        return response.data;

    } catch (error) {
        throw error.response?.data ||{message:"Failed to fetch quiz"};
        
        // next(error);

    }
}
const getQuizById=async(quizId)=>{
try {
        const response=await axiosInstance.get(API_PATHS.QUIZZES.GET_QUIZ_BY_ID(quizId));
        return response.data;

    } catch (error) {
        throw error.response?.data ||{message:"Failed to fetch Quiz"};
        
        // next(error);

    }

}




// Mark flash card as reviewed

 const submitQuiz=async(quizId,answers)=>{
 try {
        const response=await axiosInstance.post(API_PATHS.QUIZZES.SUBMIT_QUIZ(quizId),{answers});
        return response.data;

    } catch (error) {
        throw error.response?.data ||{message:"Failed to submit quiz"};
        
        // next(error);

    }
}


// toggle star/favorite on flashcard

 const getQuizResults=async(quizId)=>{
   try {
        const response=await axiosInstance.get(API_PATHS.QUIZZES.GET_QUIZ_RESULTS(quizId));
        return response.data;

    } catch (error) {
        throw error.response?.data ||{message:"Failed to fetch quiz result"};
        
        // next(error);

    }

}

// delete flashcard 

const deleteQuiz=async(quizId)=>{
   try {
        const response=await axiosInstance.delete(API_PATHS.QUIZZES.DELETE_QUIZ(quizId));
        return response.data;

    } catch (error) {
        throw error.response?.data ||{message:"Failed to delete quiz"};
        
        // next(error);

    }
}


const quizService={
    getQuizzesForDocument,
    getQuizById,
    getQuizResults,
    submitQuiz,
    deleteQuiz
}

export default quizService;