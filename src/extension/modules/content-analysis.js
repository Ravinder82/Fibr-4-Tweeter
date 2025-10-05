(function() {
  const ContentAnalysis = {
    /**
     * Explain This - Clear explanation of the page content
     * Adapts based on site type for context-aware explanations
     */
    generateSmartTLDR: async function() {
      if (!this.pageContent || !this.apiKey) {
        this.addMessage('assistant', '❌ Please set up your Gemini API key first and ensure page content is loaded.');
        return;
      }

      this.setLoading(true, 'Explaining this page...');
      console.log('TabTalk AI: Generating Explanation for page:', this.currentTab?.title);

      try {
        // Show progress bar
        this.showProgressBar('Creating ultra-concise summary...');

        // Extract site type from pageContent structure
        const siteTypeMatch = this.pageContent.match(/---SITE TYPE---\n([^\n]+)/);
        const siteType = siteTypeMatch ? siteTypeMatch[1] : 'webpage';

        // Context-aware system prompt based on site type
        let contextGuidance = '';
        switch(siteType) {
          case 'news':
            contextGuidance = 'For this news article, provide: headline summary + 2-3 key facts + significance.';
            break;
          case 'docs':
            contextGuidance = 'For this documentation, provide: main feature/concept + key capabilities + primary use case.';
            break;
          case 'blog':
            contextGuidance = 'For this blog post, provide: main thesis + key insights + takeaway message.';
            break;
          case 'forum':
            contextGuidance = 'For this forum thread, provide: discussion topic + consensus points + key disagreements.';
            break;
          case 'ecommerce':
            contextGuidance = 'For this product page, provide: product value proposition + key features + pricing/availability.';
            break;
          default:
            contextGuidance = 'Provide: core message + key insights + actionable takeaway.';
        }

        const systemPrompt = `You are an expert summarizer specializing in ultra-concise, high-value summaries. Your summaries capture the essence while being immediately actionable.

CONTEXT: This is a ${siteType} page.

YOUR TASK: Create a clear explanation (50-150 words) that:
1. Captures the core message in the first sentence
2. Highlights 2-3 most important insights
3. Ends with an actionable takeaway

${contextGuidance}

STYLE REQUIREMENTS:
- Use clear, direct language
- No fluff or filler words
- Bullet points for key facts (use • symbol)
- Bold important terms using **term**
- One short paragraph or structured bullets
- Make every word count

OUTPUT FORMAT:
**Core Message:** [One sentence summary]

• [Key insight 1]
• [Key insight 2]
• [Key insight 3]

**Takeaway:** [Actionable conclusion]`;

        const userPrompt = `Create a clear explanation (50-150 words) from this content:\n\n${this.pageContent}`;

        const response = await this.callGeminiAPIWithSystemPrompt(systemPrompt, userPrompt);
        
        if (response) {
          console.log('TabTalk AI: Explanation generated, length:', response.length);
          const cleanedResponse = this.cleanStructuredContent(response, 'tldr');
          
          // Add to chat with special content type
          this.addStructuredMessage('assistant', cleanedResponse, 'tldr', {
            title: 'Explain this!',
            icon: '',
            category: 'analysis'
          });

          // Save to history
          if (this.addToHistory) {
            const record = {
              timestamp: new Date().toISOString(),
              url: this.currentTab?.url || '',
              title: this.currentTab?.title || '',
              domain: this.currentDomain || '',
              content: cleanedResponse,
              type: 'tldr'
            };
            await this.addToHistory('analysis', record);
          }

          this.hideProgressBar();
        }
      } catch (error) {
        console.error('Error generating explanation:', error);
        this.addMessage('assistant', `❌ Error generating explanation: ${error.message}`);
        this.hideProgressBar();
      } finally {
        this.setLoading(false);
      }
    },

    /**
     * Generate Tasks - Prioritized, actionable tasks with effort estimates
     */
    generateActionItems: async function() {
      if (!this.pageContent || !this.apiKey) {
        this.addMessage('assistant', '❌ Please set up your Gemini API key first and ensure page content is loaded.');
        return;
      }

      this.setLoading(true, 'Identifying tasks...');
      console.log('TabTalk AI: Generating Tasks for page:', this.currentTab?.title);

      try {
        this.showProgressBar('Creating actionable task list...');

        const systemPrompt = `You are a productivity expert specializing in converting information into actionable tasks. You create clear, prioritized action items with realistic effort estimates.

YOUR TASK: Extract actionable tasks and next steps from the content.

For each action item, provide:
1. Clear task description (specific, actionable)
2. Priority: 🔴 URGENT | 🟡 IMPORTANT | 🟢 OPTIONAL
3. Effort: ⚡ Quick (< 30 min) | ⏱️ Moderate (1-3 hrs) | 🏋️ Complex (> 3 hrs)
4. Time estimate
5. Dependencies (if any)
6. Success criteria

ORGANIZE BY:
- Quick Wins (high impact, low effort)
- Strategic Actions (high impact, higher effort)
- Optional Enhancements (nice to have)

OUTPUT FORMAT:
## 🚀 Quick Wins
**1. [Task description]**
Priority: [emoji] | Effort: [emoji] | Time: [estimate]
Dependencies: [list or "None"]
Success: [How you'll know it's done]

## 🎯 Strategic Actions
[Same format]

## 💡 Optional Enhancements
[Same format]`;

        const userPrompt = `Extract actionable tasks and next steps from this content:\n\n${this.pageContent}`;

        const response = await this.callGeminiAPIWithSystemPrompt(systemPrompt, userPrompt);
        
        if (response) {
          console.log('TabTalk AI: Tasks generated, length:', response.length);
          const cleanedResponse = this.cleanStructuredContent(response, 'actions');
          
          this.addStructuredMessage('assistant', cleanedResponse, 'actions', {
            title: 'Tasks & Next Steps',
            icon: '',
            category: 'productivity'
          });

          if (this.addToHistory) {
            const record = {
              timestamp: new Date().toISOString(),
              url: this.currentTab?.url || '',
              title: this.currentTab?.title || '',
              domain: this.currentDomain || '',
              content: cleanedResponse,
              type: 'actions'
            };
            await this.addToHistory('productivity', record);
          }

          this.hideProgressBar();
        }
      } catch (error) {
        console.error('Error generating Tasks:', error);
        this.addMessage('assistant', `❌ Error generating tasks: ${error.message}`);
        this.hideProgressBar();
      } finally {
        this.setLoading(false);
      }
    },

    /**
     * Clean structured content output (Twitter-style cleaning)
     */
    cleanStructuredContent: function(content, type) {
      if (!content) return '';
      
      let cleaned = content.trim();
      
      // CRITICAL: Remove AI meta-commentary and prefaces (aggressive patterns)
      cleaned = cleaned.replace(/^(?:Here'?s?\s+(?:a|an|your|the)\s+[^:\n]*:\s*)/i, '');
      cleaned = cleaned.replace(/^(?:Below\s+(?:is|are)\s+[^:\n]*:\s*)/i, '');
      cleaned = cleaned.replace(/^(?:Certainly[,!]?|Sure[,!]?)\s+[^:\n]*:\s*/i, '');
      cleaned = cleaned.replace(/,?\s*based on the (?:provided|given|above) (?:information|content|article)[:\s]*/gi, '');
      cleaned = cleaned.replace(/,?\s*(?:designed|created|crafted) to [^:\n]*[:\s]*/gi, '');
      
      // CRITICAL: Remove all # hashtag symbols
      cleaned = cleaned.replace(/#\w+/g, ''); // Remove hashtags like #example
      cleaned = cleaned.replace(/#/g, ''); // Remove remaining # symbols
      
      // CRITICAL: Remove all * asterisk symbols (markdown formatting)
      cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1'); // Remove **bold**
      cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1'); // Remove *italic*
      cleaned = cleaned.replace(/\*{2,}/g, ''); // Remove multiple asterisks
      
      // Remove underscores (markdown formatting)
      cleaned = cleaned.replace(/_{2,}([^_]+)_{2,}/g, '$1'); // Remove __bold__
      cleaned = cleaned.replace(/_([^_]+)_/g, '$1'); // Remove _italic_
      cleaned = cleaned.replace(/_{2,}/g, ''); // Remove multiple underscores
      
      // Remove [line break] and (line break) placeholders
      cleaned = cleaned.replace(/\(line break\)/gi, '\n');
      cleaned = cleaned.replace(/\[line break\]/gi, '\n');
      
      // Normalize bullet points (convert * or - to •)
      cleaned = cleaned.replace(/^[ \t]*[-*]\s+/gm, '• ');
      
      // Collapse excessive blank lines
      cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
      
      // Remove excessive spaces
      cleaned = cleaned.replace(/[ \t]+/g, ' ');
      
      // Remove markdown headers (## Header -> Header)
      cleaned = cleaned.replace(/^#{1,6}\s+/gm, '');
      
      // Remove square brackets from text
      cleaned = cleaned.replace(/\[([^\]]+)\]/g, '$1');
      
      // Remove parentheses with formatting instructions
      cleaned = cleaned.replace(/\(([^)]+)\)/g, (match, p1) => {
        if (p1.includes('emphasis') || p1.includes('bold') || p1.includes('italic') || p1.includes('line break')) {
          return '';
        }
        return match;
      });
      
      // SPACING: Add proper spacing for readability
      // Add spacing after bullet points
      cleaned = cleaned.replace(/(•[^\n]+)\n(?!•|\n)/g, '$1\n\n');
      
      // Add spacing between distinct sections (paragraph breaks)
      cleaned = cleaned.replace(/([.!?])\n(?=[A-Z])/g, '$1\n\n');
      
      // Final cleanup
      cleaned = cleaned.replace(/(^|\n)\s*$/g, '').replace(/\n{3,}/g, '\n\n');
      
      return cleaned.trim();
    },

    /**
     * Add structured message with enhanced UI (Twitter-card style, MULTIPLE CARDS for insights/actions/discussion)
     */
    addStructuredMessage: function(role, content, contentType, metadata = {}) {
      const contentContainer = document.createElement('div');
      contentContainer.className = 'twitter-content-container';
      
      // Check if this content type should have multiple cards
      const multiCardTypes = ['insights', 'actions', 'discussion'];
      
      if (multiCardTypes.includes(contentType)) {
        // Parse content into individual items
        const items = this.parseStructuredContent(content, contentType);
        
        items.forEach((item, index) => {
          const cardTitle = `${metadata.title || contentType} ${index + 1}/${items.length}`;
          const card = this.createAnalysisCard(item, cardTitle, contentType, '');
          contentContainer.appendChild(card);
        });
      } else {
        // Single card for TL;DR and other types
        const card = this.createAnalysisCard(content, metadata.title || contentType, contentType, '');
        contentContainer.appendChild(card);
      }
      
      this.messagesContainer.appendChild(contentContainer);
      setTimeout(() => {
        this.messagesContainer.scrollTo({
          top: this.messagesContainer.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    },

    /**
     * Parse structured content into individual items (like Twitter threads)
     * Improved with minimum item requirements and better fallback handling
     */
    parseStructuredContent: function(content, type) {
      const items = [];
      const MIN_ITEMS = 2; // Require at least 2 items to consider parsing successful
      const MIN_ITEM_LENGTH = 20; // Minimum characters per item to avoid fragments
      
      if (type === 'insights') {
        // Parse insights - look for numbered patterns or "Insight X:" patterns
        const insightPatterns = [
          // Match "Insight 1:", "Insight 2:", etc. with multi-line content
          /(?:^|\n)(?:\*\*)?Insight\s+\d+[:\s]+(?:\*\*)?([^\n]+(?:\n(?!(?:Insight\s+\d+|\n\n))[^\n]+)*)/gi,
          // Match numbered lists: "1.", "2)", etc. with multi-line content
          /(?:^|\n)(?:\d+[\.\)]\s+)([^\n]+(?:\n(?!(?:\d+[\.\)]|\n\n))[^\n]+)*)/g,
          // Match bullet points with multi-line content
          /(?:^|\n)(?:•\s+)([^\n]+(?:\n(?!(?:•|\n\n))[^\n]+)*)/g
        ];
        
        for (const pattern of insightPatterns) {
          const matches = [...content.matchAll(pattern)];
          for (const match of matches) {
            const item = match[1]?.trim();
            if (item && item.length >= MIN_ITEM_LENGTH) {
              items.push(item);
            }
          }
          // Only accept if we found enough substantial items
          if (items.length >= MIN_ITEMS) break;
          items.length = 0; // Reset if pattern didn't yield enough items
        }
      } else if (type === 'actions') {
        // Parse action items - look for numbered or bulleted items
        const actionPatterns = [
          // Match section headers with content blocks
          /(?:^|\n)(?:Quick Wins?|Strategic Actions?|Optional Enhancements?)[^\n]*\n([^]+?)(?=\n(?:Quick Wins?|Strategic Actions?|Optional Enhancements?)|$)/gi,
          // Match numbered/bulleted items with multi-line content
          /(?:^|\n)(?:\*\*)?(?:\d+[\.\)]\s+|•\s+)([^\n]+(?:\n(?!(?:\d+[\.\)]|•|\n\n))[^\n]+)*)/g
        ];
        
        for (const pattern of actionPatterns) {
          const matches = [...content.matchAll(pattern)];
          for (const match of matches) {
            const item = match[1]?.trim();
            if (item && item.length >= MIN_ITEM_LENGTH) {
              items.push(item);
            }
          }
          if (items.length >= MIN_ITEMS) break;
          items.length = 0;
        }
      } else if (type === 'discussion') {
        // Parse discussion questions - look for Q1, Q2 or numbered patterns
        const questionPatterns = [
          // Match "Q1:", "Q2:", etc. with multi-line content
          /(?:^|\n)(?:\*\*)?Q\d+[:\s]+(?:\*\*)?([^\n]+(?:\n(?!(?:Q\d+|\n\n))[^\n]+)*)/gi,
          // Match numbered questions with multi-line content
          /(?:^|\n)(?:\d+[\.\)]\s+)([^\n]+(?:\n(?!(?:\d+[\.\)]|\n\n))[^\n]+)*)/g
        ];
        
        for (const pattern of questionPatterns) {
          const matches = [...content.matchAll(pattern)];
          for (const match of matches) {
            const item = match[1]?.trim();
            if (item && item.length >= MIN_ITEM_LENGTH) {
              items.push(item);
            }
          }
          if (items.length >= MIN_ITEMS) break;
          items.length = 0;
        }
      }
      
      // Fallback: If parsing didn't yield enough quality items, return content as single item
      // This prevents fragmentation when AI format varies
      if (items.length < MIN_ITEMS) {
        console.log(`TabTalk AI: Parsing ${type} yielded only ${items.length} items, using single card fallback`);
        return [content];
      }
      
      console.log(`TabTalk AI: Successfully parsed ${type} into ${items.length} cards`);
      return items;
    },

    /**
     * Create analysis card following Twitter card pattern (no length control)
     */
    createAnalysisCard: function(content, cardTitle, contentType, icon = '📄') {
      const card = document.createElement('div');
      card.className = 'twitter-card';
      
      card.innerHTML = `
        <div class="twitter-card-header">
          <span class="twitter-card-title">${cardTitle}</span>
          <div class="twitter-header-actions">
            <button class="twitter-action-btn copy-btn" title="Copy content" aria-label="Copy content">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </button>
          </div>
        </div>
        <div class="twitter-card-content">
          <textarea class="twitter-text" placeholder="Content..." readonly>${content}</textarea>
        </div>
      `;
      
      // Add save button
      if (window.TabTalkUI && window.TabTalkUI.addSaveButtonToCard) {
        const contentData = {
          id: Date.now().toString(),
          content: content,
          title: cardTitle
        };
        const actionsContainer = card.querySelector('.twitter-header-actions');
        if (actionsContainer) {
          window.TabTalkUI.addSaveButtonToCard(actionsContainer, contentType, contentData);
        }
      }
      
      // Copy button functionality
      const copyBtn = card.querySelector('.copy-btn');
      const textArea = card.querySelector('.twitter-text');
      const originalCopyIcon = copyBtn.innerHTML;
      
      copyBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        try {
          await navigator.clipboard.writeText(textArea.value);
          copyBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20,6 9,17 4,12"></polyline>
          </svg>`;
          copyBtn.classList.add('success');
          setTimeout(() => {
            copyBtn.innerHTML = originalCopyIcon;
            copyBtn.classList.remove('success');
          }, 2000);
        } catch (err) {
          console.error('Copy failed:', err);
        }
      });
      
      // Auto-resize textarea
      const autoResizeTextarea = () => {
        textArea.style.height = 'auto';
        textArea.style.height = Math.max(120, textArea.scrollHeight) + 'px';
      };
      setTimeout(autoResizeTextarea, 0);
      
      return card;
    }
  };

  window.TabTalkContentAnalysis = ContentAnalysis;
})();
