import { Bot, webhookCallback, InlineKeyboard } from "grammy";
import { updateClientAction } from "@/lib/actions/clients";

const token = process.env.TELEGRAM_BOT_TOKEN;
const expertChatId = process.env.TELEGRAM_LEADS_CHAT_ID;

if (!token) {
  console.warn("TELEGRAM_BOT_TOKEN is missing.");
}

const bot = new Bot(token || "dummy_token");

// Конфигурация команд и меню (вызывается один раз или принудительно через /setup)
const setupBotUI = async () => {
  try {
    await bot.api.setMyCommands([
      { command: "start", description: "Запустить бота и получить подарок" },
      { command: "hub", description: "Открыть экспертную платформу" },
      { command: "community", description: "Наше сообщество в Telegram" },
      { command: "support", description: "Связаться с наставником" },
    ]);
    
    // Настройка кнопки меню (слева от ввода)
    await bot.api.setChatMenuButton({
      menu_button: {
        type: "web_app",
        text: "Открыть Hub 🌿",
        web_app: { url: "https://herbalife-os.vercel.app/expert" }
      }
    });
    console.log("Bot UI successfully configured");
  } catch (err) {
    console.error("Failed to setup Bot UI:", err);
  }
};

// Команда для принудительной настройки (только для эксперта)
bot.command("setup", async (ctx) => {
  if (String(ctx.chat.id) !== expertChatId) return;
  await setupBotUI();
  await ctx.reply("✅ Интерфейс бота (меню и команды) успешно обновлен!");
});

// Обработка команды /start
bot.command("start", async (ctx) => {
  const payload = ctx.match;
  const isExpert = String(ctx.chat.id) === expertChatId;

  if (isExpert) {
    const adminKeyboard = new InlineKeyboard()
      .url("Открыть CRM", "https://herbalife-os.vercel.app/expert/admin").row()
      .url("Лента Media Hub", "https://herbalife-os.vercel.app/expert/media");

    return ctx.reply(`
💪 *Добро пожаловать, Наставник!*

Вы вошли в режиме управления. Сюда будут приходить:
- Новые заявки (лиды)
- Истории успеха на модерацию
- Уведомления об активности клиентов

Кнопка меню внизу теперь открывает вашу платформу для клиентов.
    `, { parse_mode: "Markdown", reply_markup: adminKeyboard });
  }

  // Логика для клиента
  if (payload && payload.startsWith("client_")) {
    const clientId = payload.replace("client_", "");
    const chatId = String(ctx.chat.id);
    
    const clientKeyboard = new InlineKeyboard()
      .url("🎁 Забрать мой подарок", "https://example.com/meal-plan.pdf").row()
      .webApp("Открыть мой Hub 🌿", "https://herbalife-os.vercel.app/expert/dashboard");

    const result = await updateClientAction(clientId, { telegram_chat_id: chatId });
    
    if (result.success) {
      return ctx.reply(`
🌿 *Добро пожаловать в Herbal OS!*

Я ваш персональный ассистент по питанию и дисциплине. Мы успешно связали ваш аккаунт! 

🎁 *Ваш обещанный подарок:*
Мы подготовили для вас [План питания на 7 дней](https://example.com/meal-plan.pdf), который поможет вам сделать первые шаги к цели максимально эффективно.

📲 *Что теперь?*
- Теперь я буду присылать вам напоминания о воде и приемах пищи.
- Вы можете писать мне любые вопросы, и ваш эксперт увидит их.
- Ваши результаты будут под надежным контролем!

Давайте достигать целей вместе! 💪
      `, { parse_mode: "Markdown", reply_markup: clientKeyboard });
    }
  }

  // Логика для гостя (если зашел просто так)
  const chatId = String(ctx.chat.id);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://herbalife-os.vercel.app";
  
  const guestKeyboard = new InlineKeyboard()
    .webApp("🚀 Пройти Wellness-тест", `${baseUrl}/expert/quiz?chat_id=${chatId}`)
    .row()
    .url("🌐 Открыть Media Hub", `${baseUrl}/expert/media`);

  return ctx.reply(`
🌿 *Добро пожаловать в Herbal OS!*

Я ваш персональный ассистент по здоровому образу жизни. Чтобы я мог подобрать для вас идеальный план питания и выдать подарок, мне нужно немного узнать о вас.

Нажмите кнопку ниже, чтобы пройти быстрый *Wellness-тест*. Это займет всего 2 минуты, и вы сразу получите расшифровку своих показателей! 👇
  `, { parse_mode: "Markdown", reply_markup: guestKeyboard });
});

// Быстрые ссылки
bot.command("hub", (ctx) => {
  const keyboard = new InlineKeyboard().webApp("Запустить Hub 🌿", "https://herbalife-os.vercel.app/expert");
  return ctx.reply("Нажми кнопку ниже, чтобы открыть платформу прямо здесь, в Telegram:", { reply_markup: keyboard });
});

bot.command("community", (ctx) => {
  const keyboard = new InlineKeyboard().url("Вступить в сообщество", "https://t.me/herbalife_os_community");
  return ctx.reply("Присоединяйся к нашему закрытому сообществу, где мы делимся рецептами, результатами и мотивацией! 📂", { reply_markup: keyboard });
});

bot.command("support", (ctx) => {
  return ctx.reply("Есть вопрос? Напишите вашему эксперту в личные сообщения. Мы всегда на связи, чтобы помочь вам! 🌿");
});

bot.command("id", (ctx) => ctx.reply(`ID этого чата: ${ctx.chat.id}`));

// Хранилище для обработанных ID (в памяти инстанса Vercel)
const processedUpdates = new Set<number>();

// Очистка старых ID каждые 5 минут (примерно)
setInterval(() => processedUpdates.clear(), 1000 * 60 * 5);

// Обработка текстовых сообщений через AI
bot.on("message:text", async (ctx) => {
  const updateId = ctx.update.update_id;
  const chatId = String(ctx.chat.id);
  
  // 1. ЖЕСТКАЯ ДЕДУПЛИКАЦИЯ ЧЕРЕЗ APPWRITE
  try {
    const { createAdminClient } = await import("@/lib/appwrite/server");
    const { APPWRITE_CONFIG } = await import("@/lib/appwrite/config");
    const { Query } = await import("node-appwrite");
    const { databases } = await createAdminClient();

    // Проверяем, не обрабатывали ли мы этот updateId за последние 10 минут
    const existing = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.logs,
      [Query.equal("message", [String(updateId)]), Query.equal("type", ["bot_update"])]
    );

    if (existing.documents.length > 0) {
      console.log(`[Bot] Appwrite: Skipping duplicate update ${updateId}`);
      return;
    }

    // Регистрируем начало обработки
    await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.logs,
      "unique()",
      {
        type: "bot_update",
        message: String(updateId),
        userId: chatId, // Используем chatId как идентификатор
        timestamp: new Date().toISOString()
      }
    );
  } catch (dbErr) {
    console.error("[Bot] Deduplication error:", dbErr);
    // Если база лежит, продолжаем на свой страх и риск, но логируем
  }

  console.log(`[Bot] Processing update ${updateId} from ${ctx.from?.id}`);

  // Не отвечаем сами себе (эксперту)
  if (chatId === expertChatId) return;

  const userMessage = ctx.message.text;
  const clientName = ctx.from?.first_name || "Клиент";

  try {
    const { aiService } = await import("@/lib/ai/service");
    
    // Добавляем гонку: AI против таймаута Vercel (8 сек)
    const aiPromise = aiService.getBotResponse(userMessage, {
      expertName: "Эксперт Гербалайф",
      clientName: clientName,
      apiKey: process.env.GOOGLE_AI_API_KEY
    });

    const timeoutPromise = new Promise<string>((resolve) => 
      setTimeout(() => resolve("TIMEOUT_REACHED"), 9200)
    );

    const result = await Promise.race([aiPromise, timeoutPromise]);

    if (result === "TIMEOUT_REACHED") {
      console.log(`[Bot] AI is too slow for update ${updateId}, sending placeholder`);
      return await ctx.reply("Я почти нашел ответ... Секундочку! 🌿");
    }

    let aiResponse = result as string;
    const slug = "expert"; // Слаг эксперта для бота

    // ПРОВЕРКА НА ЗОВ НАСТАВНИКА
    if (aiResponse.includes("[CALL_MENTOR]")) {
      aiResponse = aiResponse.replace("[CALL_MENTOR]", "").trim();
      
      const { telegramService } = await import("@/lib/telegram/service");
      await telegramService.sendSupportRequest(clientName, userMessage, chatId, slug);
      console.log(`[Bot] Support request sent for update ${updateId}`);
    }

    return await ctx.reply(aiResponse);
  } catch (err) {
    console.error(`[Bot] Error in update ${updateId}:`, err);
    return await ctx.reply("Ваше сообщение получено. Я скоро вернусь с ответом! 🌿");
  }
});

export const POST = webhookCallback(bot, "std/http", {
  timeoutMilliseconds: 9000, // Чуть меньше лимита Vercel
});
