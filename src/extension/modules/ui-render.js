(function() {
  const UI = {
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

    addMessage: function(role, content) {
      const timestamp = new Date().toISOString();
      this.chatHistory.push({ role, content, timestamp });
      this.renderMessages();
    },

    renderMessages: function() {
      this.messagesContainer.innerHTML = '';
      this.chatHistory.forEach((message, index) => {
        const messageEl = document.createElement('div');
        messageEl.classList.add('message', message.role === 'user' ? 'user-message' : 'assistant-message');
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
      card.className = 'twitter-card';
      const content = document.createElement('div');
      content.className = 'twitter-card-content';
      const markdownAttr = options.markdown ? `data-markdown="${encodeURIComponent(options.markdown)}"` : '';
      content.innerHTML = `
        <div class="twitter-card-header">
          <h3 class="twitter-username">${title}</h3>
          <button class="copy-button" title="Copy">📋</button>
        </div>
        <div class="structured-html" ${markdownAttr}>${bodyHtml}</div>
      `;
      card.appendChild(content);
      const copyBtn = card.querySelector('.copy-button');
      copyBtn.addEventListener('click', () => {
        const structured = card.querySelector('.structured-html');
        const md = structured?.getAttribute('data-markdown');
        const textToCopy = md ? decodeURIComponent(md) : (structured?.innerText || '');
        navigator.clipboard.writeText(textToCopy).then(() => {
          copyBtn.textContent = '✅';
          setTimeout(() => { copyBtn.textContent = '📋'; }, 1500);
        });
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
      const renderMarkdown = (text) => this.marked ? this.marked.parse(text) : (text || '').replace(/\n/g, '<br>');
      const cleaned = this.sanitizeStructuredOutput(contentType, rawContent);

      switch (contentType) {
        case 'factcheck': {
          const parts = cleaned.split(/\n\n(?=(?:Claim\s*\d+|CLAIM\s*\d+|\d+[\.)]\s))/).filter(Boolean);
          if (parts.length > 1) {
            parts.forEach((p, idx) => {
              const title = `✅ Fact Check — Claim ${idx + 1}`;
              const segment = p.trim();
              this.renderCard(title, renderMarkdown(segment), { markdown: segment });
            });
          } else {
            this.renderCard('✅ Fact Check', renderMarkdown(cleaned), { markdown: cleaned });
          }
          break;
        }
        case 'summary':
        case 'blog': {
          const titleMap = { summary: '📝 Summary', blog: '✍️ Blog Post' };
          const card = this.renderCard(titleMap[contentType], renderMarkdown(cleaned), { markdown: cleaned });
          this.attachStructuredRegenerateControls(card, contentType);
          break;
        }
        default: {
          const titleMap = { keypoints: '🔑 Key Points', analysis: '📊 Analysis Report', faq: '❓ FAQ' };
          const title = titleMap[contentType] || '✨ Generated Content';
          this.renderCard(title, renderMarkdown(cleaned), { markdown: cleaned });
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

  };
  window.TabTalkUI = UI;
})();