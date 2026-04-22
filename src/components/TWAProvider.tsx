"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface TWAUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

interface TWAContextType {
  user: TWAUser | null;
  webApp: unknown;
  isReady: boolean;
}

const TWAContext = createContext<TWAContextType>({
  user: null,
  webApp: null,
  isReady: false,
});

export function TWAProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<TWAUser | null>(null);
  const [webApp, setWebApp] = useState<unknown>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Ждем появления объекта Telegram во внешней среде
    const checkTelegram = () => {
      interface TelegramWebApp {
        ready: () => void;
        expand: () => void;
        initDataUnsafe?: { user?: TWAUser };
      }
      const tg = (window as Window & { Telegram?: { WebApp: TelegramWebApp } }).Telegram?.WebApp;
      if (tg) {
        tg.ready();
        tg.expand(); // Разворачиваем на весь экран
        setWebApp(tg);
        try {
          setUser(tg.initDataUnsafe?.user || null);
        } catch (error) {
          console.warn("TWA: Failed to get user data", error);
          setUser(null);
        }
        setIsReady(true);
        console.log("TWA Initialized:", tg.initDataUnsafe?.user);
      }
    };

    checkTelegram();
  }, []);

  return (
    <TWAContext.Provider value={{ user, webApp, isReady }}>
      {children}
    </TWAContext.Provider>
  );
}

export const useTWA = () => useContext(TWAContext);
