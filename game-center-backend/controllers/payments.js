// controllers/paymentsController.js
const { Payment } = require('../models');

// Create a new payment
exports.createPayment = async (req, res) => {
  try {
    const { customer_id, amount, method } = req.body;

    if (!customer_id || !amount || !method) {
      return res.status(400).json({ error: 'customer_id, amount, and method are required.' });
    }

    const newPayment = await Payment.create({
      customer_id,
      amount,
      method,
    });

    res.status(201).json(newPayment);
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



// Get all payments for a specific customer
exports.getPaymentsByCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;

    if (!customerId) {
      return res.status(400).json({ error: 'customerId parameter is required.' });
    }

    const paymentList = await Payment.findAll({
      where: { customer_id: customerId },
      order: [['created_at', 'DESC']], // Optionally sort payments by most recent
    });

    res.status(200).json(paymentList);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
