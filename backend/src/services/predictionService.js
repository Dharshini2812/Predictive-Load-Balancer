const ss = require('simple-statistics');
const LoadMetric = require('../models/LoadMetric');

class PredictionService {
  async predictLoad(serverId, hours = 1) {
    try {
      const historicalData = await LoadMetric.find({
        serverId: serverId,
        timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }).sort({ timestamp: 1 });
      
      if (historicalData.length < 10) {
        return this.getDefaultPrediction(hours);
      }
      
      const cpuLoads = historicalData.map(d => d.cpu);
      const memoryLoads = historicalData.map(d => d.memory);
      const connectionLoads = historicalData.map(d => d.connections);
      
      const cpuTrend = this.calculateTrend(cpuLoads);
      const memoryTrend = this.calculateTrend(memoryLoads);
      const connectionTrend = this.calculateTrend(connectionLoads);
      
      const predictions = [];
      const intervals = hours * 12;
      
      for (let i = 1; i <= intervals; i++) {
        predictions.push({
          timestamp: new Date(Date.now() + i * 5 * 60 * 1000),
          predictedCpu: Math.min(100, Math.max(0, cpuLoads[cpuLoads.length - 1] + cpuTrend.slope * i)),
          predictedMemory: Math.min(100, Math.max(0, memoryLoads[memoryLoads.length - 1] + memoryTrend.slope * i)),
          predictedConnections: Math.max(0, connectionLoads[connectionLoads.length - 1] + connectionTrend.slope * i),
          confidence: this.calculateConfidence(historicalData)
        });
      }
      
      return predictions;
    } catch (error) {
      console.error('Prediction error:', error);
      return this.getDefaultPrediction(hours);
    }
  }
  
  calculateTrend(data) {
    const points = data.map((y, x) => [x, y]);
    const line = ss.linearRegression(points);
    return {
      slope: line.m,
      intercept: line.b
    };
  }
  
  calculateConfidence(historicalData) {
    const loads = historicalData.map(d => d.loadScore);
    const variance = ss.variance(loads);
    return Math.max(0, Math.min(1, 1 - (variance / 100)));
  }
  
  getDefaultPrediction(hours = 1) {
    const predictions = [];
    const intervals = hours * 12;
    
    for (let i = 1; i <= intervals; i++) {
      predictions.push({
        timestamp: new Date(Date.now() + i * 5 * 60 * 1000),
        predictedCpu: 50 + Math.sin(i / 10) * 20,
        predictedMemory: 45 + Math.cos(i / 8) * 15,
        predictedConnections: 500 + Math.sin(i / 5) * 200,
        confidence: 0.5
      });
    }
    
    return predictions;
  }
  
  async getOptimalServer(predictedLoad = {}) {
    const Server = require('../models/Server');
    const servers = await Server.find({ status: 'active' });
    
    if (servers.length === 0) return null;

    let bestServer = null;
    let minLoadScore = Infinity;
    
    for (const server of servers) {
      // Use current CPU if predicted isn't available
      const currentCpu = (server.currentLoad && server.currentLoad.cpu) || 0;
      const cpuToUse = predictedLoad.predictedCpu !== undefined ? predictedLoad.predictedCpu : currentCpu;
      
      const serverCpuCapacity = (server.capacity && server.capacity.cpu) || 100;
      const predictedServerLoad = cpuToUse / (serverCpuCapacity / 100);
      
      if (predictedServerLoad < minLoadScore) {
        minLoadScore = predictedServerLoad;
        bestServer = server;
      }
    }
    
    return bestServer;
  }
}

module.exports = new PredictionService();