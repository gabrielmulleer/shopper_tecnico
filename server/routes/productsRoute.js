const { Router } = require('express');
const ProductController = require('../controllers/ProductController');

const router = Router();

router.get('/products', ProductController.pegaTodosProdutos);

module.exports = router;
