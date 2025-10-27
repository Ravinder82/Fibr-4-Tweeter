'use strict';

function run(file) {
  console.log(`\n=== Running ${file} ===`);
  require(file);
}

try {
  run('./twitter-helpers.test.js');
  run('./structured-helpers.test.js');
  run('./navigation-helpers.test.js');
  console.log('\nAll test suites executed.');
} catch (e) {
  console.error('Test runner error:', e);
  process.exitCode = 1;
}
