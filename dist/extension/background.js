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
    } else if (request.action === 'validateApiKey' || request.action === 'testApiKey') {
        // Support both 'validateApiKey' and 'testApiKey' for backward compatibility
        const { apiKey } = request;
        
        console.log("Background: Validating API key (action:", request.action + "):", apiKey ? "Key provided" : "No key");
        
        if (!apiKey) {
            sendResponse({ success: false, error: 'No API key provided' });
            return false;
        }
        
        // Clean the API key (remove any extra whitespace)
        const cleanedKey = apiKey.trim().replace(/\s+/g, '');
        
        console.log("Background: Cleaned key length:", cleanedKey.length, "starts with:", cleanedKey.substring(0, 4));
        
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
    console.log("Background: Starting API key validation...");
    
    // Basic format validation
    if (!apiKey || typeof apiKey !== 'string') {
        console.error("Background: Invalid API key type");
        return { success: false, error: 'Invalid API key format' };
    }
    
    // ROBUST: Clean the key thoroughly
    const cleanKey = String(apiKey)
        .trim()
        .replace(/[\s\u200B-\u200D\uFEFF]/g, '')
        .replace(/[\r\n\t]/g, '');
    
    console.log("Background: Cleaned key length:", cleanKey.length);
    console.log("Background: Key preview:", cleanKey.substring(0, 10) + "..." + cleanKey.substring(cleanKey.length - 4));
    
    if (cleanKey.length < 30) {
        console.error("Background: API key too short:", cleanKey.length);
        return { success: false, error: `API key too short (${cleanKey.length} chars). Expected 39+ characters.` };
    }
    
    // LENIENT: Don't enforce AIza prefix - let the API call determine validity
    // Some valid keys might have different prefixes
    if (!cleanKey.startsWith('AIza')) {
        console.warn("Background: Key doesn't start with AIza (starts with:", cleanKey.substring(0, 4) + "), but will attempt validation");
    }
    
    // Use a minimal test payload to validate the API key
    const testPayload = {
        contents: [{
            parts: [{ text: "Hi" }]
        }]
    };
    
    try {
        console.log("Background: Sending test request to Gemini API...");
        const response = await callGeminiApi(cleanKey, testPayload);
        
        console.log("Background: Test request completed:", response.success ? "SUCCESS" : "FAILED");
        
        // Check if the API call was successful
        if (response.success) {
            console.log("Background: ✓ API key is valid");
            return { success: true };
        } else {
            console.error("Background: ✗ API key validation failed:", response.error);
            // Provide more user-friendly error messages
            let errorMsg = response.error || 'Invalid API key';
            if (errorMsg.includes('API_KEY_INVALID') || errorMsg.includes('400')) {
                errorMsg = 'Invalid API key. Please check your key and try again.';
            } else if (errorMsg.includes('429')) {
                errorMsg = 'Rate limit exceeded. Please wait a moment and try again.';
            } else if (errorMsg.includes('403')) {
                errorMsg = 'API key does not have permission. Please check your API key settings.';
            }
            return { success: false, error: errorMsg };
        }
    } catch (error) {
        console.error("Background: Exception during validation:", error);
        return { success: false, error: error.message || 'Network error occurred' };
    }
}