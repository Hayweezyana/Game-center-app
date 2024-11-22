const express = require('express');
const router = express.Router();
const customersController = require('../controllers/customers');

// Routes for customers
// Fetch all customers
router.get('/', customersController.getAllCustomers);

// Fetch a customer by ID
router.get('/:id', customersController.getCustomerById);

// Create or find a customer
router.post('/', customersController.createOrFindCustomer);

// Update a customer
router.put('/:id', customersController.updateCustomer);

// Delete a customer
router.delete('/:id', customersController.deleteCustomer);

module.exports = router;
