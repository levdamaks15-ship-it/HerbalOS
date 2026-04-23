export const aiService = {
  async getBotResponse(userMessage: string, context: { expertName: string; clientName?: string; apiKey?: string }) {
    const key = context.apiKey?.trim();
    if (!key) return "Ошибка: API ключ не найден.";

    const prompt = `Ты — ассистент эксперта ${context.expertName}. Ответь клиенту ${context.clientName || "Гость"}: ${userMessage}`;

    async function fetchAI(apiVersion: string, modelName: string) {
      const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${modelName}:generateContent?key=${key}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(`${modelName} (${apiVersion}): ${err.error?.message || response.statusText}`);
      }
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text;
    }

    // Расширенная цепочка попыток
    const models = [
      { v: "v1beta", m: "gemini-1.5-flash-latest" },
      { v: "v1beta", m: "gemini-1.5-flash" },
      { v: "v1", m: "gemini-1.5-flash" },
      { v: "v1", m: "gemini-pro" },
      { v: "v1beta", m: "gemini-pro" }
    ];

    let errors = [];
    for (const model of models) {
      try {
        const result = await fetchAI(model.v, model.m);
        if (result) return result;
      } catch (e: any) {
        errors.push(e.message);
      }
    }

    return `❌ Ни одна модель не ответила. Ошибки:\n${errors.join("\n")}`;
  }
};
