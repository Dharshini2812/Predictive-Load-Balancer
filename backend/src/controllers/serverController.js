const Server = require('../models/Server');
const { isDemoMode, getDemoServers, addDemoServer } = require('../utils/demoData');

const getAllServers = async (req, res) => {
  try {
    if (isDemoMode()) {
      return res.json(getDemoServers());
    }
    const servers = await Server.find();
    res.json(servers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getServerById = async (req, res) => {
  try {
    if (isDemoMode()) {
      const server = getDemoServers().find(s => s._id.toString() === req.params.id);
      return server ? res.json(server) : res.status(404).json({ error: 'Server not found' });
    }
    const server = await Server.findById(req.params.id);
    if (!server) {
      return res.status(404).json({ error: 'Server not found' });
    }
    res.json(server);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addServer = async (req, res) => {
  console.log('Backend: addServer controller started');
  console.log('Request body:', req.body);
  try {
    if (isDemoMode()) {
      const server = addDemoServer(req.body);
      return res.status(201).json(server);
    }
    const server = new Server(req.body);
    console.log('Server model instance created');
    await server.save();
    console.log('Server saved successfully:', server);
    res.status(201).json(server);
  } catch (error) {
    console.error('Backend: Error in addServer controller:', error);
    res.status(400).json({ error: error.message });
  }
};

const updateServerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const server = await Server.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    
    if (!server) {
      return res.status(404).json({ error: 'Server not found' });
    }
    
    res.json(server);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteServer = async (req, res) => {
  try {
    const server = await Server.findByIdAndDelete(req.params.id);
    if (!server) {
      return res.status(404).json({ error: 'Server not found' });
    }
    res.json({ message: 'Server deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllServers,
  getServerById,
  addServer,
  updateServerStatus,
  deleteServer
};
