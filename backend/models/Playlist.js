const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tracks: [{ type: String, ref: 'Track' }], // Array of YouTube track IDs
  coverUrl: { type: String, default: 'https://misc.scdn.co/liked-songs/liked-songs-300.png' }
}, { timestamps: true });

module.exports = mongoose.model('Playlist', playlistSchema);
