const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  healerId: {
    type: String,
    required: true,
  },
  healerName: {
    type: String,
    required: true,
  },
  sessionType: {
    type: String,
    required: true, // "Quick Check-in", "Deep Healing Session", etc.
  },
  duration: {
    type: String,
    required: true, // "15 min", "45 min"
  },
  price: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending',
  },
  scheduledAt: {
    type: Date,
    default: null,
  },
  notes: {
    type: String,
    default: '',
  },
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
