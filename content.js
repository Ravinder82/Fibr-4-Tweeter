// content.js - FINAL VERSION
// This script is injected programmatically. It runs, extracts text, and returns a result.

function extractAndReturnContent() {
    try {
        // Create a clone of the body to avoid modifying the live page and to
        // get a snapshot of the DOM at this moment.
        const bodyClone = document.body.cloneNode(true);

        // Selectors for elements to remove from the clone. These are typically non-content elements.
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
                // Query the cloned body, not the live document
                bodyClone.querySelectorAll(selector).forEach(el => el.remove());
            } catch (e) {
                // Ignore if a selector is invalid, allows for robustness
            }
        });

        // Get the text content from the modified clone
        let content = bodyClone.innerText;
        
        // Clean up the extracted text:
        // 1. Replace multiple newlines/spaces with a single newline for readability.
        // 2. Trim whitespace from the start and end.
        content = content.replace(/\s\s+/g, '\n').trim();

        if (!content || content.length < 150) {
            // If not enough content is found, throw a specific error.
            // This error message will be sent back to the popup for the user to see.
            throw new Error('Insufficient text found on the page to provide a meaningful analysis.');
        }
        
        console.log(`TabTalk AI (content.js): Successfully extracted ${content.length} characters.`);
        
        // This is the success value that gets returned to popup.js's executeScript call
        return { success: true, content: content };

    } catch (e) {
        console.error("TabTalk AI (content.js): Error during text extraction.", e);
        // If any error occurs, return a structured error object.
        return { success: false, error: e.message };
    }
}

// The script's final expression is its return value.
// We call our main function here.
extractAndReturnContent();