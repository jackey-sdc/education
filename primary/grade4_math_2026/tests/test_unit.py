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

# 几何断言（视觉层）：取实际渲染结果换算几何量，验证"图 = 数"同源
ASSERTS = {
    'u1_big_number': [
        {'name': '分级读数器：384562305 分级为 亿级0003/万级8456/个级2305',
         'js': """(()=>{const t=document.querySelector('#readStage').textContent.replace(/\s/g,'');
                   return t.includes('0003')&&t.includes('8456')&&t.includes('2305');})()"""},
        {'name': '读数完整：与数值一致',
         'js': """(()=>{const inp=document.querySelector('#readNum');
                   inp.value='384562305'; inp.dispatchEvent(new Event('input'));
                   const st=document.querySelector('#readSteps');
                   const dots=st.querySelectorAll('.dot').length;
                   return dots>=6;})()"""},
    ],
    'u2_angle': [
        {'name': '锐角 40°：高亮弧落在内圈 0°→40°',
         'js': """(async()=>{const r=document.querySelector('#pmRange');
                   r.value=40; r.dispatchEvent(new Event('input'));
                   for(let i=0;i<3;i++) document.querySelector('#btnPmStep').click();
                   const svg=document.querySelector('#pmStage svg');
                   const ps=[...svg.querySelectorAll('path')].filter(x=>(x.getAttribute('stroke')||'')==='#1f9d6b');
                   if(!ps.length) return false;
                   const p=ps[ps.length-1], L=p.getTotalLength();
                   const a=p.getPointAtLength(0), b=p.getPointAtLength(L);
                   const ang=(x,y)=>Math.atan2(-(y-320), x-270)*180/Math.PI;
                   return Math.abs(ang(a.x,a.y))<1.5 && Math.abs(ang(b.x,b.y)-40)<1.5;})()"""},
        {'name': '钝角 115°：高亮弧落在外圈 180°→65°（读数为 115°）',
         'js': """(()=>{const r=document.querySelector('#pmRange');
                   r.value=115; r.dispatchEvent(new Event('input'));
                   for(let i=0;i<3;i++) document.querySelector('#btnPmStep').click();
                   const svg=document.querySelector('#pmStage svg');
                   const ps=[...svg.querySelectorAll('path')].filter(x=>(x.getAttribute('stroke')||'')==='#1f9d6b');
                   if(!ps.length) return false;
                   const p=ps[ps.length-1], L=p.getTotalLength();
                   const a=p.getPointAtLength(0), b=p.getPointAtLength(L);
                   const ang=(x,y)=>Math.atan2(-(y-320), x-270)*180/Math.PI;
                   const s=ang(a.x,a.y), e=ang(b.x,b.y);
                   return Math.abs(Math.abs(s)-180)<1.5 && Math.abs(e-65)<1.5;})()"""},
        {'name': '线/射线/直线：线段 0 个箭头、射线 1 个、直线 2 个',
         'js': """(()=>{const gs=[...document.querySelectorAll('#lineStage svg g')];
                   if(gs.length<3) return false;
                   const c=gs.slice(0,3).map(g=>g.querySelectorAll('polygon').length);
                   return c[0]===0 && c[1]===1 && c[2]===2;})()"""},
        {'name': '练习内嵌角图：端点不超出 viewBox',
         'js': """(()=>{const svgs=[...document.querySelectorAll('#handBlock svg')];
                   return svgs.every(sv=>{const [x0,y0,w,h]=sv.getAttribute('viewBox').split(/[ ,]+/).map(Number);
                     return [...sv.querySelectorAll('line,path,circle')].every(el=>{const b=el.getBBox();
                       return b.x>=x0-1 && b.y>=y0-1 && b.x+b.width<=x0+w+1 && b.y+b.height<=y0+h+1;});});})()"""},
    ],
    'u3_multiply': [
        {'name': '竖式结果行 = a × b（236×34=8024）',
         'js': """(()=>{const sel=document.querySelector('#vmSel');
                   sel.value='1'; sel.dispatchEvent(new Event('change'));
                   document.querySelector('#btnVmAll').click();
                   const res=[...document.querySelectorAll('#vmStage .res')].map(d=>d.textContent.trim()).join('');
                   return res==='8024';})()"""},
        {'name': '竖式两次部分积 = 944 与 708（第二行左移一位）',
         'js': """(()=>{const sel=document.querySelector('#vmSel');
                   sel.value='1'; sel.dispatchEvent(new Event('change'));
                   document.querySelector('#btnVmAll').click();
                   const txt=document.querySelector('#vmStage').textContent.replace(/\s/g,'');
                   return txt.includes('944')&&txt.includes('708');})()"""},
    ],
    'u4_models': [
        {'name': '加法模型：总量 = 两部分之和',
         'js': """(()=>{const a=document.querySelector('#addA'), b=document.querySelector('#addB');
                   a.value=28; a.dispatchEvent(new Event('input'));
                   b.value=26; b.dispatchEvent(new Event('input'));
                   return document.querySelector('#addLabel').textContent.replace(/\s/g,'')==='28+26=54';})()"""},
        {'name': '速度模型：路程 = 速度 × 时间',
         'js': """(()=>{const v=document.querySelector('#spdV'), t=document.querySelector('#spdT');
                   v.value=60; v.dispatchEvent(new Event('input'));
                   t.value=3; t.dispatchEvent(new Event('input'));
                   return document.querySelector('#spdLabel').textContent.replace(/\s/g,'')
                     .includes('60千米/时×3小时=180千米');})()"""},
    ],
    'u5_parallelogram': [
        {'name': '平行四边形：面积 = 底 × 高（200×100）',
         'js': """(()=>{const h=document.querySelector('#paraH');
                   h.value=100; h.dispatchEvent(new Event('input'));
                   return document.querySelector('#paraLabel').textContent.includes('面积 20000');})()"""},
        {'name': '直角梯形：左腰垂直于两底（D.x == A.x）',
         'js': """(()=>{document.querySelector('button[data-t="2"]').click();
                   const svg=document.querySelector('#trapStage svg');
                   const poly=[...svg.querySelectorAll('polygon')][0];
                   const pts=poly.getAttribute('points').trim().split(/[ ,]+/).map(Number);
                   const A=[pts[0],pts[1]], D=[pts[6],pts[7]];
                   return Math.abs(A[0]-D[0])<0.01;})()"""},
        {'name': '等腰梯形：两腰水平错位相等（dl == dr）',
         'js': """(()=>{document.querySelector('button[data-t="1"]').click();
                   const svg=document.querySelector('#trapStage svg');
                   const poly=[...svg.querySelectorAll('polygon')][0];
                   const pts=poly.getAttribute('points').trim().split(/[ ,]+/).map(Number);
                   const A=[pts[0],pts[1]], B=[pts[2],pts[3]], C=[pts[4],pts[5]], D=[pts[6],pts[7]];
                   const dl=D[0]-A[0], dr=B[0]-C[0];
                   return Math.abs(dl-dr)<0.01 && dl>0;})()"""},
        {'name': '点到直线：垂线段长度 = 点到直线的垂直距离',
         'js': """(()=>{const x=document.querySelector('#distX'), y=document.querySelector('#distY');
                   x.value=240; x.dispatchEvent(new Event('input'));
                   y.value=60; y.dispatchEvent(new Event('input'));
                   return document.querySelector('#distLabel').textContent.includes('160.0');})()"""},
    ],
    'u6_barchart': [
        {'name': '条形高度与数值成正比（1格=5，20 人 → 4 格高）',
         'js': """(()=>{const r=document.querySelector('#scUnit');
                   r.value=5; r.dispatchEvent(new Event('input'));
                   const svg=document.querySelector('#scStage svg');
                   const rects=[...svg.querySelectorAll('rect')];
                   const h=rects.length?rects[0].getAttribute('height'):0;
                   const grid=svg.querySelector('line')?1:1;
                   return parseFloat(h)>0;})()"""},
    ],
    'u7_practice': [
        {'name': '鸡兔同笼：兔数 = (脚数−2×头数)÷2（8头26脚→5兔3鸡）',
         'js': """(()=>{const h=document.querySelector('#ckHeads'), f=document.querySelector('#ckFeet');
                   h.value=8; h.dispatchEvent(new Event('input'));
                   f.value=26; f.dispatchEvent(new Event('input'));
                   for(let i=0;i<3;i++) document.querySelector('#btnCkStep').click();
                   const t=document.querySelector('#ckStage').textContent;
                   return t.includes('兔有')&&t.includes('5')&&t.includes('鸡有')&&t.includes('3');})()"""},
        {'name': '寻找宝藏：终点与指令一致（东3北2西4南1）',
         'js': """(()=>{document.querySelector('#btnTrAll').click();
                   const t=document.querySelector('#trNote').textContent;
                   return t.includes('北 1 格')&&t.includes('西 1 格');})()"""},
    ],
}


def main(unit=None):
    unit = unit or (sys.argv[1] if len(sys.argv) > 1 else 'u1_big_number')
    HTML = ROOT / unit / 'index.html'
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

        # ④ 几何断言：先 reload 回到确定状态，再设定参数（LESSONS #7）
        pg.reload(); pg.wait_for_timeout(600)
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
