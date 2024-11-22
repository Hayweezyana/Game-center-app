// controllers/queue.js
const { Queue, PC } = require('../models');

// Add customer to the queue
exports.addToQueue = async (req, res) => {
    try {
        const { customer_id, game_id } = req.body;

        // Check for available PC
        const availablePC = await PC.findOne({ where: { status: 'available' } });
        if (availablePC) {
            // Assign the PC directly if available
            await availablePC.update({ status: 'busy' });
            res.json({ message: `Assigned to PC ${availablePC.id}` });
        } else {
            // Add the customer to the queue
            const newQueueEntry = await Queue.create({
                customer_id,
                game_id,
                status: 'waiting',
            });
            res.json({ message: 'Added to queue', queue: newQueueEntry });
        }
    } catch (error) {
        console.error('Error adding to queue:', error);
        res.status(500).json({ error: 'Server error' });
    }
};



// Get all queue entries
exports.getAllQueue = async (req, res) => {
    try {
        const updatedQueue = await Queue.findAll({ order: [['created_at', 'ASC']] });
        res.json(updatedQueue);
    } catch (error) {
        console.error('Error fetching queue:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Assign the next customer in the queue to an available PC
exports.assignNextCustomer = async (req, res) => {
    try {
        const { game_id } = req.body;

        // Find an available PC
        const availablePC = await PC.findOne({ where: { status: 'available' } });
        if (!availablePC) {
            return res.status(404).json({ message: 'No available PC for the next customer.' });
        }

        // Find the next customer in the queue
        const nextCustomer = await Queue.findOne({
            where: { game_id, status: 'waiting' },
            order: [['created_at', 'ASC']],
        });

        if (nextCustomer) {
            // Assign PC and update statuses
            await availablePC.update({ status: 'busy' });
            await nextCustomer.update({ status: 'assigned' });
            res.json({
                message: `Assigned PC ${availablePC.id} to customer ${nextCustomer.customer_id}`,
            });
        } else {
            res.status(404).json({ message: 'No customers in the queue for this game.' });
        }
    } catch (error) {
        console.error('Error assigning next customer:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
