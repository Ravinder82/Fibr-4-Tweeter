(function() {
  const MemoryBuilderUI = {
    // Initialize the UI
    async init() {
      await window.NicheManager.init();
      await window.MemoryManager.init();
      this.bindEvents();
      await this.renderNicheStatus();
    },

    // Bind all event listeners
    bindEvents() {
      // Niche management
      const setNicheBtn = document.getElementById('set-niche-btn');
      const clearNicheBtn = document.getElementById('clear-niche-btn');
      const nicheInput = document.getElementById('niche-input');

      if (setNicheBtn) {
        setNicheBtn.addEventListener('click', () => this.handleSetNiche());
      }

      if (clearNicheBtn) {
        clearNicheBtn.addEventListener('click', () => this.handleClearNiche());
      }

      if (nicheInput) {
        nicheInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            this.handleSetNiche();
          }
        });
      }

      // Memory management
      const addMemoryBtn = document.getElementById('add-memory-btn');
      if (addMemoryBtn) {
        addMemoryBtn.addEventListener('click', () => this.handleAddMemory());
      }

      // Clear inputs button
      const clearInputsBtn = document.getElementById('clear-memory-inputs-btn');
      if (clearInputsBtn) {
        clearInputsBtn.addEventListener('click', () => this.clearInputs());
      }
    },

    // Clear input fields
    clearInputs() {
      const urlInput = document.getElementById('memory-url-input');
      const contentInput = document.getElementById('memory-content-input');
      
      if (urlInput) urlInput.value = '';
      if (contentInput) contentInput.value = '';
      
      this.showNotification('Inputs cleared', 'info');
    },

    // Handle setting niche
    async handleSetNiche() {
      const nicheInput = document.getElementById('niche-input');
      const nicheDescription = nicheInput?.value?.trim();

      if (!nicheDescription) {
        this.showNotification('Please enter a niche description', 'error');
        return;
      }

      try {
        await window.NicheManager.setNiche(nicheDescription);
        await this.renderNicheStatus();
        this.showNotification('Niche set successfully!', 'success');
        nicheInput.value = '';
      } catch (error) {
        console.error('Failed to set niche:', error);
        this.showNotification(error.message || 'Failed to set niche', 'error');
      }
    },

    // Handle clearing niche
    async handleClearNiche() {
      if (!confirm('Are you sure you want to clear your niche? This will not delete your memory items.')) {
        return;
      }

      try {
        await window.NicheManager.clearNiche();
        await this.renderNicheStatus();
        this.showNotification('Niche cleared', 'success');
      } catch (error) {
        console.error('Failed to clear niche:', error);
        this.showNotification('Failed to clear niche', 'error');
      }
    },

    // Handle adding memory item
    async handleAddMemory() {
      const urlInput = document.getElementById('memory-url-input');
      const contentInput = document.getElementById('memory-content-input');

      const url = urlInput?.value?.trim();
      const content = contentInput?.value?.trim();

      if (!url && !content) {
        this.showNotification('Please enter a URL or content', 'error');
        return;
      }

      if (!window.NicheManager.hasNiche()) {
        this.showNotification('Please set a niche first', 'error');
        return;
      }

      try {
        // Create memory content with both URL and text
        const memoryContent = {
          url: url || null,
          text: content || null,
          title: url ? this.extractTitleFromUrl(url) : (content ? content.substring(0, 50) + '...' : 'Manual Entry')
        };

        // Determine type based on what's provided
        const itemType = url ? 'url' : 'text';

        await window.MemoryManager.addMemoryItem(itemType, memoryContent, {
          addedFrom: 'manual',
          timestamp: Date.now(),
          hasUrl: !!url,
          hasText: !!content
        });

        // DON'T clear inputs - keep them for reference
        // User can manually clear if needed
        
        await this.renderMemoryList();
        this.showNotification('Added to memory! Both URL and text saved.', 'success');
      } catch (error) {
        console.error('Failed to add memory:', error);
        this.showNotification(error.message || 'Failed to add memory', 'error');
      }
    },

    // Handle marking item as viral
    async handleMarkViral(itemId) {
      try {
        await window.MemoryManager.markAsViral(itemId);
        await this.renderMemoryList();
        this.showNotification('Marked as viral!', 'success');
      } catch (error) {
        console.error('Failed to mark as viral:', error);
        this.showNotification('Failed to mark as viral', 'error');
      }
    },

    // Handle deleting memory item
    async handleDeleteMemory(itemId) {
      if (!confirm('Remove this item from memory?')) {
        return;
      }

      try {
        await window.MemoryManager.removeMemoryItem(itemId);
        await this.renderMemoryList();
        this.showNotification('Memory item removed', 'success');
      } catch (error) {
        console.error('Failed to delete memory:', error);
        this.showNotification('Failed to delete memory', 'error');
      }
    },

    // Render niche status
    async renderNicheStatus() {
      const currentNicheDisplay = document.getElementById('current-niche-display');
      const currentNicheText = document.getElementById('current-niche-text');
      const memoryCollectionSection = document.getElementById('memory-collection-section');

      const niche = window.NicheManager.getCurrentNiche();

      if (niche) {
        if (currentNicheDisplay) currentNicheDisplay.classList.remove('hidden');
        if (currentNicheText) currentNicheText.textContent = niche.description;
        if (memoryCollectionSection) memoryCollectionSection.classList.remove('hidden');
        await this.renderMemoryList();
      } else {
        if (currentNicheDisplay) currentNicheDisplay.classList.add('hidden');
        if (memoryCollectionSection) memoryCollectionSection.classList.add('hidden');
      }
    },

    // Render memory list
    async renderMemoryList() {
      const container = document.getElementById('memory-items-container');
      const countSpan = document.getElementById('memory-count');
      const limitSpan = document.getElementById('memory-limit');

      if (!container) return;

      const items = await window.MemoryManager.getMemoryItems();
      
      if (countSpan) countSpan.textContent = items.length;
      if (limitSpan) limitSpan.textContent = window.MemoryManager.MAX_ITEMS_PER_NICHE;

      if (items.length === 0) {
        container.innerHTML = '<div class="empty-memory">No memory items yet. Add your first one above!</div>';
        return;
      }

      container.innerHTML = items.map(item => this.renderMemoryItem(item)).join('');

      // Bind delete and viral buttons
      items.forEach(item => {
        const deleteBtn = document.getElementById(`delete-memory-${item.id}`);
        const viralBtn = document.getElementById(`viral-memory-${item.id}`);

        if (deleteBtn) {
          deleteBtn.addEventListener('click', () => this.handleDeleteMemory(item.id));
        }

        if (viralBtn) {
          viralBtn.addEventListener('click', () => this.handleMarkViral(item.id));
        }
      });
    },

    // Render single memory item
    renderMemoryItem(item) {
      const date = new Date(item.createdAt).toLocaleDateString();
      const viralBadge = item.isViral ? '<span class="viral-badge">🔥 Viral</span>' : '';
      
      // Show both URL and text if available
      const hasUrl = item.content.url;
      const hasText = item.content.text;
      
      return `
        <div class="memory-item ${item.isViral ? 'viral' : ''}">
          <div class="memory-item-header">
            <span class="memory-type">${hasUrl ? '🔗' : '📝'}</span>
            <span class="memory-date">${date}</span>
            ${viralBadge}
          </div>
          <div class="memory-item-content">
            ${hasText ? `<p class="memory-summary">${this.escapeHtml(item.content.text)}</p>` : `<p class="memory-summary">${this.escapeHtml(item.summary)}</p>`}
            ${hasUrl ? `<a href="${this.escapeHtml(item.content.url)}" target="_blank" class="memory-url">🔗 ${this.escapeHtml(item.content.url)}</a>` : ''}
          </div>
          <div class="memory-item-actions">
            ${!item.isViral ? `<button id="viral-memory-${item.id}" class="memory-action-btn viral-btn">Mark Viral</button>` : ''}
            <button id="delete-memory-${item.id}" class="memory-action-btn delete-btn">Delete</button>
          </div>
        </div>
      `;
    },

    // Extract title from URL
    extractTitleFromUrl(url) {
      try {
        const urlObj = new URL(url);
        return urlObj.hostname + urlObj.pathname.substring(0, 30);
      } catch {
        return 'URL';
      }
    },

    // Escape HTML to prevent XSS
    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    },

    // Show notification
    showNotification(message, type = 'info') {
      // Simple notification system
      const notification = document.createElement('div');
      notification.className = `memory-notification ${type}`;
      notification.textContent = message;
      notification.style.cssText = `
        position: fixed;
        top: 60px;
        right: 20px;
        padding: 12px 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
      `;

      document.body.appendChild(notification);

      setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
      }, 3000);
    }
  };

  // Make it globally available
  window.MemoryBuilderUI = MemoryBuilderUI;
})();
