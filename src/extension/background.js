// background.js - FINAL VERSION with KEY TRACING

const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'callGeminiAPI') {
        const { apiKey, payload } = request;

        // --- KEY TRACING LOG 4 ---
        console.log("Background: Received this key from popup:", apiKey);

        if (!apiKey) {
            sendResponse({ success: false, error: 'API Key was missing in the message to the background script.' });
            return true;
        }

        (async () => {
            const response = await callGeminiApi(apiKey, payload);
            sendResponse(response);
        })();
            
        return true;
    } else if (request.action === 'validateApiKey') {
        const { apiKey } = request;
        
        console.log("Background: Validating API key:", apiKey ? "Key provided" : "No key");
        
        if (!apiKey) {
            sendResponse({ success: false, error: 'No API key provided' });
            return true;
        }
        
        (async () => {
            const response = await validateApiKey(apiKey);
            sendResponse(response);
        })();
        
        return true;
    }
});

async function callGeminiApi(apiKey, payload) {
    const fullUrl = `${GEMINI_API_BASE_URL}${GEMINI_MODEL}:generateContent?key=${apiKey}`;
    try {
        console.log(`TabTalk AI (background): Using model: ${GEMINI_MODEL}`);
        
        const response = await fetch(fullUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const responseText = await response.text();
        if (!response.ok) {
            let errorMessage = `API request failed (Status: ${response.status}).`;
            try {
                const errorJson = JSON.parse(responseText);
                if (errorJson?.error?.message) errorMessage = `API Error: ${errorJson.error.message}`;
            } catch (e) {
                errorMessage += ` Details: ${responseText.substring(0, 150)}...`;
            }
            console.error(`TabTalk AI (background): API Error Details: ${responseText}`);
            return { success: false, error: errorMessage };
        }
        return { success: true, data: JSON.parse(responseText) };
    } catch (error) {
        return { success: false, error: `A network error occurred: ${error.message}` };
    }
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