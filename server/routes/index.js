const express = require('express');

const products = require('./productsRoute');

module.exports = (app) => {
  app.use(express.json(), products);
};
