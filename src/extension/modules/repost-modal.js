// Repost Modal: Reply/Repost tone selector and generator
(function() {
  const RepostModal = {
    selectedTone: null,
    appInstance: null,

    // Initialize repost modal
    init: function() {
      this.createModalEvents();
      this.populateReplyTones();
    },

    // Show modal with content loading (called from popup.js with app instance)
    showWithContentLoading: async function(appInstance) {
      this.appInstance = appInstance;
      
      // Load content if not already loaded (same as Post/Thread buttons)
      if (!appInstance.pageContent || !appInstance.apiKey) {
        if (appInstance.apiKey) {
          await appInstance.getAndCachePageContent();
        } else {
          this.showToast('❌ Please set up your Gemini API key first.', 3000);
          return;
        }
      }
      
      // Now show the modal
      this.showModal();
    },

    // Create modal event listeners
    createModalEvents: function() {
      // Modal close events
      const closeBtn = document.querySelector('.repost-modal-close');
      const overlay = document.querySelector('#repost-modal .tone-modal-overlay');
      const cancelBtn = document.getElementById('repost-cancel-btn');

      closeBtn?.addEventListener('click', () => this.hideModal());
      overlay?.addEventListener('click', () => this.hideModal());
      cancelBtn?.addEventListener('click', () => this.hideModal());

      // Generate button
      const generateBtn = document.getElementById('repost-generate-btn');
      generateBtn?.addEventListener('click', () => this.handleGenerate());

      // Keyboard navigation
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !document.getElementById('repost-modal').classList.contains('hidden')) {
          this.hideModal();
        }
      });
    },

    // Populate reply tones in the modal
    populateReplyTones: function() {
      const toneGrid = document.querySelector('#repost-modal .tone-grid');
      if (!toneGrid || !window.FibrToneSelector) return;

      // Get only reply category tones from the main tone selector, excluding "Fact Check" to avoid duplication
      const replyTones = Object.values(window.FibrToneSelector.toneDefinitions)
        .filter(tone => tone.category === 'reply' && tone.id !== 'fact-check');

      toneGrid.innerHTML = replyTones.map(tone => `
        <div class="tone-option repost-tone-option" 
             data-tone-id="${tone.id}" 
             data-category="${tone.category}"
             data-subcategory="${tone.subcategory}"
             role="radio"
             aria-checked="false"
             tabindex="0">
          <div class="tone-icon">${tone.icon}</div>
          <div class="tone-info">
            <div class="tone-name">${tone.name}</div>
            <div class="tone-description">${tone.description}</div>
          </div>
          <div class="tone-check">✓</div>
        </div>
      `).join('');

      // Add click handlers to tone options
      const toneOptions = toneGrid.querySelectorAll('.repost-tone-option');
      toneOptions.forEach(option => {
        option.addEventListener('click', () => this.selectTone(option));
        option.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.selectTone(option);
          }
        });
      });
    },

    // Show the repost modal
    showModal: function() {
      const modal = document.getElementById('repost-modal');
      if (!modal) return;

      modal.classList.remove('hidden');
      modal.removeAttribute('aria-hidden');
      modal.removeAttribute('inert');

      // Focus first tone option after a brief delay
      setTimeout(() => {
        const firstTone = modal.querySelector('.repost-tone-option');
        firstTone?.focus();
      }, 50);
    },

    // Hide the repost modal
    hideModal: function() {
      const modal = document.getElementById('repost-modal');
      if (!modal) return;

      modal.classList.add('hidden');
      modal.setAttribute('aria-hidden', 'true');
      modal.setAttribute('inert', '');

      // Reset selections
      this.resetSelections();
    },

    // Select a tone
    selectTone: function(option) {
      // Deselect all
      const allOptions = document.querySelectorAll('.repost-tone-option');
      allOptions.forEach(opt => {
        opt.classList.remove('selected');
        opt.setAttribute('aria-checked', 'false');
      });

      // Select clicked
      option.classList.add('selected');
      option.setAttribute('aria-checked', 'true');

      // Store selection
      const toneId = option.dataset.toneId;
      this.selectedTone = window.FibrToneSelector?.toneDefinitions[toneId];

      // Enable generate button
      const generateBtn = document.getElementById('repost-generate-btn');
      if (generateBtn) {
        generateBtn.disabled = false;
      }
    },

    // Reset selections
    resetSelections: function() {
      this.selectedTone = null;
      
      // Deselect all tone options
      const allOptions = document.querySelectorAll('.repost-tone-option');
      allOptions.forEach(opt => {
        opt.classList.remove('selected');
        opt.setAttribute('aria-checked', 'false');
      });

      // Disable generate button
      const generateBtn = document.getElementById('repost-generate-btn');
      if (generateBtn) {
        generateBtn.disabled = true;
      }

      // Reset image prompt checkbox
      const imageCheckbox = document.getElementById('repost-include-image-prompt');
      if (imageCheckbox) {
        imageCheckbox.checked = false;
      }
    },

    // Handle generate button click
    handleGenerate: async function() {
      const selectedTone = this.selectedTone;

      if (!selectedTone) {
        this.showToast('❌ Please select a tone first.', 2000);
        return;
      }

      if (!this.appInstance) {
        this.showToast('❌ App not initialized.', 3000);
        return;
      }

      const includeImagePrompt = document.getElementById('repost-include-image-prompt')?.checked || false;

      // Hide modal
      this.hideModal();

      const preservedTone = selectedTone;

      // Content is already cleared by resetScreenForGeneration() called before modal opened
      // No need for selective clearing here

      // Generate content using the Twitter module directly (same as tone selector)
      // The tone selector callback passes: (selectedTone, selectedPlatform, includeImagePrompt)
      // But generateSocialContentWithTone expects: (platform, selectedTone, includeImagePrompt)
      
      console.log('Repost: Generating with tone:', preservedTone);
      console.log('Repost: Include image prompt:', includeImagePrompt);
      
      if (window.FibrTwitter && window.FibrTwitter.generateSocialContentWithTone) {
        // Bind the Twitter module methods to the app instance context
        // Parameters: platform, selectedTone, includeImagePrompt
        await window.FibrTwitter.generateSocialContentWithTone.call(
          this.appInstance,
          'twitter',           // platform
          preservedTone,        // selectedTone object
          includeImagePrompt   // boolean
        );
      } else if (this.appInstance.generateSocialContentWithTone) {
        // Fallback to app instance method if available
        await this.appInstance.generateSocialContentWithTone(
          'twitter',
          preservedTone,
          includeImagePrompt
        );
      } else {
        this.showToast('❌ Content generation not available.', 3000);
        console.error('FibrTwitter module or generateSocialContentWithTone method not found');
        console.error('Available on appInstance:', Object.keys(this.appInstance));
      }
    },

    // Show toast message
    showToast: function(message, duration = 3000) {
      if (window.FibrUI?.showToast) {
        window.FibrUI.showToast(message, duration);
      } else {
        console.log('Toast:', message);
      }
    }
  };

  // Expose globally
  window.FibrRepostModal = RepostModal;

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => RepostModal.init());
  } else {
    RepostModal.init();
  }
})();
