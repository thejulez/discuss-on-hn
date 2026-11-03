/**
 * Discuss on HN: landing page behaviour.
 *
 * One job: point every "Add to Chrome" at the Chrome Web Store listing once it's
 * published, and at the GitHub install instructions until then.
 */
(function () {
  'use strict';

  var CONFIG = {
    /** The store item's id. Assigned when the draft was created and never changes. */
    extensionId: 'fbidofcpfgnmlfgfgakookemmgihbhjn',

    /**
     * Whether the listing is live (Unlisted or Public). Set to false to fall back to GitHub:
     * an "Add to Chrome" that opens a 404 is worse than one that opens GitHub.
     */
    published: true
  };

  var store = 'https://chromewebstore.google.com/detail/discuss-on-hn/' + CONFIG.extensionId;
  var github = 'https://github.com/thejulez/discuss-on-hn#install';

  document.querySelectorAll('[data-install]').forEach(function (a) {
    a.href = CONFIG.published ? store : github;
    if (CONFIG.published) a.rel = 'noopener';
  });
  // Links that only make sense once the listing exists (e.g. "Chrome Web Store" in the footer)
  document.querySelectorAll('[data-store-only]').forEach(function (a) { a.hidden = !CONFIG.published; });

  // Deep links to a FAQ answer (discusshn.com/#data) open it
  function openTarget() {
    var el = location.hash && document.getElementById(location.hash.slice(1));
    if (el && el.tagName === 'DETAILS') el.open = true;
  }
  window.addEventListener('hashchange', openTarget);
  openTarget();

  if (!CONFIG.published) {
    document.querySelectorAll('[data-install-label]').forEach(function (s) { s.textContent = 'Install from GitHub'; });
    document.querySelectorAll('[data-install-note]').forEach(function (p) { p.hidden = false; });
  }
})();
