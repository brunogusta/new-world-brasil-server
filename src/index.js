import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import cors from 'cors';

require('dotenv').config();

const app = express();

app.listen(3002, console.log('Executando na porta 3002'));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/files', express.static(path.resolve(__dirname, 'images')));

require('./controllers/authController')(app);
require('./controllers/listCompanyController')(app);
require('./controllers/registryCompanyController')(app);
require('./controllers/postsController')(app);
require('./controllers/listUserController')(app);
