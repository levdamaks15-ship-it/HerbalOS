"use server";

import { telegramService } from "@/lib/telegram/service";
import { databases, APPWRITE_CONFIG } from "@/lib/appwrite/config";
import { ID } from "appwrite";

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
    // Сохраняем как нового "клиента" со статусом inactive (лид)
    await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.clients,
      ID.unique(),
      {
        name: formData.name,
        expert_slug: slug,
        status: "inactive", 
        goal: formData.goal,
        weight_start: parseFloat(formData.weight),
        weight_current: parseFloat(formData.weight),
        lastActive: "Пройден Wellness-тест",
        progress: 0
      }
    );
  } catch (error) {
    console.error("Failed to save quiz to DB:", error);
  }
  
  // Отправляем уведомление в Telegram
  await telegramService.sendLeadNotification(formData, slug);
  
  return { success: true };
}
