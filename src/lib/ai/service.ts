export const aiService = {
  async getBotResponse(userMessage: string, context: { expertName: string; clientName?: string; apiKey?: string }) {
    const key = context.apiKey?.trim();
    if (!key) return "Ошибка: API ключ не найден.";

    const prompt = `Ты — ассистент эксперта ${context.expertName}. Ответь кратко клиенту ${context.clientName || "Гость"}: ${userMessage}`;

    async function fetchAI(apiVersion: string, modelName: string) {
      const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${modelName}:generateContent?key=${key}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      if (!response.ok) throw new Error(`Status ${response.status}`);
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text;
    }

    // Цепочка попыток: сначала современные, потом стабильные
    try {
      return await fetchAI("v1beta", "gemini-1.5-flash");
    } catch (e1) {
      try {
        return await fetchAI("v1", "gemini-pro");
      } catch (e2) {
        try {
          return await fetchAI("v1beta", "gemini-pro");
        } catch (e3) {
           return "⚠️ Все модели AI недоступны для этого ключа. Проверьте статус в Google AI Studio.";
        }
      }
    }
  }
};
