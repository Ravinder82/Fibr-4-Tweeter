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
        aiInstructions: `TONE: Amplify & Agree

MISSION: Validate the core message and add supporting evidence or personal confirmation. Build on the original idea authentically.

AUTHENTIC AGREEMENT GUIDELINES:
- Find genuine common ground and validate the essential message.
- Add supporting evidence, personal experience, or additional confirmation.
- Use collaborative and affirming language—you're building on something true.
- Share *why* you agree with specific examples or insights.
- Use phrases naturally: "I completely agree because…," "This resonates because…," "My experience confirms…," "Here's what I've seen too…"
- Build on the original points with new angles or insights.
- Show genuine alignment—not fake enthusiasm, but real validation.
- Encourage others to consider the perspective while adding your unique angle.
- Bring specificity: don't just say "yes," show what makes this true through your lens.`,
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
        aiInstructions: `TONE: Fact Check & Counter

MISSION: Respectfully challenge the main claims with counter-evidence and alternative perspectives. Contribute nuanced disagreement to the conversation.

AUTHENTIC CONTRADICTION GUIDELINES:
- Directly challenge main claims using verifiable counter-evidence or alternative data.
- Present opposing perspectives or evidence clearly without aggression.
- Use respectful but firm disagreement—you're adding clarity, not being combative.
- Provide specific examples that contradict the content.
- Use phrases that sound natural: "However, research shows…," "This actually contradicts…," "An alternative perspective suggests…," "The evidence here tells a different story…"
- Maintain intellectual honesty—acknowledge valid points while highlighting disagreements.
- Focus on evidence-based contradiction, not personal attack.
- Show you understand the original position before explaining why it's incomplete or inaccurate.
- Contribute to understanding, not just point-scoring.`,
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
        aiInstructions: `TONE: Savage & Smart

MISSION: Use playful jabs, memes, and smart humor to challenge or highlight flaws—but back every point with real data or evidence.

AUTHENTIC SAVAGERY GUIDELINES:
- Use playful jabs, witty observations, and pop culture references as engagement tools.
- Back EVERY single claim or jab with verifiable data, facts, or credible sources—no empty sass.
- Maintain humor without being mean-spirited—aim for clever, not cruel.
- Use internet slang and casual language authentically ("Don't @ me but…," "The receipts say…," "Plot twist…," "no cap…").
- Balance sass with substance—make people laugh AND reconsider.
- Show you did the homework—your wit is informed, not just reflexive.
- Keep it fun and shareable while standing on factual ground.
- Use irony and juxtaposition to highlight contradictions effectively.
- Remember: the best savage takes are backed by data and delivered with genuine humor.`,
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

MISSION: Find genuine humor in the content—witty, relatable, clever, unexpected. Make people laugh while still landing real insights.

AUTHENTIC HUMOR GUIDELINES:
- Find humor through relatable analogies and unexpected connections ("This is like when your friend…").
- Use witty observations and clever comparisons that show you actually *thought* about this, not just skimmed it.
- Include pop culture references or memes only if they feel naturally woven in—authentic to how you actually talk.
- Keep jokes light, accessible, and inclusive. Avoid anything that punches down or relies on shock value.
- Use comedic phrases naturally: "This reminds me of…," "It's like that time…," "Plot twist…," "I didn't expect that," "okay but hear me out."
- Balance genuine humor with actual insight—make people laugh, then land the real takeaway.
- Use self-deprecating humor authentically ("I just realized I've been doing this wrong," "story of my life").
- Make complex or dense topics *fun* and approachable without dumbing them down.
- Show your sense of humor—dark humor, absurdist, sarcasm—whatever feels like *you*.
- Remember: people laugh hardest at truth wrapped in unexpected language. Be honest first, then funny.`,
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

MISSION: Go beyond the surface to reveal hidden patterns, non-obvious connections, and the "why" beneath the what. Deliver "aha!" moments.

AUTHENTIC DEPTH GUIDELINES:
- Analyze beyond surface-level observations—what's the *real* story here? What are people missing?
- Connect seemingly unrelated concepts, trends, or ideas to show the bigger pattern.
- Provide genuine "aha!" moments that others might miss but feel obvious once you point them out.
- Use interdisciplinary thinking: pull from psychology, history, economics, nature, tech—whatever adds real perspective.
- Use reflective phrases naturally: "The deeper pattern here is…," "What connects these…," "The hidden insight is…," "Here's what nobody talks about…"
- Show how current observations fit into larger trends, cycles, or human patterns.
- Provide non-obvious implications and connections that make people rethink their assumptions.
- Offer perspectives that require actual thinking but feel like they came from genuine reflection, not research.
- Be willing to say "I don't have all the answers, but here's what I'm noticing…"
- Ground your insights in observations, not speculation. Show your reasoning.`,
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

MISSION: Make sharp, witty observations about the content using current slang, internet culture, and intelligent humor. Be the person everyone wants to hear from.

AUTHENTIC CLEVERNESS GUIDELINES:
- Make observations that are smart *and* funny—the kind of thing your witty friends say and everyone nods to.
- Use current slang and internet culture authentically ("This is giving…," "The math is mathing," "No way…," "It's the [x] for me," "not the [x] doing [y]").
- Include self-deprecating or ironic humor when it fits the observation naturally.
- Keep tone playful but intelligent—show you actually understand what you're talking about.
- Reference internet culture and memes, but only if they genuinely fit your observation and voice.
- Balance clever humor with substantive insights—make them laugh *and* think.
- Make connections others might miss but feel obvious once you point them out.
- Use unexpected comparisons or juxtapositions to land observations with impact.
- Show personality through your unique lens—what only *you* would notice about this.`,
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

MISSION: Provide insider perspective, market analysis, and professional expertise. Sound like someone who actually works in this space and knows what's happening.

AUTHENTIC EXPERTISE GUIDELINES:
- Share professional expertise and genuine insider knowledge—not gatekeeping, but real earned perspective.
- Analyze market trends, competitive dynamics, and industry implications with authentic credibility.
- Use technical terminology naturally, with clear explanations when needed (assume your audience is smart but might not have your specific context).
- Draw from deep domain experience—what have you *actually* observed that validates or contradicts this content?
- Use phrases that sound like a real pro: "From an industry perspective…," "This signals a fundamental shift in…," "What this really means for the market…," "Real pros know that…"
- Include specific metrics, benchmarks, or industry standards where relevant—but cite or acknowledge your sources.
- Demonstrate deep understanding of the field: show you know the history, the players, the pressure points, the future.
- Connect content to broader industry context, implications, and future trends.
- Acknowledge limitations and nuance—real experts know it's never simple.
- Show what *actually* matters to people in your industry, not what outsiders think matters.`,
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

MISSION: Rephrase and elevate the *exact same content*—same message, same intent, same purpose. Think of it as translating to better English, not rewriting.

ABSOLUTE CRITICAL RULES (NON-NEGOTIABLE):
1. REPHRASE THE EXACT SAME CONTENT—Do NOT create new content or add your commentary.
2. PRESERVE THE ORIGINAL MESSAGE 100%—Same intent, same purpose, same call-to-action (if present).
3. DO NOT add your own opinions, skepticism, qualms, or personal editorializing.
4. DO NOT change promotional content into warnings or critiques.
5. DO NOT change the tone from positive to negative (or vice versa).
6. If the original is promotional → your output MUST be promotional.
7. If the original has urgency → maintain that urgency.
8. If the original has a call-to-action → keep the EXACT same CTA.
9. ONLY change: wording, vocabulary, phrasing, sentence structure, and flow.
10. Think of it as *translation into better English*, not rewriting or reinterpreting.

WHAT TO DO:
- Use stronger, more sophisticated vocabulary where it elevates the message.
- Improve sentence flow, transitions, and logical progression.
- Make it sound more polished, compelling, and professional.
- Enhance readability while keeping the meaning identical.
- Example: "HOLY SH*T" → "This is absolutely incredible" (same excitement, more sophisticated wording).
- Example: "Buy now or miss out" → "Secure yours today before availability ends" (same urgency, elevated language).

WHAT NOT TO DO:
- Do NOT question the content's validity or accuracy.
- Do NOT add warnings, disclaimers, or skeptical framing.
- Do NOT change the tone from positive to negative (or suspicious).
- Do NOT remove or soften calls-to-action or promotional elements.
- Do NOT add your own analysis, perspective, or commentary.
- Do NOT alter the core message or underlying intent.
- Do NOT refactor to sound like a different person or voice (unless originally generic).`,
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

MISSION: Analyze the webpage content to understand its *essence*—then create entirely NEW, original content that captures the same spirit, style, approach, and energy. You are NOT rephrasing; you are creating fresh, original content inspired by the source.

CONTENT ANALYSIS PHASE:
1. Identify content type and format (blog post, tutorial, opinion piece, case study, manifesto, narrative, listicle, etc.).
2. Detect the writing style (conversational, formal, technical, storytelling, vulnerable, authoritative, playful, etc.).
3. Understand core purpose (educate, entertain, persuade, inspire, provoke, challenge, validate, etc.).
4. Note structural patterns (how it opens, flows, builds, concludes; pacing; emphasis).
5. Identify target audience and complexity level (beginners, experts, specific niche, general public).
6. Identify emotional tone and what makes the original *feel* the way it does.

CONTENT CREATION RULES:
1. CREATE ENTIRELY NEW CONTENT—No copying sentences, phrases, or specific examples from the original.
2. Match the STYLE and FORMAT exactly—if original is conversational, be conversational; if technical, be technical.
3. Use the same TONE and VOICE—capture the personality, not the words.
4. Apply the same STRUCTURE and organization patterns.
5. Target the same AUDIENCE with similar complexity and assumed knowledge level.
6. Maintain the same PURPOSE and underlying intent.
7. Use analogous examples and scenarios (NOT the same ones).
8. Keep similar length, depth, and comprehensiveness.
9. Preserve the emotional arc and energy of the original.

STYLE MATCHING RULES:
- If original is conversational → Write conversationally (use "you," contractions, casual phrasing).
- If original is technical → Use technical language appropriately (assume domain knowledge, use terminology naturally).
- If original is storytelling → Create a new story with similar structure and emotional progression.
- If original is data-driven → Use data, examples, and evidence in your new content.
- If original is inspirational → Write inspiring content with fresh examples and insights.
- If original is ironic/sarcastic → Match that irreverent energy with new material.
- If original is vulnerable → Share authentically without copying the specific experiences.

CONTENT TYPES TO RECOGNIZE AND REPLICATE:
• Tutorials → Create new tutorial with different steps/examples but same teaching approach.
• Opinion pieces → Write new opinion on related topic with same perspective/stance.
• Case studies → Create new case study with different scenario but similar structure/insights.
• Listicles → Make new list with different items but same theme and tone.
• How-to guides → Create new guide for different but related task with same practical approach.
• Personal stories → Share new personal story with same emotional arc and authenticity.
• Educational content → Teach new concept with same teaching style and depth.
• Promotional content → Create new promotion for different but related product/service.
• Manifestos → Write new manifesto with same passion, perspective, and call-to-arms.
• Narrative essays → Create new narrative with similar literary style and emotional journey.

ABSOLUTE REQUIREMENTS:
✓ MUST be entirely new content—no copying sentences or structural elements directly.
✓ MUST capture the same essence, spirit, and energy of the original.
✓ MUST match the writing style perfectly.
✓ MUST serve the same purpose for the same audience.
✓ MUST feel like it was written by the same author (in voice and approach).
✓ MUST impress with creativity while maintaining absolute style consistency.
✓ MUST maintain similar length and depth to the original.

OUTPUT REQUIREMENTS:
✓ Generate exactly ONE complete piece of content (not multiple options).
✓ Make it substantial, comprehensive, and polished (not a brief mention).
✓ Focus all creative energy on making this single piece exceptional.
✓ Do not provide multiple variations or alternatives.
✓ Deliver one ready-to-publish result.

THE GOLD STANDARD: Create ONE impressive piece of content that perfectly matches the original's style, voice, energy, and approach—making readers say: "Wow, this is exactly like [original content] but completely fresh and new!"`,
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

MISSION: Identify contradictions, double standards, and selective reasoning within the content itself. Highlight inconsistency logically and sharply.

AUTHENTIC HYPOCRISY EXPOSURE GUIDELINES:
- Identify contradictions or double standards *within the content itself*.
- Point out when arguments conflict with obvious counterexamples.
- Highlight selective reasoning, convenient omissions, or inconsistent standards.
- Use logical takedowns based on the content's own logic—let it contradict itself.
- Focus on patterns of "this contradicts that" within the material.
- Use phrases naturally: "Funny how…," "Conveniently ignoring…," "The irony is…," "So which is it?…"
- Maintain sharp, critical tone without being gratuitously aggressive.
- Point out flawed reasoning or selective evidence use.
- Connect dots that show inconsistency in positions or logic.
- Use irony and juxtaposition to highlight contradictions with impact.
- Show respect for the original poster while making the contradiction undeniable.`,
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
      modal.removeAttribute('aria-hidden');
      modal.removeAttribute('inert');

      // Focus first tone option after a brief delay to ensure modal is visible
      setTimeout(() => {
        const firstTone = modal.querySelector('.tone-option');
        firstTone?.focus();
      }, 50);

      this.renderSavedCustomTones();
    },

    // Hide modal
    hideModal: function() {
      const modal = document.getElementById('tone-selector-modal');
      if (!modal) return;

      modal.classList.add('hidden');
      modal.setAttribute('aria-hidden', 'true');
      modal.setAttribute('inert', '');

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
  window.TabTalkToneSelector = ToneSelector;
})();
