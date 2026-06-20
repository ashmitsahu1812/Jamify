const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const user = await User.create({ username, email, password });
    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { email, name, sub } = payload;
    
    let user = await User.findOne({ email });
    
    if (!user) {
      // Create user without password
      user = await User.create({
        username: name || `user_${sub.substring(0, 8)}`,
        email,
        password: '', // Optional now
      });
    }
    
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(401).json({ message: 'Invalid Google credential' });
  }
});

// Like a track
router.post('/like', async (req, res) => {
  try {
    const { userId, track } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Upsert Track to DB so it can be populated later
    const Track = require('../models/Track');
    await Track.findByIdAndUpdate(track._id, {
      _id: track._id,
      title: track.title,
      artist: track.artist,
      duration: track.duration,
      coverUrl: track.coverUrl,
      audioUrl: track.audioUrl
    }, { upsert: true });

    if (!user.likedSongs.includes(track._id)) {
      user.likedSongs.push(track._id);
      await user.save();
    }
    res.json({ success: true, likedSongs: user.likedSongs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Unlike a track
router.post('/unlike', async (req, res) => {
  try {
    const { userId, trackId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.likedSongs = user.likedSongs.filter(id => id.toString() !== trackId);
    await user.save();
    res.json({ success: true, likedSongs: user.likedSongs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get liked tracks
router.get('/:userId/likes', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate('likedSongs');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.likedSongs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
