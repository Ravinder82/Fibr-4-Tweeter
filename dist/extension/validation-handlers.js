(function() {
  // Add event listeners for API key validation after popup loads
  function initializeValidationHandlers() {
    // Test API key button in onboarding
    const testApiKeyBtn = document.getElementById('test-api-key');
    const onboardingApiKeyInput = document.getElementById('onboarding-api-key');
    
    if (testApiKeyBtn && onboardingApiKeyInput && window.TabTalkValidation) {
      // Remove any existing event listeners by cloning the element
      const newTestBtn = testApiKeyBtn.cloneNode(true);
      testApiKeyBtn.parentNode.replaceChild(newTestBtn, testApiKeyBtn);
      
      newTestBtn.addEventListener('click', async function() {
        await window.TabTalkValidation.handleTestApiKey(newTestBtn, onboardingApiKeyInput);
        
        // Enable continue button if validation was successful
        const continueBtn = document.getElementById('api-setup-continue');
        if (continueBtn && newTestBtn.textContent === '✓ Valid') {
          continueBtn.disabled = false;
        }
      });
    }
    
    // Save API key button in settings
    const settingsSaveBtn = document.getElementById('settings-save-button');
    const settingsApiKeyInput = document.getElementById('api-key-input');
    
    if (settingsSaveBtn && settingsApiKeyInput && window.TabTalkValidation) {
      // Remove any existing event listeners by cloning the element
      const newSaveBtn = settingsSaveBtn.cloneNode(true);
      settingsSaveBtn.parentNode.replaceChild(newSaveBtn, settingsSaveBtn);
      
      newSaveBtn.addEventListener('click', async function(event) {
        // Prevent any other handlers from running
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        
        await window.TabTalkValidation.handleSaveApiKey(
          newSaveBtn, 
          settingsApiKeyInput,
          function() {
            // Success callback - navigate back to chat
            if (window.TabTalkNavigation && window.TabTalkNavigation.showView) {
              window.TabTalkNavigation.showView('chat');
            }
            // No alert needed here - the button already shows "✓ Saved"
          }
        );
      });
    }
    
    // Enable continue button when API key input has content
    if (onboardingApiKeyInput) {
      onboardingApiKeyInput.addEventListener('input', function() {
        const continueBtn = document.getElementById('api-setup-continue');
        if (continueBtn) {
          continueBtn.disabled = !this.value.trim();
        }
      });
    }
  }
  
  // Initialize validation handlers when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeValidationHandlers);
  } else {
    initializeValidationHandlers();
  }
  
  // Also try to initialize after a short delay in case the popup loads asynchronously
  setTimeout(initializeValidationHandlers, 100);
})();
