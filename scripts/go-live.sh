#!/bin/sh
# Switch discusshn.com from "Install from GitHub" to the Chrome Web Store listing.
# Run once the store review has passed. Refuses if the listing isn't reachable yet,
# because an "Add to Chrome" that opens an empty store page is worse than GitHub.
set -e
cd "$(dirname "$0")/.."
id=$(sed -n "s/.*extensionId: '\([a-z]*\)'.*/\1/p" landing/script.js)
url="https://chromewebstore.google.com/detail/discuss-on-hn/$id"

if ! curl -sL "$url" | grep -q "Discuss on HN"; then
  echo "The listing at $url isn't live yet (no 'Discuss on HN' on the page). Nothing changed."
  exit 1
fi
if grep -q "published: true" landing/script.js; then
  echo "Already live."; exit 0
fi

sed -i '' 's/published: false/published: true/' landing/script.js
git add landing/script.js
git commit -q -m "Site: link Add to Chrome to the Chrome Web Store listing"
git push -q origin main
echo "Pushed. discusshn.com now sends every 'Add to Chrome' to $url (Vercel deploys in a few seconds)."
