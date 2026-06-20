const { Server } = require('socket.io');
const Room = require('./models/Room');
const { redisClient } = require('./config/redis');

module.exports = function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || '*',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join a Jam Session
    socket.on('join-room', async ({ roomId, userId }) => {
      socket.join(roomId);
      console.log(`User ${userId || socket.id} joined room ${roomId}`);
      
      // Optionally fetch current room state from Redis and send it to the user
      const roomStateStr = await redisClient.get(`room:${roomId}`);
      if (roomStateStr) {
        const roomState = JSON.parse(roomStateStr);
        socket.emit('room-state-sync', roomState);
      }
      
      socket.to(roomId).emit('user-joined', { userId, socketId: socket.id });
    });

    // Handle Player State Changes (Play, Pause, Seek)
    socket.on('player-state-change', async ({ roomId, state }) => {
      // state: { type: 'PLAY' | 'PAUSE' | 'SEEK', currentTime: number, trackId?: string }
      
      // Update state in Redis
      const roomStateStr = await redisClient.get(`room:${roomId}`);
      let roomState = roomStateStr ? JSON.parse(roomStateStr) : {};
      
      roomState = { ...roomState, ...state, lastUpdate: Date.now() };
      await redisClient.set(`room:${roomId}`, JSON.stringify(roomState), { EX: 86400 }); // Expire in 1 day

      // Broadcast to others in the room
      socket.to(roomId).emit('player-state-sync', state);
    });

    // Handle Track Change
    socket.on('track-change', async ({ roomId, track }) => {
      const roomStateStr = await redisClient.get(`room:${roomId}`);
      let roomState = roomStateStr ? JSON.parse(roomStateStr) : {};
      
      roomState.currentTrack = track;
      roomState.isPlaying = true;
      roomState.currentTime = 0;
      roomState.lastUpdate = Date.now();
      
      await redisClient.set(`room:${roomId}`, JSON.stringify(roomState), { EX: 86400 });
      
      socket.to(roomId).emit('track-sync', track);
    });

    // Sync Queue
    socket.on('queue-change', async ({ roomId, queue }) => {
      const roomStateStr = await redisClient.get(`room:${roomId}`);
      let roomState = roomStateStr ? JSON.parse(roomStateStr) : {};
      
      roomState.queue = queue;
      
      await redisClient.set(`room:${roomId}`, JSON.stringify(roomState), { EX: 86400 });
      
      socket.to(roomId).emit('queue-sync', queue);
    });

    // Chat Message
    socket.on('chat-message', ({ roomId, message, user }) => {
      io.to(roomId).emit('chat-message', { message, user, timestamp: Date.now() });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
};
