require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const connectDB = require('./config/db');
const initializeSocket = require('./socket');

const authRoutes = require('./routes/auth');
const trackRoutes = require('./routes/tracks');

const app = express();
const server = http.createServer(app);

// Connect Databases
connectDB();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tracks', require('./routes/tracks'));
app.use('/api/playlists', require('./routes/playlists'));

app.get('/', (req, res) => {
  res.send('Jamify API is running...');
});

// Initialize Socket.io
initializeSocket(server);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
