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
    const requestPromise = page.waitForRequest('https://perf.magnilearn.com/api/LoadTest/GetUser.aspx');
    await page.goto('https://perf.magnilearn.com/api/LoadTest/GetUser.aspx');
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

    await page.goto('https://perf.magnilearn.com/');

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

    // wait next page load
    await page.waitForTimeout(3000);

    
    const terminateSessionBtn = await page.getByRole('button', { name: 'Terminate & stay here' }).isVisible();

    if(terminateSessionBtn){
      await page.screenshot({ path: 'screenshotTerminateSession-'+loadTestUser.username + '.png' });
      await page.getByRole('button', { name: 'Terminate & stay here' }).click();
    }


    // wait next page load
    await page.waitForTimeout(3000);

    const avatarContainer = await page.locator('//div[contains(@id, "choose-an-avatar")]').isVisible();;

    if(avatarContainer){
      await page.screenshot({ path: 'screenshotChooseAvatar-'+loadTestUser.username + '.png' });
      await page.locator('//div[contains(@id, "Male")]').click();
    }

    // wait student dashboard
    await page.waitForTimeout(3000);

    await page.screenshot({ path: 'screenshotStudentDashboard-'+loadTestUser.username + '.png' });

    //wait student dashboard loads
    await page.getByRole('navigation').getByRole('button', { name: 'Start Lesson' }).click();

    await page.waitForTimeout(10000);

    await page.screenshot({ path: 'screenshotStartExercise-'+loadTestUser.username + '.png' });

    await page.waitForTimeout(1500000);

    await page.screenshot({ path: 'screenshotEndingExercise-'+loadTestUser.username + '.png' });
  });
    
}


module.exports = {
  loadTest,
};