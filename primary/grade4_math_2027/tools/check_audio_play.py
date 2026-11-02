#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""验证预录音频真的在课件里播放（不是只看画面推进）。

自检脚本 check_explain.py 点的是「跳拍」，验证的是画面与剧本；
本脚本看的是另一件事：点「开始讲解」后，audio 元素是否真的在走时间、字幕是否跟着音频推进。

用法：python3 tools/check_audio_play.py u6_barchart
退出码：0 通过 / 1 失败
"""
import pathlib
import sys

HERE = pathlib.Path(__file__).parent.parent.resolve()


def main():
    unit = sys.argv[1] if len(sys.argv) > 1 else "u6_barchart"
    idx = HERE / unit / "index.html"
    if not idx.exists():
        raise SystemExit(f"没有 {idx}，先跑 build.py")

    from playwright.sync_api import sync_playwright

    fails = []
    with sync_playwright() as p:
        b = p.chromium.launch(channel="chrome")
        pg = b.new_page(viewport={"width": 1280, "height": 900})
        errs = []
        pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.goto(idx.as_uri())
        pg.wait_for_timeout(600)

        # 1. 音频表是否注入
        n = pg.evaluate("Object.keys(window.NARR_AUDIO||{}).length")
        print(f"  {'✅' if n else '❌'} 音频表注入：{n} 条")
        if not n:
            fails.append("音频表为空")

        # 2. 自动找第一个挂了讲解的小节（不同单元 section id 不同，不能写死）
        S = pg.evaluate("""() => {
          const b = document.querySelector('.narr-btn.narr-play');
          const sec = b && b.closest('section');
          return sec ? '#' + sec.id : '';
        }""")
        if not S:
            print("  ❌ 页面上找不到任何「开始讲解」按钮")
            fails.append("没有挂载讲解")
            b.close()
            print("失败：", "；".join(fails))
            return 1
        print(f"  受测小节：{S}")

        # 3. 点第一拍，看 audio 是否建立并被驱动
        pg.click(f"{S} .narr-btn.narr-play")
        pg.wait_for_timeout(1200)
        st = pg.evaluate("""(S) => {
          const a = document.querySelector('audio') || window.__audioEl;
          const sec = document.querySelector(S);
          const txt = sec && sec.querySelector('.narr-txt');
          return {
            hasAudioTag: !!document.querySelector('audio'),
            srcHead: a ? (a.currentSrc||a.src||'').slice(0,24) : '',
            t: a ? a.currentTime : -1,
            paused: a ? a.paused : null,
            sub: txt ? txt.textContent.trim().slice(0,18) : '',
            beat: (sec.querySelector('.narr-beat.on')||{}).textContent || ''
          };
        }""", S)
        print(f"  当前 audio 时间：{st['t']:.2f}s  暂停={st['paused']}")
        print(f"  字幕：{st['sub']}   当前拍：{st['beat']}")
        if st["t"] <= 0:
            fails.append("audio.currentTime 未推进，音频没真正播放")

        # 4. 等它自然推进到下一拍（音频驱动而非估时）
        dur = pg.evaluate("() => { const a=document.querySelector('audio'); return a && isFinite(a.duration) ? a.duration : 8; }")
        print(f"  第一拍音频时长：{dur:.1f}s，等音频放完看是否自动推进…")
        pg.wait_for_timeout(int(dur * 1000) + 2200)
        st2 = pg.evaluate("""(S) => {
          const sec = document.querySelector(S);
          const a = document.querySelector('audio');
          return { sub: sec.querySelector('.narr-txt').textContent.trim().slice(0,18),
                   beat: (sec.querySelector('.narr-beat.on')||{}).textContent || '',
                   t: a ? a.currentTime : -1 };
        }""", S)
        moved = st2["beat"] != st["beat"]
        print(f"  {'✅' if moved else '❌'} 音频播完自动推进：{st['beat']} → {st2['beat']}（audio t={st2['t']:.1f}s）")
        if not moved:
            fails.append("第一拍音频播完未自动推进到下一拍")

        # 5. 暂停是否真的停住音频
        pg.click(f"{S} .narr-btn.narr-pause")
        pg.wait_for_timeout(300)
        t1 = pg.evaluate("() => (document.querySelector('audio')||{}).currentTime || 0")
        pg.wait_for_timeout(1200)
        t2 = pg.evaluate("() => (document.querySelector('audio')||{}).currentTime || 0")
        ok = abs(t2 - t1) < 0.15
        print(f"  {'✅' if ok else '❌'} 暂停后音频时间：{t1:.2f} → {t2:.2f}")
        if not ok:
            fails.append("暂停没有停住音频")

        # 6. 控件是否按预期隐藏（有音频时语速滑杆与音色下拉应隐藏）
        hid = pg.evaluate("""(S) => {
          const w = document.querySelector(S + ' .narr-rate-wrap');
          const v = document.querySelector(S + ' .narr-vo-sel');
          return { rate: w ? getComputedStyle(w).display : 'none',
                   vo: v ? getComputedStyle(v).display : 'none' };
        }""", S)
        print(f"  语速滑杆 display={hid['rate']}  音色下拉 display={hid['vo']}")

        if errs:
            print("  ❌ 控制台报错：", errs[:3])
            fails.append(f"控制台 {len(errs)} 条报错")
        else:
            print("  ✅ 控制台无报错")
        b.close()

    print()
    if fails:
        print("失败：", "；".join(fails))
        return 1
    print("音频播放链路全部通过 ✅")
    return 0


if __name__ == "__main__":
    sys.exit(main())
