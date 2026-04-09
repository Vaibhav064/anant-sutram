const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  planId: {
    type: String,
    required: true, // e.g. "anxiety_reset_psychologist"
  },
  planType: {
    type: String,
    enum: ['anxietyReset', 'subscription'],
    default: 'anxietyReset',
  },
  planName: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'success', // Mock: always success
  },
  paymentGateway: {
    type: String,
    default: 'mock',
  },
  gatewayOrderId: {
    type: String,
    default: null,
  },
}, { timestamps: true });

module.exports = mongoose.model('Purchase', purchaseSchema);
