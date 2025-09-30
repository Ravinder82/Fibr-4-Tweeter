'use strict';

function addToHistoryObject(history, category, record, maxPerCategory = 50) {
  const h = history || {};
  const list = Array.isArray(h[category]) ? h[category] : [];
  const next = [record, ...list].slice(0, maxPerCategory);
  return { ...h, [category]: next };
}

function getHistoryCategory(history, category) {
  const h = history || {};
  return Array.isArray(h[category]) ? h[category] : [];
}

function clearHistoryCategoryInObject(history, category) {
  const h = { ...(history || {}) };
  if (h[category]) delete h[category];
  return h;
}

module.exports = { addToHistoryObject, getHistoryCategory, clearHistoryCategoryInObject };
