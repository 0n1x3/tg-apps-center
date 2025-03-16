import React from 'react';
import { Toolbar, Typography, Box, useTheme, useMediaQuery } from '@mui/material';
import { styled } from '@mui/system';

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(2, 1),
  backgroundColor: 'transparent',
}));

const TitleBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
}));

const Header: React.FC = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <StyledToolbar>
      <TitleBox>
        <Typography 
          variant={isSmallScreen ? "h5" : "h4"} 
          color="text.primary" 
          sx={{ 
            fontWeight: 600, 
            lineHeight: 1.2,
            fontSize: isSmallScreen ? '1.5rem' : '2rem',
            textShadow: theme.palette.mode === 'dark' ? '0 0 10px rgba(255,255,255,0.5)' : 'none',
          }}
        >
          TIME COMMUNITY {'\u{1F48E}'}
        </Typography>
      </TitleBox>
    </StyledToolbar>
  );
};

export default Header;