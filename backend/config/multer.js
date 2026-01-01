// import multer from "multer";
// import path from "path"
// import { fileURLToPath } from "url";
// import fs from 'fs'

// const __filename=fileURLToPath(import.meta.url);
// const __dirname=path.dirname(__filename);

// const uploadDir=path.join(__dirname,'../uploads/documents');

// if(!fs.existsSync(uploadDir)){
//     fs.mkdirSync(uploadDir,{recursive:true});
// }

// // Configure multer storage (in-memory storage)
// const storage=multer.diskStorage({
//     destination:(req,file,cb)=>{
//         cb(null,uploadDir);
//     },
//     filename:(req,file,cb)=>{
//         const uniqueSuffix=Date.now() + '-' + Math.round(Math.random()*1E9);
//         cb(null,`${uniqueSuffix}-${file.originalname}`);
//     }
// });

// // File filter to accept only images
// const fileFilter=(req,file,cb)=>{
//     const allowedTypes=["application/pdf"];
//     if(allowedTypes.includes(file.mimetype)){
//         cb(null,true);
//     }else{
//         cb(new Error("Only .jpeg,.jpg and .png file type allowed"),false);
//     }
// };

// const upload=multer({storage,fileFilter,limits:{
//     fileSize:parseInt(process.env.MAX_FILE_SIZE) || 20971520
// }});

// export default upload;