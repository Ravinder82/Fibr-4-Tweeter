// Node-compatible version of the sanitizer for testing
const sanitizeStructuredOutput = (type, text) => {
  if (!text) return '';
  let t = String(text);
  // 1) Remove typical AI prefaces
  t = t.replace(/^(?:here\s*(?:is|are|\'s|’s)|below\s+is|certainly,|sure,|note:|here\'s a|here’s a)[^\n:]*:\s*/i, '');
  t = t.replace(/^\s*(?:here\s*(?:is|are|\'s|’s)\s*(?:a|an)?\s*)/i, '');
  // 2) Convert inline star bullets to real lines
  t = t.replace(/\s*\*\s+(?=[^\n])/g, '\n- ');
  // 3) Normalize line-start bullets
  t = t.replace(/^[ \t]*[•*]\s+/gm, '- ');
  // 4) Collapse excessive blank lines
  t = t.replace(/\n{3,}/g, '\n\n');
  // 5) Deduplicate URLs like (https://...)(https://...) or raw + (raw)
  t = t.replace(/\((https?:\/\/[^\s)]+)\)\s*\(\1\)/g, '($1)');
  t = t.replace(/(https?:\/\/[^\s)]+)\s*\(\1\)/g, '$1');
  // 6) Trim noisy leading/trailing quotes/backticks/spaces
  t = t.replace(/^[`\s]+/, '').replace(/[\s`]+$/, '');
  // 6b) Remove excessive markdown emphasis for cleaner copy, especially in keypoints
  if (type === 'keypoints' || type === 'summary') {
    t = t.replace(/\*\*([^*]+)\*\*/g, '$1');
    t = t.replace(/\*([^*]+)\*/g, '$1');
    t = t.replace(/_([^_]+)_/g, '$1');
  }
  // 7) For keypoints, ensure list lines really start with '- '
  if (type === 'keypoints') {
    if (!/^\s*-\s+/m.test(t)) {
      t = t
        .split(/\s*\*\s+|\n+/)
        .filter(Boolean)
        .map(s => s.replace(/^[-•*]\s+/, '').trim())
        .filter(Boolean)
        .map(s => `- ${s}`)
        .join('\n');
    }
  }
  return t.trim();
};

module.exports = { sanitizeStructuredOutput };
