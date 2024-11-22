// controllers/pcsController.js
const { PC } = require('../models'); // Ensure using Sequelize model

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
        const [updated] = await PC.update({ status: req.body.status }, { where: { id: req.params.id } });
        if (!updated) return res.status(404).json({ error: 'PC not found' });
        res.json({ message: 'PC status updated' });
    } catch (error) {
        console.error('Error updating PC status:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Assign PC to a customer (queue management)
exports.assignPC = async (req, res) => {
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
