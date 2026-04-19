import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './components/Dashboard/Dashboard';
import ServerMonitor from './components/ServerMonitor/ServerMonitor';
import PredictionPanel from './components/PredictionPanel/PredictionPanel';
import LoadChart from './components/LoadChart/LoadChart';
import { 
  ThemeProvider, createTheme, Box, Drawer, AppBar, Toolbar, 
  List, Typography, Divider, IconButton, ListItem, ListItemButton, 
  ListItemIcon, ListItemText, CssBaseline, Container 
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Storage as StorageIcon,
  AutoGraph as PredictionIcon,
  Timeline as ChartIcon,
  ChevronLeft as ChevronLeftIcon
} from '@mui/icons-material';

const drawerWidth = 240;

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#00bcd4' },
    secondary: { main: '#673ab7' },
    background: { default: '#f4f7f9', paper: '#ffffff' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h6: { fontWeight: 600 }
  },
  shape: { borderRadius: 12 }
});

const NavItem = ({ to, icon, text, open }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <ListItem disablePadding sx={{ display: 'block', mb: 1 }}>
      <ListItemButton
        component={Link}
        to={to}
        sx={{
          minHeight: 48,
          justifyContent: open ? 'initial' : 'center',
          px: 2.5,
          mx: 1,
          borderRadius: 2,
          backgroundColor: isActive ? 'rgba(0, 188, 212, 0.08)' : 'transparent',
          color: isActive ? 'primary.main' : 'text.secondary',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
            color: 'text.primary'
          }
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 0,
            mr: open ? 3 : 'auto',
            justifyContent: 'center',
            color: isActive ? 'primary.main' : 'inherit'
          }}
        >
          {icon}
        </ListItemIcon>
        <ListItemText primary={text} sx={{ opacity: open ? 1 : 0 }} />
      </ListItemButton>
    </ListItem>
  );
};

function AppContent() {
  const [open, setOpen] = useState(true);

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
          boxShadow: 'none',
          color: 'text.primary'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={() => setOpen(!open)}
            edge="start"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ display: 'flex', alignItems: 'center' }}>
            <Box component="span" sx={{ color: 'primary.main', mr: 1 }}>⚡</Box>
            Predictive Load Balancer
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        open={open}
        sx={{
          width: open ? drawerWidth : 72,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: open ? drawerWidth : 72,
            boxSizing: 'border-box',
            backgroundColor: '#ffffff',
            borderRight: '1px solid rgba(0, 0, 0, 0.05)',
            transition: (theme) => theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden'
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'hidden', mt: 2 }}>
          <List>
            <NavItem to="/" icon={<DashboardIcon />} text="Dashboard" open={open} />
            <NavItem to="/servers" icon={<StorageIcon />} text="Servers" open={open} />
            <NavItem to="/predictions" icon={<PredictionIcon />} text="Predictions" open={open} />
            <NavItem to="/charts" icon={<ChartIcon />} text="Load Charts" open={open} />
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}>
        <Toolbar />
        <Container maxWidth="xl">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/servers" element={<ServerMonitor />} />
            <Route path="/predictions" element={<PredictionPanel />} />
            <Route path="/charts" element={<LoadChart />} />
          </Routes>
        </Container>
      </Box>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;
