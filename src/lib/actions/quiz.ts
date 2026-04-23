"use server";

import { telegramService } from "@/lib/telegram/service";
import { createAdminClient } from "@/lib/appwrite/server";
import { APPWRITE_CONFIG } from "@/lib/appwrite/config";
import { ID } from "node-appwrite";

interface QuizResults {
  name: string;
  email?: string;
  password?: string;
  weight: string;
  height: string;
  goal: string;
  bmi: string;
  water: string;
  scheduledTime?: string;
  telegram_chat_id?: string;
}

export async function onQuizCompleteAction(formData: QuizResults, slug: string) {
  console.log("Quiz completed on server for slug:", slug, formData);
  
  try {
    const { databases, users } = await createAdminClient();
    let userId = null;

    // 1. Пытаемся создать аккаунт пользователя, если есть email и пароль
    if (formData.email && formData.password) {
      try {
        const newUser = await users.create(
          ID.unique(),
          formData.email,
          undefined, // phone
          formData.password,
          formData.name
        );
        userId = newUser.$id;
        console.log("👤 Appwrite User created:", userId);
      } catch (userError) {
        const err = userError as Error;
        console.error("⚠️ Failed to create user (might already exist):", err.message);
        // Если пользователь уже есть, мы всё равно сохраним анкету
      }
    }

    // 2. Сохраняем анкету клиента и привязываем userId
    const clientDoc = await databases.createDocument(
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
        progress: 0,
        userId: userId, // Привязываем аккаунт к анкете
        telegram_chat_id: formData.telegram_chat_id
      }
    );
    console.log("✅ Quiz saved successfully to Appwrite with userId:", userId);
    
    // Отправляем уведомление в Telegram с ID клиента
    await telegramService.sendLeadNotification({
      ...formData,
      clientId: clientDoc.$id
    }, slug);
  } catch (error) {
    const err = error as Error;
    console.error("❌ Appwrite Error:", err.message);
    return { success: false, error: err.message };
  }
  
  return { success: true };
}
