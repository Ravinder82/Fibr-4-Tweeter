(function() {
  const COMMENT_TONES = [
    {
      id: 'comment-praise',
      name: 'Praise',
      icon: '👏',
      color: 'var(--accent-color)',
      category: 'positive',
      description: 'Celebrate the win with concrete proof points.',
      aiInstructions: `TONE: Praise

MISSION: Deliver genuine, operator-level praise for the product, idea, or post. Make people feel seen and understood.

NON-NEGOTIABLE RULES:

- Study the analysis to surface the single most impressive outcome, feature, or insight.
- Reference at least one concrete proof from the source (specific metric, quote, shipped feature, user outcome, market signal).
- Speak like a peer who recognizes authentic excellence—no generic marketing fluff or hollow hype.
- Make the praise *actionable* by highlighting why it matters (impact, momentum, market position, user value).
- Keep it punchy: 2–4 tightly written sentences, no emoji spam (max 1 if it feels authentic).
- Do not pivot into suggestions, criticism, or requests—stay firmly in genuine celebration mode.
- Show you understand the work and effort behind what you're praising.
- Let your enthusiasm be real, grounded, and specific.`,
    },
    {
      id: 'comment-ask',
      name: 'Ask',
      icon: '❓',
      color: 'var(--accent-medium)',
      category: 'inquisitive',
      description: 'Probe for specs, roadmap, or technical depth.',
      aiInstructions: `TONE: Ask

MISSION: Ask a precise technical or product question that proves you studied the material deeply and care about understanding.

NON-NEGOTIABLE RULES:

- Use the analysis to set context in one short, natural clause (e.g., "That latency drop…," "The way you…").
- Anchor the question in a specific feature, metric, or claim mentioned in the content.
- Ask 1–2 sharp questions that reveal genuine curiosity about implementation, roadmap, edge cases, or implications.
- Sound respectful and collaborative—curious, not aggressive; genuinely interested, not interrogating.
- Offer a quick reason why the answer matters to you (performance, user adoption, security, UX, market timing, etc.).
- Keep it to 2–4 sentences total, ending with the question—no extra fluff or CTA.
- Show you're thinking like someone in the domain, not an outsider.
- Make the question specific enough that only someone who built this could answer well.`,
    }
  ];

  const CommentsModal = {
    selectedTone: null,
    appInstance: null,

    init: function() {
      this.createModalEvents();
      this.populateCommentTones();
    },

    showWithContentLoading: async function(appInstance) {
      this.appInstance = appInstance;

      if (!appInstance.pageContent || !appInstance.apiKey) {
        if (appInstance.apiKey) {
          await appInstance.getAndCachePageContent();
        } else {
          this.showToast('❌ Please set up your Gemini API key first.', 3000);
          return;
        }
      }

      this.showModal();
    },

    createModalEvents: function() {
      const closeBtn = document.querySelector('.comments-modal-close');
      const overlay = document.querySelector('#comments-modal .tone-modal-overlay');
      const cancelBtn = document.getElementById('comments-cancel-btn');
      const generateBtn = document.getElementById('comments-generate-btn');

      closeBtn?.addEventListener('click', () => this.hideModal());
      overlay?.addEventListener('click', () => this.hideModal());
      cancelBtn?.addEventListener('click', () => this.hideModal());
      generateBtn?.addEventListener('click', () => this.handleGenerate());

      document.addEventListener('keydown', (event) => {
        const modal = document.getElementById('comments-modal');
        if (event.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
          this.hideModal();
        }
      });
    },

    populateCommentTones: function() {
      const toneGrid = document.querySelector('#comments-modal .tone-grid');
      if (!toneGrid) return;

      toneGrid.innerHTML = COMMENT_TONES.map((tone) => `
        <div class="tone-option comments-tone-option"
             data-tone-id="${tone.id}"
             role="radio"
             aria-checked="false"
             tabindex="0">
          <div class="tone-icon">${tone.icon}</div>
          <div class="tone-info">
            <div class="tone-name">${tone.name}</div>
            <div class="tone-description">${tone.description}</div>
          </div>
          <div class="tone-check">✓</div>
        </div>
      `).join('');

      const toneOptions = toneGrid.querySelectorAll('.comments-tone-option');
      toneOptions.forEach((option) => {
        option.addEventListener('click', () => this.selectTone(option));
        option.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.selectTone(option);
          }
        });
      });
    },

    showModal: function() {
      const modal = document.getElementById('comments-modal');
      if (!modal) return;

      modal.classList.remove('hidden');
      modal.removeAttribute('aria-hidden');
      modal.removeAttribute('inert');

      setTimeout(() => {
        const firstTone = modal.querySelector('.comments-tone-option');
        firstTone?.focus();
      }, 50);
    },

    hideModal: function() {
      const modal = document.getElementById('comments-modal');
      if (!modal) return;

      modal.classList.add('hidden');
      modal.setAttribute('aria-hidden', 'true');
      modal.setAttribute('inert', '');
      this.resetSelections();
    },

    selectTone: function(option) {
      const allOptions = document.querySelectorAll('.comments-tone-option');
      allOptions.forEach((opt) => {
        opt.classList.remove('selected');
        opt.setAttribute('aria-checked', 'false');
      });

      option.classList.add('selected');
      option.setAttribute('aria-checked', 'true');

      const toneId = option.dataset.toneId;
      this.selectedTone = COMMENT_TONES.find((tone) => tone.id === toneId) || null;

      const generateBtn = document.getElementById('comments-generate-btn');
      if (generateBtn) {
        generateBtn.disabled = !this.selectedTone;
      }
    },

    resetSelections: function() {
      this.selectedTone = null;
      const allOptions = document.querySelectorAll('.comments-tone-option');
      allOptions.forEach((opt) => {
        opt.classList.remove('selected');
        opt.setAttribute('aria-checked', 'false');
      });

      const generateBtn = document.getElementById('comments-generate-btn');
      if (generateBtn) {
        generateBtn.disabled = true;
      }
    },

    handleGenerate: async function() {
      if (!this.selectedTone) {
        this.showToast('❌ Please select a tone first.', 2000);
        return;
      }

      if (!this.appInstance) {
        this.showToast('❌ App not initialized.', 3000);
        return;
      }

      const toneToUse = this.selectedTone;
      this.hideModal();

      // Content is already cleared by resetScreenForGeneration() called before modal opened
      // No need for selective clearing here

      try {
        if (window.TabTalkTwitter && typeof window.TabTalkTwitter.generateCommentReplyWithTone === 'function') {
          await window.TabTalkTwitter.generateCommentReplyWithTone.call(this.appInstance, toneToUse);
        } else if (typeof this.appInstance.generateCommentReplyWithTone === 'function') {
          await this.appInstance.generateCommentReplyWithTone(toneToUse);
        } else {
          throw new Error('Comment reply generator not available');
        }
      } catch (error) {
        console.error('TabTalk AI: Failed to generate comment reply', error);
        this.showToast(`❌ Comment generation failed: ${error.message}`, 4000);
      }
    },

    showToast: function(message, duration = 3000) {
      if (window.TabTalkUI?.showToast) {
        window.TabTalkUI.showToast(message, duration);
      } else {
        console.log('Toast:', message);
      }
    }
  };

  window.TabTalkCommentsModal = CommentsModal;
  window.FibrCommentsModal = CommentsModal; // Fibr alias

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => CommentsModal.init());
  } else {
    CommentsModal.init();
  }
})();
