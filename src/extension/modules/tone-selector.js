(function() {
  const ToneSelector = {
    // Comprehensive tone definitions with AI instructions
    toneDefinitions: {
      'supportive': {
        id: 'supportive',
        name: 'Supportive with Facts',
        icon: '🤝',
        color: 'var(--accent-color)',
        category: 'positive',
        description: 'Highlight strengths, build confidence',
        example: 'This is brilliant because...',
        aiInstructions: `TONE: Supportive with Facts
- Highlight 2-3 verifiable strengths from the content
- Use encouraging, confidence-building language
- Back every positive claim with specific evidence
- Maintain professional, uplifting tone
- Focus on potential and possibilities
- Use phrases like "The data shows...", "Evidence suggests...", "Research confirms..."`,
        keywords: ['positive', 'encouraging', 'data-driven', 'optimistic', 'factual']
      },
      'critical': {
        id: 'critical',
        name: 'Critical with Facts',
        icon: '⚔️',
        color: 'var(--accent-medium)',
        category: 'critical',
        description: 'Evidence-based critique, constructive',
        example: 'The data shows this gap...',
        aiInstructions: `TONE: Critical with Facts
- Identify 1-2 weaknesses, gaps, or contradictions grounded in the content
- Use professional, evidence-based wording (no ad hominem)
- Provide constructive criticism with specific examples
- If evidence is limited, hedge appropriately (e.g., "may", "appears")
- Focus on improvement opportunities
- Use phrases like "However, the data reveals...", "A closer look shows...", "The evidence suggests otherwise..."`,
        keywords: ['analytical', 'evidence-based', 'constructive', 'professional', 'factual']
      },
      'trolling': {
        id: 'trolling',
        name: 'Trolling with Facts',
        icon: '😈',
        color: 'var(--accent-light)',
        category: 'playful',
        description: 'Playful jabs backed by evidence',
        example: 'Don\'t @ me, but the numbers say...',
        aiInstructions: `TONE: Trolling with Facts
- Use playful jabs, memes, and pop culture references
- Back EVERY claim with verifiable data or facts
- Maintain humor without being mean-spirited
- Use internet slang and casual language appropriately
- Include phrases like "Don't @ me but...", "The receipts say...", "Plot twist..."
- Balance sass with substance
- Keep it fun but factual`,
        keywords: ['playful', 'humorous', 'sassy', 'internet-culture', 'evidence-backed']
      },
      'anti-propaganda': {
        id: 'anti-propaganda',
        name: 'Anti-Propaganda',
        icon: '🛡️',
        color: 'var(--accent-color)',
        category: 'investigative',
        description: 'Debunk myths with facts & humor',
        example: 'The claim vs. the reality...',
        aiInstructions: `TONE: Anti-Propaganda
- Identify common misconceptions or misleading claims in the content
- Use clear "Myth vs. Fact" or "Claim vs. Reality" framing
- Debunk with verifiable evidence and data
- Add subtle humor to make it engaging
- Expose logical fallacies or manipulation tactics
- Use phrases like "Let's fact-check this...", "The truth is...", "Here's what they're not telling you..."
- Maintain credibility while being entertaining`,
        keywords: ['fact-checking', 'debunking', 'truth-seeking', 'investigative', 'educational']
      },
      'critical-humor': {
        id: 'critical-humor',
        name: 'Critical with Humor',
        icon: '😅',
        color: 'var(--accent-medium)',
        category: 'playful',
        description: 'Clever critique with witty observations',
        example: 'This is like that time when... but actually...',
        aiInstructions: `TONE: Critical with Humor
- Deliver pointed critique through clever analogies and witty observations
- Use humor to soften criticism while maintaining substance
- Never be mean-spirited or personal
- Include relatable comparisons and funny examples
- Balance entertainment with valid critique
- Use phrases like "It's like...", "Imagine if...", "This reminds me of..."
- Keep it light but insightful`,
        keywords: ['witty', 'clever', 'analogies', 'entertaining', 'insightful']
      },
      'sarcastic': {
        id: 'sarcastic',
        name: 'Sarcastic',
        icon: '🎭',
        color: 'var(--accent-light)',
        category: 'playful',
        description: 'Ironic commentary with bite',
        example: 'Oh sure, because that worked so well before...',
        aiInstructions: `TONE: Sarcastic
- Use irony and sarcasm to highlight absurdities or contradictions
- Employ rhetorical questions and exaggerated statements
- Reference past failures or obvious flaws ironically
- Keep it clever, not cruel
- Use phrases like "Oh sure...", "Because that's totally...", "What could possibly go wrong..."
- Balance sarcasm with actual insights
- Make the irony obvious but sophisticated`,
        keywords: ['ironic', 'sarcastic', 'rhetorical', 'clever', 'pointed']
      },
      'investigative': {
        id: 'investigative',
        name: 'Investigative',
        icon: '🔍',
        color: 'var(--accent-color)',
        category: 'analytical',
        description: 'Deep dive analysis with evidence',
        example: 'Digging deeper reveals...',
        aiInstructions: `TONE: Investigative
- Adopt a journalistic, fact-finding approach
- Present findings in a structured, logical manner
- Use data, statistics, and verifiable sources
- Ask probing questions and explore implications
- Maintain objectivity while being thorough
- Use phrases like "Investigation reveals...", "Upon closer examination...", "The evidence shows..."
- Present multiple angles and perspectives
- Focus on uncovering hidden truths`,
        keywords: ['journalistic', 'thorough', 'objective', 'data-driven', 'analytical']
      },
      'optimistic': {
        id: 'optimistic',
        name: 'Optimistic',
        icon: '🌅',
        color: 'var(--accent-medium)',
        category: 'positive',
        description: 'Future-focused with positive outlook',
        example: 'The future looks bright because...',
        aiInstructions: `TONE: Optimistic
- Focus on positive trends, opportunities, and potential
- Highlight progress and forward momentum
- Use hopeful, inspiring language
- Back optimism with concrete reasons and evidence
- Acknowledge challenges but emphasize solutions
- Use phrases like "The future holds...", "This opens doors to...", "We're moving toward..."
- Inspire action and positive thinking
- Balance enthusiasm with realism`,
        keywords: ['hopeful', 'inspiring', 'future-focused', 'positive', 'motivating']
      },
      'cautionary': {
        id: 'cautionary',
        name: 'Cautionary',
        icon: '⚠️',
        color: 'var(--accent-light)',
        category: 'analytical',
        description: 'Warn about risks and considerations',
        example: 'Before you proceed, consider this...',
        aiInstructions: `TONE: Cautionary
- Highlight potential risks, pitfalls, or unintended consequences
- Use warning language without being alarmist
- Provide specific examples of what could go wrong
- Suggest precautions and alternative approaches
- Maintain balanced perspective (not doom-and-gloom)
- Use phrases like "Be aware that...", "Consider the risks...", "History shows..."
- Focus on informed decision-making
- Back warnings with evidence`,
        keywords: ['warning', 'risk-aware', 'careful', 'balanced', 'informative']
      },
      'empowering': {
        id: 'empowering',
        name: 'Empowering',
        icon: '💪',
        color: 'var(--accent-color)',
        category: 'positive',
        description: 'Inspire action and personal agency',
        example: 'You have the power to change this by...',
        aiInstructions: `TONE: Empowering
- Focus on reader's ability to take action and create change
- Use direct, action-oriented language
- Provide specific, actionable steps
- Build confidence and self-efficacy
- Emphasize personal agency and control
- Use phrases like "You can...", "Take action by...", "Start today with..."
- Inspire without being preachy
- Make change feel achievable`,
        keywords: ['action-oriented', 'motivating', 'empowering', 'practical', 'inspiring']
      }
    },

    // Custom tone combinations
    customTones: [],

    // Session cache for selected tones
    sessionCache: {
      lastSelectedTone: null,
      customCombinations: []
    },

    // Initialize tone selector
    init: function() {
      this.loadCustomTones();
      this.createModalHTML();
      this.bindModalEvents();
    },

    // Load custom tones from storage
    loadCustomTones: async function() {
      try {
        const stored = await chrome.storage.local.get('customTones');
        if (stored.customTones) {
          this.customTones = stored.customTones;
        }
      } catch (error) {
        console.error('Error loading custom tones:', error);
      }
    },

    // Save custom tones to storage
    saveCustomTones: async function() {
      try {
        await chrome.storage.local.set({ customTones: this.customTones });
      } catch (error) {
        console.error('Error saving custom tones:', error);
      }
    },

    // Create modal HTML structure
    createModalHTML: function() {
      const modalHTML = `
        <div id="tone-selector-modal" class="tone-modal hidden" role="dialog" aria-labelledby="tone-modal-title" aria-modal="true">
          <div class="tone-modal-overlay"></div>
          <div class="tone-modal-content">
            <div class="tone-modal-header">
              <h2 id="tone-modal-title">Select Content Tone</h2>
              <button class="tone-modal-close" aria-label="Close">&times;</button>
            </div>

            <!-- AI Recommendations Section -->
            <div id="tone-recommendations" class="tone-recommendations hidden">
              <div class="recommendations-header">
                <span class="recommendations-title">✨ AI Suggested Tones</span>
              </div>
              <div id="recommended-tones" class="recommended-tones-list"></div>
            </div>

            <!-- Tone Grid -->
            <div class="modal-section">
              <label class="section-label">Choose Your Tone</label>
              <div class="tone-grid" role="radiogroup" aria-label="Select content tone">
                ${this.renderToneGrid()}
              </div>
            </div>

            <!-- Custom Tone Builder Toggle -->
            <div class="custom-tone-section">
              <button id="toggle-custom-builder" class="custom-builder-toggle">
                <span class="toggle-text">🎨 Custom Tone Mix (optional)</span>
                <span class="toggle-arrow">▼</span>
              </button>
              
              <div id="custom-tone-builder" class="custom-tone-builder hidden">
                <div class="builder-header">
                  <span class="builder-title">Mix two tones</span>
                </div>
                <div class="builder-selections">
                  <div class="builder-slot" data-slot="1">
                    <label>Primary</label>
                    <select id="custom-tone-1" class="builder-select">
                      <option value="">Select tone…</option>
                      ${this.renderToneOptions()}
                    </select>
                  </div>
                  <div class="builder-connector">+</div>
                  <div class="builder-slot" data-slot="2">
                    <label>Secondary</label>
                    <select id="custom-tone-2" class="builder-select">
                      <option value="">Select tone…</option>
                      ${this.renderToneOptions()}
                    </select>
                  </div>
                </div>
                <div class="builder-preview hidden">
                  <div class="preview-label">Preview</div>
                  <div id="custom-tone-preview" class="preview-content"></div>
                </div>
                <div class="builder-actions">
                  <button id="use-custom-tone" class="builder-btn use-btn" disabled>
                    Use this mix
                  </button>
                  <button id="save-custom-tone" class="builder-btn save-btn" disabled>
                    Save
                  </button>
                </div>
              </div>

              <!-- Saved Custom Tones -->
              <div id="saved-custom-tones" class="saved-custom-tones hidden"></div>
            </div>

            <!-- Image Prompt Option -->
            <div class="image-prompt-section">
              <label class="image-prompt-toggle">
                <input type="checkbox" id="include-image-prompt" class="image-prompt-checkbox">
                <span class="image-prompt-label">
                  <svg class="image-prompt-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                  Generate Image Prompt (9:16 Nano Banana)
                </span>
              </label>
              <p class="image-prompt-description">AI will create an optimized image prompt for your content</p>
            </div>

            <!-- Modal Actions -->
            <div class="tone-modal-actions">
              <button id="tone-cancel-btn" class="tone-btn tone-btn-secondary">Cancel</button>
              <button id="tone-generate-btn" class="tone-btn tone-btn-primary" disabled>
                Generate Content
              </button>
            </div>
          </div>
        </div>
      `;

      // Append to body if not exists
      if (!document.getElementById('tone-selector-modal')) {
        document.body.insertAdjacentHTML('beforeend', modalHTML);
      }
    },

    // Render tone grid
    renderToneGrid: function() {
      return Object.values(this.toneDefinitions).map(tone => `
        <div class="tone-option" 
             data-tone-id="${tone.id}" 
             data-category="${tone.category}"
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
    },

    // Render tone options for custom builder
    renderToneOptions: function() {
      return Object.values(this.toneDefinitions).map(tone => 
        `<option value="${tone.id}">${tone.icon} ${tone.name}</option>`
      ).join('');
    },

    // Bind modal events
    bindModalEvents: function() {
      const modal = document.getElementById('tone-selector-modal');
      if (!modal) return;

      // Close button
      const closeBtn = modal.querySelector('.tone-modal-close');
      closeBtn?.addEventListener('click', () => this.hideModal());

      // Overlay click
      const overlay = modal.querySelector('.tone-modal-overlay');
      overlay?.addEventListener('click', () => this.hideModal());

      // Cancel button
      const cancelBtn = document.getElementById('tone-cancel-btn');
      cancelBtn?.addEventListener('click', () => this.hideModal());

      // Tone selection
      const toneOptions = modal.querySelectorAll('.tone-option');
      toneOptions.forEach(option => {
        option.addEventListener('click', () => this.selectTone(option));
        option.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.selectTone(option);
          }
        });
      });

      // Generate button
      const generateBtn = document.getElementById('tone-generate-btn');
      generateBtn?.addEventListener('click', () => this.handleGenerate());

      // Custom builder toggle
      const builderToggle = document.getElementById('toggle-custom-builder');
      builderToggle?.addEventListener('click', () => this.toggleCustomBuilder());

      // Custom tone selects
      const customTone1 = document.getElementById('custom-tone-1');
      const customTone2 = document.getElementById('custom-tone-2');
      customTone1?.addEventListener('change', () => this.updateCustomPreview());
      customTone2?.addEventListener('change', () => this.updateCustomPreview());

      // Save custom tone
      const saveCustomBtn = document.getElementById('save-custom-tone');
      saveCustomBtn?.addEventListener('click', () => this.saveCustomCombination());

      // Use custom tone
      const useCustomBtn = document.getElementById('use-custom-tone');
      useCustomBtn?.addEventListener('click', () => this.useCustomCombination());

      // Keyboard navigation
      modal.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.hideModal();
        }
      });
    },

    // Show modal with AI recommendations
    showModal: async function(platform, pageContent) {
      const modal = document.getElementById('tone-selector-modal');
      if (!modal) return;

      this.currentPlatform = platform;
      this.currentPageContent = pageContent;

      // Show modal
      modal.classList.remove('hidden');
      modal.setAttribute('aria-hidden', 'false');

      // Focus first tone option
      const firstTone = modal.querySelector('.tone-option');
      firstTone?.focus();

      // Generate AI recommendations
      await this.generateRecommendations(pageContent);

      // Load saved custom tones
      this.renderSavedCustomTones();
    },

    // Hide modal
    hideModal: function() {
      const modal = document.getElementById('tone-selector-modal');
      if (!modal) return;

      modal.classList.add('hidden');
      modal.setAttribute('aria-hidden', 'true');

      // Reset selections
      this.resetSelections();
    },

    // Select tone
    selectTone: function(option) {
      // Deselect all
      const allOptions = document.querySelectorAll('.tone-option');
      allOptions.forEach(opt => {
        opt.classList.remove('selected');
        opt.setAttribute('aria-checked', 'false');
      });

      // Select clicked
      option.classList.add('selected');
      option.setAttribute('aria-checked', 'true');

      // Store selection
      this.selectedToneId = option.dataset.toneId;
      this.selectedTone = this.toneDefinitions[this.selectedToneId];

      // Enable generate button
      const generateBtn = document.getElementById('tone-generate-btn');
      if (generateBtn) {
        generateBtn.disabled = false;
      }

      // Cache selection
      this.sessionCache.lastSelectedTone = this.selectedToneId;
    },

    // Generate AI recommendations based on content
    generateRecommendations: async function(pageContent) {
      const recommendationsSection = document.getElementById('tone-recommendations');
      const recommendedList = document.getElementById('recommended-tones');
      
      if (!recommendationsSection || !recommendedList) return;

      try {
        // Show loading state
        recommendationsSection.classList.remove('hidden');
        recommendedList.innerHTML = '<div class="recommendations-loading">Analyzing content...</div>';

        // Analyze content for tone recommendations
        const recommendations = await this.analyzeContentForTones(pageContent);

        // Render recommendations
        if (recommendations.length > 0) {
          recommendedList.innerHTML = recommendations.map(rec => `
            <div class="recommended-tone" data-tone-id="${rec.toneId}">
              <div class="rec-badge">Recommended</div>
              <div class="rec-tone-icon" style="color: ${rec.color}">${rec.icon}</div>
              <div class="rec-tone-info">
                <div class="rec-tone-name">${rec.name}</div>
                <div class="rec-reason">${rec.reason}</div>
                <div class="rec-confidence">Match: ${rec.confidence}%</div>
              </div>
            </div>
          `).join('');

          // Add click handlers to recommended tones
          const recTones = recommendedList.querySelectorAll('.recommended-tone');
          recTones.forEach(recTone => {
            recTone.addEventListener('click', () => {
              const toneId = recTone.dataset.toneId;
              const toneOption = document.querySelector(`.tone-option[data-tone-id="${toneId}"]`);
              if (toneOption) {
                this.selectTone(toneOption);
                toneOption.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            });
          });
        } else {
          recommendedList.innerHTML = '<div class="no-recommendations">All tones work well for this content!</div>';
        }
      } catch (error) {
        console.error('Error generating recommendations:', error);
        recommendedList.innerHTML = '<div class="recommendations-error">Could not analyze content</div>';
      }
    },

    // Analyze content and recommend tones
    analyzeContentForTones: async function(pageContent) {
      // Context-aware analysis using content keywords and patterns
      const contentLower = pageContent.toLowerCase();
      const recommendations = [];

      // Analyze content characteristics
      const hasControversy = /controversy|debate|disagree|conflict|dispute/i.test(pageContent);
      const hasData = /data|statistics|study|research|evidence|percent|number/i.test(pageContent);
      const hasClaims = /claim|assert|state|argue|maintain/i.test(pageContent);
      const hasPositive = /success|achievement|breakthrough|innovation|progress/i.test(pageContent);
      const hasNegative = /problem|issue|concern|risk|danger|failure/i.test(pageContent);
      const hasHumor = /funny|joke|ironic|amusing|hilarious/i.test(pageContent);
      const hasFuture = /future|upcoming|next|will|plan|forecast/i.test(pageContent);
      const hasWarning = /warning|caution|beware|careful|risk/i.test(pageContent);

      // Calculate content length
      const contentLength = pageContent.length;
      const wordCount = pageContent.split(/\s+/).length;

      // Recommendation logic
      if (hasControversy && hasData) {
        recommendations.push({
          toneId: 'critical',
          ...this.toneDefinitions.critical,
          reason: 'Content contains controversial claims with data - perfect for evidence-based critique',
          confidence: 92
        });
      }

      if (hasClaims && !hasData) {
        recommendations.push({
          toneId: 'anti-propaganda',
          ...this.toneDefinitions['anti-propaganda'],
          reason: 'Multiple claims detected without strong evidence - ideal for fact-checking',
          confidence: 88
        });
      }

      if (hasPositive && hasData) {
        recommendations.push({
          toneId: 'supportive',
          ...this.toneDefinitions.supportive,
          reason: 'Positive developments backed by data - great for supportive commentary',
          confidence: 90
        });
      }

      if (hasControversy && hasHumor) {
        recommendations.push({
          toneId: 'trolling',
          ...this.toneDefinitions.trolling,
          reason: 'Controversial topic with humorous elements - perfect for playful fact-based trolling',
          confidence: 85
        });
      }

      if (hasNegative && !hasControversy) {
        recommendations.push({
          toneId: 'critical-humor',
          ...this.toneDefinitions['critical-humor'],
          reason: 'Issues present without heated debate - ideal for witty critique',
          confidence: 83
        });
      }

      if (hasFuture && hasPositive) {
        recommendations.push({
          toneId: 'optimistic',
          ...this.toneDefinitions.optimistic,
          reason: 'Forward-looking content with positive outlook - great for optimistic framing',
          confidence: 87
        });
      }

      if (hasWarning || (hasNegative && hasData)) {
        recommendations.push({
          toneId: 'cautionary',
          ...this.toneDefinitions.cautionary,
          reason: 'Risks or concerns identified - suitable for cautionary perspective',
          confidence: 84
        });
      }

      if (hasData && contentLength > 2000) {
        recommendations.push({
          toneId: 'investigative',
          ...this.toneDefinitions.investigative,
          reason: 'Substantial content with data - perfect for deep investigative analysis',
          confidence: 86
        });
      }

      if (hasPositive && wordCount < 500) {
        recommendations.push({
          toneId: 'empowering',
          ...this.toneDefinitions.empowering,
          reason: 'Concise positive content - ideal for empowering call-to-action',
          confidence: 81
        });
      }

      // Sort by confidence and return top 3
      return recommendations
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 3);
    },

    // Toggle custom builder
    toggleCustomBuilder: function() {
      const builder = document.getElementById('custom-tone-builder');
      const toggle = document.getElementById('toggle-custom-builder');
      const arrow = toggle?.querySelector('.toggle-arrow');

      if (builder && toggle) {
        const isHidden = builder.classList.contains('hidden');
        builder.classList.toggle('hidden');
        if (arrow) {
          arrow.textContent = isHidden ? '▲' : '▼';
        }
      }
    },

    // Update custom tone preview
    updateCustomPreview: function() {
      const tone1Select = document.getElementById('custom-tone-1');
      const tone2Select = document.getElementById('custom-tone-2');
      const preview = document.getElementById('custom-tone-preview');
      const previewContainer = document.querySelector('.builder-preview');
      const saveBtn = document.getElementById('save-custom-tone');
      const useBtn = document.getElementById('use-custom-tone');

      if (!tone1Select || !tone2Select || !preview) return;

      const tone1Id = tone1Select.value;
      const tone2Id = tone2Select.value;

      if (tone1Id && tone2Id && tone1Id !== tone2Id) {
        const tone1 = this.toneDefinitions[tone1Id];
        const tone2 = this.toneDefinitions[tone2Id];

        preview.innerHTML = `
          <div class="preview-tones">
            <span class="preview-tone" style="color: ${tone1.color}">
              ${tone1.icon} ${tone1.name}
            </span>
            <span class="preview-plus">+</span>
            <span class="preview-tone" style="color: ${tone2.color}">
              ${tone2.icon} ${tone2.name}
            </span>
          </div>
          <div class="preview-description">
            ${this.generateCombinedDescription(tone1, tone2)}
          </div>
        `;

        previewContainer?.classList.remove('hidden');
        if (saveBtn) saveBtn.disabled = false;
        if (useBtn) useBtn.disabled = false;
      } else {
        previewContainer?.classList.add('hidden');
        if (saveBtn) saveBtn.disabled = true;
        if (useBtn) useBtn.disabled = true;
      }
    },

    // Generate combined description
    generateCombinedDescription: function(tone1, tone2) {
      return `Combines ${tone1.name.toLowerCase()} with ${tone2.name.toLowerCase()} for a unique perspective that ${tone1.description.toLowerCase()} while ${tone2.description.toLowerCase()}.`;
    },

    // Save custom combination
    saveCustomCombination: async function() {
      const tone1Select = document.getElementById('custom-tone-1');
      const tone2Select = document.getElementById('custom-tone-2');

      if (!tone1Select || !tone2Select) return;

      const tone1Id = tone1Select.value;
      const tone2Id = tone2Select.value;

      if (!tone1Id || !tone2Id || tone1Id === tone2Id) return;

      const customTone = {
        id: `custom-${Date.now()}`,
        tone1Id,
        tone2Id,
        name: `${this.toneDefinitions[tone1Id].name} + ${this.toneDefinitions[tone2Id].name}`,
        createdAt: Date.now()
      };

      this.customTones.push(customTone);
      await this.saveCustomTones();
      this.renderSavedCustomTones();

      // Show success message
      this.showToast('✓ Custom tone saved!');
    },

    // Use custom combination
    useCustomCombination: function() {
      const tone1Select = document.getElementById('custom-tone-1');
      const tone2Select = document.getElementById('custom-tone-2');

      if (!tone1Select || !tone2Select) return;

      const tone1Id = tone1Select.value;
      const tone2Id = tone2Select.value;

      if (!tone1Id || !tone2Id || tone1Id === tone2Id) return;

      // Store custom combination
      this.selectedToneId = 'custom';
      this.selectedTone = {
        id: 'custom',
        name: `${this.toneDefinitions[tone1Id].name} + ${this.toneDefinitions[tone2Id].name}`,
        tone1: this.toneDefinitions[tone1Id],
        tone2: this.toneDefinitions[tone2Id],
        aiInstructions: this.combineAIInstructions(
          this.toneDefinitions[tone1Id],
          this.toneDefinitions[tone2Id]
        )
      };

      // Enable generate button
      const generateBtn = document.getElementById('tone-generate-btn');
      if (generateBtn) {
        generateBtn.disabled = false;
      }

      // Visual feedback
      this.showToast('✓ Custom tone selected!');
    },

    // Combine AI instructions
    combineAIInstructions: function(tone1, tone2) {
      return `COMBINED TONE: ${tone1.name} + ${tone2.name}

PRIMARY TONE (${tone1.name}):
${tone1.aiInstructions}

SECONDARY TONE (${tone2.name}):
${tone2.aiInstructions}

INTEGRATION RULES:
- Lead with the primary tone's approach
- Weave in secondary tone's characteristics naturally
- Balance both perspectives throughout
- Ensure cohesive voice, not jarring shifts
- Maintain factual accuracy from both tones`;
    },

    // Render saved custom tones
    renderSavedCustomTones: function() {
      const container = document.getElementById('saved-custom-tones');
      if (!container) return;

      if (this.customTones.length === 0) {
        container.classList.add('hidden');
        return;
      }

      container.classList.remove('hidden');
      container.innerHTML = `
        <div class="saved-tones-header">Saved Custom Tones</div>
        <div class="saved-tones-list">
          ${this.customTones.map(ct => {
            const tone1 = this.toneDefinitions[ct.tone1Id];
            const tone2 = this.toneDefinitions[ct.tone2Id];
            return `
              <div class="saved-custom-tone" data-custom-id="${ct.id}">
                <div class="saved-tone-icons">
                  <span style="color: ${tone1.color}">${tone1.icon}</span>
                  <span class="saved-plus">+</span>
                  <span style="color: ${tone2.color}">${tone2.icon}</span>
                </div>
                <div class="saved-tone-name">${ct.name}</div>
                <button class="saved-tone-delete" data-custom-id="${ct.id}" title="Delete">×</button>
              </div>
            `;
          }).join('')}
        </div>
      `;

      // Bind click events
      const savedTones = container.querySelectorAll('.saved-custom-tone');
      savedTones.forEach(st => {
        st.addEventListener('click', (e) => {
          if (!e.target.classList.contains('saved-tone-delete')) {
            this.selectSavedCustomTone(st.dataset.customId);
          }
        });
      });

      // Bind delete events
      const deleteBtns = container.querySelectorAll('.saved-tone-delete');
      deleteBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.deleteCustomTone(btn.dataset.customId);
        });
      });
    },

    // Select saved custom tone
    selectSavedCustomTone: function(customId) {
      const customTone = this.customTones.find(ct => ct.id === customId);
      if (!customTone) return;

      const tone1 = this.toneDefinitions[customTone.tone1Id];
      const tone2 = this.toneDefinitions[customTone.tone2Id];

      this.selectedToneId = 'custom';
      this.selectedTone = {
        id: 'custom',
        name: customTone.name,
        tone1,
        tone2,
        aiInstructions: this.combineAIInstructions(tone1, tone2)
      };

      // Enable generate button
      const generateBtn = document.getElementById('tone-generate-btn');
      if (generateBtn) {
        generateBtn.disabled = false;
      }

      // Visual feedback
      this.showToast('✓ Custom tone selected!');
    },

    // Delete custom tone
    deleteCustomTone: async function(customId) {
      this.customTones = this.customTones.filter(ct => ct.id !== customId);
      await this.saveCustomTones();
      this.renderSavedCustomTones();
      this.showToast('Custom tone deleted');
    },

    // Handle generate
    handleGenerate: function() {
      if (!this.selectedTone) return;

      // Check if image prompt is requested
      const imagePromptCheckbox = document.getElementById('include-image-prompt');
      const includeImagePrompt = imagePromptCheckbox ? imagePromptCheckbox.checked : false;

      // Store callback and hide modal
      if (this.onGenerateCallback) {
        this.onGenerateCallback(this.selectedTone, this.currentPlatform, includeImagePrompt);
      }

      this.hideModal();
    },

    // Reset selections
    resetSelections: function() {
      const allOptions = document.querySelectorAll('.tone-option');
      allOptions.forEach(opt => {
        opt.classList.remove('selected');
        opt.setAttribute('aria-checked', 'false');
      });

      this.selectedToneId = null;
      this.selectedTone = null;

      const generateBtn = document.getElementById('tone-generate-btn');
      if (generateBtn) {
        generateBtn.disabled = true;
      }
    },

    // Show toast notification
    showToast: function(message) {
      const toast = document.createElement('div');
      toast.className = 'tone-toast';
      toast.textContent = message;
      toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: rgba(16, 185, 129, 0.95);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10001;
        animation: slideInUp 0.3s ease;
      `;

      document.body.appendChild(toast);

      setTimeout(() => {
        toast.style.animation = 'slideOutDown 0.3s ease';
        setTimeout(() => toast.remove(), 300);
      }, 2000);
    },

    // Public API: Show tone selector
    show: function(platform, pageContent, onGenerate) {
      this.onGenerateCallback = onGenerate;
      this.showModal(platform, pageContent);
    }
  };

  // Initialize on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ToneSelector.init());
  } else {
    ToneSelector.init();
  }

  // Export to window
  window.TabTalkToneSelector = ToneSelector;
})();
