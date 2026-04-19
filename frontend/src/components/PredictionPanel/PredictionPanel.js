import React, { useState, useEffect } from 'react';
import { 
  Paper, Typography, Grid, Card, CardContent, LinearProgress, 
  Box, FormControl, InputLabel, Select, MenuItem, useTheme, Chip
} from '@mui/material';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  Area, ComposedChart, Line, ReferenceLine
} from 'recharts';
import api from '../../services/api';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

const PredictionPanel = () => {
  const theme = useTheme();
  const [predictions, setPredictions] = useState([]);
  const [selectedServer, setSelectedServer] = useState('');
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchServers();
  }, []);

  useEffect(() => {
    if (selectedServer) {
      fetchPredictions();
    }
  }, [selectedServer]);

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

  const fetchPredictions = async () => {
    if (!selectedServer) return;
    setLoading(true);
    try {
      const data = await api.getPredictions(selectedServer, 2);
      const formattedData = data.map(pred => ({
        time: new Date(pred.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        cpu: Math.round(pred.predictedCpu),
        memory: Math.round(pred.predictedMemory),
        connections: Math.round(pred.predictedConnections),
        confidence: Math.round(pred.confidence * 100)
      }));
      setPredictions(formattedData);
    } catch (error) {
      console.error('Error fetching predictions:', error);
    }
    setLoading(false);
  };

  const selectedServerObj = servers.find(s => s._id === selectedServer);
  const isIncreasing = predictions.length > 1 && predictions[predictions.length - 1].cpu > predictions[0].cpu;

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1 }}>Predictive Analysis</Typography>
        <Typography variant="body2" color="textSecondary">
          AI-driven load forecasting to anticipate resource demands.
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} lg={3}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Configuration</Typography>
              <FormControl fullWidth size="small">
                <InputLabel>Select Server</InputLabel>
                <Select 
                  value={selectedServer} 
                  onChange={(e) => setSelectedServer(e.target.value)} 
                  label="Select Server"
                  sx={{ borderRadius: 2 }}
                >
                  {servers.map(server => (
                    <MenuItem key={server._id} value={server._id}>{server.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              {selectedServerObj && (
                <Card sx={{ mt: 3, bgcolor: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="overline" color="textSecondary">Current Status</Typography>
                    <Box sx={{ mt: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">CPU</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedServerObj.currentLoad?.cpu || 0}%</Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={selectedServerObj.currentLoad?.cpu || 0} 
                        sx={{ height: 4, borderRadius: 2, mb: 2 }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              )}
            </Paper>

            <Paper sx={{ p: 3, bgcolor: isIncreasing ? 'rgba(244, 67, 54, 0.05)' : 'rgba(76, 175, 80, 0.05)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                {isIncreasing ? <TrendingUpIcon color="error" /> : <TrendingDownIcon color="success" />}
                <Typography variant="h6">Trend Analysis</Typography>
              </Box>
              <Typography variant="body2" color="textSecondary">
                {isIncreasing 
                  ? "Load is projected to increase. Consider scaling resources." 
                  : "Load is projected to remain stable or decrease."}
              </Typography>
            </Paper>
          </Box>
        </Grid>

        <Grid item xs={12} lg={9}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Typography variant="h6">Load Forecast (Next 2 Hours)</Typography>
              <Chip 
                label={`Confidence: ${predictions[0]?.confidence || 0}%`} 
                variant="outlined" 
                size="small" 
                sx={{ 
                  color: '#4db6ac', 
                  borderColor: 'rgba(77, 182, 172, 0.5)',
                  bgcolor: 'rgba(77, 182, 172, 0.05)'
                }}
              />
            </Box>
            
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={predictions}>
                <defs>
                  <linearGradient id="colorCpuPred" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.1}/>
                    <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="time" stroke={theme.palette.text.secondary} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={theme.palette.text.secondary} fontSize={12} tickLine={false} axisLine={false} domain={[0, 120]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme.palette.background.paper, 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8
                  }} 
                />
                <Legend verticalAlign="bottom" align="center" iconType="circle" />
                {predictions.length > 0 && (
                  <ReferenceLine x={predictions[Math.floor(predictions.length / 3)]?.time} stroke="rgba(255,255,255,0.2)" />
                )}
                <Area 
                  type="monotone" 
                  dataKey="cpu" 
                  fill="url(#colorCpuPred)" 
                  stroke={theme.palette.primary.main} 
                  strokeWidth={2}
                  name="Predicted CPU %"
                />
                <Line 
                  type="monotone" 
                  dataKey="connections" 
                  stroke={theme.palette.secondary.main} 
                  strokeWidth={2}
                  dot={{ r: 4, fill: theme.palette.secondary.main }}
                  name="Predicted Connections"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PredictionPanel;
