const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const connectDB = require('./utils/database');
const logger = require('./utils/logger');
const { isDemoMode, getDemoServers } = require('./utils/demoData');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3005",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3005"
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint (Available even if DB is down)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date(),
    dbConnected: mongoose.connection.readyState === 1
  });
});

// Import Routes
const serverRoutes = require('./routes/serverRoutes');
const loadRoutes = require('./routes/loadRoutes');
const predictionRoutes = require('./routes/predictionRoutes');

// Use Routes
app.use('/api/servers', serverRoutes);
app.use('/api/load', loadRoutes);
app.use('/api/predictions', predictionRoutes);

// Serve Static Frontend Files in Production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../public')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../public', 'index.html'));
  });
}

// Error Handling Middleware
app.use((err, req, res, next) => {
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

// Connect to Database and Start Server
const startServer = async () => {
  try {
    await connectDB();
    // Start monitoring service only after DB is connected
    require('./services/monitoringService');
    logger.info('Database connected and monitoring service started');
  } catch (err) {
    logger.error(`Database connection failed: ${err.message}`);
    logger.warn('Server will continue to run, but database features will be unavailable.');
  }

  const PORT = process.env.PORT || 5005;
  server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
};

// WebSocket for real-time updates
io.on('connection', (socket) => {
  logger.info(`New client connected: ${socket.id}`);
  
  socket.on('requestLoadData', () => {
      const interval = setInterval(async () => {
        try {
          // Only attempt to find servers if DB is connected or in Demo Mode
          if (mongoose.connection.readyState === 1 || isDemoMode()) {
            const servers = isDemoMode() ? getDemoServers() : await require('./models/Server').find({ status: 'active' });
            if (servers.length > 0) {
            const avgCpu = servers.reduce((sum, s) => sum + (s.currentLoad.cpu || 0), 0) / servers.length;
            const avgMem = servers.reduce((sum, s) => sum + (s.currentLoad.memory || 0), 0) / servers.length;
            const totalConn = servers.reduce((sum, s) => sum + (s.currentLoad.connections || 0), 0);
            const totalThroughput = servers.reduce((sum, s) => sum + (s.currentLoad.throughput || 0), 0);

            const loadData = {
              timestamp: new Date().toLocaleTimeString(),
              cpu: avgCpu,
              memory: avgMem,
              connections: totalConn,
              throughput: totalThroughput
            };
            socket.emit('loadUpdate', loadData);
          }
        }
      } catch (error) {
        logger.error(`Socket error: ${error.message}`);
      }
    }, 3000);
    
    socket.on('disconnect', () => {
      clearInterval(interval);
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });
});

startServer();
