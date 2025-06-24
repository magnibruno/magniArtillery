const { expect } = require('@playwright/test');

// Helper function for login
async function login(page, username, password) {
  await page.goto('https://ie-learning.magnilearn.com/Logout.aspx');
  await page.getByRole('textbox', { name: 'Username (email)' }).click();
  await page.getByRole('textbox', { name: 'Username (email)' }).fill(username);
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await page.getByRole('button', { name: 'Login' }).click();

  await page.waitForLoadState('networkidle');
  const terminateButton = page.getByRole('button', { name: 'Terminate & stay here' });

  if (await terminateButton.isVisible()) {
    await terminateButton.click();
    console.log('Session terminated successfully.');
  } else {
    console.log('No existing session found or button not displayed.');
  }
}

async function completeSection(page, sectionName) {
  await expect(page.getByRole('button', { name: sectionName })).toBeVisible({ timeout: 300000 });
  await page.getByRole('button', { name: sectionName }).click();
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('button', { name: 'Done' })).toBeVisible({ timeout: 300000 });
  await page.getByRole('button', { name: 'Done' }).click();
}

async function test(page) {
  try {
    // Usage in the test
    await login(page, 'MM_c4437318-9019-4d89-8899-182b8110b731', '@C3T1nt3Gr4t10nPa$$w0rD');
    
    // we need to wait for the page to load after login before continuing
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('link', { name: 'QA A2 Class' })).toBeVisible({ timeout: 300000 });
    await expect(page.getByRole('heading', { name: 'Pivot English A2', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Unit 1 - Arrivals' })).toBeVisible();

    await page.getByRole('link', { name: 'Unit 1 - Arrivals' }).click();

    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('link', { name: 'People and places' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Where are you?' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'What\'s in your bag?' })).toBeVisible();

    await page.getByRole('link', { name: 'People and places' }).click();

    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'People and places' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Guided learning' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Listening' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Vocabulary' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Pronunciation' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Grammar' })).toBeVisible();

    await completeSection(page, 'Listening');
    await completeSection(page, 'Vocabulary');
    await completeSection(page, 'Pronunciation');
    await completeSection(page, 'Grammar');

    await page.goto('https://ie-learning.magnilearn.com/Logout.aspx');

  } catch (error) {
    console.error('An error occurred during the test:', error);
    await page.screenshot({ path: 'error_screenshot.png' });
    throw error; // Re-throw the error after logging it
  }
}

module.exports = { test }; 