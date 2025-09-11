'use strict';
const assert = require('assert');
const path = require('path');
const { splitFactCheckSections } = require(path.join(__dirname, '../dist/extension/structured-helpers-node.js'));

function test(name, fn) {
  try { fn(); console.log('✓', name); } catch (err) { console.error('✗', name, '\n ', err?.stack || err); process.exitCode = 1; }
}

const sample = [
  'Claim 1) This is the first claim.\nEvidence: ...\n\nClaim 2) Second claim text.\nEvidence: ...',
  '1) First claim paragraph.\n\n2) Second claim paragraph.',
  'CLAIM 1: Alpha\n\nCLAIM 2: Beta',
  'No explicit claim headings here.'
];

test('splitFactCheckSections splits on Claim N) pattern', () => {
  const parts = splitFactCheckSections(sample[0]);
  assert(parts.length === 2, 'should split into two parts');
});

test('splitFactCheckSections splits on numbered headings like 1) 2)', () => {
  const parts = splitFactCheckSections(sample[1]);
  assert(parts.length === 2, 'should split into two parts');
});

test('splitFactCheckSections splits on uppercase CLAIM', () => {
  const parts = splitFactCheckSections(sample[2]);
  assert(parts.length === 2, 'should split into two parts');
});

test('splitFactCheckSections returns single entry when no headings detected', () => {
  const parts = splitFactCheckSections(sample[3]);
  assert(parts.length === 1 && parts[0] === sample[3], 'should return original content as single part');
});
