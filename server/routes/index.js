const express = require('express');
const cors = require('cors');

const products = require('./productsRoute');
const packs = require('./packsRoute');

module.exports = (app) => {
  app.use(cors());
  app.use(express.json(), products, packs);
};
