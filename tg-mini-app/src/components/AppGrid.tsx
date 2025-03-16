import React, { useMemo } from 'react';
import { Box, useTheme, Typography  } from '@mui/material';
import AppCard from './AppCard';
import { App } from '../types';
import { styled } from '@mui/system';
import { ClarityCursorHandClickLine } from '../iconsapp/cursoricon';

const GridContainer = styled(Box)(({ theme }) => ({
  display: 'grid',
  padding: theme.spacing(1, 0.5, 0.5, 0.5),
  justifyContent: 'center',
  alignContent: 'start',
  height: '100%',
  overflow: 'hidden',
}));

interface AppGridProps {
  apps: App[];
  getImageUrl: (url: string) => string;
  contentSize: { width: number; height: number };
  currentPage: number;
  itemsPerPage: number;
  setItemsPerPage: React.Dispatch<React.SetStateAction<number>>;
  headerHeight: number;
  isDesktop: boolean;
  isCompactGrid: boolean;
  onFavoriteToggle: (appId: string) => void;
  favoriteApps: string[];
  isSliderSwiping: boolean;
  onLaunchApp: (appId: string) => void;
  showFavorites: boolean; 
}

const EmptyFavorites = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  padding: theme.spacing(2),
  '& svg': {
    width: '120px',
    height: '120px',
    marginBottom: theme.spacing(2),
    color: theme.palette.text.secondary,
  },
}));

const AppGrid: React.FC<AppGridProps> = React.memo(({ 
  apps, 
  getImageUrl,
  contentSize,
  currentPage,
  itemsPerPage,
  setItemsPerPage,
  headerHeight,
  isDesktop,
  isCompactGrid,
  onFavoriteToggle,
  favoriteApps,
  isSliderSwiping,
  onLaunchApp,
  showFavorites
}) => {
  const theme = useTheme();
  
  const handleAppClick = (app: App) => {
    console.log(`Clicked on app: ${app.name}, ID: ${app._id}`);
    onLaunchApp(app._id);
    if (app.link.startsWith('https://t.me/') && window.Telegram?.WebApp?.openLink) {
      window.Telegram.WebApp.openLink(app.link);
    } else {
      window.open(app.link, '_blank');
    }
  };

  const visibleApps = useMemo(() => {
    if (itemsPerPage === 0) return [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    return apps.slice(startIndex, startIndex + itemsPerPage);
  }, [apps, currentPage, itemsPerPage]);

  const gridStyle = useMemo(() => {
    const columns = isCompactGrid ? (isDesktop ? 6 : 5) : (isDesktop ? 5 : 4);
    const gap = isDesktop ? 8 : 4;
    const bottomPanelHeight = Math.max(60, contentSize.height * 0.1);
    const availableWidth = contentSize.width - gap * (columns + 1);
    const availableHeight = contentSize.height - headerHeight - bottomPanelHeight - gap * 2;
    
    const itemWidth = Math.floor(availableWidth / columns);
    const itemHeight = isDesktop ? itemWidth + 20 : itemWidth + 14;
    
    const rows = Math.floor(availableHeight / (itemHeight + gap));
    const calculatedItemsPerPage = columns * rows;
    
    if (calculatedItemsPerPage !== itemsPerPage) {
      setItemsPerPage(calculatedItemsPerPage);
    }

    return {
      gridTemplateColumns: `repeat(${columns}, ${itemWidth}px)`,
      gridAutoRows: `${itemHeight}px`,
      gap: `${gap}px`,
      itemWidth,
      itemHeight,
    };
  }, [contentSize, itemsPerPage, setItemsPerPage, headerHeight, isDesktop, isCompactGrid]);

  if (showFavorites && favoriteApps.length === 0) {
    return (
      <EmptyFavorites>
        <ClarityCursorHandClickLine />
        <Typography variant="body1" align="center">
        Здесь пока пусто. Чтобы добавить в избранное, нажми на приложение и задержи палец
        </Typography>
      </EmptyFavorites>
    );
  }

  return (
    <GridContainer style={gridStyle}>
      {visibleApps.map((app) => (
        <AppCard 
          key={app._id}
          app={app} 
          getImageUrl={getImageUrl}
          cellSize={gridStyle.itemWidth}
          isDesktop={isDesktop}
          onFavoriteToggle={onFavoriteToggle}
          isFavorite={favoriteApps.includes(app._id)}
          isSliderSwiping={isSliderSwiping}
          onAppClick={handleAppClick}  // Добавляем этот проп
        />
      ))}
    </GridContainer>
  );
});

export default AppGrid;