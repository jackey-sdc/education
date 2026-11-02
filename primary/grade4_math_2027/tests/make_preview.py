"""为每个单元生成 preview.png（首屏预览）与 preview_full.png（整页长图）。"""
import pathlib, sys
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
units = sys.argv[1:] or [p.parent.name for p in sorted(ROOT.glob('u*/meta.json'))]

with sync_playwright() as p:
    b = p.chromium.launch()
    for u in units:
        d = ROOT / u
        # 首屏：2 倍图，看得清细节
        pg = b.new_page(viewport={'width': 1280, 'height': 900}, device_scale_factor=2)
        pg.goto((d / 'index.html').as_uri())
        pg.wait_for_timeout(700)
        pg.screenshot(path=str(d / 'preview.png'))
        pg.close()
        # 整页：1 倍图，控制体积
        pg = b.new_page(viewport={'width': 1280, 'height': 900}, device_scale_factor=1)
        pg.goto((d / 'index.html').as_uri())
        pg.wait_for_timeout(700)
        pg.screenshot(path=str(d / 'preview_full.png'), full_page=True)
        pg.close()
        print(f'✅ {u}/preview.png')
    b.close()
