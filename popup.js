class TabTalkAI {
    constructor() {
        this.apiKey = null;
        this.pageContent = '';
        this.messages = [];
        this.isLoading = false;
        this.init();
    }

    init() {
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
        document.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.handleQuickAction(btn.dataset.prompt);
            });
        });

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
            });
        } else {
            // fallback to localStorage simulation
            const stored = this.getFromStorage();
            if (stored && stored.apiKey) {
                this.apiKey = stored.apiKey;
                document.getElementById('apiKey').value = stored.apiKey;
            }
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
        // In a real extension, this would get actual tab info
        // For demo, simulate getting page info
        const pageTitle = document.getElementById('pageTitle');
        const pageUrl = document.getElementById('pageUrl');
        
        // Simulate page info
        pageTitle.textContent = 'Demo Page - TabTalk AI Interface';
        pageUrl.textContent = 'chrome-extension://demo-tabtalk-ai';
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
            // Call Gemini API
            const response = await this.callGeminiAPI(message);
            
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

    async callGeminiAPI(userMessage) {
        // In a real extension, this would make an actual API call
        // For demo purposes, return a simulated response
        
        await this.delay(1500); // Simulate API delay
        
        const responses = {
            'Summarize this page': `📋 **Page Summary:**\n\nThis is a demo of the TabTalk AI browser extension interface. The extension provides:\n\n• **Modern UI Design** - Clean, responsive interface with smooth animations\n• **AI Integration** - Uses Google's Gemini API for intelligent responses  \n• **Quick Actions** - Pre-built prompts for common tasks like summarizing\n• **Interactive Features** - Message controls, settings panel, and more\n\nThe interface is designed to be intuitive and professional, making it easy for users to interact with AI about any webpage content.`,

            'What are the key points?': `🔑 **Key Points:**\n\n1. **Purpose**: Browser extension for AI-powered webpage analysis\n2. **Technology**: Integration with Google Gemini API\n3. **Interface**: Modern, animated UI with 400x600px popup design\n4. **Features**: \n   - Quick action buttons\n   - Settings management\n   - Message history\n   - Copy/save controls\n5. **User Experience**: Focus on smooth interactions and professional appearance`,

            'Explain this in simple terms': `💡 **Simple Explanation:**\n\nThink of TabTalk AI as your smart reading assistant for web pages. \n\nHere's how it works:\n• You visit any website\n• Click the extension icon  \n• Ask questions about what you're reading\n• Get instant, helpful answers\n\nIt's like having a knowledgeable friend who can quickly explain, summarize, or answer questions about any webpage you're looking at. The interface is designed to be clean and easy to use, just like messaging apps you're already familiar with.`,

            'What questions can I ask about this?': `❓ **Great Questions You Can Ask:**\n\n**About Content:**\n• "What is this page about?"\n• "Summarize the main points"\n• "What are the key features mentioned?"\n\n**For Analysis:**\n• "What are the pros and cons discussed?"\n• "How does this compare to alternatives?"\n• "What's the most important information here?"\n\n**For Learning:**\n• "Explain this in simple terms"\n• "What should I remember from this?"\n• "Are there any action items for me?"\n\n**For Research:**\n• "What questions does this raise?"\n• "What topics should I explore further?"\n• "How reliable is this information?"\n\nFeel free to ask anything about the content you're reading!`
        };

        return responses[userMessage] || `I understand you're asking: "${userMessage}"\n\nBased on the page content, I can help you with:\n\n✨ **General Analysis**: This appears to be a demo interface for a browser extension that uses AI to help users understand webpage content.\n\n🎯 **Key Features**: The interface includes modern design elements, smooth animations, settings management, and interactive chat functionality.\n\n🔧 **Technical Aspects**: Built with HTML, CSS, and JavaScript, designed to integrate with Google's Gemini API for AI responses.\n\nWould you like me to elaborate on any specific aspect or answer a different question about this page?`;
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
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new TabTalkAI();
});