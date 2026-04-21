import { databases, storage, APPWRITE_CONFIG } from '../config';
import { ID, Query } from 'appwrite';

export type LogEntry = {
  userId: string;
  type: 'weight' | 'food' | 'water';
  value?: number;
  comment?: string;
  photoIds?: string[];
  timestamp: string;
};

export const logService = {
  // Создание новой записи в дневнике
  async createLog(data: LogEntry) {
    try {
      return await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.logs,
        ID.unique(),
        data
      );
    } catch (error) {
      console.error("Error creating log:", error);
      throw error;
    }
  },

  // Загрузка фотографий в хранилище
  async uploadPhotos(files: File[]) {
    try {
      const uploadPromises = files.map(file => 
        storage.createFile(
          APPWRITE_CONFIG.buckets.photos,
          ID.unique(),
          file
        )
      );
      const results = await Promise.all(uploadPromises);
      return results.map(res => res.$id);
    } catch (error) {
      console.error("Error uploading photos:", error);
      throw error;
    }
  },

  // Получение последних логов пользователя
  async getRecentLogs(userId: string, limit = 10) {
    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.logs,
        [
          Query.equal('userId', userId),
          Query.orderDesc('timestamp'),
          Query.limit(limit)
        ]
      );
      return response.documents;
    } catch (error) {
      console.error("Error fetching logs:", error);
      return [];
    }
  }
};
