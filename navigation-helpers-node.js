'use strict';

// Pure helper to compute which view is hidden/visible
// views: { key: { id: 'welcome-view', hidden: true|false } }
// returns new object with updated hidden flags
function computeViewState(views, state) {
  if (!views || typeof views !== 'object') throw new Error('views must be an object');
  if (!Object.prototype.hasOwnProperty.call(views, state)) throw new Error(`View "${state}" not found`);
  const next = {};
  for (const key of Object.keys(views)) {
    next[key] = { ...(views[key] || {}) };
    next[key].hidden = key !== state;
  }
  return next;
}

module.exports = { computeViewState };
