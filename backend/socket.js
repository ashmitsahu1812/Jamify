const { Server } = require('socket.io');
const Room = require('./models/Room');

const roomStates = new Map();

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
      
      const roomState = roomStates.get(roomId);
      if (roomState) {
        socket.emit('room-state-sync', roomState);
      }
      
      socket.to(roomId).emit('user-joined', { userId, socketId: socket.id });
    });

    // Handle Player State Changes (Play, Pause, Seek)
    socket.on('player-state-change', async ({ roomId, state }) => {
      let roomState = roomStates.get(roomId) || {};
      
      roomState = { ...roomState, ...state, lastUpdate: Date.now() };
      roomStates.set(roomId, roomState);

      // Broadcast to others in the room
      socket.to(roomId).emit('player-state-sync', state);
    });

    // Handle Track Change
    socket.on('track-change', async ({ roomId, track }) => {
      let roomState = roomStates.get(roomId) || {};
      
      roomState.currentTrack = track;
      roomState.isPlaying = true;
      roomState.currentTime = 0;
      roomState.lastUpdate = Date.now();
      
      roomStates.set(roomId, roomState);
      
      socket.to(roomId).emit('track-sync', track);
    });

    // Sync Queue
    socket.on('queue-change', async ({ roomId, queue }) => {
      let roomState = roomStates.get(roomId) || {};
      
      roomState.queue = queue;
      
      roomStates.set(roomId, roomState);
      
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
