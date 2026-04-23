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

  return ctx.reply("Добро пожаловать в Herbal OS! Бот готов помогать вам в достижении целей по здоровью и весу.");
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

bot.on("message:text", (ctx) => {
  if (String(ctx.chat.id) === expertChatId) return;
  return ctx.reply("Ваше сообщение получено экспертом. Мы ответим вам в ближайшее время! 🌿");
});

export const POST = webhookCallback(bot, "std/http");
