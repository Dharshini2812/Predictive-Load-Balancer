const express = require('express');
const router = express.Router();
const loadController = require('../controllers/loadController');

router.get('/current', loadController.getCurrentLoad);
router.get('/history', loadController.getLoadHistory);
router.get('/health', loadController.getSystemHealth);

module.exports = router;
