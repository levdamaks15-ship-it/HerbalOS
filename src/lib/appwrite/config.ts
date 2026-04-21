import { Client, Account, Databases, Storage } from 'appwrite';

// Конфигурация для подключения к Appwrite (Self-hosted на серверах РФ)
export const APPWRITE_CONFIG = {
    endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1', // Заменится на ваш РФ-адрес
    projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '',
    databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '',
    collections: {
        experts: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_EXPERTS || '',
        clients: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_CLIENTS || '',
        logs: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_LOGS || '',
        inventory: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_INVENTORY || '',
        timeline: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_TIMELINE || '',
    },
    buckets: {
        photos: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_PHOTOS || '',
    }
};

const client = new Client();

client
    .setEndpoint(APPWRITE_CONFIG.endpoint)
    .setProject(APPWRITE_CONFIG.projectId);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export { client };
