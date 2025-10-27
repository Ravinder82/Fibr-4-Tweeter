'use strict';
const assert = require('assert');
const path = require('path');
const { computeViewState } = require(path.join(__dirname, '../src/extension/modules/navigation-helpers-node.js'));

function test(name, fn) {
  try { fn(); console.log('✓', name); } catch (err) { console.error('✗', name, '\n ', err?.stack || err); process.exitCode = 1; }
}

const views = {
  welcome: { id: 'welcome-view', hidden: true },
  'api-setup': { id: 'api-setup-view', hidden: true },
  chat: { id: 'chat-view', hidden: true },
  settings: { id: 'settings-view', hidden: true }
};

test('computeViewState shows target view and hides others', () => {
  const next = computeViewState(views, 'chat');
  Object.keys(views).forEach(k => {
    if (k === 'chat') assert.strictEqual(next[k].hidden, false, 'chat should be visible');
    else assert.strictEqual(next[k].hidden, true, `${k} should be hidden`);
  });
});

test('computeViewState throws for unknown view', () => {
  let threw = false;
  try { computeViewState(views, 'unknown'); } catch (e) { threw = true; }
  assert.strictEqual(threw, true, 'should throw for unknown view');
});
