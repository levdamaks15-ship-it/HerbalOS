"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type TelegramUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
};

type TWAContextType = {
  user: TelegramUser | null;
  webApp: any;
  isReady: boolean;
};

const TWAContext = createContext<TWAContextType>({
  user: null,
  webApp: null,
  isReady: false,
});

export function TWAProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [webApp, setWebApp] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Ждем появления объекта Telegram во внешней среде
    const checkTelegram = () => {
      const tg = (window as any).Telegram?.WebApp;
      if (tg) {
        tg.ready();
        tg.expand(); // Разворачиваем на весь экран
        setWebApp(tg);
        setUser(tg.initDataUnsafe?.user || null);
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
