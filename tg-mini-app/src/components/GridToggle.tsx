import React, { useCallback } from 'react';
import { IconButton } from '@mui/material';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewComfyIcon from '@mui/icons-material/ViewComfy';

interface GridToggleProps {
  isCompactGrid: boolean;
  toggleGrid: () => void;
  recalculateGrid: () => void;
}

const GridToggle: React.FC<GridToggleProps> = React.memo(({ isCompactGrid, toggleGrid, recalculateGrid }) => {
  const handleToggle = useCallback(() => {
    toggleGrid();
    // Используем setTimeout, чтобы дать время на обновление состояния
    setTimeout(() => {
      recalculateGrid();
    }, 0);
  }, [toggleGrid, recalculateGrid]);

  return (
    <IconButton onClick={handleToggle} color="inherit">
      {isCompactGrid ? <ViewComfyIcon /> : <ViewModuleIcon />}
    </IconButton>
  );
});

export default GridToggle;