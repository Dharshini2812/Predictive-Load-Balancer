const Server = require('../models/Server');
const LoadMetric = require('../models/LoadMetric');
const cron = require('node-cron');
const { isDemoMode, getDemoServers, updateDemoServerLoad } = require('../utils/demoData');

class MonitoringService {
  constructor() {
    this.startMonitoring();
  }
  
  startMonitoring() {
    // Run immediately on start
    this.collectMetrics();
    
    // Run every minute
    cron.schedule('* * * * *', async () => {
      await this.collectMetrics();
      await this.checkHealth();
    });
  }
  
  async collectMetrics() {
    try {
      const servers = isDemoMode() ? getDemoServers() : await Server.find();
      console.log(`[INFO] Collecting metrics from ${servers.length} servers (${isDemoMode() ? 'Demo Mode' : 'DB Mode'})`);
      
      for (const server of servers) {
        const metrics = await this.simulateMetricsCollection(server);
        
        if (isDemoMode()) {
          updateDemoServerLoad(server._id, metrics);
          continue;
        }

        const loadMetric = new LoadMetric({
          serverId: server._id,
          cpu: metrics.cpu,
          memory: metrics.memory,
          connections: metrics.connections,
          responseTime: metrics.responseTime,
          throughput: metrics.throughput,
          loadScore: (metrics.cpu * 0.5) + (metrics.memory * 0.3) + (metrics.connections / 1000) * 0.2
        });
        
        await loadMetric.save();
        
        server.currentLoad = {
          cpu: metrics.cpu,
          memory: metrics.memory,
          connections: metrics.connections,
          throughput: metrics.throughput
        };
        await server.save();
      }
    } catch (error) {
      console.error('[ERROR] Error collecting metrics:', error);
    }
  }
  
  async simulateMetricsCollection(server) {
    return {
      cpu: Math.floor(Math.random() * 100),
      memory: Math.floor(Math.random() * 100),
      connections: Math.floor(Math.random() * 1000),
      responseTime: Math.floor(Math.random() * 200),
      throughput: Math.floor(Math.random() * 10000)
    };
  }
  
  async checkHealth() {
    try {
      const servers = await Server.find();
      
      for (const server of servers) {
        if (server.currentLoad.cpu > 90) {
          console.warn(`Warning: Server ${server.name} CPU overload: ${server.currentLoad.cpu}%`);
        }
        
        if (server.currentLoad.memory > 90) {
          console.warn(`Warning: Server ${server.name} Memory overload: ${server.currentLoad.memory}%`);
        }
      }
    } catch (error) {
      console.error('[ERROR] Error checking health:', error);
    }
  }
  
  async getServerHealth(serverId) {
    try {
      const server = await Server.findById(serverId);
      const recentMetrics = await LoadMetric.find({ serverId })
        .sort({ timestamp: -1 })
        .limit(10);
      
      if (recentMetrics.length === 0) return { isHealthy: true };
      
      const avgCpu = recentMetrics.reduce((sum, m) => sum + m.cpu, 0) / recentMetrics.length;
      
      return {
        server: server.name,
        status: server.status,
        currentLoad: server.currentLoad,
        averageCpuLast10: avgCpu,
        isHealthy: avgCpu < 80 && server.currentLoad.cpu < 90
      };
    } catch (error) {
      console.error('[ERROR] Error getting server health:', error);
      return { isHealthy: false };
    }
  }
}

module.exports = new MonitoringService();
