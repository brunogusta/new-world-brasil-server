import express from 'express';
import Company from '../models/companySchema';
import User from '../models/userSchema';
import authMiddleware from '../middlewares/auth';
import multer from 'multer';
import multerConfig from '../config/multer';
import sharp from 'sharp';
import fs from 'fs';
import { uploadFile, deleteFile } from '../utils/handleS3';

const router = express.Router();

router.use(authMiddleware);

router.post(
  '/create-company',
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

      if (await Company.findOne({ title })) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res
          .status(400)
          .send({ error: 'O nome da companhia não está disponível' });
      }

      if (await Company.findOne({ _creatorId: req.userId })) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res
          .status(400)
          .send({ error: 'Você já possuí uma companhia cadastrada' });
      }

      if (req.file) {
        if (req.file.size > 2 * 1024 * 1024) {
          fs.unlinkSync(req.file.path);
          return res.status(400).send({ error: 'Imagem muito grande' });
        }

        const resizedImageBuf = await sharp(req.file.path)
          .resize(200, 200, {
            fit: 'fill',
          })
          .jpeg({ quality: 100 })
          .toBuffer();

        const base64 = `data:image/jpeg;base64,${resizedImageBuf.toString(
          'base64'
        )}`;

        const url = await uploadFile(
          base64,
          req.file.filename,
          'CompaniesImages'
        );

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
          imageName: req.file.filename,
        };

        const company = await Company.create(data);

        await User.findOneAndUpdate(
          { _id: req.userId },
          {
            $set: { _companyId: company._id, haveCompany: true },
          }
        );

        fs.unlinkSync(req.file.path);
        res.status(200).send(company);
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

        const company = await Company.create(data);

        await User.findOneAndUpdate(
          { _id: req.userId },
          {
            $set: { _companyId: company._id, haveCompany: true },
          }
        );
        res.status(200).send(company);
      }
    } catch (e) {
      console.log(e);
      if (req.file) fs.unlinkSync(req.file.path);
      res.status(500).send({
        error:
          'Houve um erro ao fazer o cadastro da companhia, tente novamente',
      });
    }
  }
);

router.put(
  '/update-company',
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

      const existentCompany = await Company.findOne({ _creatorId: req.userId });

      if (
        await Company.findOne({
          $and: [{ title }, { title: { $ne: existentCompany.title } }],
        })
      ) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res
          .status(400)
          .send({ error: 'O nome da companhia não está disponível' });
      }

      if (req.file) {
        if (existentCompany.imageName !== 'frsAoAtGpzvWgWO8nLE1.jpg') {
          await deleteFile(existentCompany.imageName, 'CompaniesImages');
        }

        if (req.file.size > 2 * 1024 * 1024) {
          fs.unlinkSync(req.file.path);
          return res.status(400).send({ error: 'Imagem muito grande' });
        }

        const resizedImageBuf = await sharp(req.file.path)
          .resize(200, 200, {
            fit: 'fill',
          })
          .jpeg({ quality: 100 })
          .toBuffer();

        const base64 = `data:image/jpeg;base64,${resizedImageBuf.toString(
          'base64'
        )}`;

        const url = await uploadFile(
          base64,
          req.file.filename,
          'CompaniesImages'
        );

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
          imageName: req.file.filename,
        };

        const updatedCompany = await Company.findOneAndReplace(
          { _creatorId: req.userId },
          data
        );

        fs.unlinkSync(req.file.path);
        res.status(200).send(updatedCompany);
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
          imageUrl: existentCompany.imageUrl,
          imageName: existentCompany.imageName,
        };

        const updatedCompany = await Company.findOneAndReplace(
          { _id: existentCompany._id },
          data
        );

        res.status(200).send(updatedCompany);
      }
    } catch (e) {
      console.log(e);
      if (req.file) fs.unlinkSync(req.file.path);
      res.status(500).send({
        error:
          'Houve um erro ao fazer o cadastro da companhia, tente novamente',
      });
    }
  }
);

module.exports = app => app.use('/registry/companies', router);
