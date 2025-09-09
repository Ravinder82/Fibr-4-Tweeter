// src/shared/components/chat-interface.js
// Shared chat interface component

import { MessageRenderer } from './message-renderer.js';
import { formatTimestamp } from '../utils/helpers.js';

export class ChatInterface {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      environment: 'extension',
      ...options
    };
    
    this.messageRenderer = new MessageRenderer(options.markedInstance);
    this.messagesContainer = null;
    this.messageInput = null;
    this.sendButton = null;
    
    this.init();
  }

  init() {
    this.createMessagesContainer();
    this.createInputArea();
    this.setupEventListeners();
  }

  createMessagesContainer() {
    this.messagesContainer = document.createElement('div');
    this.messagesContainer.id = 'messages-container';
    this.messagesContainer.className = 'messages-container';
    this.container.appendChild(this.messagesContainer);
  }

  createInputArea() {
    const inputArea = document.createElement('div');
    inputArea.className = 'input-area';
    
    const inputBar = document.createElement('div');
    inputBar.className = 'input-bar';
    
    this.messageInput = document.createElement('textarea');
    this.messageInput.id = 'message-input';
    this.messageInput.placeholder = this.options.placeholder || 'Ask about this page...';
    this.messageInput.rows = '1';
    this.messageInput.setAttribute('aria-label', 'Message input');
    
    const toolbar = document.createElement('div');
    toolbar.className = 'formatting-toolbar';
    
    // Add formatting buttons
    const codeButton = document.createElement('button');
    codeButton.className = 'format-button';
    codeButton.title = 'Code';
    codeButton.setAttribute('aria-label', 'Code block');
    codeButton.textContent = '{}';
    
    const linkButton = document.createElement('button');
    linkButton.className = 'format-button';
    linkButton.title = 'Link';
    linkButton.setAttribute('aria-label', 'Insert link');
    linkButton.textContent = '🔗';
    
    const clearButton = document.createElement('button');
    clearButton.className = 'tool-button';
    clearButton.id = 'clear-chat-button';
    clearButton.title = 'Clear chat';
    clearButton.setAttribute('aria-label', 'Clear chat');
    clearButton.textContent = '🗑️';
    
    const exportButton = document.createElement('button');
    exportButton.className = 'tool-button';
    exportButton.id = 'export-chat-button';
    exportButton.title = 'Export chat';
    exportButton.setAttribute('aria-label', 'Export chat');
    exportButton.textContent = '⬇️';
    
    toolbar.appendChild(codeButton);
    toolbar.appendChild(linkButton);
    toolbar.appendChild(clearButton);
    toolbar.appendChild(exportButton);
    
    this.sendButton = document.createElement('button');
    this.sendButton.id = 'send-button';
    this.sendButton.title = 'Send message';
    this.sendButton.setAttribute('aria-label', 'Send message');
    this.sendButton.disabled = true;
    
    // Create send icon
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('width', '16');
    svg.setAttribute('height', '16');
    svg.setAttribute('fill', 'currentColor');
    svg.setAttribute('viewBox', '0 0 16 16');
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855a.5.5 0 0 0-.09.89l4.736 3.14L13 5.5V9l2.25-3.25L13 2.5v3.75L4.159 9.25l4.776 3.175a.5.5 0 0 0 .75-.225l6.229-10.889a.5.5 0 0 0 .25-.625Z');
    
    svg.appendChild(path);
    this.sendButton.appendChild(svg);
    
    inputBar.appendChild(this.messageInput);
    inputBar.appendChild(toolbar);
    inputBar.appendChild(this.sendButton);
    
    const inputFooter = document.createElement('div');
    inputFooter.className = 'input-footer';
    
    const charCount = document.createElement('span');
    charCount.className = 'char-count';
    charCount.setAttribute('aria-live', 'polite');
    charCount.textContent = '0/2000';
    
    inputFooter.appendChild(charCount);
    
    inputArea.appendChild(inputBar);
    inputArea.appendChild(inputFooter);
    
    this.container.appendChild(inputArea);
  }

  setupEventListeners() {
    if (this.messageInput) {
      this.messageInput.addEventListener('input', () => this.handleInputChange());
      this.messageInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }
    
    if (this.sendButton) {
      this.sendButton.addEventListener('click', () => this.sendMessage());
    }
  }

  handleInputChange() {
    if (!this.messageInput) return;
    
    // Update input height
    this.messageInput.style.height = 'auto';
    const newHeight = Math.min(this.messageInput.scrollHeight, 150);
    this.messageInput.style.height = `${newHeight}px`;
    
    // Enable/disable send button
    if (this.sendButton) {
      this.sendButton.disabled = !this.messageInput.value.trim();
    }
    
    // Update character count
    const charCount = this.container.querySelector('.char-count');
    if (charCount) {
      const length = this.messageInput.value.length;
      charCount.textContent = `${length}/2000`;
      charCount.style.color = length > 1800 ? '#ef4444' : '';
    }
  }

  handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (this.messageInput && this.messageInput.value.trim() && this.sendButton && !this.sendButton.disabled) {
        this.sendMessage();
      }
    }
  }

  sendMessage() {
    if (!this.messageInput || !this.messageInput.value.trim()) return;
    
    const message = this.messageInput.value.trim();
    this.messageInput.value = '';
    this.handleInputChange();
    
    if (this.options.onSendMessage) {
      this.options.onSendMessage(message);
    }
  }

  addMessage(role, content, contentType = null) {
    if (!this.messagesContainer) return;
    
    const message = {
      role,
      content,
      contentType,
      timestamp: new Date().toISOString()
    };
    
    const messageEl = this.messageRenderer.renderMessage(message);
    this.messagesContainer.appendChild(messageEl);
    
    // Scroll to bottom
    this.messagesContainer.scrollTo({
      top: this.messagesContainer.scrollHeight,
      behavior: 'smooth'
    });
  }

  renderMessages(messages) {
    if (!this.messagesContainer) return;
    
    this.messagesContainer.innerHTML = '';
    
    messages.forEach(message => {
      const messageEl = this.messageRenderer.renderMessage(message);
      this.messagesContainer.appendChild(messageEl);
    });
    
    // Scroll to bottom
    this.messagesContainer.scrollTo({
      top: this.messagesContainer.scrollHeight,
      behavior: 'smooth'
    });
  }

  setLoading(isLoading, statusMessage = '...') {
    if (this.sendButton) {
      this.sendButton.disabled = isLoading || !this.messageInput?.value.trim();
    }
    
    if (this.messageInput) {
      this.messageInput.disabled = isLoading;
    }
    
    // Update status if callback provided
    if (this.options.onLoadingChange) {
      this.options.onLoadingChange(isLoading, statusMessage);
    }
  }
}