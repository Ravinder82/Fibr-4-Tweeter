(function() {
  const ToneSelector = {
    // Comprehensive tone definitions with AI instructions
    toneDefinitions: {
      'fact-check': {
        id: 'fact-check',
        name: 'Fact Check',
        icon: '🔍',
        color: 'var(--accent-medium)',
        category: 'reply',
        subcategory: 'analytical',
        description: 'Verify claims with evidence and data',
        example: 'Let\'s fact-check this claim...',
        aiInstructions: `TONE: Fact Check
- Systematically verify claims made in the content
- Use "Claim vs. Reality" or "Fact Check" structure
- Provide verifiable evidence, data, and sources
- Highlight inaccuracies without being aggressive
- Use phrases like "The data shows...", "Independent verification confirms...", "This claim is [supported/refuted] by..."
- Maintain objective, evidence-based approach
- Focus on truth and accuracy
- Cite specific studies or reliable sources`,
        keywords: ['verification', 'evidence-based', 'accurate', 'objective', 'truth-seeking']
      },
      'agreeing': {
        id: 'agreeing',
        name: 'Amplify & Agree',
        icon: '🤝',
        color: 'var(--accent-color)',
        category: 'reply',
        subcategory: 'positive',
        description: 'Support and amplify the message',
        example: 'This is absolutely right because...',
        aiInstructions: `TONE: Agreeing
- Find common ground and validate the core message
- Add supporting evidence or personal confirmation
- Use collaborative and affirming language
- Share why you agree with specific examples
- Use phrases like "I completely agree because...", "This resonates because...", "My experience confirms..."
- Build on the original points with additional insights
- Show genuine alignment with the message
- Encourage others to join the agreement`,
        keywords: ['supportive', 'collaborative', 'affirming', 'aligned', 'validating']
      },
      'contradictory': {
        id: 'contradictory',
        name: 'Fact Check & Counter',
        icon: '⚔️',
        color: 'var(--accent-light)',
        category: 'reply',
        subcategory: 'critical',
        description: 'Challenge with counter-evidence',
        example: 'Actually, the evidence suggests otherwise...',
        aiInstructions: `TONE: Contradictory
- Directly challenge the main claims with counter-evidence
- Present opposing data or alternative perspectives
- Use respectful but firm disagreement
- Provide specific examples that contradict the content
- Use phrases like "However, research shows...", "This contradicts...", "An alternative view suggests..."
- Maintain intellectual honesty and rigor
- Acknowledge valid points while highlighting disagreements
- Focus on evidence-based contradiction`,
        keywords: ['challenging', 'counter-evidence', 'disagreeing', 'alternative', 'critical']
      },
      'trolling': {
        id: 'trolling',
        name: 'Savage & Smart',
        icon: '😈',
        color: 'var(--accent-light)',
        category: 'reply',
        subcategory: 'playful',
        description: 'Playful jabs backed by evidence',
        example: 'Don\'t @ me, but the numbers say...',
        aiInstructions: `TONE: Trolling
- Use playful jabs, memes, and pop culture references
- Back EVERY claim with verifiable data or facts
- Maintain humor without being mean-spirited
- Use internet slang and casual language appropriately
- Include phrases like "Don't @ me but...", "The receipts say...", "Plot twist..."
- Balance sass with substance
- Keep it fun but factual`,
        keywords: ['playful', 'humorous', 'sassy', 'internet-culture', 'evidence-backed']
      },
      'funny': {
        id: 'funny',
        name: 'Funny',
        icon: '😂',
        color: 'var(--accent-light)',
        category: 'original',
        subcategory: 'playful',
        description: 'Humorous take with clever observations',
        example: 'This is like when your cat tries to code...',
        aiInstructions: `TONE: Funny
- Find humor in the content through relatable analogies
- Use witty observations and clever comparisons
- Include pop culture references or memes when appropriate
- Keep jokes light and accessible, not offensive
- Use phrases like "This reminds me of...", "It's like that time...", "Plot twist..."
- Balance humor with actual insights
- Use self-deprecating humor when it fits
- Make complex topics fun and approachable`,
        keywords: ['humorous', 'witty', 'entertaining', 'clever', 'relatable']
      },
      'deeper-insights': {
        id: 'deeper-insights',
        name: 'Deeper Insights',
        icon: '💡',
        color: 'var(--accent-color)',
        category: 'original',
        subcategory: 'analytical',
        description: 'Reveal hidden patterns and connections',
        example: 'What everyone\'s missing is the deeper pattern...',
        aiInstructions: `TONE: Deeper Insights
- Go beyond surface-level analysis to reveal hidden patterns
- Connect seemingly unrelated concepts or trends
- Provide "aha!" moments that others might miss
- Use interdisciplinary thinking and synthesis
- Use phrases like "The deeper pattern here is...", "What connects these is...", "The hidden insight is..."
- Show how this fits into larger trends or cycles
- Provide non-obvious connections and implications
- Offer perspectives that require deeper thinking`,
        keywords: ['insightful', 'analytical', 'pattern-recognition', 'synthesis', 'profound']
      },
      'clever-observations': {
        id: 'clever-observations',
        name: 'Clever Observations',
        icon: '🧠',
        color: 'var(--accent-medium)',
        category: 'original',
        subcategory: 'playful',
        description: 'Quick wit and smart cultural references',
        example: 'This is giving main character energy...',
        aiInstructions: `TONE: Clever Observations
- Make smart, witty observations about the content
- Use current slang, memes, and pop culture references
- Include self-deprecating humor when appropriate
- Keep tone playful but intelligent
- Use phrases like "This is giving...", "The math is mathing...", "No way...", "It's the... for me"
- Reference internet culture and trends authentically
- Balance humor with genuine insights
- Make connections others might miss but find obvious once pointed out`,
        keywords: ['witty', 'clever', 'trendy', 'relatable', 'observant']
      },
      'industry-insights': {
        id: 'industry-insights',
        name: 'Industry Insights',
        icon: '📊',
        color: 'var(--accent-color)',
        category: 'original',
        subcategory: 'professional',
        description: 'Professional expertise and market analysis',
        example: 'From an industry perspective, this signals...',
        aiInstructions: `TONE: Industry Insights
- Provide professional expertise and insider knowledge
- Analyze market trends and industry implications
- Use technical terminology with clear explanations
- Share insights that come from deep domain experience
- Use phrases like "From an industry perspective...", "This signals a shift in...", "Professional analysis shows..."
- Include specific metrics, benchmarks, or industry standards
- Demonstrate deep understanding of the field
- Connect content to broader industry context and future trends`,
        keywords: ['professional', 'expert', 'industry', 'analytical', 'specialized']
      },
      'repurpose': {
        id: 'repurpose',
        name: 'Expert Repurpose',
        icon: '✨',
        color: 'var(--accent-color)',
        category: 'original',
        subcategory: 'creative',
        description: 'Rephrase content with better wording',
        example: 'Let me rephrase this more effectively...',
        aiInstructions: `TONE: Expert Repurpose

ABSOLUTE CRITICAL RULES - YOU MUST FOLLOW THESE EXACTLY:
1. REPHRASE THE EXACT SAME CONTENT - Do NOT create new content
2. PRESERVE THE ORIGINAL MESSAGE 100% - Same intent, same purpose, same offer
3. DO NOT add your own opinions, skepticism, or commentary
4. DO NOT change promotional content into warnings or critiques
5. If the original is promotional, your output MUST be promotional
6. If the original has a call-to-action, keep the EXACT same call-to-action
7. ONLY change the wording, vocabulary, and sentence structure
8. Think of it as translating to better English, not changing the message

WHAT TO DO:
- Use stronger, more professional vocabulary
- Improve sentence flow and transitions
- Make it sound more polished and compelling
- Enhance readability while keeping the same meaning
- Example: "HOLY SH*T" → "This is incredible" (same excitement, better wording)

WHAT NOT TO DO:
- Do NOT question the content's validity
- Do NOT add warnings or skepticism
- Do NOT change the tone from positive to negative
- Do NOT remove calls-to-action or promotional elements
- Do NOT add your own analysis or commentary`,
        keywords: ['rephrase', 'enhance', 'improve', 'professional', 'polished']
      },
      'content-like-this': {
        id: 'content-like-this',
        name: 'Content like this',
        icon: '🎭',
        color: 'var(--accent-medium)',
        category: 'original',
        subcategory: 'creative',
        description: 'Create similar content in the same style',
        example: 'Here\'s more content like this...',
        aiInstructions: `TONE: Content like this

MISSION: Analyze the webpage content to understand its essence, then create entirely NEW content that captures the same spirit, style, and approach. You are NOT rephrasing - you are creating fresh, original content inspired by the source.

CONTENT ANALYSIS PHASE:
1. Identify the content type and format (blog post, tutorial, opinion piece, case study, etc.)
2. Detect the writing style (conversational, formal, technical, storytelling, etc.)
3. Understand the core purpose (educate, entertain, persuade, inspire, etc.)
4. Note the structure and flow patterns
5. Identify the target audience and expertise level

CONTENT CREATION RULES:
1. CREATE ENTIRELY NEW CONTENT - Do NOT copy or rephrase the original
2. Match the STYLE and FORMAT, not the specific words
3. Use the same TONE and VOICE as the original
4. Apply the same STRUCTURE and organization patterns
5. Target the same AUDIENCE with similar complexity
6. Maintain the same PURPOSE and intent
7. Use analogous examples and scenarios (not the same ones)
8. Keep similar length and depth

STYLE MATCHING:
- If original is conversational → Write conversationally
- If original is technical → Use technical language appropriately
- If original is storytelling → Create a new story with similar structure
- If original is data-driven → Use data and examples in your new content
- If original is inspirational → Write inspiring content with fresh examples

CONTENT TYPES TO RECOGNIZE AND REPLICATE:
• Tutorials → Create new tutorial with different steps/examples
• Opinion pieces → Write new opinion on related topic with same stance
• Case studies → Create new case study with different scenario
• Listicles → Make new list with different items but same theme
• How-to guides → Create new guide for different but related task
• Personal stories → Share new personal story with same emotional arc
• Educational content → Teach new concept with same teaching style
• Promotional content → Create new promotion for different but related product/service

ABSOLUTE REQUIREMENTS:
✓ MUST be entirely new content - no copying sentences
✓ MUST capture the same essence and spirit
✓ MUST match the writing style perfectly
✓ MUST serve the same purpose for the same audience
✓ MUST feel like it was written by the same author
✓ MUST impress with creativity while maintaining style consistency

OUTPUT REQUIREMENTS:
✓ Generate exactly ONE complete piece of content
✓ Make it substantial and comprehensive (not just a brief mention)
✓ Focus all creative energy on making this single piece exceptional
✓ Do not provide multiple options or variations
✓ Deliver one polished, ready-to-use result

THE GOAL: Create ONE impressive piece of content that perfectly matches the original's style and voice, making people say "Wow, this is exactly like [original content] but completely fresh and new!"`,
        keywords: ['emulate', 'style-match', 'create-similar', 'replicate-style', 'fresh-content']
      },
      'hypocrite-buster': {
        id: 'hypocrite-buster',
        name: 'Hypocrite Buster',
        icon: '🎯',
        color: 'var(--accent-light)',
        category: 'reply',
        subcategory: 'critical',
        description: 'Point out contradictions and double standards',
        example: 'Interesting how they ignore their own past stance...',
        aiInstructions: `TONE: Hypocrite Buster
- Identify contradictions or double standards in the content
- Point out when arguments conflict with obvious counterexamples
- Highlight selective reasoning or convenient inconsistencies
- Use logical takedowns based on the content itself
- Focus on "this contradicts that" patterns within the material
- Use phrases like "Funny how...", "Conveniently ignoring...", "The irony is..."
- Maintain sharp, critical tone without being aggressive
- Point out flawed reasoning or selective evidence use
- Connect dots that show inconsistency in positions
- Use irony and juxtaposition to highlight contradictions effectively`,
        keywords: ['contradiction', 'double-standards', 'inconsistency', 'critical', 'exposure']
      },
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

            <!-- Tone Grid -->
            <div class="modal-section">
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

    // Render tone grid with categories
    renderToneGrid: function() {
      const originalTones = Object.values(this.toneDefinitions)
        .filter(tone => tone.category === 'original');

      return `
        <div class="tone-category">
          <div class="category-header">
            <span class="category-icon">✍️</span>
            <span class="category-title">Original Post</span>
          </div>
          <div class="tone-grid-row">
            ${originalTones.map(tone => `
              <div class="tone-option" 
                   data-tone-id="${tone.id}" 
                   data-category="${tone.category}"
                   data-subcategory="${tone.subcategory}"
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
            `).join('')}
          </div>
        </div>
      `;
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
      console.log('FibrToneSelector: Selected tone ID:', this.selectedToneId);
      console.log('FibrToneSelector: Available tone IDs:', Object.keys(this.toneDefinitions));
      this.selectedTone = this.toneDefinitions[this.selectedToneId];
      console.log('FibrToneSelector: Selected tone object:', this.selectedTone);

      // Enable generate button
      const generateBtn = document.getElementById('tone-generate-btn');
      if (generateBtn) {
        generateBtn.disabled = false;
      }
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
      console.log('FibrToneSelector: handleGenerate called');
      console.log('FibrToneSelector: selectedToneId:', this.selectedToneId);
      console.log('FibrToneSelector: selectedTone:', this.selectedTone);
      
      if (!this.selectedTone) {
        console.warn('FibrToneSelector: No tone selected, cannot generate');
        return;
      }

      // Check if image prompt is requested
      const imagePromptCheckbox = document.getElementById('include-image-prompt');
      const includeImagePrompt = imagePromptCheckbox ? imagePromptCheckbox.checked : false;

      // Store callback and hide modal
      if (this.onGenerateCallback) {
        console.log('FibrToneSelector: Calling callback with tone:', this.selectedTone);
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
  window.FibrToneSelector = ToneSelector;
})();
