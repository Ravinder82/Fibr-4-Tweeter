(function() {
  const Storage = {
    async getStorageItem(key) {
      try {
        const data = await chrome.storage.local.get([key]);
        return data ? data[key] : undefined;
      } catch (error) {
        console.error('getStorageItem error:', error);
        return undefined;
      }
    },

    async setStorageItem(key, value) {
      try {
        await chrome.storage.local.set({ [key]: value });
        return true;
      } catch (error) {
        console.error('setStorageItem error:', error);
        return false;
      }
    },

    async loadState() {
      try {
        const data = await chrome.storage.local.get(['geminiApiKey', 'apiKey']);
        console.log('Fibr: Loading state, API key exists:', !!data.geminiApiKey);
        if (data.geminiApiKey || data.apiKey) {
          this.apiKey = data.geminiApiKey || data.apiKey;
          console.log('Fibr: API key loaded successfully');
          if (this.apiKeyInput) this.apiKeyInput.value = this.apiKey;
        }
        if (this.currentTab) {
          const url = new URL(this.currentTab.url);
          this.currentDomain = url.hostname;
          if (this.pageTitle) {
            this.pageTitle.textContent = this.currentTab.title || 'Untitled Page';
            console.log('Fibr: Page title set to:', this.pageTitle.textContent);
          }
        }
        return data;
      } catch (error) {
        console.error('Failed to load state:', error);
        throw error;
      }
    },

    async saveState() {
      // Minimal state save - only API key
      if (this.apiKey) {
        await chrome.storage.local.set({ geminiApiKey: this.apiKey });
      }
    },

    async saveApiKey(apiKey) {
      this.apiKey = apiKey;
      try {
        await chrome.storage.local.set({ geminiApiKey: apiKey, apiKey, hasSeenWelcome: true });
        console.log('Fibr: API key saved');
      } catch (e) {
        await this.setStorageItem('apiKey', apiKey);
        await this.setStorageItem('hasSeenWelcome', true);
      }
    },


    async handleDeleteApiKey() {
      if (!confirm('Delete your API key? You will need to set it up again.')) return;
      try {
        await chrome.storage.local.remove(['geminiApiKey', 'apiKey']);
        this.apiKey = null;
        if (this.apiKeyInput) this.apiKeyInput.value = '';
        // Reset in-memory state and UI
        this.pageContent = null;
        // Hide quick actions and clear messages area
        if (this.updateQuickActionsVisibility) this.updateQuickActionsVisibility();
        if (this.messagesContainer) this.messagesContainer.innerHTML = '';
        // Reset onboarding flag and show welcome view
        await this.setStorageItem('hasSeenWelcome', false);
        this.showView('welcome');
        console.log('Fibr: API key deleted');
      } catch (error) {
        console.error('Error deleting API key:', error);
        alert('Error deleting API key. Please try again.');
      }
    },
    
    // NEW: Saved Content Methods
    async getSavedContent() {
      const result = await this.getStorageItem('savedContent');
      return result || {};
    },
    
    async saveContent(category, contentData) {
      const savedContent = await this.getSavedContent();
      if (!savedContent[category]) savedContent[category] = [];
      
      const item = {
        // Use provided id if present (so threads can keep stable IDs)
        id: contentData && contentData.id ? contentData.id : Date.now().toString(),
        ...contentData,
        // Prefer existing timestamps when migrating; otherwise set now
        timestamp: contentData && contentData.timestamp ? contentData.timestamp : Date.now()
      };
      
      // If item with same id exists, update in-place; else unshift
      const idx = savedContent[category].findIndex(i => i.id === item.id);
      if (idx >= 0) {
        savedContent[category][idx] = { ...savedContent[category][idx], ...item, updatedAt: Date.now() };
      } else {
        // Add to beginning of array (most recent first)
        savedContent[category].unshift(item);
      }
      
      // Enforce a GLOBAL cap of 50 items across all categories
      const flatten = [];
      for (const [cat, arr] of Object.entries(savedContent)) {
        if (!Array.isArray(arr)) continue;
        for (let i = 0; i < arr.length; i++) {
          flatten.push({ cat: cat, idx: i, item: arr[i] });
        }
      }
      // Sort newest first by updatedAt then timestamp
      flatten.sort((a, b) => ((b.item.updatedAt || b.item.timestamp || 0) - (a.item.updatedAt || a.item.timestamp || 0)));
      if (flatten.length > 50) {
        const keepSet = new Set(flatten.slice(0, 50).map(x => `${x.cat}:${x.item.id}`));
        for (const [cat, arr] of Object.entries(savedContent)) {
          if (!Array.isArray(arr)) continue;
          savedContent[cat] = arr.filter(it => keepSet.has(`${cat}:${it.id}`));
        }
      }
      
      await this.setStorageItem('savedContent', savedContent);
      console.log(`Fibr: Content saved to ${category} category`);
      return item.id;
    },
    
    async deleteSavedContent(category, itemId) {
      const savedContent = await this.getSavedContent();
      if (savedContent[category]) {
        savedContent[category] = savedContent[category].filter(item => item.id !== itemId);
        await this.setStorageItem('savedContent', savedContent);
        console.log(`Fibr: Content deleted from ${category} category`);
      }
    },
    
    // Bulk delete: remove every item from a specific category
    async clearSavedCategory(category) {
      const savedContent = await this.getSavedContent();
      if (savedContent && Object.prototype.hasOwnProperty.call(savedContent, category)) {
        savedContent[category] = [];
        await this.setStorageItem('savedContent', savedContent);
        console.log(`Fibr: Cleared all saved items in category ${category}`);
      }
    },
    
    // Bulk delete: remove all saved content across categories
    async clearAllSaved() {
      await this.setStorageItem('savedContent', {});
      console.log('Fibr: Cleared all saved content across all categories');
    },
    
    async isContentSaved(category, contentId) {
      const savedContent = await this.getSavedContent();
      return savedContent[category]?.some(item => item.id === contentId) || false;
    },
    
    // One-time migration: move savedThreads -> savedContent['twitter'] as type 'thread'
    async migrateThreadsToGallery() {
      try {
        const already = await this.getStorageItem('threadsMigratedToGallery');
        if (already) return;

        const threads = await this.getStorageItem('savedThreads') || {};
        const threadList = Object.values(threads);
        if (!threadList.length) {
          await this.setStorageItem('threadsMigratedToGallery', true);
          return;
        }

        const saved = await this.getSavedContent();
        if (!Array.isArray(saved.twitter)) saved.twitter = [];

        const existingIds = new Set(saved.twitter.map(i => i.id));
        for (const t of threadList) {
          const combined = (t.rawContent && String(t.rawContent).trim()) || (Array.isArray(t.tweets) ? t.tweets.map(x => x.content).join('\n\n') : '');
          const item = {
            id: t.id,
            type: 'thread',
            platform: 'thread',
            title: t.title || 'Untitled Thread',
            url: t.url || '',
            domain: t.domain || '',
            tweets: Array.isArray(t.tweets) ? t.tweets : [],
            totalTweets: t.totalTweets || (Array.isArray(t.tweets) ? t.tweets.length : 0),
            totalChars: t.totalChars,
            content: combined,
            isAutoSaved: !!t.isAutoSaved,
            timestamp: t.createdAt || Date.now(),
            updatedAt: t.updatedAt || t.createdAt || Date.now()
          };
          if (!existingIds.has(item.id)) {
            saved.twitter.unshift(item);
          }
        }

        // Enforce GLOBAL cap of 50 across all categories after migration
        const flatten = [];
        for (const [cat, arr] of Object.entries(saved)) {
          if (!Array.isArray(arr)) continue;
          for (let i = 0; i < arr.length; i++) {
            flatten.push({ cat: cat, idx: i, item: arr[i] });
          }
        }
        flatten.sort((a, b) => ((b.item.updatedAt || b.item.timestamp || 0) - (a.item.updatedAt || a.item.timestamp || 0)));
        if (flatten.length > 50) {
          const keepSet = new Set(flatten.slice(0, 50).map(x => `${x.cat}:${x.item.id}`));
          for (const [cat, arr] of Object.entries(saved)) {
            if (!Array.isArray(arr)) continue;
            saved[cat] = arr.filter(it => keepSet.has(`${cat}:${it.id}`));
          }
        }
        await this.setStorageItem('savedContent', saved);

        // Clean up old storage and set migration flag
        try { await chrome.storage.local.remove(['savedThreads']); } catch {}
        await this.setStorageItem('threadsMigratedToGallery', true);
        console.log('Fibr: Migrated savedThreads to Gallery savedContent');
      } catch (e) {
        console.error('Migration threads->gallery failed', e);
      }
    }
  };
  window.FibrStorage = Storage;
})();
