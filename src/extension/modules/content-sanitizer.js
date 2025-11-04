/**
 * BULLETPROOF CONTENT SANITIZATION SYSTEM
 * 
 * Multi-layer defense against UI noise, comments, ads, and junk content.
 * This module ensures ONLY the main post/article content is extracted.
 */

(function() {
  const ContentSanitizer = {
    
    /**
     * LAYER 1: Pre-extraction DOM cleaning
     * Remove all known noise elements before extraction
     */
    cleanDOM: function(element) {
      if (!element) return element;
      
      const clone = element.cloneNode(true);
      
      // AGGRESSIVE REMOVAL: Common UI noise selectors
      const noiseSelectors = [
        // Scripts, styles, media
        'script', 'style', 'noscript', 'iframe', 'embed', 'object', 'canvas',
        'img', 'video', 'audio', 'svg', 'picture', 'source',
        
        // Navigation and structure
        'nav', 'header', 'footer', 'aside', 'menu',
        '[role="navigation"]', '[role="banner"]', '[role="contentinfo"]',
        '[role="complementary"]', '[role="dialog"]', '[role="alertdialog"]',
        
        // Social media UI noise
        '.comment', '.comments', '.comment-section', '.comment-list', '.comment-thread',
        '.reply', '.replies', '.reply-section', '.reply-list',
        '.response', '.responses', '.response-section',
        '[data-testid*="reply"]', '[data-testid*="comment"]',
        '[aria-label*="Comment"]', '[aria-label*="Reply"]', '[aria-label*="Replies"]',
        
        // Trending, sidebar, recommendations
        '.trending', '.trends', '[data-testid="trend"]', '[aria-label*="Trending"]',
        '.sidebar', '.side-bar', '.rail', '.recommendations', '.suggested',
        '[data-testid="sidebarColumn"]', '[data-testid="primaryColumn"]',
        '.relevant-people', '[aria-label*="Relevant people"]',
        
        // Ads and promotional content
        '.ad', '.ads', '.advertisement', '.sponsored', '.promotion', '.promo',
        '[data-ad]', '[data-advertisement]', '[id*="ad-"]', '[class*="ad-"]',
        '[aria-label*="Ad"]', '[data-testid*="ad"]', 'ins.adsbygoogle',
        
        // Modals, popups, overlays
        '.modal', '.popup', '.overlay', '.dialog', '.lightbox',
        '[role="dialog"]', '[aria-modal="true"]',
        
        // Navigation menus
        '.nav', '.navbar', '.navigation', '.menu', '.menubar',
        '.breadcrumb', '.breadcrumbs', '.pagination',
        
        // Social widgets and buttons
        '.share', '.share-buttons', '.social', '.social-buttons',
        '.follow', '.subscribe', '.newsletter', '.signup',
        
        // Cookie notices and banners
        '.cookie', '.cookies', '.cookie-notice', '.cookie-banner',
        '.gdpr', '.privacy-notice', '.consent',
        
        // Headers and meta info that adds noise
        '.meta', '.metadata', '.post-meta', '.article-meta',
        '.author-info', '.byline', '.tags', '.categories',
        
        // Footers and legal
        '.footer', '.site-footer', '.page-footer',
        '.legal', '.copyright', '.terms', '.privacy-policy',
        
        // Hidden elements
        '[aria-hidden="true"]', '[hidden]', '[data-nosnippet]',
        '.hidden', '.invisible', '.visually-hidden',
        
        // Twitter/X specific noise
        '[data-testid="cellInnerDiv"]', // Reply cells
        '[data-testid="UserCell"]', // User cells
        '[data-testid="HoverCard"]', // Hover cards
        '[data-testid="tweetButtonInline"]', // Tweet buttons
        
        // LinkedIn specific noise
        '.feed-shared-update-v2__comments', // Comment sections
        '.feed-shared-social-actions', // Like/comment/share buttons
        '.artdeco-card', // Card containers
        '.scaffold-finite-scroll',
        
        // Generic noise patterns
        '[class*="comment"]', '[class*="reply"]', '[class*="response"]',
        '[class*="sidebar"]', '[class*="footer"]', '[class*="ad"]',
        '[id*="comment"]', '[id*="reply"]', '[id*="sidebar"]', '[id*="footer"]'
      ];
      
      // Remove all noise elements
      noiseSelectors.forEach(selector => {
        try {
          const elements = clone.querySelectorAll(selector);
          elements.forEach(el => {
            try {
              el.remove();
            } catch (e) {
              // Fallback removal
              if (el.parentNode) {
                el.parentNode.removeChild(el);
              }
            }
          });
        } catch (e) {
          console.warn(`Sanitizer: Failed to remove selector ${selector}:`, e);
        }
      });
      
      // Remove elements with specific text patterns (ads, trending, etc.)
      const textNoisePatterns = [
        /^(ad|ads|advertisement|sponsored|promoted)$/i,
        /^(trending|trends|what's happening|relevant people)$/i,
        /^(show more replies|show all replies|view more)$/i,
        /^(terms of service|privacy policy|cookie policy|accessibility)$/i,
        /^©.*\d{4}/i, // Copyright notices
        /^\d+K\s*(posts|likes|followers|views|comments)$/i // Social metrics
      ];
      
      const allTextElements = clone.querySelectorAll('*');
      allTextElements.forEach(el => {
        const text = el.textContent?.trim() || '';
        if (text.length < 100 && textNoisePatterns.some(pattern => pattern.test(text))) {
          try {
            el.remove();
          } catch (e) {
            // Ignore removal errors
          }
        }
      });
      
      return clone;
    },
    
    /**
     * LAYER 2: Text content cleaning
     * Remove noise patterns from extracted text
     */
    cleanText: function(text) {
      if (!text || typeof text !== 'string') return '';
      
      // Split into lines for processing
      let lines = text.split('\n');
      
      // Filter out noise lines
      lines = lines.filter(line => {
        const trimmed = line.trim();
        if (!trimmed) return false; // Remove empty lines
        if (trimmed.length < 3) return false; // Remove very short lines
        
        // Remove lines matching noise patterns
        const noisePatterns = [
          // Social media noise
          /^(like|comment|share|repost|reply|retweet|quote)$/i,
          /^\d+\s*(likes|comments|shares|reposts|replies|retweets|views|posts)$/i,
          /^\d+[KkMm]\s*(likes|comments|shares|reposts|replies|retweets|views|posts)$/i,
          /^(show more|show less|read more|see more|view all|load more)$/i,
          /^(follow|unfollow|subscribe|joined|member|followers)$/i,
          
          // Timestamps and dates (standalone)
          /^\d+[smhd]\s*ago$/i,
          /^(just now|yesterday|today|tomorrow)$/i,
          /^\d{1,2}[hm]$/i, // 2h, 30m
          /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{1,2}$/i,
          
          // Trending and recommendations
          /^(trending|trends|what's happening|relevant people|you might like)$/i,
          /^(trending in|trending now|show more)$/i,
          /^\d+K\s*posts$/i,
          /^(sports|news|entertainment|technology)\s*·\s*trending$/i,
          
          // Ads and promotions
          /^(ad|ads|advertisement|sponsored|promoted|from|remoteeq\.com)$/i,
          /^(the .+ from .+)$/i, // "The bag from company"
          /^(shop now|buy now|learn more|sign up|get started)$/i,
          
          // Footer and legal
          /^(terms of service|privacy policy|cookie policy|accessibility|© \d{4})$/i,
          /^©.*\d{4}.*$/i, // Full copyright line
          /^(terms|privacy|cookies|settings|help|about|press)$/i,
          
          // Navigation elements
          /^(home|explore|notifications|messages|profile|more|settings)$/i,
          /^(back|next|previous|close|cancel|done)$/i,
          
          // Empty or meaningless
          /^[\s\.\,\;\:\-\_\|\/\\\(\)\[\]\{\}]+$/,
          /^[0-9\s\.\,\;\:\-\_\|\/\\\(\)\[\]\{\}]+$/, // Only numbers and symbols
          
          // LinkedIn specific
          /^\d+\s*connections?$/i,
          /^(react|celebrate|support|love|insightful|curious)$/i,
          /^(see all|view profile|connect|message)$/i,
          
          // Generic UI labels
          /^(yes|no|ok|cancel|submit|close|open|menu|search)$/i,
          /^[←→↑↓✓✗×+\-]$/,
          
          // Repeated characters or symbols
          /^(.)\1{4,}$/ // Same character repeated 5+ times
        ];
        
        return !noisePatterns.some(pattern => pattern.test(trimmed));
      });
      
      // Remove duplicate consecutive lines
      lines = lines.filter((line, index, arr) => {
        if (index === 0) return true;
        return line.trim() !== arr[index - 1].trim();
      });
      
      // Join back and clean whitespace
      let cleaned = lines.join('\n');
      
      // Remove multiple consecutive newlines
      cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
      
      // Remove leading/trailing whitespace
      cleaned = cleaned.trim();
      
      return cleaned;
    },
    
    /**
     * LAYER 3: AI-specific content preparation
     * Format content optimally for AI processing
     */
    prepareForAI: function(text, maxLength = 8000) {
      if (!text) return '';
      
      // Remove any remaining AI artifacts
      text = text.replace(/\[AI\]|\[SYSTEM\]|\[USER\]|\[ASSISTANT\]/gi, '');
      text = text.replace(/```[\s\S]*?```/g, ''); // Remove code blocks if any
      text = text.replace(/`[^`]+`/g, ''); // Remove inline code
      
      // Remove URLs (they add noise for AI)
      text = text.replace(/https?:\/\/[^\s]+/g, '');
      
      // Remove email addresses
      text = text.replace(/[\w\.-]+@[\w\.-]+\.\w+/g, '');
      
      // Remove hashtags (keep the text part)
      text = text.replace(/#(\w+)/g, '$1');
      
      // Remove @mentions (keep the name)
      text = text.replace(/@(\w+)/g, '$1');
      
      // Clean up excessive punctuation
      text = text.replace(/\.{4,}/g, '...');
      text = text.replace(/!{3,}/g, '!!');
      text = text.replace(/\?{3,}/g, '??');
      
      // Normalize whitespace
      text = text.replace(/[ \t]+/g, ' ');
      text = text.replace(/\n\s+\n/g, '\n\n');
      
      // Truncate if too long (preserve whole sentences)
      if (text.length > maxLength) {
        text = text.substring(0, maxLength);
        const lastPeriod = text.lastIndexOf('.');
        const lastNewline = text.lastIndexOf('\n');
        const cutPoint = Math.max(lastPeriod, lastNewline);
        if (cutPoint > maxLength * 0.8) {
          text = text.substring(0, cutPoint + 1);
        }
      }
      
      return text.trim();
    },
    
    /**
     * MASTER SANITIZATION FUNCTION
     * Applies all three layers of cleaning
     */
    sanitize: function(input, options = {}) {
      const {
        isDOMElement = false,
        maxLength = 8000,
        preserveStructure = false
      } = options;
      
      let text = '';
      
      // Handle DOM element input
      if (isDOMElement && input) {
        const cleaned = this.cleanDOM(input);
        text = cleaned.innerText || cleaned.textContent || '';
      } else {
        text = input || '';
      }
      
      // Apply text cleaning
      text = this.cleanText(text);
      
      // Apply AI preparation (unless preserving structure)
      if (!preserveStructure) {
        text = this.prepareForAI(text, maxLength);
      }
      
      return text;
    },
    
    /**
     * Extract main content intelligently
     * Tries multiple strategies to find the actual content
     */
    extractMainContent: function(document) {
      const strategies = [
        // Strategy 1: Look for article/main tags
        () => {
          const main = document.querySelector('main article, article, main, [role="main"]');
          if (main && main.innerText?.length > 200) {
            return this.sanitize(main, { isDOMElement: true });
          }
          return null;
        },
        
        // Strategy 2: Look for content with specific selectors
        () => {
          const selectors = [
            '.post-content', '.article-content', '.entry-content',
            '[itemprop="articleBody"]', '[data-testid="tweetText"]',
            '.feed-shared-update-v2__description'
          ];
          
          for (const selector of selectors) {
            const el = document.querySelector(selector);
            if (el && el.innerText?.length > 50) {
              return this.sanitize(el, { isDOMElement: true });
            }
          }
          return null;
        },
        
        // Strategy 3: Find largest text block
        () => {
          const paragraphs = Array.from(document.querySelectorAll('p, div[role="article"]'));
          if (paragraphs.length === 0) return null;
          
          // Find parent container with most text
          const containers = {};
          paragraphs.forEach(p => {
            let parent = p.parentElement;
            while (parent && parent !== document.body) {
              const key = parent.className || parent.id || 'root';
              containers[key] = containers[key] || { element: parent, length: 0 };
              containers[key].length += (p.innerText || '').length;
              parent = parent.parentElement;
            }
          });
          
          // Get container with most content
          const best = Object.values(containers).sort((a, b) => b.length - a.length)[0];
          if (best && best.length > 200) {
            return this.sanitize(best.element, { isDOMElement: true });
          }
          return null;
        },
        
        // Strategy 4: Full body (last resort)
        () => {
          return this.sanitize(document.body, { isDOMElement: true });
        }
      ];
      
      // Try each strategy until one succeeds
      for (const strategy of strategies) {
        try {
          const result = strategy();
          if (result && result.length > 50) {
            console.log('ContentSanitizer: Extraction successful');
            return result;
          }
        } catch (e) {
          console.warn('ContentSanitizer: Strategy failed:', e);
        }
      }
      
      console.warn('ContentSanitizer: All strategies failed, returning minimal content');
      return 'Unable to extract clean content from this page.';
    }
  };
  
  // Export to global scope
  window.TabTalkContentSanitizer = ContentSanitizer;
})();
