const predictionService = require('../services/predictionService');
const Server = require('../models/Server');
const { isDemoMode, getDemoServers } = require('../utils/demoData');

const getPredictions = async (req, res) => {
  try {
    const { serverId } = req.params;
    const hours = parseInt(req.query.hours) || 1;
    
    if (isDemoMode()) {
      const server = getDemoServers().find(s => s._id.toString() === serverId);
      if (!server) return res.status(404).json({ error: 'Server not found' });
      const predictions = await predictionService.predictLoad(serverId, hours);
      return res.json(predictions);
    }
    
    const server = await Server.findById(serverId);
    if (!server) {
      return res.status(404).json({ error: 'Server not found' });
    }
    
    const predictions = await predictionService.predictLoad(serverId, hours);
    res.json(predictions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllServerPredictions = async (req, res) => {
  try {
    const servers = isDemoMode() ? getDemoServers() : await Server.find({ status: 'active' });
    const allPredictions = {};
    
    for (const server of servers) {
      allPredictions[server._id] = await predictionService.predictLoad(server._id, 1);
    }
    
    res.json(allPredictions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getOptimalServer = async (req, res) => {
  try {
    const optimalServer = await predictionService.getOptimalServer({});
    res.json(optimalServer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getPredictions,
  getAllServerPredictions,
  getOptimalServer
};
