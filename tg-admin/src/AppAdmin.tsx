import React, { useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import axios from 'axios';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';
import Header from './components/Header';
import { LoginResponse } from './types';


const apiUrl = process.env.REACT_APP_API_URL;
console.log('API URL:', apiUrl); // Добавьте эту строку для отладки

const createAppTheme = (mode: 'light' | 'dark') => createTheme({
  palette: {
    mode,
    background: {
      default: mode === 'light' ? '#f5f5f7' : '#1c1c1e',
      paper: 'transparent',
    },
    primary: {
      main: mode === 'light' ? '#007aff' : '#0a84ff',
    },
  },
});

const AppAdminContent: React.FC = () => {
  const navigate = useNavigate();
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const toggleTheme = useCallback(() => {
    setIsDarkTheme(prev => !prev);
  }, []);

  const handleLogin = async (username: string, password: string) => {
    try {
      const response = await axios.post<LoginResponse>('/api/login', { username, password });
      if (response.data.success) {
        setIsAuthenticated(true);
        navigate('/admin');
      } else {
        alert('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('An error occurred during login');
    }
  };

  return (
    <ThemeProvider theme={createAppTheme(isDarkTheme ? 'dark' : 'light')}>
      <CssBaseline />
      <Header />
      <Routes>
        <Route 
          path="/login" 
          element={
            <Login 
              onLogin={handleLogin}
              isDarkTheme={isDarkTheme} 
              toggleTheme={toggleTheme} 
            />
          } 
        />
        <Route 
          path="/*" 
          element={
            isAuthenticated ? (
              <AdminPanel isDarkTheme={isDarkTheme} toggleTheme={toggleTheme} />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
      </Routes>
    </ThemeProvider>
  );
};

const AppAdmin: React.FC = () => {
  return (
    <Router>
      <AppAdminContent />
    </Router>
  );
};

export default AppAdmin;