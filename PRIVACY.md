# Privacy Policy

_Last updated: 2 November 2026_

This policy covers the Discuss on HN Chrome extension and the website discusshn.com. Discuss on HN is an unofficial tool by Julian Paul and is not affiliated with Y Combinator or Hacker News.

**In short:**
- **The extension does no tracking and has no analytics.** It talks only to Hacker News' public APIs, and only to look up the page you ask about or your own public HN activity.
- **The website, discusshn.com, uses cookieless analytics** to count visits. That's described separately below and has nothing to do with the extension.

## The extension

### What it sends

The extension has no servers of its own. It sends requests only to Hacker News' two public APIs: the official HN API (`hacker-news.firebaseio.com`) and HN Search (`hn.algolia.com`).

**When you open the panel** (toolbar icon or Alt+Shift+Y) on a page, it sends:
- to HN Search: the page's address, and the page's canonical address if it declares one on the same site, to find HN threads for the page and comments that link to it; and the page's hostname, to find other HN posts from the same site;
- to the official HN API: the IDs of the HN thread it found and of its top comments, to load them.

Before an address is sent, its `#fragment`, tracking parameters (`utm_*`, `fbclid`, `gclid`, `mc_*`) and parameters whose names suggest credentials (containing `token`, `key`, `code`, `auth`, `session`, `sig`, `secret`, `pass`, `email`, `state`, `ticket` or `otp`) are removed.

**If you set your HN username**, it sends your username to the official HN API when you save it (and to HN Search if needed to correct its capitalisation), and every 5 minutes, and when you open the "You" tab, to fetch your public profile, your 30 most recent posts and comments, and the replies to them. These requests contain your username and HN item IDs, and nothing about the pages you visit.

Nothing is sent while you browse without opening the panel. On the page you open it on, the extension reads only the address, the title and a few meta tags (canonical address, `og:url`, `og:title`, `og:site_name`), and never the page's content. The title is used only to fill in the "Post to HN" form. The right-click "Submit link to HN" item uses the link's address and any text you've selected, only to fill in that same form. The extension doesn't send cookies, and never posts, votes or comments: "Post to HN" opens Hacker News' own submit form, and you press submit.

### What it stores

Only on your device, in Chrome's extension storage: your HN username, if you set one; your karma and recent posts as last fetched; replies to your posts and comments, and which you've seen; comment counts and karma readings used for "+N new" and "+12 in 24h"; and your panel settings. Removing your username in the panel deletes the account data; uninstalling the extension deletes everything.

### Permissions

`activeTab` and `scripting` let it read the current tab's address and title and show the panel, only in the tab where you open it. `contextMenus` adds the right-click "Submit to HN" items. `storage` keeps the data above. `alarms` runs the 5-minute reply check, only if you set a username. It has no access to other sites.

## The website (discusshn.com)

This section is about the website only; the extension sends nothing to it or to its analytics.

The website uses Umami, a privacy-focused analytics tool we host ourselves at analytics.neuklick.com, to count visits. It records the page address, page title, referrer, screen size and browser language. It sets no cookies. As with any website, your IP address and browser are visible to the server when the page loads. If your browser sends Do Not Track, no analytics are recorded.

The website collects nothing else, and the extension contains no analytics.

## Sharing

Data is never sold or shared, and is used only for the features described here.

## Contact

julian@discusshn.com, or https://github.com/thejulez/discuss-on-hn/issues.
