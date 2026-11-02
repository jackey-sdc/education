#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""把各单元已合成的讲解语音汇总成一个离线试听页 audition.html（上下册通用）。

用法（在 primary/grade4_math_2026 或 grade4_math_2027 下）：
    python3 tools/make_audition.py

单元列表自动扫描 assets/audio/*/manifest.json，标题取各单元 meta.json。
只读音频与清单，不改任何课件。
"""
import html
import json
import pathlib
import re

HERE = pathlib.Path(__file__).parent.parent.resolve()
OUT = HERE / "audition.html"

# 副标题：一句话说清这一单元"到底在讲什么"，缺失时留空
SUBS = {
    "u1": "分一份怎么记、怎么写、怎么比",
    "u2": "先定顺序，再把数凑整",
    "u3": "围成 → 分类 → 算角 → 画高",
    "u4": "把 1 分小了，怎么记",
    "u5": "对齐，还是末位对齐",
    "u6": "用一个数代表一组数",
    "u7": "把七块连成一张网",
}


def title_of(unit_dir, key):
    m = unit_dir / "meta.json"
    if m.exists():
        try:
            d = json.loads(m.read_text(encoding="utf-8"))
            t = (d.get("title") or "").strip()
            if t:
                return t
        except Exception:
            pass
    return unit_dir.name


def mark(say, emp):
    """把重读片段加粗，保证与音频里降速的位置一一对应"""
    out = html.escape(say)
    for e in emp or []:
        e2 = html.escape(e)
        if e2 and e2 in out:
            out = out.replace(e2, f"<b>{e2}</b>", 1)
    return out


def collect():
    base = HERE / "assets" / "audio"
    out = []
    for d in base.glob("u*"):
        man_p = d / "manifest.json"
        if not man_p.exists():
            continue
        man = json.loads(man_p.read_text(encoding="utf-8"))
        if not man:
            continue
        num = re.match(r"u(\d+)", d.name)
        order = int(num.group(1)) if num else 99
        unit_dir = HERE / d.name
        out.append({
            "key": d.name,
            "order": order,
            "title": title_of(unit_dir, d.name),
            "sub": SUBS.get(d.name.split("_")[0], ""),
            "man": man,
        })
    out.sort(key=lambda x: (x["order"], x["key"]))
    return out


def main():
    units = collect()
    cards, nav = [], []
    grand_n, grand_d = 0, 0.0

    for u in units:
        key, man = u["key"], u["man"]
        secs = {}
        for bid, it in man.items():
            secs.setdefault(it["sec"], []).append((bid, it))
        total = sum(it["dur"] for it in man.values())
        grand_n += len(man)
        grand_d += total
        title = f'{u["order"]:02d}　{u["title"]}'
        nav.append(f'<a href="#{key}">{html.escape(title)}'
                   f'<span>{len(man)} 拍 · {total/60:.1f} 分</span></a>')

        blocks = []
        for sec, items in secs.items():
            rows = []
            for bid, it in items:
                src = f'assets/audio/{key}/{it["file"]}'
                rows.append(
                    f'<div class="row" data-bid="{html.escape(bid)}">'
                    f'<div class="beat">{html.escape(it.get("beat") or "")}</div>'
                    f'<div class="say">{mark(it.get("say", ""), it.get("emp"))}</div>'
                    f'<div class="dur">{it["dur"]:.1f}s</div>'
                    f'<audio controls preload="none" src="{html.escape(src)}"></audio>'
                    f'</div>')
            blocks.append(
                f'<div class="sec">'
                f'<div class="sechd"><span>{html.escape(sec)}</span>'
                f'<button class="play" data-sec>▶ 连播本节</button></div>'
                f'{"".join(rows)}</div>')

        sub = f'<em>{html.escape(u["sub"])}</em>' if u["sub"] else ""
        cards.append(
            f'<section id="{key}" class="card">'
            f'<h2>{html.escape(u["title"])}{sub}</h2>'
            f'<p class="meta">{len(man)} 拍 · 共 {total:.0f} 秒（{total/60:.1f} 分钟）</p>'
            f'{"".join(blocks)}</section>')

    body = "\n".join(cards)
    side = "\n".join(nav)
    OUT.write_text(f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>讲解语音试听 · {html.escape(HERE.parent.name)}</title>
<style>
  :root{{--ink:#182338;--ink2:#4c5a72;--line:#e2e8f2;--bg:#f6f8fc;--acc:#2f6fd0}}
  *{{box-sizing:border-box}}
  body{{margin:0;font:15px/1.7 -apple-system,"PingFang SC","Microsoft YaHei",sans-serif;
       color:var(--ink);background:var(--bg)}}
  .wrap{{display:flex;min-height:100vh}}
  aside{{width:260px;flex:0 0 260px;background:#fff;border-right:1px solid var(--line);
        padding:22px 16px;position:sticky;top:0;height:100vh;overflow:auto}}
  aside h1{{font-size:16px;margin:0 0 4px}}
  aside p{{margin:0 0 16px;font-size:12.5px;color:var(--ink2)}}
  aside a{{display:block;padding:8px 10px;border-radius:9px;color:var(--ink);
          text-decoration:none;font-size:13.5px;font-weight:700;margin-bottom:2px}}
  aside a span{{display:block;font-weight:500;font-size:12px;color:var(--ink2)}}
  aside a:hover{{background:#eef2fa}}
  main{{flex:1;padding:26px 30px 60px;max-width:1000px}}
  .card{{background:#fff;border:1px solid var(--line);border-radius:16px;padding:20px 22px;
        margin-bottom:22px}}
  .card h2{{font-size:19px;margin:0 0 2px}}
  .card h2 em{{font-style:normal;font-weight:600;font-size:13px;color:var(--acc);
              margin-left:10px;padding:2px 8px;border-radius:6px;background:#edf3ff}}
  .meta{{margin:0 0 14px;font-size:12.5px;color:var(--ink2)}}
  .sec{{border-top:1px dashed var(--line);padding-top:10px;margin-top:10px}}
  .sechd{{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px}}
  .sechd span{{font-size:12.5px;font-weight:800;color:#8b9ab2;letter-spacing:.5px}}
  .play{{border:1px solid #cfd9ea;background:#f7f9fd;color:#3b4a63;border-radius:8px;
        padding:4px 12px;font-size:12.5px;font-weight:700;cursor:pointer}}
  .play:hover{{background:#eef3fc;border-color:#a9bcd8}}
  .play.on{{background:var(--acc);border-color:var(--acc);color:#fff}}
  .row{{display:grid;grid-template-columns:66px 1fr 54px 210px;gap:12px;align-items:center;
       padding:7px 6px;border-radius:9px}}
  .row:hover{{background:#f8fafd}}
  .row.playing{{background:#eef4ff}}
  .beat{{font-size:12.5px;font-weight:800;color:var(--acc)}}
  .say{{font-size:14px;color:var(--ink)}}
  .say b{{color:#c2410c;font-weight:800;background:#fff3e6;border-radius:4px;padding:0 2px}}
  .dur{{font-size:12px;color:#93a2b8;text-align:right}}
  audio{{width:210px;height:30px}}
  @media (max-width:820px){{
    .wrap{{flex-direction:column}}
    aside{{width:auto;flex:none;height:auto;position:static}}
    .row{{grid-template-columns:56px 1fr;row-gap:6px}}
    .dur{{text-align:left}} audio{{width:100%;grid-column:1/-1}}
  }}
</style>
</head>
<body>
<div class="wrap">
<aside>
  <h1>讲解语音试听</h1>
  <p>共 {grand_n} 拍 · {grand_d/60:.1f} 分钟<br>
     红字＝重读位置，与音频里降速处一致。</p>
  {side}
</aside>
<main>
{body}
</main>
</div>
<script>
/* 每个 audio 自己那行加个高亮，连播时按顺序放 */
document.querySelectorAll('.sec').forEach(sec => {{
  const auds = [...sec.querySelectorAll('audio')];
  const btn = sec.querySelector('[data-sec]');
  let i = -1;
  const paint = () => sec.querySelectorAll('.row').forEach((r, k) => {{
    r.classList.toggle('playing', k === i);
  }});
  const next = () => {{
    i++;
    if (i >= auds.length) {{ i = -1; paint(); btn.classList.remove('on'); btn.textContent = '▶ 连播本节'; return; }}
    paint();
    auds[i].play().catch(() => next());
  }};
  auds.forEach(a => a.addEventListener('ended', () => {{ if (btn.classList.contains('on')) next(); }}));
  auds.forEach((a, k) => a.addEventListener('play', () => {{
    if (!btn.classList.contains('on')) {{ i = k; paint(); }}
  }}));
  btn.addEventListener('click', () => {{
    if (btn.classList.contains('on')) {{ auds.forEach(a => a.pause()); i = -1; paint();
      btn.classList.remove('on'); btn.textContent = '▶ 连播本节'; return; }}
    auds.forEach(a => a.pause());
    i = -1; btn.classList.add('on'); btn.textContent = '■ 停止';
    next();
  }});
}});
</script>
</body>
</html>
""", encoding="utf-8")
    print(f"✅ audition.html（{len(cards)} 个单元，{grand_n} 拍，{grand_d/60:.1f} 分钟）")


if __name__ == "__main__":
    main()
