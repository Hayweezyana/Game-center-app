const { Game } = require('../models');

if (!Game) {
    console.error('Game model not loaded properly!');
}
const getAllGames = async (req, res) => {
    try {
        const games = await Game.findAll();
        res.status(200).json(games);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getGameById = async (req, res) => {
    try {
        const game = await Game.findByPk(req.params.id);
        if (game) {
            res.status(200).json(game);
        } else {
            res.status(404).json({ error: 'Game not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllGames,
    getGameById
};
