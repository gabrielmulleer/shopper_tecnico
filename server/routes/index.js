const express = require('express');

const products = require('./productsRoute');
const packs = require('./packsRoute');

module.exports = (app) => {
  app.use(express.json(), products, packs);
};
