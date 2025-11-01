// background.js - RATE LIMITED VERSION with Request Queue

const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_FALLBACK_MODEL = 'gemini-1.5-flash';
const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/';

// ============================================================================
// RATE LIMITING & REQUEST QUEUE SYSTEM
// ============================================================================

class RateLimiter {
    constructor() {
        // Gemini API Free Tier Limits: 15 RPM (requests per minute), 1,500 RPD (requests per day)
        this.requestsPerMinute = 15;
        this.requestsPerDay = 1500;
        this.requestTimestamps = [];
        this.dailyRequestCount = 0;
        this.dailyResetTime = this.getNextDayResetTime();
        this.queue = [];
        this.processing = false;
        this.minRequestInterval = 4000; // Minimum 4 seconds between requests for safety
        this.lastRequestTime = 0;
    }

    getNextDayResetTime() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        return tomorrow.getTime();
    }

    cleanOldTimestamps() {
        const now = Date.now();
        const oneMinuteAgo = now - 60000;
        
        // Remove timestamps older than 1 minute
        this.requestTimestamps = this.requestTimestamps.filter(ts => ts > oneMinuteAgo);
        
        // Reset daily counter if needed
        if (now >= this.dailyResetTime) {
            this.dailyRequestCount = 0;
            this.dailyResetTime = this.getNextDayResetTime();
            console.log('Rate Limiter: Daily quota reset');
        }
    }

    canMakeRequest() {
        this.cleanOldTimestamps();
        
        // Check daily limit
        if (this.dailyRequestCount >= this.requestsPerDay) {
            console.warn('Rate Limiter: Daily quota exceeded');
            return false;
        }
        
        // Check per-minute limit
        if (this.requestTimestamps.length >= this.requestsPerMinute) {
            console.warn('Rate Limiter: Per-minute quota exceeded');
            return false;
        }
        
        // Check minimum interval between requests
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        if (timeSinceLastRequest < this.minRequestInterval) {
            console.log(`Rate Limiter: Too soon (${timeSinceLastRequest}ms < ${this.minRequestInterval}ms)`);
            return false;
        }
        
        return true;
    }

    recordRequest() {
        const now = Date.now();
        this.requestTimestamps.push(now);
        this.dailyRequestCount++;
        this.lastRequestTime = now;
        console.log(`Rate Limiter: Request recorded (${this.requestTimestamps.length}/${this.requestsPerMinute} per min, ${this.dailyRequestCount}/${this.requestsPerDay} per day)`);
    }

    getWaitTime() {
        this.cleanOldTimestamps();
        
        const now = Date.now();
        
        // Check if daily limit exceeded
        if (this.dailyRequestCount >= this.requestsPerDay) {
            const waitTime = this.dailyResetTime - now;
            console.log(`Rate Limiter: Daily limit reached, wait ${Math.ceil(waitTime / 1000 / 60)} minutes`);
            return waitTime;
        }
        
        // Check if per-minute limit exceeded
        if (this.requestTimestamps.length >= this.requestsPerMinute) {
            const oldestTimestamp = this.requestTimestamps[0];
            const waitTime = (oldestTimestamp + 60000) - now;
            console.log(`Rate Limiter: Per-minute limit reached, wait ${Math.ceil(waitTime / 1000)} seconds`);
            return Math.max(0, waitTime);
        }
        
        // Check minimum interval
        const timeSinceLastRequest = now - this.lastRequestTime;
        if (timeSinceLastRequest < this.minRequestInterval) {
            const waitTime = this.minRequestInterval - timeSinceLastRequest;
            console.log(`Rate Limiter: Minimum interval wait ${Math.ceil(waitTime / 1000)} seconds`);
            return waitTime;
        }
        
        return 0;
    }

    async enqueue(apiKey, payload) {
        return new Promise((resolve, reject) => {
            const request = {
                apiKey,
                payload,
                resolve,
                reject,
                timestamp: Date.now()
            };
            
            this.queue.push(request);
            console.log(`Rate Limiter: Request queued (queue size: ${this.queue.length})`);
            
            // Start processing if not already running
            if (!this.processing) {
                this.processQueue();
            }
        });
    }

    async processQueue() {
        if (this.processing) return;
        
        this.processing = true;
        console.log('Rate Limiter: Starting queue processing');
        
        while (this.queue.length > 0) {
            const waitTime = this.getWaitTime();
            
            if (waitTime > 0) {
                console.log(`Rate Limiter: Waiting ${Math.ceil(waitTime / 1000)} seconds before next request...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
            
            if (!this.canMakeRequest()) {
                // Should not happen after waiting, but safety check
                console.warn('Rate Limiter: Still cannot make request after waiting');
                await new Promise(resolve => setTimeout(resolve, 5000));
                continue;
            }
            
            const request = this.queue.shift();
            console.log(`Rate Limiter: Processing request (${this.queue.length} remaining in queue)`);
            
            try {
                this.recordRequest();
                const result = await callGeminiApiDirect(request.apiKey, request.payload);
                request.resolve(result);
            } catch (error) {
                request.reject(error);
            }
        }
        
        this.processing = false;
        console.log('Rate Limiter: Queue processing complete');
    }
}

// Global rate limiter instance
const rateLimiter = new RateLimiter();

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

        // Use rate limiter queue for all requests
        rateLimiter.enqueue(cleanedKey, payload)
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
        // Don't retry on 429 - rate limiter should prevent this
        if (status === 429) {
            console.error('Gemini API: 429 error despite rate limiting - increasing backoff');
            return false; // Let rate limiter handle this
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

    const maxAttempts = 3; // Reduced from 4 since rate limiter prevents most issues
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

                // Special handling for 429 errors
                if (response.status === 429) {
                    return {
                        success: false,
                        error: '⏱️ Rate limit reached. Your request has been queued and will be processed shortly.',
                        rateLimited: true
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