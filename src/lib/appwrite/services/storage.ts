import { storage, APPWRITE_CONFIG } from '../config';
import { ID } from 'appwrite';

export const storageService = {
    async uploadFile(file: File) {
        try {
            const response = await storage.createFile(
                APPWRITE_CONFIG.buckets.photos,
                ID.unique(),
                file
            );
            return response.$id;
        } catch (error) {
            console.error('Storage upload error:', error);
            throw error;
        }
    },

    getFilePreview(fileId: string) {
        return storage.getFileView(
            APPWRITE_CONFIG.buckets.photos,
            fileId
        ).toString();
    },

    async deleteFile(fileId: string) {
        try {
            await storage.deleteFile(
                APPWRITE_CONFIG.buckets.photos,
                fileId
            );
        } catch (error) {
            console.error('Storage delete error:', error);
            throw error;
        }
    }
};
