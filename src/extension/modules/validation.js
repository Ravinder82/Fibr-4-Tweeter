(function() {
  const Validation = {
    async validateApiKey(apiKey) {
      console.log("Validation: validateApiKey called");
      
      if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
        console.error("Validation: API key is empty or invalid type");
        return { success: false, error: 'API key is required' };
      }
      
      // ROBUST: Clean the API key thoroughly
      // Remove ALL whitespace, newlines, tabs, zero-width characters, etc.
      let cleanedKey = String(apiKey)
        .trim()
        .replace(/[\s\u200B-\u200D\uFEFF]/g, '') // Remove all whitespace and zero-width chars
        .replace(/[\r\n\t]/g, ''); // Remove line breaks and tabs
      
      console.log("Validation: Original length:", apiKey.length);
      console.log("Validation: Cleaned key length:", cleanedKey.length);
      console.log("Validation: First 10 chars:", cleanedKey.substring(0, 10));
      console.log("Validation: Last 4 chars:", cleanedKey.substring(cleanedKey.length - 4));
      
      // Basic length validation (Gemini keys are typically 39 characters)
      if (cleanedKey.length < 30) {
        console.error("Validation: Key too short:", cleanedKey.length);
        return { 
          success: false, 
          error: `API key appears too short (${cleanedKey.length} characters). Please check and try again.` 
        };
      }
      
      // LENIENT: Check if key starts with AIza (most common) or just validate via API call
      // Some keys might have different prefixes, so we'll warn but still try
      if (!cleanedKey.startsWith('AIza')) {
        console.warn("Validation: Key doesn't start with AIza, but will try validation anyway");
        console.warn("Validation: Key starts with:", cleanedKey.substring(0, 4));
      }
      
      try {
        console.log("Validation: Sending validation request to background...");
        const response = await chrome.runtime.sendMessage({
          action: 'validateApiKey',
          apiKey: cleanedKey
        });
        
        console.log("Validation: Response from background:", response);
        
        if (!response) {
          console.error("Validation: No response from background script");
          return { success: false, error: 'No response from validation service. Please try again.' };
        }
        
        return response;
      } catch (error) {
        console.error('Validation: Request failed with exception:', error);
        return { success: false, error: 'Failed to validate API key. Please try again.' };
      }
    },
    
    async handleTestApiKey(button, inputElement) {
      const apiKey = inputElement.value.trim();
      const originalText = button.textContent;
      
      console.log("Validation: Test button clicked, key length:", apiKey.length);
      
      if (!apiKey) {
        button.textContent = 'Enter Key';
        button.style.backgroundColor = '#f59e0b';
        button.style.color = 'white';
        setTimeout(() => {
          button.textContent = originalText;
          button.style.backgroundColor = '';
          button.style.color = '';
        }, 2000);
        return;
      }
      
      // Disable button and show loading
      button.disabled = true;
      button.textContent = 'Testing...';
      button.style.color = 'white';
      
      try {
        console.log("Validation: Starting validation...");
        const result = await this.validateApiKey(apiKey);
        console.log("Validation: Result received:", result);
        
        if (result.success) {
          button.textContent = '✓ Valid';
          button.style.backgroundColor = '#10b981';
          button.style.color = 'white';
          console.log("Validation: ✓ API key is valid!");
          
          // Enable the continue button
          const continueBtn = document.getElementById('api-setup-continue');
          if (continueBtn) {
            continueBtn.disabled = false;
          }
          
          setTimeout(() => {
            button.textContent = originalText;
            button.style.backgroundColor = '';
            button.style.color = '';
            button.disabled = false;
          }, 2000);
        } else {
          button.textContent = '✗ Invalid';
          button.style.backgroundColor = '#ef4444';
          button.style.color = 'white';
          console.error(`Validation: ✗ API Key validation failed: ${result.error}`);
          
          // Show error message to user
          const errorMsg = result.error || 'Invalid API key';
          console.error('Validation error details:', errorMsg);
          
          setTimeout(() => {
            button.textContent = originalText;
            button.style.backgroundColor = '';
            button.style.color = '';
            button.disabled = false;
          }, 3000);
        }
      } catch (error) {
        button.textContent = 'Error';
        button.style.backgroundColor = '#ef4444';
        button.style.color = 'white';
        console.error('Validation: Exception occurred:', error);
        setTimeout(() => {
          button.textContent = originalText;
          button.style.backgroundColor = '';
          button.style.color = '';
          button.disabled = false;
        }, 3000);
      }
    },
    
    async handleSaveApiKey(button, inputElement, successCallback) {
      const apiKey = inputElement.value.trim();
      
      if (!apiKey) {
        button.textContent = 'Enter Key';
        button.style.backgroundColor = '#f59e0b';
        const originalText = button.textContent;
        setTimeout(() => {
          button.textContent = 'Save';
          button.style.backgroundColor = '';
        }, 2000);
        return;
      }
      
      // Disable button and show loading
      button.disabled = true;
      const originalText = button.textContent;
      button.textContent = 'Validating...';
      
      try {
        const result = await this.validateApiKey(apiKey);
        
        if (result.success) {
          // Save the API key
          await this.saveApiKey(apiKey);
          button.textContent = '✓ Saved';
          button.style.backgroundColor = '#10b981';
          
          if (successCallback) {
            successCallback();
          }
          
          setTimeout(() => {
            button.textContent = originalText;
            button.style.backgroundColor = '';
            button.disabled = false;
          }, 2000);
        } else {
          button.textContent = '✗ Failed';
          button.style.backgroundColor = '#ef4444';
          console.error(`API Key validation failed: ${result.error}`);
          setTimeout(() => {
            button.textContent = originalText;
            button.style.backgroundColor = '';
            button.disabled = false;
          }, 3000);
        }
      } catch (error) {
        button.textContent = 'Error';
        button.style.backgroundColor = '#ef4444';
        console.error('An error occurred while saving the API key:', error);
        setTimeout(() => {
          button.textContent = originalText;
          button.style.backgroundColor = '';
          button.disabled = false;
        }, 3000);
      }
    },
    
    async saveApiKey(apiKey) {
      // Clean the API key before saving
      const cleanedKey = apiKey.trim().replace(/\s+/g, '');
      
      // Use the existing storage functionality
      if (window.TabTalkStorage && window.TabTalkStorage.saveApiKey) {
        await window.TabTalkStorage.saveApiKey(cleanedKey);
      } else {
        // Fallback to direct storage
        await chrome.storage.local.set({ 
          geminiApiKey: cleanedKey, 
          apiKey: cleanedKey, 
          hasSeenWelcome: true 
        });
      }
    }
  };
  
  window.TabTalkValidation = Validation;
  window.FibrValidation = Validation; // Fibr alias
})();
