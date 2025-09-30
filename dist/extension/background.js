// background.js - FINAL VERSION with KEY TRACING

const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_FALLBACK_MODEL = 'gemini-1.5-flash';
const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'callGeminiAPI') {
        const { apiKey, payload } = request;

        // --- KEY TRACING LOG 4 ---
        console.log("Background: Received this key from popup:", apiKey ? "Present" : "Missing");

        if (!apiKey) {
            sendResponse({ success: false, error: 'API Key was missing in the message to the background script.' });
            return false;
        }

        // Clean the API key (remove any extra whitespace)
        const cleanedKey = apiKey.trim().replace(/\s+/g, '');

        // Properly handle async response
        callGeminiApi(cleanedKey, payload)
            .then(response => sendResponse(response))
            .catch(error => sendResponse({ success: false, error: error.message }));
            
        return true; // Keep message channel open for async response
    } else if (request.action === 'validateApiKey') {
        const { apiKey } = request;
        
        console.log("Background: Validating API key:", apiKey ? "Key provided" : "No key");
        
        if (!apiKey) {
            sendResponse({ success: false, error: 'No API key provided' });
            return false;
        }
        
        // Clean the API key (remove any extra whitespace)
        const cleanedKey = apiKey.trim().replace(/\s+/g, '');
        
        // Properly handle async response
        validateApiKey(cleanedKey)
            .then(response => {
                console.log("Background: Validation result:", response);
                sendResponse(response);
            })
            .catch(error => {
                console.error("Background: Validation error:", error);
                sendResponse({ success: false, error: error.message || 'Validation failed' });
            });
        
        return true; // Keep message channel open for async response
    }
    
    return false; // No handler matched
});

async function callGeminiApi(apiKey, payload) {
    const attemptModel = async (model) => {
        const url = `${GEMINI_API_BASE_URL}${model}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const text = await response.text();
        return { response, text };
    };

    const shouldRetry = (status, errorJson) => {
        if (status === 429 || status === 503) return true;
        // UNAVAILABLE can also show via status 503
        if (errorJson?.error?.status === 'UNAVAILABLE') return true;
        return false;
    };

    const maxAttempts = 4;
    let attempt = 0;
    let lastError = 'Service temporarily unavailable. Please try again later.';
    let model = GEMINI_MODEL;

    while (attempt < maxAttempts) {
        try {
            console.log(`TabTalk AI (background): Using model: ${model}, attempt ${attempt + 1}/${maxAttempts}`);
            const { response, text } = await attemptModel(model);
            if (!response.ok) {
                let errorMessage = `API request failed (Status: ${response.status}).`;
                let errorJson = null;
                try {
                    errorJson = JSON.parse(text);
                    if (errorJson?.error?.message) errorMessage = `API Error: ${errorJson.error.message}`;
                } catch (e) {
                    errorMessage += ` Details: ${text.substring(0, 150)}...`;
                }
                console.error(`TabTalk AI (background): API Error Details: ${text}`);

                if (shouldRetry(response.status, errorJson)) {
                    attempt++;
                    // On last attempt before exit, try fallback model once if still primary
                    if (attempt === maxAttempts - 1 && model !== GEMINI_FALLBACK_MODEL) {
                        model = GEMINI_FALLBACK_MODEL;
                    }
                    const delay = Math.min(16000, 1000 * Math.pow(2, attempt - 1));
                    await new Promise(r => setTimeout(r, delay));
                    lastError = errorMessage;
                    continue;
                }
                return { success: false, error: errorMessage };
            }
            return { success: true, data: JSON.parse(text) };
        } catch (err) {
            lastError = `A network error occurred: ${err.message}`;
            attempt++;
            const delay = Math.min(16000, 1000 * Math.pow(2, attempt - 1));
            await new Promise(r => setTimeout(r, delay));
        }
    }
    return { success: false, error: lastError };
}

async function validateApiKey(apiKey) {
    // Use a minimal test payload to validate the API key
    const testPayload = {
        contents: [{
            parts: [{ text: "Hello" }]
        }]
    };
    
    try {
        const response = await callGeminiApi(apiKey, testPayload);
        // Check if the API call was successful
        if (response.success) {
            return { success: true };
        } else {
            return { success: false, error: response.error || 'Invalid API key' };
        }
    } catch (error) {
        return { success: false, error: error.message || 'Network error occurred' };
    }
}