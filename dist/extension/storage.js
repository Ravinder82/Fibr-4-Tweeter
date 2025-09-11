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
        const data = await chrome.storage.local.get(['geminiApiKey', 'apiKey', 'darkMode', 'chatHistory']);
        console.log('TabTalk AI: Loading state, API key exists:', !!data.geminiApiKey);
        if (data.geminiApiKey || data.apiKey) {
          this.apiKey = data.geminiApiKey || data.apiKey;
          console.log('TabTalk AI: API key loaded successfully');
          if (this.apiKeyInput) this.apiKeyInput.value = this.apiKey;
        }
        if (data.darkMode !== undefined) {
          this.isDarkMode = data.darkMode;
          if (this.darkModeToggle) this.darkModeToggle.checked = this.isDarkMode;
          document.body.classList.toggle('dark-mode', this.isDarkMode);
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
      data.darkMode = this.isDarkMode;
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

    // Category-wise History Management for future History page
    async addToHistory(category, record) {
      try {
        const { history = {} } = await chrome.storage.local.get(['history']);
        const list = Array.isArray(history[category]) ? history[category] : [];
        list.unshift(record);
        // Keep only latest 50 per category
        history[category] = list.slice(0, 50);
        await chrome.storage.local.set({ history });
        return true;
      } catch (err) {
        console.error('addToHistory error:', err);
        return false;
      }
    },

    async getHistory(category = null) {
      try {
        const { history = {} } = await chrome.storage.local.get(['history']);
        return category ? (history[category] || []) : history;
      } catch (err) {
        console.error('getHistory error:', err);
        return category ? [] : {};
      }
    },

    async clearHistoryCategory(category) {
      try {
        const { history = {} } = await chrome.storage.local.get(['history']);
        if (history[category]) delete history[category];
        await chrome.storage.local.set({ history });
        return true;
      } catch (err) {
        console.error('clearHistoryCategory error:', err);
        return false;
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
    }
  };
  window.TabTalkStorage = Storage;
})();
