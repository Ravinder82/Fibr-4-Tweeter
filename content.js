// Content script for TabTalk AI Chrome Extension
// This script runs in the context of web pages

(function() {
    'use strict';
    
    // Prevent multiple injections
    if (window.tabTalkAIContentScriptLoaded) {
        return;
    }
    window.tabTalkAIContentScriptLoaded = true;
    
    // Listen for messages from popup or background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'extractPageContent') {
            try {
                const content = extractPageContent();
                sendResponse({ success: true, content: content });
            } catch (error) {
                console.error('Content extraction failed:', error);
                sendResponse({ success: false, error: error.message });
            }
            return true;
        }
        
        if (request.action === 'getPageInfo') {
            try {
                const info = getPageInfo();
                sendResponse({ success: true, info: info });
            } catch (error) {
                console.error('Failed to get page info:', error);
                sendResponse({ success: false, error: error.message });
            }
            return true;
        }
        
        if (request.action === 'highlightText') {
            try {
                highlightTextInPage(request.text);
                sendResponse({ success: true });
            } catch (error) {
                console.error('Failed to highlight text:', error);
                sendResponse({ success: false, error: error.message });
            }
            return true;
        }
    });
    
    function extractPageContent() {
        // Remove or hide elements that shouldn't be included
        const elementsToHide = [
            'script', 'style', 'noscript', 'iframe', 'embed', 'object',
            'nav', 'header', 'footer', '.nav', '.navbar', '.menu',
            '.sidebar', '.advertisement', '.ads', '.popup', '.modal'
        ];
        
        const hiddenElements = [];
        elementsToHide.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                el.style.display = 'none';
                hiddenElements.push({ element: el, originalDisplay: el.style.display });
            });
        });
        
        try {
            let content = '';
            const title = document.title || '';
            const url = window.location.href;
            
            // Try to find the main content area
            const mainContentSelectors = [
                'main',
                '[role="main"]',
                '.main-content',
                '#main-content',
                '.content',
                '#content',
                'article',
                '.article',
                '.post-content',
                '.entry-content',
                '.page-content',
                '.article-body'
            ];
            
            let mainElement = null;
            for (const selector of mainContentSelectors) {
                mainElement = document.querySelector(selector);
                if (mainElement && mainElement.textContent.trim().length > 100) {
                    break;
                }
            }
            
            // If no main content found, use body
            const targetElement = mainElement || document.body;
            
            if (targetElement) {
                // Extract meaningful text content
                const contentElements = targetElement.querySelectorAll(
                    'p, h1, h2, h3, h4, h5, h6, li, td, th, blockquote, pre, div[class*="text"], div[class*="content"], span[class*="text"]'
                );
                
                const textBlocks = [];
                const seenTexts = new Set();
                
                contentElements.forEach(el => {
                    // Skip if element is hidden or has no visible text
                    if (el.offsetParent === null && el.style.display !== 'none') return;
                    
                    const text = el.textContent?.trim();
                    if (text && text.length > 20 && !seenTexts.has(text)) {
                        // Filter out navigation, ads, etc.
                        const classList = el.className.toLowerCase();
                        const skipPatterns = [
                            'nav', 'menu', 'footer', 'header', 'sidebar', 'ad',
                            'advertisement', 'popup', 'modal', 'cookie', 'banner'
                        ];
                        
                        const shouldSkip = skipPatterns.some(pattern => 
                            classList.includes(pattern) || el.closest(`[class*="${pattern}"]`)
                        );
                        
                        if (!shouldSkip) {
                            textBlocks.push(text);
                            seenTexts.add(text);
                        }
                    }
                });
                
                content = textBlocks.join('\n\n');
            }
            
            // Fallback to document body if no content found
            if (!content || content.length < 100) {
                content = document.body.innerText || document.body.textContent || '';
            }
            
            // Clean up the content
            content = content
                .replace(/\s+/g, ' ')
                .replace(/\n\s*\n/g, '\n\n')
                .replace(/^\s+|\s+$/g, '')
                .trim();
            
            // Limit content size for API efficiency
            const maxLength = 25000;
            if (content.length > maxLength) {
                content = content.substring(0, maxLength) + '\n\n[Content truncated due to length...]';
            }
            
            if (!content || content.length < 50) {
                throw new Error('Unable to extract meaningful content from this page');
            }
            
            return {
                title: title,
                content: content,
                url: url,
                wordCount: content.split(/\s+/).length,
                characterCount: content.length
            };
            
        } finally {
            // Restore hidden elements
            hiddenElements.forEach(({ element, originalDisplay }) => {
                element.style.display = originalDisplay;
            });
        }
    }
    
    function getPageInfo() {
        return {
            title: document.title || 'Untitled',
            url: window.location.href,
            domain: window.location.hostname,
            pathname: window.location.pathname,
            wordCount: (document.body.textContent || '').split(/\s+/).filter(word => word.length > 0).length,
            lastModified: document.lastModified || null,
            lang: document.documentElement.lang || 'unknown'
        };
    }
    
    function highlightTextInPage(searchText) {
        // Remove existing highlights
        removeExistingHighlights();
        
        if (!searchText || searchText.length < 3) return;
        
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function(node) {
                    // Skip script and style elements
                    const parent = node.parentElement;
                    if (parent && (parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE')) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );
        
        const textNodes = [];
        let node;
        while (node = walker.nextNode()) {
            if (node.textContent.toLowerCase().includes(searchText.toLowerCase())) {
                textNodes.push(node);
            }
        }
        
        textNodes.forEach(textNode => {
            const parent = textNode.parentNode;
            const text = textNode.textContent;
            const regex = new RegExp(`(${escapeRegExp(searchText)})`, 'gi');
            
            if (regex.test(text)) {
                const highlightedHTML = text.replace(regex, '<mark style="background-color: #ffeb3b; padding: 2px 4px; border-radius: 2px;" class="tabtalk-highlight">$1</mark>');
                const wrapper = document.createElement('span');
                wrapper.innerHTML = highlightedHTML;
                parent.replaceChild(wrapper, textNode);
            }
        });
    }
    
    function removeExistingHighlights() {
        const highlights = document.querySelectorAll('.tabtalk-highlight');
        highlights.forEach(highlight => {
            const parent = highlight.parentNode;
            parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
            parent.normalize();
        });
    }
    
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    
    // Auto-detect page changes for SPAs
    let lastUrl = window.location.href;
    const observer = new MutationObserver(() => {
        if (window.location.href !== lastUrl) {
            lastUrl = window.location.href;
            // Page changed, could notify extension
            console.log('TabTalk AI: Page navigation detected');
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        observer.disconnect();
        removeExistingHighlights();
    });
    
})();