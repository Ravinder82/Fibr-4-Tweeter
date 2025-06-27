// content.js - FINAL VERSION
// This script is injected programmatically. It runs, extracts text, and returns a result.

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
        let mainContent = '';
        let mainEl = document.querySelector('main, article, [role="main"], section');
        if (mainEl) {
            mainContent = mainEl.innerText;
        }
        if (!mainContent || mainContent.length < 200) {
            const bodyClone = document.body.cloneNode(true);
            const selectorsToRemove = [
                'script', 'style', 'noscript', 'iframe', 'embed', 'object', 'svg', 'canvas', 'img', 'video', 'audio',
                'nav', 'header', 'footer', 'aside',
                '.nav', '.navbar', '.menu', '.sidebar',
                '.advertisement', '.ads', '.popup', '.modal', '[role="dialog"]',
                '.cookie-notice', '.cookie-banner', '.gdpr',
                '[aria-hidden="true"]', '[data-nosnippet]'
            ];
            selectorsToRemove.forEach(selector => {
                try {
                    bodyClone.querySelectorAll(selector).forEach(el => el.remove());
                } catch (e) {}
            });
            mainContent = bodyClone.innerText;
        }
        mainContent = mainContent.replace(/\s\s+/g, '\n').trim();
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
// We call our main function here.
extractAndReturnContent();