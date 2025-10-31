(function() {
  const Validation = {
    async validateApiKey(apiKey) {
      if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
        return { success: false, error: 'API key is required' };
      }
      
      // Clean the API key (remove whitespace, newlines, etc.)
      const cleanedKey = apiKey.trim().replace(/\s+/g, '');
      
      // Basic format validation for Gemini API keys
      // Gemini API keys typically start with "AIza" and are 39 characters long
      if (!cleanedKey.startsWith('AIza')) {
        return { 
          success: false, 
          error: 'Invalid API key format. Gemini API keys should start with "AIza"' 
        };
      }
      
      if (cleanedKey.length < 30) {
        return { 
          success: false, 
          error: 'API key appears too short. Please check and try again.' 
        };
      }
      
      try {
        const response = await chrome.runtime.sendMessage({
          action: 'validateApiKey',
          apiKey: cleanedKey
        });
        
        return response;
      } catch (error) {
        console.error('Validation request failed:', error);
        return { success: false, error: 'Failed to validate API key. Please try again.' };
      }
    },
    
    async handleTestApiKey(button, inputElement) {
      const apiKey = inputElement.value.trim();
      const originalText = button.textContent;
      
      if (!apiKey) {
        button.textContent = 'Enter Key';
        button.style.backgroundColor = '#f59e0b';
        setTimeout(() => {
          button.textContent = originalText;
          button.style.backgroundColor = '';
        }, 2000);
        return;
      }
      
      // Disable button and show loading
      button.disabled = true;
      button.textContent = 'Testing...';
      
      try {
        const result = await this.validateApiKey(apiKey);
        
        if (result.success) {
          button.textContent = '✓ Valid';
          button.style.backgroundColor = '#10b981';
          setTimeout(() => {
            button.textContent = originalText;
            button.style.backgroundColor = '';
            button.disabled = false;
          }, 2000);
        } else {
          button.textContent = '✗ Invalid';
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
        console.error('An error occurred while validating the API key:', error);
        setTimeout(() => {
          button.textContent = originalText;
          button.style.backgroundColor = '';
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
})();
