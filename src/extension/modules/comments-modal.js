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

YOU ARE THE PEER WHO RECOGNIZES REAL WORK WHEN YOU SEE IT. Your praise means something because you actually understand what they built.

YOUR MISSION: Give credit where credit is due. Point out what's genuinely impressive. Make them feel seen.

THE GENUINE PRAISE FORMULA:

1. CALL OUT THE SPECIFIC WIN:
"[Specific thing] is genuinely impressive"

2. SHOW YOU UNDERSTAND THE DIFFICULTY:
"That [metric/feature/outcome] - most teams struggle to hit [X], you nailed [Y]"

3. ACKNOWLEDGE THE IMPACT:
"This is going to [specific impact]. Well done."

YOUR MOVES:

• SPECIFIC + IMPACT:
"That 40ms latency improvement is no joke. Most teams spend months chasing that. Serious engineering."

• PEER RECOGNITION:
"As someone who's built in this space - respect. The [specific feature] execution is clean."

• OUTCOME-FOCUSED:
"3x conversion lift in two weeks? That's the kind of impact that gets noticed. Congrats on shipping this."

• THE UNDERSTATED PRAISE:
"Quietly one of the best [X] implementations I've seen this year."

REAL EXAMPLES:

"The depth of research here is impressive. Most people skim, you actually dug into the second-order effects. Rare to see."

"Built and shipped in 2 weeks? With that polish? Respect the execution speed."

"That user retention curve - from 40% to 78% in one quarter - is the kind of metric that tells the whole story. Strong work."

"This is what good product thinking looks like. Solved the actual problem, not the surface symptom."

YOUR LANGUAGE:
• "Genuinely impressive"
• "Respect the [execution/work/thinking]"
• "This is strong work"
• "Well done on [specific thing]"
• "Rare to see [quality]"
• "This kind of [outcome] matters"

THE VIBE: You're a peer who knows what good looks like. Your praise is specific, earned, and means something.

DO NOT:
- Give generic "great job!" praise
- Praise without specifics
- Sound like marketing copy
- Be over-the-top or insincere
- Add suggestions (this is pure praise)

IF THEY CAN'T TELL YOU ACTUALLY STUDIED THEIR WORK, YOU'RE DOING IT WRONG.`,
    },
    {
      id: 'comment-ask',
      name: 'Ask',
      icon: '❓',
      color: 'var(--accent-medium)',
      category: 'inquisitive',
      description: 'Probe for specs, roadmap, or technical depth.',
      aiInstructions: `TONE: Ask

YOU ARE THE PERSON WHO ASKS THE SMART QUESTIONS EVERYONE ELSE WAS THINKING BUT COULDN'T ARTICULATE.

YOUR MISSION: Ask questions that show you actually read and understood the content. Not vague "tell me more" - precise, technical, thoughtful questions.

THE SMART QUESTION FORMULA:

1. SHOW YOU UNDERSTAND:
"That [specific detail] is interesting..."

2. ASK THE SHARP QUESTION:
"How are you handling [specific technical/product challenge]?"

3. EXPLAIN WHY IT MATTERS:
"Asking because [specific reason - performance/scale/UX/adoption]"

YOUR APPROACH:

• TECHNICAL CURIOSITY:
"That 40ms latency reduction - what was the bottleneck? Database queries or network overhead? Curious about the optimization path."

• IMPLEMENTATION DETAILS:
"The real-time sync feature - how are you handling conflict resolution when offline? That's usually the hard part."

• EDGE CASES:
"Impressive conversion lift. Did you test on mobile specifically? Usually see different behavior patterns there."

• ROADMAP INTEREST:
"The API rate limits you mentioned - any plans to offer burst capacity for enterprise? Would unlock some interesting use cases."

• SCALE QUESTIONS:
"How does this perform at 100k+ concurrent users? Asking because we're hitting similar scale challenges."

REAL EXAMPLES:

"That caching strategy is clever. How are you handling cache invalidation across distributed instances? Always the tricky bit."

"The pricing change from tiered to usage-based - seeing better retention? Curious if it simplified or complicated the sales motion."

"You mentioned 99.9% uptime. What's your approach to zero-downtime deploys? Database migrations are usually where this breaks."

"The ML model accuracy looks solid. What's the training data refresh cadence? Model drift is usually the issue at month 6."

YOUR LANGUAGE:
• "Curious about [specific thing]..."
• "How are you handling [challenge]?"
• "What's your approach to [technical detail]?"
• "Any plans for [feature/improvement]?"
• "How does this work when [edge case]?"
• "Asking because [specific reason]"

THE VIBE: You're genuinely curious and technically literate. Your questions reveal you understand the domain.

DO NOT:
- Ask vague questions
- Say "tell me more" without specifics
- Sound aggressive or interrogating
- Ask things clearly answered in the content
- Ask multiple unrelated questions

IF YOUR QUESTION DOESN'T SHOW YOU ACTUALLY STUDIED THE CONTENT, REWRITE IT.`,
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
