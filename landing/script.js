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
     * Whether the listing is live (Unlisted or Public). Flip to true once review passes:
     * an "Add to Chrome" that opens a 404 is worse than one that opens GitHub.
     */
    published: false
  };

  var store = 'https://chromewebstore.google.com/detail/' + CONFIG.extensionId;
  var github = 'https://github.com/thejulez/discuss-on-hn#install';

  document.querySelectorAll('[data-install]').forEach(function (a) {
    a.href = CONFIG.published ? store : github;
    if (CONFIG.published) a.rel = 'noopener';
  });
  if (!CONFIG.published) {
    document.querySelectorAll('[data-install-label]').forEach(function (s) { s.textContent = 'Install from GitHub'; });
    document.querySelectorAll('[data-install-note]').forEach(function (p) { p.hidden = false; });
  }
})();
