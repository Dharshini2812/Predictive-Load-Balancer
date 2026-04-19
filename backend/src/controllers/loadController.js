const LoadMetric = require('../models/LoadMetric');
const Server = require('../models/Server');
const { isDemoMode, getDemoServers, getDemoMetrics } = require('../utils/demoData');

const getCurrentLoad = async (req, res) => {
  try {
    const servers = isDemoMode() ? getDemoServers() : await Server.find();
    const loads = servers.map(server => ({
      serverId: server._id,
      serverName: server.name,
      currentLoad: server.currentLoad
    }));
    res.json(loads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getLoadHistory = async (req, res) => {
  try {
    const { serverId, hours = 24 } = req.query;
    
    if (isDemoMode()) {
      return res.json(getDemoMetrics(serverId, hours));
    }
    
    const query = {};
    if (serverId) query.serverId = serverId;
    
    const metrics = await LoadMetric.find(query)
      .where('timestamp').gte(new Date(Date.now() - hours * 60 * 60 * 1000))
      .sort({ timestamp: 1 });
    
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSystemHealth = async (req, res) => {
  try {
    const servers = isDemoMode() ? getDemoServers() : await Server.find();
    const activeServers = servers.filter(s => s.status === 'active');
    const totalLoad = servers.reduce((sum, s) => sum + (s.currentLoad.cpu || 0), 0);
    const averageLoad = servers.length ? totalLoad / servers.length : 0;
    
    const totalThroughput = servers.reduce((sum, s) => sum + (s.currentLoad.throughput || 0), 0);
    
    res.json({
      totalServers: servers.length,
      activeServers: activeServers.length,
      averageLoad: averageLoad,
      totalRequests: Math.floor(Math.random() * 1000),
      peakLoad: servers.length ? Math.max(...servers.map(s => s.currentLoad.cpu || 0)) : 0,
      totalThroughput: totalThroughput
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getCurrentLoad,
  getLoadHistory,
  getSystemHealth
};
