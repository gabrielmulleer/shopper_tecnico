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
    const updatedProducts = [];
    const skippedProducts = [];
    const nonexistentProducts = [];

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
            const costPrice = parseFloat(product.cost_price);
            const currentPrice = parseFloat(product.sales_price);
            const newPrice = parseFloat(new_price);

            // Verifique se o new_price não é menor que o cost_price
            if (newPrice >= costPrice) {
              // Verifique se o reajuste não é maior que 10% do preço atual
              const priceDifference = Math.abs(newPrice - currentPrice);
              const maxAllowedDifference = currentPrice * 0.1;

              if (priceDifference <= maxAllowedDifference) {
                // Salve os valores antigos e novos para os produtos atualizados
                updatedProducts.push({
                  code: code,
                  name: product.name,
                  old_price: currentPrice,
                  new_price: newPrice,
                });

                await Product.update(
                  { sales_price: newPrice },
                  {
                    attributes: ['code', 'name', 'cost_price', 'sales_price'],
                    where: { code: code },
                  }
                );
              } else {
                // Salve os produtos ignorados devido ao reajuste excessivo
                skippedProducts.push({
                  code: code,
                  name: product.name,
                  old_price: currentPrice,
                  new_price: `O reajuste de preço (${newPrice}) é ${
                    newPrice > currentPrice + maxAllowedDifference
                      ? 'maior'
                      : 'menor'
                  } que 10% do preço atual (${currentPrice}).`,
                });

                console.error(
                  `O reajuste de preço (${newPrice}) é maior que 10% do preço atual (${currentPrice}) para o produto de código ${code}. A atualização foi ignorada.`
                );
              }
            } else {
              // Salve os produtos ignorados devido ao novo preço ser menor que o preço de custo
              skippedProducts.push({
                code: code,
                name: product.name,
                old_price: currentPrice,
                new_price: `O novo preço (${newPrice}) é menor que o preço de custo (${costPrice}).`,
              });

              console.error(
                `O novo preço (${newPrice}) é menor que o preço de custo (${costPrice}) para o produto de código ${code}. A atualização foi ignorada.`
              );
            }
          } else {
            // Salve os produtos que não existem na tabela
            nonexistentProducts.push({ code: code });
          }
        }
      }

      const result = {
        updatedProducts: updatedProducts,
        skippedProducts: skippedProducts,
        nonexistentProducts: nonexistentProducts,
      };

      return res.status(200).json(result);
    } catch (error) {
      console.error('Erro ao atualizar produtos:', error);
      return res.status(500).send('Erro interno do servidor');
    }
  };
}

module.exports = ProductController;
