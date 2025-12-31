export const BASE_URL ="http://localhost:8000";
// utils/api/paths.js 
export const API_PATHS = {
    AUTH: {
        REGISTER: "/api/auth/signup",//Register a new user
        LOGIN: "/api/auth/login",//Authentication user 
        GET_PROFILE: "/api/auth/profile",
        UPDATE_PROFILE:"/api/auth/profile",
        CHANGE_PASSWORD:"/api/auth/change-password"
    },
    DOCUMENTS:{
        UPLOAD:"/api/documents/upload",
        GET_DOCUMENTS:"/api/documents",
        GET_DOCUMENT_BY_ID:(id)=>`/api/documents/${id}`,
        UPDATE_DOCUMENT:(id)=>`/api/documents/${id}`,
        DELETE_DOCUMENT:(id)=>`/api/documents/${id}`,
    },
    AI:{
        GENERATE_FLASHCARDS:"/api/ai/generate-flashcards",
        GENERATE_QUIZ:"/api/ai/generate-quiz",
        GENERATE_SUMMARY:"/api/ai/generate-summary",
        CHAT:"/api/ai/chat",
        EXPLAIN_CONCEPT:"/api/ai/explain-concept",
        GET_CHAT_HISTORY:(documentId)=>`/api/ai/chat-history/${documentId}`,

    },
   


    
        FLASHCARDS: {
            GET_ALL_FLASHCARD_SETS: "/api/flashcards",//get dashboard data 
            GET_FLASHCARDS_FOR_DOC: (documentId)=>`/api/flashcards/${documentId}`,//get user dashboard data 
            REVIEW_FLASHCARD:(cardId)=>`/api/flashcards/${cardId}/review`,
            TOGGLE_STAR:(cardId)=>`/api/flashcards/${cardId}/star`,
            DELETE_FLASHCARD_SET:(id)=>`/api/flashcards/${id}`,
            
           
        },

        QUIZZES: {
            GET_QUIZZES_FOR_DOC: (documentId) => `/api/quizzes/${documentId}`,
            GET_QUIZ_BY_ID: (id) => `/api/quizzes/quiz/${id}`,
            SUBMIT_QUIZ: (id) => `/api/quizzes/${id}/submit`,
            GET_QUIZ_RESULTS: (id) => `/api/quizzes/${id}/results`,
            DELETE_QUIZ: (id) => `/api/quizzes/${id}`,
        },

        PROGRESS: {
            GET_DASHBOARD: "/api/progress/dashboard"
        },

        // REPORTS: {
        //     EXPORT_TASKS: "/api/reports/export/tasks",//Download all tasks as an EXCEl/pdf report
        //     EXPORT_USERS: "/api/reports/export/users",//Download user tasks report 
        // },
        // IMAGE: {
        //     UPLOAD_IMAGE: "/api/auth/upload-image",
        // },
    };


