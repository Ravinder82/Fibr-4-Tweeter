(function() {
  const ThreadLibrary = {
    async render(container) {
      container.innerHTML = '';
      
      const header = document.createElement('div');
      header.className = 'thread-library-header';
      header.innerHTML = `
        <button class="back-btn" id="thread-lib-back" aria-label="Back to chat">← Back</button>
        <h2>🧵 My Threads</h2>
        <div class="thread-search-box">
          <input type="text" id="thread-search" placeholder="Search threads..." aria-label="Search threads" />
        </div>
      `;
      container.appendChild(header);
      
      // Thread list
      const list = document.createElement('div');
      list.className = 'thread-list';
      list.id = 'thread-list';
      container.appendChild(list);
      
      await this.loadThreads(list);
      
      // Event handlers
      this.bindEvents(container);
    },
    
    async loadThreads(listContainer) {
      if (!window.TabTalkStorage || !window.TabTalkStorage.getAllThreads) {
        listContainer.innerHTML = '<div class="empty-state"><p>Storage not available</p></div>';
        return;
      }
      
      const threads = await window.TabTalkStorage.getAllThreads();
      const threadArray = Object.values(threads);
      
      // Sort by creation date (newest first)
      threadArray.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      
      listContainer.innerHTML = '';
      
      if (threadArray.length === 0) {
        listContainer.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">🧵</div>
            <h3>No threads yet</h3>
            <p>Generate a Twitter thread to see it here!</p>
            <p class="hint">Click "🧵 Thread" button to create your first thread</p>
          </div>
        `;
        return;
      }
      
      threadArray.forEach(thread => {
        const card = this.createThreadCard(thread);
        listContainer.appendChild(card);
      });
    },
    
    createThreadCard(thread) {
      const card = document.createElement('div');
      card.className = 'thread-library-card';
      if (thread.isAutoSaved) {
        card.classList.add('auto-saved');
      }
      
      const timeAgo = this.formatTimeAgo(thread.createdAt);
      
      card.innerHTML = `
        <div class="thread-card-header">
          <div class="thread-card-title">
            ${thread.isAutoSaved ? '💾' : '🧵'} ${this.escapeHtml(thread.title || 'Untitled Thread')}
          </div>
          <div class="thread-card-meta">
            ${thread.totalTweets} tweets • ${thread.totalChars} chars • ${timeAgo}
          </div>
        </div>
        <div class="thread-card-preview">
          ${this.escapeHtml(thread.tweets[0]?.content.substring(0, 100) || '')}${thread.tweets[0]?.content.length > 100 ? '...' : ''}
        </div>
        <div class="thread-card-actions">
          <button class="btn-view-thread" data-thread-id="${thread.id}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            View
          </button>
          <button class="btn-copy-thread" data-thread-id="${thread.id}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            Copy All
          </button>
          <button class="btn-delete-thread" data-thread-id="${thread.id}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            Delete
          </button>
        </div>
      `;
      
      return card;
    },
    
    bindEvents(container) {
      // Back button
      const backBtn = container.querySelector('#thread-lib-back');
      if (backBtn) {
        backBtn.addEventListener('click', () => {
          if (window.TabTalkNavigation && window.TabTalkNavigation.showView) {
            window.TabTalkNavigation.showView('chat');
          }
        });
      }
      
      // Search
      const searchInput = container.querySelector('#thread-search');
      if (searchInput) {
        searchInput.addEventListener('input', this.debounce(() => {
          this.searchThreads(searchInput.value);
        }, 300));
      }
      
      // Delegate events for thread cards
      const list = container.querySelector('#thread-list');
      if (list) {
        list.addEventListener('click', async (e) => {
          const target = e.target.closest('button');
          if (!target) return;
          
          const threadId = target.dataset.threadId;
          if (!threadId) return;
          
          if (target.classList.contains('btn-view-thread')) {
            await this.viewThread(threadId);
          } else if (target.classList.contains('btn-copy-thread')) {
            await this.copyThread(threadId, target);
          } else if (target.classList.contains('btn-delete-thread')) {
            await this.deleteThread(threadId, target);
          }
        });
      }
    },
    
    async viewThread(threadId) {
      const thread = await window.TabTalkStorage.getThread(threadId);
      if (!thread) return;
      
      // Show thread detail view (you can enhance this later)
      alert(`Thread: ${thread.title}\n\nTweets:\n${thread.tweets.map((t, i) => `${i + 1}. ${t.content}`).join('\n\n')}`);
    },
    
    async copyThread(threadId, button) {
      const thread = await window.TabTalkStorage.getThread(threadId);
      if (!thread) return;
      
      try {
        const allTweetsText = thread.tweets.map((tweet, index) => {
          return `${index + 1}/${thread.totalTweets}:\n${tweet.content}`;
        }).join('\n\n---\n\n');
        
        await navigator.clipboard.writeText(allTweetsText);
        
        const originalText = button.innerHTML;
        button.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          Copied!
        `;
        button.classList.add('success');
        
        setTimeout(() => {
          button.innerHTML = originalText;
          button.classList.remove('success');
        }, 2000);
      } catch (error) {
        console.error('Copy failed:', error);
        alert('Failed to copy thread');
      }
    },
    
    async deleteThread(threadId, button) {
      if (!confirm('Delete this thread? This cannot be undone.')) return;
      
      const success = await window.TabTalkStorage.deleteThread(threadId);
      if (success) {
        const card = button.closest('.thread-library-card');
        if (card) {
          card.style.animation = 'slideOutRight 0.3s ease';
          setTimeout(() => card.remove(), 300);
        }
      }
    },
    
    async searchThreads(query) {
      const list = document.querySelector('#thread-list');
      if (!list) return;
      
      const threads = await window.TabTalkStorage.getAllThreads();
      const threadArray = Object.values(threads);
      
      const filtered = threadArray.filter(thread => {
        const searchText = query.toLowerCase();
        return (
          thread.title?.toLowerCase().includes(searchText) ||
          thread.domain?.toLowerCase().includes(searchText) ||
          thread.tweets.some(t => t.content.toLowerCase().includes(searchText))
        );
      });
      
      list.innerHTML = '';
      
      if (filtered.length === 0) {
        list.innerHTML = `
          <div class="empty-state">
            <p>No threads found for "${this.escapeHtml(query)}"</p>
          </div>
        `;
        return;
      }
      
      filtered.forEach(thread => {
        const card = this.createThreadCard(thread);
        list.appendChild(card);
      });
    },
    
    formatTimeAgo(timestamp) {
      const seconds = Math.floor((Date.now() - timestamp) / 1000);
      if (seconds < 60) return 'Just now';
      if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
      if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
      if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
      return new Date(timestamp).toLocaleDateString();
    },
    
    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    },
    
    debounce(func, wait) {
      let timeout;
      return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
      };
    }
  };
  
  window.TabTalkThreadLibrary = ThreadLibrary;
})();
