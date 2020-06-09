import express from 'express';
import { uploadFile } from '../utils/handleS3';
import sharp from 'sharp';
import fs from 'fs';
import multer from 'multer';
import multerConfig from '../config/multer';
import authMiddleware from '../middlewares/auth';
import Post from '../models/postsSchema';

const router = express.Router();

router.get('/load-posts', async (req, res) => {
  try {
    const { page: currentPage } = req.query;
    let skipPages = 0;

    if (currentPage !== '1') {
      skipPages = (currentPage - 1) * 5;
    }

    const totalPosts = await Post.countDocuments();
    let totalPages = 1;

    if (totalPosts > 5) {
      totalPages = Math.ceil(totalPosts / 5);
    }

    const posts = await Post.find()
      .skip(skipPages)
      .limit(5);

    res.status(200).send({
      posts,
      totalPages,
    });
  } catch (e) {
    res
      .status(500)
      .send({ error: 'Houve um erro inesperado, recarregue a página' });
  }
});

router.use(authMiddleware);
router.post(
  '/new-post',
  multer(multerConfig).single('file'),
  async (req, res) => {
    const { title, description } = req.body;

    try {
      if (!req.isAdmin) {
        return res.status(401).send('Usuário não é administrador.');
      }

      if (req.fileValidationError) {
        return res.status(400).send(req.fileValidationError);
      }

      if (req.file) {
        const resizedImageBuf = await sharp(req.file.path)
          .resize(1000, 555, {
            fit: 'fill',
          })
          .jpeg({ quality: 100 })
          .toBuffer();

        const base64 = `data:image/jpeg;base64,${resizedImageBuf.toString(
          'base64'
        )}`;

        const url = await uploadFile(base64, req.file.filename, 'PostsImages');

        const data = {
          _creatorId: req.userId,
          title,
          description,
          imageUrl: url,
          imageName: req.file.filename,
        };

        const post = await Post.create(data);
        fs.unlinkSync(req.file.path);
        res.status(200).send(post);
      } else {
        const data = {
          _creatorId: req.userId,
          title,
          description,
        };

        const post = await Post.create(data);
        res.status(200).send(post);
      }
    } catch (e) {
      console.log(e);
      if (req.file) fs.unlinkSync(req.file.path);
      res.status(500).send({
        error: 'Houve um erro ao fazer o cadastro do post, tente novamente',
      });
    }
  }
);

module.exports = app => app.use('/post', router);
