// Discuss on HN panel. Injected into the current page only when you click the
// toolbar icon (or press Alt+Shift+Y); clicking again closes it. It lives in a
// closed shadow root so the page's CSS can't touch it and the page's scripts can't read it.
(() => {
  const ID = "discuss-on-hn";
  const existing = document.getElementById(ID);
  if (existing) { existing.dispatchEvent(new Event("discuss-on-hn:close")); return; }

  const HN = "https://news.ycombinator.com";
  // Custom tag + inline !important so page rules like `div { padding: 30px !important }` can't reach the host
  const host = document.createElement("discuss-on-hn");
  host.id = ID;
  host.style.cssText = "all: initial !important; position: fixed !important; top: 0 !important; right: 0 !important; " +
    "width: 0 !important; height: 0 !important; z-index: 2147483647 !important; display: block !important;";
  const root = host.attachShadow({ mode: "closed" });

  root.innerHTML = `
<style>
  :host { all: initial; }
  * { box-sizing: border-box; }
  .win { position: fixed; top: 12px; right: 12px; z-index: 2147483647; width: 360px; max-height: calc(100vh - 24px);
         display: flex; flex-direction: column;
         background: #f6f6ef; color: #000; border: 1px solid #ff6600; border-radius: 0;
         box-shadow: 3px 3px 0 rgba(0,0,0,.25); font: 13px/1.4 Verdana, Geneva, sans-serif; text-align: left; }
  .bar { background: #ff6600; padding: 3px 4px 3px 6px; display: flex; align-items: center; gap: 6px; }
  .logo { display: block; width: 18px; height: 18px; flex: none; }
  .bar b { font-size: 13px; flex: 1; }
  .who { all: unset; cursor: pointer; font: 11px Verdana, Geneva, sans-serif; color: #000; padding: 0 4px; }
  .who:hover { text-decoration: underline; }
  .x { all: unset; width: 16px; height: 16px; text-align: center; cursor: pointer;
       border: 1px solid #000; background: #f6f6ef; color: #000; font: bold 12px/14px Verdana, sans-serif; }
  .x:hover { background: #fff; }
  .tabs { display: flex; gap: 2px; padding: 4px 6px 0; background: #ff6600; }
  .tab { all: unset; cursor: pointer; font: 11px Verdana, Geneva, sans-serif; padding: 2px 10px; color: #000;
         background: #ffb380; border: 1px solid #000; border-bottom: none; }
  .tab.on { background: #f6f6ef; font-weight: bold; }
  .tab .n { background: #e00000; color: #fff; padding: 0 4px; margin-left: 4px; font-weight: bold; }
  main { padding: 8px 10px 10px; overflow-y: auto; }
  h2 { font-size: 13px; margin: 0 0 4px; font-weight: bold; }
  h3 { font-size: 11px; margin: 10px 0 2px; color: #828282; font-weight: normal; text-transform: uppercase; letter-spacing: .03em; }
  p { margin: 0; }
  a { color: inherit; text-decoration: none; cursor: pointer; }
  a:hover { text-decoration: underline; }
  .muted, .meta { color: #828282; font-weight: normal; }
  .meta { font-size: 11px; margin-top: 1px; }
  .story, .cmt { padding: 5px 0; border-top: 1px solid #e0e0d8; }
  .cmt .txt { font-size: 12px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
  .cmt.new { border-left: 3px solid #ff6600; padding-left: 6px; }
  details { margin-top: 10px; }
  .sep { border-top: 1px dotted #b0b0a8; margin: 12px 0 0; }
  .sep + details { margin-top: 8px; }
  summary { cursor: pointer; font-size: 11px; color: #828282; text-transform: uppercase; letter-spacing: .03em; padding: 2px 0; }
  summary:hover { color: #000; }
  summary:focus-visible { outline: 2px solid #000; outline-offset: 1px; }
  label { display: block; font-size: 11px; color: #828282; margin: 6px 0 2px; }
  input { width: 100%; font: 13px Verdana, Geneva, sans-serif; padding: 4px 6px; border: 1px solid #c8c8c0;
          border-radius: 0; background: #fff; color: #000; margin: 0; }
  #u { font-size: 11px; }
  .count { float: right; }
  .count.over, .err { color: #c00; }
  .warn { font-size: 10px; color: #b35900; margin-top: 3px; }
  label.opt { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #000; margin: 3px 0; cursor: pointer; }
  label.opt input { width: auto; margin: 0; accent-color: #ff6600; }
  .up { color: #ff6600; font-weight: bold; font-size: 11px; }
  .chips { display: flex; gap: 4px; margin-top: 4px; }
  button { font: 13px Verdana, Geneva, sans-serif; padding: 4px 12px; border: 1px solid #ff6600; border-radius: 0;
           cursor: pointer; background: #ff6600; color: #fff; white-space: nowrap; margin: 0; }
  button.plain { background: transparent; color: #000; border-color: #c8c8c0; }
  .chip { font-size: 10px; padding: 1px 6px; background: transparent; color: #828282; border-color: #c8c8c0; }
  .chip.on { background: #ff6600; color: #fff; border-color: #ff6600; }
  .row { display: flex; gap: 8px; align-items: center; margin-top: 10px; }
  .foot { margin-left: auto; font-size: 11px; color: #828282; text-align: right; }
  .hint { color: #828282; font-size: 10px; margin: 8px 0 0; }
  button:focus-visible, a:focus-visible, .x:focus-visible, .tab:focus-visible, .who:focus-visible { outline: 2px solid #000; outline-offset: 1px; }
</style>
<div class="win" role="dialog" aria-label="Discuss on HN">
  <div class="bar"><svg class="logo" viewBox="0 0 128 128" aria-hidden="true"><path d="M18 10H110A12 12 0 0 1 122 22V86A12 12 0 0 1 110 98H58L30 120V98H18A12 12 0 0 1 6 86V22A12 12 0 0 1 18 10Z" fill="#fff"/><path d="M64 28L92 76H36Z" fill="#ff6600"/></svg><b>Discuss on HN</b><button class="who"></button><button class="x" title="Close (Esc)" aria-label="Close">×</button></div>
  <div class="tabs"><button class="tab" data-view="page">This page</button><button class="tab" data-view="you">You</button></div>
  <main></main>
</div>`;

  const $ = (s) => root.querySelector(s);
  const app = $("main");
  const close = () => { host.remove(); document.removeEventListener("keydown", onKey, true); };
  // Esc closes the panel only when you're in it; elsewhere the page keeps its own Esc (lightboxes, menus)
  const onKey = (e) => { if (e.key === "Escape" && e.composedPath().includes(host)) { e.stopPropagation(); close(); } };
  document.addEventListener("keydown", onKey, true);
  host.addEventListener("discuss-on-hn:close", close); // clicking the icon again
  $(".x").addEventListener("click", close);
  // Keep the page's own keyboard shortcuts from firing while typing in the panel
  for (const type of ["keydown", "keypress", "keyup"])
    $(".win").addEventListener(type, (e) => { if (e.key !== "Escape") e.stopPropagation(); });
  document.documentElement.appendChild(host);

  const send = (msg) => chrome.runtime.sendMessage(msg);

  // What happens to the panel when you open a link from it (Settings, via the title-bar button):
  // "close" right away, close after "2" / "3" links, or "stay" until you close it.
  // While it stays, links open in background tabs so the panel remains in view; the link that
  // closes it opens in front.
  // (An array, not an object: object keys "2"/"3" would be listed before the others)
  const CLOSE_MODES = [["close", "Close the panel"], ["2", "Close after 2 links"],
                       ["3", "Close after 3 links"], ["stay", "Keep it open until I close it"]];
  let closeMode = "close", linksOpened = 0; // the saved choice is loaded before the first render (see start)

  // Collapsible sections remember whether you left them open or closed, across sessions.
  // Until you've clicked one, it uses its default (e.g. open when this page isn't on HN yet).
  let sectionsOpen = {};
  const openAttr = (key, byDefault) => ((sectionsOpen[key] ?? byDefault) ? " open" : "");
  // (Listen for the click, not `toggle`: a <details> rendered open fires `toggle` by itself.)
  const rememberSections = () => app.querySelectorAll("details[data-key]").forEach((det) =>
    det.querySelector("summary").addEventListener("click", () => setTimeout(() => {
      sectionsOpen = { ...sectionsOpen, [det.dataset.key]: det.open };
      chrome.storage.local.set({ sectionsOpen });
    })));
  const closesNow = () => closeMode === "close" || (Number(closeMode) > 0 && linksOpened + 1 >= Number(closeMode));
  const afterLink = () => { const done = closesNow(); linksOpened++; if (done) close(); };
  const openHN = (url) => { send({ type: "open", url, active: closesNow() }); afterLink(); };
  const item = (id) => `${HN}/item?id=${encodeURIComponent(id)}`;
  const user = (name) => `${HN}/user?id=${encodeURIComponent(name)}`;
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
  // HN comment HTML -> plain text, parsed inertly (no scripts, no image loads)
  const plain = (html) => new DOMParser().parseFromString(`<p>${(html || "").replace(/<p>/gi, " <p>")}`, "text/html").body.textContent.replace(/\s+/g, " ").trim();
  const ago = (sec) => {
    const s = Date.now() / 1000 - sec;
    for (const [n, unit] of [[31536000, "year"], [2592000, "month"], [86400, "day"], [3600, "hour"], [60, "minute"]])
      if (s >= n) { const v = Math.floor(s / n); return `${v} ${unit}${v > 1 ? "s" : ""} ago`; }
    return "just now";
  };
  const fmt = (n) => Number(n).toLocaleString("en-US");
  const count = (n, word) => `${fmt(n)} ${word}${n === 1 ? "" : "s"}`; // "1 point", "1,992 points"
  // " +12 in 24h" next to your karma; nothing when it hasn't moved
  // The baseline is the sample closest to 24h ago, which can be older if Chrome was closed: say so
  const karmaChange = (c) => !c || !c.delta ? "" :
    ` <span class="${c.delta > 0 ? "up" : "muted"}">${c.delta > 0 ? "+" : "−"}${fmt(Math.abs(c.delta))} in ${
      c.hours >= 23 && c.hours <= 25 ? "24h" : `${Math.max(1, c.hours)}h`}</span>`;

  // Runs after every render: makes [data-href] elements open HN, and sections remember their state
  function wireLinks() {
    rememberSections();
    app.querySelectorAll("[data-href]").forEach((el) => {
      if (el.tagName === "A") el.tabIndex = 0;
      el.addEventListener("click", (e) => { e.preventDefault(); openHN(el.dataset.href); });
      el.addEventListener("keydown", (e) => { if (e.key === "Enter" && el.tagName === "A") openHN(el.dataset.href); });
    });
  }

  // --- account / tabs --------------------------------------------------------

  let account = { username: null, karma: null, unreadCount: 0 };
  let view = null;

  function renderChrome() {
    $(".who").textContent = account.username
      ? `${account.username}${account.karma != null ? ` (${fmt(account.karma)})` : ""}`
      : "settings";
    $(".who").title = "Settings: your HN username, and what happens when you open a link";
    root.querySelectorAll(".tab").forEach((t) => t.classList.toggle("on", t.dataset.view === view));
    $('.tab[data-view="you"]').innerHTML = `You${account.unreadCount ? `<span class="n">${account.unreadCount}</span>` : ""}`;
  }

  function show(v) {
    view = v; renderChrome();
    ({ page: showPage, you: showYou, settings: showSettings })[v]();
  }

  root.querySelectorAll(".tab").forEach((t) => t.addEventListener("click", () => show(t.dataset.view)));
  $(".who").addEventListener("click", () => show("settings"));

  // --- This page ---------------------------------------------------------------

  const meta = (k) => document.querySelector(`meta[property="${k}"],meta[name="${k}"]`)?.content?.trim() || "";
  const canonical = () => {
    const href = document.querySelector('link[rel="canonical"]')?.href || meta("og:url");
    try { return href ? new URL(href, location.href).href : null; } catch { return null; }
  };

  // "How X works | The Verge" -> "How X works"
  function bestTitle() {
    let t = (meta("og:title") || document.title || "").replace(/\s+/g, " ").trim();
    const site = meta("og:site_name");
    const sep = "\\s*[|\\-–—·•:]\\s*";
    if (site) {
      const s = site.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const stripped = t.replace(new RegExp(`${sep}${s}$`, "i"), "").replace(new RegExp(`^${s}${sep}`, "i"), "");
      if (stripped) t = stripped;
    }
    // No site name to go on: drop a short trailing " | Something"
    const parts = t.split(/\s+[|–—·•]\s+/);
    if (parts.length > 1 && parts.at(-1).length <= 30) t = parts.slice(0, -1).join(" | ");
    return t;
  }

  // Nudges based on HN's guidelines (news.ycombinator.com/newsguidelines.html); never blocks posting
  function titleWarnings(t, url) {
    const bare = t.replace(/^(Show|Ask|Tell) HN:\s*/, "");
    const w = [];
    if (/\.pdf($|[?#])/i.test(url) && !/\[pdf\]/i.test(t)) w.push("HN asks you to add [pdf]");
    if (/(^|\.)(youtube\.com|youtu\.be|vimeo\.com)$/.test((() => { try { return new URL(url).hostname; } catch { return ""; } })())
        && !/\[video\]/i.test(t)) w.push("HN asks you to add [video]");
    if ((bare.match(/\b[A-Z]{5,}\b/g) || []).length >= 2) w.push("lots of ALL CAPS");
    if (/!/.test(bare)) w.push("HN usually drops exclamation marks");
    if (/^\d+\s+\w+/.test(bare)) w.push("HN prefers dropping list numbers (\"10 ways…\")");
    if (/you won'?t believe|this one|shocking|mind[- ]?blowing|game[- ]?changer|must[- ]?read|insane/i.test(bare)) w.push("sounds like linkbait");
    return w;
  }

  // Checked once per panel open; switching tabs back reuses it
  let pageCheck = null;
  async function showPage() {
    if (!pageCheck) {
      app.innerHTML = `<p class="muted">Checking HN…</p>`;
      pageCheck = send({ type: "check", canonical: canonical() }).then((r) => r || { state: "error", cleanUrl: location.href });
    }
    const r = await pageCheck;
    if (view !== "page" || !document.getElementById(ID)) return;
    if (r.state === "posted") renderPosted(r);
    else if (r.state === "new") renderSubmit(r, "Not on HN yet");
    else if (r.state === "local") renderSubmit(r, "Local page", "not checked");
    else renderSubmit(r, "Couldn't check HN", "lookup failed");
  }

  const pastPosts = (site) =>
    site ? `<a class="foot" data-href="${HN}/from?site=${encodeURIComponent(site)}">Past posts from ${esc(site)}</a>` : "";

  // `context` is extra (already escaped) HTML for the meta line, used for "on your post …"
  const commentRow = (c, { isNew = false, context = "" } = {}) => `
    <div class="cmt${isNew ? " new" : ""}">
      <a class="txt" data-href="${item(c.id)}">${esc(plain(c.text))}</a>
      <div class="meta"><a data-href="${user(c.by)}">${esc(c.by)}</a> · <a data-href="${item(c.id)}">${ago(c.time)}</a>${context}</div>
    </div>`;

  // One HN story: "Title / 12 points by x · 3 hours ago · 4 comments [/path] [+2 new]"
  const storyRow = (s, { showAuthor = false, showPath = false, newComments = 0 } = {}) => {
    let path = "";
    if (showPath) try { const u = new URL(s.url); path = u.pathname + u.search; } catch {}
    return `
      <div class="story">
        <a data-href="${item(s.id)}">${esc(s.title)}</a>
        <div class="meta">
          <a data-href="${item(s.id)}">${count(s.points, "point")}</a>${showAuthor ? ` by <a data-href="${user(s.author)}">${esc(s.author)}</a>` : ""} ·
          <a data-href="${item(s.id)}">${ago(s.created ?? s.time)}</a> ·
          <a data-href="${item(s.id)}">${s.comments ? count(s.comments, "comment") : "discuss"}</a>${
          path ? ` · <span title="${esc(s.url)}">${esc(path.length > 32 ? path.slice(0, 31) + "…" : path)}</span>` : ""}${
          newComments ? ` <a class="up" data-href="${item(s.id)}">+${newComments} new</a>` : ""}
        </div>
      </div>`;
  };

  function renderPosted({ hits, comments = [], site, fromHost, mentioned }) {
    // Top 3 threads up front; reposts beyond that fold away so the comments stay in view
    const extra = hits.slice(3);
    app.innerHTML = `
      <h2>Already on HN</h2>
      ${hits.slice(0, 3).map((h) => storyRow(h, { showAuthor: true })).join("")}
      ${extra.length ? `<details data-key="more"${openAttr("more", false)}><summary>${extra.length} more submission${extra.length > 1 ? "s" : ""}</summary>${
        extra.map((h) => storyRow(h, { showAuthor: true })).join("")}</details>` : ""}
      ${comments.length ? `<h3>Top comments</h3>${comments.map((c) => commentRow(c)).join("")}` : ""}
      <div class="row"><button data-href="${item(hits[0].id)}" id="go">Discuss on HN</button>${pastPosts(site)}</div>
      ${related(mentionsSection(mentioned, false) + siteSection(fromHost, new Set(hits.map((h) => h.id)), false))}`;
    wireLinks();
    $("#go").focus();
  }

  // Bottom of "This page": other HN posts from this site, most upvoted first (e.g. scour.ing/about
  // when you're on scour.ing). Open when this exact page isn't on HN, folded away when it is.
  // This page's own threads are listed above, so they're left out here.
  const siteSection = (fromHost, ownIds, open) => {
    const stories = (fromHost?.stories || []).filter((s) => !ownIds.has(s.id));
    if (!stories.length) return "";
    return `
      <details data-key="site"${openAttr("site", open)}>
        <summary>Also from ${esc(fromHost.host)} (${stories.length}${fromHost.more ? "+" : ""})</summary>
        ${stories.map((s) => storyRow(s, { showAuthor: true, showPath: true })).join("")}
      </details>`;
  };

  // Dotted line between this page's own HN actions and the related sections below
  const related = (sections) => (sections.trim() ? `<div class="sep"></div>${sections}` : "");

  // Comments anywhere on HN that linked to this page, e.g. as a reference in another thread
  const mentionsSection = (mentioned, open) => {
    if (!mentioned?.comments.length) return "";
    return `
      <details data-key="mentions"${openAttr("mentions", open)}>
        <summary>Mentioned in comments (${mentioned.comments.length}${mentioned.more ? "+" : ""})</summary>
        ${mentioned.comments.map((c) => commentRow(c, { context: c.storyTitle
          ? ` · in <a data-href="${item(c.storyId)}">${esc(c.storyTitle)}</a>` : "" })).join("")}
      </details>`;
  };

  const PREFIXES = ["Show HN: ", "Ask HN: ", "Tell HN: "];

  function renderSubmit({ cleanUrl, site, fromHost, mentioned }, heading, note) {
    app.innerHTML = `
      <h2>${esc(heading)}${note ? ` <span class="muted">· ${esc(note)}</span>` : ""}</h2>
      <label for="t">Title <span class="count" id="n"></span></label>
      <input id="t" value="${esc(bestTitle())}">
      <div class="warn" id="w"></div>
      <div class="chips">${PREFIXES.map((p) => `<button class="chip" data-p="${p}">${p.slice(0, -2)}</button>`).join("")}</div>
      <label for="u">URL</label>
      <input id="u" value="${esc(cleanUrl)}">
      <div class="row"><button id="go">Post to HN</button>${pastPosts(site)}</div>
      <p class="hint">Opens HN's submit form with this filled in. You press submit there. Afterwards, click the icon again on this page to jump to your thread and add the first comment.</p>
      ${related(mentionsSection(mentioned, true) + siteSection(fromHost, new Set(), true))}`;
    const t = $("#t"), u = $("#u"), n = $("#n"), w = $("#w");
    const update = () => {
      n.textContent = `${t.value.length}/80`;
      n.classList.toggle("over", t.value.length > 80);
      w.textContent = titleWarnings(t.value, u.value).join(" · ");
      app.querySelectorAll(".chip").forEach((c) => c.classList.toggle("on", t.value.startsWith(c.dataset.p)));
    };
    app.querySelectorAll(".chip").forEach((c) => c.addEventListener("click", () => {
      const bare = PREFIXES.reduce((s, p) => (s.startsWith(p) ? s.slice(p.length) : s), t.value);
      t.value = t.value.startsWith(c.dataset.p) ? bare : c.dataset.p + bare;
      update(); t.focus();
    }));
    // The submit form always opens in front: that's where you finish posting
    const post = () => { send({ type: "submit", url: u.value.trim(), title: t.value.trim() }); afterLink(); };
    t.addEventListener("input", update); u.addEventListener("input", update); update();
    [t, u].forEach((el) => el.addEventListener("keydown", (e) => { if (e.key === "Enter") post(); }));
    $("#go").addEventListener("click", post);
    wireLinks();
    t.focus(); t.select();
  }

  // --- You ---------------------------------------------------------------------

  async function showYou() {
    if (!account.username) {
      app.innerHTML = `
        <h2>See your karma and replies</h2>
        <p class="meta">Set your HN username and this tab shows your karma, your recent posts and new replies to your posts and comments. The icon lights up when someone replies.</p>
        <div class="row"><button id="set">Set username</button></div>`;
      $("#set").addEventListener("click", () => show("settings"));
      return;
    }
    app.innerHTML = `<p class="muted">Loading ${esc(account.username)}…</p>`;
    const me = await send({ type: "me" });
    if (view !== "you" || !document.getElementById(ID)) return;
    if (!me) { app.innerHTML = `<p class="err">Couldn't reach HN. Try again in a bit.</p>`; return; }

    account.karma = me.karma;
    const replies = me.replies || [];
    const unread = replies.filter((r) => !r.read), earlier = replies.filter((r) => r.read);
    const replyRow = (r) => commentRow(r, { isNew: !r.read, context: ` · on <a data-href="${item(r.parentId)}">${
      r.parentTitle ? esc(r.parentTitle) : `your comment “${esc(plain(r.parentText).slice(0, 40))}…”`}</a>` });
    app.innerHTML = `
      <h2><a data-href="${user(me.username)}">${esc(me.username)}</a> <span class="muted">· ${fmt(me.karma)} karma</span>${karmaChange(me.karmaChange)}</h2>
      <p class="meta${me.stale ? " err" : ""}">${me.stale ? "Offline: last synced" : "Synced"} ${ago(me.checkedAt / 1000)} · checks every 5 minutes</p>
      <h3>New replies${unread.length ? ` (${unread.length})` : ""}</h3>
      ${unread.length ? unread.map(replyRow).join("") : `<p class="meta">No new replies.</p>`}
      ${earlier.length ? `
        <details data-key="earlier"${openAttr("earlier", !unread.length)}>
          <summary>Earlier replies (${earlier.length})</summary>
          ${earlier.map(replyRow).join("")}
        </details>` : ""}
      <h3>Your recent posts</h3>
      ${me.stories.length
        ? me.stories.map((s) => storyRow(s, { newComments: s.newComments })).join("")
        : `<p class="meta">No posts among your recent activity.</p>`}
      <div class="row">
        <button class="plain" data-href="${HN}/threads?id=${encodeURIComponent(me.username)}">All your threads</button>
        <a class="foot" data-href="${HN}/submitted?id=${encodeURIComponent(me.username)}">All submissions</a>
      </div>`;
    wireLinks();
    // Seen now: clear the badge and reset "+N new" for exactly what's on screen
    // (it stays visible until this panel closes; anything arriving meanwhile stays new)
    if (unread.length || me.stories.some((s) => s.newComments)) {
      await send({ type: "markSeen", replyIds: unread.map((r) => r.id),
                   storyCounts: Object.fromEntries(me.stories.map((s) => [s.id, s.comments])) });
      account.unreadCount = 0; renderChrome();
    }
  }

  // --- Settings ------------------------------------------------------------------

  function showSettings() {
    app.innerHTML = `
      <h2>Settings</h2>
      <label for="name">Your HN username (optional: for karma and replies)</label>
      <input id="name" value="${esc(account.username || "")}" placeholder="e.g. JulianPaul" autocomplete="off" spellcheck="false">
      <p class="meta">Case-sensitive on HN: type it with the same capitals as on your profile. If you get the case wrong, it gets corrected for you.</p>
      <div class="err meta" id="e"></div>
      <div class="row"><button id="save">Save</button>${account.username ? `<button class="plain" id="clear">Remove</button>` : ""}</div>
      <p class="hint">Public HN data only, no password. Every 5 minutes the extension asks HN's public API about your last 30 posts and comments to spot new replies. That request contains your username and nothing about what you browse.</p>
      <h3>When I open a link from the panel</h3>
      ${CLOSE_MODES.map(([k, label]) => `
        <label class="opt"><input type="radio" name="close" value="${k}"${k === closeMode ? " checked" : ""}> ${esc(label)}</label>`).join("")}
      <p class="hint">While the panel stays open, links open in background tabs. Esc or × always closes it.</p>`;
    app.querySelectorAll('input[name="close"]').forEach((r) => r.addEventListener("change", () => {
      closeMode = r.value; linksOpened = 0;
      chrome.storage.local.set({ closeMode });
    }));
    const name = $("#name"), e = $("#e");
    const save = async (value) => {
      e.textContent = "Checking…";
      const r = await send({ type: "setUsername", username: value });
      if (!r || !r.ok) { e.textContent = r?.error || "Couldn't reach HN."; return; }
      account = { username: r.username || null, karma: r.karma ?? null, unreadCount: 0 };
      if (r.corrected) {
        e.textContent = `Found you as ${r.username} (HN usernames are case-sensitive).`;
        setTimeout(() => view === "settings" && show("you"), 1500);
      } else show(account.username ? "you" : "page");
    };
    $("#save").addEventListener("click", () => save(name.value));
    name.addEventListener("keydown", (ev) => { if (ev.key === "Enter") save(name.value); });
    $("#clear")?.addEventListener("click", () => save(""));
    name.focus(); name.select();
  }

  // --- start ---------------------------------------------------------------------

  const prefs = chrome.storage.local.get(["closeMode", "sectionsOpen"]);
  Promise.all([send({ type: "account" }), prefs]).then(([a, { closeMode: m, sectionsOpen: s }]) => {
    if (!document.getElementById(ID)) return;
    account = a || account;
    if (CLOSE_MODES.some(([k]) => k === m)) closeMode = m;
    sectionsOpen = s || {};
    // Got replies waiting? Open on them; otherwise on this page
    show(account.unreadCount ? "you" : "page");
  });
})();
