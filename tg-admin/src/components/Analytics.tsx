import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, CircularProgress, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import axios from 'axios';

interface AnalyticsData {
  totalUsers: number;
  totalApps: number;
  onlineUsers: number;
  topUsers: {
    username: string;
    telegramId: number;
    launchCount: number;
  }[];
  appFavorites: {
    _id: string;
    name: string;
    favoriteCount: number;
  }[];
}

const Analytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get<AnalyticsData>('/api/analytics');
      setAnalyticsData(response.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  useEffect(() => {
    if (analyticsData) {
      console.log('Analytics data:', analyticsData);
    }
  }, [analyticsData]);

  if (isLoading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (!analyticsData) {
    return <Typography>No data available</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Analytics</Typography>
      <Button onClick={fetchData} variant="contained" sx={{ mb: 2 }}>Refresh Data</Button>
      
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">General Statistics</Typography>
        <Typography>Total Users: {analyticsData.totalUsers}</Typography>
        <Typography>Online Users: {analyticsData.onlineUsers}</Typography>
        <Typography>Total Apps: {analyticsData.totalApps}</Typography>
      </Paper>

      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>Top 10 Active Users</Typography>
        <TableContainer>
  <Table>
    <TableHead>
      <TableRow>
        <TableCell>Username</TableCell>
        <TableCell align="right">Launches</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {analyticsData.topUsers.map((user) => (
        <TableRow key={user.telegramId}>
          <TableCell>{user.username || `User ${user.telegramId}`}</TableCell>
          <TableCell align="right">{user.launchCount}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</TableContainer>
      </Paper>

      <Paper elevation={3} sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>App Favorites</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>App Name</TableCell>
                <TableCell align="right">Favorite Count</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {analyticsData.appFavorites.map((app) => (
                <TableRow key={app._id}>
                  <TableCell>{app.name}</TableCell>
                  <TableCell align="right">{app.favoriteCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};



export default Analytics;