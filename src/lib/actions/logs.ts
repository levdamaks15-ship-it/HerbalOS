import { databases, APPWRITE_CONFIG } from "@/lib/appwrite/config";
import { Query, ID } from "appwrite";
import { telegramService } from "@/lib/telegram/service";

export interface DB_Log {
  $id: string;
  client_id: string;
  type: "weight" | "food" | "water" | "workout";
  value: string;
  note?: string;
  photo?: string;
  $createdAt: string;
}

export async function createLogAction(
  clientId: string, 
  clientName: string, 
  type: "weight" | "food" | "water" | "workout", 
  value: string, 
  note?: string,
  expertSlug?: string,
  photo?: string
) {
  try {
    const log = await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.logs,
      ID.unique(),
      {
        client_id: clientId,
        type,
        value,
        note,
        photo,
        expert: expertSlug
      }
    );

    // Уведомляем эксперта в Telegram
    if (expertSlug) {
      await telegramService.sendActivityNotification(clientName, type, value, expertSlug);
    }

    return { success: true, data: log };
  } catch (error) {
    console.error("Error creating log:", error);
    return { success: false, error };
  }
}

export async function getClientLogs(clientId: string) {
  try {
    const response = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.logs,
      [
        Query.equal("client_id", clientId),
        Query.orderDesc("$createdAt"),
        Query.limit(20)
      ]
    );

    return response.documents as unknown as DB_Log[];
  } catch (error) {
    console.error("Error fetching logs:", error);
    return [];
  }
}
