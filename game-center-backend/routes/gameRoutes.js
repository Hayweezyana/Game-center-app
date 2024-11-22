const express = require('express');
const router = express.Router();
 // Adjust path as needed
const { getAllGames, getGameById } = require('../controllers/games');
const { Game } = require('../models');

console.log(Game); // Add this to debug

// Get all games
router.get('/games', getAllGames);
router.get('/games/:title', getGameById);
router.get('/', async (req, res) => {
  try {
      const games = await Game.findAll();
      const io = req.app.get('io');
      res.json(games);
  } catch (error) {
      console.error('Error loading games:', error);
      res.status(500).json({ error: 'An error occurred while fetching games.' });
  }
});

module.exports = router;
