"""通用冒烟测试：加载课件 → 点遍所有按钮/滑块 → 捕获 JS 报错 → 截图。"""
import pathlib, sys, json
from playwright.sync_api import sync_playwright

unit = sys.argv[1]
base = pathlib.Path(__file__).resolve().parent.parent
html = base / unit / 'index.html'
out = base / unit / 'shots'
out.mkdir(exist_ok=True, parents=True)
errors, failed = [], []

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 1280, 'height': 1000}, device_scale_factor=2)
    pg.on('pageerror', lambda e: errors.append(f'pageerror: {e}'))
    pg.on('console', lambda m: errors.append(f'console.{m.type}: {m.text}') if m.type == 'error' else None)
    pg.goto(html.as_uri())
    pg.wait_for_timeout(700)

    # 点遍所有按钮
    btns = pg.locator('button').all()
    for i, btn in enumerate(btns):
        try:
            btn.scroll_into_view_if_needed(timeout=1500)
            btn.click(timeout=2500)
            pg.wait_for_timeout(90)
        except Exception as e:
            failed.append(f'按钮#{i}: {str(e)[:90]}')
    # 拖动所有滑块
    for i in range(pg.locator('input[type=range]').count()):
        try:
            el = pg.locator('input[type=range]').nth(i)
            mn = float(el.get_attribute('min') or 0); mx = float(el.get_attribute('max') or 100)
            el.fill(str(int((mn + mx) / 2)))
            pg.wait_for_timeout(120)
        except Exception as e:
            failed.append(f'滑块#{i}: {str(e)[:90]}')
    # 填空题：尝试填入答案并检查
    # 样式自检：主按钮必须有可见背景色（自定义属性是否生效）
    style_bad = pg.evaluate("""()=>{
      const out=[];
      const rs=getComputedStyle(document.documentElement);
      if(!rs.getPropertyValue('--accent').trim()) out.push('--accent 变量未生效');
      document.querySelectorAll('button').forEach(el=>{
        const bg=getComputedStyle(el).backgroundColor;
        if(bg==='rgba(0, 0, 0, 0)' && !el.classList.contains('ghost')) out.push('按钮无背景色: '+el.id+'/'+el.textContent.slice(0,12));
      });
      return out;
    }""")
    for x in style_bad: errors.append('style: ' + x)
    pg.wait_for_timeout(200)
    pg.screenshot(path=str(out / '_full.png'), full_page=True)
    for sec in pg.locator('section[id]').all():
        sid = sec.get_attribute('id')
        try:
            sec.scroll_into_view_if_needed()
            pg.wait_for_timeout(150)
            sec.screenshot(path=str(out / f'{sid}.png'))
        except Exception:
            pass
    b.close()

print('== 按钮/滑块失败 ==')
for f in failed: print('  ❌', f)
print('== JS 报错 ==')
for e in errors: print('  ❌', e)
if not failed and not errors:
    print('✅ 无 JS 报错，所有控件可交互')
sys.exit(1 if (failed or errors) else 0)
