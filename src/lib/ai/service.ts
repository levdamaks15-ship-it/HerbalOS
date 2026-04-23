export const aiService = {
  async getBotResponse(userMessage: string, context: { expertName: string; clientName?: string; apiKey?: string }) {
    const key = context.apiKey?.trim();
    if (!key) {
      return "Извините, мой 'мозг' (AI) сейчас не настроен (нет ключа). Пожалуйста, подождите эксперта! 🌿";
    }

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

    // Прямой запрос к API через fetch (обходим проблемы SDK)
    async function tryModel(modelName: string) {
      const url = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${key}`;
      
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP ${response.status}: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text;
    }

    try {
      // Пробуем Flash
      return await tryModel("gemini-1.5-flash");
    } catch (e: any) {
      console.warn("Flash failed, trying Pro...", e.message);
      try {
        // Пробуем Pro
        return await tryModel("gemini-1.5-pro");
      } catch (fallbackError: any) {
        console.error("All models failed:", fallbackError);
        return `⚠️ Ошибка API: ${fallbackError.message.substring(0, 200)}`;
      }
    }
  }
};
