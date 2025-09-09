// src/shared/core/api.js
// Unified API client for both extension and web app

export class GeminiAPIClient {
  constructor(apiKey, environment = 'extension') {
    this.apiKey = apiKey;
    this.environment = environment;
    this.baseURL = 'https://generativelanguage.googleapis.com/v1beta/models/';
    this.model = 'gemini-2.0-flash';
  }

  async generateContent(prompt, options = {}) {
    // Create a conversation with the system prompt and user prompt
    const conversation = [
      { 
        role: 'user', 
        parts: [{ text: prompt }]
      }
    ];
    
    return this.callAPI({ contents: conversation });
  }

  async callAPI(payload) {
    if (this.environment === 'extension') {
      return this.callViaBackground(payload);
    }
    return this.callDirect(payload);
  }

  async callViaBackground(payload) {
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'callGeminiAPI',
        payload: payload,
        apiKey: this.apiKey
      });

      if (response.success && response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return response.data.candidates[0].content.parts[0].text;
      } else {
        throw new Error(response.error || 'The AI gave an empty or invalid response.');
      }
    } catch (error) {
      throw new Error(`API Error: ${error.message}`);
    }
  }

  async callDirect(payload) {
    const fullUrl = `${this.baseURL}${this.model}:generateContent?key=${this.apiKey}`;
    try {
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
        throw new Error(errorMessage);
      }
      
      const data = JSON.parse(responseText);
      if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('The AI gave an empty or invalid response.');
      }
    } catch (error) {
      throw new Error(`Network Error: ${error.message}`);
    }
  }
}