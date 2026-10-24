"""
课件四层自检脚本（结构 / 内容 / 交互 / 视觉）
=============================================
用法：
  1) 改下面 CONFIG（最少只需改 html 路径与按钮列表）
  2) pip install playwright && playwright install chromium
  3) python3 visual_test.py

设计要点：
  · 视觉层用「几何断言」——量实际渲染路径的坐标算角度，而不是靠肉眼看。
    弧线画反、比例画错这类问题肉眼极难发现，断言能立刻抓到。
  · 交互层点遍所有控件并捕获 pageerror/console.error。
  · 结构层扫描外部资源引用，保证课件离线可用。
  · 断言只能验证"自洽"（列与列、图与图），验不了"是否符合教材约定"——
    竖式部分积写法、量角器内外圈、统计图 1 格代表几 这类约定，
    必须对照教材人工核一次，并把约定写进课件顶部的口径说明。

退出码：0 = 全部通过，1 = 有失败项。
"""
import math, pathlib, re, sys
from playwright.sync_api import sync_playwright

# ========================== 配置区 ==========================
CONFIG = {
    "html": "index.html",
    "out_dir": "shots",
    "siblings": ["教案.md", "README.md"],      # 应与课件同目录存在的文件
    "buttons": [],                             # 需要巡检的按钮
    "sliders": {},                             # {选择器: 目标值}
    # 结构层：课件内不得有外部资源加载（注意：SVG 命名空间 URI 不是网络请求，需排除）
    "forbidden_patterns": [
        r"(?:src|href)\s*=\s*['\"]https?://",
        r"@import\s+(?:url\()?\s*['\"]?https?://",
        r"url\(\s*['\"]?https?://",
    ],
    # 视觉层几何断言：先把控件设到确定状态，再量弧线/图元中点
    "arc_asserts": [
        {"name": "对比图角度弧 90°", "sel": "#svgCompare", "match": "#f08a24",
         "center": [470, 210], "expect": 45, "set": {"#rngCmp": 90}},
    ],
    # 内容层：题目与答案的一致性
    "content_asserts": [
        # 通用写法：答案条目数 == 各档题目数之和（多档时把选择区都列上）
        {"name": "答案条目数 = 各档题数之和",
         "js": "()=>{const q=document.querySelectorAll('#basicBlock .q,#extBlock .q').length;"
               " return [document.querySelectorAll('#answerKey .ans-item').length, q];}"},
        # 分步演示"不剧透"：第 0 步页面上不得出现最终结果的数字
        # （把 SEL 换成竖式/推导图的容器，NUMS 换成答案里出现过的数字）
        {"name": "逐步演示第 0 步不泄露结果",
         "js": "()=>{const SEL='#svgDemo', NUMS=['1740','1450'];"
               " const el=document.querySelector(SEL); if(!el) return [0,0];"
               " const t=el.textContent.replace(/\\s/g,'');"
               " return [NUMS.filter(n=>t.includes(n)).length, 0];}"},
        # 数位对齐：各部分积之和 == 结果行（竖式专用）
        # 把 readRows() 换成读你课件竖式各行数字的函数
        {"name": "竖式：各部分积之和 = 结果",
         "js": "()=>{const parts=[290,1450], res=1740;"
               " return [parts.reduce((a,b)=>a+b,0), res];}"},
    ],
}
# ============================================================


def mid_of(pg, sel, match, index=-1):
    """取 svg 中匹配 stroke/fill 的 path 的实际渲染中点"""
    return pg.evaluate("""([sel,match,index])=>{
      const root=document.querySelector(sel);
      if(!root) return null;
      const paths=[...root.querySelectorAll('path')].filter(p=>{
        const s=(p.getAttribute('stroke')||'')+(p.getAttribute('fill')||'');
        return s.includes(match);
      });
      if(!paths.length) return null;
      const p=paths[index<0?paths.length+index:index];
      const pt=p.getPointAtLength(p.getTotalLength()/2);
      return [pt.x, pt.y];
    }""", [sel, match, index])


def angle_of(px, py, cx, cy):
    """屏幕坐标 → 数学极角（逆时针为正）"""
    return math.degrees(math.atan2(-(py - cy), px - cx)) % 360


def near(a, b, tol=2.0):
    return abs(((a - b + 180) % 360) - 180) <= tol


def main():
    base = pathlib.Path(__file__).resolve().parent
    html = base / CONFIG["html"]
    if not html.exists():
        html = base.parent / CONFIG["html"]
    if not html.exists():
        print(f"❌ 找不到课件文件 {html}")
        return 1
    out = base / CONFIG["out_dir"]; out.mkdir(exist_ok=True)
    fails, errors = [], []

    # ---------- 结构层 ----------
    src = html.read_text(encoding="utf-8", errors="ignore")
    for f in CONFIG["siblings"]:
        if not (html.parent / f).exists():
            print(f"❌ 缺少配套文件：{f}"); fails.append(f)
    for pat in CONFIG["forbidden_patterns"]:
        hits = re.findall(pat, src)
        if hits:
            print(f"❌ 课件内出现外部资源加载 {pat} × {len(hits)}（必须离线可用）")
            fails.append(f"外部引用 {pat}")
    if not fails:
        print("✅ 结构层：文件齐、无外部引用")

    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={"width": 1280, "height": 950}, device_scale_factor=2)
        pg.on("pageerror", lambda e: errors.append(f"pageerror: {e}"))
        pg.on("console", lambda m: errors.append(f"console.error: {m.text}")
              if m.type == "error" else None)
        pg.goto(html.as_uri()); pg.wait_for_timeout(800)

        # ---------- 内容层 ----------
        # 通用断言：每档练习"显示题数"必须等于"标称总题数"。
        # 这条能抓住"后挂载的填空题覆盖了先挂载的选择题"这类静默丢题（页面看着完全正常）。
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
            print(f"{'✅' if good else '❌'} 内容层：{bid} 显示题数 {shown} == 标称 {total}")
            if not good:
                fails.append(f"{bid} 题数不符")

        for t in CONFIG["content_asserts"]:
            a, bval = pg.evaluate(t["js"])
            good = a == bval
            print(f"{'✅' if good else '❌'} 内容层：{t['name']} → {a} vs {bval}")
            if not good: fails.append(t["name"])

        # ---------- 交互层 ----------
        for sel in CONFIG["buttons"]:
            try:
                pg.click(sel, timeout=3000); pg.wait_for_timeout(150)
                print(f"✅ 交互层：按钮 {sel} 可点击")
            except Exception as e:
                print(f"❌ 交互层：按钮 {sel} 点击失败 {e}"); fails.append(sel)
        for sel, val in CONFIG["sliders"].items():
            try:
                pg.locator(sel).fill(str(val)); pg.wait_for_timeout(220)
                print(f"✅ 交互层：滑块 {sel} = {val} 生效")
            except Exception as e:
                print(f"❌ 交互层：滑块 {sel} 失败 {e}"); fails.append(sel)

        # ---------- 视觉层：几何断言 ----------
        # 重载页面：交互巡检可能触发了持续动画（会覆盖滑块状态），断言前必须回到确定状态
        pg.reload(); pg.wait_for_timeout(700)
        for t in CONFIG["arc_asserts"]:
            for sel, val in (t.get("set") or {}).items():
                pg.locator(sel).fill(str(val)); pg.wait_for_timeout(220)
            m = mid_of(pg, t["sel"], t["match"])
            if m is None:
                print(f"❌ 视觉层：{t['name']} 未找到图元"); fails.append(t["name"]); continue
            cx, cy = t["center"]; a = angle_of(m[0], m[1], cx, cy)
            good = near(a, t["expect"])
            print(f"{'✅' if good else '❌'} 视觉层：{t['name']} 实际 {a:.1f}° / 期望 {t['expect']:.1f}°")
            if not good: fails.append(t["name"])

        # ---------- 截图（人工复核排版） ----------
        for sec in pg.locator("section[id]").all():
            sid = sec.get_attribute("id")
            try:
                sec.scroll_into_view_if_needed(); pg.wait_for_timeout(200)
                sec.screenshot(path=str(out / f"{sid}.png"))
            except Exception:
                pass
        print(f"📸 截图已输出到 {out}")

        # ---------- 打印样式 ----------
        pg.emulate_media(media="print")
        try:
            nav_hidden = not pg.locator("nav").first.is_visible()
            print(f"{'✅' if nav_hidden else '❌'} 打印样式：导航栏已隐藏")
            if not nav_hidden: fails.append("打印样式")
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
