const express = require('express');
const router = express.Router();
const { Games, Queue, Payments, PCs } = require('../models'); // Ensure these models are correctly defined
const { Op } = require('sequelize'); // Sequelize operators
const stripe = require('stripe')('your-stripe-secret-key'); // Replace with your Stripe secret key

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

// Add a customer to the queue
router.post('/api/queue', async (req, res) => {
  const { customer_id, game_id, membership_level } = req.body;

  if (!customer_id || !game_id || !membership_level) {
    return res.status(400).json({
      error: 'customer_id, game_id, and membership_level are required.',
    });
  }

  try {
    const newQueueEntry = await Queue.create({
      customer_id,
      game_id,
      membership_level,
      created_at: new Date(),
    });

    // Emit updated queue to Socket.IO clients
    const updatedQueue = await Queue.findAll({
      order: [['created_at', 'ASC']],
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('queueUpdate', updatedQueue);
    }

    res.status(201).json({ message: 'Customer added to queue', queue: newQueueEntry });
  } catch (error) {
    console.error('Error adding to queue:', error.message);
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
