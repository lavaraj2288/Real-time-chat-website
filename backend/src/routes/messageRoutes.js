const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// @route   GET /api/messages/:room
// @desc    Get chat history for a specific room
router.get('/:room', async (req, res) => {
  try {
    const roomName = req.params.room.toLowerCase().trim();
    const limit = parseInt(req.query.limit, 10) || 100;

    const messages = await Message.find({ room: roomName })
      .sort({ createdAt: 1 })
      .limit(limit);

    return res.json({
      success: true,
      room: roomName,
      count: messages.length,
      messages
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve chat history' });
  }
});

// @route   POST /api/messages
// @desc    Save a message (REST fallback)
router.post('/', async (req, res) => {
  try {
    const { room, sender, text } = req.body;

    if (!room || !sender || !text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Room, sender, and text are required' });
    }

    const newMessage = await Message.create({
      room: room.toLowerCase().trim(),
      sender: {
        username: sender.username,
        avatarColor: sender.avatarColor || '#4F46E5',
        isGuest: !!sender.isGuest
      },
      text: text.trim()
    });

    return res.status(201).json({ success: true, message: newMessage });
  } catch (error) {
    console.error('Error saving message:', error);
    return res.status(500).json({ success: false, message: 'Failed to save message' });
  }
});

module.exports = router;
