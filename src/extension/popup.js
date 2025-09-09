// src/extension/popup.js
// Refactored popup.js using shared components

import { StateManager } from '../shared/core/state-manager.js';
import { GeminiAPIClient } from '../shared/core/api.js';
import { MessageRenderer } from '../shared/components/message-renderer.js';
import { CONTENT_TYPES, MESSAGES } from '../shared/utils/constants.js';
import { isValidUrl, formatBytes } from '../shared/utils/helpers.js';

class TabTalkAI {
  constructor() {
    this.stateManager = new StateManager('extension');
    this.apiClient = null;
    this.messageRenderer = new MessageRenderer(marked);
    this.currentTab = null;
    this.pageContent = null;
    this.views = {};
    this.domElements = {};
    
    // Bind methods
    this.init = this.init.bind(this);
    this.bindEvents = this.bindEvents.bind(this);
    this.handleSaveSettings = this.handleSaveSettings.bind(this);
    this.getAndCachePageContent = this.getAndCachePageContent.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.generateSpecialContent = this.generateSpecialContent.bind(this);
  }

  async init() {
    this.cacheDOMElements();
    this.bindEvents();
    this.updateViewState('status', MESSAGES.INITIALIZING);
    
    try {
      // Get current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) {
        this.updateViewState('status', 'No active tab found.');
        return;
      }
      this.currentTab = tab;
      
      // Set page title
      if (this.domElements.pageTitle) {
        this.domElements.pageTitle.textContent = this.currentTab.title || 'Untitled Page';
      }
      
      // Load state
      await this.stateManager.loadState();
      const state = this.stateManager.getState();
      
      if (!state.apiKey) {
        this.updateViewState('settings');
      } else {
        this.apiClient = new GeminiAPIClient(state.apiKey, 'extension');
        this.updateViewState('chat');
        await this.getAndCachePageContent();
      }
    } catch (error) {
      console.error("Initialization failed:", error);
      this.updateViewState('status', `Error: ${error.message}`);
    }
  }

  cacheDOMElements() {
    this.views = {
      settings: document.getElementById('settings-view'),
      chat: document.getElementById('chat-view'),
      status: document.getElementById('status-view'),
    };
    
    this.domElements = {
      apiKeyInput: document.getElementById('api-key-input'),
      messagesContainer: document.getElementById('messages-container'),
      messageInput: document.getElementById('message-input'),
      sendButton: document.getElementById('send-button'),
      statusText: document.getElementById('status-text'),
      pageTitle: document.getElementById('page-title'),
      pageStatus: document.getElementById('page-status'),
      menuButton: document.getElementById('menu-button'),
      sidebar: document.getElementById('sidebar'),
      exportChatButton: document.getElementById('export-chat-button'),
      quickActions: document.getElementById('quick-actions'),
      darkModeToggle: document.getElementById('dark-mode-toggle'),
      deleteApiKeyButton: document.getElementById('delete-api-key-button')
    };
  }

  bindEvents() {
    // View switching
    const settingsCancelButton = document.getElementById('settings-cancel-button');
    const settingsSaveButton = document.getElementById('settings-save-button');
    const deleteApiKeyButton = document.getElementById('delete-api-key-button');
    
    if (settingsCancelButton) {
      settingsCancelButton.addEventListener('click', () => {
        const state = this.stateManager.getState();
        this.updateViewState(state.apiKey ? 'chat' : 'settings');
      });
    }
    
    if (settingsSaveButton) {
      settingsSaveButton.addEventListener('click', this.handleSaveSettings);
    }
    
    if (deleteApiKeyButton) {
      deleteApiKeyButton.addEventListener('click', () => this.handleDeleteApiKey());
    }
    
    // Menu logic
    if (this.domElements.menuButton && this.domElements.sidebar) {
      this.domElements.menuButton.addEventListener('click', (e) => {
        e.stopPropagation();
        const isHidden = this.domElements.sidebar.classList.contains('hidden');
        
        if (isHidden) {
          this.domElements.sidebar.classList.remove('hidden');
          this.domElements.sidebar.style.display = 'block';
        } else {
          this.domElements.sidebar.classList.add('hidden');
          this.domElements.sidebar.style.display = 'none';
        }
        
        this.domElements.sidebar.setAttribute('aria-expanded', !isHidden ? 'true' : 'false');
      });

      // Close sidebar if click outside
      document.addEventListener('click', (e) => {
        if (!this.domElements.sidebar.classList.contains('hidden')) {
          if (!this.domElements.sidebar.contains(e.target) && e.target !== this.domElements.menuButton) {
            this.domElements.sidebar.classList.add('hidden');
            this.domElements.sidebar.setAttribute('aria-expanded', 'false');
          }
        }
      });

      // Keyboard accessibility: close on Escape
      this.domElements.sidebar.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.domElements.sidebar.classList.add('hidden');
          this.domElements.sidebar.setAttribute('aria-expanded', 'false');
          this.domElements.menuButton.focus();
        }
      });
    }
    
    // Menu links
    const menuSettingsLink = document.getElementById('menu-settings-link');
    if (menuSettingsLink) {
      menuSettingsLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.updateViewState('settings');
        if (this.domElements.sidebar) this.domElements.sidebar.classList.add('hidden');
      });
    }
    
    const menuRefreshLink = document.getElementById('menu-refresh-link');
    if (menuRefreshLink) {
      menuRefreshLink.addEventListener('click', async (e) => {
        e.preventDefault();
        if (confirm('Clear all chat history for this page?')) {
          this.stateManager.updateChatHistory([]);
          await this.stateManager.saveState();
          this.renderMessages();
        }
        if (this.domElements.sidebar) {
          this.domElements.sidebar.classList.add('hidden');
          this.domElements.sidebar.style.display = 'none';
        }
      });
    }
    
    // Special content generation
    const menuLinks = [
      { id: 'menu-summary-link', type: CONTENT_TYPES.SUMMARY },
      { id: 'menu-keypoints-link', type: CONTENT_TYPES.KEYPOINTS },
      { id: 'menu-analysis-link', type: CONTENT_TYPES.ANALYSIS },
      { id: 'menu-faq-link', type: CONTENT_TYPES.FAQ },
      { id: 'menu-factcheck-link', type: CONTENT_TYPES.FACTCHECK }
    ];
    
    menuLinks.forEach(link => {
      const element = document.getElementById(link.id);
      if (element) {
        element.addEventListener('click', async (e) => {
          e.preventDefault();
          await this.generateSpecialContent(link.type);
          if (this.domElements.sidebar) {
            this.domElements.sidebar.classList.add('hidden');
            this.domElements.sidebar.style.display = 'none';
          }
        });
      }
    });
    
    // Quick actions
    const quickSummaryBtn = document.getElementById('quick-summary');
    if (quickSummaryBtn) {
      quickSummaryBtn.addEventListener('click', async () => {
        await this.generateSpecialContent(CONTENT_TYPES.SUMMARY);
      });
    }
    
    const quickKeypointsBtn = document.getElementById('quick-keypoints');
    if (quickKeypointsBtn) {
      quickKeypointsBtn.addEventListener('click', async () => {
        await this.generateSpecialContent(CONTENT_TYPES.KEYPOINTS);
      });
    }
    
    // Theme toggle
    if (this.domElements.darkModeToggle) {
      this.domElements.darkModeToggle.addEventListener('change', async (e) => {
        this.stateManager.toggleDarkMode();
        document.body.classList.toggle('dark-mode', this.stateManager.getState().isDarkMode);
        await this.stateManager.saveState();
      });
    }
    
    // Message input
    if (this.domElements.messageInput) {
      this.domElements.messageInput.addEventListener('input', () => this.handleInputChange());
      this.domElements.messageInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }
    
    // Send button
    if (this.domElements.sendButton) {
      this.domElements.sendButton.addEventListener('click', this.sendMessage);
    }
    
    // Export chat
    if (this.domElements.exportChatButton) {
      this.domElements.exportChatButton.addEventListener('click', () => this.handleExportChat());
    }
    
    // Clear chat
    const clearChatButton = document.getElementById('clear-chat-button');
    if (clearChatButton) {
      clearChatButton.addEventListener('click', () => this.handleClearChat());
    }
  }

  async handleSaveSettings() {
    const newApiKey = this.domElements.apiKeyInput.value.trim();
    
    if (!newApiKey) {
      alert('Please enter a valid API key.');
      return;
    }
    
    this.stateManager.updateApiKey(newApiKey);
    await this.stateManager.saveState();
    
    this.apiClient = new GeminiAPIClient(newApiKey, 'extension');
    this.updateViewState('chat');
    
    // Hide onboarding info
    const onboardingInfo = document.querySelector('.onboarding-info');
    if (onboardingInfo) onboardingInfo.style.display = 'none';
    
    // Fetch page content if not already done
    if (!this.pageContent) {
      await this.getAndCachePageContent();
    }
  }

  async handleDeleteApiKey() {
    if (!confirm('Are you sure you want to delete your API key? You will need to enter a new key to use TabTalk AI.')) {
      return;
    }
    
    // Clear the API key from storage using StateManager
    await this.stateManager.deleteApiKey();
    await this.stateManager.saveState();
    
    // Clear the input field
    if (this.domElements.apiKeyInput) {
      this.domElements.apiKeyInput.value = '';
    }
    
    // Show the delete button only when there's an existing API key
    if (this.domElements.deleteApiKeyButton) {
      this.domElements.deleteApiKeyButton.classList.add('hidden');
    }
    
    // Stay in settings view
    this.updateViewState('settings');
  }

  async getAndCachePageContent() {
    if (!this.currentTab) return;
    
    this.setLoading(true, MESSAGES.LOADING_PAGE);
    this.domElements.pageStatus.textContent = 'Injecting script to read page...';
    
    try {
      const result = await chrome.scripting.executeScript({
        target: { tabId: this.currentTab.id },
        files: ['content.js']
      });
      
      if (result && result[0] && result[0].result && result[0].result.success) {
        this.pageContent = result[0].result.content;
        this.domElements.pageStatus.textContent = `✅ Content loaded (${formatBytes(this.pageContent.length)})`;
        this.updateQuickActionsVisibility();
      } else {
        throw new Error(result[0].result.error);
      }
    } catch (error) {
      console.error("TabTalk AI (popup):", error);
      this.domElements.pageStatus.textContent = `❌ ${error.message}`;
    } finally {
      this.setLoading(false);
    }
  }

  updateViewState(state, statusMessage = 'Loading...') {
    if (this.domElements.sidebar) {
      this.domElements.sidebar.classList.add('hidden');
      this.domElements.sidebar.style.display = 'none';
    }
    
    Object.values(this.views).forEach(view => view.classList.add('hidden'));
    
    if (this.views[state]) {
      this.views[state].classList.remove('hidden');
      
      // Set focus appropriately
      if (state === 'chat' && this.domElements.messageInput) {
        this.domElements.messageInput.focus();
      } else if (state === 'settings' && this.domElements.apiKeyInput) {
        this.domElements.apiKeyInput.focus();
        
        // Show delete button only when there's an existing API key
        const currentState = this.stateManager.getState();
        if (this.domElements.deleteApiKeyButton) {
          if (currentState.apiKey) {
            this.domElements.deleteApiKeyButton.classList.remove('hidden');
          } else {
            this.domElements.deleteApiKeyButton.classList.add('hidden');
          }
        }
      }
    } else {
      console.error(`View "${state}" not found`);
    }
    
    if (state === 'status') {
      this.domElements.statusText.textContent = statusMessage;
    }

    // Show/hide onboarding info
    if (state === 'settings') {
      const onboardingInfo = document.querySelector('.onboarding-info');
      if (onboardingInfo) {
        const apiKey = this.stateManager.getState().apiKey;
        onboardingInfo.style.display = apiKey ? 'none' : 'block';
      }
    }
    
    this.setAriaStatus(`Switched to ${state} view. ${statusMessage}`);
  }

  async sendMessage() {
    if (!this.domElements.messageInput || !this.apiClient || 
        this.stateManager.getState().isLoading || 
        !this.domElements.messageInput.value.trim()) {
      return;
    }
    
    const message = this.domElements.messageInput.value.trim();
    this.domElements.messageInput.value = '';
    this.handleInputChange();
    this.domElements.messageInput.focus();

    try {
      this.setLoading(true, MESSAGES.SENDING_MESSAGE);
      this.addMessage('user', message);
      
      // Scroll to bottom
      this.domElements.messagesContainer.scrollTo({
        top: this.domElements.messagesContainer.scrollHeight,
        behavior: 'smooth'
      });

      // Call the API
      const response = await this.apiClient.generateContent(
        `Page Content:\n${this.pageContent}\n\nUser Question:\n${message}`
      );
      
      if (response) {
        this.addMessage('assistant', response);
        this.domElements.messagesContainer.scrollTo({
          top: this.domElements.messagesContainer.scrollHeight,
          behavior: 'smooth'
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      this.setAriaStatus('Error sending message: ' + error.message);
      this.addMessage('assistant', 'Sorry, there was an error processing your message. Please try again.');
    } finally {
      this.setLoading(false);
    }
  }

  addMessage(role, content, contentType = null) {
    const state = this.stateManager.getState();
    const timestamp = new Date().toISOString();
    const message = { role, content, contentType, timestamp };
    
    const messages = [...state.chatHistory, message];
    this.stateManager.updateChatHistory(messages);
    this.stateManager.saveState();
    this.renderMessages();
  }

  renderMessages() {
    const state = this.stateManager.getState();
    this.domElements.messagesContainer.innerHTML = '';
    
    state.chatHistory.forEach(message => {
      const messageEl = this.messageRenderer.renderMessage(message);
      this.domElements.messagesContainer.appendChild(messageEl);
    });
    
    // Scroll to bottom
    this.domElements.messagesContainer.scrollTo({
      top: this.domElements.messagesContainer.scrollHeight,
      behavior: 'smooth'
    });
    
    // Update empty state visibility
    const emptyState = document.getElementById('empty-state');
    if (emptyState) {
      if (state.chatHistory.length === 0) {
        emptyState.classList.remove('hidden');
      } else {
        emptyState.classList.add('hidden');
      }
    }
    
    // Update quick actions
    this.updateQuickActionsVisibility();
  }

  setLoading(isLoading, statusMessage = '...') {
    this.stateManager.setLoading(isLoading);
    const state = this.stateManager.getState();
    
    if (this.domElements.sendButton) {
      this.domElements.sendButton.disabled = isLoading || !this.domElements.messageInput?.value.trim();
    }
    
    if (this.domElements.messageInput) {
      this.domElements.messageInput.disabled = isLoading;
    }
    
    if (isLoading) {
      this.domElements.pageStatus.textContent = statusMessage;
      this.setAriaStatus(statusMessage);
    } else {
      if (!this.domElements.pageStatus.textContent.startsWith('✅')) {
        this.domElements.pageStatus.textContent = MESSAGES.DONE;
      }
      this.setAriaStatus('Ready');
    }
  }

  handleInputChange() {
    if (!this.domElements.messageInput) return;
    
    // Update input height
    this.domElements.messageInput.style.height = 'auto';
    const newHeight = Math.min(this.domElements.messageInput.scrollHeight, 150);
    this.domElements.messageInput.style.height = `${newHeight}px`;
    
    // Update character count
    const charCount = document.querySelector('.char-count');
    if (charCount) {
      const length = this.domElements.messageInput.value.length;
      charCount.textContent = `${length}/2000`;
      charCount.style.color = length > 1800 ? '#ef4444' : '';
    }
    
    // Enable/disable send button
    if (this.domElements.sendButton) {
      this.domElements.sendButton.disabled = !this.domElements.messageInput.value.trim();
    }
  }

  handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (this.domElements.messageInput && this.domElements.messageInput.value.trim() && 
          this.domElements.sendButton && !this.domElements.sendButton.disabled) {
        this.sendMessage();
      }
    }
  }

  async generateSpecialContent(contentType) {
    if (!this.apiClient) return;
    
    this.setLoading(true, `Generating ${contentType}...`);
    
    try {
      // Refresh content if needed
      if (!this.pageContent) {
        this.domElements.pageStatus.textContent = "⚠️ Re-analyzing page before generating content...";
        await this.getAndCachePageContent();
        if (!this.pageContent) throw new Error("Could not get page content to generate content.");
      }
      
      // Get prompts for content type
      const prompts = {
        [CONTENT_TYPES.SUMMARY]: `Please provide a concise summary of the following webpage content:\n\n${this.pageContent}`,
        [CONTENT_TYPES.KEYPOINTS]: `Please extract 5-7 key points from the following content:\n\n${this.pageContent}`,
        [CONTENT_TYPES.ANALYSIS]: `Please provide a detailed analysis of the following content:\n\n${this.pageContent}`,
        [CONTENT_TYPES.FAQ]: `Please generate 5-8 frequently asked questions and answers based on the following content:\n\n${this.pageContent}`,
        [CONTENT_TYPES.FACTCHECK]: `Please fact-check the following content, identifying claims that can be verified:\n\n${this.pageContent}`
      };
      
      const prompt = prompts[contentType];
      if (!prompt) throw new Error(`Unsupported content type: ${contentType}`);
      
      const response = await this.apiClient.generateContent(prompt);
      this.addMessage('assistant', response, contentType);
    } catch (error) {
      console.error('Error generating special content:', error);
      this.addMessage('assistant', `Sorry, I couldn't generate the ${contentType}. Error: ${error.message}`);
    } finally {
      this.setLoading(false);
    }
  }

  updateQuickActionsVisibility() {
    if (!this.domElements.quickActions) return;
    
    const state = this.stateManager.getState();
    if (this.pageContent && state.chatHistory.length === 0) {
      this.domElements.quickActions.classList.remove('hidden');
    } else {
      this.domElements.quickActions.classList.add('hidden');
    }
  }

  handleExportChat() {
    const state = this.stateManager.getState();
    if (!state.chatHistory.length) {
      alert('No chat history to export.');
      return;
    }
    
    const dataStr = JSON.stringify({
      chatHistory: state.chatHistory,
      exportedAt: new Date().toISOString(),
      pageUrl: this.currentTab?.url,
      pageTitle: this.currentTab?.title
    }, null, 2);
    
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `tabtalk-chat-${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }

  handleClearChat() {
    if (confirm('Clear all chat history for this page?')) {
      this.stateManager.updateChatHistory([]);
      this.stateManager.saveState();
      this.renderMessages();
    }
  }

  setAriaStatus(message) {
    const statusEl = document.getElementById('aria-status');
    if (statusEl) {
      statusEl.textContent = message;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new TabTalkAI();
  app.init();
});