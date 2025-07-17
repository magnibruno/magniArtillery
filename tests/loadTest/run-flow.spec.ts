import { test, expect } from '@playwright/test';
const { test: flowTest } = require('./flows');

test('Load Test', async ({ page }) => {
  // Import and run the flow from flows.js
  await flowTest(page);
}); 