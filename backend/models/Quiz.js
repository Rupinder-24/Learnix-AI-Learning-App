import mongoose from "mongoose";

const quizSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    documentId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Document',
        required:true

    },
    title:{
        type:String,
        trim:true,
        required:true

    },
    questions:[{
        question:{
            type:String,
            required:true,
        },
        options:{
            type:[String],
            required:true,
            validate:[array=>array.length===4,'Must have exactly 4 option']
        },
        explanation:{
            type:String,
            required: true
        },
        difficulty: {
        type: String,
        enum: ["easy", "medium", "hard"], // ✅ enum belongs here
        default: "medium",
      },

    }],
    userAnswers:[{
        questionIndex:{
            type:Number,
            required:true
        },
        selectedAnswer:{
            type:String,
            required:true
        },
        isCorrect:{
            type:Boolean,
            required:true
        },
        answerAt:{
            type:Date,
            default:Date.now
        },


    }],
    score:{
        type:Number,
        default:0
    },
    totalQuestions:{
        type:Number,
        required:true
    },
    completedAt:{
        type:Date,
        default:null
    }
},{timestamps:true}
);

// Index faster queries

quizSchema.index({userId:1,documentId:1});

const Quiz=mongoose.model("Quiz",quizSchema);

export default Quiz;