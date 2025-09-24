// src/shared/utils/helpers.js
// Shared utility functions

export function formatTimestamp(date) {
  return new Date(date).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

export function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

export function truncateText(text, maxLength) {
  return text.length > maxLength 
    ? text.substring(0, maxLength) + '...' 
    : text;
}

export function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function debounce(func, wait, immediate) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(this, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(this, args);
  };
}

export function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

const TWITTER_URL_WEIGHT = 23;

const cjkRanges = [
  [0x1100, 0x11FF], // Hangul Jamo
  [0x2E80, 0x2EFF], // CJK Radicals Supplement
  [0x2F00, 0x2FDF], // Kangxi Radicals
  [0x2FF0, 0x2FFF], // Ideographic Description Characters
  [0x3000, 0x303F], // CJK Symbols and Punctuation
  [0x3040, 0x309F], // Hiragana
  [0x30A0, 0x30FF], // Katakana
  [0x3100, 0x312F], // Bopomofo
  [0x3130, 0x318F], // Hangul Compatibility Jamo
  [0x3190, 0x319F], // Kanbun
  [0x31A0, 0x31BF], // Bopomofo Extended
  [0x31C0, 0x31EF], // CJK Strokes
  [0x31F0, 0x31FF], // Katakana Phonetic Extensions
  [0x3200, 0x32FF], // Enclosed CJK Letters and Months
  [0x3300, 0x33FF], // CJK Compatibility
  [0x3400, 0x4DBF], // CJK Unified Ideographs Extension A
  [0x4E00, 0x9FFF], // CJK Unified Ideographs
  [0xA960, 0xA97F], // Hangul Jamo Extended-A
  [0xAC00, 0xD7AF], // Hangul Syllables
  [0xD7B0, 0xD7FF], // Hangul Jamo Extended-B
  [0xF900, 0xFAFF], // CJK Compatibility Ideographs
  [0xFE30, 0xFE4F], // CJK Compatibility Forms
  [0x1F200, 0x1F2FF] // Enclosed Ideographic Supplement
];

const emojiRanges = [
  [0x1F000, 0x1F9FF],
  [0x2600, 0x27BF],
  [0xFE00, 0xFE0F],
  [0x1FA70, 0x1FAFF]
];

function isCodePointInRanges(codePoint, ranges) {
  return ranges.some(([start, end]) => codePoint >= start && codePoint <= end);
}

function isTwitterDoubleWeightGrapheme(grapheme) {
  if (!grapheme) return false;
  const codePoint = grapheme.codePointAt(0);
  if (!codePoint) return false;
  if (isCodePointInRanges(codePoint, emojiRanges)) return true;
  if (isCodePointInRanges(codePoint, cjkRanges)) return true;
  // Fullwidth characters
  if (codePoint >= 0xFF01 && codePoint <= 0xFF60) return true;
  if (codePoint >= 0xFFE0 && codePoint <= 0xFFE6) return true;
  return false;
}

function segmentText(text) {
  if (typeof Intl !== 'undefined' && typeof Intl.Segmenter !== 'undefined') {
    const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
    return Array.from(segmenter.segment(text), (segment) => segment.segment);
  }
  return Array.from(text);
}

function countGraphemes(text) {
  if (!text) return 0;
  const segments = segmentText(text);
  return segments.length;
}

function countTwitterCharacters(text) {
  if (!text) return 0;
  let count = 0;
  let workingText = text;
  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  const urlMatches = workingText.match(urlRegex);

  if (urlMatches && urlMatches.length) {
    count += urlMatches.length * TWITTER_URL_WEIGHT;
    workingText = workingText.replace(urlRegex, '');
  }

  const graphemes = segmentText(workingText);
  for (const grapheme of graphemes) {
    if (!grapheme) continue;
    if (isTwitterDoubleWeightGrapheme(grapheme)) {
      count += 2;
    } else {
      count += 1;
    }
  }

  return count;
}

export function calculatePlatformCharacterCount(text, platform = 'generic') {
  if (!text) return 0;
  const normalizedText = typeof text === 'string' ? text.trim() : String(text);
  if (normalizedText.length === 0) return 0;

  switch (platform) {
    case 'twitter':
    case 'thread':
      return countTwitterCharacters(normalizedText);
    case 'analytics':
    case 'summary':
    case 'analysis':
      return countGraphemes(normalizedText);
    default:
      return countGraphemes(normalizedText);
  }
}

export function clampContentToPlatformLimit(text, platform = 'generic', limit = 280) {
  if (!text) return '';
  const segments = segmentText(text);
  let count = 0;
  const builder = [];
  for (const segment of segments) {
    const weight = calculatePlatformCharacterCount(segment, platform === 'thread' ? 'twitter' : platform);
    if (count + weight > limit) break;
    builder.push(segment);
    count += weight;
  }
  return builder.join('');
}