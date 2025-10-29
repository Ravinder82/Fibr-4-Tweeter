// Click Farming Module: Engagement-optimized content generation for viral posts
(function() {
  const ClickFarming = {
    // Current state
    selectedContentType: 'digital-product',
    selectedHookStyle: 'scarcity',
    selectedCTA: 'like-reply-dm',
    currentTopic: '',
    selectedProductType: '',
    generatedIdeas: [],

    // Content type definitions with engagement strategies
    contentTypes: {
      'digital-product': {
        name: 'Digital Product',
        emoji: '📦',
        description: 'Promote downloadable resources, guides, templates',
        engagementTactics: ['scarcity', 'social-proof', 'urgency']
      },
      'controversial': {
        name: 'Controversial Take',
        emoji: '🔥',
        description: 'Bold opinions that spark debate',
        engagementTactics: ['controversy', 'curiosity', 'fomo']
      },
      'results': {
        name: 'Results Showcase',
        emoji: '💰',
        description: 'Share impressive metrics and outcomes',
        engagementTactics: ['social-proof', 'curiosity', 'urgency']
      },
      'tutorial': {
        name: 'Tutorial Tease',
        emoji: '🎓',
        description: 'Preview of valuable how-to content',
        engagementTactics: ['curiosity', 'scarcity', 'urgency']
      },
      'question': {
        name: 'Engagement Question',
        emoji: '❓',
        description: 'Questions that demand responses',
        engagementTactics: ['curiosity', 'controversy', 'social-proof']
      },
      'ai-workflow': {
        name: 'AI Workflow',
        emoji: '🤖',
        description: 'Automation and AI tool showcases',
        engagementTactics: ['curiosity', 'urgency', 'fomo']
      }
    },

    // Hook style definitions
    hookStyles: {
      'scarcity': {
        name: 'Scarcity',
        emoji: '⏰',
        pattern: 'Limited availability, exclusive access, time-sensitive',
        examples: ['Only 50 spots left', 'Available for 24 hours only', 'Before it\'s gone']
      },
      'curiosity': {
        name: 'Curiosity Gap',
        emoji: '🧠',
        pattern: 'Incomplete information that demands completion',
        examples: ['You won\'t believe what happened', 'The secret nobody talks about', 'What I discovered']
      },
      'social-proof': {
        name: 'Social Proof',
        emoji: '👥',
        pattern: 'Numbers, testimonials, popularity indicators',
        examples: ['10,000+ people already using', 'Viral on Twitter', 'Everyone is talking about']
      },
      'urgency': {
        name: 'Urgency',
        emoji: '⚡',
        pattern: 'Time pressure, immediate action required',
        examples: ['Act now', 'Don\'t miss this', 'Last chance']
      },
      'controversy': {
        name: 'Controversy',
        emoji: '💥',
        pattern: 'Polarizing statements, challenge status quo',
        examples: ['Unpopular opinion', 'Everyone is wrong about', 'The truth they hide']
      },
      'fomo': {
        name: 'FOMO',
        emoji: '😱',
        pattern: 'Fear of missing out, competitive advantage',
        examples: ['While you sleep, others are', 'Your competitors already know', 'Don\'t get left behind']
      }
    },

    // CTA type definitions
    ctaTypes: {
      'like-reply-dm': {
        name: 'Like + Reply + DM',
        template: '❤️ Like this\n💬 Reply "[KEYWORD]"\n📩 I\'ll DM you [PRODUCT]',
        engagement: ['like', 'reply', 'dm']
      },
      'retweet-follow': {
        name: 'Retweet + Follow',
        template: '🔄 Retweet this\n👤 Follow me\n📩 I\'ll DM you [PRODUCT]',
        engagement: ['retweet', 'follow', 'dm']
      },
      'reply-keyword': {
        name: 'Reply Keyword',
        template: '💬 Reply "[KEYWORD]" and I\'ll send you [PRODUCT]',
        engagement: ['reply', 'dm']
      },
      'engagement-combo': {
        name: 'Full Combo',
        template: '❤️ Like\n💬 Reply "[KEYWORD]"\n🔄 Retweet\n👤 Follow me\n\n📩 I\'ll DM you [PRODUCT] FREE',
        engagement: ['like', 'reply', 'retweet', 'follow', 'dm']
      }
    },

    init() {
      this.bindEvents();
      this.loadStoredPreferences();
    },

    bindEvents() {
      // Modal open button
      const clickFarmingBtn = document.getElementById('quick-click-farming');
      if (clickFarmingBtn) {
        clickFarmingBtn.addEventListener('click', () => this.showModal());
      }

      // ESC key to close
      document.addEventListener('keydown', (e) => {
        const modal = document.getElementById('click-farming-modal');
        if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
          this.hideModal();
        }
      });

      // Chip selections - use event delegation
      document.addEventListener('click', (e) => {
        if (e.target.closest('.content-type-chip')) {
          this.selectContentType(e.target.closest('.content-type-chip').dataset.type);
        }
        if (e.target.closest('.hook-style-chip')) {
          this.selectHookStyle(e.target.closest('.hook-style-chip').dataset.style);
        }
        if (e.target.closest('.cta-type-chip')) {
          this.selectCTA(e.target.closest('.cta-type-chip').dataset.cta);
        }
        if (e.target.closest('.idea-item')) {
          this.selectIdea(e.target.closest('.idea-item').dataset.idea);
        }
        
        // Modal close buttons
        if (e.target.closest('#close-click-farming-modal') || e.target.closest('#cancel-click-farming')) {
          this.hideModal();
        }
        
        // Modal overlay click
        if (e.target.classList.contains('modal-overlay')) {
          this.hideModal();
        }
        
        // Generate ideas button
        if (e.target.closest('#generate-ideas-btn')) {
          e.preventDefault();
          this.generateIdeas();
        }
        
        // Generate post button
        if (e.target.closest('#generate-click-farming')) {
          e.preventDefault();
          this.generatePost();
        }
      });
    },

    showModal() {
      const modal = document.getElementById('click-farming-modal');
      if (modal) {
        modal.classList.remove('hidden');
        // Focus on topic input
        const topicInput = document.getElementById('click-farming-topic');
        if (topicInput) {
          setTimeout(() => topicInput.focus(), 100);
        }
      }
    },

    hideModal() {
      const modal = document.getElementById('click-farming-modal');
      if (modal) {
        modal.classList.add('hidden');
      }
    },

    selectContentType(type) {
      this.selectedContentType = type;
      document.querySelectorAll('.content-type-chip').forEach(chip => {
        chip.classList.toggle('active', chip.dataset.type === type);
      });
      this.savePreferences();
    },

    selectHookStyle(style) {
      this.selectedHookStyle = style;
      document.querySelectorAll('.hook-style-chip').forEach(chip => {
        chip.classList.toggle('active', chip.dataset.style === style);
      });
      this.savePreferences();
    },

    selectCTA(cta) {
      this.selectedCTA = cta;
      document.querySelectorAll('.cta-type-chip').forEach(chip => {
        chip.classList.toggle('active', chip.dataset.cta === cta);
      });
      this.savePreferences();
    },

    selectIdea(ideaText) {
      const topicInput = document.getElementById('click-farming-topic');
      if (topicInput) {
        topicInput.value = ideaText;
        this.currentTopic = ideaText;
      }
      document.querySelectorAll('.idea-item').forEach(item => {
        item.classList.toggle('selected', item.dataset.idea === ideaText);
      });
    },

    async generateIdeas() {
      const topicInput = document.getElementById('click-farming-topic');
      const baseTopic = topicInput ? topicInput.value.trim() : '';
      
      const generateBtn = document.getElementById('generate-ideas-btn');
      const originalText = generateBtn.textContent;
      generateBtn.textContent = '⏳ Generating...';
      generateBtn.disabled = true;

      try {
        const ideas = await this.callGeminiAPI(this.buildIdeasPrompt(baseTopic));
        this.displayIdeas(ideas);
      } catch (error) {
        console.error('Idea generation failed:', error);
        this.showToast('Failed to generate ideas', 3000);
      } finally {
        generateBtn.textContent = originalText;
        generateBtn.disabled = false;
      }
    },

    async generatePost() {
      console.log('Click Farming: generatePost() called');
      const topicInput = document.getElementById('click-farming-topic');
      this.currentTopic = topicInput ? topicInput.value.trim() : '';
      console.log('Click Farming: currentTopic =', this.currentTopic);
      
      if (!this.currentTopic) {
        console.log('Click Farming: No topic entered');
        this.showToast('Enter a topic first', 2000);
        return;
      }

      const productTypeSelect = document.getElementById('product-type');
      this.selectedProductType = productTypeSelect ? productTypeSelect.value : '';
      console.log('Click Farming: selectedProductType =', this.selectedProductType);

      const generateBtn = document.getElementById('generate-click-farming');
      const originalText = generateBtn.textContent;
      generateBtn.textContent = '⏳ Generating...';
      generateBtn.disabled = true;

      try {
        console.log('Click Farming: Building post prompt...');
        const prompt = this.buildPostPrompt();
        console.log('Click Farming: Prompt built, calling API...');
        
        const post = await this.callGeminiAPI(prompt);
        console.log('Click Farming: API response received, length:', post?.length);
        
        // Display in chat view
        this.displayPostResult(post);
        
        // Hide modal
        this.hideModal();
        
        this.showToast('Post generated successfully!', 2000);
      } catch (error) {
        console.error('Click Farming: Post generation failed:', error);
        this.showToast('Failed to generate post: ' + error.message, 3000);
      } finally {
        generateBtn.textContent = originalText;
        generateBtn.disabled = false;
      }
    },

    buildIdeasPrompt(baseTopic) {
      const contentType = this.contentTypes[this.selectedContentType];
      
      return `Generate 5 viral Twitter post ideas for engagement farming.

CONTENT TYPE: ${contentType.name}
${contentType.description}

${baseTopic ? `BASE TOPIC: ${baseTopic}` : 'Generate diverse ideas across popular niches'}

REQUIREMENTS:
- Each idea should be highly engaging and clickable
- Focus on topics that naturally encourage replies, likes, and retweets
- Include specific angles (numbers, results, tools, etc.)
- Make them feel exclusive and valuable
- Keep each idea concise (1-2 sentences)

POPULAR NICHES TO CONSIDER:
- AI automation and tools
- Content creation shortcuts
- Money-making methods
- Productivity hacks
- Social media growth
- Design resources
- Coding/development tools

FORMAT: Return as a numbered list (1-5)

Generate 5 viral ideas now:`;
    },

    buildPostPrompt() {
      const contentType = this.contentTypes[this.selectedContentType];
      const hookStyle = this.hookStyles[this.selectedHookStyle];
      const ctaType = this.ctaTypes[this.selectedCTA];

      // World-class system prompt for engagement farming
      return `You are the world's best viral Twitter content strategist specializing in engagement farming and digital product promotion. Your posts consistently generate 10,000+ impressions and hundreds of engagements.

TASK: Create a high-engagement Twitter post about "${this.currentTopic}"

CONTENT TYPE: ${contentType.name}
- ${contentType.description}
- Recommended tactics: ${contentType.engagementTactics.join(', ')}

HOOK STYLE: ${hookStyle.name}
- Pattern: ${hookStyle.pattern}
- Examples: ${hookStyle.examples.join(' | ')}

CALL-TO-ACTION: ${ctaType.name}
- Template: ${ctaType.template}
- Engagement types: ${ctaType.engagement.join(', ')}

${this.selectedProductType ? `DIGITAL PRODUCT TYPE: ${this.selectedProductType}` : ''}

VIRAL POST STRUCTURE:

1. **HOOK (First Line)** - Must stop the scroll
   - Use ${hookStyle.name} technique
   - Include specific numbers, timeframes, or bold claims
   - Create curiosity gap or emotional trigger
   - Examples:
     * "12 days. 11.7M views. $16.7K in ad revenue."
     * "HOLY SH*T... This AI Agent does everything"
     * "I heard Su-30s smoked several Western fighters..."

2. **VALUE PROPOSITION (2-4 lines)** - What they get
   - Be ultra-specific about the benefit
   - Use bullet points or line breaks for scannability
   - Include credibility markers (results, social proof)
   - Make it feel exclusive and valuable

3. **SOCIAL PROOF / CREDIBILITY (Optional)**
   - Numbers, testimonials, or authority signals
   - "Built in n8n", "Used by 10,000+ creators"
   - Results or case study snippets

4. **ENGAGEMENT MECHANISM** - The farming part
   - Clear, simple instructions
   - Use emojis for each action (❤️ 💬 🔄 👤)
   - Create urgency or scarcity
   - Make keyword memorable and relevant

5. **CALL-TO-ACTION** - The hook for DMs
   ${ctaType.template.replace('[KEYWORD]', this.generateKeyword()).replace('[PRODUCT]', this.generateProductName())}

ENGAGEMENT PSYCHOLOGY PRINCIPLES:
✅ Reciprocity: Offer value first, ask for engagement
✅ Scarcity: Limited time, spots, or availability
✅ Social Proof: Numbers, popularity, testimonials
✅ Authority: Expertise, results, credentials
✅ Curiosity Gap: Incomplete information that demands completion
✅ FOMO: Fear of missing out on opportunity
✅ Specificity: Exact numbers, timeframes, results

FORMATTING RULES:
- Use line breaks for readability
- Include 3-5 relevant emojis (not excessive)
- Keep total length under 280 characters OR use thread format (1/n, 2/n)
- Use ALL CAPS sparingly for emphasis
- Include ellipsis (...) for dramatic pauses
- Use bullet points (→ or •) for lists

KEYWORD STRATEGY:
- Choose a memorable, relevant keyword (e.g., "SHORTS", "Steal", "AI", "FREE")
- Make it easy to type and remember
- Relate to the content topic

EXAMPLES OF VIRAL ENGAGEMENT POSTS:

Example 1 (Digital Product):
"Untapped Goldmine: YouTube Shorts

12 days. 11.7M views. $16.7K in ad revenue.

All I do? Cut trending long-form videos into short clips.

AI handles editing + uploads.

Almost no one is monetizing Shorts

Reply "SHORTS" like & Retweet — I'll DM you Follow Me"

Example 2 (AI Workflow):
"HOLY SH*T… This AI Agent does everything 

Built in n8n :
 → Clones viral TikToks
 → Rewrites w/ GPT-4o
 → Auto creates avatar videos
 → Adds captions & edits
 → Posts to 9 platforms (TikTok, IG, YT, X…)

❤️ Like+RT
💬 Reply "Steal"
👤 Follow me & I'll DM you workflow FREE."

Example 3 (Controversial):
"I heard Su-30s smoked several Western fighters in Spain in the exercise where IAF was invited.

Can someone confirm this?"

Example 4 (Tutorial Tease):
"Create your own 𝗛𝗬𝗣𝗘𝗥 𝗥𝗘𝗔𝗟 𝗧𝗜𝗡𝗬 version

→ Open Seedream 4.0 or Gemini Nano Banana
→ Upload your photo
→ Paste the prompt (Prompt in ALT)

Your tiny self is ready!

Reply "TINY" for the full guide"

CRITICAL SUCCESS FACTORS:
1. First line MUST hook within 2 seconds
2. Value proposition MUST be crystal clear
3. CTA MUST be simple and actionable
4. Create urgency or scarcity
5. Make engagement feel rewarding
6. Use proven psychological triggers

TOPIC: ${this.currentTopic}

CRITICAL OUTPUT INSTRUCTIONS:
- Generate ONLY the viral post content
- DO NOT include explanations, strategies, or analysis
- DO NOT provide multiple options or variations
- DO NOT explain why the post works
- NO "Explanation of Choices" or "Why this should work" sections
- Output must be ready-to-post content ONLY

Now generate the perfect viral engagement post:`;
    },

    generateKeyword() {
      const keywords = {
        'digital-product': ['FREE', 'SEND', 'GUIDE', 'PACK', 'TEMPLATE'],
        'controversial': ['DEBATE', 'THOUGHTS', 'OPINION', 'TAKE', 'VIEW'],
        'results': ['RESULTS', 'METHOD', 'SYSTEM', 'STRATEGY', 'BLUEPRINT'],
        'tutorial': ['TUTORIAL', 'GUIDE', 'STEPS', 'HOW', 'LEARN'],
        'question': ['ANSWER', 'REPLY', 'THOUGHTS', 'YES', 'NO'],
        'ai-workflow': ['AI', 'WORKFLOW', 'AUTOMATION', 'TOOL', 'AGENT']
      };
      
      const options = keywords[this.selectedContentType] || ['INFO'];
      return options[Math.floor(Math.random() * options.length)];
    },

    generateProductName() {
      const products = {
        'digital-product': ['the complete guide', 'the full template', 'the resource pack'],
        'controversial': ['my full analysis', 'the detailed breakdown'],
        'results': ['the exact method', 'the full system', 'the complete strategy'],
        'tutorial': ['the step-by-step guide', 'the full tutorial', 'the complete walkthrough'],
        'question': ['my detailed answer', 'the full explanation'],
        'ai-workflow': ['the workflow', 'the automation', 'the complete setup']
      };
      
      const options = products[this.selectedContentType] || ['the resource'];
      return options[Math.floor(Math.random() * options.length)];
    },

    displayIdeas(ideasText) {
      const container = document.getElementById('ideas-container');
      if (!container) return;

      const ideas = this.parseIdeasList(ideasText);
      
      container.innerHTML = ideas.map((idea, index) => `
        <div class="idea-item" data-idea="${idea}">
          <div class="idea-number">${index + 1}</div>
          <div class="idea-text">${idea}</div>
        </div>
      `).join('');

      container.classList.remove('hidden');
    },

    parseIdeasList(text) {
      const lines = text.split('\n');
      const ideas = [];
      
      for (let line of lines) {
        const match = line.trim().match(/^\d+\.\s*(.+)$/);
        if (match) {
          ideas.push(match[1]);
        }
      }
      
      return ideas.length > 0 ? ideas.slice(0, 5) : [
        'AI automation workflow for content creators',
        'YouTube Shorts monetization strategy',
        'Viral Twitter growth tactics',
        'Design template collection',
        'Productivity system blueprint'
      ];
    },

    displayPostResult(post) {
      console.log('Click Farming: displayPostResult() called with post length:', post?.length);
      
      // Switch to chat view
      if (window.TabTalkNavigation) {
        window.TabTalkNavigation.showView('chat');
      }

      // Get messages container
      const messagesContainer = document.getElementById('messages-container');
      if (!messagesContainer) {
        console.error('Click Farming: messages-container not found');
        this.showToast('Failed to display post - container not found', 3000);
        return;
      }

      // Clean up the post content (remove AI prefaces and normalize)
      const cleanContent = window.TabTalkUI ? window.TabTalkUI.cleanPostContent(post) : this.cleanPostContent(post);
      
      // Convert to HTML for display (preserve line breaks)
      const contentHtml = cleanContent.replace(/\n/g, '<br>');

      // Create card using the standardized UI renderCard method
      const card = window.TabTalkUI.renderCard('🎯 Click Farming Post', contentHtml, {
        contentType: 'click-farming',
        contentId: Date.now().toString(),
        markdown: cleanContent,
        platform: 'click-farming',
        hookStyle: this.selectedHookStyle,
        cta: this.selectedCTA,
        topic: this.currentTopic
      });

      // Add metadata to the card for reference
      if (card) {
        card.dataset.platform = 'click-farming';
        card.dataset.contentType = this.selectedContentType;
        card.dataset.hookStyle = this.selectedHookStyle;
        card.dataset.cta = this.selectedCTA;
        card.dataset.topic = this.currentTopic;

        // Live-only image prompt generation if enabled
        try {
          const includePrompt = document.getElementById('include-click-farming-image-prompt')?.checked;
          if (includePrompt && window.TabTalkImagePromptGenerator) {
            (async () => {
              try {
                const contentId = `click_${Date.now()}`;
                const prompt = await window.TabTalkImagePromptGenerator.generatePromptForCard(contentId, cleanContent);
                if (prompt) {
                  // Attach to card for copy, but do not persist to Gallery
                  card.dataset.imagePrompt = encodeURIComponent(prompt);
                  // Inject UI block under content
                  const contentEl = card.querySelector('.twitter-card-content');
                  if (contentEl && !card.querySelector('.image-prompt-display')) {
                    const promptEl = document.createElement('div');
                    promptEl.className = 'image-prompt-display';
                    promptEl.innerHTML = `
                      <div class="image-prompt-label">🖼️ Nano Banana Prompt (9:16)</div>
                      <div class="image-prompt-text">${window.TabTalkUI?.escapeHtml ? window.TabTalkUI.escapeHtml(prompt) : prompt}</div>
                    `;
                    contentEl.appendChild(promptEl);
                  }
                }
              } catch (e) {
                console.warn('Click Farming: image prompt generation failed:', e);
              }
            })();
          }
        } catch (e) {
          console.warn('Click Farming: image prompt option handling failed:', e);
        }
      }
      
      // Scroll to bottom to show the new content
      setTimeout(() => {
        messagesContainer.scrollTo({
          top: messagesContainer.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
      
      console.log('Click Farming: Card successfully displayed using standard UI');
    },

    cleanPostContent(post) {
      if (!post) return '';
      
      let content = String(post);
      
      // Remove AI prefaces and explanations
      content = content.replace(/^(?:Okay, here's|Here's|This is|Below is)[^\n]*:\s*/i, '');
      content = content.replace(/^\*\*Option\s+\d+.*?\*\*[^\n]*\n/gi, '');
      content = content.replace(/^\*\*Explanation.*?\*\*[^\n]*\n/gi, '');
      content = content.replace(/^\*\*Why.*?\*\*[^\n]*\n/gi, '');
      content = content.replace(/Explanation of Choices & Strategies Used:[^\n]*\n/gi, '');
      content = content.replace(/Why these options should work:[^\n]*\n/gi, '');
      content = content.replace(/Choose the option.*?\.\n/gi, '');
      
      // Remove markdown formatting for cleaner display
      content = content.replace(/\*\*([^*]+)\*\*/g, '$1');
      content = content.replace(/\*([^*]+)\*/g, '$1');
      
      // Clean up excessive line breaks and spacing
      content = content.replace(/\n{3,}/g, '\n\n');
      content = content.replace(/^[ \t]+|[ \t]+$/gm, '');
      
      // Remove any remaining explanation text patterns
      const lines = content.split('\n');
      const cleanedLines = lines.filter(line => {
        const trimmed = line.trim();
        return trimmed && 
               !trimmed.match(/^(Explanation|Why|Choose|Strategies|Choices|Options?)[:\s]/i) &&
               !trimmed.match(/^\*\*[^\*]*\*\*$/);
      });
      
      return cleanedLines.join('\n').trim();
    },

    showToast(message, duration = 3000) {
      if (window.TabTalkUI?.showToast) {
        window.TabTalkUI.showToast(message, duration);
      } else {
        console.log('Toast:', message);
      }
    },

    getAccurateCharacterCount(text) {
      if (!text) return 0;
      const trimmed = text.trim();
      let count = 0;
      const chars = Array.from(trimmed);
      for (const char of chars) {
        if (this.isEmojiOrSpecialChar(char)) {
          count += 2;
        } else {
          count += 1;
        }
      }
      return count;
    },

    isEmojiOrSpecialChar(char) {
      const codePoint = char.codePointAt(0);
      return (
        (codePoint >= 0x1F300 && codePoint <= 0x1F9FF) || // Misc Symbols and Pictographs, Emoticons, etc.
        (codePoint >= 0x2600 && codePoint <= 0x26FF) ||   // Misc symbols
        (codePoint >= 0x2700 && codePoint <= 0x27BF) ||   // Dingbats
        (codePoint >= 0x1F600 && codePoint <= 0x1F64F) || // Emoticons
        (codePoint >= 0x1F680 && codePoint <= 0x1F6FF) || // Transport and Map
        (codePoint >= 0x1F900 && codePoint <= 0x1F9FF) || // Supplemental Symbols
        (codePoint >= 0x1F1E0 && codePoint <= 0x1F1FF) || // Flags
        (codePoint === 0x200D)                             // Zero Width Joiner
      );
    },

    async callGeminiAPI(prompt) {
      console.log('Click Farming: callGeminiAPI() called with prompt length:', prompt?.length);
      
      // Use the API module's callGeminiAPI method
      if (window.TabTalkAPI?.callGeminiAPI) {
        console.log('Click Farming: Using window.TabTalkAPI.callGeminiAPI');
        try {
          const result = await window.TabTalkAPI.callGeminiAPI(prompt);
          console.log('Click Farming: API call successful, result length:', result?.length);
          return result;
        } catch (error) {
          console.error('Click Farming: API call failed:', error);
          throw error;
        }
      }
      
      console.error('Click Farming: API not available - window.TabTalkAPI?.callGeminiAPI not found');
      throw new Error('API not available. Please make sure your Gemini API key is set up.');
    },

    saveToGallery(post, topic) {
      if (!window.TabTalkGallery) return;
      
      const content = {
        id: Date.now().toString(),
        title: `🎯 ${topic}`,
        content: post,
        timestamp: new Date().toISOString(),
        tags: ['click-farming', this.selectedContentType, this.selectedCTA],
        platform: 'twitter'
      };
      
      window.TabTalkGallery.saveContent(content);
    },

    loadStoredPreferences() {
      chrome.storage.local.get(['clickFarmingContentType', 'clickFarmingHookStyle', 'clickFarmingCTA'], (result) => {
        if (result.clickFarmingContentType) this.selectContentType(result.clickFarmingContentType);
        if (result.clickFarmingHookStyle) this.selectHookStyle(result.clickFarmingHookStyle);
        if (result.clickFarmingCTA) this.selectCTA(result.clickFarmingCTA);
      });
    },

    savePreferences() {
      chrome.storage.local.set({
        clickFarmingContentType: this.selectedContentType,
        clickFarmingHookStyle: this.selectedHookStyle,
        clickFarmingCTA: this.selectedCTA
      });
    },

  };

  // Expose globally
  window.TabTalkClickFarming = ClickFarming;

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ClickFarming.init());
  } else {
    ClickFarming.init();
  }
})();
