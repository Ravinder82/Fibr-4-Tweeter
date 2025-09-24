(function() {
  const UniversalCards = {
    
    /**
     * Creates a universal card that works for all content types
     * @param {string} content - The main content to display
     * @param {Object} options - Configuration options
     * @param {string} options.type - Card type: 'twitter', 'thread', 'summary', 'analysis', etc.
     * @param {string} options.title - Card title/header text
     * @param {string} options.emoji - Emoji for the card header
     * @param {boolean} options.editable - Whether content should be editable (default: true for twitter)
     * @param {boolean} options.showCharCount - Whether to show character count (default: true for twitter)
     * @param {boolean} options.showLengthControl - Whether to show length control slider (default: true for twitter)
     * @param {boolean} options.markdown - Whether to render content as markdown (default: true for analytics)
     * @param {Object} options.originalData - Original data for regeneration
     * @returns {HTMLElement} The created card element
     */
    createUniversalCard: function(content, options = {}) {
      const {
        type = 'generic',
        title = 'Content',
        emoji = '📄',
        editable = type === 'twitter' || type === 'thread',
        showCharCount = type === 'twitter' || type === 'thread',
        showLengthControl = type === 'twitter' || type === 'thread',
        markdown = type !== 'twitter' && type !== 'thread',
        maxCharLimit = type === 'twitter' ? 280 : type === 'thread' ? 4000 : 1200,
        originalData = null
      } = options;

      // Create main card container
      const card = document.createElement('div');
      card.className = 'universal-card';
      card.dataset.cardType = type;
      
      // Store original data for regeneration
      if (originalData) {
        card.dataset.originalContent = JSON.stringify(originalData);
      }

      // Create card header with title and action buttons
      const header = document.createElement('div');
      header.className = 'universal-card-header';
      
      const titleElement = document.createElement('span');
      titleElement.className = 'universal-card-title';
      titleElement.innerHTML = `${emoji} ${title}`;
      
      // Create action buttons container (capsule style)
      const actionsContainer = document.createElement('div');
      actionsContainer.className = 'actions-container';
      
      // Copy button
      const copyBtn = document.createElement('button');
      copyBtn.className = 'copy-button';
      copyBtn.title = 'Copy content';
      copyBtn.textContent = '📋';
      
      actionsContainer.appendChild(copyBtn);
      header.appendChild(titleElement);
      header.appendChild(actionsContainer);

      // Create card content area
      const contentArea = document.createElement('div');
      contentArea.className = 'universal-card-content';

      let contentElement;
      
      if (editable) {
        // For Twitter cards - editable textarea
        contentElement = document.createElement('textarea');
        contentElement.className = 'universal-text-area';
        contentElement.placeholder = `Edit your ${type} content...`;
        contentElement.value = content;
        
        // Auto-resize functionality
        const autoResize = () => {
          contentElement.style.height = 'auto';
          contentElement.style.height = Math.max(80, contentElement.scrollHeight) + 'px';
        };
        setTimeout(autoResize, 0);
        contentElement.addEventListener('input', autoResize);
        
      } else {
        // For Analytics cards - display content
        contentElement = document.createElement('div');
        contentElement.className = 'universal-content-display';
        
        if (markdown && window.marked) {
          contentElement.innerHTML = window.marked.parse(content);
        } else {
          contentElement.textContent = content;
        }
      }

      contentArea.appendChild(contentElement);

      // Create controls area for Twitter-specific features
      if (showCharCount || showLengthControl) {
        const controlsArea = document.createElement('div');
        controlsArea.className = 'universal-controls';

        if (showLengthControl) {
          const lengthControl = document.createElement('div');
          lengthControl.className = 'length-control';
          
          const lengthLabel = document.createElement('label');
          lengthLabel.className = 'length-label';
          lengthLabel.textContent = 'Target Length:';
          
          const lengthSlider = document.createElement('input');
          lengthSlider.type = 'range';
          lengthSlider.className = 'length-slider';
          const sliderMin = type === 'twitter' ? 40 : type === 'thread' ? 200 : 100;
          const sliderMax = Math.max(sliderMin, maxCharLimit);
          lengthSlider.min = String(sliderMin);
          lengthSlider.max = String(sliderMax);
          lengthSlider.step = '10';
          const initialLength = Math.min(maxCharLimit, Math.max(sliderMin, this.getAccurateCharacterCount(content, type)));
          lengthSlider.value = String(initialLength);
          
          const lengthDisplay = document.createElement('span');
          lengthDisplay.className = 'length-display';
          lengthDisplay.textContent = lengthSlider.value;
          
          const regenerateBtn = document.createElement('button');
          regenerateBtn.className = 'regenerate-btn';
          regenerateBtn.title = 'Regenerate with new length';
          regenerateBtn.textContent = '🔄';
          
          lengthControl.appendChild(lengthLabel);
          lengthControl.appendChild(lengthSlider);
          lengthControl.appendChild(lengthDisplay);
          lengthControl.appendChild(regenerateBtn);
          controlsArea.appendChild(lengthControl);

          // Length slider event listener
          lengthSlider.addEventListener('input', () => {
            lengthDisplay.textContent = lengthSlider.value;
            const target = parseInt(lengthSlider.value, 10);
            this.updateProgressMetrics(card, target, type, maxCharLimit);
          });

          // Regenerate button event listener
          regenerateBtn.addEventListener('click', async () => {
            const targetLength = parseInt(lengthSlider.value);
            await this.handleRegenerate(card, targetLength, type, originalData, maxCharLimit);
          });
        }

        if (showCharCount) {
          const charCount = document.createElement('div');
          charCount.className = 'char-count';
          charCount.textContent = `${this.getAccurateCharacterCount(content, type)} characters`;
          controlsArea.appendChild(charCount);

          const progressWrapper = document.createElement('div');
          progressWrapper.className = 'char-progress-bar';
          const progressFill = document.createElement('div');
          progressFill.className = 'char-progress-fill';
          progressWrapper.appendChild(progressFill);
          controlsArea.appendChild(progressWrapper);

          // Update character count on input
          if (editable && contentElement) {
            contentElement.addEventListener('input', () => {
              const length = this.getAccurateCharacterCount(contentElement.value, type);
              charCount.textContent = `${length} characters`;
              this.updateProgressMetrics(card, length, type, maxCharLimit);
            });
          }
        }

        contentArea.appendChild(controlsArea);
        this.updateProgressMetrics(card, this.getAccurateCharacterCount(content, type), type, maxCharLimit);
      }

      // Assemble the card
      card.appendChild(header);
      card.appendChild(contentArea);

      // Add copy functionality
      copyBtn.addEventListener('click', () => {
        const textToCopy = editable ? contentElement.value : contentElement.textContent;
        navigator.clipboard.writeText(textToCopy).then(() => {
          copyBtn.textContent = '✅';
          copyBtn.title = 'Copied!';
          setTimeout(() => {
            copyBtn.textContent = '📋';
            copyBtn.title = 'Copy content';
          }, 2000);
        }).catch(err => {
          console.error('Failed to copy content:', err);
        });
      });

      // Add save button functionality if TabTalkUI is available
      if (window.TabTalkUI && window.TabTalkUI.addSaveButtonToCard) {
        const contentData = {
          id: Date.now().toString(),
          content: content,
          title: title,
          type: type
        };
        window.TabTalkUI.addSaveButtonToCard(actionsContainer, type, contentData);
      }

      return card;
    },

    /**
     * Accurate character counting that handles Unicode properly
     */
    getAccurateCharacterCount: function(text, type = 'generic') {
      if (typeof window.calculatePlatformCharacterCount === 'function') {
        const platform = type === 'thread' ? 'twitter' : type;
        return window.calculatePlatformCharacterCount(text, platform);
      }
      return (text || '').length;
    },

    updateProgressMetrics: function(card, currentLength, type, maxCharLimit = 280) {
      if (!card) return;
      const charCount = card.querySelector('.char-count');
      const progressFill = card.querySelector('.char-progress-fill');
      const lengthSlider = card.querySelector('.length-slider');
      const platformLimit = type === 'thread' ? maxCharLimit : Math.min(maxCharLimit, type === 'twitter' ? 280 : maxCharLimit);
      const target = lengthSlider ? parseInt(lengthSlider.value, 10) : platformLimit;
      const effectiveMax = type === 'twitter' ? 280 : type === 'thread' ? maxCharLimit : platformLimit;

      const percentage = Math.max(0, Math.min(100, (currentLength / effectiveMax) * 100));
      if (progressFill) {
        progressFill.style.width = `${percentage}%`;
        if (percentage < 70) {
          progressFill.dataset.zone = 'safe';
        } else if (percentage < 90) {
          progressFill.dataset.zone = 'warning';
        } else {
          progressFill.dataset.zone = 'danger';
        }
      }

      if (charCount) {
        charCount.textContent = `${currentLength} / ${effectiveMax} characters`;
        charCount.dataset.zone = percentage >= 100 ? 'danger' : percentage >= 90 ? 'warning' : 'safe';
      }

      if (lengthSlider) {
        const targetPercentage = Math.max(0, Math.min(100, (target / effectiveMax) * 100));
        lengthSlider.dataset.targetPercent = String(targetPercentage);
      }
    },

    /**
     * Handle regeneration for Twitter content
     */
    handleRegenerate: async function(card, targetLength, type, originalData, maxCharLimit = 280) {
      if (!window.TabTalkAI || !originalData) {
        console.warn('Cannot regenerate: missing TabTalkAI instance or original data');
        return;
      }

      try {
        // Show loading state
        const regenerateBtn = card.querySelector('.regenerate-btn');
        const originalText = regenerateBtn.textContent;
        regenerateBtn.textContent = '⏳';
        regenerateBtn.disabled = true;

        // Call the appropriate regeneration method
        if (type === 'twitter' || type === 'thread') {
          await window.TabTalkAI.regenerateWithLength(card, targetLength, type, maxCharLimit);
        } else if (window.TabTalkAI?.regenerateAnalyticsWithLength) {
          await window.TabTalkAI.regenerateAnalyticsWithLength(card, targetLength, type, maxCharLimit);
        }

        // Restore button state
        regenerateBtn.textContent = originalText;
        regenerateBtn.disabled = false;

      } catch (error) {
        console.error('Regeneration failed:', error);
        
        // Restore button state on error
        const regenerateBtn = card.querySelector('.regenerate-btn');
        regenerateBtn.textContent = '🔄';
        regenerateBtn.disabled = false;
      }
    },

    /**
     * Create a Twitter-specific card using the universal system
     */
    createTwitterCard: function(content, title, isThread = false) {
      return this.createUniversalCard(content, {
        type: isThread ? 'thread' : 'twitter',
        title: title,
        emoji: isThread ? '🧵' : '🐦',
        editable: true,
        showCharCount: true,
        showLengthControl: true,
        markdown: false,
        maxCharLimit: isThread ? 4000 : 280,
        originalData: {
          content: window.TabTalkAI?.pageContent || content,
          platform: isThread ? 'thread' : 'twitter'
        }
      });
    },

    /**
     * Create an Analytics-specific card using the universal system
     */
    createAnalyticsCard: function(content, type, title) {
      const emojiMap = {
        summary: '📝',
        keypoints: '🔑', 
        analysis: '📊',
        faq: '❓',
        factcheck: '✅',
        blog: '📰',
        proscons: '⚖️',
        timeline: '📅',
        quotes: '💬'
      };

      const analyticsLimitMap = {
        summary: 400,
        keypoints: 600,
        analysis: 1200,
        faq: 1200,
        factcheck: 1500,
        blog: 1800,
        proscons: 800,
        timeline: 1000,
        quotes: 600
      };

      return this.createUniversalCard(content, {
        type: type,
        title: title || type.charAt(0).toUpperCase() + type.slice(1),
        emoji: emojiMap[type] || '📄',
        editable: false,
        showCharCount: true,
        showLengthControl: true,
        markdown: true,
        maxCharLimit: analyticsLimitMap[type] || 1200,
        originalData: {
          content: window.TabTalkAI?.pageContent || content,
          type: type
        }
      });
    }
  };

  // Export to global scope
  window.UniversalCards = UniversalCards;
})();
