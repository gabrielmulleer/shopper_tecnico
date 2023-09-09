const express = require('express');
const stream = require('stream');
const readline = require('readline');
const db = require('../db/models');
const router = express.Router();
const { Op } = require('sequelize');

const Product = db.Products;
const Pack = db.Packs;
// Receber todos os produtos cadastrados

class ProductController {
  static readCsv = async (req, res) => {
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
      const columns = line.split(',');
      if (!isNaN(Number(columns[0])) && !isNaN(Number(columns[1]))) {
        const code = columns[0];
        const newPrice = columns[1];

        // Verifique se o produto com o código especificado existe no banco de dados
        const product = await Product.findOne({
          attributes: ['code', 'name', 'cost_price', 'sales_price'],
          where: { code: code },
        });

        if (product) {
          const isPack = await Pack.findAll({
            attributes: ['pack_id', 'product_id', 'qty'],
            where: { pack_id: code },
          });

          const packInfo = [];

          for (const pack of isPack) {
            const packProduct = await Product.findOne({
              attributes: ['code', 'name', 'cost_price', 'sales_price'],
              where: { code: pack.product_id },
            });

            if (packProduct) {
              packInfo.push({
                packId: pack.pack_id,
                productCode: pack.product_id,
                qty: pack.qty,
                name: packProduct.name,
                costPrice: packProduct.cost_price,
                currentPrice: packProduct.sales_price,
                newPrice: '',
              });
            }
          }

          products.push({
            productCode: Number(code),
            name: product.name,
            costPrice: product.cost_price,
            currentPrice: product.sales_price,
            newPrice: Number(newPrice),
            isPack: packInfo,
          });
        }
      }
    }

    return res.json(products);
  };

  static async atualizaProduto2(req, res) {
    const { updatedProducts, skippedProducts, nonexistentProducts } =
      await processUpdatedProducts(req.body);

    const result = {
      updatedProducts: updatedProducts,
      skippedProducts: skippedProducts,
      nonexistentProducts: nonexistentProducts,
    };

    return res.status(200).json(result);
  }

  static async atualizaProduto(req, res) {
    const { file } = req;
    const { buffer } = file;

    try {
      const { updatedProducts, skippedProducts, nonexistentProducts } =
        await processCSV(buffer);

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
  }
}
async function processCSV(buffer) {
  const readableFile = new stream.Readable();
  readableFile.push(buffer);
  readableFile.push(null);

  const productsLine = readline.createInterface({
    input: readableFile,
  });

  const updatedProducts = [];
  const skippedProducts = [];
  const nonexistentProducts = [];
  // Objeto para rastrear a soma dos valores dos kits
  const kitSums = {};
  for await (let line of productsLine) {
    const columns = line.split(',');
    if (!isNaN(Number(columns[0])) && !isNaN(Number(columns[1]))) {
      const code = columns[0];
      const newPrice = columns[1];

      const product = await Product.findOne({
        attributes: ['code', 'name', 'cost_price', 'sales_price'],
        where: { code: code },
      });

      if (product) {
        const costPrice = parseFloat(product.cost_price);
        const currentPrice = parseFloat(product.sales_price);
        const newPriceFloat = parseFloat(newPrice);

        const isValidPrice = validatePrice(
          currentPrice,
          newPriceFloat,
          costPrice
        );
        if (isValidPrice) {
          await updateProductPrice(Product, code, newPriceFloat);
          updatedProducts.push({
            code: code,
            name: product.name,
            old_price: currentPrice,
            new_price: newPriceFloat,
          });
        } else {
          skippedProducts.push({
            code: code,
            name: product.name,
            old_price: currentPrice,
            new_price: getInvalidPriceReason(
              currentPrice,
              newPriceFloat,
              costPrice
            ),
          });
        }
      } else {
        nonexistentProducts.push({ code: code });
      }
    }
  }

  return { updatedProducts, skippedProducts, nonexistentProducts };
}
// Teste de rota para atualizar valores de acordo com os packs
async function processCSV2(buffer) {
  const readableFile = new stream.Readable();
  readableFile.push(buffer);
  readableFile.push(null);

  const productsLine = readline.createInterface({
    input: readableFile,
  });

  const updatedProducts = [];
  const skippedProducts = [];
  const nonexistentProducts = [];
  // Objeto para rastrear a soma dos valores dos kits
  const kitSums = {};
  for await (let line of productsLine) {
    const columns = line.split(',');
    if (!isNaN(Number(columns[0])) && !isNaN(Number(columns[1]))) {
      const code = columns[0];
      const newPrice = columns[1];

      const product = await Product.findOne({
        attributes: ['code', 'name', 'cost_price', 'sales_price'],
        where: { code: code },
      });
      const count = await Pack.count({ where: { pack_id: code } });
      const pack = await Pack.findOne({
        attributes: ['pack_id', 'product_id', 'qty'],
        where: { [Op.or]: [{ product_id: code }, { pack_id: code }] },
      });

      if (!kitSums[code]) {
        // Verifique se o código já existe como pacote no objeto kitSums
        // e se ele corresponde a um pack na tabela Packs
        kitSums[code] = Number(newPrice);

        if (pack) {
          const count = await Pack.count({ where: { pack_id: pack.pack_id } });
          if (count > 2 && pack.product_id != code) {
            console.log('teste');
          }
          if (count === 1) {
            kitSums[pack.pack_id] = Number(newPrice) * pack.qty;
          } else if (count > 1 && !kitSums[pack.pack_id]) {
            console.log(count);
            // Se não, crie uma entrada com o valor atual
            kitSums[pack.pack_id] = Number(newPrice) * pack.qty;
          } else if (count > 1 && kitSums[pack.pack_id]) {
            console.log(code);
            console.log(pack.product_id);
            console.log(pack.pack_id);

            // Se sim, adicione o valor atual ao valor existente
            kitSums[pack.pack_id] += Number(newPrice) * pack.qty;
          }
        }
        // Verifica na tabela Packs se o codigo é unico
        // se for único, ele pegará o valor total do pack e dividira pela quantidade
        // atualizando o valor do produto e do pack
        if (count === 1 && pack.pack_id == code) {
          kitSums[pack.product_id] = Number(newPrice / pack.qty);
        }
      }

      console.log(kitSums);
      if (product) {
        const costPrice = parseFloat(product.cost_price);
        const currentPrice = parseFloat(product.sales_price);
        const newPriceFloat = parseFloat(newPrice);

        const isValidPrice = validatePrice(
          currentPrice,
          newPriceFloat,
          costPrice
        );
        if (isValidPrice) {
          await updateProductPrice(Product, code, newPriceFloat);
          updatedProducts.push({
            code: code,
            name: product.name,
            old_price: currentPrice,
            new_price: newPriceFloat,
          });
        } else {
          skippedProducts.push({
            code: code,
            name: product.name,
            old_price: currentPrice,
            new_price: getInvalidPriceReason(
              currentPrice,
              newPriceFloat,
              costPrice
            ),
          });
        }
      } else {
        nonexistentProducts.push({ code: code });
      }
    }
  }

  return { updatedProducts, skippedProducts, nonexistentProducts };
}

async function processUpdatedProducts(updatedProducts) {
  const updatedProductsList = [];
  const skippedProducts = [];
  const nonexistentProducts = [];

  for (const productData of updatedProducts) {
    const code = productData.productCode;
    const newPrice = productData.newPrice;

    const product = await Product.findOne({
      attributes: ['code', 'name', 'cost_price', 'sales_price'],
      where: { code: code },
    });

    if (product) {
      const costPrice = parseFloat(product.cost_price);
      const currentPrice = parseFloat(product.sales_price);
      const newPriceFloat = parseFloat(newPrice);
      console.log(currentPrice);
      const isValidPrice = validatePrice(
        currentPrice,
        newPriceFloat,
        costPrice
      );

      if (isValidPrice) {
        await updateProductPrice(Product, code, newPriceFloat);
        updatedProductsList.push({
          code: code,
          name: product.name,
          old_price: currentPrice,
          new_price: newPriceFloat,
        });
      } else {
        skippedProducts.push({
          code: code,
          name: product.name,
          old_price: currentPrice,
          new_price: getInvalidPriceReason(
            currentPrice,
            newPriceFloat,
            costPrice
          ),
        });
      }
    } else {
      nonexistentProducts.push({ code: code });
    }
  }

  return {
    updatedProducts: updatedProductsList,
    skippedProducts,
    nonexistentProducts,
  };
}
// Função para validar o preço
function validatePrice(currentPrice, newPrice, costPrice) {
  return (
    newPrice >= costPrice &&
    Math.abs(newPrice - currentPrice) <= currentPrice * 0.1
  );
}

// Função para atualizar o preço do produto no banco de dados
async function updateProductPrice(ProductModel, code, newPrice) {
  await ProductModel.update(
    { sales_price: newPrice },
    {
      attributes: ['code', 'name', 'cost_price', 'sales_price'],
      where: { code: code },
    }
  );
}

// Função para obter a razão do preço inválido
function getInvalidPriceReason(currentPrice, newPrice, costPrice) {
  if (parseFloat(newPrice) < parseFloat(costPrice)) {
    return `* O novo preço (${newPrice}) é menor que o preço de custo (${costPrice}).`;
  }
  if (
    parseFloat(newPrice) >=
    parseFloat(currentPrice) + parseFloat(currentPrice * 0.1)
  ) {
    return `* O reajuste de preço (${newPrice}) é maior que 10% do preço atual (${currentPrice}).`;
  } else if (
    parseFloat(newPrice) <=
    parseFloat(currentPrice) - parseFloat(currentPrice * 0.1)
  ) {
    return `* O reajuste de preço (${newPrice}) é menor que 10% do preço atual (${currentPrice}).`;
  }
}
module.exports = ProductController;
