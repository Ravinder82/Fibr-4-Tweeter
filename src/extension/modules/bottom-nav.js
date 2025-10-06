(function() {
  const BottomNav = {
    currentView: 'chat',

    init() {
      this.bindEvents();
      this.updateActiveState('chat');
    },

    bindEvents() {
      const navItems = document.querySelectorAll('.nav-item');
      
      navItems.forEach(item => {
        item.addEventListener('click', (e) => {
          e.preventDefault();
          const view = item.getAttribute('data-view');
          this.navigateToView(view);
        });
      });
    },

    navigateToView(viewName) {
      // Use the existing navigation system
      if (window.TabTalkNavigation && window.TabTalkNavigation.showView) {
        window.TabTalkNavigation.showView(viewName);
      }
      
      this.updateActiveState(viewName);
      this.currentView = viewName;
    },

    updateActiveState(viewName) {
      const navItems = document.querySelectorAll('.nav-item');
      
      navItems.forEach(item => {
        const itemView = item.getAttribute('data-view');
        if (itemView === viewName) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
    },

    // Show/hide bottom nav based on current view
    toggleVisibility(show) {
      const bottomNav = document.getElementById('bottom-nav');
      if (bottomNav) {
        bottomNav.style.display = show ? 'flex' : 'none';
      }
    },

    // Update active state from external navigation
    setActive(viewName) {
      this.updateActiveState(viewName);
      this.currentView = viewName;
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => BottomNav.init());
  } else {
    BottomNav.init();
  }

  // Make it globally available
  window.BottomNav = BottomNav;
})();
