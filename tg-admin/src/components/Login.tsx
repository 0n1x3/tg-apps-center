import React, { useState } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import Header from './Header';
import { LoginProps } from '../types';


const Login: React.FC<LoginProps> = ({ onLogin, isDarkTheme, toggleTheme }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await onLogin(username, password);
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 300, margin: 'auto', mt: 4 }}>
        <Typography variant="h5" gutterBottom>Login</Typography>
        {error && <Typography color="error">{error}</Typography>}
        <TextField
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Button 
          type="submit" 
          variant="contained" 
          color="primary" 
          fullWidth 
          sx={{ mt: 2 }}
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </Button>
      </Box>
    </>
  );
};

export default Login;