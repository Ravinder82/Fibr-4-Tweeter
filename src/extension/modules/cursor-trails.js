(function() {
  /**
   * Cursor Trails Empty State Animation Module
   * Displays an interactive grid that reacts to cursor hover, using CSS custom properties
   */
  const CursorTrails = {
    container: null,
    isVisible: false,
    GRID_SIZE: 18, // number of columns (auto rows)

    init(appInstance) {
      this.app = appInstance;
      console.log('CursorTrails: Initialized');
    },

    /**
     * Build the grid element with <div> cells.
     */
    buildGrid() {
      const gridWrapper = document.createElement('div');
      gridWrapper.className = 'cursor-trails-board';

      const grid = document.createElement('div');
      grid.className = 'cursor-trails-grid';

      // Create ~ GRID_SIZE² cells (capped to ~400 for perf)
      const total = Math.min(this.GRID_SIZE * this.GRID_SIZE, 400);
      for (let i = 0; i < total; i++) {
        const cell = document.createElement('div');
        // Randomize per-cell opacity/rotation vars for subtle variation
        const opacity = (Math.random() * 0.25 + 0.05).toFixed(2); // 0.05-0.30
        const rotations = Math.floor(Math.random() * 4); // 0-3 quarter-turns
        cell.style.setProperty('--o', opacity);
        cell.style.setProperty('--r', rotations);
        grid.appendChild(cell);
      }

      gridWrapper.appendChild(grid);
      return gridWrapper;
    },

    show() {
      if (this.isVisible) return;

      const messagesContainer = document.getElementById('messages-container');
      if (!messagesContainer) return;

      // Ensure truly empty (no cards/progress)
      const hasContent = messagesContainer.querySelector('.twitter-content-container, .twitter-card, .progress-container');
      if (hasContent) return;

      this.container = this.buildGrid();
      messagesContainer.appendChild(this.container);
      this.isVisible = true;
      console.log('CursorTrails: Shown');
    },

    hide() {
      if (!this.isVisible || !this.container) return;
      this.container.remove();
      this.container = null;
      this.isVisible = false;
      console.log('CursorTrails: Hidden');
    },

    updateTheme(theme) {
      // Nothing to do – uses CSS variables
    },
  };

  window.FibrCursorTrails = CursorTrails;
  window.TabTalkCursorTrails = CursorTrails;
})();
