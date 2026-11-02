// Toolbar icon / Alt+Shift+Y: toggles the Discuss on HN panel inside the page (overlay.js).
// All network calls run here, not in the page, so the site you're on never sees them.
// Two public, keyless, read-only APIs:
//   hn.algolia.com             "is this URL on HN?" (only when you open the panel)
//   hacker-news.firebaseio.com karma, your posts, replies (only if you set a username)
// Submit URL format is HN's official bookmarklet: https://news.ycombinator.com/bookmarklet.html

const HN = "https://news.ycombinator.com";
const FB = "https://hacker-news.firebaseio.com/v0";
const POLL_MINUTES = 5;
const WATCH_ITEMS = 30;        // your most recent posts + comments
const WATCH_DAYS = 14;         // older threads rarely get new replies

const submitUrl = (url, title) =>
  `${HN}/submitlink?u=${encodeURIComponent(url)}&t=${encodeURIComponent(title || "")}`;

const isPublicHttp = (url) => {
  try {
    const u = new URL(url);
    if (!/^https?:$/.test(u.protocol)) return false;
    return !/^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|\[::1\])|\.(local|localhost|test|internal)$/.test(u.hostname);
  } catch { return false; }
};

// Never send these off-device: fragments, tracking junk, and anything that looks like a credential
const SENSITIVE_PARAM = /^(utm_|fbclid$|gclid$|mc_)|token|key|code|auth|session|sig|secret|pass|email|state|ticket|otp/i;

const clean = (url) => {
  let u;
  try { u = new URL(url); } catch { return url; }
  u.hash = "";
  for (const k of [...u.searchParams.keys()]) if (SENSITIVE_PARAM.test(k)) u.searchParams.delete(k);
  return u.toString();
};

// "https://www.Example.com/x" -> "example.com"; null if it isn't a URL
const bareHost = (url) => {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return null; }
};

// http://www.Foo.com/bar/#x  ==  https://foo.com/bar   (null for unparseable URLs, which never match)
const normalize = (url) => {
  let u;
  try { u = new URL(clean(url)); } catch { return null; }
  return (bareHost(u) + u.pathname.replace(/\/+$/, "") + u.search).toLowerCase();
};

// HN's "past posts from this site" uses the registrable domain (blog.cloudflare.com -> cloudflare.com)
const siteOf = (url) => {
  const parts = bareHost(url).split(".");
  const n = parts.length > 2 && parts[parts.length - 2].length <= 3 ? 3 : 2; // co.uk, com.au
  return parts.slice(-n).join(".");
};

const getJSON = async (url) => {
  const res = await fetch(url, { credentials: "omit", referrerPolicy: "no-referrer" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};
const fbItem = (id) => getJSON(`${FB}/item/${id}.json`).catch(() => null);
const alive = (i) => i && !i.deleted && !i.dead;
const num = (n) => Number(n) || 0; // API numbers go into the panel's HTML: never let a string through

// --- "is this page on HN?" ---------------------------------------------------

async function lookup(url) {
  // Search without protocol and "www." ("https://www.paulgraham.com/kids.html" finds nothing,
  // "paulgraham.com/kids.html" finds the 1992-point thread), capped under Algolia's 512-byte limit.
  // The exact comparison below does the real matching.
  const u = new URL(clean(url));
  const query = (bareHost(u) + u.pathname + u.search).slice(0, 400);
  const q = new URLSearchParams({ query, restrictSearchableAttributes: "url", tags: "story", hitsPerPage: "20" });
  const want = normalize(url);
  return (await getJSON(`https://hn.algolia.com/api/v1/search?${q}`)).hits
    .filter((h) => want && h.url && normalize(h.url) === want);
}

// Top comments in HN's own ranking order (Firebase `kids` is ranked; Algolia's tree isn't)
async function topComments(storyId, n = 3) {
  const thread = await fbItem(storyId);
  const kids = await Promise.all((thread?.kids || []).slice(0, n + 2).map(fbItem));
  return kids.filter(alive).slice(0, n).map((c) => ({ id: c.id, by: c.by, text: c.text, time: num(c.time) }));
}

const story = (h) => ({ id: h.objectID, title: h.title, author: h.author, url: h.url, points: num(h.points),
                        comments: num(h.num_comments), created: num(h.created_at_i) });

// Other HN posts from the same host, e.g. scour.ing/about when you're on scour.ing.
// The exact-URL check alone misses these.
async function fromSite(pageUrl) {
  const host = bareHost(pageUrl);
  const q = new URLSearchParams({ query: host, restrictSearchableAttributes: "url", tags: "story",
                                  hitsPerPage: "50", typoTolerance: "false" });
  const sameHost = (u) => { const h = bareHost(u); return h === host || !!h?.endsWith("." + host); };
  const hits = (await getJSON(`https://hn.algolia.com/api/v1/search?${q}`)).hits.filter((h) => sameHost(h.url));
  return { host, stories: hits.sort((a, b) => num(b.points) - num(a.points)).slice(0, 10).map(story), more: hits.length > 10 };
}

// HN comment HTML escapes links ("https:&#x2F;&#x2F;…"); enough decoding to read hrefs back out
const codePoint = (n, raw) => (n <= 0x10ffff ? String.fromCodePoint(n) : raw); // bad entities stay as text
const unescapeHtml = (s) => s
  .replace(/&#x([0-9a-f]+);/gi, (m, h) => codePoint(parseInt(h, 16), m))
  .replace(/&#(\d+);/g, (m, d) => codePoint(Number(d), m))
  .replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

// Comments anywhere on HN that link to this exact page, newest first
async function mentions(urls) {
  const want = new Set(urls.map(normalize).filter(Boolean));
  const u = new URL(urls[0]); // already cleaned: no fragment, tracking or credential params
  const q = new URLSearchParams({ query: (bareHost(u) + u.pathname + u.search).slice(0, 400), tags: "comment",
                                  hitsPerPage: "50", typoTolerance: "false" });
  const links = (html) => [...(html || "").matchAll(/href="([^"]+)"/g)].map((m) => normalize(unescapeHtml(m[1])));
  const hits = (await getJSON(`https://hn.algolia.com/api/v1/search?${q}`)).hits
    .filter((h) => links(h.comment_text).some((l) => want.has(l)))
    .sort((a, b) => num(b.created_at_i) - num(a.created_at_i));
  return {
    comments: hits.slice(0, 5).map((h) => ({ id: h.objectID, by: h.author, text: h.comment_text, time: num(h.created_at_i),
                                             storyId: h.story_id, storyTitle: h.story_title })),
    more: hits.length > 5,
  };
}

// Only trust a canonical URL on the same site that doesn't just point every article at the homepage
const usableCanonical = (pageUrl, canonical) => {
  if (!canonical || !isPublicHttp(canonical) || bareHost(canonical) !== bareHost(pageUrl)) return null;
  const isRoot = (u) => new URL(u).pathname.replace(/\/+$/, "") === "";
  return isRoot(canonical) && !isRoot(pageUrl) ? null : canonical;
};

async function check(pageUrl, pageCanonical) {
  if (!isPublicHttp(pageUrl)) return { state: "local", cleanUrl: clean(pageUrl), site: null };
  const canonical = usableCanonical(pageUrl, pageCanonical);
  const base = { cleanUrl: clean(canonical || pageUrl), site: siteOf(pageUrl) };
  // The page's own canonical URL catches posts of the "clean" address when you're on an AMP / tracking variant
  const urls = [...new Set([pageUrl, canonical].filter(Boolean).map(clean))];
  // Independent lookups run side by side; the extras degrade to null on failure
  const siteP = fromSite(pageUrl).catch(() => null);
  const mentionsP = mentions(urls).catch(() => null);
  try {
    const seen = new Map();
    for (const hits of await Promise.all(urls.map(lookup))) for (const h of hits) seen.set(h.objectID, h);
    const hits = [...seen.values()].sort((a, b) => num(b.points) - num(a.points)).slice(0, 10).map(story);
    // Ask HN's API even when Algolia says 0 comments: its index lags on fresh threads
    const [comments, fromHost, mentioned] = await Promise.all([
      hits.length ? topComments(hits[0].id).catch(() => []) : [],
      siteP,
      mentionsP,
    ]);
    const extras = { fromHost, mentioned };
    return hits.length ? { ...base, ...extras, state: "posted", hits, comments } : { ...base, ...extras, state: "new" };
  } catch {
    return { ...base, state: "error", fromHost: await siteP, mentioned: await mentionsP };
  }
}

// --- your account: karma, recent posts, replies ------------------------------

const store = chrome.storage.local;

const MAX_REPLIES = 100;
const unreadOf = (replies = []) => replies.filter((r) => !r.read);

async function setBadge() {
  const unread = unreadOf((await store.get("replies")).replies);
  await chrome.action.setBadgeBackgroundColor({ color: "#e00000" });
  await chrome.action.setBadgeTextColor?.({ color: "#ffffff" });
  await chrome.action.setBadgeText({ text: unread.length ? String(Math.min(unread.length, 99)) : "" });
  await chrome.action.setTitle({ title: unread.length ? `Discuss on HN: ${unread.length} new repl${unread.length > 1 ? "ies" : "y"}` : "Discuss on HN" });
}

// Everything that reads and rewrites the account keys runs one at a time, so the 5-minute
// alarm, an open "You" tab and a username change can't overwrite each other's results
let queue = Promise.resolve();
function exclusive(fn) {
  const run = queue.then(fn);
  queue = run.catch(() => {});
  return run;
}
const poll = () => exclusive(() => pollOnce(false));

// seed = true: first run after setting a username. Existing replies are loaded as
// already read (for the "Earlier replies" list) and only later ones count as new.
async function pollOnce(seed) {
  const stored = await store.get(["username", "seenKids", "replies", "unread", "storySeen", "karmaLog"]);
  const { username, seenKids = {}, storySeen = {}, karmaLog = [] } = stored;
  if (!username) return null;
  // Versions before 1.6 kept only an `unread` list: carry it over and backfill history once
  const backfill = seed || !Array.isArray(stored.replies);
  const history = stored.replies || (stored.unread || []).map((r) => ({ ...r, read: false }));
  const user = await getJSON(`${FB}/user/${encodeURIComponent(username)}.json`);
  if (!user) return null;

  const cutoff = Date.now() / 1000 - WATCH_DAYS * 86400;
  const ids = (user.submitted || []).slice(0, WATCH_ITEMS);
  const items = (await Promise.all(ids.map(fbItem))).filter(alive);

  const known = new Set(history.map((r) => r.id));
  const watched = items.filter((i) => i.time > cutoff);
  const candidates = [];
  for (const it of watched) {
    const old = new Set(seenKids[it.id] || []);
    for (const k of it.kids || []) {
      const isNew = !seed && !old.has(k);
      if (!known.has(k) && (isNew || backfill)) candidates.push({ kid: k, parent: it, isNew });
    }
  }
  // HN ids grow over time, so the highest ids are the latest replies. Fetch at most 30 per run;
  // new replies past that, or that fail to load, stay unseen and are picked up next run.
  candidates.sort((a, b) => b.kid - a.kid);
  const later = new Set(candidates.slice(30).filter((c) => c.isNew).map((c) => c.kid));
  const found = (await Promise.all(candidates.slice(0, 30).map(async ({ kid, parent, isNew }) => {
    const r = await fbItem(kid);
    if (!r) { if (isNew) later.add(kid); return null; } // network error, not a deleted reply
    if (!alive(r) || r.by === username) return null;
    return { id: r.id, by: r.by, text: r.text, time: num(r.time), parentId: parent.id, read: !isNew,
             parentTitle: parent.title || null, parentText: parent.title ? null : parent.text };
  }))).filter(Boolean);

  // Keep what we knew about items that failed to load this time, or their old replies would look new next time
  const nextSeen = Object.fromEntries(ids.filter((id) => seenKids[id]).map((id) => [id, seenKids[id]]));
  for (const it of watched) nextSeen[it.id] = (it.kids || []).filter((k) => !later.has(k));

  // Comment counts on your posts as of the last time you looked at the You tab (see markSeen)
  const stories = items.filter((i) => i.type === "story").slice(0, 5).map((s) => {
    const comments = num(s.descendants);
    storySeen[s.id] ??= comments; // first sighting: nothing is "new" yet
    return { id: s.id, title: s.title, points: num(s.score), comments, created: num(s.time),
             newComments: Math.max(0, comments - storySeen[s.id]) };
  });

  // Karma samples, at most one an hour, last 48 hours: enough to say "+12 in 24h"
  const now = Date.now(), karma = num(user.karma);
  const log = karmaLog.filter((e) => now - e.t < 48 * 3600e3);
  if (!log.length || now - log.at(-1).t >= 3600e3) log.push({ t: now, k: karma });
  const base = log.filter((e) => now - e.t >= 24 * 3600e3).at(-1) || log[0];

  const me = {
    username: user.id, karma, stories, checkedAt: now,
    karmaChange: { delta: karma - base.k, hours: Math.round((now - base.t) / 3600e3) },
  };
  // Cap the history, but never drop a reply you haven't seen yet
  const all = [...found, ...history].sort((a, b) => b.time - a.time);
  const unreadCount = unreadOf(all).length;
  let readKept = 0;
  const replies = all.filter((r) => !r.read || readKept++ < MAX_REPLIES - unreadCount);
  const keepSeen = Object.fromEntries(stories.map((s) => [s.id, storySeen[s.id]]));
  await store.set({ seenKids: nextSeen, replies, me, storySeen: keepSeen, karmaLog: log });
  await store.remove("unread");
  await setBadge();
  return { ...me, replies };
}

// HN's API is case-sensitive ("julianpaul" isn't found, "JulianPaul" is); HN search isn't,
// so use it to find the right capitalisation
async function findUser(name) {
  const exact = await getJSON(`${FB}/user/${encodeURIComponent(name)}.json`).catch(() => null);
  if (exact) return exact;
  const q = new URLSearchParams({ query: name, restrictSearchableAttributes: "author", hitsPerPage: "20" });
  const hits = (await getJSON(`https://hn.algolia.com/api/v1/search?${q}`).catch(() => ({ hits: [] }))).hits;
  const match = hits.find((h) => h.author?.toLowerCase() === name.toLowerCase())?.author;
  return match ? getJSON(`${FB}/user/${encodeURIComponent(match)}.json`).catch(() => null) : null;
}

async function setUsername(name) {
  name = (name || "").trim();
  const user = name ? await findUser(name) : null;
  if (name && !user) return { ok: false, error: `No HN user called "${name}". Check the spelling.` };
  return exclusive(async () => {
    await store.remove(["username", "seenKids", "replies", "unread", "me", "storySeen", "karmaLog"]);
    if (!user) { await setBadge(); return { ok: true }; }
    await store.set({ username: user.id });
    await pollOnce(true);
    return { ok: true, username: user.id, karma: num(user.karma), corrected: user.id !== name };
  });
}

// You looked at the You tab: the replies you saw become "earlier", and the comment counts
// you saw become the baseline for "+N new". Anything that arrived after rendering stays new.
const markSeen = ({ replyIds = [], storyCounts = {} }) => exclusive(async () => {
  const { replies = [], storySeen = {} } = await store.get(["replies", "storySeen"]);
  const seen = new Set(replyIds);
  await store.set({
    replies: replies.map((r) => (seen.has(r.id) ? { ...r, read: true } : r)),
    storySeen: { ...storySeen, ...storyCounts },
  });
  await setBadge();
});

chrome.alarms.onAlarm.addListener((a) => { if (a.name === "poll") poll().catch(() => {}); });
const ensureAlarm = () => chrome.alarms.create("poll", { periodInMinutes: POLL_MINUTES });
chrome.runtime.onStartup.addListener(() => { ensureAlarm(); setBadge(); });

// --- tabs & messages ---------------------------------------------------------

// active: false opens behind the current tab, so a panel that stays open stays in view
function openTab(url, tab, active = true) {
  chrome.tabs.create({ url, active, index: tab ? tab.index + 1 : undefined, openerTabId: tab ? tab.id : undefined });
}

function openSubmit(url, title, tab) {
  if (!/^https?:/.test(url || "")) return; // chrome://, file://, etc. can't be submitted
  openTab(submitUrl(url, title), tab);
}

const handlers = {
  check: (msg, tab) => check(tab.url, msg.canonical),
  account: async () => {
    const { username, me, replies } = await store.get(["username", "me", "replies"]);
    return { username, karma: me?.username === username ? me.karma : null, unreadCount: unreadOf(replies).length };
  },
  me: async () => {
    // Polled within the last minute (alarm or a previous open): reuse it instead of ~60 requests
    const { username, me, replies = [] } = await store.get(["username", "me", "replies"]);
    if (me?.username === username && Date.now() - me.checkedAt < 60e3) return { ...me, replies };
    const fresh = await poll().catch(() => null);
    if (fresh) return fresh;
    return me ? { ...me, replies, stale: true } : null; // offline: show what we had
  },
  markSeen: (msg) => markSeen(msg),
  setUsername: (msg) => setUsername(msg.username),
  open: (msg, tab) => { if (String(msg.url).startsWith(HN + "/")) openTab(msg.url, tab, msg.active !== false); }, // only HN pages from the panel
  submit: (msg, tab) => openSubmit(String(msg.url), String(msg.title || ""), tab),
};

// Only our own overlay (running in a tab) talks to us
chrome.runtime.onMessage.addListener((msg, sender, reply) => {
  const h = sender.id === chrome.runtime.id && sender.tab && handlers[msg?.type];
  if (!h) return;
  Promise.resolve().then(() => h(msg, sender.tab)).then(reply, () => reply(null));
  return true;
});

async function togglePanel(tab) {
  if (!/^https?:/.test(tab.url || "")) {
    // New tab page etc.: nothing to post, but replies are still worth a click
    const { username, replies } = await store.get(["username", "replies"]);
    const unread = unreadOf(replies);
    if (username && unread.length) {
      await chrome.tabs.update(tab.id, { url: `${HN}/threads?id=${encodeURIComponent(username)}` });
      await markSeen({ replyIds: unread.map((r) => r.id) });
    }
    return;
  }
  try {
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["overlay.js"] });
  } catch {
    // Pages Chrome won't let extensions draw on (Web Store, PDF viewer): go straight to the form
    openSubmit(clean(tab.url), tab.title, tab);
  }
}

chrome.action.onClicked.addListener(togglePanel);

// Right-click menus
chrome.runtime.onInstalled.addListener(() => {
  ensureAlarm();
  setBadge();
  // Updates can leave the old items in place; recreate them so the ids never clash
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({ id: "hn-page", title: "Submit this page to HN", contexts: ["page"] });
    chrome.contextMenus.create({ id: "hn-link", title: "Submit link to HN", contexts: ["link"] });
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "hn-link") {
    // Use selected text as the title if there is any; otherwise HN leaves it blank for you to fill
    openSubmit(clean(info.linkUrl), info.selectionText, tab);
  } else {
    openSubmit(clean(info.pageUrl), tab && tab.title, tab);
  }
});
