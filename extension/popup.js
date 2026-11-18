'use strict';
const control = document.getElementById('enabled');
const status = document.getElementById('status');
function render(enabled) {
  control.checked = enabled;
  status.textContent = enabled ? 'Telegram style is on for your Slack tabs.' : 'Original Slack layout is on.';
}
chrome.storage.local.get({ paperplaneEnabled:true }).then(values => {
  render(values.paperplaneEnabled !== false);
  control.disabled = false;
}).catch(() => { status.textContent = 'Could not read settings. Reopen this popup.'; });
control.addEventListener('change', async () => {
  control.disabled = true;
  const desired = control.checked;
  try { await chrome.storage.local.set({ paperplaneEnabled:desired }); render(desired); }
  catch { control.checked = !desired; status.textContent = 'Could not save. Please try again.'; }
  finally { control.disabled = false; }
});
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.paperplaneEnabled) render(changes.paperplaneEnabled.newValue !== false);
});
