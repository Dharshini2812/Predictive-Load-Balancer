import React, { useState, useEffect } from 'react';
import { 
  Grid, Paper, Typography, Card, CardContent, Box, Chip, 
  LinearProgress, IconButton, Button, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, useTheme, Divider 
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import WarningIcon from '@mui/icons-material/Warning';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import BuildIcon from '@mui/icons-material/Build';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import api from '../../services/api';

const ServerMonitor = () => {
  const theme = useTheme();
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newServer, setNewServer] = useState({
    name: '',
    ipAddress: '',
    port: 80,
    weight: 1
  });

  useEffect(() => {
    fetchServers();
    const interval = setInterval(fetchServers, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchServers = async () => {
    try {
      const data = await api.getServers();
      setServers(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching servers:', error);
      setLoading(false);
    }
  };

  const handleAddServer = async () => {
    if (!newServer.name || !newServer.ipAddress) {
      return;
    }
    try {
      const payload = {
        name: newServer.name,
        ipAddress: newServer.ipAddress,
        port: parseInt(newServer.port) || 80,
        weight: parseInt(newServer.weight) || 1,
        capacity: { cpu: 100, memory: 16384, maxConnections: 1000 }
      };
      await api.addServer(payload);
      setOpenAddDialog(false);
      setNewServer({ name: '', ipAddress: '', port: 80, weight: 1 });
      fetchServers();
    } catch (error) {
      console.error('Error adding server:', error);
    }
  };

  const handleDeleteServer = async (id) => {
    if (window.confirm('Are you sure you want to delete this server?')) {
      try {
        await api.deleteServer(id);
        fetchServers();
      } catch (error) {
        console.error('Error deleting server:', error);
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'maintenance' : 'active';
      await api.updateServerStatus(id, newStatus);
      fetchServers();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusColor = (load) => {
    if (load > 80) return theme.palette.error.main;
    if (load > 60) return theme.palette.warning.main;
    return theme.palette.success.main;
  };

  const filteredServers = servers.filter(server => 
    server.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    server.ipAddress.includes(searchTerm)
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ mb: 1 }}>Server Infrastructure</Typography>
          <Typography variant="body2" color="textSecondary">Manage and monitor your cluster nodes.</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField 
            size="small" 
            placeholder="Search servers..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: 250 }}
          />
          <Button 
            variant="contained" 
            color="secondary"
            startIcon={<RefreshIcon />}
            onClick={fetchServers}
            sx={{ borderRadius: 2 }}
          >
            Refresh
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => {
              console.log('Opening Add Dialog');
              setOpenAddDialog(true);
            }}
            sx={{ borderRadius: 2 }}
          >
            Add Server
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {filteredServers.map((server) => (
          <Grid item xs={12} md={6} lg={4} key={server._id}>
            <Card sx={{ 
              border: '1px solid rgba(255, 255, 255, 0.05)',
              '&:hover': { borderColor: 'primary.main', transform: 'translateY(-4px)' },
              transition: 'all 0.3s ease'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">{server.name}</Typography>
                  <Chip 
                    label={server.status.toUpperCase()} 
                    size="small" 
                    color={server.status === 'active' ? 'success' : 'warning'}
                    sx={{ fontWeight: 600, fontSize: '0.65rem' }}
                  />
                </Box>
                
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                  {server.ipAddress}:{server.port}
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption">CPU Load</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>{server.currentLoad?.cpu || 0}%</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={server.currentLoad?.cpu || 0} 
                    sx={{ 
                      height: 6, 
                      borderRadius: 3,
                      mb: 2,
                      '& .MuiLinearProgress-bar': { bgcolor: getStatusColor(server.currentLoad?.cpu) }
                    }}
                  />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption">Memory</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>{server.currentLoad?.memory ? Math.round((server.currentLoad.memory / server.capacity.memory) * 100) : 0}%</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={server.currentLoad?.memory ? (server.currentLoad.memory / server.capacity.memory) * 100 : 0} 
                    sx={{ 
                      height: 6, 
                      borderRadius: 3,
                      mb: 2,
                      bgcolor: 'rgba(255,255,255,0.05)',
                      '& .MuiLinearProgress-bar': { bgcolor: 'secondary.main' }
                    }}
                  />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption">Connections</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>{server.currentLoad?.connections || 0} / {server.capacity.maxConnections}</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={server.currentLoad?.connections ? (server.currentLoad.connections / server.capacity.maxConnections) * 100 : 0} 
                    sx={{ 
                      height: 6, 
                      borderRadius: 3,
                      bgcolor: 'rgba(255,255,255,0.05)',
                      '& .MuiLinearProgress-bar': { bgcolor: 'info.main' }
                    }}
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Box>
                    <Typography variant="caption" color="textSecondary" display="block">Connections</Typography>
                    <Typography variant="body2">{server.currentLoad?.connections || 0}</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" color="textSecondary" display="block">Weight</Typography>
                    <Typography variant="body2">{server.weight}</Typography>
                  </Box>
                </Box>

                <Divider sx={{ mb: 2, opacity: 0.1 }} />

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <IconButton size="small" onClick={() => handleToggleStatus(server._id, server.status)}>
                    {server.status === 'active' ? <BuildIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDeleteServer(server._id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
        <DialogTitle>Add New Server</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField 
              label="Server Name" 
              fullWidth 
              value={newServer.name}
              onChange={(e) => {
                console.log('Name changed:', e.target.value);
                setNewServer({...newServer, name: e.target.value});
              }}
            />
            <TextField 
              label="IP Address" 
              fullWidth 
              value={newServer.ipAddress}
              onChange={(e) => {
                console.log('IP changed:', e.target.value);
                setNewServer({...newServer, ipAddress: e.target.value});
              }}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField 
                label="Port" 
                type="number" 
                fullWidth 
                value={newServer.port}
                onChange={(e) => setNewServer({...newServer, port: parseInt(e.target.value)})}
              />
              <TextField 
                label="Weight" 
                type="number" 
                fullWidth 
                value={newServer.weight}
                onChange={(e) => setNewServer({...newServer, weight: parseInt(e.target.value)})}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => {
            console.log('Cancel clicked');
            setOpenAddDialog(false);
          }}>Cancel</Button>
          <Button variant="contained" onClick={() => {
            console.log('Add Server clicked, newServer state:', newServer);
            handleAddServer();
          }}>Add Server</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ServerMonitor;
