/* ==========================================================================
   第六单元 平均数 —— 交互模块
   口径：① 平均数 = 总数量 ÷ 总份数；用"移多补少"理解
        ② 平均数能代表一组数据的总体水平，但不一定等于其中某个数
        ③ 人数相同时比总数；人数不同时比平均数
        ④ 复式条形统计图：先分别求总数与份数，再各自求平均数
   ========================================================================== */

/* ==========================================================================
   ① 平均数的意义 —— 移多补少
   ========================================================================== */
(function initAvgMeaning(){
  const n = $('#avgN'), lab = $('#avgLabel');
  const stage = $('#avgStage'), note = $('#avgNote');
  function render(){
    const groups = +n.value;
    /* 每组个数：故意做成"有多有少"，需要移多补少 */
    const data = [];
    for (let i = 0; i < groups; i++) data.push(4 + (i % 3));
    const total = data.reduce((a, b) => a + b, 0);
    const avg = total / groups;
    lab.textContent = groups + ' 组';
    stage.innerHTML = '';
    const W = 640, H = 250;
    const svg = s('svg', {viewBox:`0 0 ${W} ${H}`, width:W, height:H});
    stage.appendChild(svg);
    const cw = Math.min(90, 560 / groups);
    const x0 = (W - groups * cw) / 2 + 10;
    /* 原始 */
    data.forEach((v, i) => {
      const x = x0 + i * cw;
      for (let k = 0; k < v; k++){
        s('circle', {cx:x + cw/2, cy:200 - k*22, r:9, fill:'#2f6fd0', opacity:.85}, svg);
      }
      label(svg, x + cw/2, 222, String(v), {size:14, weight:800, fill:'#20304a'});
      label(svg, x + cw/2, 240, '第' + (i+1) + '组', {size:11.5, fill:'#4b5f7d'});
    });
    /* 平均线 */
    const yAvg = 200 - avg * 22;
    s('line', {x1:20, y1:yAvg, x2:620, y2:yAvg, stroke:'#f08a24', 'stroke-width':2.4,
      'stroke-dasharray':'8 5'}, svg);
    label(svg, 620, yAvg - 10, '平均数 ' + avg, {size:13.5, weight:800, fill:'#b35c00',
      anchor:'end'});
    /* 结论 */
    s('rect', {x:150, y:16, width:340, height:34, rx:9, fill:'#f6f2ff', stroke:'#7a4fd6', 'stroke-width':2}, svg);
    label(svg, 320, 38, '总数 ' + total + ' ÷ ' + groups + ' = ' + avg,
      {size:16, weight:800, fill:'#5b34b8'});
    note.innerHTML = `<b>${groups} 组</b>分别是 ${data.join('、')} 个，` +
      `<b>总数 = ${total}</b>，<b>份数 = ${groups}</b>，` +
      `<b>平均数 = ${total} ÷ ${groups} = ${avg}</b>。` +
      `<br><b>移多补少</b>：把多的组里多的<b>移</b>给少的组，最后每组都是 <b>${avg}</b> 个。` +
      `<br><b>教学口径</b>：<b>平均数 = 总数量 ÷ 总份数</b>；<b>平均数能代表一组数据的总体水平</b>。`;
  }
  n.addEventListener('input', render);
  $('#btnAvgReset').addEventListener('click', () => { n.value = 4; render(); });
  /* 讲解入口：set(组数 2~6) */
  window.MOD = window.MOD || {};
  MOD.avg = {
    set(g){ n.value = g; render(); }
  };
  render();
})();

/* ==========================================================================
   ② 求平均数
   ========================================================================== */
(function initAvgCalc(){
  const a = $('#calA'), b = $('#calB'), c = $('#calC'), lab = $('#calLabel');
  const stage = $('#calStage'), note = $('#calNote');
  function render(){
    const A = +a.value, B = +b.value, C = +c.value;
    const total = A + B + C, avg = total / 3;
    lab.textContent = '平均数 ' + avg;
    stage.innerHTML = '';
    const W = 640, H = 250;
    const svg = s('svg', {viewBox:`0 0 ${W} ${H}`, width:W, height:H});
    stage.appendChild(svg);
    /* 三组柱 */
    const data = [A, B, C], names = ['第1组', '第2组', '第3组'];
    const maxV = Math.max(...data) * 1.25;
    const cw = 120, x0 = 110;
    data.forEach((v, i) => {
      const h = (v / maxV) * 170;
      const x = x0 + i * cw;
      s('rect', {x, y:200 - h, width:66, height:h, rx:5, fill:'#2f6fd0', opacity:.88}, svg);
      haloText(svg, x + 33, 200 - h - 12, String(v), null, {size:15, weight:800, fill:'#2f6fd0', rot:false});
      label(svg, x + 33, 222, names[i], {size:12.5, fill:'#4b5f7d'});
    });
    /* 平均线 */
    const yAvg = 200 - (avg / maxV) * 170;
    s('line', {x1:80, y1:yAvg, x2:520, y2:yAvg, stroke:'#f08a24', 'stroke-width':2.6,
      'stroke-dasharray':'8 5'}, svg);
    label(svg, 520, yAvg - 12, '平均线 ' + avg, {size:14, weight:800, fill:'#b35c00', anchor:'end'});
    /* 右侧算式 */
    label(svg, 545, 60, '总数 = ' + A + ' + ' + B + ' + ' + C, {size:15, weight:700, fill:'#20304a'});
    label(svg, 545, 88, '= ' + total, {size:16, weight:800, fill:'#2f6fd0'});
    label(svg, 545, 122, '份数 = 3', {size:15, weight:700, fill:'#20304a'});
    s('rect', {x:530, y:140, width:100, height:40, rx:9, fill:'#fff2e2', stroke:'#f08a24', 'stroke-width':2}, svg);
    label(svg, 580, 166, '÷ 3 = ' + avg, {size:16, weight:800, fill:'#b35c00'});
    note.innerHTML = `<b>${A}、${B}、${C}</b> 的平均数是 <b>${avg}</b>。` +
      `<br><b>两步走</b>：① 先求<b>总数</b> ${A} + ${B} + ${C} = <b>${total}</b>；② 再<b>除以份数 3</b>，得 <b>${avg}</b>。` +
      `<br><b>教学口径</b>：<b>平均数 = 总数量 ÷ 总份数</b>。` +
      `<br><b>注意</b>：这里平均数 <b>${avg}</b> ${data.includes(avg) ? '恰好是其中一个数' : '不等于其中任何一个数'}——` +
      `<b>平均数不一定是这组数中的某一个数</b>。`;
  }
  a.addEventListener('input', render); b.addEventListener('input', render); c.addEventListener('input', render);
  $('#btnCalReset').addEventListener('click', () => { a.value = 80; b.value = 90; c.value = 70; render(); });
  /* 讲解入口：set(三个数) */
  window.MOD = window.MOD || {};
  MOD.calc = {
    set(A, B, C){ a.value = A; b.value = B; c.value = C; render(); }
  };
  render();
})();

/* ==========================================================================
   ③ 平均数的应用
   ========================================================================== */
(function initApply(){
  const stage = $('#applyStage'), note = $('#applyNote');
  const CASES = [
    {t:'每天植树', n:'两个小队植树，队员人数相同',
     a:[{name:'甲队', days:5, trees:[20,22,18,21,19]}, {name:'乙队', days:5, trees:[16,17,15,18,14]}],
     ask:'哪个小队植的树多？', ans:'<b>甲队</b>多',
     why:'两队<b>人数（份数）相同</b>，直接比<b>总数</b>就行：甲队共 100 棵，乙队共 80 棵。'},
    {t:'电影票数', n:'两个班人数不同',
     a:[{name:'甲班', days:4, trees:[30,28,32,30]}, {name:'乙班', days:3, trees:[25,27,28]}],
     ask:'哪个班的人看得更多？', ans:'<b>乙班</b>的人更多',
     why:'甲班 4 次共 120 张，乙班 3 次共 80 张——<b>次数不同，不能只比总数</b>。' +
          '要比<b>平均数</b>：甲班 120 ÷ 4 = <b>30</b>，乙班 80 ÷ 3 ≈ <b>26.7</b>，所以<b>甲班</b>平均每次看得更多。'}
  ];
  let ci = 0;
  /* 讲解用分级：0 只看数据 / 1 加总数 / 2 加平均数 */
  let phase = 2;
  function render(){
    const c = CASES[ci];
    stage.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.style.cssText = 'width:100%;text-align:center;font-size:15px;color:#20304a';
    const q = document.createElement('div');
    q.style.cssText = 'font-weight:800;font-size:17px;margin-bottom:6px';
    q.textContent = c.t + '：' + c.n;
    wrap.appendChild(q);
    const sub = document.createElement('div');
    sub.style.cssText = 'color:#4b5f7d;font-size:14px;margin-bottom:8px';
    sub.textContent = c.ask;
    wrap.appendChild(sub);
    stage.appendChild(wrap);
    /* 两组数据表 */
    const W = 640, H = 320;
    const svg = s('svg', {viewBox:`0 0 ${W} ${H}`, width:W, height:H});
    stage.appendChild(svg);
    const days = Math.max(...c.a.map(x => x.days));
    const rows = [];
    c.a.forEach(g => g.trees.forEach((v, i) => rows.push({g: g.name, d: i + 1, v: v})));
    /* 表格 */
    const rowH = 30, x0 = 120, colW = 90;
    label(svg, x0, 26, '次数', {size:13, weight:700, fill:'#4b5f7d'});
    c.a.forEach((g, gi) => label(svg, x0 + 90 + gi * colW, 26, g.name, {size:13, weight:700, fill:'#4b5f7d'}));
    for (let d = 1; d <= days; d++){
      const y = 26 + d * rowH;
      label(svg, x0, y, '第' + d + '次', {size:13, fill:'#4b5f7d'});
      c.a.forEach((g, gi) => {
        const v = g.trees[d - 1];
        s('rect', {x:x0 + 90 + gi*colW, y:y - 18, width:60, height:24, rx:5,
          fill: v === undefined ? '#f7f9fd' : '#e8f1ff', stroke:'#c9d4e4', 'stroke-width':1.2}, svg);
        label(svg, x0 + 120 + gi * colW, y, v === undefined ? '—' : String(v),
          {size:13.5, weight:700, fill:'#2f6fd0'});
      });
    }
    /* 结果 */
    const ry = 26 + (days + 1) * rowH + 6;
    c.a.forEach((g, gi) => {
      const tot = g.trees.reduce((a, b) => a + b, 0);
      const av = tot / g.trees.length;
      const bx = x0 + 90 + gi * colW;
      if (phase >= 1){
        s('rect', {x:bx, y:ry, width:60, height:26, rx:6, fill:'#fff2e2', stroke:'#f08a24', 'stroke-width':1.8}, svg);
        label(svg, bx + 30, ry + 18, '共' + tot, {size:12.5, weight:800, fill:'#b35c00'});
      }
      if (phase >= 2){
        s('rect', {x:bx, y:ry + 32, width:60, height:26, rx:6, fill:'#fdecec', stroke:'#d94a4a', 'stroke-width':1.8}, svg);
        label(svg, bx + 30, ry + 50, '均' + (Math.round(av * 10) / 10), {size:12.5, weight:800, fill:'#9b2f2f'});
      }
    });
    if (phase >= 1) label(svg, x0 - 14, ry + 18, '总数', {size:12.5, weight:700, fill:'#4b5f7d', anchor:'end'});
    if (phase >= 2) label(svg, x0 - 14, ry + 50, '平均数', {size:12.5, weight:700, fill:'#4b5f7d', anchor:'end'});
    if (phase === 0) label(svg, 320, ry + 30, '先看数据，别急着算', {size:14, weight:700, fill:'#8fa3bd'});
    note.innerHTML = `<b>${c.ask}</b>　${c.why}` +
      `<br><b>教学口径</b>：<b>人数（份数）相同，比总数；人数不同，比平均数</b>。` +
      `<br><b>为什么</b>：总数里混着"次数"的影响，只有<b>平均数</b>才能公平地比较。`;
  }
  document.querySelectorAll('[data-sc]').forEach(b => {
    b.addEventListener('click', () => { ci = +b.dataset.sc; render(); });
  });
  $('#btnApplyReset').addEventListener('click', () => { ci = 0; render(); });
  /* 讲解入口：set(例序号 0~1) */
  window.MOD = window.MOD || {};
  MOD.apply = { set(i, p){ ci = (i == null ? 0 : i); phase = (p == null ? 2 : p); render(); } };
  render();
})();

/* ==========================================================================
   ④ 平均数与复式条形统计图
   ========================================================================== */
(function initCmp(){
  const btn = $('#btnCmpStep'), all = $('#btnCmpAll'), rst = $('#btnCmpReset');
  const stage = $('#cmpStage'), note = $('#cmpNote'), stepsEl = $('#cmpSteps');
  const CATS = ['周一','周二','周三','周四','周五'];
  const A = [12, 15, 11, 14, 18], B = [10, 12, 11, 11, 11];
  const N = 5;
  let step = 0;
  function render(){
    const sumA = A.reduce((a,b)=>a+b,0), sumB = B.reduce((a,b)=>a+b,0);
    const avgA = sumA / A.length, avgB = sumB / B.length;
    stepsEl.innerHTML = ['① 读出两组数据','② 分别求总数','③ 分别求平均数','④ 画出①班平均线','⑤ 画出②班平均线并比较']
      .map((l,k) => `<div class="dot ${k < step ? 'done' : (k === step ? 'on' : '')}" title="${l}">${k+1}</div>`).join('');
    stage.innerHTML = '';
    const W = 640, H = 340;
    const svg = s('svg', {viewBox:`0 0 ${W} ${H}`, width:W, height:H});
    stage.appendChild(svg);
    barChart(svg, {w:W, h:H, title:'四（1）班与四（2）班每天课外阅读时间（分钟）',
      unit:2, maxV:20, yLabel:'分钟',
      cats:CATS, legend:true,
      series:[{name:'四（1）班', color:'#2f6fd0', data:A},
              {name:'四（2）班', color:'#f08a24', data:B}]});
    /* 平均线 */
    if (step >= 3){
      const pad = {l:56, r:20, t:34, b:52};
      const chartH = H - pad.t - pad.b;
      const top = 20;
      const yOf = v => pad.t + chartH - (v / top) * chartH;
      s('line', {x1:pad.l, y1:yOf(avgA), x2:W - pad.r, y2:yOf(avgA), stroke:'#1f9d6b',
        'stroke-width':2, 'stroke-dasharray':'7 4'}, svg);
      if (step >= 4){
        s('line', {x1:pad.l, y1:yOf(avgB), x2:W - pad.r, y2:yOf(avgB), stroke:'#d94a4a',
          'stroke-width':2, 'stroke-dasharray':'7 4'}, svg);
      }
    }
    /* 右侧算式 */
    const bx = 470;
    s('rect', {x:bx, y:60, width:158, height:210, rx:10, fill:'#f7f9fd', stroke:'#c9d4e4', 'stroke-width':1.4}, svg);
    label(svg, bx + 79, 82, '计算过程', {size:13, weight:800, fill:'#4b5f7d'});
    label(svg, bx + 14, 108, '①班总数：', {size:12, weight:700, fill:'#2f6fd0', anchor:'start'});
    label(svg, bx + 14, 128, String(sumA), {size:13, weight:800, fill:'#2f6fd0', anchor:'start'});
    label(svg, bx + 14, 150, '①班平均：', {size:12, weight:700, fill:'#2f6fd0', anchor:'start'});
    label(svg, bx + 14, 170, avgA + ' 分', {size:13, weight:800, fill:'#2f6fd0', anchor:'start'});
    label(svg, bx + 14, 196, '②班总数：', {size:12, weight:700, fill:'#b35c00', anchor:'start'});
    label(svg, bx + 14, 216, String(sumB), {size:13, weight:800, fill:'#b35c00', anchor:'start'});
    label(svg, bx + 14, 238, '②班平均：', {size:12, weight:700, fill:'#b35c00', anchor:'start'});
    label(svg, bx + 14, 258, avgB + ' 分', {size:13, weight:800, fill:'#b35c00', anchor:'start'});
    if (step === 0) note.innerHTML = `第 ① 步：从<b>复式条形统计图</b>里读出两组数据。` +
      `<br>四（1）班：${A.join('、')}；四（2）班：${B.join('、')}（单位：分钟）。`;
    else if (step === 1) note.innerHTML = `第 ② 步：<b>分别求两组的总数</b>。` +
      `<br>四（1）班：${A.join(' + ')} = <b>${sumA}</b>；四（2）班：${B.join(' + ')} = <b>${sumB}</b>。`;
    else if (step === 2) note.innerHTML = `第 ③ 步：<b>分别求平均数</b>。` +
      `<br>四（1）班：${sumA} ÷ ${A.length} = <b>${avgA}</b> 分；四（2）班：${sumB} ÷ ${B.length} = <b>${avgB}</b> 分。`;
    else if (step === 3) note.innerHTML = `第 ④ 步：先画四（1）班的<b>平均线</b>——${avgA} 分。` +
      `<br>平均线是一条水平线，代表这一组的<b>整体水平</b>。`;
    else note.innerHTML = `第 ⑤ 步：再画四（2）班的平均线——${avgB} 分。` +
      `<br><b>${avgA} &gt; ${avgB}</b>，所以<b>四（1）班平均每天课外阅读时间更长</b>。` +
      `<br><b>教学口径</b>：<b>先分别求出两组的总数和份数，再各自求平均数，最后比较</b>。` +
      `<br><b>注意</b>：不能只看某一天谁多，要看<b>整体水平</b>。`;
  }
  btn.addEventListener('click', () => { step = (step + 1) % N; render(); });
  all.addEventListener('click', () => { step = N - 1; render(); });
  rst.addEventListener('click', () => { step = 0; render(); });
  /* 讲解入口：set(步序 0~3) */
  window.MOD = window.MOD || {};
  MOD.cmp = { set(s){ step = (s == null ? 0 : s); render(); } };
  render();
})();

/* ==========================================================================
   ⑤ 综合实践：制定旅游计划
   ========================================================================== */
(function initTravel(){
  const sel = $('#trvSel'), btn = $('#btnTrvStep'), all = $('#btnTrvAll'), rst = $('#btnTrvReset');
  const stage = $('#trvStage'), note = $('#trvNote'), stepsEl = $('#trvSteps');
  const PLANS = [
    {name:'方案 A（高铁 + 宾馆）', ppl:30, days:3, nights:2,
     items:[{t:'往返交通（高铁）', per:180, unit:'人'}, {t:'住宿（宾馆）', per:120, unit:'人·晚'},
             {t:'门票', per:40, unit:'人'}, {t:'吃饭', per:60, unit:'人·天'},
             {t:'其他', per:20, unit:'人'}]},
    {name:'方案 B（火车 + 民宿）', ppl:30, days:3, nights:2,
     items:[{t:'往返交通（火车）', per:90, unit:'人'}, {t:'住宿（民宿）', per:75, unit:'人·晚'},
             {t:'门票', per:40, unit:'人'}, {t:'吃饭', per:50, unit:'人·天'},
             {t:'其他', per:20, unit:'人'}]}
  ];
  let ci = 0, step = 0;
  const N = 5;
  function calcTotal(p){
    /* 住宿按"人·晚"，吃饭按"人·天"，其余按"人" */
    let t = 0;
    p.items.forEach(it => {
      if (it.unit === '人·晚') t += it.per * p.nights * p.ppl;
      else if (it.unit === '人·天') t += it.per * p.days * p.ppl;
      else t += it.per * p.ppl;
    });
    return t;
  }
  function render(){
    const p = PLANS[ci];
    const total = calcTotal(p);
    const per = total / p.ppl;
    const perDay = per / p.days;
    stepsEl.innerHTML = ['① 搜集信息','② 确定人数与天数','③ 估算总费用','④ 算人均与日均','⑤ 评估并选定方案']
      .map((l,k) => `<div class="dot ${k < step ? 'done' : (k === step ? 'on' : '')}" title="${l}">${k+1}</div>`).join('');
    stage.innerHTML = '';
    const box = document.createElement('div');
    box.style.cssText = 'width:100%';
    /* 标题 */
    const t = document.createElement('div');
    t.style.cssText = 'text-align:center;font-weight:800;font-size:18px;color:#d94a4a;margin-bottom:8px';
    t.textContent = step >= 1
      ? p.name + '　（' + p.ppl + ' 人，' + p.days + ' 天 ' + p.nights + ' 晚）'
      : p.name;
    box.appendChild(t);
    /* 费用明细表 */
    const W = 640, H = 300;
    const svg = s('svg', {viewBox:`0 0 ${W} ${H}`, width:W, height:H});
    box.appendChild(svg);
    if (step === 0){
      label(svg, 320, 286, '① 先把要考虑的花费项目列全', {size:13.5, weight:700, fill:'#8a97a8'});
    } else if (step === 1){
      label(svg, 320, 286, '② 确定人数 ' + p.ppl + ' 人、' + p.days + ' 天 ' + p.nights + ' 晚',
        {size:13.5, weight:700, fill:'#5b6b80'});
    } else if (step === 2){
      label(svg, 320, 286, '③ 逐项相乘再相加，得总费用', {size:13.5, weight:700, fill:'#5b6b80'});
    } else if (step === 3){
      label(svg, 320, 286, '④ 总费用 ÷ 人数 = 人均（平均数）', {size:13.5, weight:700, fill:'#5b6b80'});
    } else {
      label(svg, 320, 286, '⑤ 人均一比，选出更合适的方案', {size:13.5, weight:700, fill:'#5b6b80'});
    }
    let y = 30;
    p.items.forEach(it => {
      const qty = it.unit === '人·晚' ? (p.ppl * p.nights)
                : it.unit === '人·天' ? (p.ppl * p.days) : p.ppl;
      const amt = it.per * qty;
      s('rect', {x:60, y:y - 18, width:470, height:26, rx:6, fill:'#f7f9fd', stroke:'#e3e9f2', 'stroke-width':1.2}, svg);
      label(svg, 74, y, it.t, {size:13.5, weight:700, fill:'#20304a', anchor:'start'});
      label(svg, 250, y, it.per + ' 元 / ' + it.unit, {size:12.5, fill:'#4b5f7d', anchor:'start'});
      label(svg, 470, y, '× ' + qty, {size:12.5, fill:'#4b5f7d', anchor:'end'});
      label(svg, 520, y, amt + ' 元', {size:13, weight:700, fill:'#2f6fd0', anchor:'end'});
      y += 32;
    });
    if (step >= 2){
      s('line', {x1:60, y1:y - 20, x2:530, y2:y - 20, stroke:'#20304a', 'stroke-width':1.8}, svg);
      label(svg, 74, y + 4, '合计', {size:14, weight:800, fill:'#20304a', anchor:'start'});
      label(svg, 520, y + 4, total + ' 元', {size:15, weight:800, fill:'#d94a4a', anchor:'end'});
    }
    if (step >= 3){
      s('rect', {x:60, y:y + 14, width:470, height:30, rx:7, fill:'#fdecec', stroke:'#d94a4a', 'stroke-width':1.6}, svg);
      label(svg, 74, y + 34, '人均 ' + per + ' 元；人均每天 ' + (Math.round(perDay * 100) / 100) + ' 元',
        {size:13.5, weight:800, fill:'#9b2f2f', anchor:'start'});
    }
    if (step >= 4){
      const other = PLANS[1 - ci];
      const op = calcTotal(other) / other.ppl;
      s('rect', {x:60, y:y + 54, width:470, height:30, rx:7, fill:'#e6f7ef', stroke:'#1f9d6b', 'stroke-width':1.6}, svg);
      label(svg, 74, y + 74,
        '两方案人均：本方案 ' + per + ' 元 ／ ' + other.name + ' ' + op + ' 元',
        {size:13, weight:800, fill:'#126b47', anchor:'start'});
    }
    stage.appendChild(box);
    if (step === 0) note.innerHTML = `第 ① 步：<b>搜集信息</b>——确定要考虑的花费项目：` +
      `<b>交通、住宿、门票、吃饭、其他</b>，并查出每项的单价。`;
    else if (step === 1) note.innerHTML = `第 ② 步：<b>确定人数与天数</b>——本方案 <b>${p.ppl} 人</b>，` +
      `<b>${p.days} 天 ${p.nights} 晚</b>。` +
      `<br>注意：<b>住宿按"人·晚"算，吃饭按"人·天"算</b>，所以要先算总份数。`;
    else if (step === 2) note.innerHTML = `第 ③ 步：<b>估算总费用</b>——逐项算钱再相加，得 <b>${total} 元</b>。`;
    else if (step === 3) note.innerHTML = `第 ④ 步：<b>算人均与日均</b>——` +
      `<b>${total} ÷ ${p.ppl} = ${per}</b> 元/人；<b>${per} ÷ ${p.days} = ${Math.round(perDay*100)/100}</b> 元/人·天。` +
      `<br><b>教学口径</b>：<b>用平均数能更公平地比较方案</b>（人均或人均每天花多少钱）。`;
    else {
      const other = PLANS[1 - ci];
      const otherTotal = calcTotal(other), otherPer = otherTotal / other.ppl;
      const better = per < otherPer ? 'A' : 'B';
      note.innerHTML = `第 ⑤ 步：<b>评估并选定方案</b>。` +
        `<br>本方案人均 <b>${per}</b> 元；${other.name} 人均 <b>${otherPer}</b> 元。` +
        `<br>所以<b>方案 ${better} 更省钱</b>。` +
        `<br><b>教学口径</b>：<b>评价一个方案不能只看总钱数，还要看人均（平均数），这样才公平</b>。`;
    }
  }
  /* 原实现只重置 step，没有把下拉框的选择同步给 ci，选方案 B 画面不换 —— 这里一并修掉 */
  sel.addEventListener('change', () => { ci = +sel.value; step = 0; render(); });
  btn.addEventListener('click', () => { step = (step + 1) % N; render(); });
  all.addEventListener('click', () => { step = N - 1; render(); });
  rst.addEventListener('click', () => { ci = 0; sel.value = '0'; step = 0; render(); });
  /* 讲解入口：set(方案 0~1, 步序 0~4) */
  window.MOD = window.MOD || {};
  MOD.travel = {
    set(i, s){ ci = (i == null ? 0 : i); sel.value = String(ci); step = (s == null ? 0 : s); render(); }
  };
  render();
})();

/* ==========================================================================
   分层练习数据
   ========================================================================== */
const BASIC_CHOICE = [
  {q:'三个班的植树棵数分别是 20、24、16 棵，平均每个班植树（　）棵。', opts:['18','20','21','24'], a:0,
   why:'(20 + 24 + 16) ÷ 3 = 60 ÷ 3 = 18（棵）。',
   hint:'回到动画 ② 求平均数，先求总数再除以份数。'},
  {q:'下面说法正确的是（　）。',
   opts:['平均数一定是这组数中的某一个数','平均数可能比最大的数还大',
         '平均数能代表一组数据的总体水平','求平均数就是把数按大小排队取中间的'], a:2,
   why:'平均数在最大值和最小值之间，可能不等于其中任何一个数；它是这组数据的"代表"。',
   hint:'回到动画 ① 和 ② 的"教学口径"提示。', point:'平均数的性质：一定在最大值与最小值**之间**（但不一定是其中某个数）', care:'总数相同但份数不同，平均数也不同；平均数不是“中间那个数”'},
  {q:'求平均数时，正确的做法是（　）。',
   opts:['把最大的数和最小的数相加除以 2','先求总数，再除以总份数',
         '把各部分的平均数相加','只看中间那个数'], a:1,
   why:'平均数 = 总数量 ÷ 总份数，必须先加出总数。',
   hint:'回到动画 ② 的"两步走"。'},
  {q:'某班 5 个小组的读书数量分别是 10、12、9、14、15 本，全班共读书（　）本。', opts:['60','12','11','13'], a:0,
   why:'10 + 12 + 9 + 14 + 15 = 60（本）。',
   hint:'回到动画 ② 第一步"先求总数"。'},
  {q:'甲、乙两班人数相同，甲班植树总数比乙班多，那么（　）。',
   opts:['甲班平均数一定比乙班大','甲班平均数一定比乙班小',
         '甲班平均数可能与乙班相等','无法确定'], a:0,
   why:'人数（份数）相同，总数多则平均数也多。',
   hint:'回到动画 ③ 平均数的应用。'},
  {q:'下面说法正确的是（　）。',
   opts:['两组人数不同时，比总数就能比出高低','两组人数不同时，必须比平均数',
         '求平均数时份数越少越准','平均数只能是整数'], a:1,
   why:'人数不同时总数里混着人数的影响，要比平均数才公平。',
   hint:'回到动画 ③ 的"教学口径"提示。', point:'平均数的性质：一定在最大值与最小值**之间**（但不一定是其中某个数）', care:'总数相同但份数不同，平均数也不同；平均数不是“中间那个数”'},
  {q:'5 个数的平均数是 20，这 5 个数的总和是（　）。', opts:['4','20','100','25'], a:2,
   why:'总和 = 平均数 × 份数 = 20 × 5 = 100。',
   hint:'回到动画 ②，平均数 = 总数量 ÷ 总份数，反过来乘回去即可。'},
  {q:'从复式条形统计图中比较两班每天的课外阅读时间，应该（　）。',
   opts:['只比某一天谁长','先分别求两组的总数和份数，再各自求平均数比较',
         '把两班的数据加在一起求平均数','只比哪一班的数据多'], a:1,
   why:'要比较整体水平，必须先分别求平均数再比较。',
   hint:'回到动画 ④ 平均数与复式条形统计图。'}
];

const BASIC_FILL = [
  {q:'20、24、16 三个数的平均数是（　）。', a:'18', why:'(20 + 24 + 16) ÷ 3 = 60 ÷ 3 = 18。'},
  {q:'平均数 = 总数量 ÷ 总（　）。', a:'份数', why:'平均数 = 总数量 ÷ 总份数。'},
  {q:'三个数的平均数是 15，它们的总和是（　）。', a:'45', why:'15 × 3 = 45。'},
  {q:'5 个数的平均数是 20，其中前 4 个数的和是 75，第 5 个数是（　）。', a:'25',
   why:'总和 = 20 × 5 = 100，100 − 75 = 25。'},
  {q:'10、12、9、14、15 五个数的平均数是（　）。', a:'12',
   why:'(10 + 12 + 9 + 14 + 15) ÷ 5 = 60 ÷ 5 = 12。'},
  {q:'某组 4 个数的平均数是 25，这组数的总和是（　）。', a:'100', why:'25 × 4 = 100。'}
];

const HAND_CHOICE = [
  {q:'小明 4 次跳绳成绩分别是 120、135、128、137 个，平均每次跳（　）个。',
   opts:['130','128','125','120'], a:0,
   why:'(120 + 135 + 128 + 137) ÷ 4 = 520 ÷ 4 = 130（个）。',
   hint:'回到动画 ②，先加出总数 520，再除以 4。'},
  {q:'甲队 5 人共植树 100 棵，乙队 8 人共植树 120 棵。平均每人植树多的是（　）。',
   opts:['甲队','乙队','一样多','无法比较'], a:0,
   why:'甲队 100 ÷ 5 = 20 棵/人，乙队 120 ÷ 8 = 15 棵/人，甲队多。',
   hint:'回到动画 ③，人数不同要比平均数。'},
  {q:'两个小组植树，每组都是 4 人，甲组植树棵数比乙组多 8 棵，那么甲组的平均数比乙组（　）。',
   opts:['多 8 棵','多 4 棵','多 2 棵','一样多'], a:2,
   why:'人数相同，总数差 8 棵，摊到每组的 4 个人头上，平均数就差 8 ÷ 4 = 2 棵。',
   hint:'回到动画 ① 移多补少：多的平均分给每组 1 个。'},
  {q:'从复式条形统计图中知道四（1）班 5 天共阅读 70 分钟，四（2）班 5 天共阅读 55 分钟，两班平均每天阅读时间（　）。',
   opts:['四（1）班多 3 分钟','四（1）班多 15 分钟','两班一样多','无法比较'], a:0,
   why:'四（1）班 70 ÷ 5 = 14 分，四（2）班 55 ÷ 5 = 11 分，差 3 分钟。',
   hint:'回到动画 ④，先分别求平均数再比较。'},
  {q:'某小组 6 人植树棵数是 3、5、4、6、5、7，平均每人植树（　）棵。', opts:['5','6','4.5','30'], a:0,
   why:'(3 + 5 + 4 + 6 + 5 + 7) ÷ 6 = 30 ÷ 6 = 5（棵）。',
   hint:'回到动画 ②，先求总数 30。'},
  {q:'两个班人数相同，甲班考试平均分 90 分，乙班平均分 85 分。下列说法正确的是（　）。',
   opts:['甲班总分一定比乙班多','甲班每个人成绩都比乙班好',
         '甲班整体水平高于乙班','两班总分一样'], a:2,
   why:'平均分反映整体水平，甲班整体水平高；但不能推出"每个人都好"或"总分差多少"。',
   hint:'回到动画 ③，平均数代表总体水平。'}
];

const HAND_FILL = [
  {q:'120、135、128、137 四个数的平均数是（　）。', a:'130',
   why:'(120 + 135 + 128 + 137) ÷ 4 = 520 ÷ 4 = 130。'},
  {q:'甲队 5 人共植树 100 棵，平均每人植树（　）棵。', a:'20', why:'100 ÷ 5 = 20（棵）。'},
  {q:'乙队 8 人共植树 120 棵，平均每人植树（　）棵。', a:'15', why:'120 ÷ 8 = 15（棵）。'},
  {q:'四（1）班 5 天共阅读 70 分钟，平均每天阅读（　）分钟。', a:'14', why:'70 ÷ 5 = 14（分钟）。'},
  {q:'3、5、4、6、5、7 六个数的平均数是（　）。', a:'5', why:'30 ÷ 6 = 5。'}
];

const EXT_CHOICE = [
  {q:'6 个数的平均数是 25，去掉一个数后，剩下的 5 个数的平均数是 24，去掉的数是（　）。',
   opts:['25','30','24','29'], a:1,
   why:'原来总和 25 × 6 = 150，去掉后 24 × 5 = 120，去掉的数 = 150 − 120 = 30。',
   hint:'回到动画 ②，先分别求两个总和再相减。', point:'平均数的**逆推**：先分别算两边的总和，再用总和相减', care:'原来总和 = 25 × 6 = 150，剩下总和 = 24 × 5 = 120，去掉的 = 150 − 120 = 30；份数别搞混', steps:['先求原来 6 个数的总和：25 × 6 = 150', '再求剩下 5 个数的总和：24 × 5 = 120', '去掉的数 = 150 − 120 = 30', '检验：24 × 5 + 30 = 150，150 ÷ 6 = 25 ✓']},
  {q:'六个数的平均数是 18，其中前两个数的平均数是 20，后四个数的平均数是（　）。', opts:['16','17','18','20'], a:1,
   why:'总和 = 18 × 6 = 108，前两个数的和 = 20 × 2 = 40，后四个数的和 = 108 − 40 = 68，平均 = 68 ÷ 4 = 17。',
   hint:'回到动画 ②，用"总数 = 平均数 × 份数"倒推。', point:'加权平均的逆推：总平均 × 总份数 = 各部分平均 × 各部分份数之和', care:'份数变了平均数就变；前 2 个是 20（偏高），后 4 个就要低于 18', steps:['六个数的总和：18 × 6 = 108', '前两个数的总和：20 × 2 = 40', '后四个数的总和：108 − 40 = 68', '后四个数的平均数：68 ÷ 4 = 17']},
  {q:'甲、乙两队比赛投篮，每队都投 10 次，甲队命中 6 次，乙队命中 5 次。下面说法正确的是（　）。',
   opts:['甲队每次都比乙队投得好','甲队平均成绩比乙队好','甲队总成绩比乙班好','无法比较'], a:1,
   why:'次数相同，比平均数：甲 6 ÷ 10 = 0.6，乙 5 ÷ 10 = 0.5，甲队平均命中率高。',
   hint:'回到动画 ③，次数相同比平均数。', point:'次数相同才能比平均数 —— 同一标准下才谈“谁好”', care:'“甲队每次都比乙队投得好”推不出来；要比的是命中率（平均数）'},
  {q:'四个同学跳绳成绩分别是 80、90、100、110，平均数是（　）。', opts:['90','95','100','105'], a:1,
   why:'(80 + 90 + 100 + 110) ÷ 4 = 380 ÷ 4 = 95。',
   hint:'回到动画 ②，先求总数 380。', point:'求平均数：先求总数，再除以份数', care:'总数 = 80 + 90 + 100 + 110 = 380，380 ÷ 4 = 95；等差数列时平均数 = 中间两数的平均'},
  {q:'下面说法正确的是（　）。',
   opts:['平均数一定在最大值和最小值之间','平均数总是等于中间的那个数',
         '两组数据只要总数相同，平均数就相同','求平均数时份数可以随便取'], a:0,
   why:'平均数一定不小于最小值、不大于最大值，但不一定等于中间数；总数相同但份数不同，平均数也不同。',
   hint:'回到动画 ② 的"注意"提示。', point:'平均数的性质：一定在最大值与最小值**之间**（但不一定是其中某个数）', care:'总数相同但份数不同，平均数也不同；平均数不是“中间那个数”'}
];

const EXT_FILL = [
  {q:'6 个数的平均数是 25，总和是（　）。', a:'150', why:'25 × 6 = 150。', point:'平均数 × 份数 = 总和', care:'25 × 6 = 150，别乘错份数'},
  {q:'6 个数的平均数是 18，总和是（　）。', a:'108', why:'18 × 6 = 108。', point:'平均数 × 份数 = 总和', care:'18 × 6 = 108'},
  {q:'四个同学跳绳成绩 80、90、100、110 的平均数是（　）。', a:'95', why:'380 ÷ 4 = 95。', point:'先求总数再除以份数', care:'80 + 90 + 100 + 110 = 380；380 ÷ 4 = 95'},
  {q:'甲队 5 人共植树 100 棵，乙队 8 人共植树 120 棵。平均每人植树多的是（　）队。', a:'甲',
   why:'甲 100 ÷ 5 = 20 棵/人，乙 120 ÷ 8 = 15 棵/人，甲队多。', point:'人数不同**不能比总数**，必须先求平均数再比', care:'甲 100 ÷ 5 = 20 棵/人，乙 120 ÷ 8 = 15 棵/人；虽然乙总数多，但甲平均多'},
  {q:'三个数的平均数是 15，如果把其中一个数增加 6，新的平均数是（　）。', a:'17',
   why:'总和增加 6，平均数增加 6 ÷ 3 = 2，15 + 2 = 17。', point:'平均数的变化量 = 变化量 ÷ 份数', care:'总数多了 6，份数还是 3，平均数多 6 ÷ 3 = 2，所以是 17'}
];

/* ==========================================================================
   第四档 · 五星挑战（浅奥思维）
   —— 平均数的"逆运算"、跨情境比较
   ========================================================================== */
const STAR5_CHOICE = [
  {q:'5 个数的平均数是 24，它们的总和是（　）。',
   opts:['4.8','19','120','100'], a:2,
   why:'总和 = 平均数 × 份数 = 24 × 5 = <b>120</b>。',
   hint:'回到动画 ② 求平均数：这是把"平均数 ÷ 份数"反过来乘。', point:'平均数 × 份数 = 总和', care:'24 × 5 = 120', steps:['总和 = 平均数 × 份数', '= 24 × 5', '= 120']},
  {q:'6 个数的平均数是 24，去掉其中一个数后，剩下 5 个数的平均数仍然是 24。去掉的数是（　）。',
   opts:['0','4','24','120'], a:2,
   why:'原来总和 = 24 × 6 = 144；剩下 5 个数总和 = 24 × 5 = 120；' +
       '去掉的数 = 144 − 120 = <b>24</b>。',
   hint:'回到动画 ② 求平均数：先分别算出"两个总和"，再相减。', point:'平均数不变 → 总数不变 → 去掉的数就是原平均数', care:'24 × 6 = 144，24 × 5 = 120，144 − 120 = 24；也可以想“总数没变，份数少了一个”', steps:['原来总和：24 × 6 = 144', '剩下总和：24 × 5 = 120', '去掉的数 = 144 − 120 = 24', '换个角度想：平均数没变，说明总数没变，所以去掉的数正好等于平均数 24']},
  {q:'3 个数的平均数是 15，把其中一个数增加 6，新的平均数是（　）。',
   opts:['16','17','18','21'], a:1,
   why:'原来总和 = 15 × 3 = 45；增加后总和 = 51；新平均数 = 51 ÷ 3 = <b>17</b>。' +
       '（也可以想：总数多了 6，分给 3 个数，每个数多 6 ÷ 3 = 2，15 + 2 = 17。）',
   hint:'回到动画 ② 求平均数：先算总和的变化，再除以份数。', point:'平均数变化量 = 变化量 ÷ 份数', care:'6 ÷ 3 = 2，15 + 2 = 17', steps:['总数增加了 6，份数仍是 3', '平均数增加 6 ÷ 3 = 2', '新平均数 = 15 + 2 = 17']},
  {q:'甲组 4 人平均 80 分，乙组 6 人平均 90 分。两组合在一起（10 人）的平均分是（　）。',
   opts:['84','85','86','87'], a:2,
   why:'甲组总分 = 80 × 4 = 320，乙组总分 = 90 × 6 = 540，' +
       '合计 860 人·分，平均分 = 860 ÷ 10 = <b>86 分</b>。' +
       '<b>注意</b>：不能直接把 80 和 90 平均，得 85——因为两组人数不一样多。',
   hint:'回到动画 ④ 平均数与复式条形统计图：先分别求总数和份数，再求平均数。', point:'合并平均数：先算**各组总分**，再除以总人数', care:'不能把 80 和 90 直接平均（人数不等，权重不同）；甲 320 分、乙 540 分，共 860 分 ÷ 10 人', steps:['甲组总分：80 × 4 = 320（分）', '乙组总分：90 × 6 = 540（分）', '两组合计总分：320 + 540 = 860（分），共 4 + 6 = 10 人', '平均分：860 ÷ 10 = 86（分）']},
  {q:'小明前 4 次考试平均 90 分。他想让 5 次考试的平均分达到 92 分，第 5 次要考（　）分。',
   opts:['92','95','100','110'], a:2,
   why:'5 次总分 = 92 × 5 = 460；前 4 次总分 = 90 × 4 = 360；' +
       '第 5 次 = 460 − 360 = <b>100 分</b>。',
   hint:'回到动画 ② 求平均数：先求"目标总分"，再减去已有的。', point:'**倒推**：先算出 5 次应有的总分，再减去已有的 4 次总分', care:'要 5 次平均 92 分，总分需 92 × 5 = 460，不是 92 × 4', steps:['5 次平均要 92 分，5 次总分应是：92 × 5 = 460（分）', '前 4 次总分：90 × 4 = 360（分）', '第 5 次 = 460 − 360 = 100（分）', '检验：(90 × 4 + 100) ÷ 5 = 460 ÷ 5 = 92 ✓']},
  {q:'两个小组植树，<b>人数相同</b>，甲组植树总数比乙组多 8 棵。甲组的平均每人植树棵数比乙组具体多几棵？（　）',
   opts:['多 8 棵','多 4 棵','一样多','无法确定'], a:3,
   why:'人数相同，甲组总数多 8 棵，所以甲组平均数<b>一定比乙组大</b>；' +
       '但题目没有给出每组人数，<b>具体多几棵无法确定</b>。' +
       '若每组 2 人就多 4 棵，每组 4 人就多 2 棵。',
   hint:'回到动画 ① 移多补少：多出来的 8 棵要平均分给每组的人，但每组几个人并不知道。', point:'平均数 = 总数 ÷ 份数；份数相同能判断谁大，但具体差值还要知道份数', care:'能确定“甲比乙多”，不能确定“具体多几棵”；差值是 8 ÷ 人数', steps:['平均每人差 = (甲总数 − 乙总数) ÷ 人数 = 8 ÷ 人数', '题目**没有说每组几个人**，这个除数不确定', '举例：每组 2 人就多 4 棵，每组 4 人就多 2 棵，每组 8 人就多 1 棵', '所以能确定甲组更大，但具体多几棵无法确定']}
];

const STAR5_FILL = [
  {q:'5 个数的平均数是 24，它们的总和是（　）。', a:'120', why:'24 × 5 = 120。', point:'平均数 × 份数 = 总和', care:'24 × 5 = 120', steps:['总和 = 平均数 × 份数', '= 24 × 5', '= 120']},
  {q:'6 个数的平均数是 24，去掉一个数后剩下 5 个数的平均数仍是 24，去掉的数是（　）。', a:'24',
   why:'24 × 6 = 144，24 × 5 = 120，144 − 120 = 24。', point:'平均数不变 → 总数不变 → 去掉的数 = 原平均数', care:'144 − 120 = 24', steps:['原来总和 24 × 6 = 144', '剩下总和 24 × 5 = 120', '去掉的数 = 144 − 120 = 24']},
  {q:'3 个数的平均数是 15，把其中一个数增加 6，新的平均数是（　）。', a:'17',
   why:'总和 45 + 6 = 51，51 ÷ 3 = 17。', point:'平均数变化量 = 变化量 ÷ 份数', care:'6 ÷ 3 = 2，15 + 2 = 17', steps:['总数增加了 6，份数仍是 3', '平均数增加 6 ÷ 3 = 2', '新平均数 = 15 + 2 = 17']},
  {q:'甲组 4 人平均 80 分，乙组 6 人平均 90 分，两组合起来的平均分是（　）。', a:'86',
   why:'(80 × 4 + 90 × 6) ÷ 10 = (320 + 540) ÷ 10 = 860 ÷ 10 = 86。', point:'合并平均数要**加权**（先算总分）', care:'不能直接 (80 + 90) ÷ 2', steps:['甲 80 × 4 = 320，乙 90 × 6 = 540', '总分 860，人数 10', '860 ÷ 10 = 86']},
  {q:'小明前 4 次考试平均 90 分，要让 5 次平均分达到 92 分，第 5 次要考（　）分。', a:'100',
   why:'92 × 5 = 460，90 × 4 = 360，460 − 360 = 100。', point:'倒推法：目标总分 − 已有总分', care:'目标总分是 92 × 5 = 460', steps:['目标总分 92 × 5 = 460', '已有总分 90 × 4 = 360', '第 5 次 = 460 − 360 = 100']},
  {q:'有 3 个数，它们的平均数是 20，其中一个数是 35，其余两个数的平均数是（　）。', a:'12.5',
   why:'总和 = 20 × 3 = 60；其余两数总和 = 60 − 35 = 25；平均数 = 25 ÷ 2 = 12.5。', point:'整体与局部的**逆向拆分**：先求总数，再减去已知数', care:'总数 = 20 × 3 = 60，60 − 35 = 25，25 ÷ 2 = 12.5；份数别搞错', steps:['三个数的总和：20 × 3 = 60', '其余两个数的和：60 − 35 = 25', '其余两个数的平均数：25 ÷ 2 = 12.5']}
];

/* 装配四档练习（巩固 / 动手 / 扩展 / 五星挑战） */
bootCourse([
  {key:'basic', title:'第一档 · 巩固基础（意义 · 求法 · 读统计图）', prefix:'基', star:3,
   choice:BASIC_CHOICE, fill:BASIC_FILL,
   host:'#basicBlock', score:'#scoreBasic', total:'#totalBasic', reset:'#btnResetBasic'},
  {key:'hand', title:'第二档 · 动手操作（移多补少 · 数据分析 · 方案选择）', prefix:'动', star:3,
   choice:HAND_CHOICE, fill:HAND_FILL,
   host:'#handBlock', score:'#scoreHand', total:'#totalHand', reset:'#btnResetHand'},
  {key:'ext', title:'第三档 · 扩展思维（多组比较 · 推理 · 易错辨析）', prefix:'拓', star:4,
   choice:EXT_CHOICE, fill:EXT_FILL,
   host:'#extBlock', score:'#scoreExt', total:'#totalExt', reset:'#btnResetExt'},
  {key:'star5', title:'第四档 · 五星挑战（浅奥思维）', prefix:'奥', star:5,
   choice:STAR5_CHOICE, fill:STAR5_FILL,
   host:'#star5Block', score:'#scoreStar5', total:'#totalStar5', reset:'#btnResetStar5'}
]);
