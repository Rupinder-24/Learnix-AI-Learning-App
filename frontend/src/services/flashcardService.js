import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";


// get all flashcards sets

 const getAllFlashcardSets=async()=>{
   try {
        const response=await axiosInstance.get(API_PATHS.FLASHCARDS.GET_ALL_FLASHCARD_SETS);
        return response.data;

    } catch (error) {
        throw error.response?.data ||{message:"Failed to fetch flashcards"};
        
        // next(error);

    }
}
const getFlashcardsForDocument=async(documentId)=>{
try {
        const response=await axiosInstance.get(API_PATHS.FLASHCARDS.GET_FLASHCARDS_FOR_DOC(documentId));
        return response.data;

    } catch (error) {
        throw error.response?.data ||{message:"Failed to fetch flashcards"};
        
        // next(error);

    }

}




// Mark flash card as reviewed

 const reviewFlashcard=async(cardId)=>{
 try {
        const response=await axiosInstance.post(API_PATHS.FLASHCARDS.REVIEW_FLASHCARD(cardId));
        return response.data;

    } catch (error) {
        throw error.response?.data ||{message:"Failed to review flashcards"};
        
        // next(error);

    }
}




// toggle star/favorite on flashcard

 const toggleStar=async(cardId)=>{
   try {
        const response=await axiosInstance.put(API_PATHS.FLASHCARDS.TOGGLE_STAR(cardId));
        return response.data;

    } catch (error) {
        throw error.response?.data ||{message:"Failed to star flashcards"};
        
        // next(error);

    }

}

// delete flashcard 

const deleteFlashcardSet=async(id)=>{
   try {
        const response=await axiosInstance.delete(API_PATHS.FLASHCARDS.DELETE_FLASHCARD_SET(id));
        return response.data;

    } catch (error) {
        throw error.response?.data ||{message:"Failed to delete flashcards"};
        
        // next(error);

    }
}


const flashcardService={
    getAllFlashcardSets,
    getFlashcardsForDocument,
    reviewFlashcard,
    toggleStar,
    deleteFlashcardSet
}

export default flashcardService;