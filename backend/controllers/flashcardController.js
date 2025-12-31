import Flashcard from "../models/Flashcard.js";

// get flash card

export const getFlashcards=async(req,res,next)=>{
    try {

        const flashcards=await Flashcard.find({
            userId:req.user._id,
            documentId:req.params.documentId,

        })
        .populate('documentId','title fileName')
        .sort({createdAt:-1});

        res.status(200).json({
            success:true,
            count:flashcards.length,
            data:flashcards
        });

        
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
        next(error);
        
    }

}

// get all flashcards sets

export const getAllFlashcardSets=async(req,res,next)=>{
    try {
        const flashcardSets=await Flashcard.find({
            userId:req.user._id,
            

        })
        .populate('documentId','title')
        .sort({createdAt:-1});

        res.status(200).json({
            success:true,
            count:flashcardSets.length,
            data:flashcardSets
        });

        
    } catch (error) {
        next(error);
        
    }
}

// Mark flash card as reviewed

export const reviewFlashcard=async(req,res,next)=>{
    try {
         
        const flashcardSet=await Flashcard.findOne({
            "cards._id":req.params.cardId,
            userId:req.user._id,
            

        })

        if(!flashcardSet){
            return res.status(404).json({
            success:false,
            error:"Flashcard set or card not found",
            statusCode:404
        });

        }
        const cardIndex=flashcardSet.cards.findIndex(card=>card._id.toString()===req.params.cardId);
        if(cardIndex===-1){
            return res.status(404).json({
            success:false,
            error:"Flashcard set or card not found",
            statusCode:404

        })
    }

    // update review info
    flashcardSet.cards[cardIndex].lastReviewed=new Date();
    flashcardSet.cards[cardIndex].reviewCount+=1;
    await flashcardSet.save();



        res.status(200).json({
            success:true,
            data:flashcardSet,
            message:"Flashcard reviewed successfully"
        });
        
    } catch (error) {
        console.error(error);
        next(error);
        
    }
}




// toggle star/favorite on flashcard

export const toggleStarFlashcard=async(req,res,next)=>{
    try {
         
          const flashcardSet=await Flashcard.findOne({
            "cards._id":req.params.cardId,
            userId:req.user._id,
            

        })

        if(!flashcardSet){
            return res.status(404).json({
            success:false,
            error:"Flashcard set or card not found",
            statusCode:404
        });

        }
        // req.params.cardId
        const cardIndex=flashcardSet.cards.findIndex(card=>card._id.toString()===req.params.cardId);
        if(cardIndex===-1){
            return res.status(404).json({
            success:false,
            error:"Flashcard set or card not found",
            statusCode:404

        })
    }
    flashcardSet.cards[cardIndex].isStarred=!flashcardSet.cards[cardIndex].isStarred;

    await flashcardSet.save();

    res.status(200).json({
            success:true,
            data:flashcardSet,
            message:`Flashcard ${flashcardSet.cards[cardIndex].isStarred?'starred':'unstarred'}`
        });


        
    } catch (error) {
        console.error(error);
        next(error);
        
    }

}

// delete flashcard 

export const deleteFlashcardSet=async(req,res,next)=>{
    try {
        const flashcardSet=await Flashcard.findOne({
            _id:req.params.id,
            userId:req.user._id,
            

        })
        if(!flashcardSet){
            return res.status(404).json({
                success:false,
                error:"Flashcard set not found",
                statusCode:404
            })
        }
        await flashcardSet.deleteOne();
         res.status(200).json({
            success:true,
            
            message:"Flashcard set deleted succesfuly"
        });


        
    } catch (error) {
        next(error);
        
    }
}