#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""单元课件构建器：把 assets/ 的共享样式与引擎 + 各单元的 body/app 合成
单个零依赖、可离线双击打开的 index.html。"""
import json, pathlib, sys

ROOT = pathlib.Path(__file__).resolve().parent
CSS  = (ROOT / 'assets/style.css').read_text(encoding='utf-8')
ENG  = (ROOT / 'assets/engine.js').read_text(encoding='utf-8')

HEAD = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<style>
{css}
</style>
</head>
<body>
<header>
  <h1>{title}</h1>
  <p>{subtitle}</p>
  <div class="badges">{badges}</div>
</header>
<nav><div class="inner">{nav}</div></nav>
<main>
"""

FOOT = """
</main>
<footer style="max-width:1080px;margin:0 auto;padding:0 16px 40px;color:var(--ink2);font-size:14px;
  display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;border-top:1px solid var(--line);padding-top:16px">
  <div>{footleft}</div>
  <div class="hstack">{prev}{next}</div>
</footer>
<script>
{engine}
</script>
<script>
(function(){{
{app}
}})();
</script>
</body>
</html>
"""

TIER = """
  <div class="card">
    <div class="card-title-row">
      <h3><span class="tag">{tag}</span>{title}</h3>
      <span class="note">{desc}</span>
    </div>
    <div class="score">已答对 <b id="score{Key}">0</b> / <span id="total{Key}">0</span> 题
      <button class="ghost" id="btnReset{Key}">重做本档</button></div>
    <div id="{key}Block"></div>
  </div>
"""

ANSWERS = """
<section id="answers">
  <details class="answers">
    <summary>📖 答案与解析（讲评时展开 / 可直接打印）</summary>
    <div id="answerKey"></div>
  </details>
</section>
"""


def build(unit_dir: pathlib.Path):
    meta = json.loads((unit_dir / 'meta.json').read_text(encoding='utf-8'))
    body = (unit_dir / 'body.html').read_text(encoding='utf-8')
    app  = (unit_dir / 'app.js').read_text(encoding='utf-8')
    accents = ':root{\n' + '\n'.join(f'    {k}:{v};' for k, v in meta['accent'].items()) + '\n}\n'
    nav = '\n'.join(f'    <a href="{href}">{text}</a>' for href, text in meta['nav'])
    badges = '\n    '.join(f'<span>{b}</span>' for b in meta.get('badges', []))
    tiers = ''
    for t in meta['tiers']:
        tiers += TIER.format(tag=t['tag'], title=t['title'], desc=t['desc'],
                              Key=t['key'].capitalize(), key=t['key'])
    body = body.replace('<!--QUIZ-->', tiers + '<!--ANSWERS-->')
    body = body.replace('<!--ANSWERS-->', ANSWERS)
    prev = f'<a class="chip" href="{meta["prev"]}">← 上一单元</a>' if meta.get('prev') else ''
    next_ = f'<a class="chip" href="{meta["next"]}">下一单元 →</a>' if meta.get('next') else ''
    html = (HEAD.format(title=meta['title'], subtitle=meta['subtitle'], badges=badges,
                        nav=nav, css=accents + '\n' + CSS)
            + body
            + FOOT.format(engine=ENG, app=app,
                          footleft=meta.get('foot', '人教版（2024年审定）四年级数学上册 · 动画课件'),
                          prev=prev, next=next_))
    out = unit_dir / 'index.html'
    out.write_text(html, encoding='utf-8')
    return out, len(html.splitlines())


if __name__ == '__main__':
    units = sys.argv[1:] or [p.parent.name for p in sorted(ROOT.glob('u*/meta.json'))]
    for u in units:
        out, n = build(ROOT / u)
        print(f'✅ {out.relative_to(ROOT)}  ({n} 行)')
