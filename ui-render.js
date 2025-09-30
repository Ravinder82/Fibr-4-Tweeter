(function() {
  const UI = {
    // Save button states
    saveButtonStates: {},
    maxUnsavedMessages: 2,

    generateMessageId: function() {
      const base = Date.now().toString(36);
      const suffix = Math.random().toString(36).slice(2, 8);
      return `msg_${base}_${suffix}`;
    },
    ensureMarked: function() {
      if (this.marked) return Promise.resolve(true);
      if (document.querySelector('script[data-loader="marked"]')) {
        return new Promise(resolve => {
          const check = () => { if (window.marked) { this.marked = window.marked; resolve(true); } else setTimeout(check, 50); };
          check();
        });
      }
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'marked.min.js';
        script.async = true;
        script.dataset.loader = 'marked';
        script.onload = () => { this.marked = window.marked; resolve(true); };
        script.onerror = () => { console.error('Failed to load marked.min.js'); resolve(false); };
        document.body.appendChild(script);
      });
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
      t = t.replace(/^(?:here\s*(?:is|are|\'s|’s)|below\s+is|certainly,|sure,|note:|here\'s a|here’s a)[^\n:]*:\s*/i, '');
      t = t.replace(/^\s*(?:here\s*(?:is|are|\'s|’s)\s*(?:a|an)?\s*)/i, '');
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

    addMessage: function(role, content, options = {}) {
      if (!Array.isArray(this.chatHistory)) {
        this.chatHistory = [];
      }

      const timestampOverride = options.timestamp;
      const timestamp = timestampOverride || new Date().toISOString();
      const messageIdOverride = options.id;
      const message = {
        id: messageIdOverride || this.generateMessageId(),
        role,
        content,
        timestamp,
        saved: Boolean(options.saved)
      };

      if (options.contentType) {
        message.contentType = options.contentType;
      }

      this.chatHistory.push(message);
      this.trimUnsavedMessages();
      this.renderMessages();
      if (typeof this.saveState === 'function') {
        this.saveState();
      }
    },

    trimUnsavedMessages: function(maxUnsaved = this.maxUnsavedMessages) {
      if (!Array.isArray(this.chatHistory)) return;
      const unsavedIndices = [];
      this.chatHistory.forEach((message, index) => {
        if (!message.saved) unsavedIndices.push(index);
      });
      if (unsavedIndices.length <= maxUnsaved) return;
      const keepIndices = new Set(unsavedIndices.slice(-maxUnsaved));
      this.chatHistory = this.chatHistory.filter((message, index) => message.saved || keepIndices.has(index));
    },

    renderMessages: function() {
      this.messagesContainer.innerHTML = '';
      if (!Array.isArray(this.chatHistory)) {
        this.chatHistory = [];
      }
      this.chatHistory.forEach((message, index) => {
        const messageEl = document.createElement('div');
        messageEl.classList.add('message', message.role === 'user' ? 'user-message' : 'assistant-message');
        if (message.saved) {
          messageEl.classList.add('saved-message');
        }
        const messageId = message.id || message.timestamp || `msg_${index}`;
        messageEl.dataset.messageId = messageId;
        if (message.contentType) {
          messageEl.classList.add(`${message.contentType}-message`);
        }
        const headerEl = document.createElement('div');
        headerEl.classList.add('message-header');
        const avatarEl = document.createElement('div');
        avatarEl.classList.add('avatar');
        if (message.role === 'user') {
          avatarEl.textContent = 'You';
        } else {
          const iconMap = { summary: '📝', keypoints: '🔑', analysis: '📊', faq: '❓', factcheck: '✅' };
          avatarEl.textContent = iconMap[message.contentType] || 'AI';
        }
        const timestampEl = document.createElement('div');
        timestampEl.classList.add('timestamp');
        timestampEl.textContent = new Date(message.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        headerEl.append(message.role === 'user' ? timestampEl : avatarEl, message.role === 'user' ? avatarEl : timestampEl);
        
        const contentEl = document.createElement('div');
        contentEl.classList.add('content');
        if (message.role === 'assistant') {
            if (this.marked) {
                contentEl.innerHTML = this.marked.parse(message.content);
            } else {
                contentEl.textContent = message.content;
                this.ensureMarked().then(ok => ok && this.renderMessages());
            }
        } else {
            contentEl.textContent = message.content;
        }

        const actionsEl = document.createElement('div');
        actionsEl.classList.add('message-header-actions');

        const saveToggle = document.createElement('button');
        saveToggle.classList.add('message-save-toggle');
        if (message.saved) {
          saveToggle.classList.add('saved');
        }
        saveToggle.type = 'button';
        saveToggle.setAttribute('aria-pressed', message.saved ? 'true' : 'false');
        saveToggle.setAttribute('aria-label', message.saved ? 'Remove saved message' : 'Save this message');
        saveToggle.title = message.saved ? 'Remove from saved' : 'Save message';
        saveToggle.textContent = message.saved ? '★' : '☆';
        saveToggle.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          this.toggleMessageSaved(messageId);
        });

        actionsEl.appendChild(saveToggle);
        headerEl.appendChild(actionsEl);
        messageEl.append(headerEl, contentEl);
        this.messagesContainer.appendChild(messageEl);
        setTimeout(() => messageEl.classList.add('visible'), index * 100);
      });
      const emptyState = document.getElementById('empty-state');
      if (emptyState) {
        emptyState.classList.toggle('hidden', this.chatHistory.length > 0);
      }
      this.messagesContainer.scrollTo({ top: this.messagesContainer.scrollHeight, behavior: 'smooth' });
      this.updateQuickActionsVisibility();
    },

    toggleMessageSaved: function(messageId) {
      if (!messageId || !Array.isArray(this.chatHistory)) return;
      const index = this.chatHistory.findIndex(msg => (msg.id || msg.timestamp) === messageId);
      if (index === -1) return;

      const message = this.chatHistory[index];
      const nextSaved = !message.saved;

      this.chatHistory[index] = {
        ...message,
        saved: nextSaved
      };

      if (nextSaved) {
        this.trimUnsavedMessages();
      } else {
        const maxUnsaved = this.maxUnsavedMessages;
        const unsavedIndices = [];
        this.chatHistory.forEach((msg, idx) => {
          if (!msg.saved) unsavedIndices.push(idx);
        });
        if (unsavedIndices.length > maxUnsaved) {
          const keep = new Set(unsavedIndices.slice(-maxUnsaved));
          this.chatHistory = this.chatHistory.filter((msg, idx) => msg.saved || keep.has(idx));
        }
      }
      this.renderMessages();
      if (typeof this.saveState === 'function') {
        this.saveState();
      }
    },

    setLoading: function(isLoading, statusMessage = '...') {
      this.isLoading = isLoading;
      this.sendButton.disabled = isLoading || this.messageInput.value.trim().length === 0;
      this.messageInput.disabled = isLoading;
      if (isLoading) {
        this.pageStatus.textContent = statusMessage;
        this.setAriaStatus(statusMessage);
      } else {
        if (!this.pageStatus.textContent.startsWith('✅')) {
          this.pageStatus.textContent = '✅ Done';
        }
        this.setAriaStatus('Ready');
      }
    },

    handleInputChange: function() {
      if (this.typingTimeout) clearTimeout(this.typingTimeout);
      this.messageInput.style.height = 'auto';
      const newHeight = Math.min(this.messageInput.scrollHeight, 150);
      this.messageInput.style.height = `${newHeight}px`;
      const isEmpty = this.messageInput.value.trim().length === 0;
      this.sendButton.disabled = isEmpty || this.isLoading;
      const currentLength = this.messageInput.value.length;
      if (this.charCount) {
        this.charCount.textContent = `${currentLength}/${this.maxCharCount}`;
        this.charCount.style.color = currentLength >= this.maxCharCount ? '#ef4444' : 'var(--text-secondary)';
      }
      if (currentLength > this.maxCharCount) {
        this.messageInput.value = this.messageInput.value.slice(0, this.maxCharCount);
      }
    },

    handleInputKeydown: function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!this.sendButton.disabled) this.sendMessage();
      } else if (e.key === 'Escape') {
        this.messageInput.blur();
        this.setAriaStatus('Input cleared');
        this.messageInput.value = '';
        this.handleInputChange();
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
      const emptyState = document.getElementById('empty-state');
      if (emptyState) emptyState.classList.add('hidden');
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
        quotes: '💬'
      };
      const contentType = options.contentType || 'content';
      const emoji = emojiMap[contentType] || '📄';
      
      const markdownAttr = options.markdown ? `data-markdown="${encodeURIComponent(options.markdown)}"` : '';
      card.innerHTML = `
        <div class="twitter-card-header">
          <span class="twitter-card-title">${emoji} ${title}</span>
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
      if (window.TabTalkUI && window.TabTalkUI.addSaveButtonToCard) {
        const contentType = options.contentType || 'content';
        const contentData = {
          id: options.contentId || Date.now().toString(),
          content: options.markdown || bodyHtml,
          title: title
        };
        const actionsContainer = card.querySelector('.twitter-header-actions');
        if (actionsContainer) {
          window.TabTalkUI.addSaveButtonToCard(actionsContainer, contentType, contentData);
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
          const textToCopy = md ? decodeURIComponent(md) : (structured?.innerText || '');
          
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
      const target = options.container || this.messagesContainer;
      target.appendChild(container);
      if (target === this.messagesContainer) {
        target.scrollTo({ top: target.scrollHeight, behavior: 'smooth' });
      }
      return card;
    },

    renderStructuredContent: function(contentType, rawContent) {
      // DISABLED: Universal cards system - using legacy system for stability
      const renderMarkdown = (text) => this.marked ? this.marked.parse(text) : (text || '').replace(/\n/g, '<br>');
      const cleaned = this.sanitizeStructuredOutput(contentType, rawContent);
      const contentId = Date.now().toString();

      switch (contentType) {
        case 'factcheck': {
          const parts = cleaned.split(/\n\n(?=(?:Claim\s*\d+|CLAIM\s*\d+|\d+[\.)]\s))/).filter(Boolean);
          if (parts.length > 1) {
            parts.forEach((p, idx) => {
              const title = `Fact Check — Claim ${idx + 1}`;
              const segment = p.trim();
              this.renderCard(title, renderMarkdown(segment), { 
                markdown: segment, 
                contentType: 'factcheck', 
                contentId: `${contentId}-${idx}`, 
              });
            });
          } else {
            this.renderCard('Fact Check', renderMarkdown(cleaned), { 
              markdown: cleaned, 
              contentType: 'factcheck', 
              contentId: contentId, 
            });
          }
          break;
        }
        case 'summary':
        case 'blog': {
          const titleMap = { summary: 'Summary', blog: 'Blog Post' };
          const card = this.renderCard(titleMap[contentType], renderMarkdown(cleaned), { 
            markdown: cleaned, 
            contentType: contentType,
            contentId: contentId, 
          });
          this.attachStructuredRegenerateControls(card, contentType);
          break;
        }
        default: {
          const titleMap = { keypoints: 'Key Points', analysis: 'Analysis Report', faq: 'FAQ' };
          const title = titleMap[contentType] || '✨ Generated Content';
          this.renderCard(title, renderMarkdown(cleaned), { 
            markdown: cleaned, 
            contentType: contentType,
            contentId: contentId, 
          });
        }
      }
    },

    attachStructuredRegenerateControls: function(card, contentType) {
      try {
        const contentEl = card.querySelector('.twitter-card-content');
        const controls = document.createElement('div');
        controls.className = 'twitter-controls';
        controls.innerHTML = `
          <div class="twitter-length-control">
            <label class="length-label">Target Length:</label>
            <input type="range" class="length-slider" min="100" max="1200" value="400" step="50">
            <span class="length-display">400</span>
            <button class="regenerate-btn" title="Regenerate with new length">🔄</button>
          </div>
        `;
        contentEl.appendChild(controls);
        const slider = controls.querySelector('.length-slider');
        const display = controls.querySelector('.length-display');
        const button = controls.querySelector('.regenerate-btn');
        slider.addEventListener('input', () => { display.textContent = slider.value; });
        button.addEventListener('click', () => this.regenerateStructuredWithLength(card, contentType, parseInt(slider.value, 10)));
      } catch (e) {
        console.warn('attachStructuredRegenerateControls failed:', e);
      }
    },

    regenerateStructuredWithLength: async function(card, contentType, targetLength) {
      const btn = card.querySelector('.regenerate-btn');
      if (btn) { btn.disabled = true; btn.textContent = '⏳'; }
      try {
        let systemPrompt = '';
        let userPrompt = '';
        if (contentType === 'blog') {
          systemPrompt = `You are an expert blog content creator. Rewrite the content as a well-structured blog post with H1/H2 headings and paragraphs. Match the requested length.`;
          userPrompt = `Create a blog post of approximately ${targetLength} words (±15%). Use markdown headings (H1/H2), short paragraphs, and a clear flow. Source content:\n\n${this.pageContent}`;
        } else if (contentType === 'summary') {
          systemPrompt = `You are an expert summarizer. Produce a concise, clear summary with strong structure.`;
          userPrompt = `Create a summary of approximately ${Math.max(100, Math.min(400, targetLength))} words. Use a short intro and 1-2 concise paragraphs. Source content:\n\n${this.pageContent}`;
        } else {
          return;
        }
        if (this.showProgressBar) this.showProgressBar('Regenerating...');
        const response = await this.callGeminiAPIWithSystemPrompt(systemPrompt, userPrompt);
        if (response) {
          const structured = card.querySelector('.structured-html');
          if (structured) {
            structured.innerHTML = this.marked ? this.marked.parse(response) : response.replace(/\n/g, '<br>');
            structured.setAttribute('data-markdown', encodeURIComponent(response));
          }
        }
      } catch (err) {
        console.error('regenerateStructuredWithLength error:', err);
        alert('Failed to regenerate. Please try again.');
      } finally {
        if (btn) { btn.disabled = false; btn.textContent = '🔄'; }
        if (this.hideProgressBar) this.hideProgressBar();
      }
    },

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
    addSaveButtonToCard: function(cardElement, category, contentData) {
      if (!cardElement || !category || !contentData) return;
      
      // Create save button with unified styling
      const saveBtn = document.createElement('button');
      
      // Check if this is a Twitter card (has twitter-header-actions container)
      const isTwitterCard = cardElement.classList.contains('twitter-header-actions');
      
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
      if (window.TabTalkStorage) {
        window.TabTalkStorage.isContentSaved(category, contentData.id || Date.now().toString())
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
        
        if (!window.TabTalkStorage) return;
        
        const isSaved = await window.TabTalkStorage.isContentSaved(category, contentId);
        
        if (isSaved) {
          // Remove from saved
          await window.TabTalkStorage.deleteSavedContent(category, contentId);
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
          
          await window.TabTalkStorage.saveContent(category, {
            id: contentId,
            content,
            metadata,
            ...contentData
          });
          
          saveBtn.classList.add('saved');
          saveBtn.querySelector('svg').setAttribute('fill', 'currentColor');
          this.showToast('Saved to history');
        }
      });
      
      // Add to card
      cardElement.appendChild(saveBtn);
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
  window.TabTalkUI = UI;
})();