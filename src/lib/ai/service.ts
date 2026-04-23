export const aiService = {
  async getBotResponse(userMessage: string, context: { expertName: string; clientName?: string; apiKey?: string }) {
    const key = context.apiKey?.trim();
    if (!key) return "Ошибка: API ключ не найден.";

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (!response.ok) {
        return `❌ Ошибка ListModels (${response.status}): ${data.error?.message || 'Unknown'}`;
      }

      const modelNames = data.models?.map((m: any) => m.name.replace('models/', '')) || [];
      
      if (modelNames.length === 0) {
        return "❌ Google говорит, что для вашего ключа доступных моделей НЕТ. Попробуйте создать новый ключ под VPN (США/Европа).";
      }

      return `✅ Доступные модели: ${modelNames.join(", ")}\n\nПопробуйте одну из них.`;
    } catch (e: any) {
      return `❌ Ошибка диагностики: ${e.message}`;
    }
  }
};
