import { GoogleGenerativeAI } from "@google/generative-ai";

export const aiService = {
  async getBotResponse(userMessage: string, context: { expertName: string; clientName?: string; apiKey?: string }) {
    const key = context.apiKey?.trim();
    if (!key) {
      return "Извините, мой 'мозг' (AI) сейчас не настроен (нет ключа). Пожалуйста, подождите эксперта! 🌿";
    }

    const genAI = new GoogleGenerativeAI(key);
    if (!genAI) {
      return "Извините, мой 'мозг' (AI) сейчас не настроен. Пожалуйста, подождите эксперта! 🌿";
    }

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
Ты — умный и дружелюбный ассистент эксперта по здоровому образу жизни и питанию (Гербалайф).
Твоя цель: помогать клиентам эксперта ${context.expertName}, отвечать на вопросы о питанию, продуктах и мотивации.

Правила общения:
1. Будь вежливым, позитивным и вдохновляющим.
2. Используй эмодзи (🌿, 💪, 🥗, ✨).
3. Если тебя спрашивают о продуктах Гербалайф, отвечай профессионально, подчеркивая их пользу для сбалансированного питания.
4. Если клиент жалуется на плохое самочувствие или задает очень сложный медицинский вопрос — вежливо посоветуй обратиться к наставнику ${context.expertName} или врачу.
5. Не выдумывай факты. Если чего-то не знаешь — предложи подождать ответа наставника.
6. Отвечай кратко и по делу (не более 2-3 абзацев).

Имя клиента: ${context.clientName || "Гость"}
Вопрос клиента: ${userMessage}
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      console.error("AI Service Error:", error);
      const errorStr = JSON.stringify(error, null, 2);
      const message = error?.message || String(error);
      return `⚠️ Ошибка AI: ${message.substring(0, 150)}... [Debug: ${errorStr.substring(0, 50)}]`;
    }

  }
};
