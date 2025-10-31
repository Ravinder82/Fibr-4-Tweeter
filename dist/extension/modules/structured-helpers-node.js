'use strict';

// Split Fact Check content into sections. Mirrors ui-render.js regex logic
function splitFactCheckSections(rawContent) {
  if (!rawContent || typeof rawContent !== 'string') return [];
  const parts = rawContent
    .split(/\n\n(?=(?:Claim\s*\d+|CLAIM\s*\d+|\d+[\.)]\s))/)
    .filter(Boolean);
  return parts.length > 0 ? parts : [rawContent];
}

module.exports = { splitFactCheckSections };
