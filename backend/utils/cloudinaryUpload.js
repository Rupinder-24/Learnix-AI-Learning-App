import cloudinary from '../config/cloudinary.js';
import { Readable } from 'stream';

export const uploadPdfToCloudinary = (buffer, originalName) => {
  return new Promise((resolve, reject) => {
    if (!buffer || buffer.length === 0) {
      return reject(new Error('No buffer provided'));
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw',
        folder:        'learnix/pdfs',
        type:          'upload',
        access_mode:   'public',
        public_id:     `${Date.now()}-${originalName.replace('.pdf', '')}`,
      },
      (error, result) => {
        if (error) return reject(error);
        console.log('✅ Cloudinary upload:', result.bytes, 'bytes ->', result.secure_url);
        resolve(result);
      }
    );

    const readable = new Readable();
    readable.push(Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer));
    readable.push(null);
    readable.pipe(uploadStream);
  });
};

export const deletePdfFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
    console.log('🗑️ Deleted from Cloudinary:', publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error.message);
  }
};