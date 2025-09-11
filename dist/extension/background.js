// background.js - FINAL VERSION with KEY TRACING

const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'callGeminiAPI') {
        handleGeminiAPICall(request, sendResponse);
        return true; // Will respond asynchronously
    } else if (request.action === 'testApiKey') {
        testApiKey(request.apiKey, sendResponse);
        return true; // Will respond asynchronously
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

function handleGeminiAPICall(request, sendResponse) {
    try {
        const apiKey = request.apiKey;
        const payload = request.payload || {};
        callGeminiApi(apiKey, payload)
            .then(sendResponse)
            .catch(err => sendResponse({ success: false, error: err?.message || String(err) }));
    } catch (error) {
        sendResponse({ success: false, error: error?.message || String(error) });
    }
}

async function testApiKey(apiKey, sendResponse) {
    try {
        const payload = {
            contents: [
                { role: 'user', parts: [{ text: 'ping' }] }
            ]
        };
        const result = await callGeminiApi(apiKey, payload);
        if (result && result.success) {
            sendResponse({ success: true });
        } else {
            sendResponse({ success: false, error: result?.error || 'Unknown error' });
        }
    } catch (error) {
        sendResponse({ success: false, error: error?.message || String(error) });
    }
}