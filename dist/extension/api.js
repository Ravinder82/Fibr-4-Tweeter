(function() {
  const API = {
    async callGeminiAPIWithSystemPrompt(systemPrompt, userPrompt) {
      if (!this.apiKey || !userPrompt) {
        throw new Error('Missing API key or user prompt');
      }
      if (!this.pageContent) {
        this.pageStatus.textContent = "⚠️ Re-analyzing page before generating content...";
        await this.getAndCachePageContent();
        if (!this.pageContent) throw new Error("Could not get page content to generate content.");
      }
      const conversation = [
        { role: 'user', parts: [{ text: systemPrompt }, { text: userPrompt }] }
      ];
      const response = await chrome.runtime.sendMessage({
        action: 'callGeminiAPI',
        payload: { contents: conversation },
        apiKey: this.apiKey
      });
      if (response.success && response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return response.data.candidates[0].content.parts[0].text;
      } else {
        throw new Error(response.error || 'The AI gave an empty or invalid response.');
      }
    }
  };
  window.TabTalkAPI = API;
})();
