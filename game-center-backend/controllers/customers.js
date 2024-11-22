// controllers/customersController.js
const { Customer } = require('../models'); // Ensure the Customer model is properly defined and imported
const { v4: uuidv4 } = require('uuid'); // UUID for generating customer IDs

// Get all customers
exports.getAllCustomers = async (req, res) => {
  try {
    const customerList = await Customer.findAll();
    res.status(200).json(customerList);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get a customer by ID
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.status(200).json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create or find a customer
exports.createOrFindCustomer = async (req, res) => {
  const { email, phone } = req.body;

  // Check for email or phone before proceeding
  if (!email && !phone) {
    return res.status(400).json({ error: 'Email or phone number is required.' });
  }

  try {
    // Check if a customer already exists based on email or phone
    let customer = await Customer.findOne({
      where: { email } // Find by email first as it's unique
    });

    if (!customer) {
      // If no customer found by email, check by phone (only if phone is provided)
      if (phone) {
        customer = await Customer.findOne({
          where: { phone }
        });
      }
    }

    if (customer) {
      // If customer exists, return the customer ID
      return res.status(200).json({ customer_id: customer.customer_id });
    }

    // If no customer found, create a new customer
    const newCustomer = await Customer.create({
      customer_id: uuidv4(),
      email,
      phone
    });

    res.status(201).json({ customer_id: newCustomer.customer_id });
  } catch (error) {
    console.error('Error creating or finding customer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update customer details
exports.updateCustomer = async (req, res) => {
  try {
    const [updated] = await Customer.update(req.body, { where: { id: req.params.id } });

    if (!updated) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.status(200).json({ message: 'Customer updated successfully.' });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a customer
exports.deleteCustomer = async (req, res) => {
  try {
    const deleted = await Customer.destroy({ where: { id: req.params.id } });

    if (!deleted) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.status(200).json({ message: 'Customer deleted successfully.' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
