"use server";

import { APPWRITE_CONFIG } from "@/lib/appwrite/config";
import { createAdminClient } from "@/lib/appwrite/server";
import { Query } from "node-appwrite";

export interface DB_Expert {
  $id: string;
  expert: string; // slug
  name: string;
  description: string;
  photo?: string;
  telegram_id?: string;
}

export async function getExpertAction(slug: string) {
  try {
    const { databases } = await createAdminClient();
    const response = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.experts,
      [Query.equal("expert", slug)]
    );

    if (response.documents.length > 0) {
      return JSON.parse(JSON.stringify(response.documents[0])) as DB_Expert;
    }
    
    // Если по конкретному слагу не нашли, ищем по 'expert' или 'vadim' как фолбек
    const fallback = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.experts,
      [Query.equal("expert", ["expert", "vadim"])]
    );

    if (fallback.documents.length > 0) {
      return JSON.parse(JSON.stringify(fallback.documents[0])) as DB_Expert;
    }

    return null;
  } catch (error) {
    console.error("Error fetching expert:", error);
    return null;
  }
}
