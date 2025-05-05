import multer from 'multer';
import path from 'path';

// Setting up storage engine for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Folder where images will be stored
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Ensures unique filenames by appending timestamp and random number
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true); // Allow the file
  } else {
    return cb(new Error('Only image files are allowed!'), false); // Reject the file
  }
};

// Multer setup with storage, fileFilter, and file size limit
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
});

export default upload;
