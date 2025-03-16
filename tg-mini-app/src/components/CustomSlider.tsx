import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Box, IconButton } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';

interface CustomSliderProps {
  children: React.ReactNode;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onSwipeStart: () => void;
  onSwipeEnd: () => void;
}

const CustomSlider: React.FC<CustomSliderProps> = ({
  children,
  onPageChange,
  totalItems,
  itemsPerPage,
  currentPage,
  onSwipeStart,
  onSwipeEnd
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
    onSwipeStart();
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const touchEnd = e.touches[0].clientX;
    const diff = touchStart - touchEnd;
    if (Math.abs(diff) > 5) {
      setIsSwiping(true);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart || !isSwiping) {
      setIsSwiping(false);
      onSwipeEnd();
      return;
    }
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentPage < totalPages) {
        onPageChange(currentPage + 1);
      } else if (diff < 0 && currentPage > 1) {
        onPageChange(currentPage - 1);
      }
    }

    setTouchStart(null);
    setIsSwiping(false);
    onSwipeEnd();
  };

  return (
    <Box 
      sx={{ position: 'relative', width: '100%', height: '100%' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
      {currentPage > 1 && (
        <IconButton
          onClick={() => onPageChange(currentPage - 1)}
          sx={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}
        >
          <ChevronLeft />
        </IconButton>
      )}
      {currentPage < totalPages && (
        <IconButton
          onClick={() => onPageChange(currentPage + 1)}
          sx={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }}
        >
          <ChevronRight />
        </IconButton>
      )}
    </Box>
  );
};

export default CustomSlider;