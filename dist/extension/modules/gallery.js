(function() {
  const GalleryManager = {
    INIT_KEY: 'savedContent',

    async loadSaved(category = 'twitter') {
      if (!window.FibrStorage || !FibrStorage.getSavedContent) {
        console.error('Gallery: FibrStorage not available');
        return [];
      }
      const saved = await FibrStorage.getSavedContent();
      if (!saved) return [];
      if (category === 'all') {
        // Flatten all categories if needed later
        const all = Object.entries(saved).flatMap(([cat, items]) =>
          (Array.isArray(items) ? items.map(i => ({ ...i, _category: cat })) : [])
        );
        return all;
      }
      return Array.isArray(saved[category]) ? saved[category] : [];
    },

    async render(container, category = 'twitter') {
      container.innerHTML = '';

      const header = document.createElement('div');
      header.className = 'gallery-header';
      header.innerHTML = `
        <div class="gallery-header-top">
          <button class="back-btn" id="gallery-back-btn" aria-label="Back" title="Back">←</button>
          <h2>Gallery</h2>
          <span id="gallery-count" class="gallery-count"></span>
        </div>
        <div class="gallery-header-bottom">
          <input id="gallery-search" class="gallery-search" placeholder="Search saved..." aria-label="Search saved content" />
          <select id="gallery-sort" class="gallery-sort" aria-label="Sort">
            <option value="updated_desc">Updated ↓</option>
            <option value="created_desc">Created ↓</option>
            <option value="length_asc">Length ↑</option>
            <option value="length_desc">Length ↓</option>
          </select>
          <button id="gallery-delete-all" class="gallery-delete-all" title="Delete all">Delete All</button>
        </div>
      `;
      container.appendChild(header);

      const list = document.createElement('div');
      list.className = 'gallery-list';
      container.appendChild(list);

      const items = await this.loadSaved(category);
      this.initVirtualList(list, items);

      // Wire header controls
      const backBtn = header.querySelector('#gallery-back-btn');
      backBtn.addEventListener('click', () => {
        if (window.FibrNavigation && FibrNavigation.showView) {
          FibrNavigation.showView('chat');
        }
      });

      const searchInput = header.querySelector('#gallery-search');
      const sortSelect = header.querySelector('#gallery-sort');
      const countEl = header.querySelector('#gallery-count');
      const deleteAllBtn = header.querySelector('#gallery-delete-all');

      const apply = async () => {
        const q = (searchInput.value || '').toLowerCase();
        const sort = sortSelect.value;
        let current = await this.loadSaved(category);
        if (q) {
          current = current.filter(i =>
            (i.content || '').toLowerCase().includes(q) ||
            (i.domain || '').toLowerCase().includes(q)
          );
        }
        current = this.sortItems(current, sort);
        this.initVirtualList(list, current);
        this.renderList(list, current.slice(0, this._virtual.batch));
        countEl.textContent = `${current.length}/50`;
      };

      searchInput.addEventListener('input', this.debounce(apply, 150));
      sortSelect.addEventListener('change', apply);
      countEl.textContent = `${items.length}/50`;

      if (deleteAllBtn) {
        deleteAllBtn.addEventListener('click', async () => {
          const ok = confirm('Delete all saved items in this category?');
          if (!ok) return;
          if (window.FibrStorage && FibrStorage.clearSavedCategory) {
            await FibrStorage.clearSavedCategory(category);
            this.initVirtualList(list, []);
            this.renderList(list, []);
            countEl.textContent = `0/50`;
          }
        });
      }
    },

    sortItems(items, sort) {
      const copy = [...items];
      switch (sort) {
        case 'created_desc':
          return copy.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        case 'length_asc':
          return copy.sort((a, b) => (a.charCountAccurate || (a.content||'').length) - (b.charCountAccurate || (b.content||'').length));
        case 'length_desc':
          return copy.sort((a, b) => (b.charCountAccurate || (b.content||'').length) - (a.charCountAccurate || (a.content||'').length));
        case 'updated_desc':
        default:
          return copy.sort((a, b) => (b.updatedAt || b.timestamp || 0) - (a.updatedAt || a.timestamp || 0));
      }
    },

    renderList(list, items) {
      if (!items || items.length === 0) {
        list.innerHTML = `
          <div class="gallery-empty">
            <img src="icons/icon128.jpeg" alt="" />
            <h3>No saved posts yet</h3>
            <p>Use the Save button on any generated card to add it here.</p>
          </div>
        `;
        return;
      }

      // If virtualization context exists, append only next batch
      if (this._virtual && this._virtual.list === list) {
        this.appendNextBatch();
        return;
      }

      // Fallback full render
      list.innerHTML = '';
      const frag = document.createDocumentFragment();
      items.forEach(item => {
        const card = this.renderCard(item);
        frag.appendChild(card);
      });
      list.appendChild(frag);
    },

    initVirtualList(list, items) {
      // Reset previous listeners by cloning element
      const newList = list;
      newList.innerHTML = '';
      this._virtual = {
        list: newList,
        items: items || [],
        index: 0,
        batch: 20
      };
      // Initial paint: one or two batches depending on size
      this.appendNextBatch();
      if (this._virtual.items.length > this._virtual.batch) {
        this.appendNextBatch();
      }
      const onScroll = () => {
        const { list: el } = this._virtual || {};
        if (!el) return;
        // Near bottom: load next batch
        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 120) {
          this.appendNextBatch();
        }
      };
      // Remove previous handler if any
      if (this._virtualScrollHandler) {
        newList.removeEventListener('scroll', this._virtualScrollHandler);
      }
      this._virtualScrollHandler = onScroll;
      newList.addEventListener('scroll', onScroll, { passive: true });
    },

    appendNextBatch() {
      const v = this._virtual;
      if (!v || !v.list) return;
      if (v.index >= v.items.length) return;
      const start = v.index;
      const end = Math.min(v.index + v.batch, v.items.length);
      const frag = document.createDocumentFragment();
      for (let i = start; i < end; i++) {
        frag.appendChild(this.renderCard(v.items[i]));
      }
      v.list.appendChild(frag);
      v.index = end;
    },

    renderCard(item) {
      const card = document.createElement('div');
      
      // BULLETPROOF THREAD DETECTION - Use centralized detection
      const isThread = window.FibrTwitter && window.FibrTwitter.isThreadContent 
        ? window.FibrTwitter.isThreadContent(item)
        : this.fallbackThreadDetection(item);
      
      const isLongContent = (item.content || '').length > 500;
      
      // Apply appropriate class for sizing
      let cardClass = 'gallery-card';
      if (isThread) {
        cardClass += ' card-thread';
      } else if (isLongContent) {
        cardClass += ' card-long';
      }
      
      card.className = cardClass;
      const accurate = this.getAccurateCharacterCount(item.content || '');

      // Build a clean preview: prefer first tweet content when thread-like
      const previewText = this.buildPreviewText(item);
      card.innerHTML = `
        <div class="gallery-card-header">
          <div class="title-row">
            <span class="title">${this.escapeHtml(item.title || 'Post')}</span>
            <span class="badge platform">${this.escapeHtml((item.platform || 'twitter').toUpperCase())}</span>
          </div>
          <div class="meta-row">
            <span class="timestamp">${this.formatDate(item.updatedAt || item.timestamp)}</span>
            <span class="metrics">${accurate} chars</span>
          </div>
        </div>
        <div class="gallery-card-body">
          <div class="gallery-preview" data-content="${this.escapeHtml(item.content || '')}">
            ${this.escapeHtml(previewText).substring(0, 200)}${previewText.length > 200 ? '...' : ''}
          </div>
        </div>
        <div class="gallery-card-footer">
          <button class="btn-action copy" title="Copy"><span>Copy</span></button>
          <button class="btn-action read" title="Read"><span>Read</span></button>
          <button class="btn-action edit" title="Edit"><span>Edit</span></button>
          <button class="btn-action delete" title="Delete"><span>Delete</span></button>
        </div>
      `;

      const preview = card.querySelector('.gallery-preview');
      const copyBtn = card.querySelector('.btn-action.copy');
      const readBtn = card.querySelector('.btn-action.read');
      const editBtn = card.querySelector('.btn-action.edit');
      const deleteBtn = card.querySelector('.btn-action.delete');

      // BULLETPROOF COPY FUNCTIONALITY - Handle all thread formats
      copyBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        try {
          let textToCopy = '';
          
          // Use centralized thread detection
          const isThread = window.FibrTwitter && window.FibrTwitter.isThreadContent 
            ? window.FibrTwitter.isThreadContent(item)
            : this.fallbackThreadDetection(item);
          
          if (isThread) {
            textToCopy = this.extractThreadContent(item);
          } else {
            textToCopy = item.content || '';
          }
          
          await navigator.clipboard.writeText(textToCopy);
          const span = copyBtn.querySelector('span');
          span.textContent = '✓';
          copyBtn.classList.add('success');
          setTimeout(() => { span.textContent = 'Copy'; copyBtn.classList.remove('success'); }, 1500);
        } catch (e) {
          console.error('Gallery copy failed', e);
        }
      });

      // Read - Open Rich Text Viewer Modal
      readBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.RichTextModal.showViewer(item);
      });

      // Edit - Open Rich Text Editor Modal
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.RichTextModal.showEditor(item);
      });

      // Delete
      deleteBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const ok = confirm('Delete this saved item?');
        if (!ok) return;
        await this.deleteItem(item);
        card.remove();
      });

      // Click card to read - Open Rich Text Viewer Modal
      card.addEventListener('click', (e) => {
        // Ignore if clicking a button
        if (e.target.closest('.btn-action')) return;
        this.RichTextModal.showViewer(item);
      });

      return card;
    },

    // =====================================================
// SUPER ROBUST RICH TEXT MODAL SYSTEM - BULLETPROOF
// =====================================================
// Architecture: Single modal instance, atomic operations, no conflicts
    
RichTextModal: {
  // Singleton pattern - only ONE modal can exist
  _instance: null,
  _currentMode: null, // 'viewer' or 'editor'
  _currentItem: null,
  
  // Public API - Entry points
  showViewer(item) {
    this._destroyExisting(); // Atomic cleanup first
    this._createViewer(item);
  },
  
  showEditor(item) {
    this._destroyExisting(); // Atomic cleanup first  
    this._createEditor(item);
  },
  
  // Core modal management
  _destroyExisting() {
    if (this._instance) {
      // Remove ESC handler
      if (this._instance._escHandler) {
        document.removeEventListener('keydown', this._instance._escHandler);
        this._instance._escHandler = null;
      }
      // Remove from DOM
      if (this._instance.parentNode) {
        this._instance.parentNode.removeChild(this._instance);
      }
      // Reset state
      this._instance = null;
      this._currentMode = null;
      this._currentItem = null;
    }
  },
  
  _createBaseModal() {
    const modal = document.createElement('div');
    modal.className = 'rich-text-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      opacity: 0;
      transition: opacity 0.2s ease;
    `;
    
    // Store reference for cleanup
    this._instance = modal;
    
    return modal;
  },
  
  _createViewer(item) {
    const modal = this._createBaseModal();
    this._currentMode = 'viewer';
    this._currentItem = item;
    
    // Parse content for display
    const displayData = this._prepareDisplayContent(item);
    
    modal.innerHTML = `
      <div class="rich-text-modal-content" style="
        background: var(--primary-bg);
        border-radius: 12px;
        width: 90%;
        max-width: 600px;
        max-height: 80vh;
        overflow: hidden;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        transform: scale(0.9);
        transition: transform 0.2s ease;
      ">
        
        <div class="rich-text-modal-body" style="
          padding: 24px;
          max-height: 400px;
          overflow-y: auto;
          background: var(--primary-bg);
        ">
          ${displayData.contentHTML}
        </div>
        
        <div class="rich-text-modal-footer" style="
          padding: 16px 20px;
          border-top: 1px solid var(--border-color);
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          background: var(--secondary-bg);
        ">
          <button class="rich-text-modal-btn copy" style="
            background: var(--tertiary-bg);
            color: var(--text-primary);
            border: 1px solid var(--border-color);
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.2s ease;
          ">Copy</button>
          <button class="rich-text-modal-btn edit" style="
            background: var(--accent-color);
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.2s ease;
          ">Edit</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Animate in
    requestAnimationFrame(() => {
      modal.style.opacity = '1';
      modal.querySelector('.rich-text-modal-content').style.transform = 'scale(1)';
    });
    
    // Bind events
    this._bindViewerEvents(modal, item, displayData);
  },
  
  _createEditor(item) {
    const modal = this._createBaseModal();
    this._currentMode = 'editor';
    this._currentItem = item;
    
    // Prepare editable content
    const editText = this._prepareEditableContent(item);
    
    modal.innerHTML = `
      <div class="rich-text-modal-content" style="
        background: var(--primary-bg);
        border-radius: 12px;
        width: 90%;
        max-width: 600px;
        max-height: 80vh;
        overflow: hidden;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        transform: scale(0.9);
        transition: transform 0.2s ease;
      ">
        
        <div class="rich-text-modal-body" style="
          padding: 20px;
          max-height: 400px;
          overflow-y: auto;
          background: var(--primary-bg);
        ">
          <textarea class="rich-text-modal-textarea" style="
            width: 100%;
            min-height: 300px;
            background: var(--secondary-bg);
            color: var(--text-primary);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 16px;
            font-size: 14px;
            line-height: 1.5;
            resize: vertical;
            font-family: inherit;
            outline: none;
            transition: border-color 0.2s ease;
          " placeholder="Edit your content...">${this._escapeHtml(editText)}</textarea>
        </div>
        
        <div class="rich-text-modal-footer" style="
          padding: 16px 20px;
          border-top: 1px solid var(--border-color);
          display: flex;
          gap: 12px;
          justify-content: space-between;
          background: var(--secondary-bg);
        ">
          <div style="color: var(--text-secondary); font-size: 12px;">
            <span class="char-count">0</span> characters
          </div>
          <div style="display: flex; gap: 12px;">
            <button class="rich-text-modal-btn cancel" style="
              background: var(--tertiary-bg);
              color: var(--text-primary);
              border: 1px solid var(--border-color);
              padding: 8px 16px;
              border-radius: 6px;
              cursor: pointer;
              font-size: 14px;
              transition: all 0.2s ease;
            ">Cancel</button>
            <button class="rich-text-modal-btn save" style="
              background: var(--accent-color);
              color: white;
              border: none;
              padding: 8px 16px;
              border-radius: 6px;
              cursor: pointer;
              font-size: 14px;
              transition: all 0.2s ease;
            ">Save Changes</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Animate in
    requestAnimationFrame(() => {
      modal.style.opacity = '1';
      modal.querySelector('.rich-text-modal-content').style.transform = 'scale(1)';
    });
    
    // Bind events
    this._bindEditorEvents(modal, item);
  },
  
  // Content preparation
  _prepareDisplayContent(item) {
    let tweetsArray = null;
    
    // Parse tweets if available
    if (Array.isArray(item.tweets) && item.tweets.length > 0) {
      tweetsArray = item.tweets.map(t => {
        const raw = (t.content || '').toString();
        const cleaned = raw.replace(/^\d+\/[nN\d]+[\s:]*/, '').trim();
        return { content: cleaned, charCount: t.charCount || this._getCharCount(cleaned) };
      });
    } else if ((item.content || '') && window.FibrTwitter && window.FibrTwitter.parseTwitterThread) {
      const parsed = window.FibrTwitter.parseTwitterThread(item.content || '');
      if (Array.isArray(parsed) && parsed.length > 1) {
        tweetsArray = parsed.map(t => ({ content: t, charCount: this._getCharCount(t) }));
      }
    }
    
    const isThread = Array.isArray(tweetsArray) && tweetsArray.length > 0;
    const totalChars = item.totalChars || this._getCharCount(item.content || '');
    
    // Build content HTML
    let contentHTML = '';
    if (isThread) {
      contentHTML = '<div style="display: flex; flex-direction: column; gap: 16px;">';
      tweetsArray.forEach((tweet, index) => {
        contentHTML += `
          <div style="
            background: var(--secondary-bg);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 16px;
            position: relative;
          ">
            <div style="
              position: absolute;
              top: 8px;
              right: 8px;
              background: var(--accent-color);
              color: white;
              padding: 2px 8px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: 600;
            ">${index + 1}/${tweetsArray.length}</div>
            <div style="
              color: var(--text-primary);
              line-height: 1.5;
              white-space: pre-wrap;
              margin-top: 8px;
            ">${this._escapeHtml(tweet.content || '').replace(/\n/g, '<br>')}</div>
            <div style="
              margin-top: 12px;
              color: var(--text-secondary);
              font-size: 12px;
            ">${tweet.charCount} characters</div>
          </div>
        `;
      });
      contentHTML += '</div>';
    } else {
      contentHTML = `
        <div style="
          color: var(--text-primary);
          line-height: 1.6;
          white-space: pre-wrap;
        ">${this._escapeHtml(item.content || '').replace(/\n/g, '<br>')}</div>
      `;
    }
    
    return {
      contentHTML,
      meta: `${this._formatDate(item.updatedAt || item.timestamp)} • ${totalChars} characters${isThread ? ` • ${tweetsArray.length} tweets` : ''}`,
      tweetsArray,
      isThread
    };
  },
  
  _prepareEditableContent(item) {
    let editText = item.content || '';
    
    if (Array.isArray(item.tweets) && item.tweets.length > 0) {
      editText = item.tweets
        .map(t => ((t.content || '').toString().replace(/^\d+\/[nN\d]+[\s:]*/, '').trim()))
        .join('\n\n');
    } else if ((item.content || '') && window.FibrTwitter && window.FibrTwitter.parseTwitterThread) {
      const parsed = window.FibrTwitter.parseTwitterThread(item.content || '');
      if (Array.isArray(parsed) && parsed.length > 1) {
        editText = parsed.join('\n\n');
      }
    }
    
    return editText;
  },
  
  // Event binding
  _bindViewerEvents(modal, item, displayData) {
    // Close handlers
    const closeHandler = () => this._destroyExisting();
    const closeBtnV = modal.querySelector('.rich-text-modal-close');
    if (closeBtnV) closeBtnV.addEventListener('click', closeHandler);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeHandler();
    });
    
    // ESC key
    const escHandler = (e) => {
      if (e.key === 'Escape') closeHandler();
    };
    modal._escHandler = escHandler;
    document.addEventListener('keydown', escHandler);
    
    // Add hover effects for buttons
    const copyBtn = modal.querySelector('.rich-text-modal-btn.copy');
    const editBtn = modal.querySelector('.rich-text-modal-btn.edit');
    
    copyBtn.addEventListener('mouseenter', () => {
      copyBtn.style.background = 'var(--border-color)';
    });
    copyBtn.addEventListener('mouseleave', () => {
      copyBtn.style.background = 'var(--tertiary-bg)';
    });
    
    editBtn.addEventListener('mouseenter', () => {
      editBtn.style.opacity = '0.8';
    });
    editBtn.addEventListener('mouseleave', () => {
      editBtn.style.opacity = '1';
    });
    
    // Copy button
    copyBtn.addEventListener('click', async () => {
      let textToCopy = '';
      
      if (displayData.isThread && Array.isArray(displayData.tweetsArray)) {
        textToCopy = displayData.tweetsArray.map((t, index) => {
          return `${index + 1}/${displayData.tweetsArray.length}:\n${t.content || ''}`;
        }).join('\n\n---\n\n');
      } else {
        textToCopy = item.content || '';
      }
      
      await navigator.clipboard.writeText(textToCopy);
      const btn = modal.querySelector('.rich-text-modal-btn.copy');
      const originalText = btn.textContent;
      btn.textContent = 'Copied!';
      btn.style.background = 'var(--accent-color)';
      btn.style.color = 'white';
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = 'var(--tertiary-bg)';
        btn.style.color = 'var(--text-primary)';
      }, 1500);
    });
    
    // Edit button - transition to editor
    editBtn.addEventListener('click', () => {
      this._destroyExisting(); // Atomic cleanup
      // Small delay for clean transition
      setTimeout(() => this._createEditor(item), 100);
    });
  },
  
  _bindEditorEvents(modal, item) {
    const textarea = modal.querySelector('.rich-text-modal-textarea');
    const charCount = modal.querySelector('.char-count');
    
    // Update character count
    const updateCharCount = () => {
      charCount.textContent = this._getCharCount(textarea.value);
    };
    textarea.addEventListener('input', updateCharCount);
    updateCharCount(); // Initial count
    
    // Add focus/blur styling
    textarea.addEventListener('focus', () => {
      textarea.style.borderColor = 'var(--accent-color)';
    });
    textarea.addEventListener('blur', () => {
      textarea.style.borderColor = 'var(--border-color)';
    });
    
    // Close handlers
    const closeHandler = () => this._destroyExisting();
    const closeBtnE = modal.querySelector('.rich-text-modal-close');
    const cancelBtn = modal.querySelector('.rich-text-modal-btn.cancel');
    const saveBtn = modal.querySelector('.rich-text-modal-btn.save');
    
    if (closeBtnE) closeBtnE.addEventListener('click', closeHandler);
    cancelBtn.addEventListener('click', closeHandler);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeHandler();
    });
    
    // Add hover effects for buttons
    cancelBtn.addEventListener('mouseenter', () => {
      cancelBtn.style.background = 'var(--border-color)';
    });
    cancelBtn.addEventListener('mouseleave', () => {
      cancelBtn.style.background = 'var(--tertiary-bg)';
    });
    
    saveBtn.addEventListener('mouseenter', () => {
      saveBtn.style.opacity = '0.8';
    });
    saveBtn.addEventListener('mouseleave', () => {
      saveBtn.style.opacity = '1';
    });
    
    // ESC key
    const escHandler = (e) => {
      if (e.key === 'Escape') closeHandler();
    };
    modal._escHandler = escHandler;
    document.addEventListener('keydown', escHandler);
    
    // Save button
    saveBtn.addEventListener('click', async () => {
      const newContent = textarea.value;
      const patch = {
        content: newContent,
        updatedAt: Date.now(),
        charCountAccurate: this._getCharCount(newContent)
      };
      
      // Parse as thread if applicable
      if (window.FibrTwitter && window.FibrTwitter.parseTwitterThread) {
        const parsed = window.FibrTwitter.parseTwitterThread(newContent || '');
        if (Array.isArray(parsed) && parsed.length > 1) {
          patch.tweets = parsed.map((t, idx) => ({
            id: `tweet_${idx + 1}`,
            number: `${idx + 1}/${parsed.length}`,
            content: t,
            charCount: this._getCharCount(t)
          }));
          patch.totalTweets = parsed.length;
          patch.totalChars = parsed.reduce((sum, t) => sum + this._getCharCount(t), 0);
          patch.platform = 'thread';
          patch.type = 'thread';
          patch.isThread = true;
          patch.hasThreadStructure = true;
        }
      }
      
      // Save via gallery manager
      await window.galleryManager.updateItem(item, patch);
      
      // Close modal and refresh gallery
      this._destroyExisting();
      const container = document.querySelector('#gallery-view');
      if (container) window.galleryManager.render(container);
    });
    
    // Focus textarea
    textarea.focus();
  },
  
  // Utility functions
  _getCharCount(text) {
    if (!text) return 0;
    const trimmedText = String(text).trim();
    let count = 0;
    const characters = Array.from(trimmedText);
    for (const char of characters) {
      const codePoint = char.codePointAt(0);
      const isEmoji = (
        (codePoint >= 0x1F000 && codePoint <= 0x1F9FF) ||
        (codePoint >= 0x2600 && codePoint <= 0x26FF) ||
        (codePoint >= 0x2700 && codePoint <= 0x27BF) ||
        (codePoint >= 0x1F600 && codePoint <= 0x1F64F) ||
        (codePoint >= 0x1F300 && codePoint <= 0x1F5FF) ||
        (codePoint >= 0x1F680 && codePoint <= 0x1F6FF) ||
        (codePoint >= 0x1F1E0 && codePoint <= 0x1F1FF) ||
        (codePoint >= 0x200D)
      );
      count += isEmoji ? 2 : 1;
    }
    return count;
  },
  
  _escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },
  
  _formatDate(ts) {
    if (!ts) return '';
    try {
      const d = new Date(ts);
      return d.toLocaleString();
    } catch {
      return '';
    }
  }
},

    async updateItem(item, patch) {
      const saved = await FibrStorage.getSavedContent();
      const category = (item._category) || 'twitter';
      if (!Array.isArray(saved[category])) return;
      const idx = saved[category].findIndex(i => i.id === item.id);
      if (idx === -1) return;
      saved[category][idx] = { ...saved[category][idx], ...patch };
      await FibrStorage.setStorageItem('savedContent', saved);
    },

    async deleteItem(item) {
      const category = (item._category) || 'twitter';
      await FibrStorage.deleteSavedContent(category, item.id);
    },

    debounce(fn, ms) {
      let t;
      return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn.apply(this, args), ms);
      };
    },

    fallbackThreadDetection(item) {
      if (!item) return false;
      
      // Check 1: Explicit platform/type markers
      if ((item.platform || '').toLowerCase() === 'thread') return true;
      if ((item.type || '').toLowerCase() === 'thread') return true;
      
      // Check 2: Title contains thread indicators
      const title = (item.title || '').toLowerCase();
      if (title.includes('thread')) return true;
      
      // Check 3: Content has structured thread indicators
      const content = (item.content || '').toLowerCase();
      
      // Look for numbered thread patterns (most reliable)
      if (content.includes('1/') && content.includes('2/')) return true;
      if (content.includes('1/8') || content.includes('1/7') || content.includes('1/6') || 
          content.includes('1/5') || content.includes('1/4') || content.includes('1/3')) return true;
      
      // Look for thread emoji
      if (content.includes('🧵')) return true;
      
      // Check 4: Has structured tweets array (definitive proof)
      if (Array.isArray(item.tweets) && item.tweets.length > 1) return true;
      
      // Check 5: Total tweets metadata
      if (item.totalTweets && item.totalTweets > 1) return true;
      
      return false;
    },

    extractThreadContent(item) {
      // Method 1: Use structured tweets array if available (most reliable)
      if (Array.isArray(item.tweets) && item.tweets.length > 0) {
        return item.tweets.map((t, index) => {
          const header = t.number || `${index + 1}/${item.tweets.length}:`;
          return `${header}\n${t.content || ''}`;
        }).join('\n\n---\n\n');
      }
      
      // Method 2: Parse from combined content using enhanced parsing
      if (item.content) {
        // Use Twitter module's enhanced parsing if available
        if (window.FibrTwitter && window.FibrTwitter.parseTwitterThread) {
          const parsedTweets = window.FibrTwitter.parseTwitterThread(item.content);
          if (parsedTweets.length > 1) {
            return parsedTweets.map((tweet, index) => {
              return `${index + 1}/${parsedTweets.length}:\n${tweet}`;
            }).join('\n\n---\n\n');
          }
        }
        
        // Fallback: Return combined content as-is
        return item.content;
      }
      
      // Method 3: Last resort fallback
      return item.content || '';
    },

    // Build a clean preview string for a card. Prefer first tweet content, without numbering
    buildPreviewText(item) {
      try {
        if (Array.isArray(item.tweets) && item.tweets.length > 0) {
          return (item.tweets[0].content || '').toString();
        }
        const content = (item.content || '').toString();
        if (window.FibrTwitter && window.FibrTwitter.parseTwitterThread) {
          const parsed = window.FibrTwitter.parseTwitterThread(content);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed[0];
          }
        }
        // Fallback: strip leading numbering if present
        return content.replace(/^\d+\/\d+[\s:]*/, '').trim();
      } catch {
        return item.content || '';
      }
    },

    getAccurateCharacterCount(text) {
      if (!text) return 0;
      const trimmedText = String(text).trim();
      let count = 0;
      const characters = Array.from(trimmedText);
      for (const char of characters) {
        const codePoint = char.codePointAt(0);
        const isEmoji = (
          (codePoint >= 0x1F000 && codePoint <= 0x1F9FF) ||
          (codePoint >= 0x2600 && codePoint <= 0x26FF) ||
          (codePoint >= 0x2700 && codePoint <= 0x27BF) ||
          (codePoint >= 0x1F600 && codePoint <= 0x1F64F) ||
          (codePoint >= 0x1F300 && codePoint <= 0x1F5FF) ||
          (codePoint >= 0x1F680 && codePoint <= 0x1F6FF) ||
          (codePoint >= 0x1F1E0 && codePoint <= 0x1F1FF) ||
          (codePoint >= 0x200D)
        );
        count += isEmoji ? 2 : 1;
      }
      return count;
    },

    escapeHtml(s) {
      return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    },

    formatDate(ts) {
      if (!ts) return '';
      try {
        const d = new Date(ts);
        return d.toLocaleString();
      } catch {
        return '';
      }
    }
  };

  window.galleryManager = GalleryManager;
})();
