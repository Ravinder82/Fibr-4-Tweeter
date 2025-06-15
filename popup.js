class TabTalkAI {
    constructor() {
        this.apiKey = null;
        this.currentTab = null;
        this.chatHistory = [];
        this.pageContent = null;
        this.isLoading = false;

        // --- DOM Elements ---
        this.views = {
            onboarding: document.getElementById('onboarding-view'),
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
                this.updateViewState('onboarding');
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
        document.getElementById('onboarding-go-to-settings').addEventListener('click', () => this.updateViewState('settings'));
        document.getElementById('settings-cancel-button').addEventListener('click', () => {
            this.updateViewState(this.apiKey ? 'chat' : 'onboarding');
        });
        document.getElementById('settings-save-button').addEventListener('click', () => this.handleSaveSettings());

        // Menu Logic
        this.menuButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.dropdownMenu.classList.toggle('hidden');
        });
        document.getElementById('menu-settings-link').addEventListener('click', (e) => {
            e.preventDefault();
            this.updateViewState('settings');
        });
        document.getElementById('menu-refresh-link').addEventListener('click', (e) => {
            e.preventDefault();
            this.handleRefresh();
        });
        // Close menu when clicking anywhere else
        document.addEventListener('click', () => this.dropdownMenu.classList.add('hidden'));

        // Chat Input Logic
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        this.messageInput.addEventListener('input', () => {
            // Auto-resize textarea
            this.messageInput.style.height = 'auto';
            this.messageInput.style.height = `${this.messageInput.scrollHeight}px`;
            // Enable/disable send button
            this.sendButton.disabled = this.messageInput.value.trim().length === 0 || this.isLoading;
        });
    }

    updateViewState(state, statusMessage = 'Loading...') {
        this.dropdownMenu.classList.add('hidden'); // Always close menu on view change
        Object.values(this.views).forEach(view => view.classList.add('hidden'));
        
        if (this.views[state]) {
            this.views[state].classList.remove('hidden');
            if (state === 'status') {
                this.statusText.textContent = statusMessage;
            }
        } else {
            this.views.status.classList.remove('hidden');
            this.statusText.textContent = 'Error: Invalid view state.';
        }
    }

    async loadState() {
        // --- KEY TRACING LOG 1 ---
        console.log("Popup: Attempting to load state from storage.");
        const data = await chrome.storage.local.get(['geminiApiKey', `chatHistory_${this.currentTab.id}`]);
        this.apiKey = data.geminiApiKey || null;
        console.log("Popup: Loaded this key from storage:", this.apiKey);
        
        this.chatHistory = data[`chatHistory_${this.currentTab.id}`] || [];
        
        if(this.apiKey) {
            this.apiKeyInput.value = this.apiKey;
        }
        this.pageTitle.textContent = this.currentTab.title || 'Untitled Page';
        this.renderMessages();
    }
    
    async saveState() {
        await chrome.storage.local.set({
            'geminiApiKey': this.apiKey,
            [`chatHistory_${this.currentTab.id}`]: this.chatHistory.slice(-20)
        });
    }

    async handleSaveSettings() {
        const newApiKey = this.apiKeyInput.value.trim();
        if (!newApiKey) {
            alert('API Key cannot be empty.');
            return;
        }
        
        console.log("Popup: Attempting to save this key:", newApiKey);
        this.apiKey = newApiKey;
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
        const userMessage = this.messageInput.value.trim();
        if (!userMessage || this.isLoading) return;
        
        this.addMessage('user', userMessage);
        this.messageInput.value = '';
        this.setLoading(true);

        try {
            if (!this.pageContent) {
                this.pageStatus.textContent = "⚠️ Re-analyzing page before sending...";
                await this.getAndCachePageContent();
                if (!this.pageContent) throw new Error("Could not get page content to answer your question.");
            }
            
            console.log("Popup: Sending this key to background for API call:", this.apiKey);

            const systemPrompt = "You are TabTalk AI, a helpful assistant. Your knowledge is limited to the provided webpage content. Be concise and use Markdown for formatting.";
            const conversation = [
                { role: 'user', parts: [{ text: systemPrompt }] }, { role: 'model', parts: [{ text: "Okay, I will act as TabTalk AI." }] },
                { role: 'user', parts: [{ text: `WEBPAGE CONTENT:\n${this.pageContent}` }] }, { role: 'model', parts: [{ text: "I have the content. How can I help?" }] }
            ];
            this.chatHistory.forEach(msg => conversation.push({ role: msg.role, parts: [{ text: msg.content }] }));
            conversation.push({ role: 'user', parts: [{ text: userMessage }] });

            const response = await chrome.runtime.sendMessage({
                action: 'callGeminiAPI',
                payload: { contents: conversation },
                apiKey: this.apiKey
            });

            if (response.success && response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
                const aiMessage = response.data.candidates[0].content.parts[0].text;
                this.addMessage('model', aiMessage);
            } else {
                throw new Error(response.error || 'The AI gave an empty or invalid response.');
            }
        } catch (error) {
            this.addMessage('model', `**Error:** I couldn't get a response. ${error.message}`);
        } finally {
            this.setLoading(false);
            await this.saveState();
        }
    }
    
    async handleRefresh() {
        this.dropdownMenu.classList.add('hidden');
        this.pageContent = null;
        this.chatHistory = []; // Optionally clear chat on refresh
        await this.saveState();
        this.renderMessages();
        this.updateViewState('chat');
        await this.getAndCachePageContent();
    }
    
    addMessage(role, content) {
        this.chatHistory.push({ role, content });
        this.renderMessages();
    }

    renderMessages() {
        this.messagesContainer.innerHTML = '';
        if (this.chatHistory.length === 0) {
            this.messagesContainer.innerHTML = `<div class="info-message">Ask a question to get started!</div>`;
        }
        this.chatHistory.forEach(msg => {
            const messageEl = document.createElement('div');
            messageEl.className = `message ${msg.role === 'user' ? 'user-message' : 'assistant-message'}`;
            const contentEl = document.createElement('div');
            contentEl.className = 'content';
            contentEl.innerHTML = this.marked ? this.marked.parse(msg.content) : msg.content;
            messageEl.appendChild(contentEl);
            this.messagesContainer.appendChild(messageEl);
        });
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
    
    setLoading(isLoading, statusMessage = '...') {
        this.isLoading = isLoading;
        this.sendButton.disabled = isLoading || this.messageInput.value.trim().length === 0;
        this.messageInput.disabled = isLoading;
        if(isLoading) {
            this.pageStatus.textContent = statusMessage;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new TabTalkAI();
    app.init();
});