import React, { useState, useEffect } from 'react';
import { Grid, Paper, Typography, Box, LinearProgress, Card, CardContent, useTheme, Chip } from '@mui/material';
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import io from 'socket.io-client';
import api from '../../services/api';

const Dashboard = () => {
  const theme = useTheme();
  const [loadData, setLoadData] = useState([]);
  const [servers, setServers] = useState([]);
  const [socketStatus, setSocketStatus] = useState('connecting');
  const [systemHealth, setSystemHealth] = useState({
    totalServers: 0,
    activeServers: 0,
    averageLoad: 0,
    totalRequests: 0,
    peakLoad: 0,
    totalThroughput: 0
  });

  useEffect(() => {
    const socketUrl = process.env.NODE_ENV === 'production'
      ? window.location.origin
      : (process.env.REACT_APP_SOCKET_URL || 'http://localhost:5005');
      
    const socket = io(socketUrl);
    
    socket.on('connect', () => {
      setSocketStatus('connected');
      socket.emit('requestLoadData');
    });

    socket.on('disconnect', () => {
      setSocketStatus('disconnected');
    });

    socket.on('connect_error', () => {
      setSocketStatus('error');
    });
    
    socket.on('loadUpdate', (data) => {
      const newDataPoint = {
        timestamp: new Date().toLocaleTimeString(),
        cpu: data.cpu || 0,
        memory: data.memory || 0,
        connections: data.connections || 0,
        throughput: data.throughput || 0
      };
      
      setLoadData(prev => {
        const updated = [...prev, newDataPoint];
        return updated.slice(-20);
      });
    });
    
    fetchInitialData();
    const interval = setInterval(fetchInitialData, 5000);
    
    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
  }, []);
  
  const fetchInitialData = async () => {
    try {
      const health = await api.getSystemHealth();
      setSystemHealth(health);
      
      const serverList = await api.getServers();
      setServers(serverList);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };
  
  const StatCard = ({ title, value, subtitle, color, progress }) => (
    <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
      <CardContent>
        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h3" sx={{ color: color || 'primary.main', fontWeight: 800, my: 1 }}>
          {value}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          {subtitle}
        </Typography>
        {progress !== undefined && (
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ 
              mt: 2, 
              height: 6, 
              borderRadius: 3,
              bgcolor: 'rgba(255,255,255,0.05)',
              '& .MuiLinearProgress-bar': {
                bgcolor: color || 'primary.main'
              }
            }} 
          />
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" sx={{ mb: 1 }}>System Overview</Typography>
          <Typography variant="body2" color="textSecondary">
            Real-time performance monitoring and health status of your predictive load balancer.
          </Typography>
        </Box>
        <Chip 
          label={socketStatus.toUpperCase()} 
          color={socketStatus === 'connected' ? 'success' : socketStatus === 'error' ? 'error' : 'warning'} 
          variant="outlined"
          size="small"
          sx={{ fontWeight: 'bold' }}
        />
      </Box>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Active Servers" 
            value={`${systemHealth.activeServers}/${systemHealth.totalServers}`}
            subtitle="Operational infrastructure"
            color={theme.palette.success.main}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Average CPU Load" 
            value={`${systemHealth.averageLoad?.toFixed(1)}%`}
            subtitle="Current system-wide utilization"
            progress={systemHealth.averageLoad}
            color={systemHealth.averageLoad > 80 ? theme.palette.error.main : systemHealth.averageLoad > 50 ? theme.palette.warning.main : theme.palette.primary.main}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Requests" 
            value={systemHealth.totalRequests}
            subtitle="Active traffic volume"
            color={theme.palette.info.main}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Throughput" 
            value={`${(systemHealth.totalThroughput / 1024).toFixed(2)} MB/s`}
            subtitle="Combined network traffic"
            color={theme.palette.secondary.main}
          />
        </Grid>
      </Grid>
      
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 3 }}>Live System Performance</Typography>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={loadData}>
                <defs>
                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="timestamp" stroke={theme.palette.text.secondary} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={theme.palette.text.secondary} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme.palette.background.paper, 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8
                  }} 
                />
                <Legend iconType="circle" />
                <Area 
                  type="monotone" 
                  dataKey="cpu" 
                  stroke={theme.palette.primary.main} 
                  fillOpacity={1} 
                  fill="url(#colorCpu)" 
                  name="CPU %"
                  strokeWidth={3}
                />
                <Area 
                  type="monotone" 
                  dataKey="memory" 
                  stroke={theme.palette.secondary.main} 
                  fill="transparent"
                  strokeDasharray="5 5"
                  name="Memory %"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 4 }}>Server Load Distribution</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {servers.map(server => (
                <Box key={server._id}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">{server.name}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {server.currentLoad?.cpu || 0}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={server.currentLoad?.cpu || 0} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      bgcolor: 'rgba(255,255,255,0.05)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        bgcolor: (server.currentLoad?.cpu || 0) > 80 ? 'error.main' : 
                                 (server.currentLoad?.cpu || 0) > 60 ? 'warning.main' : 'primary.main'
                      }
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
