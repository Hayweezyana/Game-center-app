require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const twilio = require('twilio');

const db = require('./models'); // Import all models
console.log('Queue model:', db.Queue);
const sequelize = db.sequelize;
const { Customer, Game, PC, Queue, Payment } = db;
console.log('Loaded models:', Object.keys(require('./config/db')));

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] },
});

// Middleware setup
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

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

// Mount routes
app.use('/api/games', gameRoutes);
app.use('/api/payments', cartRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/pcs', pcRoutes);

// Default route for undefined endpoints
app.use((req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
});

// Socket.IO connection
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Handle game events
    socket.on('someGameEvent', (data) => {
        console.log('Game event data:', data);
    });

    const queueNamespace = io.of('/queue');
queueNamespace.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

 

    // Handle queue events
    socket.on('queueEvent', async () => {
        if (!Queue) {
            console.error('Queue model is not loaded.');
            socket.emit('error', 'Queue model is not available.');
            return;
        }

        try {
            const initialQueue = await Queue.findAll({ order: [['created_at', 'ASC']] });
            socket.emit('queueUpdate', initialQueue);
        } catch (error) {
            console.error('Error fetching initial queue:', error);
            socket.emit('error', 'Failed to fetch initial queue.');
        }
    });
     // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

    // Handle PC events
    socket.on('somePCEvent', (data) => {
        console.log('PC event data:', data);
    });

    // Handle payment events
    socket.on('somePaymentEvent', (data) => {
        console.log('Payment event data:', data);
    });

    // Handle customer events
    socket.on('someCustomerEvent', (data) => {
        console.log('Customer event data:', data);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

app.post('/api/queue', async (req, res) => {
    try {
      const newQueueEntry = await Queue.create({
        customer_id: req.body.customer_id,
        status: req.body.status || 'waiting',
  });

  // Fetch updated queue and emit event
  const updatedQueue = await Queue.findAll({ order: [['created_at', 'ASC']] });
  io.of('/queue').emit('queueUpdate', updatedQueue);

  res.status(201).json(newQueueEntry);
} catch (error) {
  console.error('Error adding to queue:', error);
  res.status(500).json({ error: 'Internal server error' });
}
});
  

// Stripe payment endpoint
app.post("/create-payment-intent", async (req, res) => {
    const { amount } = req.body;
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: "ngn",
            automatic_payment_methods: { enabled: true },
        });
        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Twilio configuration for SMS notifications
const twilioClient = new twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

const getCustomerPhoneNumber = async (customerId) => {
    const customer = await Customer.findOne({ where: { customer_id: customerId } });
    return customer?.phone;
};

const sendNotification = async (customerPhoneNumber, message) => {
    try {
        const msg = await twilioClient.messages.create({
            body: message,
            to: customerPhoneNumber,
            from: '+13342928720', // Your Twilio phone number
        });
        console.log(`Notification sent: ${msg.sid}`);
    } catch (error) {
        console.error('Error sending notification:', error.stack);
    }
};

// Function to assign the next customer to an available PC
const assignNextCustomer = async (game_id) => {
    const sortedQueue = await Queue.findAll({ where: { game_id }, order: [['created_at', 'ASC']] });

    if (sortedQueue.length > 0) {
        const nextCustomer = sortedQueue[0];
        const availablePC = await PC.findOne({
            where: { status: 'free' },
            include: [{ model: Game, where: { id: game_id } }],
        });

        if (availablePC) {
            await PC.update({ status: 'busy' }, { where: { id: availablePC.id } });
            await Queue.destroy({ where: { customer_id: nextCustomer.customer_id } });

            // Emit updated queue and customer assignment
            const updatedQueue = await Queue.findAll({ order: [['created_at', 'ASC']] });
            io.emit('queueUpdate', updatedQueue);
            io.emit('customerAssigned', { customer_id: nextCustomer.customer_id, pc: availablePC });

            console.log(`Customer ${nextCustomer.customer_id} assigned to PC ${availablePC.id}`);
        }
    }
};


// Start server and sync database
const startServer = async () => {
    try {
        await sequelize.sync({ alter: true });
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
