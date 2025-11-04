// background.js - Direct API calls without rate limiting

const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_FALLBACK_MODEL = 'gemini-1.5-flash';
const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/';

function parseRetryAfter(headerValue) {
    if (!headerValue) {
        return null;
    }

    const numericDelay = Number(headerValue);
    if (!Number.isNaN(numericDelay)) {
        return Math.max(0, numericDelay * 1000);
    }

    const asDate = Date.parse(headerValue);
    if (!Number.isNaN(asDate)) {
        const diff = asDate - Date.now();
        return diff > 0 ? diff : null;
    }

    return null;
}

function formatDuration(ms) {
    if (!ms || ms <= 0) {
        return 'a moment';
    }

    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;

    const parts = [];
    if (days) {
        parts.push(`${days}d`);
    }
    if (remainingHours) {
        parts.push(`${remainingHours}h`);
    }
    if (remainingMinutes && parts.length < 2) {
        parts.push(`${remainingMinutes}m`);
    }
    if (!parts.length && seconds) {
        parts.push(`${seconds}s`);
    }

    return parts.join(' ') || 'a moment';
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'callGeminiAPI') {
        const { apiKey, payload } = request;

        console.log("Background: Received API request from popup:", apiKey ? "Key present" : "No key");

        if (!apiKey) {
            sendResponse({ success: false, error: 'API Key was missing in the message to the background script.' });
            return false;
        }

        // Clean the API key (remove any extra whitespace)
        const cleanedKey = apiKey.trim().replace(/\s+/g, '');
        
        // Direct API call without rate limiting
        callGeminiApiDirect(cleanedKey, payload)
            .then(response => sendResponse(response))
            .catch(error => sendResponse({ success: false, error: error.message || 'Request failed' }));
            
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

// ============================================================================
// DIRECT API CALL WITH INTELLIGENT RETRY LOGIC
// ============================================================================

async function callGeminiApiDirect(apiKey, payload) {
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
        // Don't retry on 429 - no rate limiter to handle this
        if (status === 429) {
            console.error('Gemini API: 429 error - no rate limiting available');
            return false;
        }
        // Retry on temporary service issues
        if (status === 503 || status === 500) return true;
        // UNAVAILABLE can also show via status 503
        if (errorJson?.error?.status === 'UNAVAILABLE') return true;
        return false;
    };

    // Exponential backoff with jitter helper
    const getBackoffDelay = (attempt) => {
        // Base delay increases exponentially: 1s, 2s, 4s, 8s, 16s
        const baseDelay = Math.min(16000, 1000 * Math.pow(2, attempt));
        // Add jitter (random 0-25% variation) to prevent thundering herd
        const jitter = baseDelay * 0.25 * Math.random();
        return baseDelay + jitter;
    };

    const maxAttempts = 3; // Standard retry count
    let attempt = 0;
    let lastError = 'Service temporarily unavailable. Please try again later.';
    let model = GEMINI_MODEL;

    while (attempt < maxAttempts) {
        try {
            console.log(`Gemini API: Using model ${model}, attempt ${attempt + 1}/${maxAttempts}`);
            const { response, text } = await attemptModel(model);
            
            if (!response.ok) {
                let errorMessage = `API request failed (Status: ${response.status}).`;
                let errorJson = null;
                
                try {
                    errorJson = JSON.parse(text);
                    if (errorJson?.error?.message) {
                        errorMessage = `API Error: ${errorJson.error.message}`;
                    }
                } catch (e) {
                    errorMessage += ` Details: ${text.substring(0, 150)}...`;
                }
                
                console.error(`Gemini API Error (${response.status}):`, text);

                // Special handling for 429 or resource exhausted errors
                const isResourceExhausted = errorJson?.error?.status === 'RESOURCE_EXHAUSTED' || /Resource exhausted/i.test(errorMessage);
                if (response.status === 429 || isResourceExhausted) {
                    let friendlyMessage = '⏱️ Gemini rate limit reached. Please wait a bit before trying again.';
                    if (isResourceExhausted) {
                        friendlyMessage = '🚫 Gemini quota exceeded. Please wait before trying again.';
                    }
                    return {
                        success: false,
                        error: friendlyMessage,
                        rateLimited: true,
                        retryAfter: 60000 // Default 60 second wait
                    };
                }

                if (shouldRetry(response.status, errorJson)) {
                    attempt++;
                    
                    // Try fallback model on last attempt
                    if (attempt === maxAttempts - 1 && model !== GEMINI_FALLBACK_MODEL) {
                        console.log('Gemini API: Switching to fallback model');
                        model = GEMINI_FALLBACK_MODEL;
                    }
                    
                    const delay = getBackoffDelay(attempt);
                    console.log(`Gemini API: Retrying in ${Math.round(delay / 1000)}s...`);
                    await new Promise(r => setTimeout(r, delay));
                    lastError = errorMessage;
                    continue;
                }
                
                return { success: false, error: errorMessage };
            }
            
            // Success
            console.log('Gemini API: Request successful');
            return { success: true, data: JSON.parse(text) };
            
        } catch (err) {
            console.error('Gemini API: Network error:', err);
            lastError = `Network error: ${err.message}`;
            attempt++;
            
            if (attempt < maxAttempts) {
                const delay = getBackoffDelay(attempt);
                console.log(`Gemini API: Retrying after network error in ${Math.round(delay / 1000)}s...`);
                await new Promise(r => setTimeout(r, delay));
            }
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
        const response = await callGeminiApiDirect(cleanKey, testPayload);
        
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