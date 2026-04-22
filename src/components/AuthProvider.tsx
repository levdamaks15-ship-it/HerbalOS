"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { authService } from "@/lib/appwrite/services/auth";
import { getCurrentClientAction, DB_Client } from "@/lib/actions/clients";

interface AuthContextType {
  user: any | null; // Пользователь из Appwrite Auth
  clientProfile: DB_Client | null; // Профиль из коллекции clients (если это клиент)
  isLoading: boolean;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  clientProfile: null,
  isLoading: true,
  logout: async () => {},
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [clientProfile, setClientProfile] = useState<DB_Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const { getCurrentUserAction } = await import("@/lib/actions/auth");
      const currentUser = await getCurrentUserAction();
      setUser(currentUser);

      if (currentUser) {
        // Если это клиент, пытаемся найти его профиль
        const profile = await getCurrentClientAction();
        setClientProfile(profile);
      } else {
        setClientProfile(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
      setClientProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const logout = async () => {
    try {
      // 1. Очищаем куки на сервере
      const { logoutAction } = await import("@/lib/actions/auth");
      await logoutAction();
      
      // 2. Очищаем сессию в Appwrite (клиент)
      await authService.logout();
      
      setUser(null);
      setClientProfile(null);
      
      // 3. Жесткий редирект на главную страницу текущего эксперта
      const slug = window.location.pathname.split('/')[1] || "";
      window.location.href = slug ? `/${slug}` : "/";
    } catch (error) {
      console.error("Logout error:", error);
      window.location.href = "/";
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      clientProfile, 
      isLoading, 
      logout, 
      refresh: checkAuth 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
