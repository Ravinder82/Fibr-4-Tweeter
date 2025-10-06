(function() {
  const MemoryManager = {
    STORAGE_KEY: 'ai_memory',
    MAX_ITEMS_PER_NICHE: 50, // Limit to manage storage
    SUMMARY_MAX_LENGTH: 500, // Max characters per summary

    // Initialize memory system
    async init() {
      await this.cleanupStorage();
    },

    // Add memory item (URL or tweet)
    async addMemoryItem(type, content, metadata = {}) {
      try {
        if (!window.NicheManager.hasNiche()) {
          throw new Error('Please set a niche first');
        }

        const nicheId = window.NicheManager.getCurrentNiche().id;
        const memoryData = await this.getMemoryData();

        if (!memoryData.niches[nicheId]) {
          memoryData.niches[nicheId] = [];
        }

        // Check if we're at the limit
        if (memoryData.niches[nicheId].length >= this.MAX_ITEMS_PER_NICHE) {
          // Remove oldest non-viral item
          const nonViralItems = memoryData.niches[nicheId].filter(item => !item.isViral);
          if (nonViralItems.length > 0) {
            const oldestNonViral = nonViralItems[0];
            const index = memoryData.niches[nicheId].indexOf(oldestNonViral);
            memoryData.niches[nicheId].splice(index, 1);
          } else {
            throw new Error('Memory limit reached. Please mark some items as non-viral or upgrade for more storage.');
          }
        }

        const memoryItem = {
          id: this.generateId(),
          type: type, // 'url' or 'tweet'
          content: content,
          summary: await this.summarizeContent(content),
          metadata: metadata,
          isViral: false,
          createdAt: Date.now(),
          nicheId: nicheId
        };

        memoryData.niches[nicheId].unshift(memoryItem); // Add to beginning
        await this.saveMemoryData(memoryData);

        console.log('Memory item added:', memoryItem.id);
        return memoryItem;
      } catch (error) {
        console.error('Failed to add memory item:', error);
        throw error;
      }
    },

    // Mark item as viral
    async markAsViral(itemId) {
      const memoryData = await this.getMemoryData();
      const nicheId = window.NicheManager.getCurrentNiche().id;

      if (memoryData.niches[nicheId]) {
        const item = memoryData.niches[nicheId].find(item => item.id === itemId);
        if (item) {
          item.isViral = true;
          item.markedViralAt = Date.now();
          await this.saveMemoryData(memoryData);
          console.log('Item marked as viral:', itemId);
          return true;
        }
      }
      return false;
    },

    // Remove memory item
    async removeMemoryItem(itemId) {
      const memoryData = await this.getMemoryData();
      const nicheId = window.NicheManager.getCurrentNiche().id;

      if (memoryData.niches[nicheId]) {
        const index = memoryData.niches[nicheId].findIndex(item => item.id === itemId);
        if (index !== -1) {
          memoryData.niches[nicheId].splice(index, 1);
          await this.saveMemoryData(memoryData);
          console.log('Memory item removed:', itemId);
          return true;
        }
      }
      return false;
    },

    // Get memory items for current niche
    async getMemoryItems() {
      if (!window.NicheManager.hasNiche()) {
        return [];
      }

      const nicheId = window.NicheManager.getCurrentNiche().id;
      const memoryData = await this.getMemoryData();
      return memoryData.niches[nicheId] || [];
    },

    // Get smart context for AI prompts
    async getSmartContext(maxItems = 10) {
      const items = await this.getMemoryItems();
      if (items.length === 0) return '';

      // Prioritize viral content, then recent items
      const sortedItems = items.sort((a, b) => {
        if (a.isViral && !b.isViral) return -1;
        if (!a.isViral && b.isViral) return 1;
        return b.createdAt - a.createdAt;
      });

      const contextItems = sortedItems.slice(0, maxItems);
      const context = contextItems.map(item => `[${item.type.toUpperCase()}] ${item.summary}`).join('\n\n');

      return `Previous successful content in this niche:\n${context}`;
    },

    // Summarize content using basic extraction (free tier friendly)
    async summarizeContent(content) {
      // For free tier, we'll do basic text summarization
      // In a real implementation, this could use AI summarization
      const text = typeof content === 'string' ? content : content.text || content.title || '';

      if (text.length <= this.SUMMARY_MAX_LENGTH) {
        return text;
      }

      // Simple extractive summarization
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
      const keySentences = sentences.slice(0, 3); // Take first 3 sentences
      const summary = keySentences.join('. ').substring(0, this.SUMMARY_MAX_LENGTH);

      return summary + (text.length > this.SUMMARY_MAX_LENGTH ? '...' : '');
    },

    // Get memory data from storage
    async getMemoryData() {
      try {
        const data = await this.getStorageItem(this.STORAGE_KEY);
        return data || { niches: {}, lastCleanup: Date.now() };
      } catch (error) {
        console.error('Failed to get memory data:', error);
        return { niches: {}, lastCleanup: Date.now() };
      }
    },

    // Save memory data to storage
    async saveMemoryData(data) {
      try {
        await this.setStorageItem(this.STORAGE_KEY, data);
      } catch (error) {
        console.error('Failed to save memory data:', error);
        throw error;
      }
    },

    // Cleanup old data to manage storage limits
    async cleanupStorage() {
      try {
        const memoryData = await this.getMemoryData();
        const now = Date.now();
        const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);

        // Remove items older than 30 days (except viral ones)
        Object.keys(memoryData.niches).forEach(nicheId => {
          memoryData.niches[nicheId] = memoryData.niches[nicheId].filter(item => {
            return item.isViral || item.createdAt > thirtyDaysAgo;
          });
        });

        memoryData.lastCleanup = now;
        await this.saveMemoryData(memoryData);
        console.log('Memory cleanup completed');
      } catch (error) {
        console.error('Memory cleanup failed:', error);
      }
    },

    // Generate unique ID
    generateId() {
      return 'memory_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    // Storage helpers
    async getStorageItem(key) {
      try {
        const data = await chrome.storage.local.get([key]);
        return data[key];
      } catch (error) {
        console.error('getStorageItem error:', error);
        return null;
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
    }
  };

  // Make it globally available
  window.MemoryManager = MemoryManager;
})();
