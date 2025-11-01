/**
 * Empty State Module - Board Animation for Home Page
 * Displays "Grow with Fibr" marquee when messages container is empty
 */
// Removed Empty State animation module - replaced by CursorTrails

/*
  const EmptyState = {
    container: null,
    isVisible: false,

    init: function(appInstance) {
      this.app = appInstance;
      console.log('EmptyState: Initialized');
    },

    show: function() {
      if (this.isVisible) return;
      
      const messagesContainer = document.getElementById('messages-container');
      if (!messagesContainer) return;

      // Only show if container is truly empty (no cards)
      const hasContent = messagesContainer.querySelector('.twitter-content-container, .twitter-card, .progress-container');
      if (hasContent) return;

      this.container = document.createElement('div');
      this.container.className = 'empty-state-board';
      this.container.innerHTML = `
        <div class="board-container">
          <div class="board">
            <div class="board__content">
              <div class="text-track">
                <div class="text">Grow with Fibr</div>
                <div class="text">Grow with Fibr</div>
              </div>
            </div>
          </div>
        </div>
      `;

      messagesContainer.appendChild(this.container);
      this.isVisible = true;
      console.log('EmptyState: Shown');
    },

    hide: function() {
      if (!this.isVisible || !this.container) return;
      
      if (this.container.parentNode) {
        this.container.remove();
      }
      this.container = null;
      this.isVisible = false;
      console.log('EmptyState: Hidden');
    },

    updateTheme: function(theme) {
      // Theme handled by CSS variables automatically
      console.log('EmptyState: Theme updated to', theme);
    }
  };

  window.FibrEmptyState = EmptyState;
  window.TabTalkEmptyState = EmptyState;
})();
*/
