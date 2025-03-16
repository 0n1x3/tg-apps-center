export interface App {
  _id: string;
  name: string;
  type: 'app' | 'game';
  icon: string;
  link: string;
  launchCount: number;
  favoriteCount: number;
}

export interface TelegramWebApp {
  initDataUnsafe: {
    user?: {
      id?: number;
      first_name?: string;
      last_name?: string;
      username?: string;
      language_code?: string;
    };
  };
  expand: () => void;
  ready: () => void;
  close: () => void;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  enableClosingConfirmation: () => void;
  disableVerticalSwipes: () => void;
  onEvent: (eventType: string, eventHandler: Function) => void;
  offEvent: (eventType: string, eventHandler: Function) => void;
  openLink: (url: string) => void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

export interface UserSettings {
  isDarkTheme: boolean;
  isCompactGrid: boolean;
  favoriteApps: string[];
  sortType: 'alphabet' | 'popularity';
}