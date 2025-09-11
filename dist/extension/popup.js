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

        // Get references to key DOM elements
        this.messageInput = document.getElementById('message-input');
        this.sendButton = document.getElementById('send-button');
        this.messagesContainer = document.getElementById('messages-container');
        this.pageStatus = document.getElementById('page-status');
        this.pageTitle = document.getElementById('page-title');
        this.quickActions = document.getElementById('quick-actions');
        this.sidebar = document.getElementById('sidebar');
        
        // Quick action buttons
        this.quickTwitterBtn = document.getElementById('quick-twitter');
        this.quickThreadBtn = document.getElementById('quick-thread');
        
        // Onboarding elements
        this.welcomeView = document.getElementById('welcome-view');
        this.apiSetupView = document.getElementById('api-setup-view');
        this.chatView = document.getElementById('chat-view');
        this.settingsView = document.getElementById('settings-view');
        this.historyView = document.getElementById('history-view');
        
        // Missing properties added here
        this.menuButton = document.getElementById('menu-button');
        // Prefer the actual settings input id from popup.html ('api-key-input')
        this.apiKeyInput = document.getElementById('api-key-input') || document.getElementById('settings-api-key');
        this.inputActions = document.querySelector('.input-actions'); // Adjust selector if different
        this.exportFormatSelect = document.getElementById('export-format-select'); // Adjust ID if different
        this.statusText = document.getElementById('status-text'); // Adjust ID if different
        this.views = {
            welcome: this.welcomeView,
            'api-setup': this.apiSetupView,
            chat: this.chatView,
            settings: this.settingsView,
            history: this.historyView
        };
    }

    async init() {
        console.log('TabTalk AI: Initializing popup');
        
        // Fetch current tab (missing in original code)
        this.currentTab = (await chrome.tabs.query({ active: true, currentWindow: true }))[0];
        
        // Load saved state
        await this.loadState();
        
        // Set up event listeners
        this.bindEvents();
        
        // Determine initial view: prioritize API key over onboarding flags
        const hasSeenWelcome = await this.getStorageItem('hasSeenWelcome');
        if (this.apiKey) {
            // If user already saved an API key, never fall back to onboarding
            this.showView('chat');
            await this.getAndCachePageContent();
        } else if (hasSeenWelcome) {
            // User saw welcome previously but has no key yet → go directly to API setup
            this.showView('api-setup');
        } else {
            // First time user → show minimal welcome
            this.showView('welcome');
        }
        
        console.log('TabTalk AI: Popup initialized');
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
        const deleteApiKeyButton = document.getElementById('delete-api-key-button');
        if (deleteApiKeyButton) {
            deleteApiKeyButton.addEventListener('click', () => this.handleDeleteApiKey());
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
        const menuHistoryLink = document.getElementById('menu-history-link');
        if (menuHistoryLink) {
            menuHistoryLink.addEventListener('click', async (e) => {
                e.preventDefault();
                this.updateViewState('history');
                if (this.sidebar) {
                    this.sidebar.classList.add('hidden');
                    this.sidebar.style.display = 'none';
                }
                if (this.loadAndRenderHistory) await this.loadAndRenderHistory();
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

        // Onboarding Navigation

        const welcomeGetStarted = document.getElementById('welcome-get-started');
        if (welcomeGetStarted) {
            welcomeGetStarted.addEventListener('click', async () => {
                await this.setStorageItem('hasSeenWelcome', true);
                this.showView('api-setup');
            });
        }

        // New: explicit "Start" button at bottom of onboarding to go to API setup
        const welcomeStart = document.getElementById('welcome-start');
        if (welcomeStart) {
            welcomeStart.addEventListener('click', async () => {
                await this.setStorageItem('hasSeenWelcome', true);
                this.showView('api-setup');
            });
        }

        const apiSetupBack = document.getElementById('api-setup-back');
        if (apiSetupBack) {
            apiSetupBack.addEventListener('click', () => {
                this.showView('welcome');
            });
        }

        const apiSetupBackArrow = document.getElementById('api-setup-back-arrow');
        if (apiSetupBackArrow) {
            apiSetupBackArrow.addEventListener('click', () => {
                this.showView('welcome');
            });
        }

        const apiSetupContinue = document.getElementById('api-setup-continue');
        if (apiSetupContinue) {
            apiSetupContinue.addEventListener('click', async () => {
                const apiKey = document.getElementById('onboarding-api-key').value.trim();
                if (apiKey) {
                    await this.saveApiKey(apiKey);
                    this.showView('chat');
                    await this.getAndCachePageContent();
                }
            });
        }

        const testApiKey = document.getElementById('test-api-key');
        if (testApiKey) {
            testApiKey.addEventListener('click', async () => {
                const apiKey = document.getElementById('onboarding-api-key').value.trim();
                if (apiKey) {
                    const isValid = await this.testApiKey(apiKey);
                    const continueBtn = document.getElementById('api-setup-continue');
                    if (isValid) {
                        testApiKey.textContent = '✓ Valid';
                        testApiKey.style.background = '#10b981';
                        testApiKey.style.color = 'white';
                        continueBtn.disabled = false;
                    } else {
                        testApiKey.textContent = '✗ Invalid';
                        testApiKey.style.background = '#ef4444';
                        testApiKey.style.color = 'white';
                        continueBtn.disabled = true;
                    }
                    setTimeout(() => {
                        testApiKey.textContent = 'Test';
                        testApiKey.style.background = '';
                        testApiKey.style.color = '';
                    }, 2000);
                }
            });
        }

        const onboardingApiKey = document.getElementById('onboarding-api-key');
        if (onboardingApiKey) {
            onboardingApiKey.addEventListener('input', () => {
                const continueBtn = document.getElementById('api-setup-continue');
                continueBtn.disabled = !onboardingApiKey.value.trim();
            });
        }

        // FAQ Generator (kept in sidebar as it's not in horizontal scroll)
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
        const exportChatButton = this.inputActions ? this.inputActions.querySelector('#export-chat-button') : document.getElementById('export-chat-button');
        if (exportChatButton) {
            exportChatButton.addEventListener('click', () => this.handleExportChat());
        }
        // Export format select (inside input-actions)
        const exportFormatSelect = this.inputActions ? this.inputActions.querySelector('#export-format-select') : document.getElementById('export-format-select');
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

        // Quick actions buttons - Enhanced horizontal scroll content creation
        if (this.quickTwitterBtn) {
            this.quickTwitterBtn.addEventListener('click', async () => {
                if (this.resetScreenForGeneration) this.resetScreenForGeneration();
                await this.generateSocialContent('twitter');
                // Don't hide - keep buttons visible for multiple generations
            });
        }
        if (this.quickThreadBtn) {
            this.quickThreadBtn.addEventListener('click', async () => {
                if (this.resetScreenForGeneration) this.resetScreenForGeneration();
                await this.generateSocialContent('thread');
                // Don't hide - keep buttons visible for multiple generations
            });
        }
        
        // New action buttons
        const quickBlogBtn = document.getElementById('quick-blog');
        if (quickBlogBtn) {
            quickBlogBtn.addEventListener('click', async () => {
                if (this.resetScreenForGeneration) this.resetScreenForGeneration();
                await this.generateSpecialContent('blog');
            });
        }
        
        const quickSummaryBtn = document.getElementById('quick-summary');
        if (quickSummaryBtn) {
            quickSummaryBtn.addEventListener('click', async () => {
                if (this.resetScreenForGeneration) this.resetScreenForGeneration();
                await this.generateSpecialContent('summary');
            });
        }
        
        const quickKeyPointsBtn = document.getElementById('quick-keypoints');
        if (quickKeyPointsBtn) {
            quickKeyPointsBtn.addEventListener('click', async () => {
                if (this.resetScreenForGeneration) this.resetScreenForGeneration();
                await this.generateSpecialContent('keypoints');
            });
        }
        
        const quickFactCheckBtn = document.getElementById('quick-factcheck');
        if (quickFactCheckBtn) {
            quickFactCheckBtn.addEventListener('click', async () => {
                if (this.resetScreenForGeneration) this.resetScreenForGeneration();
                await this.generateSpecialContent('factcheck');
            });
        }
        
        const quickAnalysisBtn = document.getElementById('quick-analysis');
        if (quickAnalysisBtn) {
            quickAnalysisBtn.addEventListener('click', async () => {
                if (this.resetScreenForGeneration) this.resetScreenForGeneration();
                await this.generateSpecialContent('analysis');
            });
        }
        
        // Horizontal scroll interaction
        this.initializeHorizontalScroll();
    }


    

    

    
    
    

    

    async testApiKey(apiKey) {
        try {
            const response = await chrome.runtime.sendMessage({
                action: 'testApiKey',
                apiKey: apiKey
            });
            return response && response.success;
        } catch (error) {
            console.error('Error testing API key:', error);
            return false;
        }
    }

    async handleSaveSettings() {
        const newApiKey = this.apiKeyInput ? this.apiKeyInput.value.trim() : '';
        
        if (!newApiKey) {
            alert('Please enter a valid API key');
            return;
        }
        
        if (await this.testApiKey(newApiKey)) {
            await this.saveApiKey(newApiKey);
            console.log("TabTalk AI: Saving API key with key name 'geminiApiKey' successfully");
            
            this.showView('chat');
            await this.getAndCachePageContent();
        } else {
            alert('Invalid API key. Please try again.');
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

    

    async generateSpecialContent(contentType) {
        if (!this.pageContent || !this.apiKey) {
            alert('Please make sure you have set up your API key and the page content is loaded.');
            return;
        }
        // Clean screen before generation
        if (this.resetScreenForGeneration) this.resetScreenForGeneration();
        this.setLoading(true, `Generating ${contentType}...`);
        if (this.showProgressBar) this.showProgressBar(`Generating ${contentType}...`);
        console.log(`TabTalk AI: Generating ${contentType} for page: ${this.currentTab?.title}`);

        try {
            let systemPrompt = '';
            let userPrompt = '';

            // Set appropriate system prompt based on content type
            switch (contentType) {
                case 'summary':
                    systemPrompt = `You are an expert summarizer. Produce a clean, copy-ready summary with NO prefaces (do NOT start with phrases like "Here's" or "Below is").
                    Strict rules:
                    - Output plain text or markdown only, no boilerplate, no disclaimers
                    - 1–2 short paragraphs, 100–150 words total
                    - No markdown emphasis (** or _)
                    - No headings, no lists, no closing remarks
                    - Focus only on the core ideas
                    - Never include artifacts like (line break) or duplicated links`;
                    
                    userPrompt = `Create a concise 100–150 word summary. No intro/outro lines, no filler words, no emphasis. Return only the final summary.\n\nCONTENT:\n${this.pageContent}`;
                    break;

                case 'keypoints':
                    systemPrompt = `You are an expert content analyst. Extract 5–10 clean key points.
                    Strict rules:
                    - Output ONLY a bullet list using hyphens ("- ") per line
                    - No preface like "Here are" or "Here's a list"; no headings; no intro/outro
                    - No markdown emphasis (** or _)
                    - Each bullet must be a single, complete idea; no run-on sentences
                    - No extra blank lines, no numbering
                    - No artifacts like (line break) or duplicated links`;
                    
                    userPrompt = `Return ONLY hyphen bullets with the key points. No extra text above or below.\n\nCONTENT:\n${this.pageContent}`;
                    break;

                case 'analysis':
                    systemPrompt = `You are an expert content analyst. Provide an in-depth analysis.
                    Strict rules:
                    - Use markdown headings for sections: Overview, Main Themes, Evidence Quality, Perspective, Context, Strengths & Weaknesses, Implications, Conclusion
                    - No preface or filler like "Here is"; start directly with the first heading
                    - Be specific and cite details from the content; avoid generic phrases
                    - Keep paragraphs short and scannable
                    - No duplicated links or artifacts`;
                    
                    userPrompt = `Write a structured analysis with the exact headings above. Start immediately with "## Overview".\n\nCONTENT:\n${this.pageContent}`;
                    break;

                case 'faq':
                    systemPrompt = `You are an expert FAQ creator. Generate 5–8 Q&A pairs.
                    Strict rules:
                    - Output as markdown: "### Q: ..." then an answer paragraph
                    - No preface or intro sections
                    - Keep Q precise and Answer concrete
                    - Use bullets in answers only if necessary, with hyphens
                    - No artifacts or duplicated links`;
                    
                    userPrompt = `Return ONLY the Q&A in the markdown format described.\n\nCONTENT:\n${this.pageContent}`;
                    break;

                case 'factcheck':
                    systemPrompt = `You are an expert fact-checker. Identify 5–10 factual claims and assess them.
                    Strict rules:
                    - Start directly with "Claim 1:" (no preface)
                    - For each claim include: Claim, Verifiability, Evidence (if any), Consistency, Confidence (High/Medium/Low), Notes
                    - Use concise bullets with hyphens under each claim heading
                    - No duplicated links or artifacts`;
                    
                    userPrompt = `Write the fact-check starting with "Claim 1:" and continue incrementally.\n\nCONTENT:\n${this.pageContent}`;
                    break;

                case 'blog':
                    systemPrompt = `You are an expert blog writer. Produce a clean, engaging blog post.
                    Strict rules:
                    - Use markdown: H1 title, then H2 sections
                    - No preface; start directly with the H1 title
                    - Short paragraphs, clear transitions
                    - No duplicated links or artifacts
                    - Aim 500–800 words`;
                    
                    userPrompt = `Write the blog post now. Begin with "# " title line.\n\nCONTENT:\n${this.pageContent}`;
                    break;

                default:
                    throw new Error('Unknown content type');
            }

            console.log(`TabTalk AI: Calling API for ${contentType} with prompt length: ${systemPrompt.length + userPrompt.length} characters`);
            
            // Call the API with the appropriate prompts
            const response = await this.callGeminiAPIWithSystemPrompt(systemPrompt, userPrompt);
            if (response) {
                console.log(`TabTalk AI: Successfully generated ${contentType}, response length: ${response.length} characters`);
                // Render in card format using our structured renderer
                if (this.renderStructuredContent) this.renderStructuredContent(contentType, response);
                // Save to category-wise history for future History page
                if (this.addToHistory) {
                    const record = {
                        timestamp: new Date().toISOString(),
                        url: this.currentTab?.url || '',
                        title: this.currentTab?.title || '',
                        domain: this.currentDomain || '',
                        content: response,
                        type: contentType
                    };
                    await this.addToHistory(contentType, record);
                }
            } else {
                throw new Error('Empty response received from API');
            }
        } catch (error) {
            console.error(`Error generating ${contentType}:`, error);
            this.addMessage('assistant', `Sorry, there was an error generating the ${contentType}: ${error.message}`);
        } finally {
            this.setLoading(false);
            if (this.hideProgressBar) this.hideProgressBar();
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
        this.saveState();
    }

    

    

    
    

    

    

    

    

    

    

    

    

}

// Attach module mixins if present (Phase 1 modularization)
if (window.TabTalkAPI) Object.assign(TabTalkAI.prototype, window.TabTalkAPI);
if (window.TabTalkExport) Object.assign(TabTalkAI.prototype, window.TabTalkExport);
if (window.TabTalkTwitter) Object.assign(TabTalkAI.prototype, window.TabTalkTwitter);
if (window.TabTalkStorage) Object.assign(TabTalkAI.prototype, window.TabTalkStorage);
if (window.TabTalkUI) Object.assign(TabTalkAI.prototype, window.TabTalkUI);
if (window.TabTalkScroll) Object.assign(TabTalkAI.prototype, window.TabTalkScroll);
if (window.TabTalkNavigation) Object.assign(TabTalkAI.prototype, window.TabTalkNavigation);

document.addEventListener('DOMContentLoaded', () => {
    const app = new TabTalkAI();
    app.init().catch(error => console.error('Initialization error:', error));
});