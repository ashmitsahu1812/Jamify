const mongoose = require('mongoose');

const trackSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // YouTube videoId
  title: { type: String, required: true },
  artist: { type: String, required: true },
  album: { type: String },
  duration: { type: Number, default: 0 }, // in seconds
  audioUrl: { type: String },
  coverUrl: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Track', trackSchema);
