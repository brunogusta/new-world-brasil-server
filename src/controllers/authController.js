import express from 'express';
import crypto from 'crypto';
import User from '../models/userSchema';
import Token from '../models/tokenSchema';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import authMiddleware from '../middlewares/auth';

import sgMail from '@sendgrid/mail';

const router = express.Router();

function generateToken(params = {}) {
  return jwt.sign(params, process.env.SECRET, {
    expiresIn: 86400,
  });
}

router.post('/signup', async (req, res) => {
  const { email, name } = req.body;

  try {
    if (req.headers.authorization) {
      return res.status(400).send({ error: 'O usuário já está logado.' });
    }

    if (await User.findOne({ email })) {
      return res.status(400).send({ error: 'Usuário já existe.' });
    }

    if (await User.findOne({ name })) {
      return res.status(400).send({ error: 'O nome informado já existe.' });
    }

    const user = await User.create(req.body);

    const { token } = await Token.create({
      user: user._id,
      token: crypto.randomBytes(20).toString('hex'),
    });

    const link = `http://localhost:3000/auth/confirmed-email/${token}`;

    const mailOptions = {
      to: user.email,
      from: process.env.FROM_EMAIL,
      subject: 'Confirmação de email.',
      templateId: 'd-f1063e3481e642009802abb4f5d1e95b',
      dynamic_template_data: {
        link,
      },
    };

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    sgMail.send(mailOptions).catch(err => {
      console.log(err);
      return res
        .status(500)
        .send({ error: 'Houve um erro no registro, tente novamente' });
    });

    return res
      .status(200)
      .send(
        `Estamos quase lá! Por favor, confirme o email enviado para ${user.email}`
      );
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send({ error: 'Houve um erro no registro, tente novamente' });
  }
});

router.get('/confirmed-email/:token', async (req, res) => {
  try {
    const token = await Token.findOne({ token: req.params.token }).populate(
      'user'
    );

    if (!token) {
      return res.status(400).send({
        error:
          'Email de confirmação inválido, por favor requisite um novo email.',
      });
    }

    if (token.user.isVerified) {
      return res.status(400).send({ error: 'O email já está confirmado.' });
    }

    await User.findByIdAndUpdate(token.user._id, { isVerified: true });

    res.send('Email confirmado com sucesso!');
  } catch (e) {
    console.log(e);
    res
      .status(500)
      .send({ error: 'Houve um erro ao confirmar o email, tente novamente' });
  }
});

router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (req.headers.authorization) {
      return res.status(400).send({ error: 'O usuário já está logado.' });
    }

    if (!user) {
      return res.status(400).send({ error: 'O E-mail informado não existe' });
    }

    if (!user.isVerified) {
      return res
        .status(400)
        .send({ error: 'Confirme seu e-mail para prosseguir com login' });
    }

    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(400).send({ error: 'Senha incorreta' });
    }

    user.password = undefined;
    return res.send({
      user,
      token: generateToken({
        id: user.id,
        supporter: user.isSupporter,
        email: user.email,
        admin: user.admin,
      }),
    });
  } catch (e) {
    console.log(e);
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).send({ error: 'O E-mail informado não existe' });
    }

    const token = crypto.randomBytes(20).toString('hex');

    const now = new Date();
    now.setHours(now.getHours() + 1);

    await User.findByIdAndUpdate(user.id, {
      $set: {
        passwordResetToken: token,
        passwordResetExpires: now,
      },
    });

    const link = `http://localhost:3000/auth/reset-password/${token}`;

    const mailOptions = {
      to: user.email,
      from: process.env.FROM_EMAIL,
      subject: 'Alterar senha',
      templateId: 'd-189a15cb78bc43f88787db7f361860fe',
      dynamic_template_data: {
        link,
      },
    };

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    sgMail.send(mailOptions);

    return res
      .status(200)
      .send(`Email para alterar a senha enviado com sucesso!`);
  } catch (e) {
    console.log(e);
    res
      .status(500)
      .send({ error: 'Houve um erro ao recuperar a senha, tente novamente' });
  }
});

router.put('/reset-password/:token', async (req, res) => {
  try {
    const { password } = req.body;
    const token = req.params.token;

    if (!token) {
      return res.status(400).send({
        error: 'Ocorreu um erro ao renovar a sua senha, tente novamente.',
      });
    }

    const user = await User.findOne({ passwordResetToken: token }).select(
      '+passwordResetToken passwordResetExpires'
    );

    if (!user) {
      return res.status(400).send({ error: 'Este link não é mais válido.' });
    }

    const now = new Date();
    if (now > user.passwordResetExpires) {
      return res.status(400).send({
        error:
          'Parece que este link não é mais válido, requisite um novo email.',
      });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    res.send('Sua senha foi alterada com sucesso!');
  } catch (e) {
    console.log(e);
    res.status(500).send({
      error: 'Houve um erro ao cadastrar a nova senha, tente novamente',
    });
  }
});

router.post('/resend-email', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).send({ error: 'O E-mail informado não existe' });
    }

    if (user.isVerified) {
      return res.status(400).send({ error: 'O email já está confirmado.' });
    }

    const { token } = await Token.create({
      user: user._id,
      token: crypto.randomBytes(20).toString('hex'),
    });

    // usar req.headers.host
    const link = `http://localhost:3000/auth/confirmed-email/${token}`;

    const mailOptions = {
      to: user.email,
      from: process.env.FROM_EMAIL,
      subject: 'Confirmação de email',
      templateId: 'd-f1063e3481e642009802abb4f5d1e95b',
      dynamic_template_data: {
        link,
        name: user.name,
      },
    };

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    sgMail.send(mailOptions).catch(err => {
      console.log(err);
      return res
        .status(500)
        .send({ error: 'Houve um erro no registro, tente novamente' });
    });

    return res
      .status(200)
      .send(`Por favor, confirme o email enviado para ${user.email}`);
  } catch (e) {
    console.log(e);
    res.status(500).send({
      error: 'Houve um erro ao reenviar seu email, tente novamente',
    });
  }
});

router.get('/validate-token', async (req, res) => {
  const authHeader = req.headers.authorization;
  const parts = authHeader.split(' ');

  jwt.verify(parts[1], process.env.SECRET, err => {
    if (err && err.message === 'jwt expired') {
      return res.status(401).send({ error: 'Token expirado', expired: true });
    }
  });
});

router.use(authMiddleware);
router.get('/admin-validation', async (req, res) => {
  try {
    const isAdmin = req.isAdmin;
    if (!isAdmin) {
      res.status(401).send({
        error: 'Usuário não é administrador',
      });
    }
    res.status(200).send(true);
  } catch (e) {
    res.status(500).send({
      error: 'Erro inesperado, tente novamente',
    });
  }
});

module.exports = app => app.use('/auth', router);
