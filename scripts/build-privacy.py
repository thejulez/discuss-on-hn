#!/usr/bin/env python3
"""Regenerate landing/privacy.html's body from PRIVACY.md (the single source of the policy)."""
import html, pathlib, re

root = pathlib.Path(__file__).resolve().parent.parent
md = (root / "PRIVACY.md").read_text()
page_path = root / "landing" / "privacy.html"

def inline(s):
    s = html.escape(s, quote=False)
    s = re.sub(r"`([^`]+)`", r"<code>\1</code>", s)
    s = re.sub(r"\*\*([^*]+)\*\*", r"<b>\1</b>", s)
    s = re.sub(r"(?<![\w/])_([^_]+)_(?!\w)", r"<i>\1</i>", s)
    s = re.sub(r"(https://[^\s<)]+[^\s<).,])", r'<a href="\1">\1</a>', s)
    return re.sub(r"\b([\w.+-]+@[\w-]+\.[a-z]+)\b", r'<a href="mailto:\1">\1</a>', s)

out, in_list = [], False
for line in md.splitlines():
    if line.startswith("- "):
        if not in_list:
            out.append("<ul>"); in_list = True
        out.append(f"<li>{inline(line[2:])}</li>"); continue
    if in_list:
        out.append("</ul>"); in_list = False
    for prefix, tag in (("### ", "h3"), ("## ", "h2"), ("# ", "h1")):
        if line.startswith(prefix):
            out.append(f"<{tag}>{inline(line[len(prefix):])}</{tag}>"); break
    else:
        if line.strip():
            out.append(f"<p>{inline(line)}</p>")
if in_list:
    out.append("</ul>")

page = page_path.read_text()
start = page.index("<!-- Generated from PRIVACY.md")
end = page.index("</main>")
page_path.write_text(page[:start] + "<!-- Generated from PRIVACY.md by scripts/build-privacy.py; edit that file and rerun -->\n" + "\n".join(out) + "\n" + page[end:])
print(f"wrote {page_path.relative_to(root)}")
