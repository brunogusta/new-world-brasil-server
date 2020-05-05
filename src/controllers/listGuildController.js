import express from 'express';
import Guild from '../models/guildSchema';
import authMiddleware from '../middlewares/auth';

const router = express.Router();

router.use(authMiddleware);

router.get('/find-one', async (req, res) => {
  try {
    const guild = await Guild.findById(req.query.id).populate('_creatorId');

    res.status(200).send(guild);
  } catch (e) {
    res.status(500).send('Houve um erro inesperado, tente novamente');
  }
});

router.get('/', async (req, res) => {
  try {
    const guild = await Guild.find().populate('_creatorId');

    res.status(200).send(guild);
  } catch (e) {
    res.status(500).send('Houve um erro inesperado, tente novamente');
  }
});

module.exports = app => app.use('/guilds', router);
