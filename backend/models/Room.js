const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  queue: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Track' }],
  currentTrack: { type: mongoose.Schema.Types.ObjectId, ref: 'Track' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
