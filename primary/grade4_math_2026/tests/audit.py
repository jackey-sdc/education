#!/usr/bin/env python3
"""courseware-builder 四层验收脚本（结构 → 内容 → 交互 → 视觉）
对每个单元的**构建产物** index.html 逐项检查，输出可定位的问题清单。
用法： python3 tests/audit.py [unit ...]
"""
import pathlib, re, sys, json
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
UNITS = sys.argv[1:] or [p.parent.name for p in sorted(ROOT.glob('u*/meta.json'))]

# 结构层：资源加载型外链（SVG 命名空间不算）
FORBIDDEN = [
    re.compile(r'(?:src|href)\s*=\s*["\']https?://', re.I),
    re.compile(r'@import\s', re.I),
    re.compile(r'url\(\s*["\']?https?://', re.I),
    re.compile(r'<link[^>]+stylesheet', re.I),
]

def structure(html: str, path: pathlib.Path):
    issues = []
    # 相对链接必须真实存在（课件常被单独打开，路径写错就是死链）
    for rel in sorted(set(re.findall(r'(?:src|href)\s*=\s*["\']([^"\']+)["\']', html))):
        if rel.startswith(('#', 'data:', 'http')):
            continue
        if not (path.parent / rel).exists():
            issues.append(f'相对链接失效: {rel}')
    for pat in FORBIDDEN:
        for m in pat.finditer(html):
            issues.append(f'外部资源引用: {html[max(0,m.start()-40):m.start()+60].strip()[:100]}')
    if 'lang="zh-CN"' not in html: issues.append('缺少 lang="zh-CN"')
    if '<title>' not in html: issues.append('缺少 <title>')
    if 'name="viewport"' not in html: issues.append('缺少 viewport')
    if '@media print' not in html: issues.append('缺少打印样式')
    for rel in re.findall(r'(?:src|href)\s*=\s*["\']([^"\']+)["\']', html):
        if rel.startswith(('#', 'data:')): continue
        if not (path.parent / rel).exists():
            issues.append(f'相对路径失效: {rel}')
    return issues

def content_static(html: str, unit_dir: pathlib.Path):
    """静态内容层：题数、答案数、解析、nav 锚点、口径关键词"""
    issues = []
    meta = json.loads((unit_dir / 'meta.json').read_text(encoding='utf-8'))
    app = (unit_dir / 'app.js').read_text(encoding='utf-8')
    body = (unit_dir / 'body.html').read_text(encoding='utf-8')
    # nav 锚点 == section id
    ids = set(re.findall(r'<section[^>]+id="([^"]+)"', html)) | set(re.findall(r'<section[^>]+id="([^"]+)"', body))
    for href, _ in meta['nav']:
        if href.startswith('#') and href[1:] not in ids:
            issues.append(f'导航锚点无对应 section: {href}')
    # 题数与解析
    for key in ['BASIC_CHOICE','BASIC_FILL','HAND_CHOICE','HAND_FILL','EXT_CHOICE','EXT_FILL']:
        m = re.search(rf'const {key} = \[(.*?)\n\];', app, re.S)
        if not m: issues.append(f'未找到 {key}'); continue
        block = m.group(1)
        qs = len(re.findall(r"\{\s*q:", block))
        whys = len(re.findall(r"why:\s*'", block))
        if qs != whys:
            issues.append(f'{key}: {qs} 题但只有 {whys} 条解析')
        if qs and re.search(r"why:\s*''", block):
            issues.append(f'{key}: 存在空解析')
        # 答案键必须存在
        if not re.search(r'a:\s*(\[|[\'"\d])', block):
            issues.append(f'{key}: 存在没有答案的题目')
    # 口径关键词：题干/解析/教案/课件里关键表述是否一致
    alltext = html + app + body + (unit_dir/'教案.md').read_text(encoding='utf-8')
    caliber = {
        'u2_angle': ['锐角读内圈', '钝角读外圈', '内圈 0', '外圈 0'],
        'u1_big_number': ['改写', '求近似数', '四舍五入'],
        'u5_parallelogram': ['平行四边形', '梯形', '垂线段'],
        'u3_multiply': ['数位对齐', '进位'],
        'u4_models': ['单价', '数量', '总价'],
    }.get(unit_dir.name, [])
    for kw in caliber:
        if kw not in alltext:
            issues.append(f'口径关键词缺失: {kw}')
    return issues

def scan_object_str(pg, unit: str):
    """内容层：扫描页面上是否出现 "[object HTMLInputElement]" 这类**元素被当字符串拼接**的痕迹。
    起因：u2 分配律模块写了 `lab.textContent = a + ' + ' + B`（a 是滑块元素而不是数值），
    页面上直接显示 "[object HTMLInputElement] + 40"。
    症状在"元素被隐式转字符串"时才会出现，静态扫描看不出来，必须**渲染后扫 DOM**。"""
    issues = []
    found = pg.evaluate("""()=>{
      const out=[];
      document.querySelectorAll('body *').forEach(el=>{
        if(el.children.length) return;                 // 只看叶子节点
        const t = el.textContent || '';
        if(t.includes('[object ')) out.push((el.id || el.className || el.tagName) + ' :: ' + t.trim().slice(0,60));
      });
      return out;
    }""")
    for f in found:
        issues.append(f'[内容] 元素被当成字符串拼接：{f}')
    return issues



def check_counts(unit_dir: pathlib.Path):
    """**数字一致性**：徽章、总览页卡片、实际内容三者必须对得上。

    起因：单元徽章写"5 个动画模块"而实际有 6 个；总览页写"35 题分三档"
    而实际是 47 题分四档 —— 数字失真会让老师/家长对课件规模产生错误预期。"""
    issues = []
    meta = json.loads((unit_dir / 'meta.json').read_text(encoding='utf-8'))
    app = (unit_dir / 'app.js').read_text(encoding='utf-8')
    # 实际动画模块数 = nav 里 #s- 开头且在 body.html 有对应 section 的
    body = (unit_dir / 'body.html').read_text(encoding='utf-8')
    mods = [h for h, _ in meta['nav']
            if h.startswith('#s-') and f'id="{h[1:]}"' in body]
    for b in meta['badges']:
        mm = re.match(r'(\d+) 个动画模块', b)
        if mm and int(mm.group(1)) != len(mods):
            issues.append(f'徽章「{b}」与实际动画模块数 {len(mods)} 不符')
    # 徽章题数
    nq = 0
    for key in ['BASIC_CHOICE','BASIC_FILL','HAND_CHOICE','HAND_FILL',
                'EXT_CHOICE','EXT_FILL','STAR5_CHOICE','STAR5_FILL']:
        m = re.search(rf'const {key} = \[.*?\n\];', app, re.S)
        if m:
            nq += len(re.findall(r"\{\s*q:", m.group(0)))
    for b in meta['badges']:
        mm = re.search(r'分层练习 (\d+) 题', b)
        if mm and int(mm.group(1)) != nq:
            issues.append(f'徽章「{b}」与实际题数 {nq} 不符')
    # 难度题必须带"数学思维提示"，五星题必须带"详细解题过程"
    for key in ['EXT_CHOICE','EXT_FILL','STAR5_CHOICE','STAR5_FILL']:
        m = re.search(rf'const {key} = \[(.*?)\n\];', app, re.S)
        if not m:
            continue
        for blk in re.split(r"\n\s*\{q:", m.group(1))[1:]:
            blk = '{q:' + blk          # split 把 "q:" 吃掉了，补回来
            q = re.search(r"q:'((?:[^'\\]|\\.)*)'", blk)
            qtxt = q.group(1) if q else '?'
            if 'point:' not in blk:
                issues.append(f'{key}「{qtxt[:26]}」缺 point（考点）')
            if 'care:' not in blk:
                issues.append(f'{key}「{qtxt[:26]}」缺 care（易错提醒）')
            if key.startswith('STAR5') and 'steps:' not in blk:
                issues.append(f'{key}「{qtxt[:26]}」缺 steps（详细解题过程）')
            if 'steps:' in blk:
                n = len(re.findall(r"'[^']*'", re.search(r"steps:\[(.*?)\]", blk, re.S).group(1)))
                if n < 2:
                    issues.append(f'{key}「{qtxt[:26]}」的 steps 少于 2 步')
    return issues


def check_overview_counts():
    """总览页单元卡片的「模块数 / 题数 / 档位数」必须与实际一致。"""
    issues = []
    html = (ROOT / 'index.html').read_text(encoding='utf-8')
    for name, meta_txt in re.findall(
            r'href="(u\d[^"]*)/index\.html".*?<div class="meta">(.*?)</div>', html, re.S):
        d = ROOT / name
        if not d.exists():
            continue
        meta = json.loads((d / 'meta.json').read_text(encoding='utf-8'))
        body = (d / 'body.html').read_text(encoding='utf-8')
        mods = len([h for h, _ in meta['nav']
                    if h.startswith('#s-') and f'id="{h[1:]}"' in body])
        app = (d / 'app.js').read_text(encoding='utf-8')
        nq = 0
        for key in ['BASIC_CHOICE','BASIC_FILL','HAND_CHOICE','HAND_FILL',
                    'EXT_CHOICE','EXT_FILL','STAR5_CHOICE','STAR5_FILL']:
            m = re.search(rf'const {key} = \[.*?\n\];', app, re.S)
            if m:
                nq += len(re.findall(r"\{\s*q:", m.group(0)))
        tiers = len(meta.get('tiers', []))
        mm = re.search(r'(\d+) 个动画模块', meta_txt)
        if mm and int(mm.group(1)) != mods:
            issues.append(f'总览页 {name}「{meta_txt}」模块数与实际 {mods} 不符')
        # 题数有两种写法：
        #   A「5 个动画模块 · 47 题分四档」        → 直接比对
        #   B「15 + 9 + 11 题 · 分三档」（上册）   → 各档相加后比对
        # 题数有两种写法：
        #   A「5 个动画模块 · 47 题分四档」        → 直接比对
        #   B「15 + 9 + 11 + 12 题 · 分四档」     → 各档相加后比对（档数可任意）
        total_shown = None
        mm = re.search(r'((?:\d+\s*\+\s*)*\d+)\s*题', meta_txt)
        if mm:
            total_shown = sum(int(x) for x in re.findall(r'\d+', mm.group(1)))
        if total_shown is None:
            mm = re.search(r'(\d+) 题', meta_txt)
            if mm:
                total_shown = int(mm.group(1))
        if total_shown is not None and total_shown != nq:
            issues.append(f'总览页 {name}「{meta_txt}」题数与实际 {nq} 不符')
        if tiers and '分三档' in meta_txt and tiers == 4:
            issues.append(f'总览页 {name}「{meta_txt}」写成"分三档"，实际是 {tiers} 档')
    # 顶部总览数字
    mm = re.search(r'(\d+) 个交互动画', html)
    if mm:
        total = 0
        for d in sorted(ROOT.glob('u*/meta.json')):
            meta = json.loads(d.read_text(encoding='utf-8'))
            body = (d.parent / 'body.html').read_text(encoding='utf-8')
            total += len([h for h, _ in meta['nav']
                          if h.startswith('#s-') and f'id="{h[1:]}"' in body])
        if int(mm.group(1)) != total:
            issues.append(f'总览页称「{mm.group(1)} 个交互动画」，实际 {total} 个')
    return issues

def run_browser(pg, unit: str):
    """交互层 + 视觉层"""
    issues = []
    errs = []
    pg.on('pageerror', lambda e: errs.append(f'pageerror: {e}'))
    pg.on('console', lambda m: errs.append(f'console.error: {m.text}') if m.type == 'error' else None)
    pg.goto((ROOT / unit / 'index.html').as_uri())
    pg.wait_for_timeout(600)
    issues += [f'JS 报错 {e}' for e in errs]

    # —— 内容层：显示题数 == 标称总题数（LESSONS #10）
    counts = pg.evaluate("""()=>{
      const out={};
      /* 动态取档位：以后加档位不用再改审计脚本 */
      const keys=(window.__QUIZ_DATA__||[]).map(g=>g.key);
      (keys.length?keys:['basic','hand','ext']).forEach(k=>{
        const host=document.getElementById(k+'Block');
        const total=document.getElementById('total'+k.charAt(0).toUpperCase()+k.slice(1));
        out[k]={shown:host?host.querySelectorAll('.q').length:0, total:total?+total.textContent:0};
      });
      return out;
    }""")
    for k, v in counts.items():
        if v['shown'] != v['total']:
            issues.append(f'{k} 档：页面显示 {v["shown"]} 题，标称 {v["total"]} 题（题被覆盖/丢失）')

    # —— 内容层：答案条目数 == 题目总数
    nq = sum(v['shown'] for v in counts.values())
    nans = pg.locator('#answerKey .ans-item').count()
    if nq != nans:
        issues.append(f'题目数 {nq} ≠ 答案条目数 {nans}')

    # —— 交互层：计分与重做
    res = pg.evaluate("""()=>{
      const host=document.getElementById('basicBlock');
      const g=(window.__QUIZ_DATA__||[]).find(x=>x.key==='basic');
      const qs=[...host.querySelectorAll('.q')].filter(x=>x.querySelector('.opts'));
      const qi=g&&g.choice&&g.choice.length?0:-1;
      const q=qi<0?null:qs[qi].querySelectorAll('.opt')[(Array.isArray(g.choice[0].a)?g.choice[0].a:[g.choice[0].a])[0]];
      const scoreEl=document.getElementById('scoreBasic');
      const before=+scoreEl.textContent;
      if(q) q.click();
      const after=+scoreEl.textContent;
      const btn=document.getElementById('btnResetBasic');
      btn.click();
      const reset=+scoreEl.textContent;
      const shown=host.querySelectorAll('.q').length;
      const locked=host.querySelectorAll('.q .opt.locked').length;
      return {before, after, reset, shown, locked};
    }""")
    if res['after'] != res['before'] + 1:
        issues.append(f'计分不正确：作答后 {res["before"]} → {res["after"]}（应 +1）')
    if res['reset'] != 0:
        issues.append(f'重做后计分未归零：{res["reset"]}')
    if res['shown'] != counts['basic']['shown']:
        issues.append('重做后题目数变化（重做应原地重建，不增不减）')
    if res['locked'] != 0:
        issues.append('重做后选项仍处于锁定状态（locked 未清除）')

    # —— 交互层：答错文案不得泄露答案
    leaks = pg.evaluate("""()=>{
      const data=window.__QUIZ_DATA__||[];
      const out=[];
      data.forEach(g=>{
        (g.choice||[]).forEach((q,i)=>{
          const host=document.getElementById(g.key+'Block');
          const qs=[...host.querySelectorAll('.q')].filter(x=>x.querySelector('.opts'));
          const qq=qs[i]; if(!qq) return;
          const correct=(Array.isArray(q.a)?q.a:[q.a]);
          const wrong=[0,1,2,3].find(k=>!correct.includes(k));
          if(wrong===undefined) return;
          qq.querySelectorAll('.opt')[wrong].click();
          const fb=qq.querySelector('.fb');
          /* 用 innerText（= 学生**实际看到**的文字）：
             五星题答错时给出"详细解题过程"，最后一步（真正写出答案的那步）
             收在 <details> 里默认折叠，折叠内容不参与 innerText → 不算泄露。 */
          const txt=fb?fb.innerText:'';
          const ansTxt=correct.map(k=>q.opts[k]).join(' ');
          /* 题干里本来就写着答案（如"平均数是 24 … 去掉的数是"）时，
             过程里出现这个数不是"泄露"。 */
          /* 按**词边界**匹配：答案 '86' 不应被 '860' 误判成泄露 */
          let hit=false;
          if(ansTxt && ansTxt.length>1){
            const esc=ansTxt.replace(/[.*+?^${}()|[\\]\\\\]/g,'\\\\$&');
            hit=new RegExp('(^|[^0-9A-Za-z.])'+esc+'($|[^0-9A-Za-z.])').test(txt);
          }
          if(hit && !q.q.includes(ansTxt)) out.push(g.key+' 选择'+(i+1));
        });
      });
      return out;
    }""")
    for l in leaks:
        issues.append(f'答错反馈泄露了正确答案: {l}')

    # —— 交互层：填空答案归一化
    norm = pg.evaluate("""()=>{
      const out=[];
      const data=window.__QUIZ_DATA__||[];
      data.forEach(g=>{
        (g.fill||[]).forEach((q,i)=>{
          const a=Array.isArray(q.a)?q.a[0]:q.a;
          if(typeof a!=='string' || !/[0-9]/.test(a)) return;
          const host=document.getElementById(g.key+'Block');
          const qs=[...host.querySelectorAll('.q')].filter(x=>x.querySelector('input[type=text]'));
          const qq=qs[i]; if(!qq) return;
          const inputs=[...qq.querySelectorAll('input[type=text]')];
          const arr=Array.isArray(q.a)?q.a:[q.a];
          const btn=[...qq.querySelectorAll('button')].find(b=>b.textContent.includes('检查'));
          const fill=(suffix)=>inputs.forEach((inp,k)=>{
            inp.value=(k===0?a:arr[k]!==undefined?arr[k]:'')+ (k===0?suffix:'');
          });
          fill('度'); btn.click();
          const ok1=qq.querySelector('.fb').classList.contains('good');
          fill('°'); btn.click();
          const ok2=qq.querySelector('.fb').classList.contains('good');
          if(!(ok1&&ok2)) out.push(g.key+' 填空'+(i+1)+' 归一化失败('+a+')');
        });
      });
      return out;
    }""")
    for n in norm:
        issues.append(f'填空答案归一化异常: {n}')

    # —— 交互层：左侧章节栏（存在 / 可折叠 / 把手可展开 / 状态记忆）
    nav = pg.evaluate("""()=>{
      const side=document.querySelector('.sidenav');
      const toggle=document.getElementById('navToggle');
      const handle=document.getElementById('navShow');
      if(!side||!toggle) return {missing:true};
      const vis=()=>side.getBoundingClientRect().width>0;
      const before=vis();
      toggle.click();
      const after=vis();
      const handleVisible=handle?handle.getBoundingClientRect().width>0:false;
      if(handle){handle.click();}
      const back=vis();
      return {missing:false, before, after, handleVisible, back,
              links:side.querySelectorAll('a').length};
    }""")
    if nav.get('missing'):
        issues.append('缺少左侧章节栏或折叠按钮')
    else:
        if not nav['before']: issues.append('章节栏默认未显示')
        if nav['after']: issues.append('点击折叠后章节栏仍可见')
        if not nav['handleVisible']: issues.append('折叠后未出现"展开章节栏"把手')
        if not nav['back']: issues.append('点击把手后章节栏未恢复')
        if nav['links'] < 3: issues.append(f'章节栏链接过少（{nav["links"]}）')

    # —— 视觉层：出框检查（SVG 子元素是否越出 viewBox）
    out = pg.evaluate("""()=>{
      const bad=[];
      document.querySelectorAll('svg').forEach((svg,si)=>{
        const vb=svg.getAttribute('viewBox'); if(!vb) return;
        const [x0,y0,w,h]=vb.split(/[ ,]+/).map(Number);
        svg.querySelectorAll('line,circle,rect,path,text,polygon').forEach(el=>{
          let b; try{ b=el.getBBox(); }catch(e){ return; }
          if(b.width===0&&b.height===0) return;
          const T=1.5;
          if(b.x<x0-T||b.y<y0-T||b.x+b.width>x0+w+T||b.y+b.height>y0+h+T){
            bad.push('svg#'+si+' <'+el.tagName+'> 出框: '+JSON.stringify({
              x:Math.round(b.x),y:Math.round(b.y),w:Math.round(b.width),h:Math.round(b.height)})
              +' viewBox='+vb+' text='+(el.textContent||'').slice(0,18));
          }
        });
      });
      return bad;
    }""")
    for o in out[:12]:
        issues.append('出框: ' + o)
    if len(out) > 12:
        issues.append(f'（另有 {len(out)-12} 处出框未列出）')

    # —— 视觉层：打印模式
    pg.emulate_media(media='print')
    pg.wait_for_timeout(200)
    pr = pg.evaluate("""()=>{
      const nav=document.querySelector('nav');
      const header=document.querySelector('header');
      const det=document.querySelector('details.answers');
      const cs=e=>e?getComputedStyle(e):null;
      const visible=e=>!!e && e.getBoundingClientRect().height>0;
      const btns=[...document.querySelectorAll('button')];
      return {
        navHidden: nav? cs(nav).display==='none' : null,
        headerHidden: header? cs(header).display==='none' : null,
        btnHidden: btns.length? btns.every(b=>!visible(b)) : null,
        answersVisible: det? visible(det) : null
      };
    }""")
    pg.emulate_media(media='screen')
    if pr['navHidden'] is False: issues.append('打印模式下导航未隐藏')
    if pr['btnHidden'] is False: issues.append('打印模式下按钮未隐藏')
    if pr['headerHidden'] is False: issues.append('打印模式下页眉未隐藏')
    if pr['answersVisible'] is False: issues.append('打印模式下答案区不可见')
    issues += scan_object_str(pg, unit)
    return issues

def audit_overview(pg, browser):
    """课程总览页：链接有效性 + 侧栏 + 独立/内嵌两种形态的按钮切换"""
    issues = []
    html = (ROOT / 'index.html').read_text(encoding='utf-8')
    issues += [f'[结构] {x}' for x in structure(html, ROOT / 'index.html')]

    # 独立打开：应显示"返回教育实验平台"，隐藏"新窗口打开"
    pg.goto((ROOT / 'index.html').as_uri())
    pg.wait_for_timeout(500)
    st = pg.evaluate("""()=>{
      const b=document.getElementById('backToPlatform'), o=document.getElementById('openStandalone');
      return {back: b?getComputedStyle(b).display:null, open: o?getComputedStyle(o).display:null,
              href: b?b.getAttribute('href'):null, links:document.querySelectorAll('.sidenav a').length};
    }""")
    if st['back'] == 'none': issues.append('[交互] 独立打开时"返回教育实验平台"应可见')
    if st['open'] != 'none': issues.append('[交互] 独立打开时"新窗口打开"应隐藏')
    if st['links'] < 8: issues.append(f'[内容] 总览页章节栏链接过少（{st["links"]}）')

    # 内嵌形态：用真实平台页面打开课件（iframe），端到端验证
    platform = ROOT.parent.parent / 'index.html'
    if platform.exists():
        pg2 = browser.new_page()
        pg2.goto(platform.as_uri())
        pg2.wait_for_timeout(800)
        try:
            pg2.click('text=四上数学·动画课件（2026秋）')
            pg2.wait_for_timeout(1500)
            fr = pg2.frame_locator('#content-frame')
            vis_back = fr.locator('#backToPlatform').is_visible()
            vis_open = fr.locator('#openStandalone').is_visible()
            href = fr.locator('#openStandalone').get_attribute('href') or ''
        except Exception as e:
            vis_back, vis_open, href = True, False, ''
            issues.append(f'[交互] 无法在平台 iframe 中定位课件: {str(e)[:80]}')
        if vis_back:
            issues.append('[交互] 嵌在平台里时"返回教育实验平台"应隐藏（否则会在 iframe 里套一层平台）')
        if not vis_open:
            issues.append('[交互] 嵌在平台里时应显示"新窗口打开"')
        if not href.endswith('index.html'):
            issues.append(f'[交互] "新窗口打开"的地址不对: {href}')
        pg2.close()
    else:
        issues.append('[结构] 找不到平台页面 education/index.html')
    return issues


def main():
    total_issues = 0
    with sync_playwright() as p:
        b = p.chromium.launch()
        for unit in UNITS:
            d = ROOT / unit
            html = (d / 'index.html').read_text(encoding='utf-8')
            issues = []
            issues += [f'[结构] {x}' for x in structure(html, d / 'index.html')]
            issues += [f'[内容] {x}' for x in content_static(html, d)]
            issues += [f'[数字] {x}' for x in check_counts(d)]
            pg = b.new_page(viewport={'width':1280,'height':950}, device_scale_factor=1)
            issues += [f'[运行时] {x}' for x in run_browser(pg, unit)]
            pg.close()
            print(f"\n{'✅' if not issues else '❌'} {unit}  ({len(issues)} 个问题)")
            for i in issues: print('   -', i)
            total_issues += len(issues)
        # 课程总览页（单独检查：它没有练习区）
        pg = b.new_page(viewport={'width':1280,'height':950})
        ov = audit_overview(pg, b)
        ov += [f'[数字] {x}' for x in check_overview_counts()]
        print(f"\n{'✅' if not ov else '❌'} index.html（课程总览）  ({len(ov)} 个问题)")
        for i in ov: print('   -', i)
        total_issues += len(ov)
        pg.close()
        b.close()
    print(f'\n合计问题：{total_issues}', '✅ 全部通过' if total_issues == 0 else '❌ 需要修复')
    return 1 if total_issues else 0

if __name__ == '__main__':
    sys.exit(main())
