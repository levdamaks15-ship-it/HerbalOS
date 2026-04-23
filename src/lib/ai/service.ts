import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_AI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export const aiService = {
  async getBotResponse(userMessage: string, context: { expertName: string; clientName?: string }) {
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
    } catch (error) {
      console.error("AI Service Error:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return `⚠️ Ошибка AI: ${errorMessage.substring(0, 100)}... Попробуйте позже или дождитесь наставника! 🙏`;
    }

  }
};
