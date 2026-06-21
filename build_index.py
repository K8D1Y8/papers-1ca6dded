#!/usr/bin/env python3
"""Rebuild index.html from the dated summaries in papers/.
Deterministic — no LLM needed. Styling: assets/style.css; behavior: assets/app.js.
Bilingual archive (English default + Korean toggle) with an "All / ⭐ Must Read" tab
and a "Full Review" link for papers that have one (reviews/<arxivId>.html).
Run after creating a page:  python3 build_index.py
"""
import os, re, html, glob

ROOT = os.path.dirname(os.path.abspath(__file__))
PAPERS = os.path.join(ROOT, "papers")
REVIEWS = os.path.join(ROOT, "reviews")

def strip(s):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", s))).strip()

def meta(path):
    txt = open(path, encoding="utf-8").read()
    m = re.search(r"<title>\s*(?:5분 논문|5-min paper)\s*·\s*(.*?)</title>", txt, re.S)
    title = html.unescape(m.group(1).strip()) if m else os.path.basename(path)
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

def card(it):
    hasfull = bool(it["arxiv"]) and os.path.exists(os.path.join(REVIEWS, it["arxiv"] + ".html"))
    full = ('\n      <a class="full" href="reviews/' + html.escape(it["arxiv"]) +
            '.html"><span class="t-en">Full Review</span><span class="t-ko">풀 리뷰</span></a>') if hasfull else ""
    sub = html.escape(it["topic"]) + ((" · arXiv:" + html.escape(it["arxiv"])) if it["arxiv"] else "")
    return ('    <div class="rowwrap" data-arxiv="' + html.escape(it["arxiv"]) + '"' + (' data-full="1"' if hasfull else '') + '>\n'
            '      <a class="row" href="' + html.escape(it["file"]) + '">\n'
            '        <div class="d"><span class="dd">' + html.escape(it["date"]) + '</span></div>\n'
            '        <div class="body">\n'
            '          <div class="ti">' + html.escape(it["title"]) + '</div>\n'
            '          <div class="sub">' + sub + '</div>\n'
            '        </div>\n'
            '        <div class="go">→</div>\n'
            '      </a>' + full + '\n'
            '    </div>')

cards = "\n".join(card(it) for it in items) or '<p class="empty">No summaries yet.</p>'

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
  <div class="tabs">
    <button class="tab on" data-mode="all"><span class="t-en">All</span><span class="t-ko">전체</span></button>
    <button class="tab" data-mode="mustread"><span class="t-en">Must Read</span><span class="t-ko">머스트리드</span></button>
  </div>
  <p class="mr-empty" style="display:none"><span class="t-en">No Must-read papers yet — rate a paper <b>Must read</b>, or add its arXiv ID to mustread.md.</span><span class="t-ko">아직 머스트리드가 없어요 — 논문을 <b>꼭 다시 읽기</b>로 평가하거나 mustread.md에 arXiv ID를 추가하면 모입니다.</span></p>
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
