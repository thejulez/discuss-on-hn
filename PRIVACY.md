# Discuss on HN: Privacy Policy

_Last updated: 2 November 2026_

Discuss on HN is an unofficial Hacker News companion for Chrome. It is not affiliated with Y Combinator or Hacker News. It has no servers, no accounts and no analytics: everything below happens in your browser, and the only places it talks to are Hacker News' two public, read-only APIs.

## What it sends, and when

### Only when you open the panel (toolbar icon or Alt+Shift+Y)

Before anything is sent, the page address is cleaned: the `#fragment`, tracking parameters (`utm_*`, `fbclid`, `gclid`, `mc_*`) and any parameter that looks like a credential (names containing `token`, `key`, `code`, `auth`, `session`, `sig`, `secret`, `pass`, `email`, `state`, `ticket`, `otp`) are removed.

To the **HN Search API** (`hn.algolia.com`, run by Algolia for Hacker News):
- the cleaned page address without `https://` or `www.` (and the page's canonical address, if it declares one on the same site), to find HN threads for this page and HN comments that link to it;
- the page's hostname (e.g. `scour.ing`), to list other HN posts from the same site.

To the **official HN API** (`hacker-news.firebaseio.com`):
- the ID of the HN thread for this page, to load its top comments.

### Only if you set your HN username

- When you save it, your username is looked up on the official HN API. If that exact capitalisation isn't found, the HN Search API is asked for the correctly capitalised name.
- Every 5 minutes, and when you open the "You" tab, the official HN API is asked for your public profile and your 30 most recent posts and comments, to show your karma and spot new replies. These requests contain your public username and nothing about the pages you visit.

### Never

Nothing is sent while you browse normally. The extension never sends cookies, page content, your HN password or your HN session. It never posts, votes or comments for you: "Post to HN" opens Hacker News' own submit form with the title and address filled in, and you press submit there yourself.

## What it stores

On your device only, in Chrome's extension storage (`chrome.storage.local`):

- your HN username, if you set one;
- the IDs of replies already seen and your latest 100 replies (for the "Earlier replies" list);
- comment counts on your recent posts as of when you last looked (for "+N new");
- karma readings from the last 48 hours (for "+12 in 24h");
- your karma and recent posts as last fetched;
- your panel preferences: how it closes after you open a link, and which sections you left open or closed.

Removing your username in the panel deletes everything tied to your account (your panel preferences stay). Uninstalling the extension deletes all of it.

## What it doesn't do

- No analytics, tracking, advertising or fingerprinting.
- No servers of its own, and no third parties besides the two HN APIs above.
- Data is never sold, transferred or used for anything other than the features described here, and never used to determine creditworthiness or for lending.

## Permissions

| Permission | Used for |
|---|---|
| `activeTab` | Reading the current tab's address and title, and drawing the panel in it, only after you click the icon or press the shortcut. |
| `scripting` | Drawing the panel in that tab. |
| `contextMenus` | The "Submit this page / link to HN" right-click items. |
| `storage` | Remembering the items listed under "What it stores". |
| `alarms` | Checking for new replies every 5 minutes, only when a username is set. |

The extension has no host permissions and can't read or change any site on its own.

## Contact

Questions or concerns: email julian@discusshn.com, or open an issue at https://github.com/thejulez/discuss-on-hn/issues.
