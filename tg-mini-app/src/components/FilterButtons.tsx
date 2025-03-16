import React from 'react';
import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { PhStarFill } from '../iconsapp/staricon';
import { MaterialSymbolsSettings } from '../iconsapp/MdiJsfiddle';
import { IonGameController } from '../iconsapp/gameicon';
import { PhInfinityBold } from '../iconsapp/infinity';
import { styled } from '@mui/system';

interface FilterButtonsProps {
  filterType: 'all' | 'app' | 'game' | 'favorite';
  onFilterChange: (newFilter: 'all' | 'app' | 'game' | 'favorite') => void;
}

const StyledToggleButton = styled(ToggleButton)(({ theme }) => ({
  '&.Mui-selected': {
    backgroundColor: theme.palette.mode === 'dark' ? '#444' : '#e0e0e0',
    color: theme.palette.mode === 'dark' ? '#fff' : '#000',
  },
}));

const GoldStar = styled(PhStarFill)<{ isActive: boolean }>(({ isActive }) => ({
  color: isActive ? 'gold' : 'inherit',
}));

const FilterButtons: React.FC<FilterButtonsProps> = ({ filterType, onFilterChange }) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 1 }}>
      <ToggleButtonGroup
        value={filterType}
        exclusive
        onChange={(_, newValue) => newValue && onFilterChange(newValue)}
        aria-label="app filter"
      >
        <StyledToggleButton value="all" aria-label="all">
        <PhInfinityBold width="32" height="32" />
        </StyledToggleButton>
        <StyledToggleButton value="app" aria-label="apps">
          <MaterialSymbolsSettings width="32" height="32" />
        </StyledToggleButton>
        <StyledToggleButton value="game" aria-label="games">
          <IonGameController width="32" height="32" />
        </StyledToggleButton>
        <StyledToggleButton value="favorite" aria-label="favorites">
          <GoldStar isActive={filterType === 'favorite'} />
        </StyledToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};

export default FilterButtons;