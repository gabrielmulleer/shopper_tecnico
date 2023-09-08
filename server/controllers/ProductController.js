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
      const columns = line.split(',');
      if (!isNaN(Number(columns[0])) && !isNaN(Number(columns[1]))) {
        const code = columns[0];
        const newPrice = columns[1];

        const product = await Product.findOne({
          attributes: ['code', 'name', 'cost_price', 'sales_price'],
          where: { code: code },
        });
        const isPack = await Pack.findOne({
          attributes: ['pack_id', 'product_id', 'qty'],
          where: { pack_id: code },
        });
        products.push({
          product_code: Number(code),
          name: product.name,
          costPrice: product.cost_price,
          currentPrice: product.sales_price,
          newPrice: Number(newPrice),
          isPack: isPack ? true : false,
          packId: isPack ? isPack.pack_id : `Not a pack`,
        });
      }
    }
    return res.json(products);
  };

  static atualizaProduto2 = async (req, res) => {
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
    // Objeto para rastrear a soma dos valores dos kits
    const kitSums = {};
    try {
      for await (let line of productsLine) {
        const columns = line.split(',');
        if (!isNaN(Number(columns[0])) && !isNaN(Number(columns[1]))) {
          const code = columns[0];
          const new_price = columns[1];

          // Verifique se o código existe na tabela Products
          const product = await Product.findOne({
            attributes: ['code', 'name', 'cost_price', 'sales_price'],
            where: { code: code },
          });

          // Verifique se o código existe na tabela Packs
          const isPack = await Pack.findOne({
            attributes: ['id', 'pack_id', 'product_id', 'qty'],
            where: { pack_id: code },
          });
          if (isPack) {
            const countPack = await Pack.count({
              where: { pack_id: code },
            });
            console.log(
              `Quantos produtos tem no kit? ${countPack}, Qual o código do produto? ${isPack.product_id} Qual a quantidade de cada produto? ${isPack.qty} Qual o custo do produto? ${product.sales_price}`
            );
            if (countPack === 1) {
              const productPrice = Number(new_price) / isPack.qty;
              console.log(productPrice);
            } else {
              // Verifique se o kit já está no objeto kitSums
              if (!kitSums[isPack.pack_id]) {
                // Se não, crie uma entrada com o valor atual
                kitSums[isPack.pack_id] = isPack.qty * product.sales_price;
              } else {
                // Se sim, adicione o valor atual ao valor existente
                kitSums[isPack.pack_id] += qty * newPriceFloat;
              }
            }
          }
          // Se existir o produto seguimos para as verificações
          if (product) {
            const costPrice = parseFloat(product.cost_price);
            const currentPrice = parseFloat(product.sales_price);
            const newPrice = parseFloat(new_price);

            // Primeira verificação
            // Impedir que o preço de venda dos produtos fique abaixo do custo deles
            if (newPrice >= costPrice) {
              const priceDifference = Math.abs(newPrice - currentPrice);
              const maxAllowedDifference = currentPrice * 0.1;

              // Segunda verificação
              // Impedir qualquer reajuste maior ou menor do que 10% do preço atual do produto
              if (priceDifference <= maxAllowedDifference) {
                updatedProducts.push({
                  code: code,
                  name: product.name,
                  old_price: currentPrice,
                  new_price: newPrice,
                  // pack: `${isComponentOfPack ? true : false}`,
                });

                await Product.update(
                  { sales_price: newPrice },
                  {
                    attributes: ['code', 'name', 'cost_price', 'sales_price'],
                    where: { code: code },
                  }
                );
              } else {
                skippedProducts.push({
                  code: code,
                  name: product.name,
                  old_price: currentPrice,
                  new_price: `O reajuste de preço (${newPrice}) é ${
                    newPrice > currentPrice + maxAllowedDifference
                      ? 'maior'
                      : 'menor'
                  } que 10% do preço atual (${currentPrice}).`,
                  // pack: `${isComponentOfPack ? true : false}`,
                });

                console.error(
                  `O reajuste de preço (${newPrice}) é maior que 10% do preço atual (${currentPrice}) para o produto de código ${code}. A atualização foi ignorada.`
                );
              }
            } else {
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
            // Se o código não existir em Products e não for um componente de pacote, adicione à lista de produtos inexistentes
            // if (!isComponentOfPack) {
            //   nonexistentProducts.push({ code: code });
            // }
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
  static atualizaPack = async (req, res) => {
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
    const productQuantities = [];
    try {
      for await (let line of productsLine) {
        const columns = line.split(',');
        if (!isNaN(Number(columns[0])) && !isNaN(Number(columns[1]))) {
          const code = columns[0];
          const newPrice = columns[1];

          // Verifique se o código existe na tabela Products
          const product = await Product.findOne({
            attributes: ['code', 'name', 'cost_price', 'sales_price'],
            where: { code: code },
          });

          // Verifique se o código existe na tabela Packs
          const { count, rows } = await Pack.findAndCountAll({
            attributes: ['id', 'pack_id', 'product_id', 'qty'],
            where: { pack_id: code },
          });

          if (rows) {
            if (count === 1) {
              // Encontre o qty do pack
              const qty = rows[0].qty;
              // Calcule o novo preço para os componentes
              const newPriceForComponents = Number(newPrice / qty);

              // Atualize o preço do produto correspondente em products
              const productUpdatePromise = Product.update(
                { sales_price: Number(newPriceForComponents) },
                { where: { code: rows[0].product_id } }
              );

              // Atualize o preço do pacote correspondente em packs
              const packUpdatePromise = Product.update(
                { sales_price: Number(newPrice) },
                { where: { code: rows[0].pack_id } }
              );

              // Execute ambas as atualizações simultaneamente
              await Promise.all([productUpdatePromise, packUpdatePromise]);

              return res.status(200).json(newPriceForComponents);
            }
          }
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar produtos:', error);
      return res.status(500).send('Erro interno do servidor');
    }
  };

  static atualizaPack2 = async (req, res) => {
    const { file } = req;
    const { buffer } = file;

    const readableFile = new stream.Readable();
    readableFile.push(buffer);
    readableFile.push(null);

    const productsLine = readline.createInterface({
      input: readableFile,
    });

    // Objeto para rastrear a soma dos valores dos kits
    const kitSums = {};

    try {
      for await (let line of productsLine) {
        const columns = line.split(',');
        if (!isNaN(Number(columns[0])) && !isNaN(Number(columns[1]))) {
          const code = columns[0];
          const newPrice = columns[1];

          // Verifique se o produto associado a este código teve seu sales_price alterado
          const product = await Product.findOne({
            attributes: ['code', 'name', 'cost_price', 'sales_price'],
            where: { code: code },
          });

          if (product) {
            const currentPrice = parseFloat(product.sales_price);
            const newPriceFloat = parseFloat(newPrice);

            // O valor de sales_price do produto foi alterado
            // Agora verifique na tabela Packs se há kits que incluem este produto
            const kitsWithUpdatedProduct = await Pack.findOne({
              attributes: ['id', 'pack_id', 'product_id', 'qty'],
              where: { product_id: code },
            });

            if (kitsWithUpdatedProduct) {
              const packId = kitsWithUpdatedProduct.pack_id;
              const qty = kitsWithUpdatedProduct.qty;

              // Verifique se o kit já está no objeto kitSums
              if (!kitSums[packId]) {
                // Se não, crie uma entrada com o valor atual
                kitSums[packId] = qty * newPriceFloat;
              } else {
                // Se sim, adicione o valor atual ao valor existente
                kitSums[packId] += qty * newPriceFloat;
              }
            }
            await Product.update(
              { sales_price: newPriceFloat },
              {
                attributes: ['code', 'name', 'cost_price', 'sales_price'],
                where: { code: code },
              }
            );
          }
        }
      }

      // kitSums agora contém as somas dos valores de cada kit
      console.log(kitSums);

      // Atualize o sales_price dos kits na tabela products
      for (const packId in kitSums) {
        const totalValue = kitSums[packId];
        // Atualize o sales_price do kit com base no pack_id
        await Product.update(
          { sales_price: totalValue },
          { where: { code: packId } }
        );
      }

      return res.status(200).send('Atualização de kits concluída');
    } catch (error) {
      console.error('Erro ao atualizar produtos:', error);
      return res.status(500).send('Erro interno do servidor');
    }
  };
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
  if (newPrice < costPrice) {
    return `O novo preço (${newPrice}) é menor que o preço de custo (${costPrice}).`;
  }
  return `O reajuste de preço (${newPrice}) é ${
    newPrice > currentPrice + currentPrice * 0.1 ? 'maior' : 'menor'
  } que 10% do preço atual (${currentPrice}).`;
}

module.exports = ProductController;
