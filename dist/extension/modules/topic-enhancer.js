// AI-Powered Topic Enhancement for Thread Generator
(function() {
  const TopicEnhancer = {
    currentTopic: '',
    isProcessing: false,
    
    init() {
      this.bindEvents();
    },
    
    bindEvents() {
      const refineBtn = document.getElementById('refine-topic-btn');
      const ideasBtn = document.getElementById('generate-ideas-btn');
      const topicInput = document.getElementById('thread-topic');
      
      if (refineBtn) {
        refineBtn.addEventListener('click', () => this.refineTopic());
      }
      
      if (ideasBtn) {
        ideasBtn.addEventListener('click', () => this.generateTopicIdeas());
      }
      
      if (topicInput) {
        topicInput.addEventListener('input', () => this.hideSuggestions());
      }
    },
    
    async refineTopic() {
      const topicInput = document.getElementById('thread-topic');
      this.currentTopic = topicInput?.value?.trim() || '';
      
      if (!this.currentTopic) {
        this.showToast('Enter a topic first to refine it', 2000);
        return;
      }
      
      if (this.isProcessing) return;
      
      const refineBtn = document.getElementById('refine-topic-btn');
      const originalText = refineBtn.textContent;
      this.isProcessing = true;
      refineBtn.textContent = '⏳ Refining...';
      refineBtn.disabled = true;
      
      try {
        const refinements = await this.callGeminiAPI(this.buildRefinementPrompt());
        this.displayRefinements(refinements);
      } catch (error) {
        console.error('Topic refinement failed:', error);
        this.showToast('Failed to refine topic', 3000);
      } finally {
        refineBtn.textContent = originalText;
        refineBtn.disabled = false;
        this.isProcessing = false;
      }
    },
    
    async generateTopicIdeas() {
      if (this.isProcessing) return;
      
      const ideasBtn = document.getElementById('generate-ideas-btn');
      const originalText = ideasBtn.textContent;
      this.isProcessing = true;
      ideasBtn.textContent = '⏳ Generating...';
      ideasBtn.disabled = true;
      
      try {
        const ideas = await this.callGeminiAPI(this.buildIdeasPrompt());
        this.displayTopicIdeas(ideas);
      } catch (error) {
        console.error('Topic ideas generation failed:', error);
        this.showToast('Failed to generate ideas', 3000);
      } finally {
        ideasBtn.textContent = originalText;
        ideasBtn.disabled = false;
        this.isProcessing = false;
      }
    },
    
    buildRefinementPrompt() {
      return `Refine and enhance this topic for a viral Twitter thread: "${this.currentTopic}"

Generate 5 refined versions that are:
- More specific and focused
- More engaging and clickable
- More likely to go viral
- Under 60 characters each
- Clear and compelling

Format as a numbered list. No explanations, just the refined topics.

Example:
Input: "productivity"
1. "The 5-minute productivity hack"
2. "Why productivity apps fail"
3. "Productivity secrets of CEOs"
4. "The dark side of productivity"
5. "Productivity vs. effectiveness"

Now refine: "${this.currentTopic}"`;
    },
    
    buildIdeasPrompt() {
      const trendingTopics = [
        'Artificial Intelligence', 'Remote Work', 'Climate Change', 'Mental Health',
        'Web3 & Blockchain', 'Creator Economy', 'Personal Finance', 'Health & Wellness',
        'Future of Education', 'Sustainable Living', 'Digital Privacy', 'Side Hustles'
      ];
      
      const randomTrends = trendingTopics.sort(() => 0.5 - Math.random()).slice(0, 3);
      
      return `Generate 10 viral thread ideas that blend evergreen topics with current trends.

TRENDING CONTEXT: ${randomTrends.join(', ')}

REQUIREMENTS:
- Each idea should be specific and compelling
- Under 60 characters
- Mix of educational, controversial, and practical topics
- High engagement potential
- Clear value proposition

FORMAT: Numbered list only, no explanations

Examples:
1. "AI tools that actually save time"
2. "Remote work is making us lonely"
3. "The climate solution nobody discusses"
4. "Why therapists quit social media"
5. "Web3 isn't dead, it's evolving"

Generate 10 fresh ideas now:`;
    },
    
    displayRefinements(refinements) {
      const suggestions = this.parseSuggestions(refinements);
      this.displaySuggestions(suggestions, 'refinements');
    },
    
    displayTopicIdeas(ideas) {
      const suggestions = this.parseSuggestions(ideas);
      this.displaySuggestions(suggestions, 'ideas');
    },
    
    parseSuggestions(text) {
      const lines = text.split('\n');
      const suggestions = [];
      
      for (const line of lines) {
        const match = line.match(/^\d+\.?\s*(.+)$/);
        if (match && match[1].trim()) {
          suggestions.push(match[1].trim());
        }
      }
      
      return suggestions.slice(0, 8); // Limit to 8 suggestions
    },
    
    displaySuggestions(suggestions, type) {
      const suggestionsContainer = document.getElementById('topic-suggestions');
      const suggestionsList = document.getElementById('suggestions-list');
      
      if (!suggestionsContainer || !suggestionsList) return;
      
      suggestionsList.innerHTML = suggestions.map(suggestion => `
        <div class="suggestion-item" data-topic="${this.escapeHtml(suggestion)}">
          <span class="suggestion-text">${this.escapeHtml(suggestion)}</span>
          <button class="suggestion-apply" title="Use this topic">✓</button>
        </div>
      `).join('');
      
      suggestionsContainer.classList.remove('hidden');
      
      // Bind click events for applying suggestions
      suggestionsList.querySelectorAll('.suggestion-apply').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const topic = e.target.closest('.suggestion-item').dataset.topic;
          this.applySuggestion(topic);
        });
      });
      
      suggestionsList.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', () => {
          const topic = item.dataset.topic;
          this.applySuggestion(topic);
        });
      });
    },
    
    applySuggestion(topic) {
      const topicInput = document.getElementById('thread-topic');
      if (topicInput) {
        topicInput.value = topic;
        topicInput.focus();
        this.hideSuggestions();
        this.showToast('Topic updated', 1500);
      }
    },
    
    hideSuggestions() {
      const suggestionsContainer = document.getElementById('topic-suggestions');
      if (suggestionsContainer) {
        suggestionsContainer.classList.add('hidden');
      }
    },
    
    async callGeminiAPI(prompt) {
      if (!window.TabTalkAPI?.callGeminiAPI) {
        throw new Error('API not available');
      }
      return await window.TabTalkAPI.callGeminiAPI(prompt);
    },
    
    showToast(message, duration = 3000) {
      if (window.TabTalkUI?.showToast) {
        window.TabTalkUI.showToast(message, duration);
      } else {
        console.log('Toast:', message);
      }
    },
    
    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  };

  // Expose globally
  window.TabTalkTopicEnhancer = TopicEnhancer;

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => TopicEnhancer.init());
  } else {
    TopicEnhancer.init();
  }
})();
