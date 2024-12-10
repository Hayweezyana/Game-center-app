const express = require('express');
const router = express.Router();
const { Games, Queue, Payments, PCs } = require('../models'); // Ensure these models are correctly defined
const { Op } = require('sequelize'); // Sequelize operators
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Fetch all games
router.get('/api/games', async (req, res) => {
  try {
    const gameList = await Games.findAll();
    res.status(200).json(gameList);
  } catch (error) {
    console.error('Error fetching games:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a payment intent (Stripe)
router.post('/api/create-payment-intent', async (req, res) => {
  const { amount } = req.body;

  if (!amount) {
    return res.status(400).json({ error: 'Amount is required.' });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'ngn',
    });
    res.status(200).json(paymentIntent);
  } catch (error) {
    console.error('Error creating payment intent:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Process cash payment
router.post('/api/cash-payment', async (req, res) => {
  const { customer_id, amount } = req.body;

  if (!customer_id || !amount) {
    return res.status(400).json({
      error: 'customer_id and amount are required.',
    });
  }

  try {
    const customerExists = await Queue.findOne({ where: { customer_id } });
    if (!customerExists) {
      return res.status(404).json({ error: 'Customer not found in the queue.' });
    }

    const newPayment = await Payments.create({
      customer_id,
      amount,
      method: 'cash',
    });

    res.status(201).json({
      message: 'Cash payment recorded successfully',
      payment: newPayment,
    });
  } catch (error) {
    console.error('Error processing cash payment:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get available PCs
router.get('/api/pcs/available', async (req, res) => {
  try {
    const availablePCs = await PCs.findAll({
      where: { status: 'available' },
    });

    res.status(200).json(availablePCs);
  } catch (error) {
    console.error('Error fetching available PCs:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
