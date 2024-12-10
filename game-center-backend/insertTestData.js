const db = require('../game-center-backend/models'); // Adjust path if needed
const Queue = db.Queue;

(async () => {
    try {
        await Queue.create({ clientId: 'test-client', timestamp: new Date() });
        console.log('Inserted test entry into queue');
    } catch (error) {
        console.error('Database error:', error);
    } finally {
        process.exit();
    }
})();
