const { PC, Queue } = require('../models'); // Ensure using Sequelize model
const cron = require('node-cron');

// Get all PCs
exports.getAllPCs = async (req, res) => {
  try {
    const pcs = await PC.findAll();
    res.json(pcs);
  } catch (error) {
    console.error('Error fetching PCs:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get available PCs
exports.getAvailablePCs = async (req, res) => {
  try {
    const availablePCs = await PC.findAll({ where: { status: 'available' } });
    res.json(availablePCs);
  } catch (error) {
    console.error('Error fetching available PCs:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update PC status (to 'available' or 'busy')
exports.updatePCStatus = async (req, res) => {
  try {
    const [updated] = await PC.update(
      { status: req.body.status },
      { where: { id: req.params.id } }
    );
    if (!updated) return res.status(404).json({ error: 'PC not found' });
    res.json({ message: 'PC status updated' });
  } catch (error) {
    console.error('Error updating PC status:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Function to dynamically assign PCs to customers in the queue
const assignPCsToQueue = async () => {
  try {
    const freePCs = await PC.findAll({ where: { status: 'available' } });
    const waitingQueue = await Queue.findAll({
      where: { status: 'waiting' },
      order: [['created_at', 'ASC']],
    });

    for (let i = 0; i < freePCs.length && i < waitingQueue.length; i++) {
      const pc = freePCs[i];
      const queueEntry = waitingQueue[i];

      // Assign PC to customer
      await queueEntry.update({ pc_id: pc.id, status: 'playing' });
      await pc.update({ status: 'busy' });

      console.log(`Assigned PC-${pc.id} to Customer-${queueEntry.customer_id}`);
    }
  } catch (error) {
    console.error('Error assigning PCs to queue:', error);
  }
};

// Cron job to periodically assign PCs to waiting customers
cron.schedule('*/1 * * * *', async () => {
  console.log('Running scheduled task to assign PCs...');
  await assignPCsToQueue();
});

// Assign PC to a customer (queue management)
exports.assignPCToNextCustomer = async (req, res) => {
  const { id } = req.params;
  const { customer_id, game_id } = req.body;

  try {
    // Check if the PC is available
    const pc = await PC.findOne({ where: { id, status: 'available' } });
    if (!pc) {
      return res.status(400).json({ error: 'PC not available' });
    }

    // Mark PC as 'busy'
    await PC.update({ status: 'busy' }, { where: { id } });

    // Optionally, add to the queue or register the session (adjust queue table fields accordingly)
    await Queue.create({ customer_id, game_id, status: 'assigned' });

    res.json({ message: 'PC assigned successfully', pc });
  } catch (err) {
    console.error('Error assigning PC:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
