const express = require('express');
const router = express.Router();
const Room = require('../models/Room');

// Default rooms to seed automatically
const DEFAULT_ROOMS = [
  { name: 'general', displayName: 'General', topic: 'Company-wide & community banter', isDefault: true },
  { name: 'tech-talk', displayName: 'Tech Talk', topic: 'Coding, frameworks, and dev discussions', isDefault: true },
  { name: 'random', displayName: 'Random', topic: 'Memes, music, hobbies & casual fun', isDefault: true },
  { name: 'gaming', displayName: 'Gaming', topic: 'Console, PC, and mobile gaming squad', isDefault: true }
];

// Helper to seed default rooms
const seedDefaultRooms = async () => {
  try {
    for (const roomData of DEFAULT_ROOMS) {
      await Room.findOneAndUpdate(
        { name: roomData.name },
        { $setOnInsert: roomData },
        { upsert: true, new: true }
      );
    }
  } catch (error) {
    console.error('Error seeding default rooms:', error);
  }
};

// @route   GET /api/rooms
// @desc    Get all chat rooms
router.get('/', async (req, res) => {
  try {
    // Ensure default rooms exist
    await seedDefaultRooms();

    const rooms = await Room.find().sort({ isDefault: -1, createdAt: 1 });
    return res.json({ success: true, rooms });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve rooms' });
  }
});

// @route   POST /api/rooms
// @desc    Create a new chat room
router.post('/', async (req, res) => {
  try {
    const { name, displayName, topic, createdBy } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Room name is required' });
    }

    const cleanName = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    if (cleanName.length < 2 || cleanName.length > 40) {
      return res.status(400).json({
        success: false,
        message: 'Room name must be between 2 and 40 alphanumeric characters'
      });
    }

    const existingRoom = await Room.findOne({ name: cleanName });
    if (existingRoom) {
      return res.status(400).json({
        success: false,
        message: `Room #${cleanName} already exists`
      });
    }

    const newRoom = await Room.create({
      name: cleanName,
      displayName: displayName && displayName.trim() ? displayName.trim() : cleanName,
      topic: topic && topic.trim() ? topic.trim() : 'Discussion room',
      createdBy: createdBy || 'anonymous',
      isDefault: false
    });

    return res.status(201).json({ success: true, room: newRoom });
  } catch (error) {
    console.error('Error creating room:', error);
    return res.status(500).json({ success: false, message: 'Failed to create room' });
  }
});

// @route   GET /api/rooms/:name
// @desc    Get details for a single room
router.get('/:name', async (req, res) => {
  try {
    const roomName = req.params.name.toLowerCase().trim();
    const room = await Room.findOne({ name: roomName });

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    return res.json({ success: true, room });
  } catch (error) {
    console.error('Error getting room:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve room details' });
  }
});

module.exports = router;
module.exports.seedDefaultRooms = seedDefaultRooms;
