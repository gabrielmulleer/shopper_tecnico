const express = require('express');

const router = express.Router();
const db = require('../db/models');
// Receber todos os produtos cadastrados

class ProductController {
  // Criar a rota para cadastrar produto
  static pegaTodosProdutos = async (req, res) => {
    try {
      const products = await db.Products.findAll({
        attributes: ['code', 'name', 'cost_price', 'sales_price'],
      });
      return res.status(200).json(products);
    } catch (error) {
      return res.status(500).json(error.message);
    }
  };
}

module.exports = ProductController;
