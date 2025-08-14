import multer from 'multer';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs'


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// const uploadDirectory = path.join(__dirname, '..', '..', 'public', 'temp');

// Set up storage engine for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../temp/uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ storage, fileFilter });


export default upload
