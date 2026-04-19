const mongoose = require('mongoose');
const Server = require('./src/models/Server');
const LoadMetric = require('./src/models/LoadMetric');
const dotenv = require('dotenv');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/loadbalancer', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await Server.deleteMany({});
    await LoadMetric.deleteMany({});
    console.log('Cleared existing data.');

    // Add Servers
    const servers = [
      {
        name: 'Server-Alpha',
        ipAddress: '192.168.1.10',
        port: 8080,
        status: 'active',
        capacity: { cpu: 100, memory: 16384, maxConnections: 2000 },
        currentLoad: { cpu: 80, memory: 60, connections: 79 },
        weight: 1
      },
      {
        name: 'Server-Beta',
        ipAddress: '192.168.1.11',
        port: 8080,
        status: 'active',
        capacity: { cpu: 100, memory: 16384, maxConnections: 2000 },
        currentLoad: { cpu: 81, memory: 45, connections: 98 },
        weight: 1
      },
      {
        name: 'Server-Gamma',
        ipAddress: '192.168.1.12',
        port: 8080,
        status: 'inactive',
        capacity: { cpu: 100, memory: 8192, maxConnections: 1000 },
        currentLoad: { cpu: 83, memory: 55, connections: 704 },
        weight: 1
      }
    ];

    const createdServers = await Server.insertMany(servers);
    console.log(`Added ${createdServers.length} servers.`);

    // Add Historical Load Data (Last 24 hours, every hour)
    const metrics = [];
    const now = new Date();

    for (const server of createdServers) {
      for (let i = 24; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
        
        // Simulate a trend
        const baseCpu = 40 + Math.sin(i / 4) * 20;
        const cpu = Math.floor(Math.min(100, Math.max(0, baseCpu + Math.random() * 10)));
        const memory = Math.floor(Math.min(100, Math.max(0, 50 + Math.random() * 15)));
        const connections = Math.floor(Math.max(0, 500 + Math.sin(i / 2) * 200 + Math.random() * 50));
        
        metrics.push({
          serverId: server._id,
          timestamp,
          cpu,
          memory,
          connections,
          responseTime: Math.floor(20 + Math.random() * 50),
          throughput: Math.floor(5000 + Math.random() * 2000),
          loadScore: (cpu * 0.5) + (memory * 0.3) + (connections / 1000) * 0.2
        });
      }
    }

    await LoadMetric.insertMany(metrics);
    console.log(`Added ${metrics.length} historical load metrics.`);

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
