(function() {
  const API = {
    async callGeminiAPI(message) {
      if (!this.pageContent) {
        this.pageStatus.textContent = "⚠️ Re-analyzing page before sending...";
        await this.getAndCachePageContent();
        if (!this.pageContent) throw new Error("Could not get page content to answer your question.");
      }
      console.log("Popup: Sending this key to background for API call:", this.apiKey);
      const systemPrompt = `You are TabTalk AI, a cutting-edge assistant.\n\nYou are given the following structured data extracted from the user's current browser tab:\n\n${this.pageContent}\n\n---INSTRUCTIONS---\n- Only answer using the provided content, metadata, and site type.\n- If the answer cannot be found in the content, respond: 'Sorry, I can only answer based on the content of this page.'\n- Use the site type and metadata to tailor your answer:\n  * For news: summarize, extract key facts, or answer questions about the article.\n  * For docs: explain, summarize, or help with technical details.\n  * For blogs: summarize, extract main ideas, or answer about the post.\n  * For forums: summarize the thread, list participants, or answer about the discussion.\n  * For ecommerce: summarize product info, price, and availability.\n  * For generic webpages: answer as best as possible from the content.\n- Be concise, use Markdown formatting, and never use outside knowledge.\n---END INSTRUCTIONS---`;
      const conversation = [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: "Okay, I will only answer using the provided page data and instructions." }] }
      ];
      this.chatHistory.forEach(msg => conversation.push({ role: msg.role, parts: [{ text: msg.content }] }));
      conversation.push({ role: 'user', parts: [{ text: message }] });
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
