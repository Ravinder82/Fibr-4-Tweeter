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
          lengthSlider.min = '50';
          lengthSlider.max = '2000';
          lengthSlider.step = '50';
          lengthSlider.value = Math.max(50, this.getAccurateCharacterCount(content));
          
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
          });

          // Regenerate button event listener
          regenerateBtn.addEventListener('click', async () => {
            const targetLength = parseInt(lengthSlider.value);
            await this.handleRegenerate(card, targetLength, type, originalData);
          });
        }

        if (showCharCount) {
          const charCount = document.createElement('div');
          charCount.className = 'char-count';
          charCount.textContent = `${this.getAccurateCharacterCount(content)} characters`;
          controlsArea.appendChild(charCount);

          // Update character count on input
          if (editable && contentElement) {
            contentElement.addEventListener('input', () => {
              const length = this.getAccurateCharacterCount(contentElement.value);
              charCount.textContent = `${length} characters`;
              charCount.style.color = 'var(--text-secondary)';
            });
          }
        }

        contentArea.appendChild(controlsArea);
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
    getAccurateCharacterCount: function(text) {
      if (!text) return 0;
      if (typeof Intl !== 'undefined' && Intl.Segmenter) {
        const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
        return Array.from(segmenter.segment(text)).length;
      }
      // Fallback for older browsers
      return Array.from(text).length;
    },

    /**
     * Handle regeneration for Twitter content
     */
    handleRegenerate: async function(card, targetLength, type, originalData) {
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
          await window.TabTalkAI.regenerateWithLength(card, targetLength, type);
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

      return this.createUniversalCard(content, {
        type: type,
        title: title || type.charAt(0).toUpperCase() + type.slice(1),
        emoji: emojiMap[type] || '📄',
        editable: false,
        showCharCount: false,
        showLengthControl: false,
        markdown: true,
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
