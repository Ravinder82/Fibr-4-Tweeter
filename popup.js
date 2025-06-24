class TabTalkAI {
    constructor() {
        this.apiKey = null;
        this.currentTab = null;
        this.chatHistory = [];
        this.pageContent = null;
        this.isLoading = false;
        this.currentDomain = null;
        this.displayNameInput = document.getElementById('display-name-input');
        this.avatarInput = document.getElementById('avatar-input');
        this.avatarPreview = document.getElementById('avatar-preview');
        this.userDisplayName = null;
        this.userAvatar = null;
        this.darkModeToggle = document.getElementById('dark-mode-toggle');
        this.isDarkMode = false;
        this.notificationsToggle = document.getElementById('notifications-toggle');
        this.notificationsEnabled = false;
        this.highContrastToggle = document.getElementById('high-contrast-toggle');
        this.isHighContrast = false;
        this.isTyping = false;
        this.typingTimeout = null;
        this.maxCharCount = 2000;
        this.charCount = document.querySelector('.char-count');
        this.formatButtons = document.querySelectorAll('.format-button, .tool-button');
        this.inputBar = document.querySelector('.input-bar');

        // --- DOM Elements ---
        this.views = {
            settings: document.getElementById('settings-view'),
            chat: document.getElementById('chat-view'),
            status: document.getElementById('status-view'),
        };
        this.apiKeyInput = document.getElementById('api-key-input');
        this.messagesContainer = document.getElementById('messages-container');
        this.messageInput = document.getElementById('message-input');
        this.sendButton = document.getElementById('send-button');
        this.statusText = document.getElementById('status-text');
        this.pageTitle = document.getElementById('page-title');
        this.pageStatus = document.getElementById('page-status');
        this.menuButton = document.getElementById('menu-button');
        this.dropdownMenu = document.getElementById('dropdown-menu');
        this.exportChatButton = document.getElementById('export-chat-button');
        this.exportFormatSelect = document.getElementById('export-format-select');
        this.inputActions = document.querySelector('.input-actions');

        if (typeof marked !== 'undefined') {
            this.marked = marked;
            this.marked.setOptions({ gfm: true, breaks: true, sanitize: true });
        }
    }

    async init() {
        this.bindEvents(); // This is the crucial part that was missing logic
        
        this.updateViewState('status', 'Initializing...'); // Show loading state first

        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab) {
                this.updateViewState('status', 'No active tab found.');
                return;
            }
            this.currentTab = tab;

            await this.loadState();

            if (!this.apiKey) {
                this.updateViewState('settings');
            } else {
                this.updateViewState('chat');
                await this.getAndCachePageContent();
            }
        } catch (error) {
            console.error("Initialization failed:", error);
            this.updateViewState('status', `Error: ${error.message}`);
        }
    }

    // THIS IS THE FULL, CORRECTED BINDING FUNCTION
    bindEvents() {
        // View Switching Logic
        const settingsCancelButton = document.getElementById('settings-cancel-button');
        const settingsSaveButton = document.getElementById('settings-save-button');
        if (settingsCancelButton) {
            settingsCancelButton.addEventListener('click', () => {
                this.updateViewState(this.apiKey ? 'chat' : 'settings');
            });
        }
        if (settingsSaveButton) {
            settingsSaveButton.addEventListener('click', () => this.handleSaveSettings());
        }
        // Menu Logic
        if (this.menuButton && this.dropdownMenu) {
        this.menuButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.dropdownMenu.classList.toggle('hidden');
                this.dropdownMenu.setAttribute('aria-expanded', this.dropdownMenu.classList.contains('hidden') ? 'false' : 'true');
            });
            // Close menu if click outside
            document.addEventListener('click', (e) => {
                if (!this.dropdownMenu.classList.contains('hidden')) {
                    if (!this.dropdownMenu.contains(e.target) && e.target !== this.menuButton) {
                        this.dropdownMenu.classList.add('hidden');
                        this.dropdownMenu.setAttribute('aria-expanded', 'false');
                    }
                }
            });
            // Keyboard accessibility: close on Escape
            this.dropdownMenu.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.dropdownMenu.classList.add('hidden');
                    this.dropdownMenu.setAttribute('aria-expanded', 'false');
                    this.menuButton.focus();
                }
            });
        }
        const menuSettingsLink = document.getElementById('menu-settings-link');
        if (menuSettingsLink) {
            menuSettingsLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.updateViewState('settings');
                if (this.dropdownMenu) this.dropdownMenu.classList.add('hidden');
        });
        }
        const menuRefreshLink = document.getElementById('menu-refresh-link');
        if (menuRefreshLink) {
            menuRefreshLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleRefresh();
                if (this.dropdownMenu) this.dropdownMenu.classList.add('hidden');
            });
        }
        // Chat Input Logic (updated for new input area structure)
        if (this.sendButton) this.sendButton.addEventListener('click', () => this.sendMessage());
        if (this.messageInput) {
            // Auto-resize input
            this.messageInput.addEventListener('input', () => this.handleInputChange());
            
            // Handle keydown events
            this.messageInput.addEventListener('keydown', (e) => this.handleInputKeydown(e));
            
            // Focus handling for accessibility
            this.messageInput.addEventListener('focus', () => {
                this.inputBar.classList.add('focused');
                this.messageInput.setAttribute('aria-expanded', 'true');
            });
            
            this.messageInput.addEventListener('blur', () => {
                this.inputBar.classList.remove('focused');
                this.messageInput.setAttribute('aria-expanded', 'false');
            });
        }
        // Clear chat button (inside input-actions)
        const clearChatButton = this.inputActions ? this.inputActions.querySelector('#clear-chat-button') : document.getElementById('clear-chat-button');
        if (clearChatButton) {
            clearChatButton.addEventListener('click', async () => {
                if (confirm('Clear all chat history for this page?')) {
                    this.chatHistory = [];
                    await this.saveState();
                    this.renderMessages();
                }
            });
        }
        // Export chat button (inside input-actions)
        const exportChatButton = this.inputActions ? this.inputActions.querySelector('#export-chat-button') : this.exportChatButton;
        if (exportChatButton) {
            exportChatButton.addEventListener('click', () => this.handleExportChat());
        }
        // Export format select (inside input-actions)
        const exportFormatSelect = this.inputActions ? this.inputActions.querySelector('#export-format-select') : this.exportFormatSelect;
        if (exportFormatSelect) {
            exportFormatSelect.setAttribute('aria-label', 'Export format');
        }
        // Accessibility: set aria-labels
        if (this.sendButton) this.sendButton.setAttribute('aria-label', 'Send message');
        if (clearChatButton) clearChatButton.setAttribute('aria-label', 'Clear chat history');
        if (exportChatButton) exportChatButton.setAttribute('aria-label', 'Export chat');
        if (exportFormatSelect) exportFormatSelect.setAttribute('aria-label', 'Export format');
        if (this.menuButton) this.menuButton.setAttribute('aria-label', 'Open menu');
        if (this.apiKeyInput) this.apiKeyInput.setAttribute('aria-label', 'Gemini API Key');
        if (this.displayNameInput) this.displayNameInput.setAttribute('aria-label', 'Display Name');
        if (this.avatarInput) this.avatarInput.setAttribute('aria-label', 'Avatar upload');
        if (this.darkModeToggle) this.darkModeToggle.setAttribute('aria-label', 'Toggle dark mode');
        if (this.notificationsToggle) this.notificationsToggle.setAttribute('aria-label', 'Enable notifications');
        if (this.highContrastToggle) this.highContrastToggle.setAttribute('aria-label', 'Toggle high contrast mode');
        // Avatar upload
        if (this.avatarInput) {
            this.avatarInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        this.userAvatar = ev.target.result;
                        if (this.avatarPreview) {
                            this.avatarPreview.innerHTML = `<img src="${this.userAvatar}" alt="Avatar" />`;
                        }
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
        // Theme toggles
        if (this.darkModeToggle) {
            this.darkModeToggle.addEventListener('change', async (e) => {
                this.isDarkMode = e.target.checked;
                document.body.classList.toggle('dark-mode', this.isDarkMode);
                await chrome.storage.local.set({ darkMode: this.isDarkMode });
            });
        }
        if (this.notificationsToggle) {
            this.notificationsToggle.addEventListener('change', async (e) => {
                this.notificationsEnabled = e.target.checked;
                await chrome.storage.local.set({ notificationsEnabled: this.notificationsEnabled });
            });
        }
        if (this.highContrastToggle) {
            this.highContrastToggle.addEventListener('change', async (e) => {
                this.isHighContrast = e.target.checked;
                document.body.classList.toggle('high-contrast', this.isHighContrast);
                await chrome.storage.local.set({ highContrast: this.isHighContrast });
            });
        }
        // Keyboard shortcut: Ctrl+I or Cmd+I to focus input
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
                e.preventDefault();
                if (this.messageInput) this.messageInput.focus();
            }
        });
        // Formatting buttons
        this.formatButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                if (button.id === 'clear-chat-button') {
                    this.handleClearChat();
                } else if (button.id === 'export-chat-button') {
                    this.handleExportChat();
                } else {
                    this.handleFormatting(button.getAttribute('title').toLowerCase());
                }
            });
        });
    }

    setAriaStatus(msg) {
        const ariaStatus = document.getElementById('aria-status');
        if (ariaStatus) ariaStatus.textContent = msg;
    }

    updateViewState(state, statusMessage = 'Loading...') {
        this.dropdownMenu.classList.add('hidden'); // Always close menu on view change
        Object.values(this.views).forEach(view => view.classList.add('hidden'));
        if (this.views[state]) {
            this.views[state].classList.remove('hidden');
            if (state === 'status') {
                this.statusText.textContent = statusMessage;
                this.setAriaStatus(statusMessage);
            }
        } else {
            this.views.status.classList.remove('hidden');
            this.statusText.textContent = 'Error: Invalid view state.';
            this.setAriaStatus('Error: Invalid view state.');
        }
    }

    async loadState() {
        // --- KEY TRACING LOG 1 ---
        console.log("Popup: Attempting to load state from storage.");
        const url = this.currentTab.url || '';
        const domain = url ? (new URL(url)).hostname : 'unknown';
        this.currentDomain = domain;
        const data = await chrome.storage.local.get(['geminiApiKey', `chatHistory_${domain}`, 'userDisplayName', 'userAvatar', 'darkMode', 'notificationsEnabled', 'highContrast']);
        this.apiKey = data.geminiApiKey || null;
        this.userDisplayName = data.userDisplayName || '';
        this.userAvatar = data.userAvatar || '';
        if (this.displayNameInput) this.displayNameInput.value = this.userDisplayName;
        if (this.avatarPreview && this.userAvatar) {
            this.avatarPreview.innerHTML = `<img src="${this.userAvatar}" alt="Avatar" />`;
        } else if (this.avatarPreview) {
            this.avatarPreview.innerHTML = '';
        }
        console.log("Popup: Loaded this key from storage:", this.apiKey);
        this.chatHistory = data[`chatHistory_${domain}`] || [];
        if(this.apiKey) {
            this.apiKeyInput.value = this.apiKey;
        }
        this.pageTitle.textContent = this.currentTab.title || 'Untitled Page';
        this.renderMessages();
        this.isDarkMode = !!data.darkMode;
        if (this.darkModeToggle) this.darkModeToggle.checked = this.isDarkMode;
        document.body.classList.toggle('dark-mode', this.isDarkMode);
        this.notificationsEnabled = !!data.notificationsEnabled;
        if (this.notificationsToggle) this.notificationsToggle.checked = this.notificationsEnabled;
        this.isHighContrast = !!data.highContrast;
        if (this.highContrastToggle) this.highContrastToggle.checked = this.isHighContrast;
        document.body.classList.toggle('high-contrast', this.isHighContrast);
    }
    
    async saveState() {
        if (!this.currentDomain) return;
        await chrome.storage.local.set({
            'geminiApiKey': this.apiKey,
            'userDisplayName': this.userDisplayName,
            'userAvatar': this.userAvatar,
            [`chatHistory_${this.currentDomain}`]: this.chatHistory.slice(-20)
        });
    }

    async handleSaveSettings() {
        const newApiKey = this.apiKeyInput.value.trim();
        const newDisplayName = this.displayNameInput ? this.displayNameInput.value.trim() : '';
        const newAvatar = this.userAvatar || '';
        if (!newApiKey) {
            alert('API Key cannot be empty.');
            return;
        }
        this.apiKey = newApiKey;
        this.userDisplayName = newDisplayName;
        this.userAvatar = newAvatar;
        await chrome.storage.local.set({
            'geminiApiKey': this.apiKey,
            'userDisplayName': this.userDisplayName,
            'userAvatar': this.userAvatar
        });
        await this.saveState();
        this.updateViewState('chat');
        await this.getAndCachePageContent();
    }

    async getAndCachePageContent() {
        if (!this.currentTab || !this.apiKey) return;
        this.setLoading(true, 'Reading page...');
        this.pageStatus.textContent = 'Injecting script to read page...';

        try {
            if (this.currentTab.url?.startsWith('chrome://') || this.currentTab.url?.startsWith('https://chrome.google.com/webstore')) {
                throw new Error("Cannot run on protected browser pages.");
            }

            const injectionResults = await chrome.scripting.executeScript({
                target: { tabId: this.currentTab.id },
                files: ['content.js'],
            });

            if (!injectionResults || injectionResults.length === 0) throw new Error("Script injection failed.");
            
            const result = injectionResults[0].result;
            if (result.success) {
                this.pageContent = result.content;
                this.pageStatus.textContent = `✅ Content loaded (${(result.content.length / 1024).toFixed(1)} KB)`;
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error("TabTalk AI (popup):", error);
            this.pageStatus.textContent = `❌ ${error.message}`;
        } finally {
            this.setLoading(false);
        }
    }

    async sendMessage() {
        if (!this.messageInput || this.isLoading || !this.messageInput.value.trim()) {
            return;
        }
        
        const message = this.messageInput.value.trim();
        this.messageInput.value = '';
        this.handleInputChange(); // Reset input state
        this.messageInput.focus(); // Keep focus on input after sending

        try {
            this.setLoading(true, 'Sending message...');
            this.addMessage('user', message);
            
            // Scroll to bottom smoothly
            this.messagesContainer.scrollTo({
                top: this.messagesContainer.scrollHeight,
                behavior: 'smooth'
            });

            // Call the API and handle response
            const response = await this.callGeminiAPI(message);
            if (response) {
                this.addMessage('assistant', response);
                // Scroll to show the new message
                this.messagesContainer.scrollTo({
                    top: this.messagesContainer.scrollHeight,
                    behavior: 'smooth'
                });
            }
        } catch (error) {
            console.error('Error sending message:', error);
            this.setAriaStatus('Error sending message: ' + error.message);
            // Add error message to chat
            this.addMessage('assistant', 'Sorry, there was an error processing your message. Please try again.');
        } finally {
            this.setLoading(false);
        }
    }
    
    async handleRefresh() {
        this.dropdownMenu.classList.add('hidden');
        this.pageContent = null;
        this.chatHistory = [];
        await this.saveState();
        this.renderMessages();
        this.updateViewState('chat');
        await this.getAndCachePageContent();
    }
    
    addMessage(role, content) {
        const timestamp = new Date().toISOString();
        this.chatHistory.push({ role, content, timestamp });
        this.renderMessages();
    }

    renderMessages() {
        this.messagesContainer.innerHTML = '';
        
        this.chatHistory.forEach((message, index) => {
            const messageEl = document.createElement('div');
            messageEl.classList.add('message');
            messageEl.classList.add(message.role === 'user' ? 'user-message' : 'assistant-message');
            
            // Create message header with avatar and timestamp
            const headerEl = document.createElement('div');
            headerEl.classList.add('message-header');
            
            // Avatar
            const avatarEl = document.createElement('div');
            avatarEl.classList.add('avatar');
            
            if (message.role === 'user' && this.userAvatar) {
                const img = document.createElement('img');
                img.src = this.userAvatar;
                img.alt = 'User Avatar';
                avatarEl.appendChild(img);
            } else if (message.role === 'user') {
                avatarEl.textContent = (this.userDisplayName || 'You').substring(0, 1).toUpperCase();
            } else {
                avatarEl.textContent = 'AI';
            }
            
            // Timestamp
            const timestampEl = document.createElement('div');
            timestampEl.classList.add('timestamp');
            
            const messageTime = message.timestamp || new Date().toISOString();
            const formattedTime = new Date(messageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            timestampEl.textContent = formattedTime;
            
            // Add components to header in correct order
            if (message.role === 'user') {
                headerEl.appendChild(timestampEl);
                headerEl.appendChild(avatarEl);
            } else {
                headerEl.appendChild(avatarEl);
                headerEl.appendChild(timestampEl);
            }
            
            // Message content
            const contentEl = document.createElement('div');
            contentEl.classList.add('content');
            
            // Process message content with Markdown if available
            if (this.marked && message.role === 'model') {
                contentEl.innerHTML = this.marked.parse(message.content);
            } else {
                contentEl.textContent = message.content;
            }
            
            // Assemble message
            messageEl.appendChild(headerEl);
            messageEl.appendChild(contentEl);
            this.messagesContainer.appendChild(messageEl);
            
            // Add animation delay
            setTimeout(() => {
                messageEl.classList.add('visible');
            }, index * 100);
        });
        
        // Scroll to bottom
        this.messagesContainer.scrollTo({
            top: this.messagesContainer.scrollHeight,
            behavior: 'smooth'
        });
    }
    
    setLoading(isLoading, statusMessage = '...') {
        this.isLoading = isLoading;
        this.sendButton.disabled = isLoading || this.messageInput.value.trim().length === 0;
        this.messageInput.disabled = isLoading;
        if(isLoading) {
            this.pageStatus.textContent = statusMessage;
            this.setAriaStatus(statusMessage);
        }
    }

    handleInputChange() {
        // Clear previous typing timeout
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
        }

        // Update input height
        this.messageInput.style.height = 'auto';
        const newHeight = Math.min(this.messageInput.scrollHeight, 150);
        this.messageInput.style.height = `${newHeight}px`;

        // Update send button state
        const isEmpty = this.messageInput.value.trim().length === 0;
        this.sendButton.disabled = isEmpty || this.isLoading;
        
        // Update character count
        const currentLength = this.messageInput.value.length;
        if (this.charCount) {
            this.charCount.textContent = `${currentLength}/${this.maxCharCount}`;
            
            if (currentLength >= this.maxCharCount) {
                this.charCount.style.color = '#ef4444';
            } else {
                this.charCount.style.color = 'var(--text-secondary)';
            }
        }

        // Prevent further input if max length reached
        if (currentLength > this.maxCharCount) {
            this.messageInput.value = this.messageInput.value.slice(0, this.maxCharCount);
        }
    }

    handleInputKeydown(e) {
        // Handle Enter key
        if (e.key === 'Enter') {
            if (e.shiftKey) {
                // Allow multiline input with Shift+Enter
                return;
            }
            e.preventDefault();
            if (!this.sendButton.disabled) {
                this.sendMessage();
            }
        }
        
        // Handle Escape key
        if (e.key === 'Escape') {
            this.messageInput.blur();
            this.setAriaStatus('Input cleared');
            this.messageInput.value = '';
            this.handleInputChange();
        }

        // Handle up/down arrows for potential future message history
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            // Reserved for future message history navigation
            e.preventDefault();
        }
    }

    async callGeminiAPI(message) {
        if (!this.pageContent) {
            this.pageStatus.textContent = "⚠️ Re-analyzing page before sending...";
            await this.getAndCachePageContent();
            if (!this.pageContent) throw new Error("Could not get page content to answer your question.");
        }
        console.log("Popup: Sending this key to background for API call:", this.apiKey);
        // Advanced system prompt for Gemini
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
    }

    handleFormatting(type) {
        const input = this.messageInput;
        const start = input.selectionStart;
        const end = input.selectionEnd;
        const text = input.value;
        
        let prefix = '';
        let suffix = '';
        
        switch(type) {
            case 'bold':
                prefix = '**';
                suffix = '**';
                break;
            case 'italic':
                prefix = '_';
                suffix = '_';
                break;
            case 'code':
                if (text.substring(start, end).includes('\n')) {
                    prefix = '```\n';
                    suffix = '\n```';
                } else {
                    prefix = '`';
                    suffix = '`';
                }
                break;
            case 'link':
                if (start === end) {
                    prefix = '[';
                    suffix = '](url)';
                } else {
                    prefix = '[';
                    suffix = '](https://)';
                }
                break;
        }

        const newText = text.substring(0, start) + prefix + text.substring(start, end) + suffix + text.substring(end);
        input.value = newText;
        
        // Set new cursor position
        const newPosition = end + prefix.length;
        input.setSelectionRange(newPosition, newPosition + (start === end ? 0 : end - start));
        
        // Trigger input change event
        this.handleInputChange();
        
        // Focus back on input
        input.focus();
    }

    async handleClearChat() {
        if (confirm('Clear all chat history for this page?')) {
            this.chatHistory = [];
            await this.saveState();
            this.renderMessages();
        }
    }

    handleExportChat() {
        const format = 'markdown'; // Default to markdown
        let content = '';
        const fileName = `tabtalk-chat-${new Date().toISOString().slice(0, 10)}.${format === 'markdown' ? 'md' : 'txt'}`;
        
        // Generate content based on format
        if (format === 'markdown') {
            content = `# TabTalk AI Chat - ${this.pageTitle.textContent}\n\n`;
            content += `URL: ${this.currentTab.url}\n`;
            content += `Date: ${new Date().toLocaleString()}\n\n`;
            
            this.chatHistory.forEach(msg => {
                if (msg.role === 'user') {
                    content += `## ${this.userDisplayName || 'You'}\n\n${msg.content}\n\n`;
                } else {
                    content += `## TabTalk AI\n\n${msg.content}\n\n`;
                }
            });
        } else {
            content = `TabTalk AI Chat - ${this.pageTitle.textContent}\n\n`;
            content += `URL: ${this.currentTab.url}\n`;
            content += `Date: ${new Date().toLocaleString()}\n\n`;
            
            this.chatHistory.forEach(msg => {
                if (msg.role === 'user') {
                    content += `${this.userDisplayName || 'You'}: ${msg.content}\n\n`;
                } else {
                    content += `TabTalk AI: ${msg.content}\n\n`;
                }
            });
        }
        
        // Create download link
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new TabTalkAI();
    app.init();
});