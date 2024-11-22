const db = require('./models');
const { Game } = db;

const fetchGames = async () => {
    try {
        const games = await Game.findAll();
        console.log('Fetched games:', games);
    } catch (error) {
        console.error('Error fetching games:', error);
    }
};

fetchGames();
