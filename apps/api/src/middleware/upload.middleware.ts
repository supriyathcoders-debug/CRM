import multer from 'multer';
import { ValidationError } from '../utils/errors';

const imageMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

export const uploadLogoMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!imageMimes.includes(file.mimetype)) {
      cb(new ValidationError('Only image files are allowed (JPEG, PNG, WebP, GIF, SVG)'));
      return;
    }
    cb(null, true);
  },
}).single('logo');
