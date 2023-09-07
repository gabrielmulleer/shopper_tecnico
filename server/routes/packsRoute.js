const { Router } = require('express');
const PackController = require('../controllers/PackController');

const router = Router();

router.get('/packs', PackController.pegaTodosPacks);

module.exports = router;
