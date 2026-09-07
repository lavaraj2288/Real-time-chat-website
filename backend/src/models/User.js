const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 2,
      maxlength: 30
    },
    password: {
      type: String,
      required: function () {
        return !this.isGuest;
      }
    },
    isGuest: {
      type: Boolean,
      default: false
    },
    avatarColor: {
      type: String,
      default: function () {
        const colors = [
          '#4F46E5', '#7C3AED', '#2563EB', '#0D9488',
          '#059669', '#D97706', '#DC2626', '#DB2777'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
      }
    },
    lastActive: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('User', userSchema);
