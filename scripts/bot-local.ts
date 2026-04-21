import { Bot, InlineKeyboard } from "grammy";
import * as dotenv from "dotenv";
import { updateClientAction } from "../src/lib/actions/clients";

// Загружаем переменные окружения
dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const expertChatId = process.env.TELEGRAM_LEADS_CHAT_ID;

if (!token) {
  console.error("❌ ОШИБКА: TELEGRAM_BOT_TOKEN не найден в .env");
  process.exit(1);
}

const bot = new Bot(token);

// Функция настройки UI
const setupBotUI = async () => {
  try {
    await bot.api.setMyCommands([
      { command: "start", description: "Запустить бота и получить подарок" },
      { command: "hub", description: "Открыть экспертную платформу" },
      { command: "community", description: "Наше сообщество в Telegram" },
      { command: "support", description: "Связаться с наставником" },
    ]);
    
    await bot.api.setChatMenuButton({
      menu_button: {
        type: "web_app",
        text: "Открыть Hub 🌿",
        web_app: { url: "https://herbalife-os.vercel.app/vadim" }
      }
    });
    console.log("✅ Интерфейс бота успешно сконфигурирован в Telegram");
  } catch (err) {
    console.error("❌ Ошибка настройки интерфейса:", err);
  }
};

// Копируем логику из route.ts
bot.command("setup", async (ctx) => {
  if (String(ctx.chat.id) !== expertChatId) return;
  await setupBotUI();
  await ctx.reply("✅ Интерфейс бота обновлен!");
});

bot.command("start", async (ctx) => {
  const payload = ctx.match;
  const isExpert = String(ctx.chat.id) === expertChatId;

  if (isExpert) {
    const adminKeyboard = new InlineKeyboard()
      .url("Открыть CRM", "https://herbalife-os.vercel.app/vadim/admin").row()
      .url("Лента Media Hub", "https://herbalife-os.vercel.app/vadim/media");

    return ctx.reply(`
💪 *Добро пожаловать, Наставник!*

Вы вошли в режиме управления (Local Polling).
Бот успешно подключен к локальной версии проекта.
    `, { parse_mode: "Markdown", reply_markup: adminKeyboard });
  }

  // Логика лид-магнита
  if (payload && payload.startsWith("client_")) {
    const clientId = payload.replace("client_", "");
    await updateClientAction(clientId, { telegram_chat_id: String(ctx.chat.id) });
    
    const clientKeyboard = new InlineKeyboard()
      .url("🎁 Забрать мой подарок", "https://example.com/meal-plan.pdf").row()
      .webApp("Открыть мой Hub 🌿", "https://herbalife-os.vercel.app/vadim/dashboard");

    return ctx.reply(`
🌿 *Привет! Твой подарок готов!*
Бот связал твой аккаунт и уже готов помогать. Жми кнопку ниже.
    `, { parse_mode: "Markdown", reply_markup: clientKeyboard });
  }

  ctx.reply("Добро пожаловать! Пройдите тест в приложении, чтобы начать работу.");
});

// Доп. команды
bot.command("hub", (ctx) => {
  const keyboard = new InlineKeyboard().webApp("Открыть Hub 🌿", "https://herbalife-os.vercel.app/vadim");
  return ctx.reply("Ваш персональный Hub:", { reply_markup: keyboard });
});

bot.on("message", (ctx) => ctx.reply("Сообщение получено! (Режим Polling активен)"));

console.log("🚀 Бот запущен в режиме Local Polling...");
console.log("Жду сообщений в Телеграм...");

bot.start();
