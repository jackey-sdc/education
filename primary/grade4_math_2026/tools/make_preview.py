#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""生成讲解音频试听页：逐条试听 + 六拍盲听。

用法：
    python3 tools/make_preview.py u6_barchart

产出：audio_demo/<短名>_preview.html（引用 ../assets/audio/<短名>/*.m4a）
"""
import html
import json
import pathlib
import random
import re
import sys

HERE = pathlib.Path(__file__).parent.parent.resolve()


def main():
    unit = sys.argv[1]
    m = re.match(r"(u\d+)", unit)
    sn = m.group(1) if m else unit
    adir = HERE / "assets" / "audio" / sn
    man_path = adir / "manifest.json"
    if not man_path.exists():
        raise SystemExit(f"没有 {man_path}，先跑 tools/tts_build.py {unit}")

    man = json.loads(man_path.read_text(encoding="utf-8"))
    beats = list(man.items())

    # 盲听样本：先每个小节抽 1 条保证分散，不足 6 条再从剩余里补齐
    by_sec = {}
    for k, v in beats:
        by_sec.setdefault(v["sec"], []).append((k, v))
    blind = [random.choice(sec) for sec in by_sec.values()]
    chosen = {k for k, _ in blind}
    rest = [(k, v) for k, v in beats if k not in chosen]
    random.shuffle(rest)
    blind += rest[:max(0, 6 - len(blind))]
    random.shuffle(blind)
    blind = blind[:6]

    def mark(say, emp):
        out = html.escape(say)
        for e in emp or []:
            out = out.replace(html.escape(e), f'<mark>{html.escape(e)}</mark>')
        return out

    cards, blind_cards = [], []
    for i, (key, v) in enumerate(beats, 1):
        rel = f"../assets/audio/{sn}/{v['file']}"
        cards.append(f"""
    <div class="card" data-src="{rel}">
      <div class="meta"><b>{i:02d}</b><span class="beat">{html.escape(v['beat'])}</span>
        <span class="dur">{v['dur']:.1f}s</span>
        <button class="mini">▶</button></div>
      <p class="say">{mark(v['say'], v['emp'])}</p>
    </div>""")

    for n, (key, v) in enumerate(blind, 1):
        rel = f"../assets/audio/{sn}/{v['file']}"
        blind_cards.append(f"""
    <div class="card blind" data-src="{rel}">
      <div class="meta"><b>{n}</b><button class="mini">▶</button>
        <button class="reveal">揭晓</button></div>
        <p class="say hidden">{mark(v['say'], v['emp'])}</p>
        <p class="ans">{html.escape(v['beat'])}</p>
    </div>""")

    total = sum(v["dur"] for _, v in beats)
    page = f"""<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="UTF-8">
<title>{sn} 讲解音频试听</title>
<style>
  :root{{--ink:#1a1c1f;--ink2:#5b6169;--line:#e3e6ea;--bg:#f6f7f9;--hi:#fff3c4;--acc:#2563eb}}
  *{{box-sizing:border-box}}
  body{{margin:0;padding:28px 20px 60px;background:var(--bg);color:var(--ink);
    font:15px/1.7 -apple-system,"PingFang SC","Microsoft YaHei",sans-serif}}
  .wrap{{max-width:820px;margin:0 auto}}
  h1{{font-size:21px;margin:0 0 4px}}
  .sub{{color:var(--ink2);font-size:13px;margin-bottom:22px}}
  h2{{font-size:15px;margin:30px 0 12px;color:var(--ink2);font-weight:600;
    border-bottom:1px solid var(--line);padding-bottom:8px}}
  .card{{background:#fff;border:1px solid var(--line);border-radius:10px;padding:12px 14px;margin-bottom:10px}}
  .card.on{{border-color:var(--acc);box-shadow:0 0 0 3px rgba(37,99,235,.1)}}
  .meta{{display:flex;align-items:center;gap:10px;font-size:13px;color:var(--ink2)}}
  .meta b{{color:var(--ink);font-variant-numeric:tabular-nums}}
  .beat{{background:var(--bg);border-radius:4px;padding:1px 7px}}
  .dur{{margin-left:auto;font-variant-numeric:tabular-nums}}
  .mini{{border:1px solid var(--line);background:#fff;border-radius:6px;
    width:30px;height:26px;cursor:pointer;font-size:12px}}
  .mini:hover{{border-color:var(--acc);color:var(--acc)}}
  .say{{margin:8px 0 0;font-size:14px;line-height:1.8}}
  .say mark{{background:var(--hi);padding:0 2px;border-radius:3px}}
  .hidden{{display:none}}
  .reveal{{font-size:12px;border:1px dashed var(--line);background:#fff;border-radius:6px;
    padding:2px 8px;cursor:pointer;color:var(--ink2)}}
  .ans{{display:none;margin:6px 0 0;font-size:12px;color:var(--acc)}}
  .blind.open .ans{{display:block}}
  .blind.open .say{{display:block}}
  .bar{{display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap}}
  .btn{{border:1px solid var(--line);background:#fff;border-radius:8px;padding:7px 14px;
    cursor:pointer;font-size:13px}}
  .btn:hover{{border-color:var(--acc);color:var(--acc)}}
  .note{{background:#fff;border-left:3px solid var(--acc);padding:10px 14px;border-radius:0 8px 8px 0;
    font-size:13px;color:var(--ink2);margin-bottom:22px}}
</style></head><body><div class="wrap">
<h1>{sn} 讲解音频试听</h1>
<p class="sub">{len(beats)} 拍 / {total:.0f} 秒 / 晓晓 · 口语＋留白＋数字重读（<mark>黄色</mark>为重读片段）</p>
<div class="note">先听「盲听区」——不看文字、不看拍名，只判断一句：<b>像不像老师在讲</b>。
这 6 条是随机抽的，听完再点「揭晓」看是哪一拍。</div>

<div class="bar">
  <button class="btn" id="playAll">▶ 连续播放全部</button>
  <button class="btn" id="stopAll">⏹ 停止</button>
</div>

<h2>盲听区（6 条，顺序已打乱）</h2>
{''.join(blind_cards)}

<h2>逐条试听（六拍骨架）</h2>
{''.join(cards)}

<audio id="player" preload="none"></audio>
<script>
const player = document.getElementById('player');
let cur = null, queue = [], qi = 0;

function playCard(card){{
  document.querySelectorAll('.card.on').forEach(c=>c.classList.remove('on'));
  card.classList.add('on');
  player.src = card.dataset.src;
  player.play();
  cur = card;
}}
document.querySelectorAll('.card').forEach(card=>{{
  card.querySelector('.mini').addEventListener('click', ()=>{{
    queue = []; playCard(card);
  }});
  const rv = card.querySelector('.reveal');
  if(rv) rv.addEventListener('click', ()=>{{ card.classList.toggle('open'); }});
}});
document.getElementById('playAll').addEventListener('click', ()=>{{
  queue = [...document.querySelectorAll('.card:not(.blind)')];
  qi = 0;
  if(queue.length) playCard(queue[0]);
}});
document.getElementById('stopAll').addEventListener('click', ()=>{{
  queue = []; player.pause(); player.removeAttribute('src');
  document.querySelectorAll('.card.on').forEach(c=>c.classList.remove('on'));
}});
player.addEventListener('ended', ()=>{{
  if(queue.length && qi < queue.length - 1){{ qi++; playCard(queue[qi]); }}
}});
</script>
</div></body></html>"""

    out = HERE / "audio_demo" / f"{sn}_preview.html"
    out.parent.mkdir(parents=True, exist_ok=True)   # 新项目里 audio_demo 可能还不存在
    out.write_text(page, encoding="utf-8")
    print(f"✅ {out.relative_to(HERE)}（{len(beats)} 条，盲听 {len(blind)} 条）")


if __name__ == "__main__":
    main()
