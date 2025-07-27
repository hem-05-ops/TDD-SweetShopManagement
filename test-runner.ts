#!/usr/bin/env tsx

import { execSync } from 'child_process';
import { readdir } from 'fs/promises';
import { join } from 'path';

// Simple test runner
async function runTests() {
  console.log('🚀 Starting Sweet Shop Management System Tests\n');
  
  const testDir = './tests';
  const testFiles = await readdir(testDir);
  const testFilePaths = testFiles
    .filter(file => file.endsWith('.test.ts'))
    .map(file => join(testDir, file));

  console.log(`Found ${testFilePaths.length} test files:\n`);
  testFilePaths.forEach(file => console.log(`  ✓ ${file}`));
  console.log('');

  let passed = 0;
  let failed = 0;

  for (const testFile of testFilePaths) {
    try {
      console.log(`📝 Running ${testFile}...`);
      
      // Run each test file with tsx
      execSync(`NODE_ENV=test tsx ${testFile}`, { 
        stdio: 'inherit',
        env: { ...process.env, JWT_SECRET: 'test-jwt-secret' }
      });
      
      console.log(`✅ ${testFile} passed\n`);
      passed++;
    } catch (error) {
      console.log(`❌ ${testFile} failed\n`);
      failed++;
    }
  }

  console.log('📊 Test Summary:');
  console.log(`  ✅ Passed: ${passed}`);
  console.log(`  ❌ Failed: ${failed}`);
  console.log(`  📈 Total: ${passed + failed}\n`);

  if (failed > 0) {
    console.log('❌ Some tests failed');
    process.exit(1);
  } else {
    console.log('🎉 All tests passed!');
    process.exit(0);
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}