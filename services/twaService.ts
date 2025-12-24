
import { SigilConfig } from '../types';

const twa = window.Telegram?.WebApp;

export const initTWA = () => {
  if (twa) {
    twa.expand();
    twa.ready();
    twa.enableClosingConfirmation();
  }
};

export const setMainButton = (text: string, onClick: () => void, isVisible: boolean = true) => {
  if (!twa) return;
  twa.MainButton.setText(text.toUpperCase());
  twa.MainButton.offClick(); // Avoid multiple listeners
  twa.MainButton.onClick(onClick);
  if (isVisible) {
    twa.MainButton.show();
  } else {
    twa.MainButton.hide();
  }
};

export const showMainButtonLoading = (loading: boolean) => {
  if (!twa) return;
  if (loading) {
    twa.MainButton.showProgress();
  } else {
    twa.MainButton.hideProgress();
  }
};

export const triggerHaptic = (type: 'impact' | 'notification', style: string) => {
  if (!twa?.HapticFeedback) return;
  if (type === 'impact') {
    twa.HapticFeedback.impactOccurred(style);
  } else if (type === 'notification') {
    twa.HapticFeedback.notificationOccurred(style);
  }
};

export const saveConfigToCloud = (config: SigilConfig) => {
  if (!twa?.CloudStorage) {
    localStorage.setItem('sigil_config', JSON.stringify(config));
    return;
  }
  twa.CloudStorage.setItem('sigil_config', JSON.stringify(config), (err: any, success: boolean) => {
    if (err) console.error('CloudStorage Save Error:', err);
  });
};

export const loadConfigFromCloud = (callback: (config: SigilConfig | null) => void) => {
  if (!twa?.CloudStorage) {
    const local = localStorage.getItem('sigil_config');
    callback(local ? JSON.parse(local) : null);
    return;
  }
  twa.CloudStorage.getItem('sigil_config', (err: any, value: string) => {
    if (err || !value) {
      callback(null);
    } else {
      try {
        callback(JSON.parse(value));
      } catch (e) {
        callback(null);
      }
    }
  });
};

export const shareImage = (imageUrl: string) => {
  if (!twa) return;
  // In a real TWA, we'd send this to the bot or use switchInlineQuery
  // For demo, we trigger sharing via switchInlineQuery with a deep link
  twa.switchInlineQuery('Check out my new magical sigil! #SigilCraft');
};
