'use strict';

// Pure helper implementations for Node tests (mirrors twitter.js browser helpers)
function cleanTwitterContent(content) {
  if (!content) return content;
  let cleaned = content;
  // Replace literal line break markers (tolerate spacing)
  cleaned = cleaned.replace(/\(\s*line\s*break\s*\)/gi, '\n');
  cleaned = cleaned.replace(/\[\s*line\s*break\s*\]/gi, '\n');
  // Standardize bullets only at line starts
  cleaned = cleaned.replace(/^[ \t]*[-*]\s+/gm, '• ');
  // Remove hashtags and # symbols
  cleaned = cleaned.replace(/#\w+/g, '');
  cleaned = cleaned.replace(/#/g, '');
  // Remove all asterisks after bullet handling to avoid artifacts
  cleaned = cleaned.replace(/\*/g, '');
  // Remove markdown underscores
  cleaned = cleaned.replace(/_{2,}([^_]+)_{2,}/g, '$1');
  cleaned = cleaned.replace(/_([^_]+)_/g, '$1');
  // Remove extra markdown symbols
  cleaned = cleaned.replace(/\*{2,}/g, '');
  cleaned = cleaned.replace(/_{2,}/g, '');
  // Standardize bullets
  cleaned = cleaned.replace(/[-*]\s+/g, '• ');
  // Normalize whitespace and line breaks
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  cleaned = cleaned.replace(/[ \t]+/g, ' ');
  cleaned = cleaned.trim();
  // Remove bracket artifacts, keep natural parentheses but remove formatting ones
  cleaned = cleaned.replace(/\[([^\]]+)\]/g, '$1');
  cleaned = cleaned.replace(/\(([^)]+)\)/g, (match, p1) => {
    if (p1.includes('emphasis') || p1.includes('bold') || p1.includes('italic')) return '';
    return match;
  });
  return cleaned;
}

function parseTwitterThread(content) {
  const cleanedContent = cleanTwitterContent(content || '');
  let processedContent = cleanedContent.replace(/Here\'s your clean.*?content:\s*/gi, '').trim();
  const tweetPattern = /(\d+\/\d+[\s:]*)/g;
  const parts = processedContent.split(tweetPattern).filter(part => part.trim());
  const tweets = [];
  let currentTweet = '';
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].trim();
    if (/^\d+\/\d+[\s:]*$/.test(part)) {
      if (currentTweet.trim()) tweets.push(currentTweet.trim());
      currentTweet = '';
    } else {
      currentTweet += part + ' ';
    }
  }
  if (currentTweet.trim()) tweets.push(currentTweet.trim());
  if (tweets.length === 0) {
    const lines = processedContent.split('\n').filter(line => line.trim());
    let tempTweet = '';
    for (const line of lines) {
      if (/^\d+\/\d+/.test(line)) {
        if (tempTweet.trim()) tweets.push(tempTweet.trim());
        tempTweet = line.replace(/^\d+\/\d+[\s:]*/, '').trim();
      } else if (tempTweet) {
        tempTweet += '\n' + line;
      } else {
        tempTweet = line;
      }
    }
    if (tempTweet.trim()) tweets.push(tempTweet.trim());
  }
  return tweets.length > 0 ? tweets : [processedContent || content || ''];
}

module.exports = { cleanTwitterContent, parseTwitterThread };
