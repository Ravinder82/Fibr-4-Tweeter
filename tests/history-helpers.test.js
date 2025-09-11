'use strict';
const assert = require('assert');
const path = require('path');
const {
  addToHistoryObject,
  getHistoryCategory,
  clearHistoryCategoryInObject
} = require(path.join(__dirname, '../dist/extension/history-helpers-node.js'));

function test(name, fn) {
  try { fn(); console.log('✓', name); } catch (err) { console.error('✗', name, '\n ', err?.stack || err); process.exitCode = 1; }
}

test('addToHistoryObject initializes category and prepends records with cap 50', () => {
  let history = {};
  for (let i = 0; i < 55; i++) {
    const rec = { id: i };
    history = addToHistoryObject(history, 'summary', rec);
  }
  const list = getHistoryCategory(history, 'summary');
  assert(list.length === 50, 'should cap at 50');
  assert(list[0].id === 54, 'most recent first');
});

test('clearHistoryCategoryInObject removes a category', () => {
  let history = {};
  history = addToHistoryObject(history, 'blog', { id: 1 });
  history = addToHistoryObject(history, 'blog', { id: 2 });
  const cleared = clearHistoryCategoryInObject(history, 'blog');
  const list = getHistoryCategory(cleared, 'blog');
  assert(list.length === 0, 'blog category should be removed');
});
