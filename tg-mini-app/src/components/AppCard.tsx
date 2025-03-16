import React, { useState, useRef, useCallback } from 'react';
import { Typography, Box } from '@mui/material';
import { styled } from '@mui/system';
import { App } from '../types';

interface AppCardProps {
  app: App;
  getImageUrl: (url: string) => string;
  cellSize: number;
  isDesktop: boolean;
  onFavoriteToggle: (appId: string) => void;
  isFavorite: boolean;
  isSliderSwiping: boolean;
  onAppClick: (app: App) => void;
}

const Card = styled(Box)(({ theme }) => ({
  cursor: 'pointer',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
  position: 'relative',
  backgroundColor: 'transparent',
  borderRadius: theme.shape.borderRadius,
  overflow: 'visible',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.05)',
  },
  userSelect: 'none',
  WebkitTouchCallout: 'none',
  WebkitUserSelect: 'none',
  KhtmlUserSelect: 'none',
  MozUserSelect: 'none',
  msUserSelect: 'none',
}));

const IconWrapper = styled(Box)<{ isFavorite: boolean }>(({ theme, isFavorite }) => ({
  borderRadius: '50%',
  overflow: 'hidden',
  marginBottom: '4px',
  boxShadow: isFavorite 
    ? `0 0 8px rgba(255, 215, 0, 0.8), 0 0 4px rgba(255, 215, 0, 0.8)` 
    : `0 0 8px rgba(255, 255, 255, 0.8)`,
  transition: 'box-shadow 0.3s ease-in-out',
}));

const IconImage = styled('img')({
  objectFit: 'cover',
  borderRadius: '50%',
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
});

const AppName = styled(Typography)({
  textAlign: 'center',
  lineHeight: 1.2,
  maxHeight: '2.4em',
  overflow: 'hidden',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  wordBreak: 'break-word',
});

const AppCard: React.FC<AppCardProps> = React.memo(({ 
  app, 
  getImageUrl, 
  cellSize,
  isDesktop,
  onFavoriteToggle,
  isFavorite,
  isSliderSwiping,
  onAppClick
}) => {
  const [isLongPress, setIsLongPress] = useState(false);
  const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartTime = useRef<number>(0);
  const touchStartPosition = useRef<{ x: number; y: number } | null>(null);

  const handleInteractionStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    touchStartTime.current = Date.now();
    if ('touches' in e) {
      const touch = e.touches[0];
      touchStartPosition.current = { x: touch.clientX, y: touch.clientY };
    }
    longPressTimeoutRef.current = setTimeout(() => {
      setIsLongPress(true);
      onFavoriteToggle(app._id);
    }, 500);
  }, [app._id, onFavoriteToggle]);

  const handleInteractionEnd = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
    }
    
    const interactionDuration = Date.now() - touchStartTime.current;
    
    if (!isLongPress && interactionDuration < 500 && !isSliderSwiping) {
      if ('changedTouches' in e) {
        const touch = e.changedTouches[0];
        const endPosition = { x: touch.clientX, y: touch.clientY };
        const dx = endPosition.x - (touchStartPosition.current?.x || 0);
        const dy = endPosition.y - (touchStartPosition.current?.y || 0);
        if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
          handleClick();
        }
      } else {
        handleClick();
      }
    }
    
    setIsLongPress(false);
    touchStartPosition.current = null;
  }, [isLongPress, isSliderSwiping]);

  const handleClick = useCallback(() => {
    console.log('App clicked:', app.name);
    onAppClick(app);
    if (app.link.startsWith('https://t.me/') && window.Telegram?.WebApp?.openLink) {
      console.log('Opening Telegram link:', app.link);
      window.Telegram.WebApp.openLink(app.link);
    } else {
      console.log('Opening external link:', app.link);
      window.open(app.link, '_blank');
    }
  }, [app, onAppClick]);

  const iconSize = isDesktop ? cellSize * 0.7 : cellSize * 0.8;

  return (
    <Card 
      onMouseDown={handleInteractionStart}
      onMouseUp={handleInteractionEnd}
      onTouchStart={handleInteractionStart}
      onTouchEnd={handleInteractionEnd}
    >
      <IconWrapper isFavorite={isFavorite} style={{ width: iconSize, height: iconSize }}>
        <IconImage
          src={getImageUrl(app.icon)}
          alt={app.name}
        />
      </IconWrapper>
      <AppName style={{ 
        fontSize: isDesktop ? `${cellSize * 0.10}px` : `${cellSize * 0.11}px`, 
        marginTop: isDesktop ? '4px' : '2px'
      }}>
        {app.name}
      </AppName>
    </Card>
  );
});

export default AppCard;

//const iconSize = isDesktop ? cellSize * 0.7 : cellSize * 0.8;