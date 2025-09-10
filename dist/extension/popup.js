class TabTalkAI {
    constructor() {
        this.apiKey = null;
        this.currentTab = null;
        this.chatHistory = [];
        this.pageContent = null;
        this.isLoading = false;
        this.currentDomain = null;
        this.darkModeToggle = document.getElementById('dark-mode-toggle');
        this.isDarkMode = false;
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
        this.sidebar = document.getElementById('sidebar');
        // exportChatButton removed - functionality moved to sidebar only
        this.inputActions = document.querySelector('.input-actions');
        this.quickActions = document.getElementById('quick-actions');
        this.quickTwitterBtn = document.getElementById('quick-twitter');
        this.quickThreadBtn = document.getElementById('quick-thread');

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
            
            // Set page title immediately
            if (this.pageTitle) {
                this.pageTitle.textContent = this.currentTab.title || 'Untitled Page';
            }

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
        
        // Debug: Check if elements are correctly identified
        console.log("Menu Button:", this.menuButton);
        console.log("Sidebar:", this.sidebar);
        
        // Menu Logic
        if (this.menuButton && this.sidebar) {
            this.menuButton.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log("Menu button clicked!");
                
                // Check if sidebar is currently hidden
                const isHidden = this.sidebar.classList.contains('hidden');
                
                // Toggle visibility
                if (isHidden) {
                    this.sidebar.classList.remove('hidden');
                    this.sidebar.style.display = 'block';
                } else {
                    this.sidebar.classList.add('hidden');
                    this.sidebar.style.display = 'none';
                }
                
                console.log("Sidebar is now:", isHidden ? "visible" : "hidden");
                this.sidebar.setAttribute('aria-expanded', !isHidden ? 'true' : 'false');
            });

            // Close sidebar if click outside
            document.addEventListener('click', (e) => {
                if (!this.sidebar.classList.contains('hidden')) {
                    if (!this.sidebar.contains(e.target) && e.target !== this.menuButton) {
                        this.sidebar.classList.add('hidden');
                        this.sidebar.setAttribute('aria-expanded', 'false');
                    }
                }
            });

            // Keyboard accessibility: close on Escape
            this.sidebar.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.sidebar.classList.add('hidden');
                    this.sidebar.setAttribute('aria-expanded', 'false');
                    this.menuButton.focus();
                }
            });
        }
        const menuSettingsLink = document.getElementById('menu-settings-link');
        if (menuSettingsLink) {
            menuSettingsLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.updateViewState('settings');
                if (this.sidebar) this.sidebar.classList.add('hidden');
        });
        }
        const menuRefreshLink = document.getElementById('menu-refresh-link');
        if (menuRefreshLink) {
            menuRefreshLink.addEventListener('click', async (e) => {
                e.preventDefault();
                // Clear chat functionality instead of refresh
                if (confirm('Clear all chat history for this page?')) {
                    this.chatHistory = [];
                    await this.saveState();
                    this.renderMessages();
                }
                if (this.sidebar) {
                    this.sidebar.classList.add('hidden');
                    this.sidebar.style.display = 'none';
                }
            });
        }
        // Add to bindEvents function after the existing menuRefreshLink handler
        const menuSummaryLink = document.getElementById('menu-summary-link');
        if (menuSummaryLink) {
            menuSummaryLink.addEventListener('click', async (e) => {
                e.preventDefault();
                await this.generateSpecialContent('summary');
                if (this.sidebar) {
                    this.sidebar.classList.add('hidden');
                    this.sidebar.style.display = 'none';
                }
            });
        }

        const menuKeyPointsLink = document.getElementById('menu-keypoints-link');
        if (menuKeyPointsLink) {
            menuKeyPointsLink.addEventListener('click', async (e) => {
                e.preventDefault();
                await this.generateSpecialContent('keypoints');
                if (this.sidebar) {
                    this.sidebar.classList.add('hidden');
                    this.sidebar.style.display = 'none';
                }
            });
        }

        const menuAnalysisLink = document.getElementById('menu-analysis-link');
        if (menuAnalysisLink) {
            menuAnalysisLink.addEventListener('click', async (e) => {
                e.preventDefault();
                await this.generateSpecialContent('analysis');
                if (this.sidebar) {
                    this.sidebar.classList.add('hidden');
                    this.sidebar.style.display = 'none';
                }
            });
        }

        // Add event handlers for FAQ Generator and Fact Checker options
        const menuFaqLink = document.getElementById('menu-faq-link');
        if (menuFaqLink) {
            menuFaqLink.addEventListener('click', async (e) => {
                e.preventDefault();
                await this.generateSpecialContent('faq');
                if (this.sidebar) {
                    this.sidebar.classList.add('hidden');
                    this.sidebar.style.display = 'none';
                }
            });
        }

        const menuFactcheckLink = document.getElementById('menu-factcheck-link');
        if (menuFactcheckLink) {
            menuFactcheckLink.addEventListener('click', async (e) => {
                e.preventDefault();
                await this.generateSpecialContent('factcheck');
                if (this.sidebar) {
                    this.sidebar.classList.add('hidden');
                    this.sidebar.style.display = 'none';
                }
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
        if (this.darkModeToggle) this.darkModeToggle.setAttribute('aria-label', 'Toggle dark mode');
        // Theme toggles
        if (this.darkModeToggle) {
            this.darkModeToggle.addEventListener('change', async (e) => {
                this.isDarkMode = e.target.checked;
                document.body.classList.toggle('dark-mode', this.isDarkMode);
                await chrome.storage.local.set({ darkMode: this.isDarkMode });
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

        // Quick actions buttons - Twitter content creation
        if (this.quickTwitterBtn) {
            this.quickTwitterBtn.addEventListener('click', async () => {
                await this.generateSocialContent('twitter');
                // Don't hide - keep buttons visible for multiple generations
            });
        }
        if (this.quickThreadBtn) {
            this.quickThreadBtn.addEventListener('click', async () => {
                await this.generateSocialContent('thread');
                // Don't hide - keep buttons visible for multiple generations
            });
        }
    }

    setAriaStatus(msg) {
        const ariaStatus = document.getElementById('aria-status');
        if (ariaStatus) ariaStatus.textContent = msg;
    }

    updateViewState(state, statusMessage = 'Loading...') {
        if (this.sidebar) {
            this.sidebar.classList.add('hidden');
            this.sidebar.style.display = 'none';
        }
        Object.values(this.views).forEach(view => view.classList.add('hidden'));
        if (this.views[state]) {
            this.views[state].classList.remove('hidden');
            
            // Set focus appropriately based on view
            if (state === 'chat' && this.messageInput) {
                this.messageInput.focus();
            } else if (state === 'settings' && this.apiKeyInput) {
                this.apiKeyInput.focus();
            }
        } else {
            console.error(`View "${state}" not found`);
        }
        
        if (state === 'status') {
            this.statusText.textContent = statusMessage;
        }

        // Show or hide the onboarding infographic when in settings view
        if (state === 'settings') {
            const onboardingInfo = document.querySelector('.onboarding-info');
            if (onboardingInfo) {
                onboardingInfo.style.display = this.apiKey ? 'none' : 'block';
            }
        }
        this.setAriaStatus(`Switched to ${state} view. ${statusMessage}`);
    }

    async loadState() {
        try {
            // Load saved state from Chrome storage
            const data = await chrome.storage.local.get(['geminiApiKey', 'darkMode', 'chatHistory']);
            console.log("TabTalk AI: Loading state, API key exists:", !!data.geminiApiKey);
            
            // API Key
            if (data.geminiApiKey) {
                this.apiKey = data.geminiApiKey;
                console.log("TabTalk AI: API key loaded successfully");
                if (this.apiKeyInput) this.apiKeyInput.value = this.apiKey;
            }
            
            // Dark Mode
            if (data.darkMode !== undefined) {
                this.isDarkMode = data.darkMode;
                if (this.darkModeToggle) this.darkModeToggle.checked = this.isDarkMode;
                document.body.classList.toggle('dark-mode', this.isDarkMode);
            }
            
            // Chat History (for current URL)
            if (this.currentTab) {
                const url = new URL(this.currentTab.url);
                this.currentDomain = url.hostname;
                
                // Set page title
                if (this.pageTitle) {
                    this.pageTitle.textContent = this.currentTab.title || 'Untitled Page';
                    console.log("TabTalk AI: Page title set to:", this.pageTitle.textContent);
                }
                
                // Load chat history for this domain
                if (data.chatHistory && data.chatHistory[this.currentDomain]) {
                    this.chatHistory = data.chatHistory[this.currentDomain];
                }
            }
            
            return data;
        } catch (error) {
            console.error("Failed to load state:", error);
            throw error;
        }
    }
    
    async saveState() {
        if (!this.currentDomain) return;
        
        const data = {};
        
        // Save API key
        if (this.apiKey) {
            data.geminiApiKey = this.apiKey;
        }
        
        // Save dark mode setting
        data.darkMode = this.isDarkMode;
        
        // Save chat history for current domain
        const chatHistoryObj = {};
        chatHistoryObj[this.currentDomain] = this.chatHistory;
        data.chatHistory = chatHistoryObj;
        
        // Save to Chrome storage
        await chrome.storage.local.set(data);
    }

    async handleSaveSettings() {
        const newApiKey = this.apiKeyInput.value.trim();
        
        if (!newApiKey) {
            alert('Please enter a valid API key.');
            return;
        }
        
        this.apiKey = newApiKey;
        console.log("TabTalk AI: Saving API key with key name 'geminiApiKey'");
        
        // Save API key directly to ensure it uses the correct key name
        await chrome.storage.local.set({ 'geminiApiKey': this.apiKey });
        await this.saveState();
        
        console.log("TabTalk AI: API key saved successfully");
        
        // Update the view after saving
        this.updateViewState('chat');
        
        // Hide onboarding infographic now that key is saved
        const onboardingInfo = document.querySelector('.onboarding-info');
        if (onboardingInfo) onboardingInfo.style.display = 'none';
        
        // If we don't have page content yet, fetch it
        if (!this.pageContent) {
            await this.getAndCachePageContent();
        }
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
                this.updateQuickActionsVisibility();
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
        if (this.sidebar) {
            this.sidebar.classList.add('hidden');
            this.sidebar.style.display = 'none';
        }
        this.pageContent = null;
        this.chatHistory = [];
        await this.saveState();
        this.updateViewState('status', 'Refreshing...');
        await this.getAndCachePageContent();
        this.renderMessages();
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
            
            // Add special class for formatted content types
            if (message.contentType) {
                messageEl.classList.add(`${message.contentType}-message`);
                // Add message ID for PDF export reference
                if (message.contentType === 'analysis') {
                    messageEl.setAttribute('data-message-id', index);
                }
            }
            
            // Create message header with avatar and timestamp
            const headerEl = document.createElement('div');
            headerEl.classList.add('message-header');
            
            // Avatar
            const avatarEl = document.createElement('div');
            avatarEl.classList.add('avatar');
            
            if (message.role === 'user') {
                avatarEl.textContent = 'You';
            } else {
                // Different icon based on content type
                if (message.contentType === 'summary') {
                    avatarEl.textContent = '📝';
                } else if (message.contentType === 'keypoints') {
                    avatarEl.textContent = '🔑';
                } else if (message.contentType === 'analysis') {
                    avatarEl.textContent = '📊';
                } else if (message.contentType === 'faq') {
                    avatarEl.textContent = '❓';
                } else if (message.contentType === 'factcheck') {
                    avatarEl.textContent = '✅';
                } else {
                    avatarEl.textContent = 'AI';
                }
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
            
            // Process message content with Markdown
            if (this.marked && message.role === 'assistant') {
                contentEl.innerHTML = this.marked.parse(message.content);
                
                // Add event listener for PDF export button if this is an analysis report
                if (message.contentType === 'analysis') {
                    setTimeout(() => {
                        const exportBtn = contentEl.querySelector('.pdf-export-button');
                        if (exportBtn) {
                            exportBtn.addEventListener('click', (e) => {
                                e.stopPropagation();
                                this.exportAnalysisToPdf(message);
                            });
                        }
                    }, 100);
                }
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
        
        // Toggle first-time infographic visibility
        const emptyState = document.getElementById('empty-state');
        if (emptyState) {
            if (this.chatHistory.length === 0) {
                emptyState.classList.remove('hidden');
            } else {
                emptyState.classList.add('hidden');
            }
        }

        // Scroll to bottom
        this.messagesContainer.scrollTo({
            top: this.messagesContainer.scrollHeight,
            behavior: 'smooth'
        });

        // Update quick actions depending on chat state
        this.updateQuickActionsVisibility();
    }
    
    setLoading(isLoading, statusMessage = '...') {
        this.isLoading = isLoading;
        this.sendButton.disabled = isLoading || this.messageInput.value.trim().length === 0;
        this.messageInput.disabled = isLoading;
        if (isLoading) {
            this.pageStatus.textContent = statusMessage;
            this.setAriaStatus(statusMessage);
        } else {
            // Loading finished – if no explicit success message already, show a generic done.
            if (!this.pageStatus.textContent.startsWith('✅')) {
                this.pageStatus.textContent = '✅ Done';
            }
            this.setAriaStatus('Ready');
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

    async generateSpecialContent(contentType) {
        if (!this.pageContent || !this.apiKey) {
            alert('Please make sure you have set up your API key and the page content is loaded.');
            return;
        }

        this.setLoading(true, `Generating ${contentType}...`);
        console.log(`TabTalk AI: Generating ${contentType} for page: ${this.currentTab?.title}`);

        try {
            let systemPrompt = '';
            let userPrompt = '';

            // Set appropriate system prompt based on content type
            switch (contentType) {
                case 'summary':
                    systemPrompt = `You are an expert summarizer. Your task is to analyze the provided web page content and create a concise, informative summary that captures the main ideas, purpose, and key information. 
                    Format your response as a well-structured paragraph with clear introduction, body, and conclusion.
                    Focus on being accurate, informative, and helpful. Use a neutral, professional tone.
                    The summary must be concise - between 100-150 words only. Focus on the most important information and avoid unnecessary details.`;
                    
                    userPrompt = `Please provide a concise summary of this web page content. Focus on the main ideas and most important information. Keep it brief (100-150 words):
                    
                    ${this.pageContent}`;
                    break;

                case 'keypoints':
                    systemPrompt = `You are an expert content analyzer. Your task is to extract the most important key points from the provided web page content.
                    Format your response as a bulleted list of 5-10 clear, concise points, with each point capturing a distinct important idea from the content.
                    Ensure each point is self-contained, precise, and valuable. Start each point with a strong action verb or clear statement.
                    For complex topics, group related points under appropriate headings.
                    Use consistent formatting and keep points approximately equal in length and importance.`;
                    
                    userPrompt = `Please extract the most important key points from this web page content as a well-formatted bulleted list:
                    
                    ${this.pageContent}`;
                    break;

                case 'analysis':
                    systemPrompt = `You are an expert content analyst. Your task is to provide an in-depth analysis of the provided web page content.
                    Your analysis should include:
                    
                    1. OVERVIEW: A brief introduction to the content
                    2. MAIN THEMES: Identification of 3-5 major themes or arguments
                    3. EVIDENCE QUALITY: Assessment of the supporting evidence or data
                    4. PERSPECTIVE: Analysis of viewpoint, bias, or perspective
                    5. CONTEXT: Placement of the content in broader context
                    6. STRENGTHS/WEAKNESSES: Critical evaluation of strong and weak points
                    7. IMPLICATIONS: Discussion of what this means for the reader or field
                    8. CONCLUSION: Final assessment and key takeaways
                    
                    Format your response with clear headings for each section. Use professional, analytical language and provide specific examples from the content to support your analysis.`;
                    
                    userPrompt = `Please provide a comprehensive analysis report for this web page content:
                    
                    ${this.pageContent}`;
                    break;

                case 'faq':
                    systemPrompt = `You are an expert FAQ creator. Your task is to generate a list of frequently asked questions and their answers based on the provided web page content.
                    
                    Guidelines for creating an effective FAQ:
                    1. Create 5-8 questions that users would most likely ask about this content
                    2. Focus on questions that address the main topics, potential confusion points, and key information
                    3. Phrase questions from a user's perspective (use "I", "my", "how do I", etc.)
                    4. Provide clear, concise, and informative answers to each question
                    5. Organize questions in a logical order (basic to advanced, or by topic)
                    6. Format the FAQ with clear question headers in bold followed by detailed answers
                    7. Use numbered or bulleted lists within answers when appropriate
                    8. Keep answers factual and directly based on the provided content
                    
                    Format your response as a well-structured FAQ with clear headers and organized answers.`;
                    
                    userPrompt = `Please generate a comprehensive FAQ (Frequently Asked Questions) list with answers based on this web page content:
                    
                    ${this.pageContent}`;
                    break;

                case 'factcheck':
                    systemPrompt = `You are an expert fact-checker. Your task is to identify and verify factual claims made in the provided web page content.
                    
                    Guidelines for effective fact-checking:
                    1. Identify 5-10 significant factual claims made in the content
                    2. For each claim:
                       - Quote or clearly state the exact claim from the text
                       - Analyze the claim's verifiability (Is it specific? Testable? Clear?)
                       - Note if the claim includes supporting evidence within the text
                       - Assess the claim's consistency with other information in the text
                       - Assign a confidence rating (High, Medium, Low, Uncertain)
                       - Add a brief note about how you arrived at this confidence level
                    3. Focus on objective, factual claims rather than opinions or subjective statements
                    4. Be fair and impartial in your assessment
                    5. Format your response with clear headings and structured analysis
                    
                    Format your response as a list of claims with your analysis of each one. For each claim, use a clear heading with the claim number, followed by the structured analysis.`;
                    
                    userPrompt = `Please identify and verify the factual claims made in this web page content:
                    
                    ${this.pageContent}`;
                    break;

                default:
                    throw new Error('Unknown content type');
            }

            console.log(`TabTalk AI: Calling API for ${contentType} with prompt length: ${systemPrompt.length + userPrompt.length} characters`);
            
            // Call the API with the appropriate prompts
            const response = await this.callGeminiAPIWithSystemPrompt(systemPrompt, userPrompt);
            
            if (response) {
                console.log(`TabTalk AI: Successfully generated ${contentType}, response length: ${response.length} characters`);
                // Add response to chat with appropriate formatting
                this.addFormattedMessage('assistant', response, contentType);
            } else {
                throw new Error('Empty response received from API');
            }
        } catch (error) {
            console.error(`Error generating ${contentType}:`, error);
            this.addMessage('assistant', `Sorry, there was an error generating the ${contentType}: ${error.message}`);
        } finally {
            this.setLoading(false);
        }
    }

    async callGeminiAPIWithSystemPrompt(systemPrompt, userPrompt) {
        if (!this.apiKey || !userPrompt) {
            throw new Error('Missing API key or user prompt');
        }

        // Check if page content needs to be refreshed
        if (!this.pageContent) {
            this.pageStatus.textContent = "⚠️ Re-analyzing page before generating content...";
            await this.getAndCachePageContent();
            if (!this.pageContent) throw new Error("Could not get page content to generate content.");
        }

        console.log("Popup: Sending API key to background for special content generation");
        
        // Create a conversation with the system prompt and user prompt
        const conversation = [
            { 
                role: 'user', 
                parts: [
                    { text: systemPrompt },
                    { text: userPrompt }
                ] 
            }
        ];

        // Send the request to the background script
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

    addFormattedMessage(role, content, contentType) {
        console.log(`TabTalk AI: Adding formatted message of type ${contentType}, length: ${content.length}`);
        const timestamp = new Date().toISOString();
        
        // Create a formatted version based on content type
        let formattedContent = content;
        
        // Add a title based on the content type
        let titlePrefix = '';
        switch (contentType) {
            case 'summary':
                titlePrefix = '📝 **Summary of This Page**\n\n';
                break;
            case 'keypoints':
                titlePrefix = '🔑 **Key Points from This Page**\n\n';
                break;
            case 'analysis':
                // For analysis, add a PDF export button in the title
                titlePrefix = '📊 **Analysis Report of This Page** <span class="pdf-export-button" title="Export as PDF">⬇️</span>\n\n';
                break;
            case 'faq':
                titlePrefix = '❓ **Frequently Asked Questions**\n\n';
                break;
            case 'factcheck':
                titlePrefix = '✅ **Fact Check Report**\n\n';
                break;
            default:
                break;
        }
        
        // Add the formatted content to chat history
        this.chatHistory.push({ 
            role, 
            content: titlePrefix + formattedContent, 
            timestamp,
            contentType
        });
        console.log(`TabTalk AI: Added formatted message to chat history. Total messages: ${this.chatHistory.length}`);
        
        this.renderMessages();
    }

    async exportAnalysisToPdf(message) {
        console.log(`TabTalk AI: Exporting analysis report to PDF`);
        
        // Show loading status
        this.setLoading(true, 'Generating PDF...');
        
        try {
            // Extract the content without the title prefix
            let content = message.content;
            if (content.startsWith('📊 **Analysis Report of This Page**')) {
                content = content.split('\n\n').slice(1).join('\n\n');
            }
            
            // Create a temporary container for the formatted content
            const tempContainer = document.createElement('div');
            tempContainer.style.position = 'absolute';
            tempContainer.style.left = '-9999px';
            tempContainer.style.top = '-9999px';
            document.body.appendChild(tempContainer);
            
            // Set the title and page info
            const pageTitle = this.pageTitle ? this.pageTitle.textContent : 'Untitled Page';
            const pageUrl = this.currentTab ? this.currentTab.url : 'Unknown URL';
            const date = new Date().toLocaleString();
            
            // Create the HTML content for the PDF
            const htmlContent = `
                <html>
                <head>
                    <title>Analysis Report - ${pageTitle}</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            margin: 20px;
                            color: #333;
                            line-height: 1.5;
                        }
                        .header {
                            text-align: center;
                            margin-bottom: 20px;
                            padding-bottom: 10px;
                            border-bottom: 1px solid #ccc;
                        }
                        .title {
                            font-size: 20px;
                            font-weight: bold;
                            margin-bottom: 5px;
                        }
                        .info {
                            font-size: 12px;
                            color: #666;
                            margin-bottom: 5px;
                        }
                        h1 {
                            font-size: 18px;
                            margin-top: 20px;
                            margin-bottom: 10px;
                            padding-bottom: 5px;
                            border-bottom: 1px solid #eee;
                        }
                        h2 {
                            font-size: 16px;
                            margin-top: 15px;
                            margin-bottom: 8px;
                        }
                        p {
                            margin-bottom: 10px;
                        }
                        ul, ol {
                            margin-top: 8px;
                            margin-bottom: 16px;
                            padding-left: 20px;
                        }
                        li {
                            margin-bottom: 5px;
                        }
                        .footer {
                            margin-top: 30px;
                            text-align: center;
                            font-size: 12px;
                            color: #999;
                            padding-top: 10px;
                            border-top: 1px solid #eee;
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="title">Analysis Report</div>
                        <div class="info">Page: ${pageTitle}</div>
                        <div class="info">URL: ${pageUrl}</div>
                        <div class="info">Generated: ${date}</div>
                    </div>
                    <div class="content">
                        ${this.marked ? this.marked.parse(content) : content}
                    </div>
                    <div class="footer">
                        Generated by TabTalk AI
                    </div>
                </body>
                </html>
            `;
            
            tempContainer.innerHTML = htmlContent;
            
            // Check if html2pdf is available
            if (typeof html2pdf === 'undefined') {
                throw new Error('PDF generation library not available');
            }
            
            // Generate PDF using the preloaded library
            const element = tempContainer;
            const options = {
                margin: 10,
                filename: `analysis-report-${new Date().toISOString().slice(0, 10)}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            
            // Generate PDF
            html2pdf()
                .from(element)
                .set(options)
                .save()
                .then(() => {
                    // Remove temporary elements
                    document.body.removeChild(tempContainer);
                    console.log('PDF generated successfully');
                    this.setLoading(false);
                })
                .catch(error => {
                    console.error('Error generating PDF:', error);
                    alert('Error generating PDF: ' + error.message);
                    // Remove temporary elements
                    document.body.removeChild(tempContainer);
                    this.setLoading(false);
                });
        } catch (error) {
            console.error('Error setting up PDF generation:', error);
            alert('Error generating PDF: ' + error.message);
            this.setLoading(false);
        }
    }

    updateQuickActionsVisibility() {
        if (!this.quickActions) return;
        // Keep Twitter quick actions visible whenever there's page content
        if (this.pageContent) {
            this.quickActions.classList.remove('hidden');
        } else {
            this.quickActions.classList.add('hidden');
        }
    }

    async generateSocialContent(platform) {
        if (!this.pageContent || !this.apiKey) {
            this.addMessage('assistant', '❌ Please set up your Gemini API key first and ensure page content is loaded.');
            return;
        }

        this.setLoading(true, `Generating ${platform} content...`);
        console.log(`TabTalk AI: Generating ${platform} content for page: ${this.currentTab?.title}`);

        try {
            let systemPrompt = '';
            let userPrompt = '';
            let emoji = '';

            if (platform === 'twitter') {
                emoji = '🐦';
                systemPrompt = `You are a Twitter/X Premium content creation expert. Create clean, professional, copy-paste ready tweets. Focus on structured content with proper formatting. ABSOLUTELY NEVER include hashtags, asterisks for emphasis, or formatting noise. Output should be immediately usable on Twitter.`;
                
                userPrompt = `Create a clean, professional Twitter/X post from this content:

STRICT FORMATTING REQUIREMENTS:
- NO hashtags, NO # symbols anywhere - this will destroy the account
- NO asterisks (*) for emphasis - use natural language instead
- NO "(line break)" text - use actual line breaks
- NO markdown formatting or special characters
- Use clean paragraph structure with proper spacing
- Include relevant emojis naturally in the text
- Use bullet points (•) or numbers for lists if needed
- Keep it conversational and engaging
- Make it immediately copy-paste ready for Twitter

CONTENT STRUCTURE:
- Start with an engaging hook
- Use natural line breaks for readability  
- Include 1-2 relevant emojis per paragraph
- End with a compelling call-to-action
- Focus on value and insights

CONTENT TO TRANSFORM:
${this.pageContent}

OUTPUT: Clean, professional tweet ready to copy-paste to Twitter (no hashtags, no formatting noise).`;

            } else if (platform === 'thread') {
                emoji = '🧵';
                systemPrompt = `You are a Twitter Premium thread specialist. Create clean, professional, copy-paste ready thread content. Focus on structured, valuable content with proper formatting. ABSOLUTELY NEVER include hashtags, asterisks for emphasis, or formatting noise. Each tweet should be immediately usable on Twitter.`;
                
                userPrompt = `Create a clean, professional Twitter thread from this content:

STRICT FORMATTING REQUIREMENTS:
- Create 3-8 tweets numbered (1/n, 2/n, etc.)
- NO hashtags, NO # symbols anywhere - this will destroy the account
- NO asterisks (*) for emphasis - use natural language instead
- NO "(line break)" text - use actual line breaks
- NO markdown formatting or special characters
- Use clean paragraph structure with proper spacing
- Include relevant emojis naturally in the text
- Use bullet points (•) or numbers for lists if needed
- Make each tweet immediately copy-paste ready for Twitter

THREAD STRUCTURE:
- 1/n: Engaging hook with natural formatting
- 2/n-n/n: Value-packed content with proper spacing
- Final tweet: Strong call-to-action
- Use natural line breaks between ideas
- Include 1-2 relevant emojis per tweet

CONTENT TO TRANSFORM:
${this.pageContent}

OUTPUT FORMAT:
1/n: [Clean hook content]
2/n: [Clean insight content]  
3/n: [Clean analysis content]
...
n/n: [Clean conclusion with CTA]`;

            } else {
                this.addMessage('assistant', '❌ Only Twitter/X Post and Twitter Thread are supported.');
                return;
            }

            // Show progress bar instead of user message
            this.showProgressBar(`Generating ${platform === 'twitter' ? 'Twitter/X Post' : 'Twitter Thread'}...`);

            // Use the existing callGeminiAPIWithSystemPrompt method
            const response = await this.callGeminiAPIWithSystemPrompt(systemPrompt, userPrompt);
            
            if (response) {
                console.log(`TabTalk AI: Successfully generated ${platform} content, response length: ${response.length} characters`);
                const cleanedResponse = this.cleanTwitterContent(response);
                this.addTwitterMessage('assistant', cleanedResponse, platform);
                await this.saveState();
            } else {
                throw new Error('Empty response received from Gemini API');
            }

        } catch (error) {
            console.error('Error generating social content:', error);
            this.addMessage('assistant', '❌ Error generating social media content. Please check your API key and try again.');
        } finally {
            this.setLoading(false);
            this.hideProgressBar();
        }
    }

    showProgressBar(message) {
        // Remove any existing progress bar
        this.hideProgressBar();
        
        const progressContainer = document.createElement('div');
        progressContainer.className = 'progress-container';
        progressContainer.id = 'twitter-progress';
        
        progressContainer.innerHTML = `
            <div class="progress-message">${message}</div>
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
        `;
        
        this.messagesContainer.appendChild(progressContainer);
        this.messagesContainer.scrollTo({
            top: this.messagesContainer.scrollHeight,
            behavior: 'smooth'
        });
        
        // Start progress animation
        setTimeout(() => {
            const fill = progressContainer.querySelector('.progress-fill');
            if (fill) {
                fill.style.width = '100%';
            }
        }, 100);
    }
    
    hideProgressBar() {
        const existingProgress = document.getElementById('twitter-progress');
        if (existingProgress) {
            existingProgress.remove();
        }
    }

    addTwitterMessage(role, content, platform) {
        const timestamp = new Date().toISOString();
        
        // Add to chat history
        this.chatHistory.push({
            role: role,
            content: content,
            timestamp: timestamp,
            platform: platform
        });

        // Create custom Twitter display
        this.renderTwitterContent(content, platform);
    }

    renderTwitterContent(content, platform) {
        // Create container for all Twitter content to ensure proper flow
        const contentContainer = document.createElement('div');
        contentContainer.className = 'twitter-content-container';
        
        if (platform === 'thread') {
            const tweets = this.parseTwitterThread(content);
            tweets.forEach((tweet, index) => {
                const cardTitle = `Thread ${index + 1}/${tweets.length}`;
                const card = this.createTwitterCard(tweet, cardTitle);
                card.dataset.platform = platform;
                contentContainer.appendChild(card);
            });
        } else {
            const card = this.createTwitterCard(content, 'Twitter Post');
            card.dataset.platform = platform;
            contentContainer.appendChild(card);
        }
        
        // Add the entire container to messages, ensuring proper document flow
        this.messagesContainer.appendChild(contentContainer);
        
        // Auto-scroll to show new content
        setTimeout(() => {
            this.messagesContainer.scrollTo({
                top: this.messagesContainer.scrollHeight,
                behavior: 'smooth'
            });
        }, 100);
    }

    parseTwitterThread(content) {
        // Clean the content first
        const cleanedContent = this.cleanTwitterContent(content);
        
        // Remove the intro text if present
        let processedContent = cleanedContent.replace(/Here's your clean.*?content:\s*/gi, '').trim();
        
        // Split by numbered patterns (1/7, 2/7, etc.) 
        const tweetPattern = /(\d+\/\d+[\s:]*)/g;
        const parts = processedContent.split(tweetPattern).filter(part => part.trim());
        
        const tweets = [];
        let currentTweet = '';
        
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i].trim();
            
            // Check if this is a tweet number (1/7, 2/7, etc.)
            if (part.match(/^\d+\/\d+[\s:]*$/)) {
                // If we have accumulated content, save it as a tweet
                if (currentTweet.trim()) {
                    tweets.push(currentTweet.trim());
                }
                currentTweet = '';
            } else {
                // This is tweet content
                currentTweet += part + ' ';
            }
        }
        
        // Add the last tweet if there's content
        if (currentTweet.trim()) {
            tweets.push(currentTweet.trim());
        }
        
        // If no proper threads found, try line-based parsing
        if (tweets.length === 0) {
            const lines = processedContent.split('\n').filter(line => line.trim());
            let tempTweet = '';
            
            for (const line of lines) {
                if (line.match(/^\d+\/\d+/)) {
                    if (tempTweet.trim()) {
                        tweets.push(tempTweet.trim());
                    }
                    tempTweet = line.replace(/^\d+\/\d+[\s:]*/, '').trim();
                } else if (tempTweet) {
                    tempTweet += '\n' + line;
                } else {
                    tempTweet = line;
                }
            }
            
            if (tempTweet.trim()) {
                tweets.push(tempTweet.trim());
            }
        }
        
        // Fallback: if still no tweets, return original content as single tweet
        return tweets.length > 0 ? tweets : [processedContent || content];
    }

    createTwitterCard(tweetContent, cardTitle) {
        const card = document.createElement('div');
        card.className = 'twitter-card';
        
        card.innerHTML = `
            <div class="twitter-card-header">
                <span class="twitter-card-title">${cardTitle}</span>
                <button class="twitter-copy-btn" title="Copy tweet">📋</button>
            </div>
            <div class="twitter-card-content">
                <textarea class="twitter-text" placeholder="Edit your tweet content...">${tweetContent}</textarea>
                <div class="twitter-controls">
                    <div class="twitter-length-control">
                        <label class="length-label">Target Length:</label>
                        <input type="range" class="length-slider" min="50" max="2000" value="${Math.max(50, this.getAccurateCharacterCount(tweetContent))}" step="50">
                        <span class="length-display">${Math.max(50, this.getAccurateCharacterCount(tweetContent))}</span>
                        <button class="regenerate-btn" title="Regenerate with new length">🔄</button>
                    </div>
                    <div class="twitter-char-count">${this.getAccurateCharacterCount(tweetContent)} characters</div>
                </div>
            </div>
        `;

        // Add copy functionality
        const copyBtn = card.querySelector('.twitter-copy-btn');
        const textArea = card.querySelector('.twitter-text');
        
        // Auto-resize textarea to fit content
        const autoResizeTextarea = () => {
            textArea.style.height = 'auto';
            textArea.style.height = Math.max(80, textArea.scrollHeight) + 'px';
        };
        
        // Initial resize
        setTimeout(autoResizeTextarea, 0);
        
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(textArea.value).then(() => {
                copyBtn.textContent = '✅';
                copyBtn.title = 'Copied!';
                setTimeout(() => {
                    copyBtn.textContent = '📋';
                    copyBtn.title = 'Copy tweet';
                }, 2000);
            });
        });

        // Update character count on edit with auto-resize
        textArea.addEventListener('input', () => {
            const charCount = card.querySelector('.twitter-char-count');
            const length = this.getAccurateCharacterCount(textArea.value);
            charCount.textContent = `${length} characters`;
            charCount.style.color = 'var(--text-secondary)';
            autoResizeTextarea();
        });

        // Length slider functionality
        const lengthSlider = card.querySelector('.length-slider');
        const lengthDisplay = card.querySelector('.length-display');
        const regenerateBtn = card.querySelector('.regenerate-btn');

        lengthSlider.addEventListener('input', () => {
            lengthDisplay.textContent = lengthSlider.value;
        });

        // Store original content and platform for regeneration
        card.dataset.originalContent = this.pageContent;
        card.dataset.platform = cardTitle.includes('Thread') ? 'thread' : 'twitter';

        regenerateBtn.addEventListener('click', async () => {
            const targetLength = parseInt(lengthSlider.value);
            const platform = card.dataset.platform;
            await this.regenerateWithLength(card, targetLength, platform);
        });

        return card;
    }

    cleanTwitterContent(content) {
        if (!content) return content;
        
        let cleaned = content;
        
        // Remove all hashtags and # symbols
        cleaned = cleaned.replace(/#\w+/g, '');
        cleaned = cleaned.replace(/#/g, '');
        
        // Remove asterisks used for emphasis (*bold* -> bold)
        cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1');
        cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1');
        
        // Replace "(line break)" literals with actual line breaks
        cleaned = cleaned.replace(/\(line break\)/gi, '\n');
        cleaned = cleaned.replace(/\[line break\]/gi, '\n');
        
        // Remove markdown formatting
        cleaned = cleaned.replace(/_{2,}([^_]+)_{2,}/g, '$1'); // __text__
        cleaned = cleaned.replace(/_([^_]+)_/g, '$1'); // _text_
        
        // Remove extra markdown symbols
        cleaned = cleaned.replace(/\*{2,}/g, '');
        cleaned = cleaned.replace(/_{2,}/g, '');
        
        // Clean up bullet points - standardize to •
        cleaned = cleaned.replace(/[-*]\s+/g, '• ');
        
        // Remove extra whitespace and normalize line breaks
        cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
        cleaned = cleaned.replace(/[ \t]+/g, ' ');
        
        // Trim and ensure proper structure
        cleaned = cleaned.trim();
        
        // Remove any remaining formatting artifacts
        cleaned = cleaned.replace(/\[([^\]]+)\]/g, '$1'); // [text] -> text
        cleaned = cleaned.replace(/\(([^)]+)\)/g, (match, p1) => {
            // Keep emojis and natural parentheses, remove formatting ones
            if (p1.includes('emphasis') || p1.includes('bold') || p1.includes('italic')) {
                return '';
            }
            return match;
        });
        
        return cleaned;
    }

    getAccurateCharacterCount(text) {
        if (!text) return 0;
        
        // Remove leading/trailing whitespace
        const trimmedText = text.trim();
        
        // Handle different types of characters accurately
        let count = 0;
        
        // Convert to array to properly handle Unicode characters, emojis, etc.
        const characters = Array.from(trimmedText);
        
        for (const char of characters) {
            // Emoji and special Unicode characters count as 2 on Twitter
            if (this.isEmojiOrSpecialChar(char)) {
                count += 2;
            } else {
                count += 1;
            }
        }
        
        return count;
    }

    isEmojiOrSpecialChar(char) {
        const codePoint = char.codePointAt(0);
        
        // Emoji ranges and special Unicode characters
        return (
            (codePoint >= 0x1F000 && codePoint <= 0x1F9FF) || // Emoticons, symbols, pictographs
            (codePoint >= 0x2600 && codePoint <= 0x26FF) ||   // Miscellaneous symbols
            (codePoint >= 0x2700 && codePoint <= 0x27BF) ||   // Dingbats
            (codePoint >= 0x1F600 && codePoint <= 0x1F64F) || // Emoticons
            (codePoint >= 0x1F300 && codePoint <= 0x1F5FF) || // Misc symbols and pictographs
            (codePoint >= 0x1F680 && codePoint <= 0x1F6FF) || // Transport and map symbols
            (codePoint >= 0x1F1E0 && codePoint <= 0x1F1FF) || // Regional indicators (flags)
            (codePoint >= 0x200D)  // Zero-width joiner and similar
        );
    }

    async regenerateWithLength(card, targetLength, platform) {
        const textArea = card.querySelector('.twitter-text');
        const regenerateBtn = card.querySelector('.regenerate-btn');
        const originalContent = card.dataset.originalContent;

        // Show loading state
        regenerateBtn.textContent = '⏳';
        regenerateBtn.disabled = true;

        try {
            let systemPrompt = '';
            let userPrompt = '';

            if (platform === 'twitter') {
                systemPrompt = `You are a Twitter/X Premium content creation expert. Create engaging, viral-worthy tweets that drive maximum engagement. Focus on detailed storytelling and valuable insights. NEVER use hashtags in your output.`;
                
                userPrompt = `Create a Twitter/X post with EXACTLY ${targetLength} characters (±10 characters acceptable):

STRICT REQUIREMENTS:
- Target character count: ${targetLength} characters
- NO HASHTAGS ALLOWED - This rule cannot be broken
- Make it highly engaging and shareable
- Use conversational, compelling tone
- Include emoji strategically to enhance readability
- Add call-to-action if space allows
- Focus on delivering maximum value

CONTENT TO TRANSFORM:
${originalContent}

OUTPUT FORMAT: Tweet content exactly around ${targetLength} characters WITHOUT hashtags.`;

            } else if (platform === 'thread') {
                const tweetsNeeded = Math.ceil(targetLength / 400); // Approximate tweets needed
                systemPrompt = `You are a Twitter Premium thread specialist. Create compelling multi-tweet threads that tell detailed stories and provide valuable insights. NEVER use hashtags in your output.`;
                
                userPrompt = `Create a Twitter thread with approximately ${targetLength} total characters across ${tweetsNeeded} tweets:

STRICT REQUIREMENTS:
- Create ${tweetsNeeded} tweets numbered (1/n, 2/n, etc.)
- Total thread length: approximately ${targetLength} characters
- NO HASHTAGS ALLOWED anywhere in the thread
- Each tweet should be comprehensive and valuable
- Build compelling narrative throughout
- End with strong call-to-action

CONTENT TO TRANSFORM:
${originalContent}

OUTPUT FORMAT:
1/n: [Tweet content]
2/n: [Tweet content]
...
n/n: [Conclusion with CTA]`;
            }

            const response = await this.callGeminiAPIWithSystemPrompt(systemPrompt, userPrompt);
            
            if (response) {
                const cleanedResponse = this.cleanTwitterContent(response);
                
                if (platform === 'thread') {
                    const tweets = this.parseTwitterThread(cleanedResponse);
                    const firstTweet = tweets[0] || cleanedResponse;
                    textArea.value = firstTweet;
                } else {
                    textArea.value = cleanedResponse;
                }
                
                // Update character count with auto-resize
                const charCount = card.querySelector('.twitter-char-count');
                const accurateLength = this.getAccurateCharacterCount(textArea.value);
                charCount.textContent = `${accurateLength} characters`;
                
                // Auto-resize after content update
                setTimeout(() => {
                    textArea.style.height = 'auto';
                    textArea.style.height = Math.max(80, textArea.scrollHeight) + 'px';
                }, 0);
            }

        } catch (error) {
            console.error('Error regenerating content:', error);
            alert('Error regenerating content. Please try again.');
        } finally {
            regenerateBtn.textContent = '🔄';
            regenerateBtn.disabled = false;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new TabTalkAI();
    app.init();
});