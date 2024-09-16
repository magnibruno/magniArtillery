//
// The code in this function was generated with
// playwright codegen
// https://playwright.dev/docs/codegen
//
async function loadTest(
  page,
  userContext,
  events,
  test
) {
  await test.step('Get user to run', async () => {
    const requestPromise = page.waitForRequest('https://localhost:44379/api/LoadTest/GetUser.aspx');
    await page.goto('https://localhost:44379/api/LoadTest/GetUser.aspx');
    const req = await requestPromise;    
  });

  await test.step('Start the test', async () => {
    const userObject = await page.locator('body').textContent();

    loadTestUser = JSON.parse(userObject);

		if(!loadTestUser.username){
      events.emit('counter', `user.load_user_failed`, 1);
    } else {
      console.log('user loaded', loadTestUser.username);
    }

    await page.goto('https://localhost:44379/');

    const isWelcomeTextVisible = await page.getByText('Welcome to MagniLearn').isVisible();
    const text = await page.getByText('Welcome to MagniLearn').textContent();   

    if (!isWelcomeTextVisible) {
      events.emit('counter', `user.element_check_failed.WelcomeToMagniLearn`, 1);
    } else {
      console.log('login screen loaded');
    }

    //fill password and username
		await page.locator('//input[contains(@id, "username")]').fill(loadTestUser.username);

		//enter password
		await page.locator('//input[contains(@id, "password")]').fill(loadTestUser.password);

    await page.getByRole('button', { id: 'login-button' }).click();

    //wait student dashboard loads
    await page.getByRole('navigation').getByRole('button', { name: 'Start Lesson' }).click();

    await page.waitForTimeout(200000);

    await page.screenshot({ path: 'screenshot.png' });

    await page.waitForTimeout(1500000);


  });
    
}


module.exports = {
  loadTest,
};