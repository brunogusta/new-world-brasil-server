import express from 'express';
import { uploadFile, deleteFile } from '../utils/handleS3';
import sharp from 'sharp';
import fs from 'fs';
import multer from 'multer';
import multerConfig from '../config/multer';
import authMiddleware from '../middlewares/auth';
import Live from '../models/livesSchema';
const router = express.Router();

router.use(authMiddleware);
router.get('/live-info', async (req, res) => {
  try {
    const liveData = await Live.findOne({ _creatorId: req.userId });

    return res.status(200).send({ liveData });
  } catch (e) {
    console.log(e);
    res.status(500).send({
      error:
        'Houve um erro inesperado ao obter os dados da live, tente novamente',
    });
  }
});

router.put('/live-events', async (req, res) => {
  try {
    const activedLive = await Live.findOneAndUpdate(
      { _creatorId: req.userId },
      { isActive: req.body.event }
    );

    return res.status(200).send({ activedLive });
  } catch (e) {
    console.log(e);
    res.status(500).send({
      error:
        'Houve um erro inesperado ao obter os dados da live, tente novamente',
    });
  }
});

router.post(
  '/create-live-info',
  multer(multerConfig).single('file'),
  async (req, res) => {
    const { url } = req.body;

    try {
      if (req.fileValidationError) {
        return res.status(400).send(req.fileValidationError);
      }

      if (req.file) {
        const resizedImageBuf = await sharp(req.file.path)
          .resize(150, 300, {
            fit: 'fill',
          })
          .jpeg({ quality: 100 })
          .toBuffer();

        const base64 = `data:image/jpeg;base64,${resizedImageBuf.toString(
          'base64'
        )}`;

        const urlAWS = await uploadFile(
          base64,
          req.file.filename,
          'LivesImages'
        );

        const data = {
          _creatorId: req.userId,
          liveURL: url,
          imageUrl: urlAWS,
          imageName: req.file.filename,
        };

        const live = await Live.create(data);
        fs.unlinkSync(req.file.path);
        res.status(200).send(live);
      } else {
        const data = {
          _creatorId: req.userId,
          url,
        };

        const live = await Live.create(data);
        res.status(200).send(live);
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

router.put(
  '/update-live-info',
  multer(multerConfig).single('file'),
  async (req, res) => {
    const { url } = req.body;

    try {
      if (req.fileValidationError) {
        return res.status(400).send(req.fileValidationError);
      }

      const existentLiveInfo = await Live.findOne({ _creatorId: req.userId });

      if (req.file) {
        if (existentLiveInfo.imageName !== 'frsAoAtGpzvWgWO8nLE1.jpg') {
          await deleteFile(existentLiveInfo.imageName, 'LivesImages');
        }

        if (req.file.size > 2 * 1024 * 1024) {
          fs.unlinkSync(req.file.path);
          return res
            .status(400)
            .send({ error: 'Imagem muito grande. Máx. 2mb' });
        }

        const resizedImageBuf = await sharp(req.file.path)
          .resize(150, 300, {
            fit: 'fill',
          })
          .jpeg({ quality: 100 })
          .toBuffer();

        const base64 = `data:image/jpeg;base64,${resizedImageBuf.toString(
          'base64'
        )}`;

        const urlAWS = await uploadFile(
          base64,
          req.file.filename,
          'LivesImages'
        );

        const data = {
          _creatorId: req.userId,
          liveURL: url,
          imageUrl: urlAWS,
          imageName: req.file.filename,
        };

        const updatedLiveInfo = await Live.findOneAndReplace(
          { _creatorId: req.userId },
          data
        );

        fs.unlinkSync(req.file.path);
        res.status(200).send(updatedLiveInfo);
      } else {
        const data = {
          _creatorId: req.userId,
          liveURL: url,
        };

        const updatedLiveInfo = await Live.findOneAndReplace(
          { _creatorId: req.userId },
          data
        );
        res.status(200).send(updatedLiveInfo);
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

module.exports = app => app.use('/live', router);
