import React, { useState } from 'react';
import { Box, Tabs, Tab, IconButton, ThemeProvider, createTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import BotSettings from './BotSettings';
import ManageApps from './ManageApps';
import Analytics from './Analytics';
import { AdminPanelProps } from '../types';

const StyledBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  backgroundColor: theme.palette.background.default,
}));

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.primary.main,
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  minWidth: 0,
  padding: theme.spacing(1, 2),
  color: theme.palette.text.secondary,
  '&.Mui-selected': {
    color: theme.palette.text.primary,
  },
}));

const Content = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(3),
  overflowY: 'auto',
}));



const AdminPanel: React.FC<AdminPanelProps> = ({ isDarkTheme, toggleTheme }) => {
  const [tabValue, setTabValue] = useState(0);

  const theme = createTheme({
    palette: {
      mode: isDarkTheme ? 'dark' : 'light',
    },
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <StyledBox>
        <Header>
          <StyledTabs value={tabValue} onChange={handleTabChange}>
            <StyledTab label="Manage Apps" />
            <StyledTab label="Bot Settings" />
            <StyledTab label="Analytics" /> {/* Добавьте эту строку */}
          </StyledTabs>
          <IconButton onClick={toggleTheme} color="inherit" sx={{ ml: 1 }}>
            {isDarkTheme ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Header>
        <Content>
          {tabValue === 0 && <ManageApps />}
          {tabValue === 1 && <BotSettings />}
          {tabValue === 2 && <Analytics />} {/* Добавьте эту строку */}
        </Content>
      </StyledBox>
    </ThemeProvider>
  );
};

export default AdminPanel;