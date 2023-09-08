const { Router } = require('express');
const multer = require('multer');
const ProductController = require('../controllers/ProductController');

const multerConfig = multer({});

const router = Router();

router

  .post(
    '/products/readCsv',
    multerConfig.single('file'),
    ProductController.readCsv
  )
  .post(
    '/products/update',
    multerConfig.single('file'),
    ProductController.atualizaProduto
  );

module.exports = router;
