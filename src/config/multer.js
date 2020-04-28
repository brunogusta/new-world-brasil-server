import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

export default {
  dest: path.resolve(__dirname, '..', 'tmp', 'uploads'),
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.resolve(__dirname, '..', 'tmp', 'uploads'));
    },
    filename: (req, file, cb) => {
      crypto.randomBytes(16, (err, hash) => {
        if (err) cb(err);

        const fileName = `${hash.toString('hex')}-${file.originalname}`;
        cb(null, fileName);
      });
    },
  }),
  fileFilter: (req, file, cb) => {
    const allowedMime = ['image/jpeg', 'image/pjpeg'];

    if (allowedMime.includes(file.mimetype)) {
      cb(null, true);
    } else {
      req.fileValidationError = 'Formato de imagem não suportado';
      return cb(null, false, new Error('Formato de imagem não suportado'));
    }
  },
};
