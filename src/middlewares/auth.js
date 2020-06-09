import jwt from 'jsonwebtoken';

export default (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res
      .status(401)
      .send({ error: 'Um erro inesperado ocorreu, faça login novamente' });
  }

  const parts = authHeader.split(' ');

  if (!parts.length === 2) {
    return res
      .status(401)
      .send({ error: 'Um erro inesperado ocorreu, faça login novamente' });
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    return res
      .status(401)
      .send({ error: 'Um erro inesperado ocorreu, faça login novamente' });
  }

  jwt.verify(token, process.env.SECRET, (err, decoded) => {
    if (err)
      return res
        .status(401)
        .send({ error: 'Um erro inesperado ocorreu, faça login novamente' });

    req.userId = decoded.id;
    req.email = decoded.email;
    req.isSupporter = decoded.supporter;
    req.isAdmin = decoded.admin;
    return next();
  });
};
