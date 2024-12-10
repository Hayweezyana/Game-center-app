require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const twilio = require('twilio');
const cron = require('node-cron');
const { Op } = require('sequelize');

// Import models
const db = require('./models');
const sequelize = db.sequelize;
const { Customer, Game, PC, Queue } = db;

const FRONTEND_URL = process.env.FRONTEND_URL;
const app = express();
const server = http.createServer(app);

// Set up Socket.IO with CORS
const io = socketIo(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Middleware setup
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static file serving with custom headers
app.use(express.static('public', {
  setHeaders: (res) => {
    res.set('Access-Control-Allow-Origin', FRONTEND_URL);
    res.set('Access-Control-Allow-Credentials', 'true');
  },
}));

// Logging middleware
app.use((req, res, next) => {
  console.log(`Received ${req.method} request for ${req.url}`);
  next();
});

// Import routes
const gameRoutes = require('./routes/gameRoutes');
const cartRoutes = require('./routes/cartRoutes');
const customerRoutes = require('./routes/customerRoutes');
const queueRoutes = require('./routes/queueRoutes');
const pcRoutes = require('./routes/pcRoutes');
const adminRoutes = require('./routes/adminRoutes');
const reportRoutes = require('./routes/reportRoutes');

// Mount routes
app.use('/', gameRoutes);
app.use('/api/payments', cartRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/pcs', pcRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', reportRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Socket.IO namespaces
const queueNamespace = io.of('/queue');

queueNamespace.on('connection', (socket) => {
  console.log(`Client connected to queue namespace: ${socket.id}`);

  // Emit initial queue data
  const emitQueueUpdate = async () => {
    const updatedQueue = await Queue.findAll({
      include: [
        { model: Customer, as: 'customer' },
        { model: Game, as: 'game' },
        { model: PC, as: 'pc' },
      ],
      order: [['created_at', 'ASC']],
    });
    queueNamespace.emit('queueUpdate', updatedQueue);
  };

  socket.on('queueEvent', async () => {
    await emitQueueUpdate();
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected from queue namespace: ${socket.id}`);
  });
});

// Cron job for dynamic PC assignment
cron.schedule('* * * * *', async () => {
  console.log('Running cron job to update queue...');
  try {
    // Fetch waiting queue entries and free PCs
    const queueEntry = await Queue.findAll({
      include: [
        { model: Game, as: 'game' },
      ],
      where: { status: 'Waiting' },
      order: [['created_at', 'ASC']],
    });

    const availablePCs = await PC.findAll({ where: { status: 'available' } });
    if (!queueEntry.length) {
      console.log('No customers in the queue to assign a PC.');
      return;
    }
    if (!availablePCs.length) {
      console.log('No PCs available to assign.');
      return;
    }

    // Assign PCs to waiting queue entries
    for (let i = 0; i < queueEntry.length && i < availablePCs.length; i++) {
      const queue = queueEntry[i];
      const pc = availablePCs[i];

       // Assign the PC to the customer in the queue
       await queue.update({ status: 'playing', pc_id: pc.id, remaining_time: 600 }); // 1 hour
       await pc.update({ status: 'busy' });

    // Update the PC status to busy
    availablePCs.status = 'busy';
    await availablePCs.save();

    console.log(`Assigned PC-${availablePCs.id} to customer in queue.`);

      // Update queue and PC statuses
      queue.pc_id = pc.id;
      queue.status = 'Assigned';
      await queue.save();

      pc.status = 'busy';
      await pc.save();
    }

    console.log('Queue and PC statuses updated successfully.');
    // Broadcast the updated queue to clients
    const updatedQueue = await Queue.findAll({
      include: [
        { model: Customer, as: 'customer' },
        { model: Game, as: 'game' },
        { model: PC, as: 'pc' },
      ],
      order: [['created_at', 'ASC']],
    });
    queueNamespace.emit('queueUpdate', updatedQueue);
  } catch (error) {
    console.error('Error updating queue and PC statuses:', error);
  }
});

// Stripe payment intent creation
app.post('/create-payment-intent', async (req, res) => {
  const { amount } = req.body;
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'ngn',
      automatic_payment_methods: { enabled: true },
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server and sync database
const startServer = async () => {
  try {
    await sequelize.sync({ alter: false });
    console.log('Database synchronized');
    const PORT = process.env.PORT || 3002;
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
  }
};

startServer();
