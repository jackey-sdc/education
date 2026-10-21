"""
《角的认识与度量》课件 · 四层自检
=================================
结构 → 内容 → 交互 → 视觉

视觉层的核心：几何断言——取角弧实际渲染路径的中点，换算极角，
验证它落在角的中分线上。弧线画反时肉眼很难发现，断言能立刻抓到。

运行： python3 tests/test_courseware.py
"""
import math, pathlib, re, sys
from playwright.sync_api import sync_playwright

BASE = pathlib.Path(__file__).resolve().parent.parent
HTML = BASE / "index.html"

BUTTONS = ["#btnPlayBasic", "#btnResetBasic", "#btnDialPlay", "#btnAllSteps",
           "#btnStep1", "#btnStep2", "#btnStep3", "#btnClsPlay",
           "#btnSizeLong", "#btnSizeShort", "#btnSizeReset",
           '[data-dial="90"]', '[data-dial="180"]', '[data-dial="270"]', '[data-dial="360"]']
SLIDERS = {"#rngBasic": 147, "#rngDial": 270, "#rngProto": 130, "#rngCls": 300}
SIBLINGS = ["教案.md", "README.md", "preview.png"]
FORBIDDEN = [r"(?:src|href)\s*=\s*['\"]https?://", r"url\(\s*['\"]?https?://"]

ARCS = [
    {"name": "模块1 角弧 147°",   "sel": "#svgAngleBasic",   "match": "#f08a24",
     "center": [170, 250], "expect": 73.5,  "set": {"#rngBasic": 147}},
    {"name": "模块2 扇形 270°",   "sel": "#svgDial",        "match": "rgba(47,111,208",
     "center": [180, 165], "expect": 135,   "set": {"#rngDial": 270}},
    {"name": "模块3 量角器 130°", "sel": "#svgProtractor",  "match": "#f08a24",
     "center": [220, 245], "expect": 115,   "set": {"#rngProto": 130}},
    {"name": "模块4 扇形 300°",   "sel": "#svgClass",       "match": "rgba(31,157,107",
     "center": [190, 165], "expect": 150,   "set": {"#rngCls": 300}},
    {"name": "模块5 ∠A 绿弧",     "sel": "#svgSize",        "match": "#1f9d6b",
     "center": [110, 190], "expect": 22.5,  "set": {}, "index": 0},
    {"name": "练习裸角 40°",      "sel": "#handBlock .q:nth-of-type(1) svg", "match": "#f08a24",
     "center": [60, 170],  "expect": 20,    "set": {}},
    {"name": "练习裸角 115°",     "sel": "#handBlock .q:nth-of-type(4) svg", "match": "#f08a24",
     "center": [250, 170], "expect": 122.5, "set": {}},
]
CONTENT = [
    ("巩固题数 = 16", "()=>[document.querySelectorAll('#basicBlock .q').length,16]"),
    ("量角题数 = 6",  "()=>[document.querySelectorAll('#handBlock .q').length,6]"),
    ("扩展题数 = 15", "()=>[document.querySelectorAll('#extBlock .q').length,15]"),
    ("答案条目 = 37", "()=>[document.querySelectorAll('#answerKey .ans-item').length,37]"),
]


def mid_of(pg, sel, match, index=-1):
    return pg.evaluate("""([sel,match,index])=>{
      const root=document.querySelector(sel); if(!root) return null;
      const paths=[...root.querySelectorAll('path')].filter(p=>{
        const s=(p.getAttribute('stroke')||'')+(p.getAttribute('fill')||'');
        return s.includes(match);});
      if(!paths.length) return null;
      const p=paths[index<0?paths.length+index:index];
      const pt=p.getPointAtLength(p.getTotalLength()/2);
      return [pt.x,pt.y];
    }""", [sel, match, index])


def angle_of(px, py, cx, cy):
    return math.degrees(math.atan2(-(py - cy), px - cx)) % 360


def near(a, b, tol=2.0):
    return abs(((a - b + 180) % 360) - 180) <= tol


def main():
    fails, errors = [], []
    src = HTML.read_text(encoding="utf-8", errors="ignore")

    # ---------- 结构层 ----------
    for f in SIBLINGS:
        if not (BASE / f).exists():
            print(f"❌ 缺少配套文件 {f}"); fails.append(f)
    for pat in FORBIDDEN:
        if re.search(pat, src):
            print(f"❌ 存在外部资源引用 {pat}"); fails.append(pat)
    if not fails:
        print("✅ 结构层：文件齐、无外部引用（离线可用）")

    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={"width": 1280, "height": 950}, device_scale_factor=2)
        pg.on("pageerror", lambda e: errors.append(f"pageerror: {e}"))
        pg.on("console", lambda m: errors.append(f"console.error: {m.text}")
              if m.type == "error" else None)
        pg.goto(HTML.as_uri()); pg.wait_for_timeout(800)

        # ---------- 内容层 ----------
        # 通用断言：每档显示题数 == 标称总题数（防"静默丢题"）
        for bid, shown, total in pg.evaluate('''()=>{
          const out=[];
          const totalIdOf = id => {
            const base = id.replace(/Block$/,'');
            const cands = ['total' + base.charAt(0).toUpperCase() + base.slice(1),
                           id.replace(/Block$/,'Total')];
            for (const c of cands){ const e=document.getElementById(c); if(e) return e; }
            return null;
          };
          document.querySelectorAll('[id$="Block"]').forEach(el=>{
            const t=totalIdOf(el.id);
            if(!t) return;
            out.push([el.id, el.querySelectorAll('.q').length, (t.textContent||'').trim()]);
          });
          return out;
        }'''):
            good = str(shown) == str(total)
            print(f"{'✅' if good else '❌'} 内容层：{bid} 显示 {shown} 题 / 标称 {total} 题")
            if not good: fails.append(f"{bid} 题数不符")

        for name, js in CONTENT:
            got, want = pg.evaluate(js)
            good = got == want
            print(f"{'✅' if good else '❌'} 内容层：{name} → {got}")
            if not good: fails.append(name)

        # ---------- 交互层 ----------
        for sel in BUTTONS:
            try:
                pg.click(sel, timeout=3000); pg.wait_for_timeout(140)
            except Exception as e:
                print(f"❌ 交互层：按钮 {sel} 点击失败 {e}"); fails.append(sel)
        for sel, v in SLIDERS.items():
            try:
                pg.locator(sel).fill(str(v)); pg.wait_for_timeout(200)
            except Exception as e:
                print(f"❌ 交互层：滑块 {sel} 失败 {e}"); fails.append(sel)
        if not any(f in fails for f in BUTTONS + list(SLIDERS)):
            print(f"✅ 交互层：{len(BUTTONS)} 个按钮 + {len(SLIDERS)} 个滑块 全部可用")

        # ---------- 视觉层 ----------
        # 重载页面：交互巡检可能触发了持续动画，会覆盖滑块状态，断言前必须回到确定状态
        pg.reload(); pg.wait_for_timeout(700)
        for t in ARCS:
            for sel, v in (t.get("set") or {}).items():
                pg.locator(sel).fill(str(v)); pg.wait_for_timeout(220)
            m = mid_of(pg, t["sel"], t["match"], t.get("index", -1))
            if m is None:
                print(f"❌ 视觉层：{t['name']} 未找到图元"); fails.append(t["name"]); continue
            cx, cy = t["center"]; a = angle_of(m[0], m[1], cx, cy)
            good = near(a, t["expect"])
            print(f"{'✅' if good else '❌'} 视觉层：{t['name']} 实际 {a:.1f}° / 期望 {t['expect']:.1f}°")
            if not good: fails.append(t["name"])

        # ---------- 打印样式 ----------
        pg.emulate_media(media="print")
        try:
            hidden = not pg.locator("nav").first.is_visible()
            print(f"{'✅' if hidden else '❌'} 打印样式：导航已隐藏")
            if not hidden: fails.append("打印样式")
        except Exception:
            pass
        b.close()

    if errors:
        print("\n❌ JS 报错:")
        for e in errors: print("   ", e)
        fails.append("JS 报错")
    print("\n=== 全部通过 ✅ ===" if not fails else "\n=== 失败: " + ", ".join(fails) + " ===")
    return 0 if not fails else 1


if __name__ == "__main__":
    sys.exit(main())
