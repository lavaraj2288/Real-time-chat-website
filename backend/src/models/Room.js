const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 2,
      maxlength: 40
    },
    displayName: {
      type: String,
      trim: true
    },
    topic: {
      type: String,
      trim: true,
      default: 'A friendly place to chat'
    },
    createdBy: {
      type: String,
      default: 'system'
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Room', roomSchema);
