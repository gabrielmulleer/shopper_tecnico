const express = require('express');

const app = express();

const port = 3000;

app.listen(port, () => console.log(`Servidor está rodando na porta ${port}`));

module.exports = app;
