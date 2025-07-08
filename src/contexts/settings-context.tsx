'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';

export type TimeFormat = '12h' | '24h';

interface SettingsContextType {
  timeFormat: TimeFormat;
  setTimeFormat: (format: TimeFormat) => void;
  avatarUrl: string | undefined;
  setAvatarUrl: (url: string | null | undefined) => void;
  theme: string | undefined;
  setTheme: (theme: string) => void;
}

const SettingsContext = React.createContext<SettingsContextType | undefined>(undefined);

export const initialAvatar = undefined;

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [timeFormat, setTimeFormatState] = React.useState<TimeFormat>('12h');
  const [avatarUrl, setAvatarUrlState] = React.useState<string | undefined>(initialAvatar);
  const { theme, setTheme } = useTheme();

  React.useEffect(() => {
    const storedTimeFormat = localStorage.getItem('timeFormat') as TimeFormat | null;
    if (storedTimeFormat) {
      setTimeFormatState(storedTimeFormat);
    }
    const storedAvatarUrl = localStorage.getItem('avatarUrl');
    setAvatarUrlState(storedAvatarUrl || undefined);
  }, []);

  const setTimeFormat = (format: TimeFormat) => {
    localStorage.setItem('timeFormat', format);
    setTimeFormatState(format);
  };

  const setAvatarUrl = (url: string | null | undefined) => {
    if (url) {
      localStorage.setItem('avatarUrl', url);
      setAvatarUrlState(url);
    } else {
      localStorage.removeItem('avatarUrl');
      setAvatarUrlState(undefined);
    }
  };

  return (
    <SettingsContext.Provider value={{ timeFormat, setTimeFormat, avatarUrl, setAvatarUrl, theme, setTheme }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = React.useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
