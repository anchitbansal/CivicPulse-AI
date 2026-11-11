import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');

// Ensure uploads folder exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * Saves a file buffer locally and returns the web-accessible path.
 * Can be cleanly swapped with a Cloudinary / S3 implementation.
 */
export const saveBufferLocally = async (buffer, originalName = 'upload.jpg') => {
  const ext = path.extname(originalName) || '.jpg';
  const cleanBase = path
    .basename(originalName, ext)
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 30);
  const fileName = `${Date.now()}-${cleanBase}${ext}`;
  const filePath = path.join(UPLOADS_DIR, fileName);

  await fs.promises.writeFile(filePath, buffer);
  return `/uploads/${fileName}`;
};

export const getUploadsDirectory = () => UPLOADS_DIR;
