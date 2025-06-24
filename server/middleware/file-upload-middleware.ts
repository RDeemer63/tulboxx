import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Set up storage with disk storage engine
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (_req, file, cb) => {
    // Use UUID for unique filename and preserve original extension
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

// Create file filter to validate uploads
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allow only specific file types based on MIME types
  const allowedMimeTypes = [
    'image/jpeg', 
    'image/png', 
    'image/gif', 
    'application/pdf',
    'image/svg+xml'
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed types: ${allowedMimeTypes.join(', ')}`));
  }
};

// Configure size limits
const limits = {
  fileSize: 5 * 1024 * 1024, // 5MB max file size
};

// Export the configured multer middleware
export const upload = multer({ 
  storage, 
  fileFilter,
  limits 
});

// Helper middleware to handle single file uploads
export const uploadSingle = (fieldName: string) => upload.single(fieldName);

// Helper middleware to handle multiple file uploads
export const uploadMultiple = (fieldName: string, maxCount: number = 5) => 
  upload.array(fieldName, maxCount);

// Helper to handle multiple fields with different files
export const uploadFields = (fields: { name: string, maxCount: number }[]) => 
  upload.fields(fields);
