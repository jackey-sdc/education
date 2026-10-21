"""单元课件回归测试模板（Playwright）
做四件事：
  ① 加载课件，捕获 JS 报错与 console.error
  ② 点遍所有按钮 / 拖动所有滑块，确保没有交互崩溃
  ③ 样式自检：自定义属性是否生效、按钮是否有可见背景
  ④ 关键图形几何断言（按需在 ASSERTS 里补）
用法： python3 tests/test_unit.py u1_big_number
"""
import pathlib, sys, math
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
unit = sys.argv[1] if len(sys.argv) > 1 else 'u1_big_number'
HTML = ROOT / unit / 'index.html'

# 几何断言：取路径实际渲染中点，换算极角，验证方向
ASSERTS = {
    # 'u2_angle': [
    #   {'name': '锐角 40° 高亮弧终点', 'js': "..."},
    # ],
}


def main():
    errors, fails = [], []
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 1280, 'height': 950}, device_scale_factor=2)
        pg.on('pageerror', lambda e: errors.append(f'pageerror: {e}'))
        pg.on('console', lambda m: errors.append(f'console.error: {m.text}') if m.type == 'error' else None)
        pg.goto(HTML.as_uri())
        pg.wait_for_timeout(700)

        # ① 样式自检
        style_bad = pg.evaluate("""()=>{
          const out=[];
          if(!getComputedStyle(document.documentElement).getPropertyValue('--accent').trim())
            out.push('--accent 变量未生效');
          document.querySelectorAll('button').forEach(el=>{
            const bg=getComputedStyle(el).backgroundColor;
            if(bg==='rgba(0, 0, 0, 0)' && !el.classList.contains('ghost'))
              out.push('按钮无背景色: '+(el.id||el.textContent.slice(0,12)));
          });
          return out;
        }""")
        for x in style_bad:
            errors.append('style: ' + x)

        # ② 交互巡检
        for i, btn in enumerate(pg.locator('button').all()):
            try:
                btn.scroll_into_view_if_needed(timeout=1500)
                btn.click(timeout=2500)
                pg.wait_for_timeout(80)
            except Exception as e:
                fails.append(f'按钮#{i}: {str(e)[:80]}')
        for i in range(pg.locator('input[type=range]').count()):
            el = pg.locator('input[type=range]').nth(i)
            try:
                mn = float(el.get_attribute('min') or 0); mx = float(el.get_attribute('max') or 100)
                el.fill(str(int((mn + mx) / 2)))
                pg.wait_for_timeout(100)
            except Exception as e:
                fails.append(f'滑块#{i}: {str(e)[:80]}')

        # ③ 答案区条目数（三个档位）
        n = pg.locator('#answerKey .ans-item').count()
        print(f'答案条目：{n}')
        if n < 20:
            fails.append(f'答案条目过少（{n}）')

        # ④ 几何断言（可选）
        for a in ASSERTS.get(unit, []):
            try:
                ok = pg.evaluate(a['js'])
                print(f"{'✅' if ok else '❌'} {a['name']}")
                if not ok:
                    fails.append(a['name'])
            except Exception as e:
                fails.append(f"{a['name']}: {e}")
        b.close()

    for f in fails:
        print('❌', f)
    for e in errors:
        print('❌', e)
    print('\n=== 全部通过 ✅ ===' if not (fails or errors) else '\n=== 存在失败 ===')
    return 1 if (fails or errors) else 0


if __name__ == '__main__':
    sys.exit(main())
