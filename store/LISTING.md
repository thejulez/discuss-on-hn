# Chrome Web Store submission: copy-paste sheet

Everything the developer dashboard asks for, in the order it asks. Blocks marked **(paste)** go in as written.

## The story in one line

> You found something interesting. Discuss on HN gets you into the Hacker News conversation about it: chime into the thread that exists, start it if it doesn't, never double-post, and never miss a reply.

Every asset and every paragraph below follows the same arc:

| Step | What the user feels | Shown in |
|---|---|---|
| 1. Find | "This is interesting. Is anyone talking about it?" | Screenshot 1 |
| 2. Chime in | "They are, and here's where. I'll join." | Screenshot 1 |
| 3. Connect | "There's a whole wider conversation around this." | Screenshot 2 |
| 4. Start | "Nobody's posted it. I'll start it, properly." | Screenshot 3 |
| 5. Stay | "Someone replied. I'm part of this now." | Screenshot 4 |
| 6. Own pace | "It fits how I browse." | Screenshot 5 |

---

## Before you start

- [ ] Developer account at https://chrome.google.com/webstore/devconsole: one-time $5, and verify the contact email under **Account**.
- [ ] Under **Account**, answer the EU trader question: **Non-trader** (free, open-source, no commercial activity). If you ever charge for it or use it to promote a business, switch to trader and add the required contact details.
- [ ] Repository public at https://github.com/thejulez/discuss-on-hn (the privacy and support links point there).
- [ ] `./scripts/package.sh` run, giving `dist/discuss-on-hn-<version>.zip`.

---

## 1. Package

**Items → New item** → upload `dist/discuss-on-hn-<version>.zip`.

---

## 2. Store listing

### Title (from the manifest)
Discuss on HN

### Summary (from the manifest, 124 of 132 characters)
Join the Hacker News conversation about any page: chime in, start it if it's missing, never double-post, never miss a reply.

### Description **(paste)**

```
Found something interesting on the web? Discuss on HN gets you into the Hacker News conversation about it.

Click the icon (or press Alt+Shift+Y) on any page and a small, HN-style panel opens in the corner.

━━ CHIME IN WHERE THE CONVERSATION ALREADY IS
• Every Hacker News thread for the page you're on, with points, comments and age
• The top comments in HN's own ranking, so you know where the discussion stands before you join
• One click to "Discuss on HN" and you're in the thread

━━ NEVER DOUBLE-POST
• Before you post, it checks whether the page is already on HN, including tracking-link and AMP variants of the address
• If it is, it sends you to the existing thread instead

━━ SEE THE WHOLE CONVERSATION
• Comments anywhere on HN that linked to this page
• The best-received posts from the same site

━━ START IT IF IT'S MISSING
• "Post to HN" opens Hacker News' own submit form with the address and a clean title filled in
• Site names like "| The Verge" are trimmed, and gentle nudges follow HN's guidelines: drop the "!" and the list number, add [pdf] or [video]
• You press submit yourself. The extension never posts, votes or comments for you

━━ STAY IN THE CONVERSATION
A browser tab is gone the moment you close it. The icon stays in your toolbar. Set your HN username (optional) and:
• The icon lights up with a count when someone replies to your posts or comments
• The "You" tab shows new replies, earlier ones, and "+N new" comments on your recent posts
• See your karma and how it moved in the last day

━━ AT YOUR PACE
• Keep the panel open while threads open in background tabs, or have it close after one, two or three links
• Sections remember whether you left them open

━━ PRIVATE BY DESIGN
• No AI, no servers, no accounts, no analytics
• No host permissions: it can't read any site on its own
• Talks only to Hacker News' public APIs, only when you open the panel (plus a reply check every 5 minutes if you set a username)
• Tracking parameters and anything that looks like a token are stripped from addresses before they're looked up

Unofficial and open source (MIT): https://github.com/thejulez/discuss-on-hn
Not affiliated with Y Combinator or Hacker News.
```

### Category
Social Networking (under Lifestyle). If not listed: Communication (under Productivity)

### Language
English

### Graphic assets

| Field | File | Story beat |
|---|---|---|
| Store icon (128×128) | `icons/128.png` | |
| Screenshot 1 | `store/assets/screenshot-1-this-page.png` | Found something interesting? Chime in. |
| Screenshot 2 | `store/assets/screenshot-2-related.png` | See the whole conversation |
| Screenshot 3 | `store/assets/screenshot-3-post.png` | Not on HN yet? Start it. |
| Screenshot 4 | `store/assets/screenshot-4-replies.png` | Stay in the conversation |
| Screenshot 5 | `store/assets/screenshot-5-settings.png` | Jump in at your pace |
| Small promo tile (440×280) | `store/assets/promo-small-440x280.png` | Join the Hacker News conversation about any page |
| Marquee promo tile (1400×560, optional) | `store/assets/promo-marquee-1400x560.png` | Found it on the web? Talk about it on HN. |

All screenshots are 1280×800 PNG; upload them in this order.

### Additional fields

| Field | Value |
|---|---|
| Official URL | None (needs a verified domain) |
| Homepage URL | https://github.com/thejulez/discuss-on-hn |
| Support URL | https://github.com/thejulez/discuss-on-hn/issues |
| Mature content | No |

---

## 3. Privacy practices

### Single purpose description **(paste)**

```
Help the user take part in the Hacker News conversation about the page they're viewing: show its Hacker News threads, top comments and related discussions, open Hacker News' own submit form prefilled when it hasn't been posted, and show replies to the user's own Hacker News posts and comments.
```

### Permission justifications **(paste each into its box)**

**activeTab**
```
Read the current tab's address and title, and draw the panel in that tab, only after the user clicks the toolbar icon or presses the keyboard shortcut. Nothing is read from tabs the user hasn't clicked on.
```

**scripting**
```
Inject the extension's own panel script (overlay.js, packaged with the extension) into the active tab when the user clicks the icon. No remote code and no access to other tabs.
```

**contextMenus**
```
Adds "Submit this page to HN" and "Submit link to HN" to the right-click menu, which open Hacker News' own submit form prefilled.
```

**storage**
```
Stores the user's optional Hacker News username, which replies they've already seen, and their panel preferences, locally on the device.
```

**alarms**
```
Checks the official Hacker News API every 5 minutes for new replies to the user's own posts and comments, only if the user has set their username, so the icon can show a new-reply count.
```

### Are you using remote code?
**No, I am not using remote code.**

### What user data do you plan to collect?

Check only:
- [x] **Web history**

Leave unchecked: personally identifiable information, health information, financial and payment information, authentication information, personal communications, location, user activity, website content.

Why this is correct: the address of the page the user is viewing is sent to the Hacker News Search API when they open the panel. The optional HN username is a public handle sent only to HN's own API, and no page content is ever read or sent.

### Certifications (check all three)
- [x] I do not sell or transfer user data to third parties, outside of the approved use cases
- [x] I do not use or transfer user data for purposes that are unrelated to my item's single purpose
- [x] I do not use or transfer user data to determine creditworthiness or for lending purposes

### Privacy policy URL **(paste)**
```
https://github.com/thejulez/discuss-on-hn/blob/main/PRIVACY.md
```

---

## 4. Distribution

| Field | Value |
|---|---|
| Payments | Free of charge |
| Visibility | **Unlisted** for a few days of testing with friends, then **Public** |
| Regions | All regions |

---

## 5. Test instructions (optional, helps review) **(paste)**

```
No account or login needed.
1. Open https://paulgraham.com/kids.html and click the toolbar icon: the panel shows its Hacker News threads, top comments, comments that linked to it and other posts from paulgraham.com.
2. Open any page that isn't on Hacker News (for example a new blog post) and click the icon: the panel offers "Post to HN", which only opens Hacker News' own submit form prefilled. Nothing is submitted automatically.
3. Optional: click "settings" in the panel's title bar, enter the public HN username "pg", then open the "You" tab to see karma, recent posts and replies.
```

---

## Likely review questions, answered

| If the reviewer asks | Answer |
|---|---|
| Why `scripting` and `activeTab` but no host permissions? | The panel is injected only into the tab the user clicked, using the access `activeTab` grants for that click. |
| Does it post or vote automatically? | No. It opens Hacker News' own form; the user presses submit. |
| Why does it contact hn.algolia.com? | It's Hacker News' official search, used to find threads for the page. |
| Is it affiliated with Hacker News? | No. It says "Unofficial" in the description; the name describes what it's for. |

---

## For every update
1. Bump `version` in `manifest.json`.
2. `./scripts/package.sh`
3. Upload the new zip under **Package**, then **Submit for review**.
