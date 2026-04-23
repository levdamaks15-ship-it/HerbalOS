export const aiService = {
  async getBotResponse(userMessage: string, context: { expertName: string; clientName?: string; apiKey?: string }) {
    const key = context.apiKey?.trim();
    if (!key) return "Ошибка: API ключ не найден в переменных окружения.";

    const prompt = `Ты — ассистент эксперта ${context.expertName}. Клиент ${context.clientName || "Гость"} спрашивает: ${userMessage}`;

    let lastError = "";

    async function fetchAI(apiVersion: string, modelName: string) {
      const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${modelName}:generateContent?key=${key}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(`[${response.status} ${response.statusText}] ${data.error?.message || 'No detail'}`);
      }
      
      return data.candidates?.[0]?.content?.parts?.[0]?.text;
    }

    try {
      return await fetchAI("v1beta", "gemini-1.5-flash");
    } catch (e1: any) {
      lastError = `1.5-Flash failed: ${e1.message}`;
      try {
        return await fetchAI("v1", "gemini-pro");
      } catch (e2: any) {
        lastError += ` | Pro failed: ${e2.message}`;
        return `❌ AI Error Debug:\n${lastError}`;
      }
    }
  }
};
