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
    },

    async callGeminiAPI(prompt) {
      // Always get API key from storage for this method since it's used by standalone modules
      const apiKey = await this.getStoredApiKey();
      if (!apiKey || !prompt) {
        throw new Error('Missing API key or prompt');
      }
      
      console.log('API Module: Making API call with key present:', !!apiKey);
      
      const conversation = [
        { role: 'user', parts: [{ text: prompt }] }
      ];
      const response = await chrome.runtime.sendMessage({
        action: 'callGeminiAPI',
        payload: { contents: conversation },
        apiKey: apiKey
      });
      if (response.success && response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return response.data.candidates[0].content.parts[0].text;
      } else {
        console.error('API Module: API response error:', response);
        throw new Error(response.error || 'The AI gave an empty or invalid response.');
      }
    },

    async getStoredApiKey() {
      return new Promise((resolve) => {
        chrome.storage.local.get(['geminiApiKey'], (result) => {
          const key = result.geminiApiKey || '';
          console.log('API Module: Retrieved API key from storage, length:', key?.length);
          resolve(key);
        });
      });
    }
  };
  window.TabTalkAPI = API;
})();
