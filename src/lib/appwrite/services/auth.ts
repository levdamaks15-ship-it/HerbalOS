import { account } from "../config";
import { ID } from "appwrite";

export const authService = {
  // Вход для эксперта
  async login(email: string, pass: string) {
    try {
      return await account.createEmailPasswordSession(email, pass);
    } catch (error) {
      console.error("Auth: Login failed", error);
      throw error;
    }
  },

  // Получение текущего пользователя (проверка сессии)
  async getCurrentUser() {
    try {
      return await account.get();
    } catch {
      return null;
    }
  },

  // Выход
  async logout() {
    try {
      await account.deleteSession('current');
    } catch (error) {
      console.error("Auth: Logout failed", error);
    }
  },

  // Регистрация (для первичной настройки эксперта)
  async register(email: string, pass: string, name: string) {
    try {
      return await account.create(ID.unique(), email, pass, name);
    } catch (error) {
       console.error("Auth: Registration failed", error);
       throw error;
    }
  }
};
