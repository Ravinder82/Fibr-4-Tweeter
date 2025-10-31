// Enhanced Quick Actions Modal: Advanced thread generation with AI-powered features
(function() {
  const EnhancedQuickActions = {
    // Current state
    selectedPersona: 'educator',
    selectedFormat: 'myth-busting',
    currentTopic: '',
    selectedHook: '',
    generatedThread: null,

    // Persona definitions with AI instructions (8 personas)
    personas: {
      educator: {
        name: 'Educator',
        emoji: '🎓',
        instructions: 'Write as a patient teacher who breaks down complex topics into simple, digestible lessons. Use clear examples and encouraging language. Focus on helping the reader understand and grow. Include educational moments and learning takeaways.',
        hookDensity: 'medium',
        sentenceLength: 'medium',
        verbStyle: 'explanatory',
        ctaStyle: 'learning-focused'
      },
      operator: {
        name: 'Operator',
        emoji: '⚙️',
        instructions: 'Write as a practical builder who focuses on execution and results. Use direct, no-nonsense language. Emphasize systems, processes, and measurable outcomes. Include actionable steps and implementation details.',
        hookDensity: 'low',
        sentenceLength: 'short',
        verbStyle: 'action-oriented',
        ctaStyle: 'implementation-focused'
      },
      analyst: {
        name: 'Analyst',
        emoji: '📊',
        instructions: 'Write as a data-driven expert who backs claims with evidence and logical reasoning. Use precise language and structured arguments. Include statistics, trends, and analytical insights. Maintain objectivity and credibility.',
        hookDensity: 'medium',
        sentenceLength: 'long',
        verbStyle: 'analytical',
        ctaStyle: 'insight-focused'
      },
      entertainer: {
        name: 'Entertainer',
        emoji: '🎭',
        instructions: 'Write as an engaging storyteller who captivates with humor, drama, and personality. Use vivid language, emotional appeal, and entertaining anecdotes. Include surprising twists and memorable moments.',
        hookDensity: 'high',
        sentenceLength: 'varied',
        verbStyle: 'expressive',
        ctaStyle: 'engagement-focused'
      },
      visionary: {
        name: 'Visionary',
        emoji: '🔮',
        instructions: 'Write as a forward-thinking leader who paints pictures of what is possible. Use inspiring, future-focused language. Emphasize transformation, innovation, and paradigm shifts. Include bold predictions and visionary insights.',
        hookDensity: 'high',
        sentenceLength: 'long',
        verbStyle: 'transformational',
        ctaStyle: 'future-focused'
      },
      storyteller: {
        name: 'Storyteller',
        emoji: '📚',
        instructions: 'Write as a master storyteller who weaves narratives that teach and inspire. Use classic story structures, character development, and narrative arcs. Include personal anecdotes, metaphors, and story-driven examples.',
        hookDensity: 'medium',
        sentenceLength: 'varied',
        verbStyle: 'narrative',
        ctaStyle: 'story-focused'
      },
      scientist: {
        name: 'Scientist',
        emoji: '🔬',
        instructions: 'Write as a rigorous researcher who explores topics through scientific inquiry. Use precise, evidence-based language. Emphasize hypotheses, experiments, and data-driven conclusions. Include scientific method and logical reasoning.',
        hookDensity: 'low',
        sentenceLength: 'complex',
        verbStyle: 'investigative',
        ctaStyle: 'research-focused'
      },
      philosopher: {
        name: 'Philosopher',
        emoji: '🤔',
        instructions: 'Write as a deep thinker who explores fundamental questions and meanings. Use thoughtful, reflective language. Emphasize principles, ethics, and deeper truths. Include philosophical frameworks and wisdom insights.',
        hookDensity: 'low',
        sentenceLength: 'complex',
        verbStyle: 'reflective',
        ctaStyle: 'wisdom-focused'
      }
    },

    // Format definitions with thread skeletons
    formats: {
      'myth-busting': {
        name: 'Myth‑busting',
        emoji: '🧱',
        skeleton: 'Hook (challenge common belief) → Why it is wrong → Evidence (3 bullet points) → What to do instead (steps) → CTA'
      },
      'status-shift': {
        name: 'Status Shift',
        emoji: '⚡',
        skeleton: 'Hook (unexpected realization) → Before vs After snapshot → Process (3-5 steps) → Proof → CTA'
      },
      'cheat-code': {
        name: 'Cheat Code',
        emoji: '🎮',
        skeleton: 'Hook (fast result promise) → Steps (ordered) → Common pitfalls → Bonus tip → CTA'
      },
      'analogy': {
        name: 'Analogy',
        emoji: '🔗',
        skeleton: 'Hook (analogy) → Map analogy → Apply to topic → Example → CTA'
      },
      'pain': {
        name: 'Pain Point',
        emoji: '💡',
        skeleton: 'Hook (identify pain) → Amplify why it matters → Root cause → Solution steps → Transformation → CTA'
      },
      'story': {
        name: 'Story',
        emoji: '📖',
        skeleton: 'Hook (story opening) → Challenge faced → Journey/process → Resolution/lesson → Application for reader → CTA'
      },
      'data': {
        name: 'Data Driven',
        emoji: '📊',
        skeleton: 'Hook (surprising stat) → Context behind the data → Implications → What it means for reader → Action steps → CTA'
      },
      'framework': {
        name: 'Framework',
        emoji: '🏗️',
        skeleton: 'Hook (mental model) → Explain framework components → How to apply → Examples → Benefits → CTA'
      },
      'future': {
        name: 'Future Focus',
        emoji: '🔮',
        skeleton: 'Hook (future prediction) → Current trends → Timeline → What to prepare → First steps → CTA'
      },
      'practical': {
        name: 'Practical',
        emoji: '⚙️',
        skeleton: 'Hook (practical problem) → Quick solution → Step-by-step guide → Pro tips → Results → CTA'
      },
      'controversial': {
        name: 'Controversial',
        emoji: '🔥',
        skeleton: 'Hook (controversial take) → Why people disagree → Your evidence → Counterarguments → Strong conclusion → CTA'
      },
      'inspirational': {
        name: 'Inspirational',
        emoji: '✨',
        skeleton: 'Hook (uplifting vision) → Current reality → Possibility → Motivational examples → Call to greatness → CTA'
      },
      'step-by-step': {
        name: 'Step‑by‑Step',
        emoji: '📝',
        skeleton: 'Hook (process promise) → Why this process → Step 1 → Step 2 → Step 3 → Common mistakes → Success tips → CTA'
      },
      'comparison': {
        name: 'Comparison',
        emoji: '⚖️',
        skeleton: 'Hook (comparison setup) → Option A analysis → Option B analysis → Decision criteria → Recommendation → CTA'
      },
      'case-study': {
        name: 'Case Study',
        emoji: '📋',
        skeleton: 'Hook (intriguing result) → Background → Challenge → Solution → Measurable results → Lessons → CTA'
      },
      'trend': {
        name: 'Trend Alert',
        emoji: '📈',
        skeleton: 'Hook (trend observation) → Evidence it is growing → Why it matters → How to leverage → Timeline → CTA'
      },
      'myth-busting-plus': {
        name: 'Myth+',
        emoji: '🧱',
        skeleton: 'Hook (bold myth claim) → Multiple myths busted → Deeper truth revealed → System-level change → New paradigm → CTA'
      },
      'quick-win': {
        name: 'Quick Win',
        emoji: '🏆',
        skeleton: 'Hook (immediate result) → Simple action → Quick proof → Scaling tip → Long-term benefit → CTA'
      },
      'deep-dive': {
        name: 'Deep Dive',
        emoji: '🤿',
        skeleton: 'Hook (complex question) → Surface-level answer → Deeper layers → Expert insight → Nuanced conclusion → CTA'
      },
      'checklist': {
        name: 'Checklist',
        emoji: '✅',
        skeleton: 'Hook (checklist promise) → Overview → Item 1 with details → Item 2 → Item 3 → Implementation tips → CTA'
      }
    },

    // Hook patterns from AIDA, PAS, Status Shift
    hookPatterns: [
      { type: 'AIDA Attention', template: 'What if I told you that [topic] could change everything?' },
      { type: 'AIDA Interest', template: 'The hidden truth about [topic] that nobody is talking about.' },
      { type: 'AIDA Desire', template: 'Imagine mastering [topic] in half the time it takes everyone else.' },
      { type: 'AIDA Action', template: 'Here is exactly how you can start with [topic] right now.' },
      { type: 'PAS Problem', template: '[Topic] is failing for 90% of people. Here is why.' },
      { type: 'PAS Agitate', template: 'Every time you struggle with [topic], you are making this one mistake.' },
      { type: 'PAS Solution', template: 'I finally cracked the code for [topic]. This changes everything.' },
      { type: 'Status Shift', template: 'Everything you know about [topic] is about to become obsolete.' },
      { type: 'Status Shift', template: 'The old rules of [topic] no longer apply. Here are the new ones.' },
      { type: 'Status Shift', template: 'Why experts are wrong about [topic] and what actually works.' }
    ],

    init() {
      this.bindEvents();
      this.loadStoredPreferences();
    },

    bindEvents() {
      // Enhanced generate button in thread generator view
      const generateBtn = document.getElementById('generate-thread-btn');
      if (generateBtn) {
        generateBtn.addEventListener('click', () => this.generateThread());
      }

      // Persona chips (works in both modal and view)
      document.addEventListener('click', (e) => {
        if (e.target.closest('.persona-chip')) {
          this.selectPersona(e.target.closest('.persona-chip').dataset.persona);
        }
        if (e.target.closest('.format-chip')) {
          this.selectFormat(e.target.closest('.format-chip').dataset.format);
        }
        if (e.target.closest('.hook-item')) {
          this.selectHook(e.target.closest('.hook-item').dataset.hook);
        }
      });

      // Hook generator (both modal and view)
      const generateHooksBtn = document.getElementById('generate-hooks-btn');
      const generateHooksBtnModal = document.getElementById('generate-hooks-btn-modal');
      if (generateHooksBtn) {
        generateHooksBtn.addEventListener('click', () => this.generateHooks());
      }
      if (generateHooksBtnModal) {
        generateHooksBtnModal.addEventListener('click', () => this.generateHooks('modal'));
      }

      // Trend fusion (both modal and view)
      const trendFusionBtn = document.getElementById('trend-fusion-btn');
      const trendFusionBtnModal = document.getElementById('trend-fusion-btn-modal');
      if (trendFusionBtn) {
        trendFusionBtn.addEventListener('click', () => this.generateTrendFusion());
      }
      if (trendFusionBtnModal) {
        trendFusionBtnModal.addEventListener('click', () => this.generateTrendFusion('modal'));
      }
    },

    showEnhancedModal() {
      // No longer needed - features are now integrated into thread generator view
    },

    hideModal() {
      // No longer needed - features are now integrated into thread generator view
    },

    selectPersona(personaId) {
      this.selectedPersona = personaId;
      document.querySelectorAll('.persona-chip').forEach(chip => {
        chip.classList.toggle('active', chip.dataset.persona === personaId);
      });
      this.savePreferences();
    },

    selectFormat(formatId) {
      this.selectedFormat = formatId;
      document.querySelectorAll('.format-chip').forEach(chip => {
        chip.classList.toggle('active', chip.dataset.format === formatId);
      });
      this.savePreferences();
    },

    selectHook(hookText) {
      this.selectedHook = hookText;
      document.querySelectorAll('.hook-item').forEach(item => {
        item.classList.toggle('selected', item.dataset.hook === hookText);
      });
    },

    async generateHooks(context = 'view') {
      const topicInputId = context === 'modal' ? 'thread-topic-modal' : 'thread-topic';
      const topicInput = document.getElementById(topicInputId);
      this.currentTopic = topicInput ? topicInput.value.trim() : '';
      
      if (!this.currentTopic) {
        this.showToast('Enter a topic first', 2000);
        return;
      }

      const btnId = context === 'modal' ? 'generate-hooks-btn-modal' : 'generate-hooks-btn';
      const generateBtn = document.getElementById(btnId);
      const originalText = generateBtn.textContent;
      generateBtn.textContent = '⏳ Generating...';
      generateBtn.disabled = true;

      try {
        const hooks = await this.callGeminiAPI(this.buildHooksPrompt());
        this.displayHooks(hooks, context);
      } catch (error) {
        console.error('Hook generation failed:', error);
        this.showToast('Failed to generate hooks', 3000);
      } finally {
        generateBtn.textContent = originalText;
        generateBtn.disabled = false;
      }
    },

    async generateTrendFusion(context = 'view') {
      const topicInputId = context === 'modal' ? 'thread-topic-modal' : 'thread-topic';
      const topicInput = document.getElementById(topicInputId);
      this.currentTopic = topicInput ? topicInput.value.trim() : '';
      
      if (!this.currentTopic) {
        this.showToast('Enter a topic first', 2000);
        return;
      }

      const btnId = context === 'modal' ? 'trend-fusion-btn-modal' : 'trend-fusion-btn';
      const fusionBtn = document.getElementById(btnId);
      const originalText = fusionBtn.textContent;
      fusionBtn.textContent = '⏳ Generating...';
      fusionBtn.disabled = true;

      try {
        const fusion = await this.callGeminiAPI(this.buildTrendFusionPrompt());
        this.displayTrendFusion(fusion, context);
      } catch (error) {
        console.error('Trend fusion failed:', error);
        this.showToast('Failed to generate trend fusion', 3000);
      } finally {
        fusionBtn.textContent = originalText;
        fusionBtn.disabled = false;
      }
    },

    async generateThread() {
      const topicInput = document.getElementById('thread-topic');
      this.currentTopic = topicInput.value.trim();
      
      if (!this.currentTopic) {
        this.showToast('Enter a topic first', 2000);
        return;
      }

      const generateBtn = document.getElementById('generate-thread-btn');
      const originalText = generateBtn.textContent;
      generateBtn.textContent = '⏳ Generating...';
      generateBtn.disabled = true;

      try {
        const thread = await this.callGeminiAPI(this.buildThreadPrompt());
        this.generatedThread = thread;
        
        // Display in chat view
        this.displayThreadResult(thread);
        
        // Save to gallery
        this.saveToGallery(thread, this.currentTopic, this.selectedFormat);
        
      } catch (error) {
        console.error('Thread generation failed:', error);
        this.showToast('Failed to generate thread', 3000);
      } finally {
        generateBtn.textContent = originalText;
        generateBtn.disabled = false;
      }
    },

    buildHooksPrompt() {
      const persona = this.personas[this.selectedPersona];
      return `Generate 10 powerful hooks for "${this.currentTopic}" using these frameworks:

${this.hookPatterns.map((pattern, index) => `${index + 1}. ${pattern.type}: ${pattern.template.replace('[topic]', this.currentTopic)}`).join('\n')}

INSTRUCTIONS:
- Use the ${persona.name} persona: ${persona.instructions}
- Make each hook compelling and unique
- Keep hooks under 280 characters
- No hashtags or URLs
- Return as a numbered list`;

    },

    buildTrendFusionPrompt() {
      const persona = this.personas[this.selectedPersona];
      return `Create an evergreen + trend fusion hook for "${this.currentTopic}".

STRUCTURE: "Why [trend] matters for [evergreen topic] over next 6 months"

REQUIREMENTS:
- Use the ${persona.name} persona: ${persona.instructions}
- Connect a current trend to the evergreen topic
- Make it urgent and relevant
- Under 280 characters
- No hashtags or URLs

Example: "Why AI automation matters for content creators over next 6 months"

Generate 3 options, pick the best one.`;

    },

    buildThreadPrompt() {
      const persona = this.personas[this.selectedPersona];
      const format = this.formats[this.selectedFormat];
      
      let prompt = `Create a Twitter thread about "${this.currentTopic}" using the ${format.name} framework.

PERSONA: ${persona.name}
${persona.instructions}

FORMAT STRUCTURE: ${format.skeleton}

THREAD REQUIREMENTS:
- 8-15 tweets max
- Start each tweet with: 1/n:, 2/n:, etc.
- Use natural emojis (2-4 per thread)
- No hashtags, no URLs, no source mentions
- Write as ${persona.name}: adjust sentence length, hooks, and CTAs accordingly

TOPIC: ${this.currentTopic}`;

      if (this.selectedHook) {
        prompt += `\n\nSTARTING HOOK: Begin the first tweet with exactly: "${this.selectedHook}"`;
      }

      prompt += `\n\nGenerate the complete thread now:`;

      return prompt;
    },

    displayHooks(hooks, context = 'view') {
      const containerId = context === 'modal' ? 'hooks-container-modal' : 'hooks-container';
      const container = document.getElementById(containerId);
      if (!container) return;

      const hookList = this.parseHookList(hooks);
      
      container.innerHTML = hookList.map((hook, index) => `
        <div class="hook-item" data-hook="${hook.text}">
          <div class="hook-text">${hook.text}</div>
          <div class="hook-type">${hook.type}</div>
        </div>
      `).join('');

      container.classList.remove('hidden');
    },

    displayTrendFusion(fusion, context = 'view') {
      const resultId = context === 'modal' ? 'trend-result-modal' : 'trend-result';
      const resultDiv = document.getElementById(resultId);
      if (!resultDiv) return;

      // Extract the best option from AI response
      const lines = fusion.split('\n');
      const bestOption = lines.find(line => 
        line.includes('Why') && line.includes('matters') && line.includes('over next 6 months')
      ) || fusion.trim();

      resultDiv.textContent = bestOption;
      resultDiv.classList.remove('hidden');
    },

    parseHookList(hookText) {
      const lines = hookText.split('\n');
      const hooks = [];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const match = line.match(/^\d+\.\s*(.+)$/);
        if (match) {
          const hookType = this.hookPatterns[Math.min(i, this.hookPatterns.length - 1)].type;
          hooks.push({ text: match[1], type: hookType });
        }
      }
      
      // Fallback: generate hooks from patterns if parsing failed
      if (hooks.length === 0) {
        return this.hookPatterns.slice(0, 10).map(pattern => ({
          text: pattern.template.replace('[topic]', this.currentTopic),
          type: pattern.type
        }));
      }
      
      return hooks.slice(0, 10);
    },

    displayThreadResult(thread) {
      // Switch to chat view and display the thread
      if (window.TabTalkNavigation) {
        window.TabTalkNavigation.showView('chat');
      }
      
      // Create thread card
      const threadCard = {
        type: 'thread',
        content: thread,
        title: this.currentTopic,
        timestamp: new Date().toISOString(),
        tags: [this.selectedFormat, this.selectedPersona]
      };

      // Add to messages container
      const messagesContainer = document.getElementById('messages-container');
      if (messagesContainer && window.TabTalkUI && window.TabTalkUI.renderCard) {
        const cardElement = window.TabTalkUI.renderCard(threadCard);
        messagesContainer.appendChild(cardElement);
      }
    },

    async callGeminiAPI(prompt) {
      if (!window.TabTalkAPI?.callGeminiAPI) {
        throw new Error('API not available');
      }
      return await window.TabTalkAPI.callGeminiAPI(prompt);
    },

    saveToGallery(thread, topic, format) {
      if (!window.TabTalkGallery) return;
      
      const content = {
        id: Date.now().toString(),
        title: topic,
        content: thread,
        timestamp: new Date().toISOString(),
        tags: [format, this.selectedPersona],
        platform: 'thread'
      };
      
      window.TabTalkGallery.saveContent(content);
    },

    loadStoredPreferences() {
      chrome.storage.local.get(['enhancedPersona', 'enhancedFormat'], (result) => {
        if (result.enhancedPersona) this.selectPersona(result.enhancedPersona);
        if (result.enhancedFormat) this.selectFormat(result.enhancedFormat);
      });
    },

    savePreferences() {
      chrome.storage.local.set({
        enhancedPersona: this.selectedPersona,
        enhancedFormat: this.selectedFormat
      });
    },

    showToast(message, duration = 3000) {
      if (window.TabTalkUI?.showToast) {
        window.TabTalkUI.showToast(message, duration);
      } else {
        console.log('Toast:', message);
      }
    }
  };

  // Expose globally
  window.TabTalkEnhancedQuickActions = EnhancedQuickActions;

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => EnhancedQuickActions.init());
  } else {
    EnhancedQuickActions.init();
  }
})();
