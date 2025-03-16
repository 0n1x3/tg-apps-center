// ControlPanel.tsx
import React from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { F7CircleGrid } from '../iconsapp/gridicon';
import { GridCircles } from '../iconsapp/gridlarge';
import { RiSortNumberAsc } from '../iconsapp/19icon';
import { BxSortAZ } from '../iconsapp/azicon';

interface ControlPanelProps {
  isDarkTheme: boolean;
  toggleTheme: () => void;
  isCompactGrid: boolean;
  toggleGrid: () => void;
  currentPage: number;
  totalPages: number;
  sortType: 'alphabet' | 'popularity';
  toggleSort: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  isDarkTheme,
  toggleTheme,
  isCompactGrid,
  toggleGrid,
  currentPage,
  totalPages,
  sortType,
  toggleSort,
}) => {
  const iconStyle = { width: '1.3em', height: '1.3em' };
  const iconStyle2 = { width: '1.5em', height: '1.5em' };

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 1,
      position: 'relative',
      zIndex: 1,
      backgroundColor: 'background.paper',
      transition: 'background-color 0.3s ease-in-out',
    }}>
      <IconButton onClick={toggleSort} size="small">
        {sortType === 'alphabet' ? 
        <BxSortAZ style={iconStyle2} /> : 
        <RiSortNumberAsc style={iconStyle2} />}
      </IconButton>
      <IconButton onClick={toggleTheme} size="small">
        {isDarkTheme ? <Brightness4Icon /> : <Brightness7Icon />}
      </IconButton>
      <IconButton onClick={toggleGrid} size="small">
        {isCompactGrid ? 
          <F7CircleGrid style={iconStyle} /> : 
          <GridCircles style={iconStyle} />
        }
      </IconButton>
      <Typography variant="body2">
        {currentPage} / {totalPages}
      </Typography>
    </Box>
  );
};

export default ControlPanel;