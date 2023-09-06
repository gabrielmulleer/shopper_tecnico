const express = require('express');
const stream = require('stream');
const readline = require('readline');
const db = require('../db/models');
const router = express.Router();
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

  static recebeCsv = async (req, res) => {
    const { file } = req;
    const { buffer } = file;

    const readableFile = new stream.Readable();
    readableFile.push(buffer);
    readableFile.push(null);

    const productsLine = readline.createInterface({
      input: readableFile,
    });
    const products = [];
    for await (let line of productsLine) {
      const productLineSplit = line.split(',');
      if (
        !isNaN(Number(productLineSplit[0])) &&
        !isNaN(Number(productLineSplit[1]))
      ) {
        products.push({
          product_code: Number(productLineSplit[0]),
          new_price: Number(productLineSplit[1]),
        });
      }
    }
    return res.json(products);
  };
}

module.exports = ProductController;
