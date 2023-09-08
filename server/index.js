const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();
app.use(cors());
routes(app);

const port = 3000;

app.listen(port, () =>
  console.log(
    `Servidor está rodando na porta ${port}: https://localhost:${port}`
  )
);

module.exports = app;
