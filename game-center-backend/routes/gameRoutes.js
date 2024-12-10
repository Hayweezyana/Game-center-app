const express = require('express');
const router = express.Router();
const { Game } = require('../models');

// PUT: Update game duration by ID
router.put('/api/games/:id', async (req, res) => {
  const { id } = req.params; // Extract game ID from the route
  const { time_slot } = req.body; // Extract the updated time_slot from the request body
  
  console.log('Received PUT request for game ID:', id, 'with time_slot:', time_slot); // Debug log

  try {
    // Find the game by ID
    const game = await Game.findByPk(id);
    if (!game) {
      console.error('Game not found with ID:', id);
      return res.status(404).json({ error: 'Game not found' });
    }

    // Update the game's duration
    game.time_slot = time_slot;
    await game.save();

    res.status(200).json({ message: 'Game duration updated successfully', game });
  } catch (error) {
    console.error('Error updating game duration:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET: Retrieve all games
router.get('/api/games', async (req, res) => {
  try {
    const game = await Game.findAll(); // Fetch all games
    res.json(game);
  } catch (error) {
    console.error('Error fetching games:', error);
    res.status(500).json({ error: 'An error occurred while fetching games.' });
  }
});

// GET: Retrieve a single game by title
router.get('/api/games/:title', async (req, res) => {
  const { title } = req.params;

  try {
    const game = await Game.findOne({ where: { title } });
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    res.json(game);
  } catch (error) {
    console.error('Error fetching game:', error);
    res.status(500).json({ error: 'An error occurred while fetching the game.' });
  }
});

// GET: Test endpoint to fetch all games (redundant with /api/games)
router.get('/', async (req, res) => {
  try {
    const game = await Game.findAll();
    res.json(game);
  } catch (error) {
    console.error('Error fetching games:', error);
    res.status(500).json({ error: 'An error occurred while fetching games.' });
  }
});

module.exports = router;
