"""把每个 section 截图拼成一张联系表（contact sheet），供人工一次性过目。
依赖：pip install pillow（可选，缺失时只输出单张截图）
"""
import pathlib, sys
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'tests' / 'contact'
OUT.mkdir(exist_ok=True, parents=True)
units = sys.argv[1:] or [p.parent.name for p in sorted(ROOT.glob('u*/meta.json'))]

try:
    from PIL import Image
except ImportError:
    Image = None

with sync_playwright() as p:
    b = p.chromium.launch()
    for u in units:
        d = ROOT / u
        shots = []
        pg = b.new_page(viewport={'width': 1280, 'height': 950}, device_scale_factor=1)
        pg.goto((d / 'index.html').as_uri())
        pg.wait_for_timeout(600)
        # 让每个模块进入"有内容"的状态（点一遍主控按钮）
        for sel in ['#btnUnitDemo', '#btnReadAll', '#btnCmp', '#btnOralStep', '#btnZeroStep',
                    '#btnPmStep', '#btnDpAll', '#btnCalcReset', '#btnPriceStep', '#btnLawReset',
                    '#btnEstReset', '#btnPvReset', '#btnDistReset', '#btnParaReset',
                    '#btnDbAll', '#btnClStep', '#btnRdStep', '#btnRvStep', '#btnCkStep', '#btnTrAll']:
            el = pg.query_selector(sel)
            if el:
                try:
                    el.click(timeout=2000); pg.wait_for_timeout(60)
                except Exception:
                    pass
        for sec in pg.locator('section[id]').all():
            sid = sec.get_attribute('id')
            f = OUT / f'{u}_{sid}.png'
            try:
                sec.scroll_into_view_if_needed(); pg.wait_for_timeout(120)
                sec.screenshot(path=str(f))
                shots.append(f)
            except Exception:
                pass
        pg.close()
        if Image and shots:
            ims = [Image.open(f).convert('RGB') for f in shots]
            scale = 460 / max(i.width for i in ims)
            thumbs = [i.resize((int(i.width*scale), int(i.height*scale))) for i in ims]
            cols = 3
            rows = (len(thumbs) + cols - 1) // cols
            rowh = [max(t.height for t in thumbs[r*cols:(r+1)*cols]) for r in range(rows)]
            W = cols * (460 + 12) + 12
            H = sum(rowh) + rows * 12 + 12
            sheet = Image.new('RGB', (W, H), '#ffffff')
            y = 12
            for r in range(rows):
                x = 12
                for t in thumbs[r*cols:(r+1)*cols]:
                    sheet.paste(t, (x, y)); x += 460 + 12
                y += rowh[r] + 12
            sheet.save(OUT / f'{u}_sheet.png')
            print(f'✅ {u}_sheet.png  （{len(shots)} 个 section）')
        else:
            print(f'✅ {u}: {len(shots)} 张 section 截图已生成（未装 pillow，联系表跳过）')
    b.close()
