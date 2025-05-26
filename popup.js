// DOM Elements
const settingsBtn = document.getElementById('settingsBtn');
const settingsPanel = document.getElementById('settingsPanel');
const apiKeyInput = document.getElementById('apiKey');
const toggleKeyBtn = document.getElementById('toggleKey');
const saveSettingsBtn = document.getElementById('saveSettings');
const cancelSettingsBtn = document.getElementById('cancelSettings');
const openSettingsBtn = document.getElementById('openSettingsBtn');

const loadingState = document.getElementById('loadingState');
const setupRequired = document.getElementById('setupRequired');
const chatContainer = document.getElementById('chatContainer');
const errorState = document.getElementById('errorState');
const errorMessage = document.getElementById('errorMessage');
const retryBtn = document.getElementById('retryBtn');

const pageTitle = document.getElementById('pageTitle');
const pageUrl = document.getElementById('pageUrl');
const messagesContainer = document.getElementById('messagesContainer');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const clearChatBtn = document.getElementById('clearChat');

// Global state
let currentPageContent = '';
let apiKey = '';
let isProcessing = false;

// Initialize popup
document.addEventListener('DOMContentLoaded', initializePopup);

async function initializePopup() {
    try {
        // Load saved API key
        const result = await chrome.storage.local.get(['geminiApiKey']);
        if (result.geminiApiKey) {
            apiKey = result.geminiApiKey;
            apiKeyInput.value = apiKey;
            await loadPageContent();
        } else {
            showState('setup');
        }
    } catch (error) {
        console.error('Failed to initialize popup:', error);
        showError('Failed to initialize extension');
    }
}

async function loadPageContent() {
    showState('loading');
    
    try {
        // Get active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (!tab) {
            throw new Error('No active tab found');
        }

        // Check if tab is accessible
        if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('moz-extension://')) {
            throw new Error('Cannot access browser internal pages');
        }

        // Inject and execute content script
        const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: extractPageContent
        });

        if (!results || !results[0]) {
            throw new Error('Failed to extract page content');
        }

        const result = results[0].result;
        
        if (!result.success) {
            throw new Error(result.error || 'Failed to extract content');
        }

        currentPageContent = result.content;
        
        // Update UI with page info
        pageTitle.textContent = result.title || 'Untitled Page';
        pageUrl.textContent = new URL(tab.url).hostname;
        
        showState('chat');
        
    } catch (error) {
        console.error('Failed to load page content:', error);
        showError(error.message || 'Failed to load page content');
    }
}

// Content extraction function (runs in page context)
function extractPageContent() {
    try {
        // Remove script and style elements
        const scripts = document.querySelectorAll('script, style, noscript');
        scripts.forEach(el => el.remove());
        
        // Get main content
        let content = '';
        const title = document.title;
        
        // Try to find main content area
        const mainSelectors = [
            'main',
            '[role="main"]',
            '.main-content',
            '#main-content',
            '.content',
            '#content',
            'article',
            '.article',
            '.post'
        ];
        
        let mainElement = null;
        for (const selector of mainSelectors) {
            mainElement = document.querySelector(selector);
            if (mainElement) break;
        }
        
        // Extract text from main element or body
        const targetElement = mainElement || document.body;
        
        if (targetElement) {
            // Get text from common content elements
            const contentElements = targetElement.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, td, th, div, span, section, article');
            
            const textParts = [];
            contentElements.forEach(el => {
                const text = el.textContent?.trim();
                if (text && text.length > 10 && !textParts.includes(text)) {
                    textParts.push(text);
                }
            });
            
            content = textParts.join('\n\n');
        }
        
        // Fallback to body text
        if (!content || content.length < 100) {
            content = document.body.textContent?.trim() || '';
        }
        
        // Clean up content
        content = content
            .replace(/\s+/g, ' ')
            .replace(/\n\s*\n/g, '\n\n')
            .trim();
        
        // Limit content size (Gemini has token limits)
        if (content.length > 30000) {
            content = content.substring(0, 30000) + '... [Content truncated]';
        }
        
        if (!content || content.length < 50) {
            return {
                success: false,
                error: 'Unable to extract meaningful content from this page'
            };
        }
        
        return {
            success: true,
            title: title,
            content: content,
            url: window.location.href
        };
        
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// Show different states
function showState(state) {
    const states = [loadingState, setupRequired, chatContainer, errorState];
    states.forEach(el => el.style.display = 'none');
    
    switch (state) {
        case 'loading':
            loadingState.style.display = 'flex';
            break;
        case 'setup':
            setupRequired.style.display = 'flex';
            break;
        case 'chat':
            chatContainer.style.display = 'flex';
            break;
        case 'error':
            errorState.style.display = 'flex';
            break;
    }
}

function showError(message) {
    errorMessage.textContent = message;
    showState('error');
}

// Settings management
settingsBtn.addEventListener('click', () => {
    const isVisible = settingsPanel.style.display !== 'none';
    settingsPanel.style.display = isVisible ? 'none' : 'block';
});

openSettingsBtn.addEventListener('click', () => {
    settingsPanel.style.display = 'block';
});

toggleKeyBtn.addEventListener('click', () => {
    const isPassword = apiKeyInput.type === 'password';
    apiKeyInput.type = isPassword ? 'text' : 'password';
    toggleKeyBtn.textContent = isPassword ? '🙈' : '👁️';
});

saveSettingsBtn.addEventListener('click', async () => {
    const newApiKey = apiKeyInput.value.trim();
    
    if (!newApiKey) {
        alert('Please enter your Gemini API key');
        return;
    }
    
    try {
        await chrome.storage.local.set({ geminiApiKey: newApiKey });
        apiKey = newApiKey;
        settingsPanel.style.display = 'none';
        
        if (currentPageContent) {
            showState('chat');
        } else {
            await loadPageContent();
        }
    } catch (error) {
        console.error('Failed to save API key:', error);
        alert('Failed to save API key');
    }
});

cancelSettingsBtn.addEventListener('click', () => {
    // Reset input to saved value
    chrome.storage.local.get(['geminiApiKey']).then(result => {
        apiKeyInput.value = result.geminiApiKey || '';
        settingsPanel.style.display = 'none';
    });
});

// Chat functionality
messageInput.addEventListener('input', () => {
    messageInput.style.height = 'auto';
    messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
    
    sendBtn.disabled = !messageInput.value.trim() || isProcessing;
});

messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

sendBtn.addEventListener('click', sendMessage);

// Quick actions
document.querySelectorAll('.quick-action').forEach(btn => {
    btn.addEventListener('click', () => {
        const prompt = btn.dataset.prompt;
        messageInput.value = prompt;
        sendMessage();
    });
});

clearChatBtn.addEventListener('click', () => {
    if (confirm('Clear all messages in this chat?')) {
        clearChat();
    }
});

retryBtn.addEventListener('click', () => {
    loadPageContent();
});

async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message || isProcessing) return;
    
    isProcessing = true;
    sendBtn.disabled = true;
    
    // Add user message to chat
    addMessage('user', message);
    messageInput.value = '';
    messageInput.style.height = 'auto';
    
    // Show loading indicator
    const loadingEl = addMessage('assistant', '', true);
    
    try {
        const response = await callGeminiAPI(message);
        
        // Remove loading indicator and add actual response
        loadingEl.remove();
        addMessage('assistant', response);
        
    } catch (error) {
        console.error('Failed to get AI response:', error);
        loadingEl.remove();
        addMessage('assistant', '❌ Sorry, I encountered an error. Please try again.');
    } finally {
        isProcessing = false;
        sendBtn.disabled = false;
        messageInput.focus();
    }
}

function addMessage(sender, content, isLoading = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `${sender}-message`;
    
    if (isLoading) {
        messageDiv.innerHTML = `
            <div class="message-loading">
                <div class="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <span>Thinking...</span>
            </div>
        `;
    } else {
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.innerHTML = marked.parse(content);
        messageDiv.appendChild(messageContent);

        // Only add controls for assistant messages
        if (sender === 'assistant') {
            const controls = document.createElement('div');
            controls.className = 'message-controls';
            controls.style.display = 'flex';
            controls.style.gap = '8px';
            controls.style.marginTop = '6px';

            // Copy button
            const copyBtn = document.createElement('button');
            copyBtn.className = 'msg-btn copy-btn';
            copyBtn.title = 'Copy to clipboard';
            copyBtn.textContent = '📋';
            copyBtn.onclick = () => {
                // Copy plain text (strip HTML tags)
                const temp = document.createElement('div');
                temp.innerHTML = messageContent.innerHTML;
                const text = temp.textContent || temp.innerText || '';
                navigator.clipboard.writeText(text);
                copyBtn.textContent = '✅';
                setTimeout(() => copyBtn.textContent = '📋', 1000);
            };
            controls.appendChild(copyBtn);

            // Save button
            const saveBtn = document.createElement('button');
            saveBtn.className = 'msg-btn save-btn';
            saveBtn.title = 'Save as .txt';
            saveBtn.textContent = '💾';
            saveBtn.onclick = () => {
                const temp = document.createElement('div');
                temp.innerHTML = messageContent.innerHTML;
                const text = temp.textContent || temp.innerText || '';
                const blob = new Blob([text], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'tabtalk-output.txt';
                document.body.appendChild(a);
                a.click();
                setTimeout(() => {
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }, 100);
            };
            controls.appendChild(saveBtn);

            // Delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'msg-btn delete-btn';
            deleteBtn.title = 'Delete this message';
            deleteBtn.textContent = '🗑️';
            deleteBtn.onclick = () => {
                messageDiv.remove();
            };
            controls.appendChild(deleteBtn);

            messageDiv.appendChild(controls);
        }
    }
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    return messageDiv;
}

async function callGeminiAPI(userMessage) {
    const prompt = `You are a helpful AI assistant that analyzes and discusses webpage content. A user is asking about the following webpage:

Title: ${pageTitle.textContent}
URL: ${pageUrl.textContent}

Page Content:
${currentPageContent}

User Question: ${userMessage}

---

**Formatting Instructions:**
- Format your answer using markdown with clear section headings (use ### or **bold** for main topics).
- Use bullet points or numbered lists for details and subpoints.
- Add line breaks and spacing between sections for readability.
- Make the output visually beautiful, easy to scan, and well-structured.
- If summarizing, provide a concise, point-wise summary with clear topic separation.
- If explaining, break down concepts step by step.
- If listing, use bullet points or checklists.
- Do not include unnecessary preambles or apologies.

---

Please provide your response in this beautiful, structured markdown format based on the webpage content. If the question cannot be answered from the content provided, politely explain what information is available instead.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
            },
            safetySettings: [
                {
                    category: "HARM_CATEGORY_HARASSMENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_HATE_SPEECH",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                }
            ]
        })
    });

    if (!response.ok) {
        if (response.status === 400) {
            throw new Error('Invalid API key or request format');
        } else if (response.status === 403) {
            throw new Error('API key access denied or quota exceeded');
        } else if (response.status === 429) {
            throw new Error('Rate limit exceeded. Please try again later.');
        } else {
            throw new Error(`API request failed with status ${response.status}`);
        }
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid response from Gemini API');
    }

    return data.candidates[0].content.parts[0].text;
}

function clearChat() {
    // Remove all messages except welcome message
    const messages = messagesContainer.querySelectorAll('.user-message, .assistant-message:not(.welcome-message .assistant-message)');
    messages.forEach(msg => msg.remove());
}