import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import cors from 'cors';

require('dotenv').config();

const app = express();

const server = app.listen(3002, console.log('Executando na porta 3002'));

const io = require('socket.io').listen(server);

app.use((req, res, next) => {
  req.io = io;

  next();
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/files', express.static(path.resolve(__dirname, 'images')));

require('./controllers/authController')(app);
require('./controllers/createGuildController')(app);
require('./controllers/listGuildController')(app);
