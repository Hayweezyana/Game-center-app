const express = require('express');
const router = express.Router();
const { newQueueEntry, getAllQueue, assignNextCustomer, newCustomer } = require('../controllers/queue');

// GET /api/queue - Get all customers in the queue
router.get('/', getAllQueue);

// POST /api/queue - Add a customer to the queue
router.post('/add', async (req, res) => {
  const { customer_id, game_id } = req.body;

  try {
      const newQueueEntry = await Queue.create({
          customer_id,
          game_id,
          created_at: new Date(),
      });

      // Emit a Socket.IO event to notify clients
      req.app.get('io').emit('queueUpdate', await Queue.findAll({ order: [['created_at', 'ASC']] }));

      res.status(201).json(newQueueEntry);
  } catch (error) {
      console.error('Error adding to queue:', error);
      res.status(500).json({ error: 'Failed to add customer to the queue.' });
  }
});

// POST /api/queue/assign-next - Assign the next customer in the queue to an available PC
router.post('/assign-next', assignNextCustomer);

// Requeue endpoint
router.post('/add', async (req, res) => {
    const { customer_id } = req.body;
  
    if (!id) {
      return res.status(400).json({ success: false, message: 'Customer ID is required.' });
    }
  
    try {
      // Fetch the customer from the queue
      const customer = await Queue.findOne({ where: { id } });
      if (!customer) {
        return res.status(404).json({ success: false, message: 'Customer not found in the queue.' });
      }
  
      // Remove the customer from their current position in the queue
      await Queue.destroy({ where: { id } });
  
      // Add the customer to the end of the queue (requeue)
      const newCustomer = await Queue.create({ ...customer.toJSON(), position: null });
  
      // Reorder the queue by position (if needed)
      const updatedQueue = await Queue.findAll({ order: [['createdAt', 'ASC']] });
  
      // Emit updated queue to all clients
      io.emit('queueUpdate', updatedQueue);
  
      res.status(200).json({ success: true, message: 'Customer requeued successfully.', updatedQueue });
    } catch (error) {
      console.error('Error requeuing customer:', error);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  });
  
  module.exports = router;
