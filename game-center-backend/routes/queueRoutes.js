const express = require('express');
const { addToQueue, getQueue, } = require('../controllers/queue');

const queueController = require('../controllers/queue');
const router = express.Router();

// Add to queue
router.post('/add', addToQueue);

router.post('/requeue', queueController.requeueCustomer);

// Get queue
router.get('/', getQueue);

module.exports = router;
