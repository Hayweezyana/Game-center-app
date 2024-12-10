const { CustomerProfilesEvaluationsPage } = require('twilio/lib/rest/trusthub/v1/customerProfiles/customerProfilesEvaluations');
const { Customer } = require('../models'); // Ensure the Customer model is properly defined and imported

exports.createOrFindCustomer = async (req, res) => {
  const { email, phone } = req.body;

  // Validate request input
  if (!phone && !email) {
    return res.status(400).json({ error: 'Email or phone number is required.' });
  }

  try {
    let customer;

    // Check if a customer exists by phone or email
    if (phone) {
      customer = await Customer.findOne({ where: { phone } });
    }
    if (!customer && email) {
      customer = await Customer.findOne({ where: { email } });
    }

    // If the customer exists, return the customer_id
    if (customer) {
      return res.status(200).json({ customer_id: customer.customer_id });
    }

    // Create a new customer if none found
    const newCustomer = await Customer.create({
      email,
      phone,
      membership_level: 'BRONZE', // Default membership level
    });

    res.status(201).json({ customer_id: newCustomer.customer_id });
  } catch (error) {
    console.error('Error creating or finding customer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// Get all customers
exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.findAll();
    res.status(200).json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get a customer by customer_id
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findOne({ where: { customer_id: parseInt(req.params.customer_id, 10) } });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.status(200).json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// Update customer details
exports.updateCustomer = async (req, res) => {
  try {
    const [updated] = await Customer.update(req.body, { where: { customer_id: req.params.customer_id } });

    if (!updated) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.status(200).json({ message: 'Customer updated successfully.' });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update customer membership level
exports.updateCustomerMembership = async (req, res) => {
  const { email, membership_level } = req.body;

  if (!email || !membership_level) {
      return res.status(400).json({ error: 'Email and membership level are required.' });
  }

  try {
      const customer = await Customer.findOne({ where: { email } });
      if (!customer) {
          return res.status(404).json({ error: 'Customer not found.' });
      }

      customer.membership_level = membership_level;
      await customer.save();

      res.status(200).json({ message: 'Membership level updated successfully.', customer });
  } catch (error) {
      console.error('Error updating membership level:', error);
      res.status(500).json({ error: 'Internal server error.' });
  }
};

// Delete a customer
exports.deleteCustomer = async (req, res) => {
  try {
    const deleted = await Customer.destroy({ where: { customer_id: req.params.customer_id } });

    if (!deleted) {
      return res.status(404).json({ error: 'Customer not found.' });
    }

    res.status(200).json({ message: 'Customer deleted successfully.' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

