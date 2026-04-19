const mongoose = require('mongoose');

const loadMetricSchema = new mongoose.Schema({
  serverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Server',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  cpu: {
    type: Number,
    required: true
  },
  memory: {
    type: Number,
    required: true
  },
  connections: {
    type: Number,
    required: true
  },
  responseTime: {
    type: Number,
    required: true
  },
  throughput: {
    type: Number
  },
  loadScore: {
    type: Number,
    required: true
  }
});

loadMetricSchema.index({ serverId: 1, timestamp: -1 });

module.exports = mongoose.model('LoadMetric', loadMetricSchema);