(function() {
  const UI = {
    ensureMarked: function() {
      // Marked.js is now loaded statically in popup.html
      // This ensures Manifest V3 compliance (no dynamic script injection)
      if (!this.marked && window.marked) {
        this.marked = window.marked;
      }
      return this.marked ? true : false;
    },
    setAriaStatus: function(msg) {
      const ariaStatus = document.getElementById('aria-status');
      if (ariaStatus) ariaStatus.textContent = msg;
    },

    // Sanitize and normalize structured outputs for clean markdown and UX
    sanitizeStructuredOutput: function(type, text) {
      if (!text) return '';
      let t = String(text);
      // 1) Remove typical AI prefaces
      t = t.replace(/^(?:here\s*(?:is|are|\'s|'s)|below\s+is|certainly,|sure,|note:|here\'s a|here's a)[^\n:]*:\s*/i, '');
      t = t.replace(/^\s*(?:here\s*(?:is|are|\'s|'s)\s*(?:a|an)?\s*)/i, '');
      // 2) Convert inline star bullets to real lines
      t = t.replace(/\s*\*\s+(?=[^\n])/g, '\n- ');
      // 3) Normalize line-start bullets
      t = t.replace(/^[ \t]*[•*]\s+/gm, '- ');
      // 4) Collapse excessive blank lines
      t = t.replace(/\n{3,}/g, '\n\n');
      // 5) Deduplicate URLs
      t = t.replace(/\((https?:\/\/[^\s)]+)\)\s*\(\1\)/g, '($1)');
      t = t.replace(/(https?:\/\/[^\s)]+)\s*\(\1\)/g, '$1');
      // 6) Trim noisy leading/trailing quotes/backticks/spaces
      t = t.replace(/^[`\s]+/, '').replace(/[\s`]+$/, '');
      // 6b) Remove excessive markdown emphasis for cleaner copy
      if (type === 'keypoints' || type === 'summary') {
        t = t.replace(/\*\*([^*]+)\*\*/g, '$1');
        t = t.replace(/\*([^*]+)\*/g, '$1');
        t = t.replace(/_([^_]+)_/g, '$1');
      }
      // 7) For keypoints, ensure list lines really start with '- '
      if (type === 'keypoints' && !/^\s*-\s+/m.test(t)) {
        t = t.split(/\s*\*\s+|\n+/).filter(Boolean).map(s => s.replace(/^[-•*]\s+/, '').trim()).filter(Boolean).map(s => `- ${s}`).join('\n');
      }
      return t.trim();
    },

    // Clean up AI-generated post content by removing explanations and formatting
    cleanPostContent: function(post) {
      if (!post) return '';
      
      let content = String(post);
      
      // First, try to extract the best post if multiple options are provided
      const optionMatches = content.match(/\*\*Option\s+\d+[^*]*\*\*[\s\S]*?(?=\*\*Option|\*\*Explanation|\*\*Why|$)/gi);
      if (optionMatches && optionMatches.length > 0) {
        // Use the first option as it's usually the best one
        content = optionMatches[0];
      }
      
      // Remove comprehensive AI prefaces and explanations
      content = content.replace(/^(?:Okay, here's|Here's|This is|Below is)[^\n]*:\s*/i, '');
      content = content.replace(/^\*\*Option\s+\d+.*?\*\*[^\n]*\n/gi, '');
      content = content.replace(/^\*\*Explanation.*?\*\*[^\n]*\n/gi, '');
      content = content.replace(/^\*\*Why.*?\*\*[^\n]*\n/gi, '');
      content = content.replace(/Explanation of Choices & Strategies Used:[^\n]*\n/gi, '');
      content = content.replace(/Why these options should work:[^\n]*\n/gi, '');
      content = content.replace(/Choose the option.*?\.\n/gi, '');
      
      // Remove bullet point explanations and strategy sections
      content = content.replace(/^\s*\*\s*Hook.*?:.*$/gim, '');
      content = content.replace(/^\s*\*\s*Value Proposition.*?:.*$/gim, '');
      content = content.replace(/^\s*\*\s*Engagement.*?:.*$/gim, '');
      content = content.replace(/^\s*\*\s*Emojis.*?:.*$/gim, '');
      content = content.replace(/^\s*\*\s*Hashtags.*?:.*$/gim, '');
      content = content.replace(/^\s*\*\s*Thread.*?:.*$/gim, '');
      content = content.replace(/^\s*\*\s*Clarity.*?:.*$/gim, '');
      content = content.replace(/^\s*\*\s*Specificity.*?:.*$/gim, '');
      content = content.replace(/^\s*\*\s*Urgency.*?:.*$/gim, '');
      content = content.replace(/^\s*\*\s*Social Proof.*?:.*$/gim, '');
      content = content.replace(/^\s*\*\s*Reciprocity.*?:.*$/gim, '');
      
      // Remove all lines that start with "*   " followed by explanation words
      content = content.replace(/^\s*\*\s*(?:Hook|Value|Engagement|Emojis|Hashtags|Thread|Clarity|Specificity|Urgency|Social|Reciprocity).*$/gim, '');
      
      // Remove section headers and explanation paragraphs
      content = content.replace(/^\*\*.*?Choices.*?\*\*.*$/gim, '');
      content = content.replace(/^\*\*.*?Strategies.*?\*\*.*$/gim, '');
      content = content.replace(/^\*\*.*?should work.*?\*\*.*$/gim, '');
      content = content.replace(/^\*\*.*?Approach.*?\*\*.*$/gim, '');
      content = content.replace(/^\*\*.*?Edge.*?\*\*.*$/gim, '');
      content = content.replace(/^\*\*.*?FOMO.*?\*\*.*$/gim, '');
      
      // Remove markdown formatting for cleaner display
      content = content.replace(/\*\*([^*]+)\*\*/g, '$1');
      content = content.replace(/\*([^*]+)\*/g, '$1');
      
      // Clean up excessive line breaks and spacing
      content = content.replace(/\n{3,}/g, '\n\n');
      content = content.replace(/^[ \t]+|[ \t]+$/gm, '');
      
      // Remove any remaining explanation text patterns
      const lines = content.split('\n');
      const cleanedLines = lines.filter(line => {
        const trimmed = line.trim();
        return trimmed && 
               !trimmed.match(/^(Explanation|Why|Choose|Strategies|Choices|Options?|Hook|Value|Engagement|Emojis|Hashtags|Thread|Clarity|Specificity|Urgency|Social|Reciprocity)[:\s]/i) &&
               !trimmed.match(/^\*\*[^\*]*\*\*$/) &&
               !trimmed.match(/^\*\*.*?(Choices|Strategies|Approach|Edge|FOMO).*?\*\*$/) &&
               !trimmed.match(/^\s*\*\s*(?:The|Each|This|Use|Create|Referencing|Providing|Choose|Then|Good)/);
      });
      
      let result = cleanedLines.join('\n').trim();
      
      // If result is empty after cleaning, try to extract actual post content from the original
      if (!result || result.length < 20) {
        // Look for actual post patterns in the original content
        const postPatterns = [
          /STOP.*[\s\S]*?#[A-Za-z]+/i,
          /🤯.*[\s\S]*?#[A-Za-z]+/i,
          /\(1\/\d+\).*[\s\S]*?#[A-Za-z]+/i
        ];
        
        for (const pattern of postPatterns) {
          const match = content.match(pattern);
          if (match && match[0].length > 30) {
            result = match[0].trim();
            break;
          }
        }
      }
      
      return result || 'Unable to extract clean post content. Please try generating again.';
    },

    setLoading: function(isLoading, statusMessage = '...') {
      this.isLoading = isLoading;
      if (isLoading) {
        if (this.pageStatus) this.pageStatus.textContent = statusMessage;
        this.setAriaStatus(statusMessage);
      } else {
        if (this.pageStatus && !this.pageStatus.textContent.startsWith('✅')) {
          this.pageStatus.textContent = '✅ Done';
        }
        this.setAriaStatus('Ready');
      }
    },

    updateQuickActionsVisibility: function() {
      if (this.quickActions) {
        this.quickActions.classList.toggle('hidden', !this.pageContent);
      }
    },

    resetScreenForGeneration: function() {
      if (this.sidebar) {
        this.sidebar.classList.add('hidden');
        this.sidebar.style.display = 'none';
      }
      if (this.messagesContainer) {
        this.messagesContainer.innerHTML = '';
      }
      this.updateQuickActionsVisibility();
    },

    renderCard: function(title, bodyHtml, options = {}) {
      const container = document.createElement('div');
      container.className = 'twitter-content-container';
      const card = document.createElement('div');
      card.className = 'twitter-card analytics-card';
      card.dataset.contentType = options.contentType || 'content';
      card.dataset.contentId = options.contentId || Date.now().toString();
      
      // Get emoji for content type
      const emojiMap = {
        summary: '📝',
        keypoints: '🔑', 
        analysis: '📊',
        faq: '❓',
        factcheck: '✅',
        blog: '📰',
        proscons: '⚖️',
        timeline: '📅',
        quotes: '💬',
      };
      const contentType = options.contentType || 'content';
      const emoji = emojiMap[contentType] || '📄';
      
      const markdownAttr = options.markdown ? `data-markdown="${encodeURIComponent(options.markdown)}"` : '';
      card.innerHTML = `
        <div class="twitter-card-header">
          <span class="twitter-card-title">${title}</span>
          <div class="twitter-header-actions">
            <button class="twitter-action-btn copy-btn" title="Copy content" aria-label="Copy content">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2 2v1"></path>
              </svg>
            </button>
          </div>
        </div>
        <div class="twitter-card-content">
          <div class="structured-html content-text" ${markdownAttr}>${bodyHtml}</div>
        </div>
      `;
      
      // Add save button to analytics card header actions container
      if (window.FibrUI && window.FibrUI.addSaveButtonToCard) {
        const contentType = options.contentType || 'content';
        const contentData = {
          id: options.contentId || Date.now().toString(),
          content: options.markdown || bodyHtml,
          title: title
        };
        const actionsContainer = card.querySelector('.twitter-header-actions');
        if (actionsContainer) {
          window.FibrUI.addSaveButtonToCard(card, actionsContainer, contentType, contentData);
        }
      }
      
      // Copy button functionality for analytics cards
      const copyBtn = card.querySelector('.copy-btn');
      const originalCopyIcon = copyBtn.innerHTML;
      
      copyBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        try {
          const structured = card.querySelector('.structured-html');
          const md = structured?.getAttribute('data-markdown');
          let textToCopy = md ? decodeURIComponent(md) : (structured?.innerText || '');
          
          // Include image prompt if present
          const imagePrompt = card.dataset.imagePrompt ? decodeURIComponent(card.dataset.imagePrompt) : null;
          if (imagePrompt) {
            textToCopy += '\n\n---\n🖼️ Nano Banana Prompt (9:16):\n' + imagePrompt;
          }
          
          await navigator.clipboard.writeText(textToCopy);
          
          // Success state
          copyBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20,6 9,17 4,12"></polyline>
          </svg>`;
          copyBtn.classList.add('success');
          
          // Reset after 2 seconds
          setTimeout(() => {
            copyBtn.innerHTML = originalCopyIcon;
            copyBtn.classList.remove('success');
          }, 2000);
          
        } catch (err) {
          console.error('Copy failed:', err);
        }
      });
      container.appendChild(card);
      const target = options.container || this.messagesContainer || document.getElementById('messages-container');
      if (target) {
        target.appendChild(container);
        if (target === this.messagesContainer) {
          target.scrollTo({ top: target.scrollHeight, behavior: 'smooth' });
        }
      }
      return card;
    },

    // Structured content rendering removed - Twitter-only mode

    // Structured regenerate controls removed - Twitter-only mode

    // Structured regeneration removed - Twitter-only mode

    showProgressBar: function(message) {
      this.hideProgressBar();
      const progressContainer = document.createElement('div');
      progressContainer.className = 'progress-container';
      progressContainer.id = 'global-progress';
      progressContainer.innerHTML = `
        <div class="progress-message">${message}</div>
        <div class="progress-bar"><div class="progress-fill"></div></div>
      `;
      this.messagesContainer.appendChild(progressContainer);
      this.messagesContainer.scrollTo({ top: this.messagesContainer.scrollHeight, behavior: 'smooth' });
      setTimeout(() => {
        const fill = progressContainer.querySelector('.progress-fill');
        if (fill) fill.style.width = '100%';
      }, 100);
    },

    hideProgressBar: function() {
      const existing = document.getElementById('global-progress');
      if (existing) existing.remove();
    },
    
    // NEW: Add save button to content cards
    addSaveButtonToCard: function(cardElement, actionsContainer, category, contentData) {
      if (!cardElement || !category || !contentData) return;
      
      // Create save button with unified styling
      const saveBtn = document.createElement('button');
      
      // Check if this is a Twitter card (has twitter-header-actions container)
      const isTwitterCard = actionsContainer && actionsContainer.classList.contains('twitter-header-actions');
      
      if (isTwitterCard) {
        // Use unified Twitter action button styling
        saveBtn.className = 'twitter-action-btn save-btn';
        saveBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </svg>`;
      } else {
        // Use legacy styling for analytics cards
        saveBtn.className = 'save-btn';
        saveBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </svg>`;
      }
      
      saveBtn.setAttribute('aria-label', 'Save to history');
      saveBtn.setAttribute('data-category', category);
      saveBtn.setAttribute('data-content-id', contentData.id || Date.now().toString());
      saveBtn.title = 'Save to history';
      
      // Check if already saved
      if (window.FibrStorage) {
        // Normalize storage category: store threads under 'twitter' so Gallery shows them
        const initialTargetCategory = category === 'thread' ? 'twitter' : category;
        window.FibrStorage.isContentSaved(initialTargetCategory, contentData.id || Date.now().toString())
          .then(isSaved => {
            if (isSaved) {
              saveBtn.classList.add('saved');
              saveBtn.querySelector('svg').setAttribute('fill', 'currentColor');
            }
          });
      }
      
      // Add click handler
      saveBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const contentId = saveBtn.getAttribute('data-content-id');
        const category = saveBtn.getAttribute('data-category');
        const targetCategory = category === 'thread' ? 'twitter' : category;
        
        if (!window.FibrStorage) return;
        
        const isSaved = await window.FibrStorage.isContentSaved(targetCategory, contentId);
        
        if (isSaved) {
          // Remove from saved
          await window.FibrStorage.deleteSavedContent(targetCategory, contentId);
          saveBtn.classList.remove('saved');
          saveBtn.querySelector('svg').setAttribute('fill', 'none');
          this.showToast('Removed from saved content');
        } else {
          // Add to saved
          // Get content from card
          const content = contentData.content || cardElement.querySelector('.content-text')?.textContent || '';
          const metadata = {
            source: this.currentTab?.url || window.location.href,
            title: this.currentTab?.title || document.title
          };
          
          const savePayload = {
            id: contentId,
            content,
            metadata,
            // Normalize: mark type and platform for Gallery badges/filters
            type: contentData.type || (category === 'thread' ? 'thread' : 'post'),
            platform: contentData.platform || (category === 'thread' ? 'thread' : 'twitter'),
            ...contentData
          };
          
          await window.FibrStorage.saveContent(targetCategory, savePayload);
          
          saveBtn.classList.add('saved');
          saveBtn.querySelector('svg').setAttribute('fill', 'currentColor');
          this.showToast('Saved to history');
        }
      });
      
      // Add to actions container (or card if no container provided)
      const targetElement = actionsContainer || cardElement;
      targetElement.appendChild(saveBtn);
    },
    
    // Show toast notification
    showToast: function(message, duration = 2000) {
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.textContent = message;
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.classList.add('visible');
      }, 10);
      
      setTimeout(() => {
        toast.classList.remove('visible');
        setTimeout(() => toast.remove(), 300);
      }, duration);
    },
  };
  window.FibrUI = UI;
  window.TabTalkUI = UI;
})();