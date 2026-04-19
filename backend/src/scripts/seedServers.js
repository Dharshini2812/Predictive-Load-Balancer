const mongoose = require('mongoose');
const Server = require('../models/Server');
require('dotenv').config();

const seedServers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/loadbalancer');
    
    // Clear existing servers
    await Server.deleteMany({});
    
    // Create sample servers
    const sampleServers = [
      {
        name: 'Server-Alpha',
        ipAddress: '192.168.1.10',
        port: 8080,
        status: 'active',
        capacity: {
          cpu: 100,
          memory: 16384,
          maxConnections: 1000
        },
        currentLoad: {
          cpu: 80,
          memory: 8192,
          connections: 79
        },
        weight: 1
      },
      {
        name: 'Server-Beta',
        ipAddress: '192.168.1.11',
        port: 8080,
        status: 'active',
        capacity: {
          cpu: 100,
          memory: 16384,
          maxConnections: 1000
        },
        currentLoad: {
          cpu: 81,
          memory: 12288,
          connections: 98
        },
        weight: 1
      },
      {
        name: 'Server-Gamma',
        ipAddress: '192.168.1.12',
        port: 8080,
        status: 'inactive',
        capacity: {
          cpu: 100,
          memory: 16384,
          maxConnections: 1000
        },
        currentLoad: {
          cpu: 83,
          memory: 4096,
          connections: 704
        },
        weight: 1
      }
    ];

    await Server.insertMany(sampleServers);
    console.log('Sample servers seeded successfully');
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding servers:', error);
    process.exit(1);
  }
};

seedServers();
