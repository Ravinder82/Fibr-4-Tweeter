(function() {
  const NicheManager = {
    STORAGE_KEY: 'niche_system',
    currentNiche: null,

    // Initialize niche system
    async init() {
      await this.loadNicheData();
      this.bindEvents();
    },

    // Load niche data from storage
    async loadNicheData() {
      try {
        const data = await this.getStorageItem(this.STORAGE_KEY);
        if (data) {
          this.currentNiche = data.currentNiche;
          console.log('Niche system loaded:', this.currentNiche);
        }
      } catch (error) {
        console.error('Failed to load niche data:', error);
      }
    },

    // Save niche data to storage
    async saveNicheData() {
      try {
        const data = {
          currentNiche: this.currentNiche,
          lastUpdated: Date.now()
        };
        await this.setStorageItem(this.STORAGE_KEY, data);
      } catch (error) {
        console.error('Failed to save niche data:', error);
      }
    },

    // Set current niche
    async setNiche(nicheDescription) {
      if (!nicheDescription || nicheDescription.trim().length === 0) {
        throw new Error('Niche description cannot be empty');
      }

      this.currentNiche = {
        description: nicheDescription.trim(),
        createdAt: Date.now(),
        id: this.generateId()
      };

      await this.saveNicheData();
      console.log('Niche set to:', this.currentNiche);
      return this.currentNiche;
    },

    // Get current niche
    getCurrentNiche() {
      return this.currentNiche;
    },

    // Check if niche is set
    hasNiche() {
      return this.currentNiche !== null;
    },

    // Clear current niche
    async clearNiche() {
      this.currentNiche = null;
      await this.saveNicheData();
      console.log('Niche cleared');
    },

    // Generate unique ID for niche
    generateId() {
      return 'niche_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
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
    },

    // Event binding for niche UI
    bindEvents() {
      // Will be called when niche UI is rendered
    }
  };

  // Make it globally available
  window.NicheManager = NicheManager;
})();
