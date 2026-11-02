"""单元课件回归测试模板（Playwright）
做四件事：
  ① 加载课件，捕获 JS 报错与 console.error
  ② 点遍所有按钮 / 拖动所有滑块，确保没有交互崩溃
  ③ 样式自检：自定义属性是否生效、按钮是否有可见背景
  ④ 关键图形几何断言（按需在 ASSERTS 里补）
用法： python3 tests/test_unit.py u1_divide
"""
import pathlib, sys
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent

# 几何断言（视觉层）：取实际渲染结果换算几何量，验证"图 = 数"同源
ASSERTS = {
    'u1_divide': [
        {'name': '笔算除法竖式：425÷25 的商为 17（商 1 在十位、7 在个位）',
         'js': """(()=>{document.querySelector('#btnDivAll').click();
                   const svg=document.querySelector('#divStage svg');
                   const colX=i=>176+i*46+23;
                   const qs=[...svg.querySelectorAll('text')]
                     .filter(t=>+t.getAttribute('y')===46)
                     .sort((a,b)=>+a.getAttribute('x')-+b.getAttribute('x'))
                     .map(t=>t.textContent).join('');
                   // 商 1 必须在十位列(1)，商 7 必须在个位列(2)
                   const at1=[...svg.querySelectorAll('text')].some(t=>t.textContent==='1'&&+t.getAttribute('y')===46&&Math.abs(+t.getAttribute('x')-colX(1))<1);
                   const at2=[...svg.querySelectorAll('text')].some(t=>t.textContent==='7'&&+t.getAttribute('y')===46&&Math.abs(+t.getAttribute('x')-colX(2))<1);
                   return qs==='17'&&at1&&at2;})()"""},
        {'name': '竖式：除到哪一位，商就写在那一位上面（商 1 与被除数 42 的十位 2 同列）',
         'js': """(()=>{document.querySelector('#btnDivAll').click();
                   const svg=document.querySelector('#divStage svg');
                   const ts=[...svg.querySelectorAll('text')];
                   const colX=i=>176+i*46+23;
                   // 商 1 在十位列（与被除数的 2 同列）
                   const one=ts.find(t=>t.textContent==='1'&&Math.abs(+t.getAttribute('x')-colX(1))<1&&+t.getAttribute('y')===46);
                   // 被除数的十位数字 2 也在同一列
                   const two=ts.find(t=>t.textContent==='2'&&Math.abs(+t.getAttribute('x')-colX(1))<1&&+t.getAttribute('y')===106);
                   return !!one && !!two;})()"""},
        {'name': '试商：405÷15 把除数看作 20（个位 5 四舍五入进位）',
         'js': """(()=>{const sel=document.querySelector('#trialSel');
                   sel.value='0'; sel.dispatchEvent(new Event('change'));
                   document.querySelector('#btnTrialAll').click();
                   const t=document.querySelector('#trialStage').textContent;
                   return t.includes('20')&&t.includes('2');})()"""},
        {'name': '试商动画：商大了要调小（乘积 60 比被除数 40 大）',
         'js': """(()=>{const sel=document.querySelector('#trialSel');
                   sel.value='0'; sel.dispatchEvent(new Event('change'));
                   document.querySelector('#btnTrialAll').click();
                   const t=document.querySelector('#trialNote').textContent;
                   return t.includes('商大了')&&t.includes('调小');})()"""},
        {'name': '商的变化规律：240÷16 与 480÷32 的商都是 15',
         'js': """(()=>{const k=document.querySelector('#ruleK');
                   k.value=2; k.dispatchEvent(new Event('input'));
                   const t=document.querySelector('#ruleStage').textContent;
                   return t.includes('240 ÷ 16')&&t.includes('480 ÷ 32')&&t.includes('商都是 15');})()"""},
        {'name': '进一法/去尾法：租船 25÷4=6……1 → 7 条船（进一法）',
         'js': """(()=>{document.querySelector('[data-sc="0"]').click();
                   const t=document.querySelector('#solveStage').textContent;
                   return t.includes('25 ÷ 4')&&t.includes('6 + 1 = 7')&&t.includes('进一法');})()"""},
        {'name': '去尾法：裁布 25÷3=8……1 → 8 件（去尾法）',
         'js': """(()=>{document.querySelector('[data-sc="1"]').click();
                   const t=document.querySelector('#solveStage').textContent;
                   return t.includes('25 ÷ 3')&&t.includes('舍去余数 1')&&t.includes('去尾法');})()"""},
    ],
    'u2_laws': [
        {'name': '运算顺序：24+6×5 先算乘法（分步第①步是 6×5=30）',
         'js': """(()=>{document.querySelector('#btnOrdStep').click();
                   const t=document.querySelector('#ordStage').textContent.replace(/\\s/g,'');
                   return t.includes('6×5=30');})()"""},
        {'name': '面积模型：(a+b)×c 沿长边分成两块，两块面积之和 = 整块面积',
         'js': """(()=>{const svg=document.querySelector('#distStage svg');
                   const rs=[...svg.querySelectorAll('rect')];
                   const area=r=>(+r.getAttribute('width'))*(+r.getAttribute('height'));
                   // 整块是浅蓝底(#e8f1ff)，两块是橙/绿
                   const outer=rs.find(r=>r.getAttribute('fill')==='#e8f1ff');
                   const blocks=rs.filter(r=>['#f08a24','#1f9d6b'].indexOf(r.getAttribute('fill'))>=0);
                   if(!outer||blocks.length!==2) return false;
                   const sum=blocks.reduce((a,r)=>a+area(r),0);
                   // 两块必须左右相接、且与整块同高同起点
                   const h=+outer.getAttribute('height');
                   const sameH=blocks.every(r=>+r.getAttribute('height')===h);
                   const sameY=blocks.every(r=>r.getAttribute('y')===outer.getAttribute('y'));
                   return Math.abs(sum-area(outer))<1 && sameH && sameY;})()"""},
        {'name': '点子图：A×B 与 B×A 的圆点总数相同（乘法交换律）',
         'js': """(()=>{const a=document.querySelector('#mulA'), b=document.querySelector('#mulB');
                   a.value=3; a.dispatchEvent(new Event('input'));
                   b.value=5; b.dispatchEvent(new Event('input'));
                   const svg=document.querySelector('#mulStage svg');
                   const cs=[...svg.querySelectorAll('circle')];
                   if(cs.length!==30) return false;
                   const t=document.querySelector('#mulStage').textContent;
                   return t.includes('3 × 5 = 5 × 3 = 15');})()"""},
        {'name': '简便计算：125×32×25 的分步结果为 100000',
         'js': """(()=>{document.querySelector('#btnSimAll').click();
                   const t=document.querySelector('#simStage').textContent.replace(/\\s/g,'');
                   return t.includes('1000×100=100000');})()"""},
    ],
    'u3_triangle': [
        {'name': '三边关系：6、5、8 能围成（两条边之和大于第三边）',
         'js': """(()=>{const t=document.querySelector('#triNote').textContent;
                   return t.includes('能围成三角形');})()"""},
        {'name': '三边关系：拖成 2、3、6 后提示围不成（2+3=5 不大于 6）',
         'js': """(()=>{const a=document.querySelector('#triA'), b=document.querySelector('#triB'),
                   c=document.querySelector('#triC');
                   a.value=2; a.dispatchEvent(new Event('input'));
                   b.value=3; b.dispatchEvent(new Event('input'));
                   c.value=6; c.dispatchEvent(new Event('input'));
                   const t=document.querySelector('#triNote').textContent;
                   return t.includes('围不成三角形');})()"""},
        {'name': '三边关系：画出的三角形三边之比 = A:B:C（几何同源）',
         'js': """(()=>{const set=(sel,v)=>{const e=document.querySelector(sel);
                   e.value=v; e.dispatchEvent(new Event('input'));};
                   set('#triA',6); set('#triB',5); set('#triC',8);
                   const poly=document.querySelector('#triStage svg polygon');
                   if(!poly) return false;
                   const pts=poly.getAttribute('points').split(' ').map(s=>s.split(',').map(Number));
                   const d=(p,q)=>Math.hypot(p[0]-q[0],p[1]-q[1]);
                   // 底边 = C，左腰 = B，右腰 = A
                   const ka=d(pts[1],pts[2])/6, kb=d(pts[0],pts[2])/5, kc=d(pts[0],pts[1])/8;
                   return Math.abs(ka-kb)<1e-6 && Math.abs(kb-kc)<1e-6 && ka>0;})()"""},
        {'name': '内角和：三个角拼成平角，结论 52°+68°+60°=180°',
         'js': """(()=>{document.querySelector('#btnAngAll').click();
                   const t=document.querySelector('#angStage').textContent.replace(/\\s/g,'');
                   return t.includes('52°+68°+60°=180°');})()"""},
        {'name': '分类：两底角相等时判为等腰三角形',
         'js': """(()=>{const a=document.querySelector('#clsA'), b=document.querySelector('#clsB');
                   a.value=50; a.dispatchEvent(new Event('input'));
                   b.value=50; b.dispatchEvent(new Event('input'));
                   const t=document.querySelector('#clsNote').textContent;
                   return t.includes('等腰三角形');})()"""},
        {'name': '画高：三条高都画完后给出 3 条高的结论',
         'js': """(()=>{document.querySelector('#btnHAll').click();
                   const t=document.querySelector('#hNote').textContent;
                   return t.includes('3 条高');})()"""},
    ],
    'u4_decimal': [
        {'name': '十格图：涂 3 格表示 0.3（3/10）',
         'js': """(()=>{const f=document.querySelector('#decFill');
                   f.value=3; f.dispatchEvent(new Event('input'));
                   const t=document.querySelector('#decStage').textContent.replace(/\\s/g,'');
                   return t.includes('3/10')&&t.includes('0.3');})()"""},
        {'name': '数位顺序表：3.205 的小数点右边是十分位、百分位、千分位',
         'js': """(()=>{const t=document.querySelector('#placeStage').textContent;
                   return t.includes('十分位')&&t.includes('百分位')&&t.includes('千分位');})()"""},
        {'name': '读法：3.205 读作三点二零五（中间的 0 要读）',
         'js': """(()=>{document.querySelector('#btnReadAll').click();
                   const t=document.querySelector('#readStage').textContent.replace(/\\s/g,'');
                   return t.includes('三点二零五');})()"""},
        {'name': '小数的性质：0.5 与 0.50 在数轴上重合（大小相等）',
         'js': """(()=>{document.querySelector('#btnPropAll').click();
                   const t=document.querySelector('#propNote').textContent;
                   return t.includes('末尾')&&t.includes('0.5 = 0.50');})()"""},
        {'name': '小数点移动：向右移一位扩大 10 倍',
         'js': """(()=>{document.querySelector('#btnMoveStep').click();
                   const t=document.querySelector('#moveNote').textContent;
                   return t.includes('向右移')&&t.includes('10 倍');})()"""},
    ],
    'u5_decimal_add': [
        {'name': '小数加法：3.2+2.8 的结果是 6（竖式结果行）',
         'js': """(()=>{document.querySelector('#btnAddAll').click();
                   const t=document.querySelector('#addStage').textContent.replace(/\\s/g,'');
                   return t.includes('6');})()"""},
        {'name': '小数减法：20−0.35 补 0 后得 19.65',
         'js': """(()=>{document.querySelector('#btnSubAll').click();
                   const t=document.querySelector('#subNote').textContent;
                   return t.includes('19.65')&&t.includes('20.00');})()"""},
        {'name': '小数点对齐：红色虚线标出小数点位置',
         'js': """(()=>{document.querySelector('#btnAlignStep').click();
                   const svg=document.querySelector('#alignStage svg');
                   const ls=[...svg.querySelectorAll('line')].filter(l=>(l.getAttribute('stroke')||'')==='#d94a4a');
                   return ls.length>0;})()"""},
        {'name': '运算律推广到小数：0.7+3.9+0.3 凑整得 4.9',
         'js': """(()=>{document.querySelector('#btnLawAll').click();
                   const t=document.querySelector('#lawStage').textContent.replace(/\\s/g,'');
                   return t.includes('1+3.9=4.9');})()"""},
        {'name': '运算律推广到小数：结论点明"整数运算律对小数同样适用"',
         'js': """(()=>{document.querySelector('#btnLawAll').click();
                   const t=document.querySelector('#lawNote').textContent;
                   return t.includes('整数')&&t.includes('运算律')&&t.includes('小数');})()"""},
    ],
    'u6_average': [
        {'name': '平均数：80、90、70 的平均数是 80（总数 240÷3）',
         'js': """(()=>{const t=document.querySelector('#calStage').textContent.replace(/\\s/g,'');
                   return t.includes('240')&&t.includes('÷3=80');})()"""},
        {'name': '平均数的应用：人数不同时要比平均数（甲 20 vs 乙 15）',
         'js': """(()=>{document.querySelector('[data-sc=\"1\"]').click();
                   const t=document.querySelector('#applyStage').textContent.replace(/\\s/g,'');
                   return t.includes('共120')&&t.includes('均30')&&t.includes('共80')&&t.includes('均26.7');})()"""},
        {'name': '复式条形统计图：两组平均数 14 与 11，结论四（1）班更长',
         'js': """(()=>{document.querySelector('#btnCmpAll').click();
                   const t=document.querySelector('#cmpNote').textContent;
                   return t.includes('14')&&t.includes('11')&&t.includes('四（1）班平均每天课外阅读时间更长');})()"""},
        {'name': '制定旅游计划：30 人方案 A 合计 19800 元、人均 660 元',
         'js': """(()=>{document.querySelector('#btnTrvAll').click();
                   const t=document.querySelector('#trvStage').textContent.replace(/\\s/g,'');
                   // 交通 180×30=5400，住宿 120×2×30=7200，门票 40×30=1200，吃饭 60×3×30=5400，其他 20×30=600 → 19800
                   return t.includes('19800')&&t.includes('人均660元');})()"""},
        {'name': '制定旅游计划：方案 B 人均更省，结论为"方案 B 更省钱"',
         'js': """(()=>{document.querySelector('#btnTrvAll').click();
                   const t=document.querySelector('#trvNote').textContent;
                   // 方案 B 合计 13500，人均 450 < 660
                   return t.includes('450')&&t.includes('方案 B 更省钱');})()"""},
    ],
    'u7_review': [
        {'name': '知识地图：七大板块齐全',
         'js': """(()=>{const t=document.querySelector('#mapStage').textContent;
                   return ['除数是两位数的除法','混合运算和运算律','三角形','小数的认识',
                           '小数的加法和减法','平均数','复习与关联'].every(x=>t.includes(x));})()"""},
        {'name': '数与代数：三条主线链（算理→数位→算巧）依次点亮',
         'js': """(()=>{for(let i=0;i<3;i++) document.querySelector('#btnRvStep').click();
                   const t=document.querySelector('#rvStage').textContent.replace(/\\s/g,'');
                   return t.includes('算理')&&t.includes('数位')&&t.includes('算巧');})()"""},
        {'name': '综合应用：30 人租车的车数用进一法得 1 辆? → 30÷45 向上取整为 1',
         'js': """(()=>{document.querySelector('#btnApStep').click();
                   const t=document.querySelector('#apStage').textContent.replace(/\\s/g,'');
                   return t.includes('需要1辆车');})()"""},
        {'name': '三角形知识链：四块知识互相支撑',
         'js': """(()=>{document.querySelector('[data-g=\"1\"]').click();
                   const t=document.querySelector('#geoNote').textContent;
                   return t.includes('关联')&&t.includes('内角和');})()"""},
    ],
}

# 星级 / 庆祝效果回归（LESSONS #25：星级与庆祝系统）
STAR_ASSERTS = {
    'u1_divide': [('#star5Block', '★★★', '★★★★', '★★★★★')],
    'u2_laws':   [('#star5Block', '★★★', '★★★★', '★★★★★')],
    'u3_triangle':[('#star5Block', '★★★', '★★★★', '★★★★★')],
    'u4_decimal':[('#star5Block', '★★★', '★★★★', '★★★★★')],
    'u5_decimal_add':[('#star5Block', '★★★', '★★★★', '★★★★★')],
    'u6_average':[('#star5Block', '★★★', '★★★★', '★★★★★')],
    'u7_review': [('#star5Block', '★★★', '★★★★', '★★★★★')],
}

# 结论可达性回归（LESSONS #19：step 被夹到 length-1，导致"教学口径"结论永远看不到）
CONCLUSION_ASSERTS = {
    'u1_divide': [('#btnDivAll', '#divNote', '竖式三句话')],
    'u2_laws': [('#btnAddAll', '#addNote', '运算律只改变运算顺序'),
                ('#btnDistAll', '#dist2Note', '分配律可以正用'),
                ('#btnSimAll', '#simNote', '简便计算的依据是运算律')],
    'u5_decimal_add': [('#btnLawAll', '#lawNote', '整数加法、乘法的运算律'),
                        ('#btnMixAll', '#mixNote', '同级运算从左往右')],
}


def main(unit=None):
    unit = unit or (sys.argv[1] if len(sys.argv) > 1 else 'u1_divide')
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
        # ⚠️ 跳过"讲解"类按钮（🔊 听思路 / 讲解控制条）：
        #    点它们会启动**语音朗读**，几十段同时播会把页面撑长、
        #    后续按钮坐标持续变化 → 巡检大面积超时。
        #    讲解功能改为**单独断言**（见 ②b）。
        for i, btn in enumerate(pg.locator('button').all()):
            try:
                cls = (btn.get_attribute('class') or '')
                if 'q-narr-btn' in cls or 'narr-' in cls:
                    continue
                btn.scroll_into_view_if_needed(timeout=1500)
                btn.click(timeout=2500)
                pg.wait_for_timeout(80)
            except Exception as e:
                fails.append(f'按钮#{i}: {str(e)[:80]}')
        # ②b 讲解功能单独断言：难题有听思路按钮，点一下能出字幕
        narr_ok = pg.evaluate("""()=>{
            const b = document.querySelector('.q-narr-btn');
            if(!b) return {ok:false, why:'没有听思路按钮'};
            b.click();
            return {ok:true};
        }""")
        if not narr_ok.get('ok'):
            fails.append('讲解功能：' + narr_ok.get('why','未知'))
        else:
            pg.wait_for_timeout(400)
            sub = pg.evaluate("""()=>{
                const s=document.querySelector('.q-narr-sub .narr-sub');
                return s ? s.textContent : '';
            }""")
            if not sub.strip():
                fails.append('讲解功能：点击听思路按钮后没有出现字幕')
            else:
                pg.evaluate("""()=>{const b=document.querySelector('.q-narr-sub .narr-stop');
                  if(b) b.click();}""")
                pg.wait_for_timeout(150)
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

        # ③a 星级体系：三星/四星/五星标签都要正确挂上
        for host, s3, s4, s5 in STAR_ASSERTS.get(unit, []):
            try:
                got = pg.evaluate("""([host])=>{
                  const pick=(sel)=>{const e=document.querySelector(sel+' .q .qstars');
                                     return e?e.textContent:null;};
                  return [pick('#basicBlock'), pick('#extBlock'), pick(host)];
                }""", [host])
                ok = got == [s3, s4, s5]
                print(f"{'✅' if ok else '❌'} 星级标签：{got}")
                if not ok:
                    fails.append(f'星级标签不对：{got}（期望 {[s3,s4,s5]}）')
            except Exception as e:
                fails.append(f'星级标签检查失败: {e}')

        # ③a2 庆祝效果：答对五星题要出现"你好棒"横幅 + 满屏点赞 + 音效
        try:
            cheer = pg.evaluate("""()=>{
              const g=(window.__QUIZ_DATA__||[]).find(x=>x.key==='star5');
              if(!g) return {err:'no star5 tier'};
              const q=g.choice[0];
              const a=Array.isArray(q.a)?q.a:[q.a];
              const qs=[...document.querySelectorAll('#star5Block .q')].filter(x=>x.querySelector('.opts'));
              if(!qs.length) return {err:'no choice q'};
              qs[0].querySelectorAll('.opt')[a[0]].click();
              const l=document.getElementById('cheerLayer');
              return {likes: l? l.querySelectorAll('.like-fly').length : 0,
                      banner: l? (l.querySelector('.cheer-banner')||{}).textContent||'' : '',
                      grand: l? l.querySelectorAll('.cheer-banner.grand').length : 0};
            }""")
            ok = cheer.get('likes', 0) > 0 and '你好棒' in cheer.get('banner', '') and cheer.get('grand', 0) == 0
            print(f"{'✅' if ok else '❌'} 五星庆祝：点赞 {cheer.get('likes')} 个，横幅「{cheer.get('banner','')[:20]}」")
            if not ok:
                fails.append(f'五星庆祝效果不对: {cheer}')
        except Exception as e:
            fails.append(f'庆祝效果检查失败: {e}')

        # ③b 结论可达性：点"完整演示"后必须能看到该模块的教学口径结论
        for btn, noteSel, expect in CONCLUSION_ASSERTS.get(unit, []):
            try:
                pg.click(btn); pg.wait_for_timeout(200)
                txt = pg.inner_text(noteSel)
                ok = expect in txt
                print(f"{'✅' if ok else '❌'} 结论可达：{noteSel} 含「{expect}」")
                if not ok:
                    fails.append(f'结论不可达：{noteSel} 未出现「{expect}」')
            except Exception as e:
                fails.append(f'结论可达性检查失败 {noteSel}: {e}')

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
