import express from 'express';
import User from '../models/userSchema';
import authMiddleware from '../middlewares/auth';

const router = express.Router();

router.use(authMiddleware);
router.get('/find-one', async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('_companyId');

    res.status(200).send(user);
  } catch (e) {
    res
      .status(500)
      .send({ error: 'Houve um erro inesperado, tente novamente' });
  }
});

router.post('/save-user-info', async (req, res) => {
  try {
    const savedUserInfo = await User.findByIdAndUpdate(
      { _id: req.userId },
      req.body.values
    );

    res.status(200).send(savedUserInfo);
  } catch (e) {
    res
      .status(500)
      .send({ error: 'Houve um erro inesperado, tente novamente' });
  }
});

module.exports = app => app.use('/user', router);
