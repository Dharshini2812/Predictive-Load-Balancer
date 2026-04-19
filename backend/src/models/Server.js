const mongoose = require('mongoose');

const serverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  port: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active'
  },
  capacity: {
    cpu: { type: Number, required: true, default: 100 },
    memory: { type: Number, required: true, default: 16384 },
    maxConnections: { type: Number, required: true, default: 1000 }
  },
  currentLoad: {
    cpu: { type: Number, default: 0 },
    memory: { type: Number, default: 0 },
    connections: { type: Number, default: 0 },
    throughput: { type: Number, default: 0 }
  },
  weight: {
    type: Number,
    default: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Server', serverSchema);