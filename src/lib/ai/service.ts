export const aiService = {
  async getBotResponse(userMessage: string, context: { expertName: string; clientName?: string; apiKey?: string }) {
    const key = context.apiKey?.trim();
    if (!key) return "Ошибка: API ключ не найден.";

    const prompt = `Ты — ассистент эксперта Гербалайф ${context.expertName}. 
Твоя цель: кратко и позитивно отвечать клиенту (${context.clientName || "Гость"}).
Используй эмодзи 🌿, 💪, 🥗. Если вопрос сложный — зови наставника.
Вопрос: ${userMessage}`;

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
      // Возвращаемся к самой стабильной модели
      return await fetchAI("gemini-flash-latest");
    } catch (e: any) {
      try {
        // Если основная лежит, пробуем 2.0
        return await fetchAI("gemini-2.0-flash");
      } catch (fallbackError: any) {
        return `⚠️ Ошибка: ${fallbackError.message}`;
      }
    }
  }
};
