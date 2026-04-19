import React, { useState, useEffect } from 'react';
import { 
  Paper, Typography, Box, FormControl, InputLabel, Select, 
  MenuItem, Grid, useTheme, Card, CardContent, Button, Divider
} from '@mui/material';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import api from '../../services/api';
import DownloadIcon from '@mui/icons-material/Download';

const LoadChart = () => {
  const theme = useTheme();
  const [historyData, setHistoryData] = useState([]);
  const [selectedServer, setSelectedServer] = useState('');
  const [servers, setServers] = useState([]);
  const [hours, setHours] = useState(24);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchServers();
  }, []);

  useEffect(() => {
    if (selectedServer) {
      fetchHistory();
    }
  }, [selectedServer, hours]);

  const fetchServers = async () => {
    try {
      const data = await api.getServers();
      setServers(data);
      if (data.length > 0 && !selectedServer) {
        setSelectedServer(data[0]._id);
      }
    } catch (error) {
      console.error('Error fetching servers:', error);
    }
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await api.getLoadHistory(selectedServer, hours);
      const formattedData = data.map(item => ({
        time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        cpu: Math.round(item.cpu),
        memory: Math.round(item.memory),
        connections: item.connections,
        loadScore: parseFloat(item.loadScore.toFixed(2))
      }));
      setHistoryData(formattedData);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
    setLoading(false);
  };

  const handleExportData = () => {
    if (historyData.length === 0) return;
    
    const dataStr = JSON.stringify(historyData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    const selectedServerObj = servers.find(s => s._id === selectedServer);
    link.download = `load_history_${selectedServerObj?.name || 'server'}_${new Date().toISOString()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const selectedServerObj = servers.find(s => s._id === selectedServer);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ mb: 1 }}>Historical Analysis</Typography>
          <Typography variant="body2" color="textSecondary">
            Review past performance metrics to identify patterns and anomalies.
          </Typography>
        </Box>
        <Button 
          variant="outlined" 
          startIcon={<DownloadIcon />} 
          onClick={handleExportData}
          disabled={historyData.length === 0}
        >
          Export JSON
        </Button>
      </Box>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Filters</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Select Server</InputLabel>
                  <Select 
                    value={selectedServer} 
                    onChange={(e) => setSelectedServer(e.target.value)} 
                    label="Select Server"
                  >
                    {servers.map(server => (
                      <MenuItem key={server._id} value={server._id}>{server.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Time Range</InputLabel>
                  <Select 
                    value={hours} 
                    onChange={(e) => setHours(e.target.value)} 
                    label="Time Range"
                  >
                    <MenuItem value={1}>Last 1 Hour</MenuItem>
                    <MenuItem value={6}>Last 6 Hours</MenuItem>
                    <MenuItem value={12}>Last 12 Hours</MenuItem>
                    <MenuItem value={24}>Last 24 Hours</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Statistics Summary</Typography>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="caption" color="textSecondary">Avg CPU</Typography>
                <Typography variant="h6">
                  {historyData.length > 0 
                    ? (historyData.reduce((s, d) => s + d.cpu, 0) / historyData.length).toFixed(1) 
                    : 0}%
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="caption" color="textSecondary">Peak Load</Typography>
                <Typography variant="h6">
                  {historyData.length > 0 ? Math.max(...historyData.map(d => d.cpu)) : 0}%
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="caption" color="textSecondary">Data Points</Typography>
                <Typography variant="h6">{historyData.length}</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 4 }}>Resource Utilization Over Time</Typography>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={historyData}>
            <defs>
              <linearGradient id="colorCpuHist" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.2}/>
                <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="time" stroke={theme.palette.text.secondary} fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke={theme.palette.text.secondary} fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: theme.palette.background.paper, 
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8
              }} 
            />
            <Legend verticalAlign="bottom" align="center" iconType="circle" />
            <Area 
              type="monotone" 
              dataKey="cpu" 
              stroke={theme.palette.primary.main} 
              fillOpacity={1} 
              fill="url(#colorCpuHist)" 
              name="CPU %"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
};

export default LoadChart;
