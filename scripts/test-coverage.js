#!/usr/bin/env node

/**
 * Test coverage script for AudioToChat
 * Runs all tests and generates coverage reports
 */

const { execSync } = require('child_process');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

console.log('🧪 Running AudioToChat Test Suite...\n');

try {
  // Run tests with coverage
  console.log('📊 Running tests with coverage...');
  execSync('npm test -- --coverage --watchAll=false', {
    cwd: rootDir,
    stdio: 'inherit'
  });

  console.log('\n✅ All tests completed successfully!');
  console.log('📈 Coverage report generated in coverage/ directory');
  console.log('🌐 Open coverage/lcov-report/index.html to view detailed coverage');

} catch (error) {
  console.error('\n❌ Tests failed:', error.message);
  process.exit(1);
}
