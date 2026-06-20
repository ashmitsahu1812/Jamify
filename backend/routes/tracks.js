const express = require('express');
const router = express.Router();
const Track = require('../models/Track');

const ytSearch = require('yt-search');

// Get default/trending tracks for home page
router.get('/', async (req, res) => {
  try {
    const result = await ytSearch('top hit songs playlist');
    const tracks = result.videos.slice(0, 15).map(video => ({
      _id: video.videoId, // We use YouTube's ID as our track ID
      title: video.title,
      artist: video.author.name,
      duration: video.seconds,
      audioUrl: `https://www.youtube.com/watch?v=${video.videoId}`,
      coverUrl: video.thumbnail
    }));
    res.json(tracks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search global tracks
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    
    const result = await ytSearch(q + ' audio'); // Append 'audio' for better music results
    const tracks = result.videos.slice(0, 20).map(video => ({
      _id: video.videoId,
      title: video.title,
      artist: video.author.name,
      duration: video.seconds,
      audioUrl: `https://www.youtube.com/watch?v=${video.videoId}`,
      coverUrl: video.thumbnail
    }));
    res.json(tracks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Seed some initial mock tracks if db is empty (for testing)
router.post('/seed', async (req, res) => {
  try {
    const count = await Track.countDocuments();
    if (count === 0) {
      const mockTracks = [
        { title: 'Lofi Study', artist: 'Chillhop Music', duration: 180, audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80' },
        { title: 'Synthwave Night', artist: 'Retro Synth', duration: 240, audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', coverUrl: 'https://images.unsplash.com/photo-1614113489855-66422ad300a4?w=500&q=80' },
        { title: 'Deep Focus', artist: 'Ambient', duration: 200, audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', coverUrl: 'https://images.unsplash.com/photo-1493225457124-a1a2a5f5f924?w=500&q=80' }
      ];
      await Track.insertMany(mockTracks);
      return res.json({ message: 'Seeded successfully' });
    }
    res.json({ message: 'Already seeded' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
