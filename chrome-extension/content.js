// This content script listens for form submissions and auto-fills the dashboard field instead of the email field.

document.addEventListener('DOMContentLoaded', function () {
  // Adjust selectors as needed for your actual dashboard and submit button
  const form = document.querySelector('form');
  if (!form) return;

  const dashboardInput = document.querySelector('input[name="dashboard"], #dashboard');
  const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');

  if (!dashboardInput || !submitBtn) return;

  submitBtn.addEventListener('click', function (e) {
    // Prevent default if you want to control submission
    // e.preventDefault();
    // Fill the dashboard field with a sample value
    dashboardInput.value = 'AutoFilledDashboardValue';
    // Optionally, trigger input/change events if needed by the site
    dashboardInput.dispatchEvent(new Event('input', { bubbles: true }));
    dashboardInput.dispatchEvent(new Event('change', { bubbles: true }));
  }, false);
});
