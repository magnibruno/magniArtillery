//
// The code in this function was generated with
// playwright codegen
// https://playwright.dev/docs/codegen
//
async function checkLearningLoginScreen(
  page,
  userContext,
  events,
  test
) {
  await test.step('Go to Learnin Login Page', async () => {
    const requestPromise = page.waitForRequest('http://ie-learning.magnilearn.com/Login.aspx?ReturnUrl=%2f');
    await page.goto('http://ie-learning.magnilearn.com/Login.aspx?ReturnUrl=%2f');
    const req = await requestPromise;
  });

  await test.step('Check if the page is well rendered', async () => {
    const isWelcomeTextVisible = await page.getByText('Welcome to MagniLearn').isVisible();
    const text = await page.getByText('Welcome to MagniLearn').textContent();

    console.log(text);
    

    if (!isWelcomeTextVisible) {
      events.emit('counter', `user.element_check_failed.WelcomeToMagniLearn`, 1);
    }
  });
}


module.exports = {
  checkLearningLoginScreen,
};