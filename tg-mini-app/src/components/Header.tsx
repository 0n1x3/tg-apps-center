import React from 'react';
import { Typography, Box, useTheme, useMediaQuery } from '@mui/material';
import { styled } from '@mui/system';

const HeaderContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  alignItems: 'center',
  padding: theme.spacing(2, 1),
  paddingBottom: theme.spacing(0.5), // Уменьшили отступ снизу
  backgroundColor: 'transparent',
  height: 'auto', // Изменено с фиксированной высоты на auto
}));

const TitleBox = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
});

interface HeaderProps {
  filterType: 'all' | 'app' | 'game' | 'favorite';
}

const Header: React.FC<HeaderProps> = ({ filterType }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const getSubtitle = () => {
    switch (filterType) {
      case 'all':
        return 'Все приложения';
      case 'app':
        return 'Утилиты';
      case 'game':
        return 'Игры';
      case 'favorite':
        return 'Избранное';
      default:
        return '';
    }
  };

  return (
    <HeaderContainer>
      <TitleBox>
       
        <Typography
          variant="subtitle1"
          color="text.secondary"
          sx={{
            fontWeight: 500, // Изменили на жирный шрифт
            fontSize: isSmallScreen ? '1rem' : '1.2rem', // Немного уменьшили размер шрифта
            marginTop: theme.spacing(0.25), // Уменьшили отступ сверху
          }}
        >
          {getSubtitle()}
        </Typography>
      </TitleBox>
    </HeaderContainer>
  );
};

export default Header;