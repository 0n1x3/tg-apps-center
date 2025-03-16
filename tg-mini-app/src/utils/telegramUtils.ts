import { TelegramWebApp } from '../types';

export const tg = window.Telegram?.WebApp;

export const isTelegramWebAppAvailable = (): boolean => {
  return Boolean(tg);
};

export const expandTelegramWebapp = (): void => {
  if (isTelegramWebAppAvailable()) {
    tg!.expand();
  }
};

export const closeTelegramWebApp = (): void => {
  if (isTelegramWebAppAvailable()) {
    tg!.close();
  }
};

export const initTelegramApp = (): (() => void) | void => {
  if (isTelegramWebAppAvailable()) {
    const expandApp = () => {
      tg!.expand();
      
      if (tg!.viewportHeight < tg!.viewportStableHeight) {
        setTimeout(expandApp, 100);
      }
    };

    expandApp();
    tg!.ready();

    // Отключаем вертикальные свайпы
    tg!.disableVerticalSwipes();
    tg!.enableClosingConfirmation();

    const viewportChangedHandler = () => {
      if (tg!.isExpanded) {
        console.log('Приложение развернуто на весь экран');
      } else {
        console.log('Приложение не развернуто на весь экран');
        // Повторная попытка развернуть приложение
        expandApp();
      }
    };

    tg!.onEvent('viewportChanged', viewportChangedHandler);

    // Возвращаем функцию очистки обработчика
    return () => {
      tg!.offEvent('viewportChanged', viewportChangedHandler);
    };
  }
  
  return () => {};
};
