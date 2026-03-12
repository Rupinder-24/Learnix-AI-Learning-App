import multer from 'multer';

const upload = multer({
  storage: multer.memoryStorage(), // buffer in memory, no disk
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

export default upload;