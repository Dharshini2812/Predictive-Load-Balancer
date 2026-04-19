import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : (process.env.REACT_APP_API_URL || 'http://localhost:5005/api');

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const api = {
  // Servers
  getServers: async () => {
    const response = await apiClient.get('/servers');
    return response.data;
  },
  
  addServer: async (serverData) => {
    const response = await apiClient.post('/servers', serverData);
    return response.data;
  },
  
  updateServerStatus: async (id, status) => {
    const response = await apiClient.put(`/servers/${id}/status`, { status });
    return response.data;
  },
  
  deleteServer: async (id) => {
    const response = await apiClient.delete(`/servers/${id}`);
    return response.data;
  },
  
  // Load Metrics
  getCurrentLoad: async () => {
    const response = await apiClient.get('/load/current');
    return response.data;
  },
  
  getLoadHistory: async (serverId, hours = 24) => {
    const response = await apiClient.get(`/load/history?serverId=${serverId}&hours=${hours}`);
    return response.data;
  },
  
  getSystemHealth: async () => {
    const response = await apiClient.get('/load/health');
    return response.data;
  },
  
  // Predictions
  getPredictions: async (serverId, hours = 1) => {
    const response = await apiClient.get(`/predictions/${serverId}?hours=${hours}`);
    return response.data;
  },
  
  getOptimalServer: async () => {
    const response = await apiClient.get('/predictions/optimal/server');
    return response.data;
  }
};

export default api;
