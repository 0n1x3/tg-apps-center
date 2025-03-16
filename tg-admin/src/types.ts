// src/types.ts в проекте tg-admin

export interface LoginResponse {
    success: boolean;
    message?: string;
    token?: string; // если вы используете токены для аутентификации
  }
  
  export interface AdminPanelProps {
    isDarkTheme: boolean;
    toggleTheme: () => void;
  }
  
  export interface LoginProps {
    onLogin: (username: string, password: string) => Promise<void>;
    isDarkTheme: boolean;
    toggleTheme: () => void;
  }
  
  // Если вам нужно использовать типы из основного проекта, вы можете их импортировать или продублировать здесь
  export interface App {
    _id: string;
    name: string;
    type: 'app' | 'game';
    icon: string;
    link: string;
    launchCount: number;
  }
  
  // Добавьте любые другие интерфейсы или типы, специфичные для админ-панели