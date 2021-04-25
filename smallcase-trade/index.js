const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const app = express();

const server = http.createServer(app);

// routes
const routes = require('./routes');

const serverResponse = require('./middlewares/serverResponse');

app.use(serverResponse());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(morgan('dev')); // logger for terminal

app.use('/api', routes);

app.get('/', (req, res) => res.status(200).json({
  message: 'Healthy',
}));

app.use('/', (req, res) => res.status(404).json({
  error: 'Invalid Route',
}));

module.exports.server = server;
