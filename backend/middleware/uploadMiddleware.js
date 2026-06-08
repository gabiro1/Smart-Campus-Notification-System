import multer from "multer";
import path from "path";

// 1. Temporary Storage (keeps the file in RAM for a second before sending to Firebase)
const storage = multer.memoryStorage();

// 2. The Bouncer's Rules
const upload = multer({
  storage: storage,
  limits: {
    // Strict 10 Megabyte limit (10 * 1024 * 1024 bytes)
    fileSize: 10 * 1024 * 1024, 
  },
  fileFilter: (req, file, cb) => {
    // 3. Security: Only allow these specific academic file types (including CSV/XLSX for bulk import)
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|ppt|pptx|mp4|mp3|wav|csv|xlsx|xls/;
    
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true); // Safe to enter!
    } else {
      // Reject and send an error message
      cb(new Error("Error: File type not supported. Use images, documents, or standard media."));
    }
  }
});

export default upload;