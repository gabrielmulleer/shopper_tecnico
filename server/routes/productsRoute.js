const { Router } = require('express');
const multer = require('multer');
const ProductController = require('../controllers/ProductController');

const multerConfig = multer({});

const router = Router();

router
  .get('/products', ProductController.pegaTodosProdutos)
  .post(
    '/products/csv',
    multerConfig.single('file'),
    ProductController.recebeCsv
  )
  .post(
    '/products/atualiza',
    multerConfig.single('file'),
    ProductController.atualizaProduto
  );

module.exports = router;
