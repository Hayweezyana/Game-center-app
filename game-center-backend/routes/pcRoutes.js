const express = require('express');
const router = express.Router();
const cron = require('node-cron');
const { getAllPCs, getAvailablePCs, updatePCStatus } = require('../controllers/pcs');
const { assignPCsToQueue } = require('../controllers/pcs');
const { PC } = require('../models');
const { Queue } = require('../models');


// Get all PCs
router.get('/', getAllPCs);

router.post('/api/queue/assign-pcs', async (req, res) => {
    try {
      // Fetch the first available PC
      const availablePC = await PC.findOne({ where: { status: 'available' } });
  
      if (!availablePC) {
        return res.status(400).json({ error: 'No PCs available' });
      }
  
      // Fetch the first customer in the queue without an assigned PC
      const nextQueueEntry = await Queue.findOne({
        where: { pc_id: null },
        order: [['created_at', 'ASC']],
      });
  
      if (!nextQueueEntry) {
        return res.status(400).json({ error: '' });
      }
  
      // Assign the PC to the queue entry
      nextQueueEntry.pc_id = availablePC.id;
      nextQueueEntry.status = 'Assigned';
      await nextQueueEntry.save();
  
      // Update the PC status to 'busy'
      availablePC.status = 'busy';
      await availablePC.save();
  
      res.status(200).json({ message: 'PC assigned', queueEntry: nextQueueEntry });
    } catch (error) {
      console.error('Error assigning PC:', error);
      res.status(500).json({ error: 'Failed to assign PC' });
    }
  });
  

// Get available PCs
router.get('/available', getAvailablePCs, async (req, res) => {
  try {
    const pcs = await PC.findAll({ where: { status: 'free' } });
    res.json(pcs);
  } catch (error) {
    console.error('Error fetching available PCs:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Update PC status (to 'available' or 'busy')
router.put('/:id', updatePCStatus);


// Function to assign a PC to the next customer in the queue
const assignPCToNextCustomer = async (io) => {
  try {
    const nextInQueue = await Queue.findOne({
      where: { status: 'Waiting', pc_id: null },
      order: [['created_at', 'ASC']],
    });

    if (!nextInQueue) {
      console.log('No customer in the queue to assign a PC.');
      return;
    }

    const availablePC = await PC.findOne({ where: { status: 'available' } });

    if (!availablePC) {
      console.log('No PCs available to assign.');
      return;
    }

    // Assign the PC to the customer in the queue
    nextInQueue.pc_id = availablePC.id;
    nextInQueue.status = 'Playing';
    nextInQueue.countdown = 600; // Example: 10 minutes
    await nextInQueue.save();

    // Update the PC status to busy
    availablePC.status = 'busy';
    await availablePC.save();

    console.log(`Assigned PC-${availablePC.id} to customer in queue.`);

    // Emit the queue update to all connected clients
    io.emit('queueUpdate', await Queue.findAll({ include: ['PC', 'Game', 'Customer'] }));
  } catch (error) {
    console.error('Error assigning PC to the next customer:', error);
  }
};

// Endpoint to free a PC and assign it dynamically to the next customer
router.post('/free-pc', async (req, res) => {
  const { pc_id } = req.body;

  try {
    const pc = await PC.findByPk(pc_id);

    if (!pc) {
      return res.status(404).json({ error: 'PC not found' });
    }

    pc.status = 'available'; // Mark the PC as free
    await pc.save();

    // Dynamically assign the PC to the next customer
    await assignPCToNextCustomer(req.app.get('io'));

    res.status(200).json({ message: 'PC freed and reassigned if applicable' });
  } catch (error) {
    console.error('Error freeing PC:', error);
    res.status(500).json({ error: 'Failed to free PC' });
  }
});

cron.schedule('* * * * *', assignPCToNextCustomer);


module.exports = router;
