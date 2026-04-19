const Server = require('../models/Server');
const predictionService = require('./predictionService');

class LoadBalancer {
  constructor() {
    this.algorithm = 'weighted-round-robin';
    this.currentServerIndex = 0;
  }

  // Get the best server for new connections
  async getOptimalServer() {
    try {
      const servers = await Server.find({ status: 'active' });
      
      if (servers.length === 0) {
        throw new Error('No active servers available');
      }

      // Use prediction service to get optimal server
      const optimalServer = await predictionService.getOptimalServer();
      return optimalServer;
    } catch (error) {
      throw new Error(`Load balancer error: ${error.message}`);
    }
  }

  // Distribute load using weighted round robin
  async distributeLoad() {
    try {
      const servers = await Server.find({ status: 'active' });
      
      if (servers.length === 0) {
        return [];
      }

      // Calculate server weights based on current load
      const weightedServers = servers.map(server => {
        const cpuUtilization = server.currentLoad.cpu / server.capacity.cpu;
        const memoryUtilization = server.currentLoad.memory / server.capacity.memory;
        const connectionUtilization = server.currentLoad.connections / server.capacity.maxConnections;
        
        // Calculate effective weight (inverse of load utilization)
        const totalUtilization = (cpuUtilization + memoryUtilization + connectionUtilization) / 3;
        const effectiveWeight = Math.max(0.1, 1 - totalUtilization) * server.weight;
        
        return {
          server,
          weight: effectiveWeight,
          utilization: totalUtilization
        };
      });

      // Sort by weight (highest first)
      weightedServers.sort((a, b) => b.weight - a.weight);
      
      return weightedServers;
    } catch (error) {
      throw new Error(`Load distribution error: ${error.message}`);
    }
  }

  // Update server load metrics
  async updateServerLoad(serverId, loadData) {
    try {
      const server = await Server.findById(serverId);
      if (!server) {
        throw new Error('Server not found');
      }

      server.currentLoad = {
        cpu: loadData.cpu || server.currentLoad.cpu,
        memory: loadData.memory || server.currentLoad.memory,
        connections: loadData.connections || server.currentLoad.connections
      };

      await server.save();
      return server;
    } catch (error) {
      throw new Error(`Load update error: ${error.message}`);
    }
  }

  // Get load balancer statistics
  async getStatistics() {
    try {
      const servers = await Server.find();
      const activeServers = servers.filter(s => s.status === 'active');
      
      const totalCapacity = activeServers.reduce((acc, server) => ({
        cpu: acc.cpu + server.capacity.cpu,
        memory: acc.memory + server.capacity.memory,
        connections: acc.connections + server.capacity.maxConnections
      }), { cpu: 0, memory: 0, connections: 0 });

      const totalLoad = activeServers.reduce((acc, server) => ({
        cpu: acc.cpu + server.currentLoad.cpu,
        memory: acc.memory + server.currentLoad.memory,
        connections: acc.connections + server.currentLoad.connections
      }), { cpu: 0, memory: 0, connections: 0 });

      return {
        totalServers: servers.length,
        activeServers: activeServers.length,
        totalCapacity,
        totalLoad,
        averageUtilization: {
          cpu: totalCapacity.cpu > 0 ? (totalLoad.cpu / totalCapacity.cpu) * 100 : 0,
          memory: totalCapacity.memory > 0 ? (totalLoad.memory / totalCapacity.memory) * 100 : 0,
          connections: totalCapacity.connections > 0 ? (totalLoad.connections / totalCapacity.connections) * 100 : 0
        }
      };
    } catch (error) {
      throw new Error(`Statistics error: ${error.message}`);
    }
  }
}

module.exports = new LoadBalancer();