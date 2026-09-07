const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    room: {
      type: String,
      required: true,
      index: true,
      lowercase: true,
      trim: true
    },
    sender: {
      username: {
        type: String,
        required: true,
        trim: true
      },
      avatarColor: {
        type: String,
        default: '#4F46E5'
      },
      isGuest: {
        type: Boolean,
        default: false
      }
    },
    text: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['chat', 'system'],
      default: 'chat'
    }
  },
  {
    timestamps: true
  }
);

// Index room and createdAt together for fast history lookups
messageSchema.index({ room: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
