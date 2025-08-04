const { expect } = require('@playwright/test');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Configuration
const testConfig = {
  baseUrl: process.env.BASE_URL || 'https://perf.magnilearn.com',
  credentials: {
    username: process.env.MAGNILEARN_USERNAME || 'MM_c4437318-9019-4d89-8899-182b8110b731',
    password: process.env.MAGNILEARN_PASSWORD || '@C3T1nt3Gr4t10nPa$$w0rD'
  },
  timeouts: {
    default: 300000, // 5 minutes
    short: 10000,    // 10 seconds
    medium: 30000    // 30 seconds
  }
};

// Helper function to wait for page load with error handling
async function waitForPageLoad(page, timeout = 10000) {
  try {
    await page.waitForLoadState('networkidle', { timeout });
  } catch (error) {
    console.log(`Page load wait timed out after ${timeout}ms, continuing...`);
  }
}

// Helper function for login
async function login(page, username, password) {
  // get username and password
  await page.goto(`${testConfig.baseUrl}/api/LoadTest/getUser`);

  //read body content and parse it as json
  const bodyText = await page.locator('body').textContent();
  const jsonBody = JSON.parse(bodyText);
  const loginUsername = jsonBody.username;
  const loginPassword = jsonBody.password;

  console.log(`Login username: ${loginUsername}`);
  console.log(`Login password: ${loginPassword}`);
  
  await page.goto(`${testConfig.baseUrl}/Logout.aspx`);
  await page.getByRole('textbox', { name: 'Username (email)' }).click();
  await page.getByRole('textbox', { name: 'Username (email)' }).fill(loginUsername);
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill(loginPassword);
  await page.getByRole('button', { name: 'Login' }).click();

  // await page.waitForLoadState('networkidle');
  await waitForPageLoad(page);
  const terminateButton = page.getByRole('button', { name: 'Terminate & stay here' });

  if (await terminateButton.isVisible()) {
    await terminateButton.click();
    console.log('Session terminated successfully.');
  } else {
    console.log('No existing session found or button not displayed.');
  }
}

async function test(page) {
  try {
    // Usage in the test - now using configuration
    await login(page);
    
    // we need to wait for the page to load after login before continuing
    // await page.waitForLoadState('networkidle');
    await waitForPageLoad(page);

    await expect(page.getByRole('navigation').getByRole('button', { name: 'Start lesson' })).toBeVisible({ timeout: 150000});
    await page.getByRole('navigation').getByRole('button', { name: 'Start lesson' }).click();

    // await page.waitForLoadState('networkidle');
    await waitForPageLoad(page);

    await expect(page.getByRole('button', { name: 'Return to the dashboard' })).toBeVisible({ timeout: 700000 });
    await page.getByRole('button', { name: 'Return to the dashboard' }).click();       

    await page.goto(`${testConfig.baseUrl}/Logout.aspx`);

  } catch (error) {
    console.error('An error occurred during the test:', error);
    await page.screenshot({ path: 'error_screenshot.png' });
    throw error; // Re-throw the error after logging it
  }
}

module.exports = { test }; 