#!/usr/bin/env python3
"""Rebuild index.html from the dated summaries in papers/.
Deterministic — no LLM needed. Styling: assets/style.css; behavior: assets/app.js.
Bilingual archive (English default + Korean toggle). Run after creating a page:
    python3 build_index.py
"""
import os, re, html, glob

ROOT = os.path.dirname(os.path.abspath(__file__))
PAPERS = os.path.join(ROOT, "papers")

def strip(s):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", s))).strip()

def meta(path):
    txt = open(path, encoding="utf-8").read()
    # title: accept both "5분 논문 · X" and "5-min paper · X"
    m = re.search(r"<title>\s*(?:5분 논문|5-min paper)\s*·\s*(.*?)</title>", txt, re.S)
    title = html.unescape(m.group(1).strip()) if m else os.path.basename(path)
    # topic chip: prefer the English (t-en) text inside the topic chip; fall back to raw chip
    t = re.search(r'<span class="chip">\s*<span class="t-en">(.*?)</span>', txt, re.S)
    if not t:
        t = re.search(r'<span class="chip">(.*?)</span>', txt, re.S)
    topic = strip(t.group(1)) if t else ""
    a = re.search(r"arXiv:([0-9.]+)", txt)
    arxiv = a.group(1) if a else ""
    fn = os.path.basename(path)
    d = re.match(r"(\d{4})-(\d{2})-(\d{2})", fn)
    date = f"{d.group(1)}.{d.group(2)}.{d.group(3)}" if d else ""
    return {"file": "papers/" + fn, "title": title, "topic": topic, "arxiv": arxiv, "date": date, "sort": fn}

items = sorted((meta(p) for p in glob.glob(os.path.join(PAPERS, "*.html"))),
               key=lambda x: x["sort"], reverse=True)

cards = "\n".join(
    f'''      <a class="row" href="{html.escape(it['file'])}">
        <div class="d"><span class="dd">{html.escape(it['date'])}</span></div>
        <div class="body">
          <div class="ti">{html.escape(it['title'])}</div>
          <div class="sub">{html.escape(it['topic'])}{(' · arXiv:'+html.escape(it['arxiv'])) if it['arxiv'] else ''}</div>
        </div>
        <div class="go">→</div>
      </a>''' for it in items) or '<p class="empty">No summaries yet.</p>'

doc = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>5-min papers · Archive</title>
<link rel="stylesheet" href="assets/style.css">
</head>
<body>
<div class="langtoggle">
  <button class="langbtn" data-l="en">EN</button>
  <button class="langbtn" data-l="ko">한</button>
</div>
<header class="hero"><div class="wrap">
  <div class="k">⏱ Daily · 5 Min Read</div>
  <h1><span class="t-en">5-min papers <span class="g">Archive</span></span><span class="t-ko">5분 논문 <span class="g">아카이브</span></span></h1>
  <p class="t-en">Auto-generated daily paper summaries · {len(items)} total</p>
  <p class="t-ko">매일 아침 자동 생성되는 논문 요약 모음 · 총 {len(items)}편</p>
  <a class="kgbtn" href="knowledge-graph.html">🕸 <span class="t-en">Interest knowledge graph</span><span class="t-ko">관심 지식그래프</span> →</a>
</div></header>
<div class="wrap">
  <div class="list">
{cards}
  </div>
  <footer><span class="t-en">Local auto-generated · noindex</span><span class="t-ko">로컬 자동 생성 · noindex</span></footer>
</div>
<script src="assets/app.js"></script>
</body>
</html>
"""

open(os.path.join(ROOT, "index.html"), "w", encoding="utf-8").write(doc)
print(f"index.html rebuilt with {len(items)} entrie(s)")
