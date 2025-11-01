(function() {
  const FloatingNav = {
    currentView: 'chat',
    buttons: null,
    container: null,

    init() {
      this.container = document.getElementById('floating-nav');
      this.buttons = Array.from(document.querySelectorAll('.floating-nav-btn'));

      if (!this.container || this.buttons.length === 0) {
        return;
      }

      this.bindEvents();
      this.updateActiveState(this.currentView);
    },

    bindEvents() {
      this.buttons.forEach(button => {
        button.addEventListener('click', (event) => {
          event.preventDefault();
          const view = button.getAttribute('data-view');
          if (view) {
            this.navigateToView(view);
          }
        });
      });
    },

    navigateToView(viewName) {
      if (window.TabTalkNavigation && typeof window.TabTalkNavigation.showView === 'function') {
        window.TabTalkNavigation.showView(viewName);
      }

      this.updateActiveState(viewName);
      this.currentView = viewName;
    },

    updateActiveState(viewName) {
      if (!this.buttons) return;

      this.buttons.forEach(button => {
        const buttonView = button.getAttribute('data-view');
        if (buttonView === viewName) {
          button.classList.add('active');
        } else {
          button.classList.remove('active');
        }
      });
    },

    toggleVisibility(show) {
      if (!this.container) return;
      this.container.style.display = show ? 'flex' : 'none';
      this.container.style.visibility = show ? 'visible' : 'hidden';
      this.container.style.opacity = show ? '1' : '0';
    },

    setActive(viewName) {
      this.updateActiveState(viewName);
      this.currentView = viewName;
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => FloatingNav.init());
  } else {
    FloatingNav.init();
  }

  window.BottomNav = FloatingNav;
})();
