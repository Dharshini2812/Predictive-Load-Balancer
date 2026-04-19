const mongoose = require('mongoose');

// In-memory storage for Demo Mode
let demoServers = [
  {
    _id: '640a1b2c3d4e5f6a7b8c9d01',
    name: 'Server-Alpha',
    ipAddress: '192.168.1.10',
    port: 8080,
    status: 'active',
    capacity: { cpu: 100, memory: 16384, maxConnections: 2000 },
    currentLoad: { cpu: 80, memory: 55, connections: 79, throughput: 1250 },
    weight: 1,
    createdAt: new Date()
  },
  {
    _id: '640a1b2c3d4e5f6a7b8c9d02',
    name: 'Server-Beta',
    ipAddress: '192.168.1.11',
    port: 8080,
    status: 'active',
    capacity: { cpu: 100, memory: 16384, maxConnections: 2000 },
    currentLoad: { cpu: 81, memory: 40, connections: 98, throughput: 980 },
    weight: 1,
    createdAt: new Date()
  },
  {
    _id: '640a1b2c3d4e5f6a7b8c9d03',
    name: 'Server-Gamma',
    ipAddress: '192.168.1.12',
    port: 8080,
    status: 'inactive',
    capacity: { cpu: 100, memory: 8192, maxConnections: 1000 },
    currentLoad: { cpu: 83, memory: 20, connections: 704, throughput: 450 },
    weight: 1,
    createdAt: new Date()
  }
];

let demoMetrics = [];

// Initialize demo metrics
const now = new Date();
demoServers.forEach(server => {
  for (let i = 24; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    const cpu = Math.floor(20 + Math.random() * 40);
    demoMetrics.push({
      _id: `metric_${server._id}_${i}`,
      serverId: server._id,
      timestamp,
      cpu,
      memory: Math.floor(30 + Math.random() * 30),
      connections: Math.floor(200 + Math.random() * 600),
      responseTime: Math.floor(10 + Math.random() * 40),
      throughput: Math.floor(1000 + Math.random() * 5000),
      loadScore: cpu * 0.7
    });
  }
});

const isDemoMode = () => mongoose.connection.readyState !== 1;

const getDemoServers = () => demoServers;

const getDemoMetrics = (serverId, hours = 24) => {
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
  return demoMetrics
    .filter(m => (!serverId || m.serverId.toString() === serverId.toString()) && m.timestamp >= cutoff)
    .sort((a, b) => a.timestamp - b.timestamp);
};

const addDemoServer = (serverData) => {
  const newServer = {
    ...serverData,
    _id: new mongoose.Types.ObjectId(),
    createdAt: new Date(),
    currentLoad: { cpu: 0, memory: 0, connections: 0, throughput: 0 }
  };
  demoServers.push(newServer);
  return newServer;
};

const updateDemoServerLoad = (serverId, loadData) => {
  const server = demoServers.find(s => s._id.toString() === serverId.toString());
  if (server) {
    server.currentLoad = { ...server.currentLoad, ...loadData };
    
    // Add to metrics history
    const newMetric = {
      _id: new mongoose.Types.ObjectId(),
      serverId: server._id,
      timestamp: new Date(),
      ...server.currentLoad,
      responseTime: Math.floor(10 + Math.random() * 50),
      loadScore: server.currentLoad.cpu * 0.7
    };
    demoMetrics.push(newMetric);
    // Keep last 1000 metrics to avoid memory leak
    if (demoMetrics.length > 1000) demoMetrics.shift();
    
    return server;
  }
  return null;
};

module.exports = {
  isDemoMode,
  getDemoServers,
  getDemoMetrics,
  addDemoServer,
  updateDemoServerLoad
};