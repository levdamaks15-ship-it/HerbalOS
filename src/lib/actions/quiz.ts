"use server";

import { telegramService } from "@/lib/telegram/service";
import { createAdminClient } from "@/lib/appwrite/server";
import { APPWRITE_CONFIG } from "@/lib/appwrite/config";
import { ID } from "node-appwrite";

interface QuizResults {
  name: string;
  weight: string;
  height: string;
  goal: string;
  bmi: string;
  water: string;
  scheduledTime?: string;
}

export async function onQuizCompleteAction(formData: QuizResults, slug: string) {
  console.log("Quiz completed on server for slug:", slug, formData);
  
  try {
    const { databases } = await createAdminClient();

    // Сохраняем как нового "клиента" со статусом inactive (лид)
    await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.clients,
      ID.unique(),
      {
        name: formData.name,
        expert: slug,
        status: "inactive", 
        goal: formData.goal,
        weight_start: parseFloat(formData.weight),
        weight_current: parseFloat(formData.weight),
        lastActive: "Пройден Wellness-тест",
        progress: 0
      }
    );
    console.log("✅ Quiz saved successfully to Appwrite");
  } catch (error: any) {
    console.error("❌ Appwrite Error:", error.message);
    console.error("Full Error Object:", JSON.stringify(error, null, 2));
    return { success: false, error: error.message };
  }
  
  // Отправляем уведомление в Telegram
  await telegramService.sendLeadNotification(formData, slug);
  
  return { success: true };
}
