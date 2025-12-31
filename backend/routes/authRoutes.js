import express from 'express';
import { registerUser, loginUser, getUserProfile, updateUserProfile,changePassword } from '../controllers/authController.js';
import protect  from '../middleware/auth.js';
// import upload from '../middleware/uploadMiddleware.js';
import {body} from "express-validator"

const router=express.Router();

// Validation Middleware

const registerValidation=[
    body('name')
    .trim()
    .isLength({min:3})
    .withMessage('Username must be atleast 3 characters'),
    body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
    body('password')
    .isLength({min:6})
    .withMessage('Password must be at least 6 characters')

];

const loginValidation=[
   
    body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
    body('password')
    .notEmpty()
    .withMessage('Password is required')

];



// Auth Routes

router.post("/signup",registerValidation,registerUser);
router.post("/login",loginValidation,loginUser);
router.get("/profile",protect,getUserProfile);//get user profile
router.put("/profile",protect,updateUserProfile);//update user profile
router.post("/change-password",protect,changePassword);

// router.post("/upload-image",upload.single("image"),(req,res)=>{
//     if(!req.file){
//         return res.status(400).json({message:"No file uploaded"});
        
//     };
//     const imageUrl=`${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
//          res.status(200).json({imageUrl});
// });

export default router;
