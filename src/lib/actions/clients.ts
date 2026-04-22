"use server";

import { APPWRITE_CONFIG } from "@/lib/appwrite/config";
import { createAdminClient } from "@/lib/appwrite/server";
import { Query } from "node-appwrite";

export interface DB_Client {
  $id: string;
  name: string;
  status: "active" | "at_risk" | "inactive";
  progress: number;
  lastActive: string;
  weight_start: number;
  weight_current: number;
  goal: string;
  photo_url?: string;
  expert: string;
  telegram_chat_id?: string;
}

export async function getClients(expertSlug: string) {
  try {
    const { databases } = await createAdminClient();
    const response = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.clients,
      [
        Query.equal("expert", expertSlug),
        Query.orderDesc("$updatedAt")
      ]
    );

    // Принудительная сериализация для Next.js Server Actions
    return JSON.parse(JSON.stringify(response.documents)) as DB_Client[];
  } catch (error: any) {
    console.error("❌ Error fetching clients from Appwrite:", error.message);
    console.log("Details used:", { 
      databaseId: APPWRITE_CONFIG.databaseId, 
      collectionId: APPWRITE_CONFIG.collections.clients 
    });
    return [];
  }
}

export async function updateClientAction(clientId: string, data: Partial<DB_Client>) {
  try {
    const { databases } = await createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { $id, ...updateData } = data;
    const response = await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.clients,
      clientId,
      updateData
    );
    return { success: true, data: response };
  } catch (error) {
    console.error("Error updating client:", error);
    return { success: false, error };
  }
}
