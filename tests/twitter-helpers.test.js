'use strict';
const assert = require('assert');
const path = require('path');
const { cleanTwitterContent, parseTwitterThread } = require(path.join(__dirname, '../dist/extension/twitter-helpers-node.js'));

function test(name, fn) {
  try {
    fn();
    console.log('✓', name);
  } catch (err) {
    console.error('✗', name, '\n ', err && err.stack || err);
    process.exitCode = 1;
  }
}

// Tests for cleanTwitterContent

test('cleanTwitterContent removes hashtags and asterisks and converts line break markers', () => {
  const input = 'This is *bold* and **strong** #hashtag (line break) Next [text]';
  const out = cleanTwitterContent(input);
  console.log('DEBUG cleaned output:', JSON.stringify(out));
  assert(!out.includes('#'), 'should remove #hashtags');
  assert(out.includes('bold') && !out.includes('*bold*'), 'should strip single asterisks');
  assert(out.includes('strong') && !out.includes('**strong**'), 'should strip double asterisks');
  assert(out.includes('\n'), 'should convert (line break) to newline');
  assert(!out.includes('[') && !out.includes(']'), 'should remove square bracket artifacts');
});

test('cleanTwitterContent normalizes bullets and whitespace', () => {
  const input = '- item one\n* item two\n\n\nparagraph';
  const out = cleanTwitterContent(input);
  assert(out.includes('• item one'), 'should convert - to •');
  assert(out.includes('• item two'), 'should convert * to •');
  assert(!/\n{3,}/.test(out), 'should collapse multiple blank lines');
});

// Tests for parseTwitterThread

test('parseTwitterThread splits on 1/n, 2/n style numbering', () => {
  const input = '1/3: First tweet\n2/3: Middle tweet\n3/3: Final tweet';
  const tweets = parseTwitterThread(input);
  assert(Array.isArray(tweets), 'should return an array');
  assert(tweets.length === 3, 'should split into three tweets');
  assert(/First tweet/.test(tweets[0]), 'first tweet content should match');
});

test('parseTwitterThread falls back to single tweet when no numbering present', () => {
  const input = 'No numbering present here, just a single tweet-like text.';
  const tweets = parseTwitterThread(input);
  assert(tweets.length === 1, 'should return a single tweet');
  assert.strictEqual(tweets[0].trim(), cleanTwitterContent(input), 'should return cleaned input');
});

test('parseTwitterThread strips leading "Here\'s your clean content" intro if present', () => {
  const input = "Here's your clean awesome content: 1/2 First part 2/2 Second part";
  const tweets = parseTwitterThread(input);
  assert(tweets.length === 2, 'should still split into two tweets after removing intro');
});

if (process.exitCode) {
  console.error('\nSome tests failed.');
} else {
  console.log('\nAll tests ran.');
}
