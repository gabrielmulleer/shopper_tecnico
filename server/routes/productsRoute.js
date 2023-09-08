const { Router } = require('express');
const multer = require('multer');
const ProductController = require('../controllers/ProductController');

const multerConfig = multer({});

const router = Router();

router
  .get('/products', ProductController.pegaTodosProdutos)
  .post('/products/csv', multerConfig.single('file'), ProductController.readCsv)
  .post(
    '/products/atualiza',
    multerConfig.single('file'),
    ProductController.atualizaProduto
  )
  .post(
    '/products/atualiza4',
    multerConfig.single('file'),
    ProductController.atualizaProduto2
  )
  .post(
    '/products/atualiza2',
    multerConfig.single('file'),
    ProductController.atualizaPack
  )
  .post(
    '/products/atualiza3',
    multerConfig.single('file'),
    ProductController.atualizaPack2
  );

module.exports = router;
