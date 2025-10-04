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
        <button class="back-btn" id="gallery-back-btn" aria-label="Back" title="Back">←</button>
        <h2>Gallery</h2>
        <div class="gallery-tools">
          <input id="gallery-search" class="gallery-search" placeholder="Search saved..." aria-label="Search saved content" />
          <select id="gallery-sort" class="gallery-sort" aria-label="Sort">
            <option value="updated_desc">Updated ↓</option>
            <option value="created_desc">Created ↓</option>
            <option value="length_asc">Length ↑</option>
            <option value="length_desc">Length ↓</option>
          </select>
          <span id="gallery-count" class="gallery-count"></span>
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
      card.className = 'gallery-card collapsed';
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-expanded', 'false');
      const accurate = this.getAccurateCharacterCount(item.content || '');
      card.innerHTML = `
        <div class="gallery-card-header">
          <div class="title-row">
            <span class="title">${this.escapeHtml(item.title || 'Twitter Post')}</span>
            ${item.domain ? `<span class="badge">${this.escapeHtml(item.domain)}</span>` : ''}
            <span class="badge platform">${this.escapeHtml((item.platform || 'twitter').toUpperCase())}</span>
          </div>
          <div class="meta-row">
            <span class="timestamp">${this.formatDate(item.updatedAt || item.timestamp)}</span>
            <span class="metrics">${accurate} chars</span>
            <button class="toggle-btn" aria-label="Expand" title="Expand" data-state="collapsed">▾</button>
          </div>
        </div>
        <div class="gallery-card-content">
          <div class="gallery-text-wrap">
            <textarea class="gallery-text" aria-label="Saved content" disabled>${this.escapeHtml(item.content || '')}</textarea>
            <div class="fade-mask" aria-hidden="true"></div>
          </div>
          <div class="gallery-controls">
            <button class="btn copy" title="Copy">Copy</button>
            <button class="btn edit" title="Edit">Edit</button>
            <button class="btn save hidden" title="Save">Save</button>
            <button class="btn delete" title="Delete">Delete</button>
            ${item.url ? `<a class="btn link" href="#" title="Open Source">Open</a>` : ''}
          </div>
        </div>
      `;

      const text = card.querySelector('.gallery-text');
      const copyBtn = card.querySelector('.btn.copy');
      const editBtn = card.querySelector('.btn.edit');
      const saveBtn = card.querySelector('.btn.save');
      const deleteBtn = card.querySelector('.btn.delete');
      const linkBtn = card.querySelector('.btn.link');

      // Copy
      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(text.value);
          copyBtn.textContent = 'Copied';
          copyBtn.classList.add('success');
          setTimeout(() => { copyBtn.textContent = 'Copy'; copyBtn.classList.remove('success'); }, 1500);
        } catch (e) {
          console.error('Gallery copy failed', e);
        }
      });

      // Edit/Save
      editBtn.addEventListener('click', () => {
        text.disabled = false;
        text.focus();
        editBtn.classList.add('hidden');
        saveBtn.classList.remove('hidden');
        this.autoResize(text);
      });
      saveBtn.addEventListener('click', async () => {
        text.disabled = true;
        editBtn.classList.remove('hidden');
        saveBtn.classList.add('hidden');
        const patch = {
          content: text.value,
          updatedAt: Date.now(),
          charCountAccurate: this.getAccurateCharacterCount(text.value)
        };
        await this.updateItem(item, patch);
      });

      // Delete
      deleteBtn.addEventListener('click', async () => {
        await this.deleteItem(item);
        card.remove();
      });

      // Open source link
      if (linkBtn) {
        linkBtn.addEventListener('click', (e) => {
          e.preventDefault();
          if (item.url) {
            chrome.tabs.create({ url: item.url });
          }
        });
      }

      // Toggle expand/collapse handlers
      const textWrap = card.querySelector('.gallery-text-wrap');
      const toggleBtn = card.querySelector('.toggle-btn');

      const toggle = (force) => {
        const willExpand = force !== undefined ? force : card.classList.contains('collapsed');
        if (willExpand) {
          card.classList.remove('collapsed');
          card.setAttribute('aria-expanded', 'true');
          if (toggleBtn) { toggleBtn.dataset.state = 'expanded'; toggleBtn.setAttribute('aria-label','Collapse'); toggleBtn.title = 'Collapse'; }
          // auto-resize after expand
          this.autoResize(text);
        } else {
          card.classList.add('collapsed');
          card.setAttribute('aria-expanded', 'false');
          if (toggleBtn) { toggleBtn.dataset.state = 'collapsed'; toggleBtn.setAttribute('aria-label','Expand'); toggleBtn.title = 'Expand'; }
        }
      };

      // Click anywhere on content to toggle (ignore control buttons/links)
      const contentArea = card.querySelector('.gallery-card-content');
      contentArea.addEventListener('click', (e) => {
        const isControl = e.target.closest('.gallery-controls') || e.target.closest('button') || e.target.closest('a');
        if (isControl) return;
        // Do not collapse when editing
        if (!text.disabled) return;
        toggle();
      });

      // Header toggle button
      if (toggleBtn) {
        toggleBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          toggle();
        });
      }

      // Keyboard accessibility
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          // Do not toggle when focusing on controls
          const active = document.activeElement;
          if (active && (active.closest('.gallery-controls') || active.tagName === 'TEXTAREA' || active.classList.contains('toggle-btn'))) return;
          toggle();
        } else if (e.key === 'Escape') {
          toggle(false);
        }
      });

      // Initial autosize
      setTimeout(() => this.autoResize(text), 0);

      return card;
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

    autoResize(textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.max(80, textarea.scrollHeight) + 'px';
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
