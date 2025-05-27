class TabTalkAI {
    constructor() {
        this.apiKey = null;
        this.pageContent = '';
        this.messages = [];
        this.isLoading = false;
        this.lastExtractionFailed = false;
        this.init();
    }

    init() {
        this.onboarding = new TabTalkOnboarding(this);
        this.bindEvents();
        this.loadSettings();
        this.updatePageInfo();
        this.checkApiKeyAndShowInterface();
    }

    bindEvents() {
        // Menu interactions
        document.getElementById('menuBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMenu();
        });

        document.addEventListener('click', () => {
            this.closeMenu();
        });

        // Settings interactions
        document.getElementById('settingsMenuItem').addEventListener('click', () => {
            this.toggleSettings();
        });

        document.getElementById('openSettingsBtn').addEventListener('click', () => {
            this.showSettings();
        });

        document.getElementById('saveSettings').addEventListener('click', () => {
            this.saveSettings();
        });

        document.getElementById('cancelSettings').addEventListener('click', () => {
            this.hideSettings();
        });

        document.getElementById('toggleKey').addEventListener('click', () => {
            this.toggleApiKeyVisibility();
        });

        // Quick actions
        const quickActionsInline = document.getElementById('quickActionsInline');
        if (quickActionsInline) {
            quickActionsInline.querySelectorAll('.quick-action-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.handleQuickAction(btn.dataset.prompt);
                });
            });
        }

        // Chat interactions
        document.getElementById('messageInput').addEventListener('input', (e) => {
            this.handleInputChange(e);
        });

        document.getElementById('messageInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        document.getElementById('sendBtn').addEventListener('click', () => {
            this.sendMessage();
        });

        // Clear chat
        document.getElementById('clearChat').addEventListener('click', () => {
            this.clearChat();
        });

        document.getElementById('clearChatMenuItem').addEventListener('click', () => {
            this.clearChat();
            this.closeMenu();
        });

        // Refresh page
        document.getElementById('refreshMenuItem').addEventListener('click', () => {
            this.refreshPage();
            this.closeMenu();
        });

        document.getElementById('removeApiKey').addEventListener('click', () => {
            this.removeApiKey();
        });

        // Manual Re-extract Content
        document.getElementById('reextractQuickAction').addEventListener('click', async () => {
            this.manualReExtract();
        });
    }

    toggleMenu() {
        const menuBtn = document.getElementById('menuBtn');
        const dropdownMenu = document.getElementById('dropdownMenu');
        
        menuBtn.classList.toggle('active');
        dropdownMenu.classList.toggle('active');
    }

    closeMenu() {
        const menuBtn = document.getElementById('menuBtn');
        const dropdownMenu = document.getElementById('dropdownMenu');
        
        menuBtn.classList.remove('active');
        dropdownMenu.classList.remove('active');
    }

    toggleSettings() {
        const settingsPanel = document.getElementById('settingsPanel');
        settingsPanel.classList.toggle('active');
        this.closeMenu();
        
        if (settingsPanel.classList.contains('active')) {
            document.getElementById('apiKey').focus();
        }
    }

    showSettings() {
        const settingsPanel = document.getElementById('settingsPanel');
        settingsPanel.classList.add('active');
        document.getElementById('apiKey').focus();
    }

    hideSettings() {
        const settingsPanel = document.getElementById('settingsPanel');
        settingsPanel.classList.remove('active');
    }

    toggleApiKeyVisibility() {
        const apiKeyInput = document.getElementById('apiKey');
        const toggleBtn = document.getElementById('toggleKey');
        
        if (apiKeyInput.type === 'password') {
            apiKeyInput.type = 'text';
            toggleBtn.textContent = '🙈';
        } else {
            apiKeyInput.type = 'password';
            toggleBtn.textContent = '👁️';
        }
    }

    saveSettings() {
        const apiKey = document.getElementById('apiKey').value.trim();
        
        if (!apiKey) {
            this.showToast('Please enter your API key', 'error');
            return;
        }

        // Validate API key format (basic check)
        if (apiKey.length < 20) {
            this.showToast('API key seems too short. Please check and try again.', 'error');
            return;
        }

        this.apiKey = apiKey;
        this.saveToStorage();
        this.hideSettings();
        this.checkApiKeyAndShowInterface();
        this.showToast('Settings saved successfully!');
    }

    async loadSettings() {
        // Try to load from chrome.storage.local if available
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.get(['geminiApiKey'], (result) => {
                if (result && result.geminiApiKey) {
                    this.apiKey = result.geminiApiKey;
                    document.getElementById('apiKey').value = result.geminiApiKey;
                } else {
                    // fallback to localStorage simulation
                    const stored = this.getFromStorage();
                    if (stored && stored.apiKey) {
                        this.apiKey = stored.apiKey;
                        document.getElementById('apiKey').value = stored.apiKey;
                    }
                }
                // After loading API key, decide onboarding vs chat
                this.handleOnboardingDisplay();
            });
        } else {
            // fallback to localStorage simulation
            const stored = this.getFromStorage();
            if (stored && stored.apiKey) {
                this.apiKey = stored.apiKey;
                document.getElementById('apiKey').value = stored.apiKey;
            }
            // After loading API key, decide onboarding vs chat
            this.handleOnboardingDisplay();
        }
    }

    saveToStorage() {
        // Save to chrome.storage.local if available
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.set({ geminiApiKey: this.apiKey });
        }
        // Also save to localStorage simulation for demo
        const data = { apiKey: this.apiKey };
        if (typeof Storage !== "undefined") {
            try {
                window.demoStorage = data;
            } catch (e) {
                console.log('Storage not available');
            }
        }
    }

    getFromStorage() {
        // Simulate storage retrieval
        try {
            return window.demoStorage || null;
        } catch (e) {
            return null;
        }
    }

    checkApiKeyAndShowInterface() {
        const setupRequired = document.getElementById('setupRequired');
        const chatContainer = document.getElementById('chatContainer');

        if (this.apiKey) {
            setupRequired.classList.add('hidden');
            chatContainer.classList.remove('hidden');
            this.extractPageContent();
        } else {
            setupRequired.classList.remove('hidden');
            chatContainer.classList.add('hidden');
        }
    }

    async updatePageInfo() {
        const pageTitle = document.getElementById('pageTitle');
        const pageUrl = document.getElementById('pageUrl');
        // Try to get the active tab's info using Chrome API
        if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs && tabs.length > 0) {
                    const tab = tabs[0];
                    pageTitle.textContent = tab.title || 'Untitled Page';
                    pageUrl.textContent = tab.url || '';
                } else {
                    pageTitle.textContent = 'Demo Page - TabTalk AI Interface';
                    pageUrl.textContent = 'chrome-extension://demo-tabtalk-ai';
                }
            });
        } else {
            // Fallback to demo values
            pageTitle.textContent = 'Demo Page - TabTalk AI Interface';
            pageUrl.textContent = 'chrome-extension://demo-tabtalk-ai';
        }
    }

    async extractPageContent() {
        // In a real extension, this would extract content from the active tab
        // For demo, simulate page content
        this.pageContent = `
            TabTalk AI - Browser Extension Demo
            
            This is a demonstration of the TabTalk AI browser extension interface. 
            The extension allows users to chat with AI about the content of any webpage.
            
            Key features:
            - Beautiful, modern interface with smooth animations
            - Integration with Google's Gemini AI API
            - Quick action buttons for common queries
            - Message controls for copying and saving responses
            - Responsive design that works on different screen sizes
            
            The actual extension would extract the real content from the current browser tab
            and send it to the Gemini API along with user questions to provide contextual answers.
        `;
    }

    handleQuickAction(prompt) {
        const messageInput = document.getElementById('messageInput');
        messageInput.value = prompt;
        this.updateSendButton();
        this.closeMenu();
        messageInput.focus();
    }

    handleInputChange(e) {
        const textarea = e.target;
        
        // Auto-resize textarea
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
        
        // Update character count
        const count = textarea.value.length;
        document.getElementById('wordCount').textContent = `${count}/2000`;
        
        this.updateSendButton();
    }

    updateSendButton() {
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');
        const hasContent = messageInput.value.trim().length > 0;
        
        sendBtn.disabled = !hasContent || this.isLoading;
    }

    async sendMessage() {
        const messageInput = document.getElementById('messageInput');
        const message = messageInput.value.trim();
        if (!message || this.isLoading) return;
        // Clear input
        messageInput.value = '';
        messageInput.style.height = 'auto';
        this.updateSendButton();
        document.getElementById('wordCount').textContent = '0/2000';
        // Add user message
        this.addMessage('user', message);
        // Show loading
        const loadingEl = this.addLoadingMessage();
        this.isLoading = true;
        try {
            // Get real page content from content script
            const pageContent = await this.getRealPageContent();
            if (!pageContent || pageContent.trim().length < 30) {
                loadingEl.remove();
                this.addMessage('assistant', 
                    '⚠️ Unable to extract content from this page.<br>' +
                    'Possible reasons:<br>' +
                    '- This is a browser or extension page (e.g., chrome://, PDF, or extension popup)<br>' +
                    '- The page uses advanced JavaScript or loads content dynamically<br>' +
                    '- The page has very little visible text<br>' +
                    'Try on a regular website like a news article or blog post.' +
                    (pageContent ? '<br><br>Extracted snippet:<br><code>' + pageContent.slice(0, 200) + (pageContent.length > 200 ? '...' : '') + '</code>' : '') +
                    '<br><button id="retryExtractionBtn" class="btn-primary" style="margin-top:12px;">🔄 Retry Extraction</button>'
                );
                this.showToast('Content extraction failed. See chat for details.', 'error');
                // Add event listener for retry button
                setTimeout(() => {
                    const retryBtn = document.getElementById('retryExtractionBtn');
                    if (retryBtn) {
                        retryBtn.onclick = () => {
                            this.sendMessage();
                        };
                    }
                }, 100);
                // Set a flag to auto-retry if content script notifies of page change
                this.lastExtractionFailed = true;
                return;
            } else {
                this.lastExtractionFailed = false;
            }
            console.log('Extracted page content:', pageContent);
            // Call Gemini API with real content
            const response = await this.callGeminiAPI(message, pageContent);
            // Remove loading and add response
            loadingEl.remove();
            this.addMessage('assistant', response);
        } catch (error) {
            console.error('API Error:', error);
            loadingEl.remove();
            this.addMessage('assistant', '❌ Sorry, I encountered an error while processing your request. Please check your API key and try again.');
            this.showToast('Failed to get AI response', 'error');
        } finally {
            this.isLoading = false;
            this.updateSendButton();
        }
    }

    async getRealPageContent() {
        return new Promise((resolve, reject) => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs && tabs.length > 0) {
                    const tabId = tabs[0].id;
                    
                    // Set a timeout for the message
                    const timeout = setTimeout(() => {
                        console.error('Timeout waiting for response from content script.');
                        resolve(''); // Resolve with empty string on timeout
                    }, 5000); // 5 second timeout
                    
                    try {
                         chrome.tabs.sendMessage(tabId, { action: 'extractPageContent' }, (response) => {
                             clearTimeout(timeout); // Clear timeout if response is received
 
                             // More granular response validation
                             if (chrome.runtime.lastError) {
                                 console.error('Error sending message to content script:', chrome.runtime.lastError.message);
                                 resolve('');
                             } else if (!response) {
                                  console.error('Received no response from content script.');
                                 resolve('');
                             } else if (response.success === false && response.error) {
                                  console.error('Content script reported an error:', response.error);
                                 resolve('');
                             } else if (response.success === true && response.content && typeof response.content === 'object' && response.content.content !== undefined) {
                                 // Success case: response has success: true and content.content string
                                 resolve(response.content.content);
                             } else {
                                 // Unexpected response format
                                 console.error('Received unexpected response format from content script:', response);
                                 resolve('');
                             }
                         });
                    } catch (e) {
                        clearTimeout(timeout);
                        console.error('Exception when sending message to content script:', e);
                        resolve(''); // Resolve with empty string on exception
                    }
                } else {
                    resolve('');
                }
            });
        });
    }

    async callGeminiAPI(userMessage, pageContent) {
        // Use background script to call Gemini API
        return new Promise((resolve, reject) => {
            if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
                chrome.runtime.sendMessage({
                    action: 'callGeminiAPI',
                    payload: {
                        userMessage,
                        pageContent
                    }
                }, (response) => {
                    if (chrome.runtime.lastError) {
                        reject(new Error(chrome.runtime.lastError.message));
                    } else if (response && response.success && response.data) {
                        // Parse Gemini response (adjust as needed for actual API)
                        const geminiText = response.data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from Gemini.';
                        resolve(geminiText);
                    } else {
                        reject(new Error(response && response.error ? response.error : 'Unknown error'));
                    }
                });
            } else {
                reject(new Error('chrome.runtime.sendMessage not available'));
            }
        });
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    addMessage(sender, content) {
        const messagesContainer = document.getElementById('messagesContainer');
        const messageDiv = document.createElement('div');
        messageDiv.className = `${sender}-message`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.innerHTML = this.formatMessage(content);
        
        messageDiv.appendChild(messageContent);

        // Add controls for assistant messages
        if (sender === 'assistant') {
            const controls = this.createMessageControls(content);
            messageDiv.appendChild(controls);
        }

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Store message
        this.messages.push({ sender, content, timestamp: Date.now() });
    }

    createMessageControls(content) {
        // Dropdown menu for controls
        const wrapper = document.createElement('div');
        wrapper.className = 'message-controls-dropdown-wrapper';
        wrapper.style.position = 'relative';

        const menuBtn = document.createElement('button');
        menuBtn.className = 'control-btn menu-btn';
        menuBtn.innerHTML = '⋮';
        menuBtn.title = 'More actions';
        menuBtn.style.width = '28px';
        menuBtn.style.height = '28px';
        menuBtn.style.fontSize = '18px';
        menuBtn.style.display = 'flex';
        menuBtn.style.alignItems = 'center';
        menuBtn.style.justifyContent = 'center';
        menuBtn.style.background = 'rgba(255,255,255,0.95)';
        menuBtn.style.border = '1px solid #e2e8f0';
        menuBtn.style.borderRadius = '8px';
        menuBtn.style.cursor = 'pointer';
        menuBtn.style.transition = 'all 0.2s';

        const dropdown = document.createElement('div');
        dropdown.className = 'message-controls-dropdown';
        dropdown.style.position = 'absolute';
        dropdown.style.top = '32px';
        dropdown.style.right = '0';
        dropdown.style.background = '#fff';
        dropdown.style.border = '1px solid #e2e8f0';
        dropdown.style.borderRadius = '10px';
        dropdown.style.boxShadow = '0 4px 16px rgba(0,0,0,0.10)';
        dropdown.style.display = 'none';
        dropdown.style.flexDirection = 'column';
        dropdown.style.minWidth = '120px';
        dropdown.style.zIndex = '10';

        // Copy
        const copyBtn = document.createElement('button');
        copyBtn.className = 'control-btn copy-btn';
        copyBtn.innerHTML = '📋 Copy';
        copyBtn.style.justifyContent = 'flex-start';
        copyBtn.style.width = '100%';
        copyBtn.style.border = 'none';
        copyBtn.style.background = 'none';
        copyBtn.style.borderRadius = '10px 10px 0 0';
        copyBtn.style.fontSize = '14px';
        copyBtn.style.padding = '10px 16px';
        copyBtn.style.cursor = 'pointer';
        copyBtn.title = 'Copy message';
        copyBtn.addEventListener('click', () => { this.copyMessage(content); dropdown.style.display = 'none'; });

        // Save
        const saveBtn = document.createElement('button');
        saveBtn.className = 'control-btn save-btn';
        saveBtn.innerHTML = '💾 Save';
        saveBtn.style.justifyContent = 'flex-start';
        saveBtn.style.width = '100%';
        saveBtn.style.border = 'none';
        saveBtn.style.background = 'none';
        saveBtn.style.fontSize = '14px';
        saveBtn.style.padding = '10px 16px';
        saveBtn.style.cursor = 'pointer';
        saveBtn.title = 'Save message';
        saveBtn.addEventListener('click', () => { this.saveMessage(content); dropdown.style.display = 'none'; });

        // Delete
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'control-btn delete-btn';
        deleteBtn.innerHTML = '🗑️ Delete';
        deleteBtn.style.justifyContent = 'flex-start';
        deleteBtn.style.width = '100%';
        deleteBtn.style.border = 'none';
        deleteBtn.style.background = 'none';
        deleteBtn.style.borderRadius = '0 0 10px 10px';
        deleteBtn.style.fontSize = '14px';
        deleteBtn.style.padding = '10px 16px';
        deleteBtn.style.cursor = 'pointer';
        deleteBtn.title = 'Delete message';
        deleteBtn.addEventListener('click', (e) => { this.deleteMessage(e.target.closest('.assistant-message')); dropdown.style.display = 'none'; });

        dropdown.appendChild(copyBtn);
        dropdown.appendChild(saveBtn);
        dropdown.appendChild(deleteBtn);

        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.style.display = dropdown.style.display === 'flex' ? 'none' : 'flex';
        });

        // Hide dropdown on click outside
        document.addEventListener('click', (e) => {
            if (dropdown.style.display === 'flex') {
                dropdown.style.display = 'none';
            }
        });

        wrapper.appendChild(menuBtn);
        wrapper.appendChild(dropdown);
        return wrapper;
    }

    formatMessage(content) {
        // Convert markdown-like formatting to HTML
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>')
            .replace(/•/g, '&bull;');
    }

    addLoadingMessage() {
        const messagesContainer = document.getElementById('messagesContainer');
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'assistant-message';
        
        const loadingContent = document.createElement('div');
        loadingContent.className = 'message-loading';
        loadingContent.innerHTML = `
            <div class="loading-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
            <span>Thinking...</span>
        `;
        
        loadingDiv.appendChild(loadingContent);
        messagesContainer.appendChild(loadingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        return loadingDiv;
    }

    copyMessage(content) {
        // Remove HTML tags for plain text copy
        const plainText = content.replace(/<[^>]*>/g, '').replace(/&bull;/g, '•');
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(plainText).then(() => {
                this.showToast('Message copied to clipboard!');
            });
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = plainText;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showToast('Message copied to clipboard!');
        }
    }

    saveMessage(content) {
        // In a real extension, this would save to browser storage or export
        const plainText = content.replace(/<[^>]*>/g, '').replace(/&bull;/g, '•');
        const blob = new Blob([plainText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `tabtalk-message-${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showToast('Message saved as file!');
    }

    deleteMessage(messageElement) {
        if (confirm('Delete this message?')) {
            messageElement.remove();
            this.showToast('Message deleted');
        }
    }

    clearChat() {
        if (confirm('Clear all messages?')) {
            const messagesContainer = document.getElementById('messagesContainer');
            const welcomeMessage = messagesContainer.querySelector('.welcome-message');
            
            // Clear all messages but keep welcome message
            messagesContainer.innerHTML = '';
            if (welcomeMessage) {
                messagesContainer.appendChild(welcomeMessage);
            }
            
            this.messages = [];
            this.showToast('Chat cleared');
        }
    }

    refreshPage() {
        if (confirm('Refresh the current page?')) {
            // In a real extension, this would refresh the active tab
            this.showToast('Page would be refreshed (demo mode)');
        }
    }

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    }

    removeApiKey() {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.remove(['geminiApiKey']);
        }
        if (typeof Storage !== "undefined") {
            try {
                window.demoStorage = {};
            } catch (e) {}
        }
        this.apiKey = null;
        document.getElementById('apiKey').value = '';
        this.checkApiKeyAndShowInterface();
        this.showToast('API key removed. Please add a new one.', 'success');
    }

    handleOnboardingDisplay() {
        const onboarding = this.onboarding;
        const chatInterface = document.getElementById('chatInterface');
        const settingsPanel = document.getElementById('settingsPanel');
        if (!this.apiKey) {
            // Show onboarding, hide chat/settings
            onboarding.show();
            chatInterface.classList.add('hidden');
            settingsPanel.classList.add('hidden');
        } else {
            // Hide onboarding, show chat/settings
            onboarding.hide();
            chatInterface.classList.remove('hidden');
            settingsPanel.classList.remove('hidden');
            this.checkApiKeyAndShowInterface();
        }
    }

    async manualReExtract() {
        console.log('Popup: Manual re-extraction triggered.');
        if (this.isLoading) {
            this.showToast('Already loading content.', 'error');
            return;
        }
        this.isLoading = true;
        const loadingEl = this.addLoadingMessage(); // Store the loading element reference

        try {
            console.log('Popup: Requesting page content from content script...');
            const pageContent = await this.getRealPageContent(); // This calls content.js
            console.log('Popup: Received response from getRealPageContent.');

            // ** Ensure loading state is cleared immediately after awaiting response **
            loadingEl?.remove(); // Remove the specific loading message element
            this.isLoading = false; // Reset loading state
            this.updateSendButton(); // Update button state

            if (!pageContent || pageContent.trim().length < 30) {
                // Handle extraction failure scenario (content empty or too short)
                console.log('Popup: Manual re-extraction failed or returned minimal content.');
                this.lastExtractionFailed = true;
                // loadingEl?.remove(); // Removed: Handled above
                this.addMessage('assistant', 
                    '⚠️ Unable to extract meaningful content from this page after manual attempt.<br>' +
                    'Possible reasons:<br>' +
                    '- The page content has not fully loaded dynamically.<br>' +
                    '- The content is in an iframe or a format that cannot be extracted.<br>' +
                    'Try waiting a few more seconds, scrolling the page, or manually refreshing the browser tab.<br>' +
                    (pageContent ? '<br><br>Extracted snippet:<br><code>' + pageContent.slice(0, 200) + (pageContent.length > 200 ? '...' : '') + '</code>' : '')
                );
                this.showToast('Content extraction failed.', 'error');
            } else {
                // Content extracted successfully
                console.log('Popup: Manual re-extraction successful.');
                this.lastExtractionFailed = false;
                this.pageContent = pageContent; // Store the extracted content
                // loadingEl?.remove(); // Removed: Handled above
                this.addMessage('assistant', '✅ Successfully re-extracted page content. You can now ask questions about it.'); // Success message
                this.showToast('Content re-extracted successfully!');
            }
        } catch (error) {
            console.error('Popup: Exception during manual re-extraction:', error);
            loadingEl?.remove(); // Ensure loading message is removed on exception
            this.isLoading = false; // Ensure loading state is reset on exception
            this.updateSendButton(); // Ensure button state is updated on exception
            this.addMessage('assistant', '❌ An error occurred during manual re-extraction. Please try again or refresh the page.');
            this.showToast('Re-extraction failed.', 'error');
        }
        // Removed finally block - state reset and button update are now handled after await
    }
}

// Gamified Onboarding Logic
class TabTalkOnboarding {
    constructor(mainApp) {
        this.mainApp = mainApp;
        this.overlay = document.getElementById('onboardingOverlay');
        this.stepWelcome = document.getElementById('onboardingStepWelcome');
        this.stepApiKey = document.getElementById('onboardingStepApiKey');
        this.stepSuccess = document.getElementById('onboardingStepSuccess');
        this.apiKeyInput = document.getElementById('onboardingApiKey');
        this.toggleKeyBtn = document.getElementById('onboardingToggleKey');
        this.keyIcon = document.getElementById('onboardingKeyIcon');
        this.errorDiv = document.getElementById('onboardingApiKeyError');
        this.confettiDiv = document.getElementById('onboardingConfetti');
        this.bindEvents();
    }

    bindEvents() {
        document.getElementById('onboardingGetStarted').onclick = () => this.showStep('apiKey');
        this.toggleKeyBtn.onclick = () => {
            if (this.apiKeyInput.type === 'password') {
                this.apiKeyInput.type = 'text';
                this.toggleKeyBtn.textContent = '🙈';
            } else {
                this.apiKeyInput.type = 'password';
                this.toggleKeyBtn.textContent = '👁️';
            }
        };
        document.getElementById('onboardingSaveKey').onclick = () => this.saveApiKey();
        document.getElementById('onboardingCancel').onclick = () => this.showStep('welcome');
        document.getElementById('onboardingContinue').onclick = () => this.finishOnboarding();
        this.apiKeyInput.oninput = () => this.validateInput();
    }

    showStep(step) {
        this.stepWelcome.classList.add('hidden');
        this.stepApiKey.classList.add('hidden');
        this.stepSuccess.classList.add('hidden');
        if (step === 'welcome') this.stepWelcome.classList.remove('hidden');
        if (step === 'apiKey') {
            this.stepApiKey.classList.remove('hidden');
            this.apiKeyInput.value = '';
            this.errorDiv.textContent = '';
            this.keyIcon.classList.remove('unlocked');
            this.apiKeyInput.type = 'password';
            this.toggleKeyBtn.textContent = '👁️';
        }
        if (step === 'success') {
            this.stepSuccess.classList.remove('hidden');
            this.launchConfetti();
        }
    }

    validateInput() {
        const val = this.apiKeyInput.value.trim();
        if (!val) {
            this.errorDiv.textContent = '';
            return false;
        }
        if (val.length < 20) {
            this.errorDiv.textContent = 'API key seems too short.';
            return false;
        }
        this.errorDiv.textContent = '';
        return true;
    }

    saveApiKey() {
        if (!this.validateInput()) return;
        // Animate key icon
        this.keyIcon.classList.add('unlocked');
        setTimeout(() => {
            // Save key using main app logic
            this.mainApp.apiKey = this.apiKeyInput.value.trim();
            this.mainApp.saveToStorage();
            document.getElementById('apiKey').value = this.apiKeyInput.value.trim(); // Sync with settings panel
            this.showStep('success');
        }, 600);
    }

    launchConfetti() {
        this.confettiDiv.innerHTML = '';
        for (let i = 0; i < 18; i++) {
            const span = document.createElement('span');
            span.style.left = Math.random() * 95 + '%';
            span.style.background = `hsl(${Math.random()*360},80%,70%)`;
            span.style.animationDelay = (Math.random()*0.7).toFixed(2) + 's';
            this.confettiDiv.appendChild(span);
        }
        setTimeout(() => { this.confettiDiv.innerHTML = ''; }, 1800);
    }

    finishOnboarding() {
        this.overlay.classList.add('hidden');
        // Show chat UI and initialize
        document.getElementById('chatInterface').classList.remove('hidden');
        document.getElementById('chatContainer').classList.remove('hidden');
        this.mainApp.checkApiKeyAndShowInterface();
    }

    show() {
        this.overlay.classList.remove('hidden');
        this.showStep('welcome');
    }

    hide() {
        this.overlay.classList.add('hidden');
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const app = new TabTalkAI();
    // Listen for content script notifications about page changes and re-extraction requests
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request && request.action === 'tabtalk_page_changed') {
                console.log('Popup: Page navigation detected');
                // Auto-retry extraction if the last one failed (e.g., due to navigation)
                if (app.lastExtractionFailed) {
                    console.log('Popup: Last extraction failed, attempting auto-retry...');
                    // No need to send message if last extraction failed, sendMessage will retry extraction
                }
                // Update page info anyway on navigation
                app.updatePageInfo();
            }
            if (request && request.action === 'tabtalk_request_re_extract') {
                console.log('Popup: Received re-extraction request from content script.');
                // Trigger re-extraction if not currently loading and page content is empty or short
                if (!app.isLoading && (!app.pageContent || app.pageContent.length < 100)) { // Basic check for empty/short content
                    console.log('Popup: Triggering automatic re-extraction.');
                    app.extractPageContent(); // Call the extraction function that sends message to content script
                } else if (app.isLoading) {
                    console.log('Popup: Already loading, skipping automatic re-extraction.');
                } else {
                    console.log('Popup: Page content already seems sufficient, skipping automatic re-extraction.');
                }
            }
        });
    }
});