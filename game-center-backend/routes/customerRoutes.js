const express = require('express');
const router = express.Router();
const customersController = require('../controllers/customers');
console.log(customersController);


// Routes for customers
// Fetch all customers
router.get('/', customersController.getAllCustomers);

// Fetch a customer by ID
router.get('/:customer_id', customersController.getCustomerById);

// Create or find a customer
router.post('/', customersController.createOrFindCustomer);

// Update a customer
router.put('/:customer_id', customersController.updateCustomer);

router.put('/membership_level', customersController.updateCustomerMembership);
router.put('/membership_level', async (req, res) => {
    const { email, membership_level } = req.body;

    if (!email || !membership_level) {
        return res.status(400).json({ error: 'Email and membership level are required.' });
    }

    try {
        // Find customer by email
        const customer = await Customer.findOne({ where: { email } });

        if (!customer) {
            return res.status(404).json({ error: 'Customer not found.' });
        }

        // Update membership level
        customer.membership_level = membership_level;
        await customer.save();

        return res.status(200).json({ message: 'Membership level updated successfully.', customer });
    } catch (error) {
        console.error('Error updating membership:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});


// Delete a customer
router.delete('/:customer_id', customersController.deleteCustomer);

module.exports = router;
