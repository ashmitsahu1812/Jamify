const express = require('express');
const router = express.Router();
const Playlist = require('../models/Playlist');
const Track = require('../models/Track');

// Create a new playlist
router.post('/', async (req, res) => {
  try {
    const { name, creator } = req.body;
    const playlist = await Playlist.create({ name, creator, tracks: [] });
    res.status(201).json(playlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user's playlists
router.get('/user/:userId', async (req, res) => {
  try {
    const playlists = await Playlist.find({ creator: req.params.userId }).sort({ createdAt: -1 });
    res.json(playlists);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single playlist with populated tracks
router.get('/:id', async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id).populate('tracks');
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
    res.json(playlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a track to a playlist
router.post('/:id/tracks', async (req, res) => {
  try {
    const { track } = req.body;
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });

    // Upsert Track to DB
    await Track.findByIdAndUpdate(track._id, {
      _id: track._id,
      title: track.title,
      artist: track.artist,
      duration: track.duration,
      coverUrl: track.coverUrl,
      audioUrl: track.audioUrl
    }, { upsert: true });

    if (!playlist.tracks.includes(track._id)) {
      playlist.tracks.push(track._id);
      
      // Update cover to first track if it's default
      if (playlist.tracks.length === 1 || playlist.coverUrl.includes('liked-songs')) {
        playlist.coverUrl = track.coverUrl;
      }
      
      await playlist.save();
    }
    
    res.json(playlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
