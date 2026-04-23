export const aiService = {
  async getBotResponse(userMessage: string, context: { expertName: string; clientName?: string; apiKey?: string }) {
    const key = context.apiKey?.trim();
    if (!key) return "Ошибка: API ключ не найден.";

    const prompt = `
Ты — умный и дружелюбный ассистент эксперта по здоровому образу жизни и питанию (Гербалайф).
Твоя цель: помогать клиентам эксперта ${context.expertName}, отвечать на вопросы о питании, продуктах и мотивации.

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

    async function fetchAI(modelName: string) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${key}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      if (!response.ok) throw new Error(`Status ${response.status}`);
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text;
    }

    try {
      // Используем проверенную модель из твоего списка
      return await fetchAI("gemini-flash-latest");
    } catch (e: any) {
      try {
        // Запасной вариант тоже из списка
        return await fetchAI("gemini-2.0-flash");
      } catch (fallbackError: any) {
        return `⚠️ Ошибка: ${fallbackError.message}`;
      }
    }
  }
};
