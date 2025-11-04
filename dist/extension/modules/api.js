(function() {
  const API = {
    /**
     * ROBUST RETRY LOGIC with exponential backoff
     * Automatically handles rate limiting and transient errors
     */
    async callWithRetry(apiCallFn, maxRetries = 3, initialDelay = 5000) {
      let lastError = null;
      
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          // Show user feedback about retry attempts
          if (attempt > 0) {
            const explicitDelay = (lastError && Number.isFinite(lastError.retryAfterMs)) ? lastError.retryAfterMs : null;
            const delay = explicitDelay ?? (initialDelay * Math.pow(2, attempt - 1));
            if (this.showProgressBar) {
              this.showProgressBar(`⏱️ Waiting ${Math.ceil(delay / 1000)}s before retry ${attempt}/${maxRetries}...`);
            }
            await this.sleep(delay);
          }
          
          // Make the API call
          return await apiCallFn();
          
        } catch (error) {
          lastError = error;
          const errorMsg = error.message || '';
          
          // Check if it's a temporary service error
          const isTemporary = errorMsg.includes('503') || 
                             errorMsg.includes('500') ||
                             errorMsg.includes('UNAVAILABLE');
          
          // If it's a retryable error and we have retries left
          if ((isTemporary || Number.isFinite(error.retryAfterMs)) && attempt < maxRetries) {
            console.log(`API retry ${attempt + 1}/${maxRetries}: ${errorMsg}`);
            continue;
          }
          
          // If it's a non-retryable error or we're out of retries
          throw error;
        }
      }
      
      // If we exhausted all retries
      throw new Error(lastError?.message || 'Request failed after multiple retries');
    },
    
    /**
     * Helper: Sleep for specified milliseconds
     */
    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    },
    
    async callGeminiAPIWithSystemPrompt(systemPrompt, userPrompt) {
      // Direct API call without scheduler
      return await this.callWithRetry(async () => {
        try {
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
          
          // Show user that request is being sent
          if (this.showProgressBar) {
            this.showProgressBar('📤 Sending request to AI...');
          }
          
          const response = await chrome.runtime.sendMessage({
            action: 'callGeminiAPI',
            payload: { contents: conversation },
            apiKey: this.apiKey
          });
          
          if (response?.rateLimited) {
            const err = new Error(response.error || 'API request limit reached');
            if (Number.isFinite(response.retryAfter)) err.retryAfterMs = response.retryAfter;
            throw err;
          }
          if (response.success && response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
            return response.data.candidates[0].content.parts[0].text;
          } else {
            throw new Error(response.error || 'The AI gave an empty or invalid response.');
          }
        } catch (error) {
          // Special handling for extension context invalidated (common during development)
          if (error.message && error.message.includes("Extension context invalidated")) {
            console.warn("Extension context invalidated - this is normal during development");
            throw new Error("Extension context invalidated. Please refresh the page and try again.");
          }
          throw error;
        }
      }, 3, 5000);
    },

    async callGeminiAPI(prompt) {
      return await this.callWithRetry(async () => {
        try {
          // Always get API key from storage for this method since it's used by standalone modules
          const apiKey = await this.getStoredApiKey();
          if (!apiKey || !prompt) {
            throw new Error('Missing API key or prompt');
          }
          
          console.log('API Module: Making API call with key present:', !!apiKey);
          
          const conversation = [
            { role: 'user', parts: [{ text: prompt }] }
          ];
          
          // Show user that request is being sent
          if (this.showProgressBar) {
            this.showProgressBar('📤 Sending request to AI...');
          }
          
          const response = await chrome.runtime.sendMessage({
            action: 'callGeminiAPI',
            payload: { contents: conversation },
            apiKey: apiKey
          });
          if (response?.rateLimited) {
            const err = new Error(response.error || 'API request limit reached');
            if (Number.isFinite(response.retryAfter)) err.retryAfterMs = response.retryAfter;
            throw err;
          }
          if (response.success && response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
            return response.data.candidates[0].content.parts[0].text;
          } else {
            console.error('API Module: API response error:', response);
            throw new Error(response.error || 'The AI gave an empty or invalid response.');
          }
        } catch (error) {
          // Special handling for extension context invalidated (common during development)
          if (error.message && error.message.includes("Extension context invalidated")) {
            throw new Error("Extension was reloaded. Please refresh the page and try again.");
          }
          throw error;
        }
      }, 3, 5000); // 3 retries, starting with 5 second delay
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
  window.FibrAPI = API;
  window.TabTalkAPI = API;
})();
