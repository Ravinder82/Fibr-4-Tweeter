(function() {
  const GalleryManager = {
    INIT_KEY: 'savedContent',

    async loadSaved(category = 'twitter') {
      if (!window.TabTalkStorage || !TabTalkStorage.getSavedContent) {
        console.error('Gallery: TabTalkStorage not available');
        return [];
      }
      const saved = await TabTalkStorage.getSavedContent();
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
        if (window.TabTalkNavigation && TabTalkNavigation.showView) {
          TabTalkNavigation.showView('chat');
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
          if (window.TabTalkStorage && TabTalkStorage.clearSavedCategory) {
            await TabTalkStorage.clearSavedCategory(category);
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
      // Determine card type for dynamic sizing
      const isThread = (item.platform || '').toLowerCase() === 'thread' || 
                       (item.title || '').toLowerCase().includes('thread') ||
                       (item.content || '').includes('1/') || 
                       (item.content || '').includes('🧵');
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
            ${this.escapeHtml(item.content || '').substring(0, 200)}${(item.content || '').length > 200 ? '...' : ''}
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

      // Copy (no image prompts in saved content)
      copyBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        try {
          let textToCopy = '';
          const isThread = (item.platform || '').toLowerCase() === 'thread' && Array.isArray(item.tweets) && item.tweets.length > 0;
          if (isThread) {
            textToCopy = item.tweets.map((t, index) => {
              const header = t.number || `${index + 1}/${item.tweets.length}:`;
              return `${header}\n${t.content || ''}`;
            }).join('\n\n---\n\n');
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

      // Read - Open modal
      readBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openReadModal(item);
      });

      // Edit - Open modal in edit mode
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openEditModal(item);
      });

      // Delete
      deleteBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const ok = confirm('Delete this saved item?');
        if (!ok) return;
        await this.deleteItem(item);
        card.remove();
      });

      // Click card to read
      card.addEventListener('click', (e) => {
        // Ignore if clicking a button
        if (e.target.closest('.btn-action')) return;
        this.openReadModal(item);
      });

      return card;
    },

    openReadModal(item) {
      const modal = document.createElement('div');
      modal.className = 'gallery-modal';
      // Build modal content; do not include image prompts for saved content
      let imagePromptSection = '';
      modal.innerHTML = `
        <div class="gallery-modal-overlay"></div>
        <div class="gallery-modal-content">
          <div class="gallery-modal-header">
            <div>
              <h3>${this.escapeHtml(item.title || 'Post')}</h3>
              <span class="modal-meta">${this.formatDate(item.updatedAt || item.timestamp)} • ${this.getAccurateCharacterCount(item.content || '')} chars</span>
            </div>
            <button class="modal-close" aria-label="Close">×</button>
          </div>
          <div class="gallery-modal-body">
            <div class="modal-text">${this.escapeHtml(item.content || '').replace(/\n/g, '<br>')}</div>
          </div>
          <div class="gallery-modal-footer">
            <button class="modal-btn copy">Copy</button>
            <button class="modal-btn edit">Edit</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      const close = () => modal.remove();
      modal.querySelector('.modal-close').addEventListener('click', close);
      modal.querySelector('.gallery-modal-overlay').addEventListener('click', close);
      
      modal.querySelector('.modal-btn.copy').addEventListener('click', async () => {
        let textToCopy = '';
        const isThread = (item.platform || '').toLowerCase() === 'thread' && Array.isArray(item.tweets) && item.tweets.length > 0;
        if (isThread) {
          textToCopy = item.tweets.map((t, index) => {
            const header = t.number || `${index + 1}/${item.tweets.length}:`;
            return `${header}\n${t.content || ''}`;
          }).join('\n\n---\n\n');
        } else {
          textToCopy = item.content || '';
        }
        await navigator.clipboard.writeText(textToCopy);
        const btn = modal.querySelector('.modal-btn.copy');
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = 'Copy', 1500);
      });

      modal.querySelector('.modal-btn.edit').addEventListener('click', () => {
        close();
        this.openEditModal(item);
      });

      // ESC to close
      const escHandler = (e) => {
        if (e.key === 'Escape') {
          close();
          document.removeEventListener('keydown', escHandler);
        }
      };
      document.addEventListener('keydown', escHandler);
    },

    openEditModal(item) {
      const modal = document.createElement('div');
      modal.className = 'gallery-modal';
      modal.innerHTML = `
        <div class="gallery-modal-overlay"></div>
        <div class="gallery-modal-content">
          <div class="gallery-modal-header">
            <div>
              <h3>Edit: ${this.escapeHtml(item.title || 'Post')}</h3>
              <span class="modal-meta">Editing mode</span>
            </div>
            <button class="modal-close" aria-label="Close">×</button>
          </div>
          <div class="gallery-modal-body">
            <textarea class="modal-textarea" placeholder="Edit your content...">${this.escapeHtml(item.content || '')}</textarea>
          </div>
          <div class="gallery-modal-footer">
            <button class="modal-btn cancel">Cancel</button>
            <button class="modal-btn save primary">Save Changes</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      const textarea = modal.querySelector('.modal-textarea');
      const close = () => modal.remove();
      
      modal.querySelector('.modal-close').addEventListener('click', close);
      modal.querySelector('.gallery-modal-overlay').addEventListener('click', close);
      modal.querySelector('.modal-btn.cancel').addEventListener('click', close);

      modal.querySelector('.modal-btn.save').addEventListener('click', async () => {
        const patch = {
          content: textarea.value,
          updatedAt: Date.now(),
          charCountAccurate: this.getAccurateCharacterCount(textarea.value)
        };
        await this.updateItem(item, patch);
        close();
        // Refresh gallery
        const container = document.querySelector('#gallery-view');
        if (container) this.render(container);
      });

      textarea.focus();
    },

    async updateItem(item, patch) {
      const saved = await TabTalkStorage.getSavedContent();
      const category = (item._category) || 'twitter';
      if (!Array.isArray(saved[category])) return;
      const idx = saved[category].findIndex(i => i.id === item.id);
      if (idx === -1) return;
      saved[category][idx] = { ...saved[category][idx], ...patch };
      await TabTalkStorage.setStorageItem('savedContent', saved);
    },

    async deleteItem(item) {
      const category = (item._category) || 'twitter';
      await TabTalkStorage.deleteSavedContent(category, item.id);
    },

    debounce(fn, ms) {
      let t;
      return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn.apply(this, args), ms);
      };
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
