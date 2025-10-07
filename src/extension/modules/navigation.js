(function() {
  const Navigation = {
    showView: function(viewName) {
      const views = document.querySelectorAll('.view');
      views.forEach(v => v.classList.add('hidden'));
      
      // Add/remove body class for onboarding views (CSS fallback)
      const isOnboarding = (viewName === 'welcome' || viewName === 'api-setup' || viewName === 'settings');
      if (isOnboarding) {
        document.body.classList.add('onboarding-view');
      } else {
        document.body.classList.remove('onboarding-view');
      }
      
      // Update bottom nav active state
      if (window.BottomNav) {
        window.BottomNav.setActive(viewName);
      }
      
      // Show/hide quick actions based on view
      const quickActions = document.getElementById('quick-actions');
      if (quickActions) {
        if (viewName === 'chat') {
          quickActions.classList.remove('hidden');
        } else {
          quickActions.classList.add('hidden');
        }
      }
      
      // Show/hide bottom nav and adjust container/main padding based on view
      const bottomNav = document.getElementById('bottom-nav');
      const mainContent = document.querySelector('main');
      const container = document.querySelector('.container');
      
      if (viewName === 'welcome' || viewName === 'api-setup' || viewName === 'settings') {
        if (bottomNav) {
          bottomNav.style.display = 'none';
          bottomNav.style.visibility = 'hidden';
          bottomNav.style.height = '0';
        }
        if (mainContent) mainContent.style.paddingBottom = '0';
        if (container) container.style.paddingBottom = '0'; // Remove bottom padding from container
      } else {
        if (bottomNav) {
          bottomNav.style.display = 'flex';
          bottomNav.style.visibility = 'visible';
          bottomNav.style.height = '45px';
        }
        if (mainContent) mainContent.style.paddingBottom = '45px';
        if (container) container.style.paddingBottom = '66px'; // Restore bottom padding for nav
      }
      
      let targetId = `${viewName}-view`;
      if (viewName === 'chat') targetId = 'chat-view';
      if (viewName === 'settings') targetId = 'settings-view';
      if (viewName === 'welcome') targetId = 'welcome-view';
      if (viewName === 'api-setup') targetId = 'api-setup-view';
      if (viewName === 'history') targetId = 'history-view';
      if (viewName === 'gallery') targetId = 'gallery-view';
      if (viewName === 'threads') targetId = 'threads-view';
      const target = document.getElementById(targetId);
      if (target) {
        target.classList.remove('hidden');
        
        // Special handling for history view
        if (viewName === 'history' && window.historyManager) {
          this.loadHistoryView();
        }
        // Special handling for gallery view
        if (viewName === 'gallery' && window.galleryManager) {
          const container = document.getElementById('gallery-container');
          if (container) {
            // Default category: twitter
            window.galleryManager.render(container, 'twitter');
          }
        }
        // Special handling for threads view
        if (viewName === 'threads' && window.TabTalkThreadLibrary) {
          const container = document.getElementById('threads-container');
          if (container) {
            window.TabTalkThreadLibrary.render(container);
          }
        }
        // Special handling for thread-generator view
        if (viewName === 'thread-generator' && this.initializeHowItWorksToggle) {
          this.initializeHowItWorksToggle();
        }
        // Special handling for memory-builder view
        if (viewName === 'memory-builder' && window.MemoryBuilderUI) {
          window.MemoryBuilderUI.init();
        }
      } else {
        console.warn(`showView: target view not found for "${viewName}" (id "${targetId}")`);
      }
    },
    
    // Load history view content
    loadHistoryView: function() {
      if (!window.historyManager) {
        console.error('History manager not initialized');
        return;
      }
      
      const historyList = document.getElementById('history-list');
      if (!historyList) return;
      
      // Show loading state
      historyList.innerHTML = '<div class="loading-history">Loading saved content...</div>';
      
      // Load history items
      window.historyManager.loadHistory('all')
        .then(items => {
          window.historyManager.renderHistoryList(historyList, items, 'all');
        })
        .catch(err => {
          console.error('Error loading history:', err);
          historyList.innerHTML = '<div class="empty-history">Error loading saved content</div>';
        });
    },

    updateViewState: function(state, statusMessage = 'Loading...') {
      if (this.sidebar) {
        this.sidebar.classList.add('hidden');
        this.sidebar.style.display = 'none';
      }
      Object.values(this.views).forEach(view => view.classList.add('hidden'));
      if (this.views[state]) {
        this.views[state].classList.remove('hidden');
        if (state === 'chat' && this.messageInput) {
          this.messageInput.focus();
        } else if (state === 'settings' && this.apiKeyInput) {
          this.apiKeyInput.focus();
        }
      } else {
        console.error(`View "${state}" not found`);
      }
      if (state === 'status' && this.statusText) {
        this.statusText.textContent = statusMessage;
      }
      if (state === 'settings') {
        const onboardingInfo = document.querySelector('.onboarding-info');
        if (onboardingInfo) onboardingInfo.style.display = this.apiKey ? 'none' : 'block';
      }
      this.setAriaStatus(`Switched to ${state} view. ${statusMessage}`);
    }
  };
  
  window.TabTalkNavigation = Navigation;
})();
