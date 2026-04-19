const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  serverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Server',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  predictions: [{
    predictedTime: Date,
    predictedCpu: Number,
    predictedMemory: Number,
    predictedConnections: Number,
    confidence: Number
  }],
  modelVersion: {
    type: String,
    default: '1.0'
  }
});

module.exports = mongoose.model('Prediction', predictionSchema);