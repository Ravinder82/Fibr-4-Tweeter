// src/web-app/app.js
// Refactored web app version using shared components

import { StateManager } from '../shared/core/state-manager.js';
import { GeminiAPIClient } from '../shared/core/api.js';
import { MessageRenderer } from '../shared/components/message-renderer.js';
import { CONTENT_TYPES, MESSAGES } from '../shared/utils/constants.js';
import { isValidUrl } from '../shared/utils/helpers.js';

class TabTalkAI {
  constructor() {
    this.stateManager = new StateManager('web');
    this.apiClient = null;
    this.messageRenderer = new MessageRenderer(marked);
    this.currentContent = '';
    this.views = {};
    this.domElements = {};
    
    this.init();
  }

  init() {
    this.cacheDOMElements();
    this.setupEventListeners();
    this.determineInitialView();
    this.setupAutoResize();
  }

  cacheDOMElements() {
    this.views = {
      settings: document.getElementById('settings-view'),
      chat: document.getElementById('chat-view'),
      status: document.getElementById('status-view'),
      urlInput: document.getElementById('url-input-view')
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
      urlInput: document.getElementById('url-input')
    };
  }

  setupEventListeners() {

    // Menu button
    if (this.domElements.menuButton) {
      this.domElements.menuButton.addEventListener('click', () => this.toggleSidebar());
    }

    // Sidebar links
    const sidebarLinks = [
      { id: 'menu-settings-link', action: () => this.showView('settings') },
      { id: 'menu-refresh-link', action: () => this.clearChat() },
      { id: 'menu-url-input-link', action: () => this.showView('url-input') },
      { id: 'menu-summary-link', action: () => this.handleQuickAction(CONTENT_TYPES.SUMMARY) },
      { id: 'menu-keypoints-link', action: () => this.handleQuickAction(CONTENT_TYPES.KEYPOINTS) },
      { id: 'menu-analysis-link', action: () => this.handleQuickAction(CONTENT_TYPES.ANALYSIS) },
      { id: 'menu-faq-link', action: () => this.handleQuickAction(CONTENT_TYPES.FAQ) }
    ];

    sidebarLinks.forEach(link => {
      const element = document.getElementById(link.id);
      if (element) {
        element.addEventListener('click', (e) => {
          e.preventDefault();
          link.action();
          this.hideSidebar();
        });
      }
    });

    // Quick action buttons
    const quickActions = [
      { id: 'quick-summary', action: () => this.handleQuickAction(CONTENT_TYPES.SUMMARY) },
      { id: 'quick-keypoints', action: () => this.handleQuickAction(CONTENT_TYPES.KEYPOINTS) },
      { id: 'quick-analysis', action: () => this.handleQuickAction(CONTENT_TYPES.ANALYSIS) },
      { id: 'quick-faq', action: () => this.handleQuickAction(CONTENT_TYPES.FAQ) }
    ];

    quickActions.forEach(action => {
      const element = document.getElementById(action.id);
      if (element) {
        element.addEventListener('click', action.action);
      }
    });

    // Settings form
    const settingsSaveButton = document.getElementById('settings-save-button');
    if (settingsSaveButton) {
      settingsSaveButton.addEventListener('click', () => this.saveSettings());
    }
    
    const settingsCancelButton = document.getElementById('settings-cancel-button');
    if (settingsCancelButton) {
      settingsCancelButton.addEventListener('click', () => this.cancelSettings());
    }

    // URL input form
    const urlAnalyzeButton = document.getElementById('url-analyze-button');
    if (urlAnalyzeButton) {
      urlAnalyzeButton.addEventListener('click', () => this.analyzeUrl());
    }
    
    const urlCancelButton = document.getElementById('url-cancel-button');
    if (urlCancelButton) {
      urlCancelButton.addEventListener('click', () => this.cancelUrlInput());
    }

    // Chat input
    if (this.domElements.messageInput) {
      this.domElements.messageInput.addEventListener('input', () => this.handleInputChange());
      this.domElements.messageInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }

    // Send button
    if (this.domElements.sendButton) {
      this.domElements.sendButton.addEventListener('click', () => this.sendMessage());
    }

    // Clear chat button
    const clearChatButton = document.getElementById('clear-chat-button');
    if (clearChatButton) {
      clearChatButton.addEventListener('click', () => this.clearChat());
    }

    // Export chat button
    if (this.domElements.exportChatButton) {
      this.domElements.exportChatButton.addEventListener('click', () => this.exportChat());
    }

    // Modal handlers
    const demoContinue = document.getElementById('demo-continue');
    if (demoContinue) {
      demoContinue.addEventListener('click', () => this.continueDemo());
    }
    
    const demoSetup = document.getElementById('demo-setup');
    if (demoSetup) {
      demoSetup.addEventListener('click', () => this.setupApiKey());
    }
    
    const modalClose = document.querySelector('.modal-close');
    if (modalClose) {
      modalClose.addEventListener('click', () => this.hideModal());
    }

    // Click outside to close sidebar
    document.addEventListener('click', (e) => {
      if (this.domElements.sidebar && !this.domElements.sidebar.contains(e.target) && 
          this.domElements.menuButton && !this.domElements.menuButton.contains(e.target)) {
        this.hideSidebar();
      }
    });
  }

  determineInitialView() {
    const state = this.stateManager.getState();
    if (!state.apiKey) {
      this.showModal();
    } else {
      this.showView('chat');
    }
  }

  showModal() {
    const modal = document.getElementById('demo-modal');
    if (modal) {
      modal.classList.remove('hidden');
    }
  }

  hideModal() {
    const modal = document.getElementById('demo-modal');
    if (modal) {
      modal.classList.add('hidden');
    }
  }

  continueDemo() {
    this.hideModal();
    this.showView('chat');
    this.addMessage('assistant', 'Welcome to TabTalk AI Demo! 🤖\n\nYou can try the interface with simulated responses. To use real AI features, please set up your Gemini API key.\n\nTry asking me something or paste a URL to analyze!', 'demo');
  }

  setupApiKey() {
    this.hideModal();
    this.showView('settings');
  }



  toggleSidebar() {
    if (this.domElements.sidebar) {
      this.domElements.sidebar.classList.toggle('hidden');
    }
  }

  hideSidebar() {
    if (this.domElements.sidebar) {
      this.domElements.sidebar.classList.add('hidden');
    }
  }

  showView(viewName) {
    // Hide all views
    Object.values(this.views).forEach(view => {
      if (view) view.classList.add('hidden');
    });

    // Show target view
    if (this.views[viewName]) {
      this.views[viewName].classList.remove('hidden');
    }
    
    // Show/hide quick actions based on view
    if (this.domElements.quickActions) {
      if (viewName === 'chat' && this.currentContent) {
        this.domElements.quickActions.classList.remove('hidden');
      } else {
        this.domElements.quickActions.classList.add('hidden');
      }
    }

    // Update empty state
    this.updateEmptyState();
  }

  updateEmptyState() {
    const emptyState = document.getElementById('empty-state');
    const messagesContainer = document.getElementById('messages-container');
    
    if (this.views.chat && !this.views.chat.classList.contains('hidden') && 
        this.stateManager.getState().chatHistory.length === 0) {
      if (emptyState) emptyState.classList.remove('hidden');
      if (messagesContainer) messagesContainer.style.display = 'none';
    } else {
      if (emptyState) emptyState.classList.add('hidden');
      if (messagesContainer) messagesContainer.style.display = 'flex';
    }
  }

  saveSettings() {
    const apiKey = this.domElements.apiKeyInput?.value.trim();
    if (!apiKey) {
      alert('Please enter a valid API key.');
      return;
    }

    this.stateManager.updateApiKey(apiKey);
    this.stateManager.saveState();
    this.apiClient = new GeminiAPIClient(apiKey, 'web');
    
    // Show success message
    this.showView('status');
    if (this.domElements.statusText) {
      this.domElements.statusText.textContent = '✅ API key saved successfully! Initializing...';
    }
    
    // Small delay to show the success message
    setTimeout(() => {
      // Hide onboarding info
      const onboardingInfo = document.querySelector('.onboarding-info');
      if (onboardingInfo) {
        onboardingInfo.style.display = 'none';
      }
      
      this.showView('chat');
      this.addMessage('assistant', 'Great! Your API key has been saved. You can now chat with any webpage content. Try pasting a URL or some text to get started!');
    }, 1500);
  }

  cancelSettings() {
    const state = this.stateManager.getState();
    this.showView(state.apiKey ? 'chat' : 'settings');
  }

  async analyzeUrl() {
    const url = this.domElements.urlInput?.value.trim();
    if (!url) {
      alert('Please enter a valid URL.');
      return;
    }

    if (!isValidUrl(url)) {
      alert('Please enter a valid URL (e.g., https://example.com).');
      return;
    }

    this.setLoading(true, 'Analyzing URL...');
    
    try {
      const response = await fetch(`/api/extract-content?url=${encodeURIComponent(url)}`);
      if (response.ok) {
        const data = await response.json();
        this.currentContent = data.content;
        if (this.domElements.pageTitle) {
          this.domElements.pageTitle.textContent = data.title || 'Content Analysis';
        }
        if (this.domElements.pageStatus) {
          this.domElements.pageStatus.textContent = `✅ Content loaded from ${new URL(url).hostname}`;
        }
        this.showView('chat');
        this.addMessage('assistant', `I've loaded the content from **${new URL(url).hostname}**. What would you like to know about this page?\n\nYou can ask me to:\n- Summarize the main points\n- Extract key information\n- Answer specific questions\n- Analyze the content`);
      } else {
        throw new Error('Failed to fetch content');
      }
    } catch (error) {
      console.error('Error analyzing URL:', error);
      if (this.domElements.pageStatus) {
        this.domElements.pageStatus.textContent = '❌ Error loading content';
      }
      this.addMessage('assistant', `Sorry, I couldn't analyze that URL. Error: ${error.message}`);
    } finally {
      this.setLoading(false);
    }
  }

  cancelUrlInput() {
    this.showView('chat');
  }

  async sendMessage() {
    if (!this.domElements.messageInput || !this.apiClient || 
        !this.domElements.messageInput.value.trim()) {
      return;
    }

    const message = this.domElements.messageInput.value.trim();
    this.domElements.messageInput.value = '';
    this.handleInputChange();
    this.domElements.messageInput.focus();

    try {
      this.setLoading(true, 'Thinking...');
      this.addMessage('user', message);

      let response, messageType = 'normal';
      
      // Check if this is a special command
      if (message.toLowerCase().includes('summarize') || message.toLowerCase().includes('summary')) {
        messageType = CONTENT_TYPES.SUMMARY;
      } else if (message.toLowerCase().includes('key point') || message.toLowerCase().includes('keypoint')) {
        messageType = CONTENT_TYPES.KEYPOINTS;
      } else if (message.toLowerCase().includes('analyze') || message.toLowerCase().includes('analysis')) {
        messageType = CONTENT_TYPES.ANALYSIS;
      } else if (message.toLowerCase().includes('faq') || message.toLowerCase().includes('question')) {
        messageType = CONTENT_TYPES.FAQ;
      }

      // Generate response based on content availability
      if (this.currentContent) {
        const prompt = `Content:
${this.currentContent}

User Question:
${message}`;
        response = await this.apiClient.generateContent(prompt);
      } else {
        // If no content, treat as general chat
        response = await this.apiClient.generateContent(message);
      }

      this.addMessage('assistant', response, messageType);
    } catch (error) {
      console.error('Error sending message:', error);
      this.addMessage('assistant', `Sorry, I encountered an error: ${error.message}`, 'error');
    } finally {
      this.setLoading(false);
    }
  }

  async handleQuickAction(actionType) {
    if (!this.currentContent) {
      alert('Please analyze a URL or paste content first.');
      return;
    }

    this.setLoading(true, `Generating ${actionType}...`);

    try {
      let prompt, messageType;
      
      switch (actionType) {
        case CONTENT_TYPES.SUMMARY:
          prompt = `Please provide a concise summary of the following content:\n\n${this.currentContent}`;
          messageType = CONTENT_TYPES.SUMMARY;
          break;
        case CONTENT_TYPES.KEYPOINTS:
          prompt = `Please extract 5-7 key points from the following content:\n\n${this.currentContent}`;
          messageType = CONTENT_TYPES.KEYPOINTS;
          break;
        case CONTENT_TYPES.ANALYSIS:
          prompt = `Please provide a detailed analysis of the following content:\n\n${this.currentContent}`;
          messageType = CONTENT_TYPES.ANALYSIS;
          break;
        case CONTENT_TYPES.FAQ:
          prompt = `Please generate 5-8 frequently asked questions and answers based on the following content:\n\n${this.currentContent}`;
          messageType = CONTENT_TYPES.FAQ;
          break;
        default:
          throw new Error('Unsupported action type');
      }

      const response = await this.apiClient.generateContent(prompt);
      this.addMessage('assistant', response, messageType);
    } catch (error) {
      console.error('Error handling quick action:', error);
      this.addMessage('assistant', `Sorry, I couldn't generate the ${actionType}. Error: ${error.message}`);
    } finally {
      this.setLoading(false);
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

  addMessage(sender, content, messageType = 'normal') {
    const state = this.stateManager.getState();
    const timestamp = new Date().toISOString();
    const message = { role: sender, content, contentType: messageType, timestamp };
    
    const messages = [...state.chatHistory, message];
    this.stateManager.updateChatHistory(messages);
    this.stateManager.saveState();
    this.renderMessages();
    this.updateEmptyState();
  }

  renderMessages() {
    const state = this.stateManager.getState();
    if (!this.domElements.messagesContainer) return;
    
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
  }

  setLoading(isLoading, statusMessage = '...') {
    this.stateManager.setLoading(isLoading);
    
    if (this.domElements.sendButton) {
      this.domElements.sendButton.disabled = isLoading || !this.domElements.messageInput?.value.trim();
    }
    
    if (this.domElements.messageInput) {
      this.domElements.messageInput.disabled = isLoading;
    }
    
    if (this.domElements.pageStatus) {
      if (isLoading) {
        this.domElements.pageStatus.textContent = statusMessage;
      } else {
        if (!this.domElements.pageStatus.textContent.startsWith('✅')) {
          this.domElements.pageStatus.textContent = MESSAGES.DONE;
        }
      }
    }
  }

  clearChat() {
    this.stateManager.updateChatHistory([]);
    this.stateManager.saveState();
    this.renderMessages();
    this.updateEmptyState();
    this.addMessage('assistant', 'Chat cleared! Feel free to ask me anything or try the quick action buttons above.', 'demo');
  }

  exportChat() {
    const state = this.stateManager.getState();
    if (!state.chatHistory.length) {
      alert('No chat history to export.');
      return;
    }
    
    const dataStr = JSON.stringify({
      chatHistory: state.chatHistory,
      exportedAt: new Date().toISOString()
    }, null, 2);
    
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `tabtalk-chat-${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }

  setupAutoResize() {
    if (this.domElements.messageInput) {
      this.domElements.messageInput.addEventListener('input', () => {
        this.domElements.messageInput.style.height = 'auto';
        const newHeight = Math.min(this.domElements.messageInput.scrollHeight, 150);
        this.domElements.messageInput.style.height = `${newHeight}px`;
      });
    }
  }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const app = new TabTalkAI();
});