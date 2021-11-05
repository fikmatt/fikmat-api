
const express = require('express');
const bodyParser = require('body-parser');
const debug = require('debug')('fikmat-api:server');

const app = express();
const http = require('http');
const server = http.createServer(app);
const port = process.env.PORT || '8020'

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Fikmat API is running.');
})

require('coffeescript/register');
const api = require('./lib/api.coffee');

api.on('ready', () => {
  server.listen(port, () => {
    debug(`Fikmat API test app runs at http://localhost:${port}`);
  });
});

app.post('/api', (req, res) => {
  debug('api', req.body);

  api.post(req.body);

  res.sendStatus(200);
});
