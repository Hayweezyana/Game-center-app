const io = require('socket.io-client');

// Configuration
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3002/queue';
const NUM_CLIENTS = 10; // Number of simulated users

// Array to hold all client instances
const clients = [];

// Function to create a single client and handle events
const createClient = (id) => {
  const socket = io(BACKEND_URL, {
    withCredentials: true,
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log(`Client ${id} connected: ${socket.id}`);
    // Emit any events for testing
    socket.emit('queueEvent', { message: `Hello from Client ${id}` });
  });

  socket.on('queueUpdate', (data) => {
    console.log(`Client ${id} received queue update:`, data);
  });

  socket.on('disconnect', () => {
    console.log(`Client ${id} disconnected.`);
  });

  socket.on('error', (err) => {
    console.error(`Client ${id} encountered an error:`, err);
  });

  return socket;
};

// Create multiple clients
for (let i = 1; i <= NUM_CLIENTS; i++) {
  clients.push(createClient(i));
}

// Optionally disconnect all clients after some time
setTimeout(() => {
  clients.forEach((client, index) => {
    console.log(`Disconnecting Client ${index + 1}`);
    client.disconnect();
  });
}, 600000);
