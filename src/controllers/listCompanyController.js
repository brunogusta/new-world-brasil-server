import express from 'express';
import Company from '../models/companySchema';
import User from '../models/userSchema';
import authMiddleware from '../middlewares/auth';

const router = express.Router();

router.get('/total', async (req, res) => {
  try {
    const totalCompanies = await Company.countDocuments();
    const totalMembers = await User.countDocuments();

    res.status(200).send({
      totalCompanies,
      totalMembers,
    });
  } catch (e) {
    res.status(500).send({
      error: 'Houve um erro inesperado ao carregar o total de companhias',
    });
  }
});

router.get('/all/:page', async (req, res) => {
  try {
    const { page: currentPage } = req.params;
    let skipPages = 0;

    if (currentPage !== '1') {
      skipPages = (currentPage - 1) * 20;
    }

    const totalCompanies = await Company.countDocuments();
    let totalPages = 1;

    if (totalCompanies > 20) {
      totalPages = Math.ceil(totalCompanies / 20);
    }

    const companies = await Company.find()
      .skip(skipPages)
      .limit(20)
      .populate('_creatorId');

    res.status(200).send({
      companies,
      totalPages,
    });
  } catch (e) {
    res
      .status(500)
      .send({ error: 'Houve um erro inesperado, tente novamente' });
  }
});

router.get('/find-one/:id', async (req, res) => {
  try {
    const company = await Company.findById(req.params.id).populate(
      '_creatorId'
    );

    res.status(200).send(company);
  } catch (e) {
    res
      .status(500)
      .send({ error: 'Houve um erro inesperado, tente novamente' });
  }
});

router.get('/supporters', async (req, res) => {
  try {
    const starCompany = await User.find({
      $and: [{ isSupporter: true }, { haveCompany: true }],
    })
      .populate('_companyId')
      .select('-_id')
      .select('_companyId');

    if (starCompany.length === 0) {
      return res.status(200).send(null);
    }

    res.status(200).send(starCompany);
  } catch (e) {
    console.log(e);
    res
      .status(500)
      .send({ error: 'Houve um erro inesperado, tente novamente' });
  }
});

// NEED AUTHENTICATION TOKEN //
router.use(authMiddleware);

router.get('/update/load-company-information', async (req, res) => {
  try {
    const { userId } = req;

    const company = await Company.findOne({ _creatorId: userId }).populate(
      '_creatorId'
    );

    if (!company) {
      return res.status(400).send({ error: 'Usuário não possuí companhia' });
    }

    res.status(200).send(company);
  } catch (e) {
    res
      .status(500)
      .send({ error: 'Houve um erro inesperado, tente novamente' });
  }
});

router.get('/load-company-information', async (req, res) => {
  try {
    const { userId } = req;

    const company = await Company.findOne({ _creatorId: userId }).populate(
      '_creatorId'
    );

    if (!company) {
      return res.status(400).send({ error: 'Usuário não possuí companhia' });
    }

    res.status(200).send(company);
  } catch (e) {
    res
      .status(500)
      .send({ error: 'Houve um erro inesperado, tente novamente' });
  }
});

module.exports = app => app.use('/companies', router);
