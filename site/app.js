/* SPDX-License-Identifier: Apache-2.0 */
const themeKey = 'rpo-hub-theme';
const motionKey = 'rpo-hub-pause-motion';
const root = document.documentElement;
const themeButton = document.querySelector('.theme-picker-trigger');
const fallbackSelect = document.querySelector('#theme-fallback');
const themeDialog = document.querySelector('#theme-dialog');
const motionToggle = document.querySelector('.motion-toggle');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function getSession(key) {
  try { return sessionStorage.getItem(key); } catch { return null; }
}
function setSession(key, value) {
  try { sessionStorage.setItem(key, value); } catch { /* Storage can be blocked without breaking the page. */ }
}
function setTheme(value, persist = true) {
  const radio = [...document.querySelectorAll('input[name="site-theme"]')].find(input => input.value === value);
  const option = [...(fallbackSelect?.options || [])].find(item => item.value === value);
  const theme = radio?.value || option?.value || 'sunset';
  root.dataset.theme = theme;
  if (radio) radio.checked = true;
  if (fallbackSelect) fallbackSelect.value = theme;
  if (persist) setSession(themeKey, theme);
}

setTheme(root.dataset.theme || 'sunset', false);

if (themeDialog && typeof themeDialog.showModal === 'function' && themeButton) {
  themeButton.addEventListener('click', () => {
    const selected = themeDialog.querySelector(`input[name="site-theme"][value="${CSS.escape(root.dataset.theme)}"]`);
    if (selected) selected.checked = true;
    themeDialog.showModal();
    selected?.focus();
  });
  themeDialog.addEventListener('change', event => {
    const radio = event.target.closest('input[name="site-theme"]');
    if (radio) setTheme(radio.value);
  });
  themeDialog.querySelector('.dialog-done')?.addEventListener('click', () => themeDialog.close('done'));
  themeDialog.addEventListener('click', event => {
    if (event.target === themeDialog) themeDialog.close('backdrop');
  });
  themeDialog.addEventListener('close', () => themeButton.focus());
}
fallbackSelect?.addEventListener('change', event => setTheme(event.currentTarget.value));

let userPaused = getSession(motionKey) === 'true';
function updateMotionState() {
  const reduced = reducedMotion.matches;
  const hidden = document.hidden;
  root.classList.toggle('motion-paused', userPaused || reduced || hidden);
  if (!motionToggle) return;
  motionToggle.disabled = reduced;
  motionToggle.setAttribute('aria-pressed', String(userPaused));
  const label = motionToggle.querySelector('.motion-label');
  if (reduced) {
    label.textContent = 'Reduced motion';
    motionToggle.setAttribute('aria-label', 'Decorative motion is limited by your device preference');
    motionToggle.title = 'Your device requests reduced motion';
  } else {
    label.textContent = userPaused ? 'Resume motion' : 'Pause motion';
    motionToggle.setAttribute('aria-label', userPaused ? 'Resume decorative motion' : 'Pause decorative motion');
    motionToggle.removeAttribute('title');
  }
}
updateMotionState();
motionToggle?.addEventListener('click', () => {
  if (reducedMotion.matches) return;
  userPaused = !userPaused;
  setSession(motionKey, String(userPaused));
  updateMotionState();
});
reducedMotion.addEventListener?.('change', updateMotionState);
document.addEventListener('visibilitychange', updateMotionState);
