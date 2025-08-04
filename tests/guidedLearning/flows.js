const { expect } = require('@playwright/test');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Configuration
const testConfig = {
  baseUrl: process.env.BASE_URL || 'https://ie-learning.magnilearn.com',
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
  const loginUsername = username || testConfig.credentials.username;
  const loginPassword = password || testConfig.credentials.password;

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

async function completeSection(page, sectionName) {
  await expect(page.getByRole('button', { name: sectionName })).toBeVisible({ timeout: testConfig.timeouts.default });
  await page.getByRole('button', { name: sectionName }).click();
  // await page.waitForLoadState('networkidle');
  await waitForPageLoad(page);
  await expect(page.getByRole('button', { name: 'Done' })).toBeVisible({ timeout: testConfig.timeouts.default });
  await page.getByRole('button', { name: 'Done' }).click();
}

async function iterateSections(page) {
  return new Promise(async (resolve, reject) => {
    try {
      // Instead of using a hardcoded link name, we have a UL list 
      // Locate the UL element with data-testid="sections"
      const sectionsList = await page.locator('ul[data-testid="sections"]');

      // Get all the list items (links) within the UL
      const sectionLinks = await sectionsList.locator('li button').all();

      // Iterate over the links and perform actions
      for (const link of sectionLinks) {
        const sectionName = await link.textContent();
        console.log(`Clicking on section: ${sectionName}`);
        await completeSection(page, sectionName);

      }
      resolve();
    } catch (error) {
      console.error('An error occurred while iterating sections:', error);
      reject(error); // Reject the promise if an error occurs
    }

  });
}

async function iterateLessons(page, lesson) {
  // Instead of using a hardcoded link name, we have a UL list 
  // Locate the UL element with data-testid="lessons"
  const lessonsList = await page.locator('ul[data-testid="lessons"]');

  // Get all the list items (links) within the UL
  const lessonLinks = await lessonsList.locator('li a').all();

  // Iterate over the links and perform actions
  for (const link of lessonLinks) {
    // await page.waitForLoadState('networkidle');
    await waitForPageLoad(page);
    const linkText = await link.textContent();
    console.log(`Clicking on lesson: ${linkText}`);
    await link.click();
    // await page.waitForLoadState('networkidle');
    await waitForPageLoad(page);
    // navigate back to the lesson link page after completing the lesson do not use page.goBack()
    // Instead of using a hardcoded link name, we have a UL list 
    // Locate the UL element with data-testid="sections"
    const sectionsList = await page.locator('ul[data-testid="sections"]');

    // Get all the list items (links) within the UL
    const sectionLinks = await sectionsList.locator('li button').all();

    // Iterate over the links and perform actions
    for (const link of sectionLinks) {
      const sectionName = await link.textContent();
      console.log(`Clicking on section: ${sectionName}`);
      await expect(page.getByRole('button', { name: sectionName })).toBeVisible({ timeout: 300000 });
      await page.getByRole('button', { name: sectionName }).click();
      // await page.waitForLoadState('networkidle');
      await waitForPageLoad(page);
      await expect(page.getByRole('button', { name: 'Done' })).toBeVisible({ timeout: 300000 });
      await page.getByRole('button', { name: 'Done' }).click();
    }
    page.goBack();

  }
}

async function test(page) {
  try {
    // Usage in the test - now using configuration
    await login(page);

    // we need to wait for the page to load after login before continuing
    // await page.waitForLoadState('networkidle');
    await waitForPageLoad(page);

    try {
      const studentExperienceBtn = page.getByRole('button', { name: 'Student experience' });
      const isTrialOrDemo = await studentExperienceBtn.isVisible({ timeout: 2000 }); // Waiting for 2 seconds.
      if (isTrialOrDemo) {
        // Trial/Demo
        await studentExperienceBtn.click();

        // Waiting for page to load, can be or pillar page, or cefr/bands page
        // await page.waitForLoadState('networkidle');
        await waitForPageLoad(page);
        const urlContainsCefr = page.url().includes('pe/cefr');

        if (urlContainsCefr) {
          try {
            // In CEFR/Bands page
            // Find the first button in ul that is not disabled and click it
            await page.locator('ul button:not([disabled])').first().click({ timeout: 300000 });
          } catch (cefrError) {
            console.log('Failed to click CEFR button, continuing...', cefrError.message);
          }
        }
      }
    } catch (error) {
      console.log('Trial/Demo navigation failed, continuing...', error.message);
    }

    // Waiting for title to be previewed meaning page is loaded.
    try {
      await expect(page.getByTestId('le-school-name')).toBeVisible({ timeout: 300000 });
    } catch (error) {
      // If element is not visible after timeout, navigate to logout
      console.log('Element not visible after timeout, redirecting to logout');
      await page.goto('/Logout.aspx');
    }

    // Instead of using a hardcoded link name, we have a UL list 
    // Locate the UL element with data-testid="units"
    const unitsList = await page.locator('ul[data-testid="units"]');

    // Get all the list items (links) within unitsList
    const unitLinks = await unitsList.locator('li a').all();


    // Iterate over the links and perform actions
    for (const link of unitLinks) {
      const linkText = await link.textContent();
      console.log(`Clicking on unit: ${linkText}`);
      await link.click();
      await expect(page.getByRole('heading', { name: linkText, exact: true })).toBeVisible({ timeout: 300000 });
      // await page.waitForLoadState('networkidle'); // Wait for the page to load after clicking
      await waitForPageLoad(page);

      // Instead of using a hardcoded link name, we have a UL list 
      // Locate the UL element with data-testid="lessons"
      const lessonsList = await page.locator('ul[data-testid="lessons"]');

      // Get all the list items (links) within the UL
      const lessonLinks = await lessonsList.locator('li a').all();

      // Iterate over the links and perform actions
      for (const link of lessonLinks) {
        // await page.waitForLoadState('networkidle');
        await waitForPageLoad(page);
        const linkText = await link.textContent();
        console.log(`Clicking on lesson: ${linkText}`);
        await link.click();
        // await page.waitForLoadState('networkidle');
        await waitForPageLoad(page);

        await expect(page.getByRole('button', { name: 'Guided learning' })).toBeVisible({ timeout: 300000 });
        // navigate back to the lesson link page after completing the lesson do not use page.goBack()
        // Instead of using a hardcoded link name, we have a UL list 
        // Locate the UL element with data-testid="sections"
        const sectionsList = await page.locator('ul[data-testid="sections"]');

        // Get all the list items (links) within the UL
        const sectionLinks = await sectionsList.locator('li button').all();

        // Iterate over the links and perform actions
        for (const link of sectionLinks) {
          const sectionName = await link.textContent();
          console.log(`Clicking on section: ${sectionName}`);
          await expect(page.getByRole('button', { name: sectionName })).toBeVisible({ timeout: 300000 });
          await page.getByRole('button', { name: sectionName }).click();
          // await page.waitForLoadState('networkidle');
          await waitForPageLoad(page);
          await expect(page.getByRole('button', { name: 'Done' })).toBeVisible({ timeout: 300000 });
          await page.getByRole('button', { name: 'Done' }).click();
        }

        // after sections, we need to run independent learning if the button is enabled
        // await page.waitForLoadState('networkidle');
        await waitForPageLoad(page);
        if (await page.getByRole('button', { name: 'Independent learning' }).isEnabled()) {
          console.log(`Run Independent Learning`);
          await expect(page.getByRole('button', { name: 'Independent learning' })).toBeVisible({ timeout: 300000 });
          await page.getByRole('button', { name: 'Independent learning' }).click();
          // await page.waitForLoadState('networkidle');
          await waitForPageLoad(page);
          await expect(page.getByRole('heading', { name: 'Independent learning', exact: true })).toBeVisible({ timeout: 300000 });
          await expect(page.getByRole('button', { name: 'Next' })).toBeVisible({ timeout: 300000 });
          await page.getByRole('button', { name: 'Next' }).click();
          await expect(page.getByRole('button', { name: 'Done' })).toBeVisible({ timeout: 300000 });
          await page.getByRole('button', { name: 'Done' }).click();
        }


        // await page.waitForLoadState('networkidle');
        await waitForPageLoad(page);
        if (await page.getByRole('button', { name: 'Memory training' }).isEnabled()) {
          // after Independent Learning, we need to run Memory Training
          console.log(`Run Memory Training`);
          await expect(page.getByRole('button', { name: 'Memory training' })).toBeVisible({ timeout: 300000 });
          await page.getByRole('button', { name: 'Memory training' }).click();
          // await page.waitForLoadState('networkidle');
          await waitForPageLoad(page);
          await expect(page.getByRole('heading', { name: 'Memory training', exact: true })).toBeVisible({ timeout: 300000 });
          await expect(page.getByRole('button', { name: 'Next' })).toBeVisible({ timeout: 300000 });
          await page.getByRole('button', { name: 'Next' }).click();
          await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible({ timeout: 300000 });
          await page.getByRole('button', { name: 'Continue' }).click();
          await expect(page.getByRole('button', { name: 'Done' })).toBeVisible({ timeout: 300000 });
          await page.getByRole('button', { name: 'Done' }).click();
        }

        page.goBack();

      }
    }

    await page.goto(`${testConfig.baseUrl}/Logout.aspx`);

  } catch (error) {
    console.error('An error occurred during the test:', error);
    await page.screenshot({ path: 'error_screenshot.png' });
    throw error; // Re-throw the error after logging it
  }
}

module.exports = { test }; 