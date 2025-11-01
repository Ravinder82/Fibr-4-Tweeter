(function() {
  /**
   * Cursor Trails Empty State Animation Module
   * Displays an interactive grid that reacts to cursor hover, using CSS custom properties
   */
  const CursorTrails = {
    container: null,
    isVisible: false,
    gridEl: null,
    _resizeHandler: null,
    _ro: null,

    init(appInstance) {
      this.app = appInstance;
      console.log('CursorTrails: Initialized');
    },

    /**
     * Calculate columns and rows to fill the visible area of the messages container.
     */
    _calcGridSize(container, cellSize = 12, gap = 4) {
      const paddingX = 24; // lighter padding for tighter fit
      const paddingY = 32; // reduce to use more vertical space
      const w = Math.max(0, (container?.clientWidth || 0) - paddingX);
      const h = Math.max(0, (container?.clientHeight || 0) - paddingY);
      const cols = Math.max(6, Math.floor(w / (cellSize + gap)));
      const rows = Math.max(10, Math.floor(h / (cellSize + gap)));
      return { cols, rows, cellSize, gap };
    },

    /**
     * Build the grid element with <div> cells sized to the container.
     */
    buildGrid(messagesContainer) {
      const gridWrapper = document.createElement('div');
      gridWrapper.className = 'cursor-trails-board';

      const grid = document.createElement('div');
      grid.className = 'cursor-trails-grid';

      const { cols, rows, cellSize, gap } = this._calcGridSize(messagesContainer);
      grid.style.setProperty('--cols', String(cols));
      grid.style.setProperty('--cell-size', `${cellSize}px`);
      grid.style.setProperty('--gap', `${gap}px`);

      const total = cols * rows;
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
      this.gridEl = grid;
      return gridWrapper;
    },

    _reflow() {
      if (!this.isVisible || !this.container || !this.gridEl) return;
      const messagesContainer = document.getElementById('messages-container');
      const { cols, rows, cellSize, gap } = this._calcGridSize(messagesContainer);
      const desiredTotal = cols * rows;

      // Update style vars
      this.gridEl.style.setProperty('--cols', String(cols));
      this.gridEl.style.setProperty('--cell-size', `${cellSize}px`);
      this.gridEl.style.setProperty('--gap', `${gap}px`);

      // Adjust number of cells
      const current = this.gridEl.children.length;
      if (current < desiredTotal) {
        for (let i = current; i < desiredTotal; i++) {
          const cell = document.createElement('div');
          const opacity = (Math.random() * 0.25 + 0.05).toFixed(2);
          const rotations = Math.floor(Math.random() * 4);
          cell.style.setProperty('--o', opacity);
          cell.style.setProperty('--r', rotations);
          this.gridEl.appendChild(cell);
        }
      } else if (current > desiredTotal) {
        for (let i = current - 1; i >= desiredTotal; i--) {
          this.gridEl.removeChild(this.gridEl.lastElementChild);
        }
      }
    },

    show() {
      if (this.isVisible) return;

      const messagesContainer = document.getElementById('messages-container');
      if (!messagesContainer) return;

      // Ensure truly empty (no cards/progress)
      const hasContent = messagesContainer.querySelector('.twitter-content-container, .twitter-card, .progress-container');
      if (hasContent) return;

      this.container = this.buildGrid(messagesContainer);
      messagesContainer.appendChild(this.container);
      this.isVisible = true;
      this._reflow();

      // Handle container changes: window resize + ResizeObserver on messages container
      this._resizeHandler = () => this._reflow();
      window.addEventListener('resize', this._resizeHandler, { passive: true });
      if ('ResizeObserver' in window) {
        const messagesContainer = document.getElementById('messages-container');
        if (messagesContainer) {
          this._ro = new ResizeObserver(() => this._reflow());
          this._ro.observe(messagesContainer);
        }
      }
      console.log('CursorTrails: Shown');
    },

    hide() {
      if (!this.isVisible || !this.container) return;
      if (this._resizeHandler) {
        window.removeEventListener('resize', this._resizeHandler);
        this._resizeHandler = null;
      }
      if (this._ro) {
        try { this._ro.disconnect(); } catch {}
        this._ro = null;
      }
      this.container.remove();
      this.container = null;
      this.gridEl = null;
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
