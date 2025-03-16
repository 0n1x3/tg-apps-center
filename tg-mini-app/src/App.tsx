import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Box, Typography, CircularProgress, useMediaQuery } from '@mui/material';
import { styled } from '@mui/system';
import axios from 'axios';
import Header from './components/Header';
import { isTelegramWebAppAvailable, initTelegramApp } from './utils/telegramUtils';
import ControlPanel from './components/ControlPanel';
import CustomSlider from './components/CustomSlider';
import AppGrid from './components/AppGrid';
import FilterButtons from './components/FilterButtons';
import { App as AppType, TelegramWebApp, UserSettings } from './types';
import useImagePreloader from './hooks/useImagePreloader';
import { createGlobalStyle } from 'styled-components';

type AxiosError = Error & {
  isAxiosError: boolean;
  response?: {
    data: any;
    status: number;
    headers: any;
  };
};

function isAxiosError(error: unknown): error is AxiosError {
  return (error as AxiosError).isAxiosError === true;
}


const GlobalStyle = createGlobalStyle`
  * {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
`;
 
axios.defaults.baseURL = 'https://timecommunity.xyz';

interface LaunchAppResponse {
  _id: string;
  launchCount: number;
  // Добавьте другие поля, которые может вернуть сервер
}

const BOTTOM_PANEL_HEIGHT = 120;

const AppContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  overflow: 'hidden',
});

const ContentContainer = styled(Box)({
  flexGrow: 1,
  overflow: 'auto',
  position: 'relative',
  paddingTop: '5px',
  paddingBottom: `${BOTTOM_PANEL_HEIGHT}px`,
});

const BottomPanel = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  zIndex: 1000,
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(1),
  height: `${BOTTOM_PANEL_HEIGHT}px`,
}));

const createAppTheme = (mode: 'light' | 'dark') => createTheme({
  palette: {
    mode,
    background: {
      default: mode === 'light' ? '#ffffff' : '#000000',
      paper: 'transparent',
    },
    primary: {
      main: mode === 'light' ? '#007aff' : '#0a84ff',
    },
  },
});

const App: React.FC = () => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [apps, setApps] = useState<AppType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCompactGrid, setIsCompactGrid] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState<'all' | 'app' | 'game' | 'favorite'>('all');
  const [favoriteApps, setFavoriteApps] = useState<string[]>([]);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [realContentSize, setRealContentSize] = useState({ width: 0, height: 0 });
  const contentRef = useRef<HTMLDivElement>(null);
  const isDesktop = useMediaQuery('(min-width:1024px)');
  const [isSliderSwiping, setIsSliderSwiping] = useState(false);
  const [sortType, setSortType] = useState<'alphabet' | 'popularity'>('alphabet');
  const [showFavorites, setShowFavorites] = useState(false);
  const BASE_URL = 'https://timecommunity.xyz';

  const imageUrls = useMemo(() => apps.map(app => 
    app.icon.startsWith('http') ? app.icon : `${BASE_URL}${app.icon}`
  ), [apps]);
  
  const { getImageUrl, isLoading: imagesLoading } = useImagePreloader(imageUrls);

  useEffect(() => {
    console.log('Is Telegram Web App available:', isTelegramWebAppAvailable());
  }, []);

  
  const launchApp = async (appId: string) => {
    try {
      console.log(`Attempting to launch app with ID: ${appId}`);
      
      let userId: string | null = null;
      if (isTelegramWebAppAvailable()) {
        const tg = window.Telegram?.WebApp;
        userId = tg?.initDataUnsafe?.user?.id?.toString() || null;
        console.log('Retrieved userId from Telegram:', userId);
      }
  
      if (!userId) {
        console.error('Failed to get user ID, cannot launch app');
        setError('Failed to launch app. User ID not available.');
        return;
      }
  
      const response = await axios.post<AppType>(`/api/apps/${appId}/launch`, { userId });
      console.log('App launched:', response.data);
  
      setApps(prevApps => prevApps.map(app => 
        app._id === response.data._id ? { ...app, launchCount: response.data.launchCount } : app
      ));
  
      // Обновляем активность пользователя
      await axios.post('/api/user/activity', {
        userId,
        action: 'launch',
        appId
      });
  
    } catch (error) {
      if (isAxiosError(error)) {
        console.error('Axios error launching app:', error.message);
      } else {
        console.error('Error launching app:', error);
      }
      setError('Failed to launch app. Please try again.');
    }
  };
  
  

  const fetchUserSettings = useCallback(async () => {
    if (isTelegramWebAppAvailable()) {
      const tg = window.Telegram?.WebApp as TelegramWebApp | undefined;
      const userId = tg?.initDataUnsafe?.user?.id;
      if (userId) {
        try {
          const response = await axios.get<UserSettings>(`/api/user/settings/${userId}`);
          setIsDarkTheme(response.data.isDarkTheme);
          setIsCompactGrid(response.data.isCompactGrid);
          setFavoriteApps(response.data.favoriteApps);
          setSortType(response.data.sortType || 'alphabet'); // Добавляем загрузку типа сортировки
        } catch (error) {
          console.error('Error fetching user settings:', error);
        }
      }
    }
  }, []);

  const saveUserSettings = useCallback(async () => {
    if (isTelegramWebAppAvailable()) {
      const tg = window.Telegram?.WebApp as TelegramWebApp | undefined;
      const userId = tg?.initDataUnsafe?.user?.id;
      if (userId) {
        try {
          await axios.post('/api/user/settings', {
            userId,
            isDarkTheme,
            isCompactGrid,
            sortType // Добавляем сохранение типа сортировки
          });
        } catch (error) {
          console.error('Error saving user settings:', error);
        }
      }
    }
  }, [isDarkTheme, isCompactGrid, sortType]);

  useEffect(() => {
    fetchUserSettings();
  }, [fetchUserSettings]);

  useEffect(() => {
    saveUserSettings();
  }, [isDarkTheme, isCompactGrid, sortType, saveUserSettings]);

  const updateContainerSize = useCallback(() => {
    if (contentRef.current) {
      const rect = contentRef.current.getBoundingClientRect();
      setRealContentSize({ 
        width: rect.width, 
        height: rect.height
      });
    }
  }, []);
  
  useEffect(() => {
    updateContainerSize();
    window.addEventListener('resize', updateContainerSize);
    return () => window.removeEventListener('resize', updateContainerSize);
  }, [updateContainerSize]);

  const fetchApps = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get<AppType[]>('/api/apps');
      setApps(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching apps:', err);
      setError('Failed to load apps. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchApps();
  }, [fetchApps]);

  useEffect(() => {
    const updateUserActivity = async () => {
      if (isTelegramWebAppAvailable()) {
        const tg = window.Telegram?.WebApp as TelegramWebApp | undefined;
        const user = tg?.initDataUnsafe?.user;
        if (user) {
          try {
            await axios.post('/api/user/activity', {
              userId: user.id,
              username: user.username,
              firstName: user.first_name,
              lastName: user.last_name
            });
          } catch (error) {
            console.error('Error updating user activity:', error);
          }
        }
      }
    };
    
    updateUserActivity();
    const intervalId = setInterval(updateUserActivity, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  const fetchFavoriteApps = useCallback(async () => {
    if (isTelegramWebAppAvailable()) {
      const tg = window.Telegram?.WebApp as TelegramWebApp | undefined;
      const userId = tg?.initDataUnsafe?.user?.id;
      if (userId) {
        try {
          const response = await axios.get<{ favoriteApps: string[] }>(`/api/favorites/${userId}`);
          if (response.data && Array.isArray(response.data.favoriteApps)) {
            setFavoriteApps(response.data.favoriteApps);
          }
        } catch (error) {
          console.error('Error fetching favorite apps:', error);
        }
      }
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      await fetchApps();
      await fetchFavoriteApps();
    };
    loadData();
  }, [fetchApps, fetchFavoriteApps]);

  const handleFavoriteToggle = async (appId: string) => {
    if (isTelegramWebAppAvailable()) {
      const tg = window.Telegram?.WebApp as TelegramWebApp | undefined;
      const userId = tg?.initDataUnsafe?.user?.id;
      if (userId) {
        try {
          const action = favoriteApps.includes(appId) ? 'remove' : 'add';
          const response = await axios.post<{ favoriteApps: string[] }>('/api/favorites', { userId, appId, action });
          if (response.data && Array.isArray(response.data.favoriteApps)) {
            setFavoriteApps(response.data.favoriteApps);
          } else {
            console.error('Invalid response format for favorites');
          }
        } catch (error) {
          console.error('Error toggling favorite:', error);
        }
      }
    }
  };

  const filteredApps = useMemo(() => 
    apps.filter(app => {
      if (filterType === 'all') return true;
      if (filterType === 'favorite') return favoriteApps.includes(app._id);
      return app.type === filterType;
    }),
    [apps, filterType, favoriteApps]
  );

  const calculateItemsPerPage = useCallback(() => {
    if (!realContentSize.width || !realContentSize.height) return 0;
    
    const columns = isCompactGrid ? (isDesktop ? 6 : 5) : (isDesktop ? 5 : 4);
    const gap = isDesktop ? 16 : 8;
    const headerHeight = 50;
    const availableHeight = realContentSize.height - headerHeight - BOTTOM_PANEL_HEIGHT;
    const itemWidth = Math.floor((realContentSize.width - gap * (columns + 1)) / columns);
    const itemHeight = isDesktop ? itemWidth + 30 : itemWidth + 20;
    
    const rows = Math.floor(availableHeight / (itemHeight + gap));
    return columns * Math.max(rows, 1);
  }, [isCompactGrid, realContentSize, isDesktop]);
  
  useEffect(() => {
    const newItemsPerPage = calculateItemsPerPage();
    setItemsPerPage(newItemsPerPage);
  }, [calculateItemsPerPage, realContentSize]);

  const toggleGrid = useCallback(() => {
    setIsCompactGrid(prev => !prev);
  }, []);

  const totalPages = useMemo(() => 
    Math.max(Math.ceil(filteredApps.length / itemsPerPage), 1),
    [filteredApps.length, itemsPerPage]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, itemsPerPage]);

  const handleFilterChange = useCallback((newFilter: 'all' | 'app' | 'game' | 'favorite') => {
    setFilterType(newFilter);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDarkTheme(prev => !prev);
  }, []);

  useEffect(() => {
    const setupTelegramFeatures = () => {
      if (isTelegramWebAppAvailable()) {
        const tg = window.Telegram?.WebApp as TelegramWebApp | undefined;
        tg?.expand();
        tg?.enableClosingConfirmation();
        return;
      }
    };

    setupTelegramFeatures();
  }, []);

  const handleSortChange = useCallback((newSortType: 'alphabet' | 'popularity') => {
    setSortType(newSortType);
    saveUserSettings(); // Вызываем saveUserSettings при изменении типа сортировки
  }, [saveUserSettings]);

  // Обновляем функцию сортировки приложений
  const sortedApps = useMemo(() => {
    return [...filteredApps].sort((a, b) => {
      if (sortType === 'alphabet') {
        return a.name.localeCompare(b.name);
      } else {
        return (b.launchCount || 0) - (a.launchCount || 0);
      }
    });
  }, [filteredApps, sortType]);

  const toggleSort = useCallback(() => {
    const newSortType = sortType === 'alphabet' ? 'popularity' : 'alphabet';
    setSortType(newSortType);
    saveUserSettings(); // Вызываем saveUserSettings при изменении типа сортировки
  }, [sortType, saveUserSettings]);

  useEffect(() => {
    const cleanup = initTelegramApp();
    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  return (
    <ThemeProvider theme={createAppTheme(isDarkTheme ? 'dark' : 'light')}>
      <CssBaseline />
      <AppContainer>
      <Header filterType={filterType} />
        <ContentContainer ref={contentRef}>
        {(isLoading || imagesLoading) ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <CustomSlider
            onPageChange={handlePageChange}
            totalItems={sortedApps.length} // Используем sortedApps вместо filteredApps
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onSwipeStart={() => setIsSliderSwiping(true)}
            onSwipeEnd={() => setIsSliderSwiping(false)}
          >
            <AppGrid
              apps={sortedApps} // Используем sortedApps вместо filteredApps
              getImageUrl={getImageUrl}
              contentSize={realContentSize}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              setItemsPerPage={setItemsPerPage}
              headerHeight={50}
              isDesktop={isDesktop}
              isCompactGrid={isCompactGrid}
              onFavoriteToggle={handleFavoriteToggle}
              favoriteApps={favoriteApps}
              isSliderSwiping={isSliderSwiping}
              onLaunchApp={launchApp}
              showFavorites={filterType === 'favorite'}
              />
          </CustomSlider>
        )}
        </ContentContainer>
        <BottomPanel>
        <ControlPanel
  isDarkTheme={isDarkTheme}
  toggleTheme={toggleTheme}
  isCompactGrid={isCompactGrid}
  toggleGrid={toggleGrid}
  currentPage={currentPage}
  totalPages={totalPages}
  sortType={sortType}
  toggleSort={toggleSort}
  
/>
          <FilterButtons
            filterType={filterType}
            onFilterChange={handleFilterChange}
          />
        </BottomPanel>
      </AppContainer>
    </ThemeProvider>
  );
};

export default App;