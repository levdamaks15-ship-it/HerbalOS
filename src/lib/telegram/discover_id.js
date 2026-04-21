async function getChatId() {
  const TOKEN = '8659068639:AAFkuI-hx5btxdkyGJUiuHoyiaYL42C_3B4';
  try {
    const response = await fetch(`https://api.telegram.org/bot${TOKEN}/getUpdates`);
    const data = await response.json();
    const updates = data.result;
    
    if (!updates || updates.length === 0) {
      console.log("NO_UPDATES: Пожалуйста, добавьте бота в группу и напишите /id");
      return;
    }

    // Ищем последнее сообщение или добавление в чат
    const lastUpdate = updates[updates.length - 1];
    const message = lastUpdate.message || lastUpdate.channel_post;
    const chatId = message?.chat.id || lastUpdate.my_chat_member?.chat.id;
    const chatTitle = message?.chat.title || lastUpdate.my_chat_member?.chat.title;

    if (chatId) {
      console.log(`FOUND_CHAT_ID: ${chatId} (${chatTitle || 'Private'})`);
    } else {
      console.log("NOT_FOUND: Не удалось найти ID. Напишите что-нибудь в группу.");
    }
  } catch (error) {
    console.error("ERROR:", error.message);
  }
}

getChatId();
