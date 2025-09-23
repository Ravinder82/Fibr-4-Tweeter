(function() {
  const Storage = {
    async getStorageItem(key) {
      try {
        const data = await chrome.storage.local.get([key]);
        return data ? data[key] : undefined;
      } catch (error) {
        console.error('getStorageItem error:', error);
        return undefined;
      }
    },

    async setStorageItem(key, value) {
      try {
        await chrome.storage.local.set({ [key]: value });
        return true;
      } catch (error) {
        console.error('setStorageItem error:', error);
        return false;
      }
    },

    async loadState() {
      try {
        const data = await chrome.storage.local.get(['geminiApiKey', 'apiKey', 'chatHistory']);
        console.log('TabTalk AI: Loading state, API key exists:', !!data.geminiApiKey);
        if (data.geminiApiKey || data.apiKey) {
          this.apiKey = data.geminiApiKey || data.apiKey;
          console.log('TabTalk AI: API key loaded successfully');
          if (this.apiKeyInput) this.apiKeyInput.value = this.apiKey;
        }
        if (this.currentTab) {
          const url = new URL(this.currentTab.url);
          this.currentDomain = url.hostname;
          if (this.pageTitle) {
            this.pageTitle.textContent = this.currentTab.title || 'Untitled Page';
            console.log('TabTalk AI: Page title set to:', this.pageTitle.textContent);
          }
          if (data.chatHistory && data.chatHistory[this.currentDomain]) {
            this.chatHistory = data.chatHistory[this.currentDomain];
          }
        }
        return data;
      } catch (error) {
        console.error('Failed to load state:', error);
        throw error;
      }
    },

    async saveState() {
      if (!this.currentDomain) return;
      const data = {};
      if (this.apiKey) {
        data.geminiApiKey = this.apiKey;
      }
      const chatHistoryObj = {};
      chatHistoryObj[this.currentDomain] = this.chatHistory;
      data.chatHistory = chatHistoryObj;
      await chrome.storage.local.set(data);
    },

    async saveApiKey(apiKey) {
      this.apiKey = apiKey;
      try {
        await chrome.storage.local.set({ geminiApiKey: apiKey, apiKey, hasSeenWelcome: true });
        console.log('TabTalk AI: API key saved');
      } catch (e) {
        await this.setStorageItem('apiKey', apiKey);
        await this.setStorageItem('hasSeenWelcome', true);
      }
    },


    async handleDeleteApiKey() {
      if (!confirm('Delete your API key? You will need to set it up again.')) return;
      try {
        await chrome.storage.local.remove(['geminiApiKey', 'apiKey']);
        this.apiKey = null;
        if (this.apiKeyInput) this.apiKeyInput.value = '';
        // Reset in-memory state and UI to avoid messy view
        this.pageContent = null;
        this.chatHistory = [];
        // Persist cleared chat history object
        await chrome.storage.local.set({ chatHistory: {} });
        // Hide quick actions and clear messages area
        if (this.updateQuickActionsVisibility) this.updateQuickActionsVisibility();
        if (this.messagesContainer) this.messagesContainer.innerHTML = '';
        // Reset onboarding flag and show welcome view
        await this.setStorageItem('hasSeenWelcome', false);
        this.showView('welcome');
        console.log('TabTalk AI: API key deleted');
      } catch (error) {
        console.error('Error deleting API key:', error);
        alert('Error deleting API key. Please try again.');
      }
    },
    
    // NEW: Saved Content Methods
    async getSavedContent() {
      const result = await this.getStorageItem('savedContent');
      return result || {};
    },
    
    async saveContent(category, contentData) {
      const savedContent = await this.getSavedContent();
      if (!savedContent[category]) savedContent[category] = [];
      
      const item = {
        id: Date.now().toString(),
        ...contentData,
        timestamp: Date.now()
      };
      
      // Add to beginning of array (most recent first)
      savedContent[category].unshift(item);
      
      // Limit to 50 items per category to prevent storage issues
      if (savedContent[category].length > 50) {
        savedContent[category] = savedContent[category].slice(0, 50);
      }
      
      await this.setStorageItem('savedContent', savedContent);
      console.log(`TabTalk AI: Content saved to ${category} category`);
      return item.id;
    },
    
    async deleteSavedContent(category, itemId) {
      const savedContent = await this.getSavedContent();
      if (savedContent[category]) {
        savedContent[category] = savedContent[category].filter(item => item.id !== itemId);
        await this.setStorageItem('savedContent', savedContent);
        console.log(`TabTalk AI: Content deleted from ${category} category`);
      }
    },
    
    async isContentSaved(category, contentId) {
      const savedContent = await this.getSavedContent();
      return savedContent[category]?.some(item => item.id === contentId) || false;
    }
  };
  window.TabTalkStorage = Storage;
})();
