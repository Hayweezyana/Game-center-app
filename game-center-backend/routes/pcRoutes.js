const express = require('express');
const router = express.Router();
const { getAllPCs, getAvailablePCs, updatePCStatus, assignPC } = require('../controllers/pcs');

// Get all PCs
router.get('/', getAllPCs);

// Get available PCs
router.get('/available', getAvailablePCs);

// Update PC status (to 'available' or 'busy')
router.put('/:id', updatePCStatus);

// Assign PC to a customer (queue management)
router.put('/assign/:id', assignPC);

module.exports = router;
