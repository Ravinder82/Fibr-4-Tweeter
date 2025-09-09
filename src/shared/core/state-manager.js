// src/shared/core/state-manager.js
// Unified state manager for both extension and web app

import { StorageManager } from './storage.js';

export class StateManager {
  constructor(environment = 'extension') {
    this.environment = environment;
    this.storage = new StorageManager(environment);
    this.state = {
      apiKey: null,
      chatHistory: [],
      currentDomain: null,
      isDarkMode: false,
      isLoading: false
    };
  }

  async loadState() {
    // Load API key
    this.state.apiKey = await this.storage.loadApiKey();
    
    // Load dark mode setting
    this.state.isDarkMode = await this.storage.loadSetting('darkMode', false);
    
    // Load current domain if available
    if (this.environment === 'extension') {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab) {
        this.state.currentDomain = new URL(tab.url).hostname;
      }
    }
    
    // Load chat history for current domain
    if (this.state.currentDomain) {
      this.state.chatHistory = await this.storage.loadChatHistory(this.state.currentDomain);
    }
    
    return this.state;
  }

  async saveState() {
    // Save API key
    if (this.state.apiKey) {
      await this.storage.saveApiKey(this.state.apiKey);
    }
    
    // Save dark mode setting
    await this.storage.saveSetting('darkMode', this.state.isDarkMode);
    
    // Save chat history for current domain
    if (this.state.currentDomain && this.state.chatHistory.length > 0) {
      await this.storage.saveChatHistory(this.state.currentDomain, this.state.chatHistory);
    }
  }

  async deleteApiKey() {
    await this.storage.deleteApiKey();
    this.state.apiKey = null;
  }

  updateApiKey(apiKey) {
    this.state.apiKey = apiKey;
  }

  updateChatHistory(history) {
    this.state.chatHistory = history;
  }

  updateCurrentDomain(domain) {
    this.state.currentDomain = domain;
  }

  toggleDarkMode() {
    this.state.isDarkMode = !this.state.isDarkMode;
  }

  setLoading(isLoading) {
    this.state.isLoading = isLoading;
  }

  getState() {
    return { ...this.state };
  }
}