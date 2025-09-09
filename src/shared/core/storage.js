// src/shared/core/storage.js
// Unified storage manager for both extension and web app

export class StorageManager {
  constructor(environment = 'extension') {
    this.environment = environment;
  }

  async saveApiKey(apiKey) {
    if (this.environment === 'extension') {
      return chrome.storage.local.set({ 'geminiApiKey': apiKey, 'apiKeySet': true });
    } else {
      localStorage.setItem('tabtalk_api_key', apiKey);
      localStorage.setItem('apiKeySet', 'true');
    }
  }

  async loadApiKey() {
    if (this.environment === 'extension') {
      const result = await chrome.storage.local.get(['geminiApiKey']);
      return result.geminiApiKey || null;
    } else {
      return localStorage.getItem('tabtalk_api_key') || null;
    }
  }

  async saveChatHistory(domain, history) {
    const key = `chatHistory_${domain}`;
    if (this.environment === 'extension') {
      return chrome.storage.local.set({ [key]: history });
    } else {
      localStorage.setItem(key, JSON.stringify(history));
    }
  }

  async loadChatHistory(domain) {
    const key = `chatHistory_${domain}`;
    if (this.environment === 'extension') {
      const result = await chrome.storage.local.get([key]);
      return result[key] || [];
    } else {
      const history = localStorage.getItem(key);
      return history ? JSON.parse(history) : [];
    }
  }

  async saveSetting(key, value) {
    if (this.environment === 'extension') {
      return chrome.storage.local.set({ [key]: value });
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }

  async loadSetting(key, defaultValue = null) {
    if (this.environment === 'extension') {
      const result = await chrome.storage.local.get([key]);
      return result[key] !== undefined ? result[key] : defaultValue;
    } else {
      const value = localStorage.getItem(key);
      return value !== null ? JSON.parse(value) : defaultValue;
    }
  }

  async clearAll() {
    if (this.environment === 'extension') {
      return chrome.storage.local.clear();
    } else {
      localStorage.clear();
    }
  }
}