#!/usr/bin/env node

const { readdirSync, statSync, readFileSync } = require('fs');
const { join, extname } = require('path');

const ROOT = process.argv[2] ? join(process.cwd(), process.argv[2]) : process.cwd();
const ALLOWED_SCHEMES = new Set(['chrome-extension:', 'data:', 'blob:']);
// Match real http(s) URLs only (avoid matching comment slashes)
const REMOTE_PATTERN = /\bhttps?:\/\/[\w\-._~:/?#@!$&'()*+,;=%]+/i;
const REMOTE_INDICATORS = [
  'cdn.',
  ' unpkg',
  ' jsdelivr',
  ' importScripts(',
  ' createElement(\'script\')',
  ' createElement("script")',
  ' chrome.scripting.executeScript({ files: ['
];

const suspicious = [];

function allowlistMatch(snippet) {
  const trimmed = snippet.trim();
  if (!trimmed) return true;
  const scheme = trimmed.split(':')[0] + ':';
  if (ALLOWED_SCHEMES.has(scheme)) return true;
  
  // Ignore markdown link placeholder used in formatter: "](https://)"
  if (/\]\(https:\/\/\)/.test(trimmed)) return true;
  if (/\]\(http:\/\/\)/.test(trimmed)) return true;
  
  // Ignore protocol with no host (e.g., "https://)" or "http://)" in minified code)
  if (/https?:\/\/\)/.test(trimmed)) return true;
  
  // Allowlist Gemini API endpoint (required for extension functionality)
  if (/^https?:\/\/generativelanguage\.googleapis\.com\//.test(trimmed)) return true;
  if (/generativelanguage\.googleapis\.com/.test(trimmed)) return true;
  
  // Allowlist Google AI Studio (user instructions for API key setup)
  if (/aistudio\.google\.com\/app\/apikey/.test(trimmed)) return true;
  
  // Allowlist marked.js GitHub link (error reporting in library)
  if (/github\.com\/markedjs\/marked/.test(trimmed)) return true;
  
  // Allowlist SVG namespace (standard XML namespace, not remote code)
  if (/xmlns="http:\/\/www\.w3\.org\//.test(trimmed)) return true;
  
  // Allowlist Chrome Web Store URL (used in protection check, not loaded)
  if (/chrome\.google\.com\/webstore/.test(trimmed)) return true;
  
  return false;
}

function scanFile(filePath) {
  const content = readFileSync(filePath, 'utf8');
  if (REMOTE_PATTERN.test(content) || REMOTE_INDICATORS.some((indicator) => content.includes(indicator))) {
    const lines = content.split(/\r?\n/);
    let inBlockComment = false;
    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      // Track simple block comments to skip scanning commented code
      if (trimmed.startsWith('/*')) inBlockComment = true;
      if (inBlockComment) {
        if (trimmed.endsWith('*/')) inBlockComment = false;
        return;
      }
      // Skip single-line comments
      if (/^\s*\/\//.test(line)) return;
      if (
        (REMOTE_PATTERN.test(line) || REMOTE_INDICATORS.some((indicator) => line.includes(indicator))) &&
        !allowlistMatch(line)
      ) {
        suspicious.push({ filePath, line: idx + 1, snippet: line.trim() });
      }
    });
  }
}

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      if (entry.startsWith('.') || entry === 'node_modules' || entry === '.git') continue;
      walk(fullPath);
    } else {
      const ext = extname(entry).toLowerCase();
      if (['.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.json'].includes(ext)) {
        scanFile(fullPath);
      }
    }
  }
}

walk(ROOT);

if (suspicious.length > 0) {
  console.error('Potential remote code references detected:');
  for (const { filePath, line, snippet } of suspicious) {
    console.error(` - ${filePath}:${line}`);
    console.error(`   ${snippet}`);
  }
  process.exit(1);
}

console.log('✅ No remote code references detected.');
