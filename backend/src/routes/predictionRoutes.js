const express = require('express');
const router = express.Router();
const predictionController = require('../controllers/predictionController');

router.get('/:serverId', predictionController.getPredictions);
router.get('/all/active', predictionController.getAllServerPredictions);
router.get('/optimal/server', predictionController.getOptimalServer);

module.exports = router;
