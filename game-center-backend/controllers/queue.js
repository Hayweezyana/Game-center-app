const { Queue, PC, Customer, Game } = require('../models');
const { Sequelize } = require('sequelize');

// Add to Queue or Assign PC
exports.addToQueue = async (req, res) => {
  console.log(req.body)
  const { customer_id, game_id } = req.body;

  try {
    // Check for an available PC
    const availablePC = await PC.findOne({ where: { status: 'available' } });

    if (availablePC) {
      // Assign PC directly
      await Queue.create({ customer_id, game_id, pc_id: availablePC.id, status: 'assigned' });
      await availablePC.update({ status: 'busy' });
      return res.json({ message: `Assigned to PC ${availablePC.id}` });
    }

    // Add to queue
    const newQueueEntry = await Queue.create({ customer_id, game_id, status: 'waiting' });
    res.json({ message: 'Added to queue', queue: newQueueEntry });
  } catch (error) {
    console.error('Error adding to queue:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Fetch Queue
exports.getQueue = async (req, res) => {
  try {
    const queue = await Queue.findAll({
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['customer_id', 'name', 'phone'],
        },
        {
          model: Game,
          as: 'game',
          attributes: ['id', 'title', 'price'],
        },
        {
          model: PC,
          as: 'pc',
          attributes: ['id', 'status'],
        },
      ],
      order: [
        [
          Sequelize.literal(`
            CASE
              WHEN "Queue"."membership_level" = 'GOLD' THEN 1
              WHEN "Queue"."membership_level" = 'SILVER' THEN 2
              ELSE 3
            END
          `),
          'ASC',
        ],
        ['created_at', 'ASC'],
      ],
    });

    res.status(200).json({ message: 'Queue fetched successfully', queue });
  } catch (error) {
    console.error('Error fetching queue:', error);
    res.status(500).json({ message: 'Server error while fetching the queue' });
  }
};

exports.requeueCustomer = async (req, res) => {
  try {
    const { customer_id } = req.body;

    // Perform the requeue logic
    // Example: Update the customer's position in the queue
    res.json({ success: true, message: `Customer ${customer_id} requeued.` });
  } catch (error) {
    console.error('Error requeuing customer:', error);
    res.status(500).json({ success: false, message: 'Failed to requeue customer.' });
  }
};
