// TabTalk AI Web Application
class TabTalkAI {
    constructor() {
        this.apiKey = localStorage.getItem('tabtalk_api_key') || '';
        this.currentView = 'status';
        this.messages = [];
        this.currentContent = '';
        this.isDarkMode = localStorage.getItem('tabtalk_dark_mode') === 'true';
        this.isDemo = !this.apiKey;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.applyDarkMode();
        this.determineInitialView();
        this.setupAutoResize();
    }

    setupEventListeners() {
        // Dark mode toggle
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        darkModeToggle.checked = this.isDarkMode;
        darkModeToggle.addEventListener('change', () => this.toggleDarkMode());

        // Menu button
        document.getElementById('menu-button').addEventListener('click', () => this.toggleSidebar());

        // Sidebar links
        document.getElementById('menu-settings-link').addEventListener('click', (e) => {
            e.preventDefault();
            this.showView('settings');
            this.hideSidebar();
        });

        document.getElementById('menu-refresh-link').addEventListener('click', (e) => {
            e.preventDefault();
            this.clearChat();
            this.hideSidebar();
        });

        document.getElementById('menu-url-input-link').addEventListener('click', (e) => {
            e.preventDefault();
            this.showView('url-input');
            this.hideSidebar();
        });

        // Quick action buttons
        document.getElementById('quick-summary').addEventListener('click', () => this.handleQuickAction('summary'));
        document.getElementById('quick-keypoints').addEventListener('click', () => this.handleQuickAction('keypoints'));
        document.getElementById('quick-analysis').addEventListener('click', () => this.handleQuickAction('analysis'));
        document.getElementById('quick-faq').addEventListener('click', () => this.handleQuickAction('faq'));

        // Sidebar quick actions
        document.getElementById('menu-summary-link').addEventListener('click', (e) => {
            e.preventDefault();
            this.handleQuickAction('summary');
            this.hideSidebar();
        });

        document.getElementById('menu-keypoints-link').addEventListener('click', (e) => {
            e.preventDefault();
            this.handleQuickAction('keypoints');
            this.hideSidebar();
        });

        document.getElementById('menu-analysis-link').addEventListener('click', (e) => {
            e.preventDefault();
            this.handleQuickAction('analysis');
            this.hideSidebar();
        });

        document.getElementById('menu-faq-link').addEventListener('click', (e) => {
            e.preventDefault();
            this.handleQuickAction('faq');
            this.hideSidebar();
        });

        // Settings form
        document.getElementById('settings-save-button').addEventListener('click', () => this.saveSettings());
        document.getElementById('settings-cancel-button').addEventListener('click', () => this.cancelSettings());

        // URL input form
        document.getElementById('url-analyze-button').addEventListener('click', () => this.analyzeUrl());
        document.getElementById('url-cancel-button').addEventListener('click', () => this.cancelUrlInput());

        // Chat input
        const messageInput = document.getElementById('message-input');
        messageInput.addEventListener('input', () => this.handleInputChange());
        messageInput.addEventListener('keydown', (e) => this.handleKeyDown(e));

        // Send button
        document.getElementById('send-button').addEventListener('click', () => this.sendMessage());

        // Clear chat button
        document.getElementById('clear-chat-button').addEventListener('click', () => this.clearChat());

        // Export chat button
        document.getElementById('export-chat-button').addEventListener('click', () => this.exportChat());

        // Modal handlers
        document.getElementById('demo-continue').addEventListener('click', () => this.continueDemo());
        document.getElementById('demo-setup').addEventListener('click', () => this.setupApiKey());
        document.querySelector('.modal-close').addEventListener('click', () => this.hideModal());

        // Click outside to close sidebar
        document.addEventListener('click', (e) => {
            const sidebar = document.getElementById('sidebar');
            const menuButton = document.getElementById('menu-button');
            if (!sidebar.contains(e.target) && !menuButton.contains(e.target)) {
                this.hideSidebar();
            }
        });
    }

    determineInitialView() {
        if (!this.apiKey) {
            // Show demo modal first
            this.showModal();
        } else {
            this.showView('chat');
        }
    }

    showModal() {
        document.getElementById('demo-modal').classList.remove('hidden');
    }

    hideModal() {
        document.getElementById('demo-modal').classList.add('hidden');
    }

    continueDemo() {
        this.hideModal();
        this.isDemo = true;
        this.showView('chat');
        this.addMessage('assistant', 'Welcome to TabTalk AI Demo! 🤖\n\nYou can try the interface with simulated responses. To use real AI features, please set up your Gemini API key.\n\nTry asking me something or paste a URL to analyze!', 'demo');
    }

    setupApiKey() {
        this.hideModal();
        this.showView('settings');
    }

    toggleDarkMode() {
        this.isDarkMode = !this.isDarkMode;
        this.applyDarkMode();
        localStorage.setItem('tabtalk_dark_mode', this.isDarkMode.toString());
    }

    applyDarkMode() {
        if (this.isDarkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('hidden');
    }

    hideSidebar() {
        document.getElementById('sidebar').classList.add('hidden');
    }

    showView(viewName) {
        // Hide all views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.add('hidden');
        });

        // Show target view
        document.getElementById(`${viewName}-view`).classList.remove('hidden');
        this.currentView = viewName;

        // Show/hide quick actions based on view
        const quickActions = document.getElementById('quick-actions');
        if (viewName === 'chat' && this.currentContent) {
            quickActions.classList.remove('hidden');
        } else {
            quickActions.classList.add('hidden');
        }

        // Update empty state
        this.updateEmptyState();
    }

    updateEmptyState() {
        const emptyState = document.getElementById('empty-state');
        const messagesContainer = document.getElementById('messages-container');
        
        if (this.currentView === 'chat' && this.messages.length === 0) {
            emptyState.classList.remove('hidden');
            messagesContainer.style.display = 'none';
        } else {
            emptyState.classList.add('hidden');
            messagesContainer.style.display = 'flex';
        }
    }

    saveSettings() {
        const apiKey = document.getElementById('api-key-input').value.trim();
        
        if (!apiKey) {
            alert('Please enter your Gemini API key');
            return;
        }

        this.apiKey = apiKey;
        localStorage.setItem('tabtalk_api_key', apiKey);
        this.isDemo = false;
        
        // Show success message
        this.showView('status');
        document.getElementById('status-text').textContent = '✅ API key saved successfully! Initializing...';
        
        // Small delay to show the success message
        setTimeout(() => {
            this.showView('chat');
            this.addMessage('assistant', 'Great! Your API key has been saved. You can now chat with any webpage content. Try pasting a URL or some text to get started!');
        }, 1500);
    }

    cancelSettings() {
        if (this.apiKey) {
            this.showView('chat');
        } else {
            this.showModal();
        }
    }

    analyzeUrl() {
        const url = document.getElementById('url-input').value.trim();
        
        if (!url) {
            alert('Please enter a valid URL');
            return;
        }

        if (!this.isValidUrl(url)) {
            alert('Please enter a valid URL (must start with http:// or https://)');
            return;
        }

        this.showView('status');
        document.getElementById('status-text').textContent = 'Analyzing webpage...';

        // Simulate content extraction
        setTimeout(() => {
            this.simulateContentExtraction(url);
        }, 2000);
    }

    cancelUrlInput() {
        this.showView('chat');
    }

    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    simulateContentExtraction(url) {
        // Simulate extracting content from URL
        const domain = new URL(url).hostname;
        this.currentContent = `Content from ${domain}`;
        
        document.getElementById('page-title').textContent = `Analyzing: ${domain}`;
        document.getElementById('page-status').textContent = 'Content loaded and ready for analysis';
        
        this.showView('chat');
        this.addMessage('assistant', `I've loaded the content from **${domain}**. What would you like to know about this page?\n\nYou can ask me to:\n- Summarize the main points\n- Extract key information\n- Answer specific questions\n- Analyze the content`);
    }

    handleQuickAction(action) {
        if (!this.currentContent && !this.isDemo) {
            this.showView('url-input');
            return;
        }

        const prompts = {
            summary: 'Please provide a concise summary of this content.',
            keypoints: 'Extract the key points from this content in bullet format.',
            analysis: 'Provide a detailed analysis of this content including main themes, arguments, and conclusions.',
            faq: 'Generate frequently asked questions and answers based on this content.'
        };

        this.sendMessage(prompts[action], action);
    }

    handleInputChange() {
        const input = document.getElementById('message-input');
        const sendButton = document.getElementById('send-button');
        const charCount = document.querySelector('.char-count');
        
        const length = input.value.length;
        charCount.textContent = `${length}/2000`;
        
        sendButton.disabled = length === 0;
        
        // Auto-resize textarea
        this.autoResizeTextarea(input);
        
        // Check if input looks like a URL
        if (this.isValidUrl(input.value.trim())) {
            input.placeholder = 'Press Enter to analyze this URL...';
        } else {
            input.placeholder = 'Ask about content, paste a URL, or enter text to analyze...';
        }
    }

    autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    setupAutoResize() {
        const textarea = document.getElementById('message-input');
        this.autoResizeTextarea(textarea);
    }

    handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
        }
    }

    async sendMessage(customMessage = null, messageType = 'user') {
        const input = document.getElementById('message-input');
        const message = customMessage || input.value.trim();
        
        if (!message) return;

        // Check if message is a URL
        if (!customMessage && this.isValidUrl(message)) {
            document.getElementById('url-input').value = message;
            input.value = '';
            this.handleInputChange();
            this.analyzeUrl();
            return;
        }

        // Add user message
        if (!customMessage) {
            this.addMessage('user', message);
            input.value = '';
            this.handleInputChange();
        }

        // Show typing indicator
        this.showTypingIndicator();

        try {
            if (this.isDemo) {
                // Simulate API response
                setTimeout(() => {
                    this.hideTypingIndicator();
                    this.addDemoResponse(message, messageType);
                }, 1500);
            } else {
                // Make actual API call
                const response = await this.callGeminiAPI(message, messageType);
                this.hideTypingIndicator();
                this.addMessage('assistant', response, messageType);
            }
        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage('assistant', `Sorry, I encountered an error: ${error.message}`, 'error');
        }
    }

    addDemoResponse(message, messageType) {
        const responses = {
            summary: `## Summary\n\nThis is a **demo response** for the summary feature. In the full version with your API key, I would provide a comprehensive summary of the webpage content.\n\n### Key Points:\n- Main topic analysis\n- Important details extraction\n- Concise overview\n\n*This is a simulated response. Connect your Gemini API key for real functionality.*`,
            
            keypoints: `## Key Points\n\n🔑 **Main Points** (Demo):\n\n• **Point 1**: Important information would be extracted\n• **Point 2**: Key details would be highlighted\n• **Point 3**: Relevant data would be summarized\n• **Point 4**: Critical insights would be provided\n\n*This is a simulated response. Connect your Gemini API key for real functionality.*`,
            
            analysis: `## Content Analysis\n\n### Overview\nThis is a **demo analysis** showing how the full version would work.\n\n### Main Themes\n- Theme analysis would appear here\n- Detailed breakdowns would be provided\n- Comprehensive insights would be generated\n\n### Conclusions\nIn-depth analysis would be available with your API key.\n\n*This is a simulated response. Connect your Gemini API key for real functionality.*`,
            
            faq: `## Frequently Asked Questions\n\n**Q: What is this content about?**\nA: This is a demo response showing FAQ generation capabilities.\n\n**Q: How does the real version work?**\nA: With your Gemini API key, I can generate relevant FAQs from any webpage.\n\n**Q: What features are available?**\nA: Summary, key points, analysis, and FAQ generation from webpage content.\n\n*This is a simulated response. Connect your Gemini API key for real functionality.*`,
            
            user: `Thanks for your message! This is a **demo response** to show how TabTalk AI works.\n\nIn the full version with your Gemini API key, I would:\n- Analyze webpage content in detail\n- Answer specific questions about the content\n- Provide summaries and insights\n- Help you understand complex information\n\n*Connect your API key in settings to unlock full functionality!*`
        };

        const response = responses[messageType] || responses.user;
        this.addMessage('assistant', response, messageType);
    }

    async callGeminiAPI(message, messageType) {
        const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`;
        
        let systemPrompt = "You are TabTalk AI, a helpful assistant that analyzes webpage content and answers questions about it.";
        
        if (messageType === 'summary') {
            systemPrompt += " Provide a concise summary of the content.";
        } else if (messageType === 'keypoints') {
            systemPrompt += " Extract and list the key points in bullet format.";
        } else if (messageType === 'analysis') {
            systemPrompt += " Provide a detailed analysis including main themes, arguments, and conclusions.";
        } else if (messageType === 'faq') {
            systemPrompt += " Generate relevant frequently asked questions and answers based on the content.";
        }

        const payload = {
            contents: [{
                parts: [{
                    text: `${systemPrompt}\n\nContent: ${this.currentContent}\n\nUser question: ${message}`
                }]
            }],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
            }
        };

        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'API request failed');
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    }

    showTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'message assistant-message typing-indicator';
        indicator.innerHTML = `
            <div class="message-header">
                <div class="avatar">🤖</div>
                <span class="timestamp">${this.getCurrentTime()}</span>
            </div>
            <div class="content">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        
        const messagesContainer = document.getElementById('messages-container');
        messagesContainer.appendChild(indicator);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Add typing animation CSS if not already added
        if (!document.querySelector('#typing-animation-css')) {
            const style = document.createElement('style');
            style.id = 'typing-animation-css';
            style.textContent = `
                .typing-dots {
                    display: flex;
                    gap: 4px;
                    align-items: center;
                }
                .typing-dots span {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: var(--text-secondary);
                    animation: typing 1.4s infinite ease-in-out;
                }
                .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
                .typing-dots span:nth-child(2) { animation-delay: -0.16s; }
                @keyframes typing {
                    0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
                    40% { transform: scale(1); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    hideTypingIndicator() {
        const indicator = document.querySelector('.typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    addMessage(sender, content, messageType = 'normal') {
        const messagesContainer = document.getElementById('messages-container');
        const messageDiv = document.createElement('div');
        
        const senderClass = sender === 'user' ? 'user-message' : 'assistant-message';
        const typeClass = messageType !== 'normal' ? `${messageType}-message` : '';
        
        messageDiv.className = `message ${senderClass} ${typeClass}`;
        
        const avatar = sender === 'user' ? '👤' : '🤖';
        const senderName = sender === 'user' ? 'You' : 'TabTalk AI';
        
        // Convert markdown to HTML if marked is available
        let htmlContent = content;
        if (typeof marked !== 'undefined') {
            htmlContent = marked.parse(content);
        } else {
            // Basic markdown conversion
            htmlContent = content
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/`(.*?)`/g, '<code>$1</code>')
                .replace(/\n/g, '<br>');
        }
        
        messageDiv.innerHTML = `
            <div class="message-header">
                <div class="avatar">${avatar}</div>
                <span class="timestamp">${this.getCurrentTime()}</span>
            </div>
            <div class="content">${htmlContent}</div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        
        // Animate message appearance
        setTimeout(() => {
            messageDiv.classList.add('visible');
        }, 100);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Store message
        this.messages.push({
            sender,
            content,
            messageType,
            timestamp: new Date().toISOString()
        });
        
        // Update empty state
        this.updateEmptyState();
    }

    getCurrentTime() {
        return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    clearChat() {
        this.messages = [];
        document.getElementById('messages-container').innerHTML = '';
        this.updateEmptyState();
        
        if (this.isDemo) {
            this.addMessage('assistant', 'Chat cleared! Feel free to ask me anything or try the quick action buttons above.', 'demo');
        }
    }

    exportChat() {
        if (this.messages.length === 0) {
            alert('No messages to export');
            return;
        }

        const chatData = {
            timestamp: new Date().toISOString(),
            messages: this.messages,
            pageTitle: document.getElementById('page-title').textContent
        };

        const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tabtalk-chat-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TabTalkAI();
});

// Service Worker registration for PWA capabilities (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}