// content.js - BULLETPROOF VERSION
// This script is injected programmatically. It runs, extracts text, and returns a result.

// Wrap in IIFE to prevent redeclaration errors on multiple injections
(function() {

/**
 * INLINE CONTENT SANITIZER
 * Bulletproof multi-layer sanitization system
 */
const ContentSanitizer = {
    cleanDOM: function(element) {
        if (!element) return element;
        const clone = element.cloneNode(true);
        
        // Aggressive removal of all noise elements
        const noiseSelectors = [
            'script', 'style', 'noscript', 'iframe', 'embed', 'object', 'canvas', 'img', 'video', 'audio', 'svg',
            'nav', 'header', 'footer', 'aside', '[role="navigation"]', '[role="banner"]', '[role="contentinfo"]',
            '.comment', '.comments', '.reply', '.replies', '.response', '[data-testid*="reply"]', '[data-testid*="comment"]',
            '.trending', '.sidebar', '.recommendations', '[data-testid="sidebarColumn"]',
            '.ad', '.ads', '.advertisement', '.sponsored', '[data-ad]', '[aria-label*="Ad"]',
            '.modal', '.popup', '.overlay', '.cookie', '.gdpr', '.share', '.social-buttons',
            '[aria-hidden="true"]', '[hidden]', '.hidden'
        ];
        
        noiseSelectors.forEach(selector => {
            try {
                clone.querySelectorAll(selector).forEach(el => el.remove());
            } catch (e) {}
        });
        
        return clone;
    },
    
    cleanText: function(text) {
        if (!text) return '';
        let lines = text.split('\n').filter(line => {
            const trimmed = line.trim();
            if (!trimmed || trimmed.length < 3) return false;
            
            const noisePatterns = [
                /^(like|comment|share|repost|reply)$/i,
                /^\d+\s*(likes|comments|shares|views|posts)$/i,
                /^\d+[KkMm]\s*(likes|comments|shares|views|posts)$/i,
                /^(show more|read more|view all|load more)$/i,
                /^\d+[smhd]\s*ago$/i,
                /^(trending|what's happening|relevant people)$/i,
                /^(ad|ads|sponsored|promoted)$/i,
                /^(terms of service|privacy policy|© \d{4})$/i,
                /^(home|explore|notifications|profile|settings)$/i,
                /^(show\s*repl(?:y|ies))$/i,
                /^(quote\b.*)$/i,
                /^(replying to\b.*)$/i,
                /^(.)\1{4,}$/
            ];
            
            return !noisePatterns.some(pattern => pattern.test(trimmed));
        });
        
        // Remove duplicates
        lines = lines.filter((line, index, arr) => index === 0 || line.trim() !== arr[index - 1].trim());
        
        return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
    },
    
    prepareForAI: function(text, maxLength = 8000) {
        if (!text) return '';
        text = text.replace(/https?:\/\/[^\s]+/g, '');
        text = text.replace(/[\w\.-]+@[\w\.-]+\.\w+/g, '');
        text = text.replace(/[ \t]+/g, ' ');
        text = text.replace(/\n\s+\n/g, '\n\n');
        
        if (text.length > maxLength) {
            text = text.substring(0, maxLength);
            const cutPoint = Math.max(text.lastIndexOf('.'), text.lastIndexOf('\n'));
            if (cutPoint > maxLength * 0.8) text = text.substring(0, cutPoint + 1);
        }
        
        return text.trim();
    },
    
    sanitize: function(input, isDOMElement = false) {
        let text = isDOMElement && input ? (this.cleanDOM(input).innerText || '') : (input || '');
        text = this.cleanText(text);
        return this.prepareForAI(text);
    },
    
    extractMainContent: function(document) {
        // Strategy 1: Site-specific and focused selectors (prefer primary content only)
        const href = (typeof location !== 'undefined' && location.href) ? location.href : '';
        const isXStatus = /x\.com\/[\w_]+\/status\//i.test(href) || /twitter\.com\/[\w_]+\/status\//i.test(href);
        if (isXStatus) {
            // Capture ONLY the main tweet text, not the entire timeline or replies
            const mainArticle = document.querySelector('main article') || document.querySelector('article');
            const tweetText = (mainArticle && mainArticle.querySelector('[data-testid="tweetText"]')) || document.querySelector('article [data-testid="tweetText"]') || document.querySelector('[data-testid="tweetText"]');
            if (tweetText && (tweetText.innerText || '').trim().length > 0) {
                return this.sanitize(tweetText, true);
            }
            if (mainArticle && (mainArticle.innerText || '').length > 50) {
                // Fallback: sanitize only the article (still avoids whole main/root)
                return this.sanitize(mainArticle, true);
            }
        }

        // Strategy 2: Prefer article element over entire main container
        const article = document.querySelector('main article, article');
        if (article) {
            const primary = article.querySelector('[data-testid="tweetText"], [itemprop="articleBody"], .post-content, .article-content, .entry-content');
            if (primary && primary.innerText?.length > 30) {
                return this.sanitize(primary, true);
            }
            if (article.innerText?.length > 50) {
                return this.sanitize(article, true);
            }
        }
        
        // Strategy 3: Content selectors
        const contentSelectors = [
            '.post-content', '.article-content', '.entry-content',
            '[itemprop="articleBody"]', '[data-testid="tweetText"]',
            '.feed-shared-update-v2__description'
        ];
        
        for (const selector of contentSelectors) {
            const el = document.querySelector(selector);
            if (el && el.innerText?.length > 50) {
                return this.sanitize(el, true);
            }
        }
        
        // Strategy 4: Largest text container
        const paragraphs = Array.from(document.querySelectorAll('p, div[role="article"]'));
        if (paragraphs.length > 0) {
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
            
            const best = Object.values(containers).sort((a, b) => b.length - a.length)[0];
            if (best && best.length > 200) {
                return this.sanitize(best.element, true);
            }
        }
        
        // Strategy 5: Full body (last resort)
        return this.sanitize(document.body, true);
    }
};

function detectSiteType() {
    const url = window.location.href;
    if (/news|article|nytimes|cnn|bbc|reuters|guardian|washingtonpost|forbes|bloomberg|newsroom|usatoday|npr|aljazeera|foxnews|nbcnews|abcnews|cbsnews|huffpost|politico|wsj|latimes|apnews|theatlantic|time|economist|ft\.com/i.test(url)) return 'news';
    if (/docs|documentation|developer|readthedocs|docs\.google|docs\.microsoft|docs\.github|devdocs|api|reference|manual|guide/i.test(url)) return 'docs';
    if (/blog|medium|wordpress|substack|blogspot|tumblr|ghost|hashnode|dev\.to/i.test(url)) return 'blog';
    if (/forum|discuss|community|board|thread|reddit|stack(over|_)flow|quora|discourse|phpbb|vbulletin|xenforo/i.test(url)) return 'forum';
    if (/shop|store|product|cart|checkout|ecommerce|amazon|ebay|aliexpress|etsy|walmart|bestbuy|target|flipkart|rakuten|shopify/i.test(url)) return 'ecommerce';
    return 'webpage';
}

function extractMetadata(siteType) {
    const meta = {};
    if (siteType === 'news' || siteType === 'blog') {
        meta.author = document.querySelector('[itemprop="author"], .author, .byline, [rel="author"]')?.innerText || '';
        meta.date = document.querySelector('time, .date, .published, [itemprop="datePublished"]')?.getAttribute('datetime') || '';
        meta.headline = document.querySelector('h1, .headline, [itemprop="headline"]')?.innerText || document.title;
    } else if (siteType === 'docs') {
        meta.headings = Array.from(document.querySelectorAll('h1, h2, h3')).map(h => h.innerText).filter(Boolean).join(' | ');
    } else if (siteType === 'forum') {
        meta.threadTitle = document.querySelector('h1, .thread-title, .post-title')?.innerText || document.title;
        meta.participants = Array.from(new Set(Array.from(document.querySelectorAll('.user, .author, .username, .poster')).map(u => u.innerText).filter(Boolean))).join(', ');
    } else if (siteType === 'ecommerce') {
        meta.product = document.querySelector('h1, .product-title, [itemprop="name"]')?.innerText || document.title;
        meta.price = document.querySelector('.price, [itemprop="price"]')?.innerText || '';
        meta.availability = document.querySelector('.availability, [itemprop="availability"]')?.innerText || '';
    }
    return meta;
}

function extractAndReturnContent() {
    try {
        const siteType = detectSiteType();
        const meta = extractMetadata(siteType);
        
        // USE BULLETPROOF SANITIZER for extraction
        let mainContent = ContentSanitizer.extractMainContent(document);
        
        // Fallback if sanitizer returns minimal content
        if (!mainContent || mainContent.length < 50) {
            console.warn('TabTalk AI: Sanitizer returned minimal content, trying fallback...');
            let mainEl = document.querySelector('main, article, [role="main"], section');
            if (mainEl && mainEl.innerText?.length > 50) {
                mainContent = ContentSanitizer.sanitize(mainEl, true);
            } else {
                mainContent = ContentSanitizer.sanitize(document.body, true);
            }
        }
        const pageTitle = document.title;
        const pageUrl = window.location.href;
        let metaString = '';
        if (siteType === 'news' || siteType === 'blog') {
            metaString = `Author: ${meta.author}\nDate: ${meta.date}\nHeadline: ${meta.headline}`;
        } else if (siteType === 'docs') {
            metaString = `Headings: ${meta.headings}`;
        } else if (siteType === 'forum') {
            metaString = `Thread Title: ${meta.threadTitle}\nParticipants: ${meta.participants}`;
        } else if (siteType === 'ecommerce') {
            metaString = `Product: ${meta.product}\nPrice: ${meta.price}\nAvailability: ${meta.availability}`;
        }
        const structuredContent = `---SITE TYPE---\n${siteType}\n---PAGE TITLE---\n${pageTitle}\n---PAGE URL---\n${pageUrl}\n${metaString ? '---METADATA---\n' + metaString + '\n' : ''}---PAGE CONTENT---\n${mainContent}`;
        // If very little content was found, still proceed but mark it as minimal.
        if (!mainContent || mainContent.length < 30) {
            console.warn('TabTalk AI (content): Very little text found on the page – proceeding with minimal content.');
        }
        return { success: true, content: structuredContent };
    } catch (e) {
        return { success: false, error: e.message };
    }
}

// The script's final expression is its return value.
// We call our main function here and return the result.
return extractAndReturnContent();

})(); // End of IIFE