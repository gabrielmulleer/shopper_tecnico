const express = require('express');

const router = express.Router();
const db = require('../db/models');

class PackController {
  static pegaTodosPacks = async (req, res) => {
    try {
      const packs = await db.Packs.findAll({
        attributes: ['id', 'pack_id', 'product_id', 'qty'],
      });
      return res.status(200).json(packs);
    } catch (error) {
      return res.status(500).json(error.message);
    }
  };
}

module.exports = PackController;
