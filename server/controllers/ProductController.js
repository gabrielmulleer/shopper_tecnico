const express = require('express');
const stream = require('stream');
const readline = require('readline');
const db = require('../db/models');
const router = express.Router();

const Product = db.Products;
// Receber todos os produtos cadastrados

class ProductController {
  // Criar a rota para cadastrar produto
  static pegaTodosProdutos = async (req, res) => {
    try {
      const products = await Product.findAll({
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

  static atualizaProduto = async (req, res) => {
    const { file } = req;
    const { buffer } = file;

    const readableFile = new stream.Readable();
    readableFile.push(buffer);
    readableFile.push(null);

    const productsLine = readline.createInterface({
      input: readableFile,
    });
    try {
      for await (let line of productsLine) {
        const columns = line.split(',');
        if (!isNaN(Number(columns[0])) && !isNaN(Number(columns[1]))) {
          const code = columns[0];
          const new_price = columns[1];

          const product = await Product.findOne({
            attributes: ['code', 'name', 'cost_price', 'sales_price'],
            where: { code: code },
          });

          if (product) {
            // Verifique se o new_price não é menor que o cost_price
            if (Number(new_price) >= Number(product.cost_price)) {
              await Product.update(
                { sales_price: new_price },
                {
                  attributes: ['code', 'name', 'cost_price', 'sales_price'],
                  where: { code: code },
                }
              );
            } else {
              console.error(
                `O novo preço (${new_price}) é menor que o preço de custo (${product.cost_price}) para o produto de código ${code}. A atualização foi ignorada.`
              );
            }
          }
        }
      }
      return res.status(200).send('Produtos atualizados com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar produtos:', error);
      return res.status(500).send('Erro interno do servidor');
    }
  };
}

module.exports = ProductController;
