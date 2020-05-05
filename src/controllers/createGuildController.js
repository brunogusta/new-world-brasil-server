import express from 'express';
import Guild from '../models/guildSchema';
import authMiddleware from '../middlewares/auth';
import multer from 'multer';
import multerConfig from '../config/multer';
import sharp from 'sharp';
import fs from 'fs';
import uploadFile from '../utils/uploadS3';

const router = express.Router();

router.use(authMiddleware);

router.post(
  '/create_guild',
  multer(multerConfig).single('file'),
  async (req, res) => {
    const {
      title,
      discord,
      governor,
      faction,
      size,
      recruting,
      description,
      focus,
      consuls,
    } = req.body;

    try {
      if (req.fileValidationError) {
        return res.status(400).send(req.fileValidationError);
      }

      if (await Guild.findOne({ title })) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res
          .status(400)
          .send({ error: 'O nome da guilda não está disponível' });
      }

      if (await Guild.findOne({ _creatorId: req.userId })) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res
          .status(400)
          .send({ error: 'Você já possuí uma guilda cadastrada' });
      }

      if (req.file) {
        if (req.file.size > 2 * 1024 * 1024) {
          fs.unlinkSync(req.file.path);
          return res.status(400).send({ error: 'Image muito grande' });
        }

        const resizedImageBuf = await sharp(req.file.path)
          .resize(512, 512, {
            fit: 'fill',
          })
          .jpeg({ quality: 100 })
          .toBuffer();

        const base64 = `data:image/jpeg;base64,${resizedImageBuf.toString(
          'base64'
        )}`;

        const url = await uploadFile(base64, req.file.filename);

        const data = {
          _creatorId: req.userId,
          title,
          discord,
          governor,
          faction,
          size,
          focus,
          recruting,
          description,
          consuls,
          imageUrl: url,
        };

        const guild = await Guild.create(data);

        fs.unlinkSync(req.file.path);
        res.status(200).send(guild);
      } else {
        const data = {
          _creatorId: req.userId,
          title,
          discord,
          governor,
          faction,
          size,
          focus,
          recruting,
          description,
          consuls,
        };

        const guild = await Guild.create(data);
        res.status(200).send(guild);
      }
    } catch (e) {
      console.log(e);
      if (req.file) fs.unlinkSync(req.file.path);
      res.status(500).send({
        error: 'Houve um erro ao fazer o cadastro da guilda, tente novamente',
      });
    }
  }
);

module.exports = app => app.use('/registry', router);
