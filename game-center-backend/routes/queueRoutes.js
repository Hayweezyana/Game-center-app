const express = require('express');
const router = express.Router();
const { Queue } = require('../models');

// Get all customers in the queue
router.get('/', async (req, res) => {
  try {
    const queue = await Queue.findAll({ order: [['created_at', 'ASC']] });
    res.status(200).json(queue);
  } catch (error) {
    console.error('Error fetching queue:', error);
    res.status(500).json({ error: 'Failed to fetch queue' });
  }
});

// Add a new customer to the queue
router.post('/add', async (req, res) => {
  const { customer_id, game_id } = req.body;

  try {
    const newEntry = await Queue.create({ customer_id, game_id, created_at: new Date() });
    const updatedQueue = await Queue.findAll({ order: [['created_at', 'ASC']] });

    req.app.get('io').of('/api/queue').emit('queueUpdate', updatedQueue);
    res.status(201).json(newEntry);
  } catch (error) {
    console.error('Error adding customer to queue:', error);
    res.status(500).json({ error: 'Failed to add customer to the queue' });
  }
});

// Requeue a customer
router.post('/requeue', async (req, res) => {
  const { id } = req.body;

  try {
    const customer = await Queue.findByPk(id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    await Queue.destroy({ where: { id } });
    const newEntry = await Queue.create({ ...customer.toJSON(), created_at: new Date() });
    const updatedQueue = await Queue.findAll({ order: [['created_at', 'ASC']] });

    req.app.get('io').emit('queueUpdate', updatedQueue);
    res.status(200).json({ success: true, updatedQueue });
  } catch (error) {
    console.error('Error requeuing customer:', error);
    res.status(500).json({ error: 'Failed to requeue customer' });
  }
});

module.exports = router;
