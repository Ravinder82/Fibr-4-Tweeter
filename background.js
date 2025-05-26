// Background script for TabTalk AI Chrome Extension

chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('TabTalk AI installed successfully');
        
        // Set default settings
        chrome.storage.local.set({
            geminiApiKey: '',
            settings: {
                autoAnalyze: true,
                responseLength: 'medium'
            }
        });
    }
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
    // The popup will handle the interaction
    console.log('Extension icon clicked for tab:', tab.id);
});

// Handle messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'extractContent') {
        handleContentExtraction(request, sender, sendResponse);
        return true; // Will respond asynchronously
    }
    
    if (request.action === 'callGeminiAPI') {
        handleGeminiAPI(request, sender, sendResponse);
        return true; // Will respond asynchronously
    }
});

async function handleContentExtraction(request, sender, sendResponse) {
    try {
        // This function could be used for more complex content extraction
        // For now, content extraction is handled directly in the popup
        sendResponse({ success: true });
    } catch (error) {
        console.error('Content extraction error:', error);
        sendResponse({ success: false, error: error.message });
    }
}

async function handleGeminiAPI(request, sender, sendResponse) {
    try {
        // Get API key from storage
        const result = await chrome.storage.local.get(['geminiApiKey']);
        const apiKey = result.geminiApiKey;
        
        if (!apiKey) {
            throw new Error('Gemini API key not configured');
        }
        
        // Make API call
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request.payload)
        });
        
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        sendResponse({ success: true, data: data });
        
    } catch (error) {
        console.error('Gemini API error:', error);
        sendResponse({ success: false, error: error.message });
    }
}

// Handle extension uninstall (cleanup)
chrome.runtime.onSuspend.addListener(() => {
    console.log('TabTalk AI background script suspended');
});

// Monitor tab updates for potential auto-analysis feature
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        // Could trigger auto-analysis here if enabled in settings
        console.log('Page loaded:', tab.url);
    }
});

// Error handling for uncaught errors
self.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection in background script:', event.reason);
});

self.addEventListener('error', (event) => {
    console.error('Error in background script:', event.error);
});