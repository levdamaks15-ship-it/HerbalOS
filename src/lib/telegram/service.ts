import { Bot } from "grammy";

// Инициализируем бота только если есть токен
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = token ? new Bot(token) : null;

export const telegramService = {
  // Отправка уведомления о новом лида в группу или личку
  async sendLeadNotification(data: {
    name: string;
    goal: string;
    weight: string;
    height: string;
    bmi: string;
    water: string;
    scheduledTime?: string;
  }, expertSlug: string) {
    if (!bot) return;

    const chatId = process.env.TELEGRAM_LEADS_CHAT_ID;
    if (!chatId) return;

    const expertName = "Эксперт Гербалайф";
    
    const message = `
🚀 *НОВАЯ ЗАЯВКА - HERBAL OS*
--------------------------------
👤 *Имя:* ${data.name || 'Не указано'}
📅 *Эксперт:* ${expertName}
🎯 *Цель:* ${data.goal}
⏰ *Запись:* ${data.scheduledTime || 'Не выбрано'}

📊 *Показатели:*
- Вес: ${data.weight} кг
- Рост: ${data.height} см
- ИМТ: ${data.bmi}
- Вода: ${data.water} л/день

🔗 [Открыть в CRM](https://herbalife-os.vercel.app/${expertSlug}/admin)
--------------------------------
#lead #new
`;

    try {
      await bot.api.sendMessage(chatId, message, { parse_mode: "Markdown" });
      return { success: true };
    } catch (error) {
      console.error("Error sending Telegram notification:", error);
      return { success: false, error };
    }
  },

  // Уведомление о новой истории успеха (модерация)
  async sendStoryModerationNotification(data: {
    clientName: string;
    title: string;
    stats_weight?: string;
    stats_waist?: string;
  }, expertSlug: string) {
    if (!bot) return;
    const chatId = process.env.TELEGRAM_LEADS_CHAT_ID;
    if (!chatId) return;

    const message = `
🔔 *НОВАЯ ИСТОРИЯ НА МОДЕРАЦИИ*
--------------------------------
👤 *Клиент:* ${data.clientName}
📝 *Тема:* ${data.title}
📉 *Итог:* ${data.stats_weight || '?'} кг | ${data.stats_waist || '?'} см

🔗 [Перейти к модерации](https://herbalife-os.vercel.app/${expertSlug}/admin)
--------------------------------
#moderation #ugc
`;

    try {
      await bot.api.sendMessage(chatId, message, { parse_mode: "Markdown" });
    } catch (error) {
      console.error("Error sending story notification:", error);
    }
  },

  // Уведомление об активности (вес/еда)
  async sendActivityNotification(clientName: string, type: string, value: string, expertSlug: string) {
    if (!bot) return;
    const chatId = process.env.TELEGRAM_LEADS_CHAT_ID;
    if (!chatId) return;

    const activity = type === 'weight' ? '⚖️ Замер веса' : '🍽 Дневник питания';
    const detail = type === 'weight' ? `${value} кг` : value;

    const message = `
📊 *АКТИВНОСТЬ КЛИЕНТА*
--------------------------------
👤 *Клиент:* ${clientName}
🏃‍♂️ *Действие:* ${activity}
📝 *Данные:* ${detail}

🔗 [Открыть CRM](https://herbalife-os.vercel.app/${expertSlug}/admin)
--------------------------------
#activity #client_log
`;

    try {
      await bot.api.sendMessage(chatId, message, { parse_mode: "Markdown" });
    } catch (error) {
      console.error("Error sending activity notification:", error);
    }
  },

  // Прямое напоминание клиенту («Огоньки»)
  async sendPersonalReminder(chatId: string, message: string) {
    if (!bot || !chatId) return;

    const formattedMessage = `
🌿 *Herbal OS: Напоминание*
--------------------------------
${message}
--------------------------------
`;

    try {
      await bot.api.sendMessage(chatId, formattedMessage, { parse_mode: "Markdown" });
      return { success: true };
    } catch (error) {
      console.error("Error sending personal reminder:", error);
      return { success: false, error };
    }
  }
};
