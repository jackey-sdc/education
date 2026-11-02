/* ==========================================================================
   第七单元 复习与关联 —— 交互模块

   每个模块在末尾暴露 MOD.xxx 控制器，给讲解脚本一个「绝对状态」入口。
   ========================================================================== */

window.MOD = window.MOD || {};

/* ==========================================================================
   ① 全册知识地图
   ========================================================================== */
(function initMap(){
  const MAP = [
    {t:'① 万以上数的认识', c:'#2f6fd0', items:['数位顺序表与计数单位','亿以内数的读写','亿以上数的读写','数的大小比较','改写与求近似数','综合实践：1亿有多大']},
    {t:'② 角的度量', c:'#f08a24', items:['线段·射线·直线','角的组成与分类','量角器的用法','画角','角的和差计算']},
    {t:'③ 多位数乘两位数', c:'#7a4fd6', items:['口算乘法','笔算乘法（两位数/三位数×两位数）','因数中间或末尾有0','积的变化规律','估算']},
    {t:'④ 加法模型和乘法模型', c:'#1f9d6b', items:['加法模型：总量与分量','单价·数量·总价','速度·时间·路程','模型辨析与综合应用']},
    {t:'⑤ 平行四边形和梯形', c:'#d94a4a', items:['平行与垂直','画垂线与点到直线的距离','平行四边形的认识','梯形的认识','四边形分类']},
    {t:'⑥ 条形统计图', c:'#0e8fa8', items:['单式条形统计图','复式条形统计图','数据的收集与整理','读图分析']},
    {t:'综合与实践', c:'#e0761f', items:['1亿有多大','寻找宝藏']},
    {t:'⑦ 复习与关联', c:'#6366f1', items:['整理复习','应用提升','数学广角：鸡兔同笼']}
  ];
  const stage = $('#mapStage'), note = $('#mapNote');
  /* hi：讲解时"现在讲哪一块"。亮起来的那块加粗边框，并在下方写一行标题，
     这样讲哪一块，屏幕上就看得出是哪一块。 */
  let hi = -1;
  function render(){
    stage.innerHTML = '';
    const grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:12px;width:100%';
    MAP.forEach((m, mi) => {
      const card = document.createElement('div');
      const on = mi === hi;
      card.style.cssText = `border:${on ? 3 : 2}px solid ${m.c};border-radius:12px;padding:12px 14px;` +
        `background:${on ? '#fff8ec' : '#fff'};cursor:pointer;${on ? 'box-shadow:0 0 0 5px rgba(240,138,36,.14)' : ''}`;
      const h = document.createElement('div');
      h.textContent = m.t;
      h.style.cssText = `color:${m.c};font-weight:800;font-size:15px;margin-bottom:6px`;
      card.appendChild(h);
      const ul = document.createElement('ul');
      ul.style.cssText = 'margin:0;padding-left:18px;font-size:13.5px;color:var(--ink2);line-height:1.8';
      m.items.forEach(i => { const li = document.createElement('li'); li.textContent = i; ul.appendChild(li); });
      card.appendChild(ul);
      card.addEventListener('click', () => {
        note.innerHTML = `<b>${m.t}</b>：共 ${m.items.length} 个知识点 —— ` + m.items.join('　·　');
      });
      grid.appendChild(card);
    });
    stage.appendChild(grid);
    if (hi >= 0 && MAP[hi]){
      const cap = document.createElement('div');
      cap.style.cssText = 'margin-top:10px;font-size:16px;font-weight:700;color:var(--orange);text-align:center';
      cap.textContent = `现在看：${MAP[hi].t} —— 共 ${MAP[hi].items.length} 个知识点`;
      stage.appendChild(cap);
    }
  }
  render();

  /* 讲解入口：set(第几块, -1 表示都不亮) */
  MOD.map = {
    set(i){ hi = (i == null ? -1 : i); render(); }
  };
})();

/* ==========================================================================
   ② 数与代数整理
   ========================================================================== */
(function initReviewNum(){
  const inp = $('#rvNum'), stage = $('#rvStage'), note = $('#rvNote'), steps = $('#rvSteps');
  let step = 0;
  const CN_D = ['零','一','二','三','四','五','六','七','八','九'], CN_U = ['','十','百','千'];
  function fourCN(n){
    const str = String(n); let out = '', zero = false;
    for (let i = 0; i < str.length; i++){
      const num = +str[i], pos = str.length - 1 - i;
      if (!num){ zero = true; continue; }
      if (zero && out) out += '零';
      zero = false;
      if (num === 1 && pos === 1 && i === 0) out += '十';
      else out += CN_D[num] + CN_U[pos];
    }
    return out;
  }
  function toCN(n){
    if (n === 0) return '零';
    const yi = Math.floor(n / 1e8), wan = Math.floor(n % 1e8 / 1e4), ge = n % 1e4;
    let s = '';
    if (yi) s += fourCN(yi) + '亿';
    if (wan){ if (yi && wan < 1000) s += '零'; s += fourCN(wan) + '万'; }
    if (ge){ if ((yi || wan) && ge < 1000) s += '零'; s += fourCN(ge); }
    return s;
  }
  function render(){
    const raw = inp.value.replace(/[^0-9]/g, '');
    stage.innerHTML = '';
    if (!raw){ note.innerHTML = '请输入一个数。'; return; }
    const n = +raw;
    const pad = (4 - raw.length % 4) % 4;
    const p = '0'.repeat(pad) + raw;
    const names = ['个级', '万级', '亿级', '千亿级'];
    const nG = p.length / 4;
    const groups = [];
    for (let i = 0; i < nG; i++) groups.push({t: names[nG - 1 - i] || ('第' + (i+1) + '级'), v: p.slice(i*4, i*4+4)});
    const box = document.createElement('div');
    box.style.cssText = 'text-align:center;font-size:22px;font-weight:800;line-height:2;font-variant-numeric:tabular-nums';
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;gap:20px;justify-content:center;flex-wrap:wrap';
    const C = {亿级:['var(--purple)','var(--purple-l)'], 万级:['var(--accent)','var(--accent-l)'], 个级:['var(--orange)','var(--orange-l)']};
    groups.forEach(g => {
      const col = document.createElement('div');
      const lv = document.createElement('div');
      lv.textContent = g.t; lv.style.cssText = 'font-size:13px;color:var(--ink2);font-weight:600';
      const num = document.createElement('div');
      const cc = C[g.t] || ['var(--ink)','transparent'];
      num.style.cssText = `font-size:30px;letter-spacing:2px;color:${cc[0]};background:${cc[1]};padding:2px 8px;border-radius:8px`;
      num.textContent = g.v;
      col.append(lv, num); row.appendChild(col);
    });
    box.appendChild(row);
    const detail = document.createElement('div');
    detail.style.cssText = 'font-size:17px;font-weight:600;margin-top:8px';
    if (step === 0) detail.innerHTML = `先<b>分级</b>：从右往左每四位一级。`;
    if (step === 1) detail.innerHTML = `再<b>读数</b>：${toCN(n)}`;
    if (step === 2){
      const canW = n % 10000 === 0, canY = n % 1e8 === 0;
      detail.innerHTML = `<b>改写</b>：` +
        (canW ? `${raw.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} = ${n/10000} 万` : '末四位不是 0，不能改写成用"万"作单位的数') +
        '；' + (canY ? `${raw.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} = ${n/1e8} 亿` : '不能改写成用"亿"作单位的数');
    }
    if (step >= 3){
      const wan = Math.floor(n / 10000), yi = Math.floor(n / 1e8);
      const decW = Math.floor(n / 1000) % 10, decY = Math.floor(n / 1e7) % 10;
      detail.innerHTML = `<b>求近似数</b>：省略万位后面的尾数 ≈ <b>${wan + (decW >= 5 ? 1 : 0)} 万</b>；` +
        `省略亿位后面的尾数 ≈ <b>${yi + (decY >= 5 ? 1 : 0)} 亿</b>`;
    }
    box.appendChild(detail);
    stage.appendChild(box);
    steps.innerHTML = ['①分级','②读数','③改写','④求近似数']
      .map((l, i) => `<div class="dot ${i < step ? 'done' : (i === step ? 'on' : '')}" title="${l}">${i+1}</div>`).join('');
    const msgs = [
      '<b>数位顺序表</b>从右往左是个位、十位……千亿位，相邻计数单位进率 10。',
      '读数：从最高级读起，<b>每级末尾的 0 不读</b>。',
      '<b>改写用等号</b>（大小不变）：只有整万数、整亿数才能改写。',
      '<b>求近似数用约等号</b>（大小变了）：省略万位看千位，省略亿位看千万位。'
    ];
    note.innerHTML = msgs[Math.min(step, msgs.length - 1)];
  }
  $('#btnRvStep').addEventListener('click', () => { step = (step + 1) % 4; render(); });
  $('#btnRvReset').addEventListener('click', () => { step = 0; inp.value = '48609230'; render(); });
  inp.addEventListener('input', () => { step = 0; render(); });
  render();

  /* 讲解入口：set(第几步, 数) —— 0 分级 / 1 读数 / 2 改写 / 3 求近似数 */
  MOD.rv = {
    set(s, num){ if (num != null) inp.value = String(num); step = s || 0; render(); }
  };
})();

/* ==========================================================================
   ③ 图形与几何整理
   ========================================================================== */
(function initGeo(){
  const stage = $('#geoStage'), note = $('#geoNote');
  /* cap：讲解时把"这一张图要看的那句话"写在图下面。
     三种图只有三个状态，不够讲六拍，靠这句话把状态区分开。 */
  let g = 0, cap = '';
  function render(){
    stage.innerHTML = '';
    const svg = s('svg', {viewBox:'0 0 480 260', width:480, height:260});
    stage.appendChild(svg);
    if (g === 0){
      /* 线段射线直线 */
      const rows = [['线段', 2], ['射线', 1], ['直线', 0]];
      rows.forEach((r, i) => {
        const y = 60 + i * 62, x0 = 150;
        s('line', {x1:x0, y1:y, x2:x0 + 150, y2:y, stroke:['#2f6fd0','#1f9d6b','#7a4fd6'][i], 'stroke-width':4, 'stroke-linecap':'round'}, svg);
        if (r[1] >= 1) s('circle', {cx:x0, cy:y, r:6, fill:'#20304a'}, svg);
        if (r[1] === 2) s('circle', {cx:x0+150, cy:y, r:6, fill:'#20304a'}, svg);
        if (r[1] === 0){
          const p = polar(x0+150, y, 14, 0);
          s('polygon', {points:`${x0+166},${y} ${p[0]},${p[1]-9} ${p[0]},${p[1]+9}`, fill:'#7a4fd6'}, svg);
          const q = polar(x0, y, 14, 180);
          s('polygon', {points:`${x0-16},${y} ${q[0]},${q[1]-9} ${q[0]},${q[1]+9}`, fill:'#7a4fd6'}, svg);
        }
        label(svg, 120, y + 6, r[0], {size:16, anchor:'end'});
      });
      /* 角 */
      drawAngle(svg, 372, 200, 0, 60, {r:84, color:'#f08a24', arcColor:'#f08a24', arcR:26, label:'60°'});
      label(svg, 372, 238, '角', {size:14, fill:'#4b5f7d'});
      note.innerHTML = '<b>线与角</b>：线段 2 个端点、射线 1 个、直线 0 个；角由<b>一个顶点和两条射线</b>组成，' +
        '量角用<b>量角器</b>（内圈 0 在右、外圈 0 在左；锐角读内圈、钝角读外圈）。';
    } else if (g === 1){
      /* 平行与垂直 */
      s('line', {x1:40, y1:70, x2:280, y2:70, stroke:'#2f6fd0', 'stroke-width':3.5}, svg);
      s('line', {x1:40, y1:130, x2:280, y2:130, stroke:'#1f9d6b', 'stroke-width':3.5}, svg);
      label(svg, 300, 74, '平行', {size:15, fill:'#2f6fd0', anchor:'start'});
      label(svg, 300, 134, '平行', {size:15, fill:'#1f9d6b', anchor:'start'});
      s('line', {x1:380, y1:50, x2:380, y2:200, stroke:'#d94a4a', 'stroke-width':3.5}, svg);
      s('line', {x1:300, y1:125, x2:460, y2:125, stroke:'#7a4fd6', 'stroke-width':3.5}, svg);
      s('path', {d:'M 380 109 L 396 109 L 396 125', fill:'none', stroke:'#20304a', 'stroke-width':1.6}, svg);
      label(svg, 300, 100, '互相垂直', {size:15, fill:'#d94a4a', anchor:'start'});
      note.innerHTML = '<b>平行与垂直</b>：同一平面内不相交的两条线互相平行；相交成直角的两条线互相垂直。' +
        '从直线外一点到这条直线所画的<b>垂线段最短</b>，它的长度叫点到直线的距离。';
    } else {
      const A = [60, 190], B = [230, 190], C = [280, 80], D = [110, 80];
      s('polygon', {points:`${A} ${B} ${C} ${D}`, fill:'rgba(217,74,74,.10)', stroke:'#d94a4a', 'stroke-width':3}, svg);
      const A2 = [60, 190], B2 = [200, 190], C2 = [240, 100], D2 = [100, 100];
      s('polygon', {points:`${A2} ${B2} ${C2} ${D2}`, fill:'rgba(122,79,214,.10)', stroke:'#7a4fd6', 'stroke-width':3}, svg);
      label(svg, 170, 230, '平行四边形', {size:15, fill:'#d94a4a'});
      label(svg, 150, 70, '梯形', {size:15, fill:'#7a4fd6'});
      note.innerHTML = '<b>平行四边形和梯形</b>：平行四边形两组对边分别平行且相等；梯形只有一组对边平行。' +
        '正方形是特殊的长方形，长方形是特殊的平行四边形。';
    }
    if (cap){
      const d = document.createElement('div');
      d.style.cssText = 'margin-top:8px;font-size:16.5px;font-weight:800;color:var(--orange);text-align:center';
      d.textContent = cap;
      stage.appendChild(d);
    }
  }
  document.querySelectorAll('button[data-g]').forEach(b => b.addEventListener('click', () => { g = +b.dataset.g; cap = ''; render(); }));
  render();

  /* 讲解入口：set(0 线与角 / 1 平行与垂直 / 2 平行四边形与梯形, 图下那句话) */
  MOD.geo = {
    set(i, c){ g = i || 0; cap = c || ''; render(); }
  };
})();

/* ==========================================================================
   ④ 统计整理
   ========================================================================== */
(function initStat(){
  const stage = $('#statStage'), note = $('#statNote');
  const CATS = ['足球', '篮球', '跳绳', '毽子'];
  const DATA = [26, 20, 18, 12];
  /* hi：讲解时"现在讲统计四步的哪一步"，让这一行在画面上亮起来 */
  let hi = -1;
  function render(){
    stage.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;gap:20px;align-items:center;flex-wrap:wrap;justify-content:center;width:100%';
    const svg = s('svg', {viewBox:'0 0 560 300', width:560, height:300});
    wrap.appendChild(svg);
    const cw = (560 - 76) / CATS.length, chartH = 300 - 34 - 52, top = 30;
    const yOf = v => 34 + chartH - (v / top) * chartH;
    label(svg, 280, 20, '四年级同学最喜欢的运动人数统计', {size:16, weight:800});
    for (let v = 0; v <= top; v += 5){
      s('line', {x1:56, y1:yOf(v), x2:540, y2:yOf(v), stroke: v === 0 ? '#8fa3bd' : '#eef2f8', 'stroke-width': v === 0 ? 1.6 : 1}, svg);
      haloText(svg, 46, yOf(v), String(v), null, {size:12, fill:'#4b5f7d', rot:false});
    }
    CATS.forEach((c, i) => {
      const x = 56 + cw * i + cw / 2 - 16;
      s('rect', {x, y:yOf(DATA[i]), width:32, height:34 + chartH - yOf(DATA[i]), rx:3, fill:'#0e8fa8'}, svg);
      haloText(svg, x + 16, yOf(DATA[i]) - 9, String(DATA[i]), null, {size:12.5, fill:'#0e8fa8', rot:false});
      haloText(svg, 56 + cw * i + cw / 2, 300 - 52 + 18, c, null, {size:13, rot:false});
    });
    /* 讲解推进时在图上加临时标注：画一条参考线 / 一个相差箭头，让每拍画面都不同 */
    if (hi === 2){
      s('line', {x1:56, y1:yOf(26), x2:540, y2:yOf(26), stroke:'#e8560f',
        'stroke-width':1.4, 'stroke-dasharray':'6 5'}, svg);
      haloText(svg, 300, yOf(26) - 10, '26 人 ≈ 5 格多一点', null,
        {size:12.5, fill:'#e8560f', rot:false});
      for (let k = 1; k <= 6; k++){
        s('line', {x1:60, y1:yOf(k * 5), x2:540, y2:yOf(k * 5), stroke:'#f7c9ad',
          'stroke-width':0.8, 'stroke-dasharray':'2 6'}, svg);
      }
    }
    if (hi === 3){
      s('line', {x1:524, y1:yOf(26), x2:524, y2:yOf(12), stroke:'#c2410c', 'stroke-width':1.6}, svg);
      s('line', {x1:518, y1:yOf(26), x2:530, y2:yOf(26), stroke:'#c2410c', 'stroke-width':1.6}, svg);
      s('line', {x1:518, y1:yOf(12), x2:530, y2:yOf(12), stroke:'#c2410c', 'stroke-width':1.6}, svg);
      haloText(svg, 500, (yOf(26) + yOf(12)) / 2, '差 14 人', null,
        {size:12.5, fill:'#c2410c', rot:false});
    }
    if (hi === 0){
      CATS.forEach((c, i) => {
        const cx = 56 + cw * i + cw / 2;
        haloText(svg, cx, yOf(DATA[i]) - 26, '✓', null, {size:14, fill:'#159957', rot:false});
      });
    }
    if (hi === 1){
      CATS.forEach((c, i) => {
        const cx = 56 + cw * i + cw / 2;
        s('rect', {x:cx - 22, y:34, width:44, height:18, rx:4, fill:'#eaf4ff',
          stroke:'#5b8def', 'stroke-width':1}, svg);
        haloText(svg, cx, 47, '已填', null, {size:11.5, fill:'#2b5fbf', rot:false});
      });
    }

    const flow = document.createElement('div');
    flow.style.cssText = 'text-align:left;font-size:16px;line-height:2.1';
    const STEP_TXT = [
      '① <b>收集</b>数据（问卷、举手、记录）',
      '② <b>整理</b>成统计表',
      '③ <b>画</b>条形统计图（单式 / 复式）',
      '④ <b>分析</b>并提出建议'
    ];
    flow.innerHTML = '<b>统计四步走</b><br>' + STEP_TXT.map((t, i) =>
      `<span style="display:inline-block;width:100%;padding:1px 6px;border-radius:8px;` +
      `${i === hi ? 'background:var(--orange-l);font-weight:800' : ''}">${t}</span>`).join('') +
      '<span style="color:var(--ink2);font-size:14px">本册重点：条形统计图的四要素、1 格代表几、直条宽窄与间隔。</span>';
    wrap.appendChild(flow);

    /* 当前这一拍的补充说明：一句一行，讲哪步写哪步 */
    const CAP = [
      '收集：一个一个数出来 —— 足球 26、篮球 20、跳绳 18、毽子 12。',
      '整理：把四个数填进统计表，类别与人数一一对应。',
      '画图：纵轴 0～30，1 格代表 5 人；26 人画到 5 格多一点。',
      '分析：足球最多 26 人，毽子最少 12 人，相差 14 人。'
    ];
    const cap = document.createElement('div');
    cap.style.cssText = 'width:100%;margin-top:10px;padding:10px 14px;border-radius:10px;' +
      'background:' + (hi >= 0 ? 'var(--orange-l)' : 'var(--bg2)') +
      ';color:var(--ink1);font-size:16.5px;font-weight:700;line-height:1.6';
    cap.textContent = hi >= 0 ? CAP[hi] : '四个数 → 一张表 → 一幅图 → 一句话结论。';
    wrap.appendChild(cap);
    stage.appendChild(wrap);
    note.innerHTML = '统计图的价值：<b>一眼看出多少</b>、<b>方便比较</b>、<b>帮助决策</b>。';
  }
  render();

  /* 讲解入口：set(0~3 对应统计四步，-1 都不亮) */
  MOD.stat = {
    set(i){ hi = (i == null ? -1 : i); render(); }
  };
})();

/* ==========================================================================
   ⑤ 数学广角：鸡兔同笼
   ========================================================================== */
(function initChicken(){
  const heads = $('#ckHeads'), feet = $('#ckFeet'), lab = $('#ckLabel'),
        stage = $('#ckStage'), note = $('#ckNote'), steps = $('#ckSteps');
  let step = 0;
  function render(){
    const h = +heads.value, f = +feet.value;
    const rabbit = (f - 2 * h) / 2, chicken = h - rabbit;
    const valid = rabbit >= 0 && Number.isInteger(rabbit) && chicken >= 0;
    lab.textContent = `${h} 个头 · ${f} 只脚`;
    stage.innerHTML = '';
    const box = document.createElement('div');
    box.style.cssText = 'text-align:center;font-size:20px;font-weight:700;line-height:2';
    const line = (t, c) => { const d = document.createElement('div'); d.innerHTML = t; if (c) d.style.color = c; box.appendChild(d); };
    if (step === 0){
      line(`笼子里有 ${h} 个头，${f} 只脚`, 'var(--ink)');
      line('想一想：鸡和兔各几只？', 'var(--ink2)');
    }
    if (step === 1){
      line('第 ① 步 <b>假设</b>：全是鸡', 'var(--accent)');
      line(`${h} 只鸡 → 脚数 = ${h} × 2 = <b>${2*h}</b> 只`, 'var(--accent)');
      line(`比实际少了 ${f - 2*h} 只脚`, 'var(--orange)');
    }
    if (step === 2){
      line('第 ② 步 <b>对比</b>：每把一只鸡换成兔子，脚就多 2 只', 'var(--accent)');
      line(`要补上 ${f - 2*h} 只脚，需要换 ${(f - 2*h)/2} 只`, 'var(--accent)');
    }
    if (step >= 3){
      if (valid){
        line(`兔有 <b>${rabbit}</b> 只，鸡有 <b>${chicken}</b> 只`, 'var(--green)');
        const icons = document.createElement('div');
        icons.style.cssText = 'font-size:24px;letter-spacing:2px;margin-top:6px';
        icons.textContent = '🐰'.repeat(rabbit) + '🐔'.repeat(chicken);
        box.appendChild(icons);
        line(`检验：${rabbit} × 4 + ${chicken} × 2 = ${rabbit*4 + chicken*2} = ${f} ✓`, 'var(--ink2)');
      } else {
        line('这组数据<b>不能</b>对应整数只鸡和兔（脚数必须是偶数，且不能少于 ' + (2*h) + ' 只）', 'var(--red)');
      }
    }
    stage.appendChild(box);
    steps.innerHTML = ['①读条件','②假设全鸡','③对比调整','④得出答案']
      .map((l, i) => `<div class="dot ${i < step ? 'done' : (i === step ? 'on' : '')}" title="${l}">${i+1}</div>`).join('');
    const msgs = [
      '鸡兔同笼的<b>关键</b>：鸡有 2 只脚，兔有 4 只脚，每换一只，脚就多 2 只。',
      '第一步：<b>假设全是鸡</b>，算出脚的总数。',
      '第二步：<b>对比</b>实际的脚数，求出差；用差 ÷ 2 求出要换多少只兔。',
      '第三步：<b>检验</b>——兔 × 4 + 鸡 × 2 要等于实际的脚数。'
    ];
    note.innerHTML = msgs[Math.min(step, msgs.length - 1)];
  }
  heads.addEventListener('input', () => { step = 0; render(); });
  feet.addEventListener('input', () => { step = 0; render(); });
  $('#btnCkStep').addEventListener('click', () => { step = (step + 1) % 4; render(); });
  $('#btnCkReset').addEventListener('click', () => { step = 0; heads.value = 8; feet.value = 26; render(); });
  render();

  /* 讲解入口：set(头数, 脚数, 第几步) —— 0 读条件 / 1 假设 / 2 对比 / 3 答案 */
  MOD.ck = {
    set(h, f, s){ if (h != null) heads.value = h; if (f != null) feet.value = f; step = s || 0; render(); }
  };
})();

/* ==========================================================================
   ⑥ 综合实践：寻找宝藏
   ========================================================================== */
(function initTreasure(){
  const stage = $('#trStage'), note = $('#trNote'), steps = $('#trSteps');
  const ROUTES = [
    {name:'路线 A', cmds:[['东',3],['北',2],['西',4],['南',1]]},
    {name:'路线 B', cmds:[['南',2],['东',3],['北',5],['西',2]]}
  ];
  let route = 0, pos = 0;
  const N = 8, CELL = 52;
  function render(){
    stage.innerHTML = '';
    const svg = s('svg', {viewBox:`0 0 ${N*CELL+40} ${N*CELL+40}`, width:N*CELL+40, height:N*CELL+40});
    stage.appendChild(svg);
    const OX = 20, OY = 20;
    /* 网格 */
    for (let i = 0; i <= N; i++){
      s('line', {x1:OX + i*CELL, y1:OY, x2:OX + i*CELL, y2:OY + N*CELL, stroke:'#e3e9f2', 'stroke-width':1}, svg);
      s('line', {x1:OX, y1:OY + i*CELL, x2:OX + N*CELL, y2:OY + i*CELL, stroke:'#e3e9f2', 'stroke-width':1}, svg);
    }
    label(svg, OX + N*CELL/2, OY - 4, '北', {size:13, fill:'#4b5f7d'});
    label(svg, OX - 12, OY + N*CELL/2, '西', {size:13, fill:'#4b5f7d'});
    /* 起点 */
    const start = [1, N - 1];
    s('circle', {cx:OX + (start[0] + .5)*CELL, cy:OY + (start[1] + .5)*CELL, r:9, fill:'#0e8fa8'}, svg);
    label(svg, OX + (start[0] + .5)*CELL, OY + (start[1] + .5)*CELL + 24, '起点', {size:12, fill:'#0e8fa8'});
    /* 走过的路径 */
    let x = start[0], y = start[1];
    const pts = [[x + .5, y + .5]];
    for (let i = 0; i < pos; i++){
      const [d, n] = ROUTES[route].cmds[i];
      if (d === '东') x += n; else if (d === '西') x -= n;
      else if (d === '北') y -= n; else y += n;
      pts.push([x + .5, y + .5]);
    }
    s('polyline', {points: pts.map(p => `${OX + p[0]*CELL},${OY + p[1]*CELL}`).join(' '),
      fill:'none', stroke:'#f08a24', 'stroke-width':3, 'stroke-linejoin':'round', 'stroke-linecap':'round'}, svg);
    /* 当前点 */
    const cx = OX + (x + .5)*CELL, cy = OY + (y + .5)*CELL;
    s('circle', {cx, cy, r:11, fill:'#f08a24'}, svg);
    label(svg, cx, cy + 26, '探险家', {size:12, fill:'#b35c00'});
    /* 宝藏 */
    if (pos >= ROUTES[route].cmds.length){
      s('rect', {x:cx - 12, y:cy - 12, width:24, height:24, rx:4, fill:'#f5c542', stroke:'#b8891b', 'stroke-width':2}, svg);
      label(svg, cx, cy - 20, '💰 宝藏', {size:13, fill:'#b8891b'});
    }
    /* 指令列表 */
    const list = document.createElement('div');
    list.style.cssText = 'margin-top:10px;font-size:16px;text-align:left;display:inline-block';
    list.innerHTML = `<b>${ROUTES[route].name}的指令</b>：<br>` + ROUTES[route].cmds.map((c, i) =>
      `<span style="color:${i < pos ? 'var(--green)' : (i === pos ? 'var(--accent)' : 'var(--ink2)')};font-weight:${i === pos ? 800 : 600}">` +
      `${i+1}. 向${c[0]}走 ${c[1]} 格${i < pos ? ' ✓' : ''}</span>`).join('<br>');
    stage.appendChild(list);
    steps.innerHTML = ROUTES[route].cmds.map((c, i) =>
      `<div class="dot ${i < pos ? 'done' : (i === pos ? 'on' : '')}">${i+1}</div>`).join('');
    if (pos >= ROUTES[route].cmds.length){
      const [dx, dy] = [x - start[0], y - start[1]];
      const dirTxt = dy < 0 ? `北 ${-dy} 格` : dy > 0 ? `南 ${dy} 格` : '';
      const dirTxt2 = dx > 0 ? `东 ${dx} 格` : dx < 0 ? `西 ${-dx} 格` : '';
      note.innerHTML = `宝藏就在起点往${[dirTxt, dirTxt2].filter(Boolean).join('、')}的方向上。` +
        `<b>用"方向 + 格数"描述位置，别人就一定能找到</b>。`;
    } else {
      note.innerHTML = '按指令一步一步走，注意<b>每一步的方向和格数</b>，别走错方向。';
    }
  }
  $('#btnTrStep').addEventListener('click', () => {
    if (pos < ROUTES[route].cmds.length) pos++;
    else { pos = 0; route = (route + 1) % ROUTES.length; }
    render();
  });
  $('#btnTrAll').addEventListener('click', () => { pos = ROUTES[route].cmds.length; render(); });
  $('#btnTrReset').addEventListener('click', () => { pos = 0; route = 0; render(); });
  render();

  /* 讲解入口：set(第几条路线, 走到第几步) */
  MOD.tr = {
    set(r, p){ if (r != null) route = r; pos = p || 0; render(); }
  };
})();

/* ==========================================================================
   分层练习数据
   ========================================================================== */
const BASIC_CHOICE = [
  {q:'最大的六位数与最小的七位数相差（　）。', opts:['1','9','99','999999'], a:0,
   why:'999999 与 1000000 相差 1。'},
  {q:'用 3、0、0、5、0、0、0 组成一个最大的七位数是（　）。',
   opts:['3500000','5300000','3050000','3000500'], a:0,
   why:'把大数字放高位：3 5 0 0 0 0 0 = 3500000。'},
  {q:'把 396000 改写成用"万"作单位的数是（　）。',
   opts:['39.6 万','396 万','39 万','约 40 万'], a:0,
   why:'396000 ÷ 10000 = 39.6，所以 396000 = 39.6 万。'},
  {q:'一个角是 135°，它是（　）。', opts:['锐角','直角','钝角','平角'], a:2,
   why:'大于 90° 小于 180° 是钝角。'},
  {q:'480 × 25 的积是（　）。', opts:['1200','12000','120000','9600'], a:1,
   why:'48 × 25 = 1200，再添两个 0 → 12000（480 × 25 = 48 × 25 × 100）。'},
  {q:'下面说法正确的是（　）。',
   opts:['垂直的两条直线一定相交','两条直线不相交就一定垂直',
         '平行四边形的对边一定相等','梯形有两组对边平行'], a:0,
   why:'垂直一定相交；不相交是平行；梯形只有一组对边平行。', point:'角的辨析：周角最大但仍是角；平角 = 2 个直角', care:'角的大小与边画多长**无关**；一个周角正好分成两个平角'}
];

const BASIC_FILL = [
  {q:'一个数最高位是千亿位，它是（　）位数。', a:'12', why:'千亿位是从右数第 12 位。'},
  {q:'省略万位后面的尾数：864000 ≈ （　）万。', a:'86', why:'看千位是 0，不满 5 舍去。'},
  {q:'省略万位后面的尾数：865000 ≈ （　）万。', a:'87', why:'看千位是 5，满 5 进 1。'},
  {q:'12 × 25 =（　），所以 120 × 25 =（　）。', a:['300','3000'],
   why:'一个因数乘 10，积也乘 10。'},
  {q:'一个平角被分成两个角，一个是 95°，另一个是（　）°。', a:'85', why:'180 − 95 = 85。'},
  {q:'平行四边形有（　）组对边平行且相等。', a:'2', why:'两组。'},
  {q:'只买 3 个 25 元的本子，付出 100 元，应找回（　）元。', a:'25', why:'25 × 3 = 75，100 − 75 = 25。'},
  {q:'一辆车 5 小时行 300 千米，速度是（　）千米/时。', a:'60', why:'300 ÷ 5 = 60。'}
];

const HAND_CHOICE = [
  {q:'鸡兔同笼，共有 20 个头、56 只脚，兔有（　）只。',
   opts:['6','8','10','12'], a:1,
   why:'假设全是鸡：20 × 2 = 40 只脚，少 16 只；16 ÷ 2 = 8 只兔。'},
  {q:'下面的说法中，正确的是（　）。',
   opts:['从直线外一点到直线可以画无数条垂线','从直线外一点到直线只能画一条垂线',
         '点到直线的距离就是点到直线的线段长','平行线之间的距离不相等'], a:1,
   why:'过一点与已知直线垂直的直线只有一条。'},
  {q:'一个平行四边形的周长是 40 厘米，一条边长 7 厘米，相邻的边长是（　）厘米。',
   opts:['13','20','26','33'], a:0, why:'40 ÷ 2 = 20 = 7 + 相邻边，相邻边 = 13。'}
];

const HAND_FILL = [
  {q:'笼子里有鸡和兔共 10 只，脚共 28 只，兔有（　）只。', a:'4',
   why:'假设全是鸡：10 × 2 = 20 只脚，少 8 只，8 ÷ 2 = 4 只兔。'},
  {q:'用方向和格数描述位置："从学校出发，先向北走 3 格，再向东走 2 格"，一共走了（　）格。',
   a:'5', why:'3 + 2 = 5 格。'},
  {q:'条形统计图中，1 格代表 8 人，某直条高 5 格，表示（　）人。', a:'40', why:'5 × 8 = 40。'},
  {q:'一根绳子长 24 米，剪成每段 6 米，可以剪成（　）段。', a:'4', why:'24 ÷ 6 = 4。'},
  {q:'一个梯形的上底 6 厘米、下底 10 厘米、高 4 厘米，面积是（　）平方厘米。',
   a:'32', why:'(6 + 10) × 4 ÷ 2 = 32。'},
  {q:'把 1200 缩小到原来的百分之一是（　）。', a:'12', why:'1200 ÷ 100 = 12。'}
];

const EXT_CHOICE = [
  {q:'鸡兔同笼共有 35 个头、94 只脚，鸡有（　）只。',
   opts:['12','23','24','30'], a:1,
   why:'假设全是鸡：35 × 2 = 70，少 24 只脚，24 ÷ 2 = 12 只兔，鸡 35 − 12 = 23。', point:'**假设法**：先假设全是鸡，算出脚的总数，再看差多少只脚', care:'假设全是鸡：35 × 2 = 70 只脚，实际 94 只，多 24 只；每换一只兔多 2 只脚，所以兔 12 只、鸡 35 − 12 = 23 只', steps:['假设 35 只全是鸡：脚数 = 35 × 2 = 70（只）', '实际有 94 只脚，比假设多 94 − 70 = 24（只）', '每把 1 只鸡换成 1 只兔，脚就多 4 − 2 = 2（只）', '兔的只数：24 ÷ 2 = 12（只）', '鸡的只数：35 − 12 = 23（只）']},
  {q:'一个数近似到万位是 8 万，这个数最大是（　）。',
   opts:['74999','79999','84999','80000'], a:2,
   why:'四舍五入到万位得 8 万，这个数的范围是 75000 ~ 84999，最大是 84999。', point:'四舍五入的逆向：最大取 84999', care:'千位最多取 4，后面三位都取 9；到 85000 就会近似成 9 万'},
  {q:'下面说法正确的是（　）。',
   opts:['周角是最大的角','平角比直角大，所以平角是特殊直角',
         '角的大小与边画多长有关','一个周角可以分成两个平角'], a:3,
   why:'周角 360° 是最大的角，但比周角大的角在本单元不研究；平角 = 2 个直角，但不是直角。', point:'角的辨析：周角最大但仍是角；平角 = 2 个直角', care:'角的大小与边画多长**无关**；一个周角正好分成两个平角'},
  {q:'两个完全一样的梯形可以拼成一个平行四边形，这是利用了（　）。',
   opts:['平行四边形的对称性','平移与旋转','三角形的稳定性','周角是 360°'], a:1,
   why:'拼图题的本质是平移、旋转、轴对称等图形的运动。', point:'图形的**平移与旋转**：平移不改变形状和大小', care:'完全一样的图形才能这样拼；靠的是平移（和旋转），不是对称性'}
];

const EXT_FILL = [
  {q:'笼子里鸡兔共 20 只，共有 54 只脚，鸡比兔多（　）只。', a:'6',
   why:'假设全是鸡：20 × 2 = 40 只脚，少 14 只；14 ÷ 2 = 7 只兔，鸡 13 只，13 − 7 = 6（只）。', point:'**假设法 + 列方程式的思路**：先求鸡兔各几只', care:'假设全是鸡：20 × 2 = 40 只脚，实际 54 只，多 14 只；兔 = 14 ÷ 2 = 7 只，鸡 = 13 只，鸡比兔多 13 − 7 = 6 只', steps:['假设 20 只全是鸡：脚数 = 20 × 2 = 40（只）', '实际 54 只脚，多出 54 − 40 = 14（只）', '每把 1 只鸡换成 1 只兔多 2 只脚 → 兔 = 14 ÷ 2 = 7（只）', '鸡 = 20 − 7 = 13（只）', '鸡比兔多：13 − 7 = 6（只）']},
  {q:'一个数省略万位后面的尾数约是 6 万，这个数最大是（　）。', a:'64999',
   why:'约 6 万的数范围 55000 ~ 64999。', point:'四舍五入的逆向', care:'最大取 64999（千位上是 4）'},
  {q:'商店运来 8 箱苹果，每箱 35 千克，卖出 126 千克后还剩（　）千克。', a:'154',
   why:'35 × 8 = 280，280 − 126 = 154。', point:'先求总数，再减', care:'8 × 35 = 280，280 − 126 = 154'},
  {q:'一个平行四边形的底扩大到原来的 2 倍，高缩小到原来的 1/2，面积（　）（填"不变"）。',
   a:'不变', why:'2 × 1/2 = 1，面积不变。', point:'面积 = 底 × 高，两变化相乘', care:'2 × 1/2 = 1，面积**不变**'},
  {q:'用 1、2、3、4、5 五个数字组成一个最大的五位数（　）。', a:'54321',
   why:'大的数字放高位。', point:'组数最大：**大的数放高位**，从高位到低位降序排列', care:'54321；最高位不能是 0，但这里没有 0'},
  {q:'一个长方形长 15 厘米、宽 8 厘米，把长缩短到 12 厘米后，面积是（　）平方厘米。',
   a:'96', why:'12 × 8 = 96。', point:'面积 = 长 × 宽，长变了要**用新的长**', care:'12 × 8 = 96；别还用 15 × 8 = 120'}
];

const STAR5_CHOICE = [
  {q:'鸡兔同笼，共有 24 个头、68 只脚，兔有（　）只。', opts:['10 只', '14 只', '12 只', '8 只'], a:0,
   why:'<b>假设法</b>：先假设 24 只全是鸡，脚数 = 24 × 2 = 48（只）。' +
       '实际 68 只脚，比假设多 68 − 48 = 20（只）。' +
       '每把 1 只鸡换成 1 只兔，脚就多 4 − 2 = 2（只）。' +
       '兔的只数 = 20 ÷ 2 = <b>10</b>（只）。',
   point:'**假设法**：先假设全是鸡，比出脚的差，再看每换一只多几只脚',
   care:'鸡 2 只脚、兔 4 只脚，每换 1 只多 **2** 只脚',
   steps:['假设 24 只全是鸡：脚 = 24 × 2 = 48（只）', '实际 68 只，多 68 − 48 = 20（只）', '每换 1 只兔多 2 只脚 → 兔 = 20 ÷ 2 = 10（只）']},
  {q:'笼子里有鸡和兔共 30 只，脚 88 只。把其中 8 只鸡换成 8 只兔，脚数会（　）。', opts:['增加 16 只', '减少 16 只', '不变', '增加 8 只'], a:0,
   why:'每把 1 只鸡换成 1 只兔，脚数就多 4 − 2 = 2（只）。' +
       '换 8 只，脚数就多 2 × 8 = <b>16</b>（只）。',
   point:'**只算变化量**：不用求出鸡兔各多少',
   care:'每换 1 只，脚数多 4 − 2 = 2 只',
   steps:['每把 1 只鸡换成 1 只兔，脚多 2 只', '换 8 只，脚多 2 × 8 = 16（只）']},
  {q:'一个数除以 15 余 3，这个数除以 5 的余数是（　）。', opts:['3', '2', '0', '1'], a:0,
   why:'这个数 = 15 × 商 + 3，而 15 是 5 的倍数。' +
       '所以这个数除以 5，余数就等于它除以 15 的余数 <b>3</b>。' +
       '（如 48 ÷ 15 = 3……3，48 ÷ 5 = 9……3 ✓）',
   point:'15 是 5 的倍数，余数不变',
   care:'如 48：48 ÷ 15 = 3……3，48 ÷ 5 = 9……3',
   steps:['这个数 = 15 × 商 + 3', '除以 5 的余数仍是 3']},
  {q:'下面各数中，与 60 万最接近的是（　）。', opts:['599999', '590000', '610000', '500000'], a:0,
   why:'60 万 = 600000。' +
       '599999 与 600000 只差 <b>1</b>，最近。' +
       '590000 差 10000，610000 差 10000，都远得多。',
   point:'比较与一个数的**接近程度**：先看差多少',
   care:'60 万 = 600000，599999 与它只差 1',
   steps:['60 万 = 600000', '599999 与 600000 相差 1，最接近', '590000、610000 都差 10000']},
  {q:'一个长方形的长是 25 厘米，宽是 12 厘米，把它拉成一个平行四边形（长和宽不变），它的面积（　）。', opts:['一定还是 300 平方厘米', '一定小于 300 平方厘米', '一定大于 300 平方厘米', '可能是 300 平方厘米'], a:1,
   why:'长方形拉成平行四边形后，周长不变，但平行四边形的高小于长方形的宽 12 厘米，' +
       '所以面积一定小于原来的 25 × 12 = <b>300</b>（cm²）。',
   point:'长方形拉成平行四边形：周长不变，面积变小',
   care:'底仍是 25 厘米，但高小于 12 厘米，不能继续用 25 × 12 算面积',
   steps:['原长方形面积 = 25 × 12 = 300（cm²）', '拉斜后底仍是 25 厘米，但高小于 12 厘米', '所以面积一定小于 300 平方厘米']},
  {q:'下面说法<b>错误</b>的是（　）。', opts:['周角是最大的角', '平角比直角大', '角的大小与边画多长有关', '一个周角可以分成两个平角'], a:2,
   why:'C 错：角的大小只与两条边<b>张开的程度</b>有关，与边画多长无关。' +
       'A、B、D 都是本册的正确结论。',
   point:'辨析角的概念：大小只与**张口程度**有关',
   care:'边画多长与角的大小**无关**',
   steps:['C 错：角的大小与边画多长无关，只与张口程度有关', 'A、B、D 都正确']},
];

const STAR5_FILL = [
  {q:'鸡兔同笼，共有 35 个头、94 只脚，兔有（　）只。', a:'12',
   why:'假设全是鸡：35 × 2 = 70（只）脚。' +
       '实际多 94 − 70 = 24（只）脚。' +
       '每换 1 只多 2 只脚 → 兔 = 24 ÷ 2 = <b>12</b>（只）。',
   point:'假设法',
   care:'每换 1 只多 2 只脚',
   steps:['假设全是鸡：35 × 2 = 70（只）脚', '多 94 − 70 = 24（只）', '兔 = 24 ÷ 2 = 12（只）']},
  {q:'一个数近似到万位是 8 万，这个数最小是（　）。', a:'75000',
   why:'近似数是 8 万 → 千位上的数必须 ≥ 5（要向万位进位）' +
       '要最小，取千位刚好是 5、后面全取 0 的数：<b>75000</b>' +
       '检验：75000 近似到万位 → 8 万 ✓',
   point:'四舍五入逆向：千位必须 ≥ 5，最小取 75000',
   care:'70000 只能近似成 7 万；最小是千位刚好为 5 的 75000',
   steps:['近似数是 8 万 → 这个数在 75000 ~ 84999 之间', '取下界 75000', '检验：75000 近似到万位 → 8 万 ✓']},
  {q:'鸡兔同笼共 20 只、54 只脚，兔比鸡少（　）只。', a:'6',
   why:'假设全是鸡：20 × 2 = 40（只）脚，多 54 − 40 = 14（只）。' +
       '兔 = 14 ÷ 2 = 7（只），鸡 = 20 − 7 = 13（只）。' +
       '兔比鸡少：13 − 7 = <b>6</b>（只）。',
   point:'假设法：先求鸡兔各多少，再比',
   care:'假设全是鸡时脚少 54 − 40 = 14，兔 = 14 ÷ 2 = 7',
   steps:['假设全是鸡：20 × 2 = 40（只）脚', '多 54 − 40 = 14（只）', '兔 = 14 ÷ 2 = 7（只），鸡 = 13（只）', '兔比鸡少 13 − 7 = 6（只）']},
  {q:'一个数除以 15 余 3，这个数除以 3 的余数是（　）。', a:'0',
   why:'这个数 = 15 × 商 + 3，而 15 是 3 的倍数，所以这个数除以 3 <b>正好除尽</b>，余数是 <b>0</b>。',
   point:'15 是 3 的倍数，所以这个数除以 3 能整除，余数是 0',
   care:'如 48：48 ÷ 15 = 3……3，48 ÷ 3 = 16 正好除尽',
   steps:['这个数 = 15 × 商 + 3', '15 是 3 的倍数，3 也是 3 的倍数', '所以这个数 = 3 × (5 × 商 + 1)，除以 3 正好除尽，余数是 0']},
  {q:'下面各数中，最接近 10 万且比 10 万小的是（　）。', a:'99999',
   why:'10 万 = 100000，比它小的数里最大的就是 99999，差 <b>1</b>。',
   point:'在限制条件下找最接近的数',
   care:'题目限定"比 10 万小"，所以只能取 99999',
   steps:['10 万 = 100000', '比它小且最接近的数是 99999（差 1）']},
  {q:'一组数据 12、15、18、15、20 的平均数是（　）。', a:'16',
   why:'总和 = 12 + 15 + 18 + 15 + 20 = 80。' +
       '平均数 = 80 ÷ 5 = <b>16</b>。',
   point:'总和 ÷ 份数',
   care:'份数是 5',
   steps:['总和 = 80', '80 ÷ 5 = 16']},
];

bootCourse([
  {key:'basic', star:3, title:'第一档 · 巩固基础（全册基础知识点过关）', prefix:'基',
   choice:BASIC_CHOICE, fill:BASIC_FILL,
   host:'#basicBlock', score:'#scoreBasic', total:'#totalBasic', reset:'#btnResetBasic'},
  {key:'hand', star:3, title:'第二档 · 动手操作（鸡兔同笼、藏宝图、统计与图形）', prefix:'动',
   choice:HAND_CHOICE, fill:HAND_FILL,
   host:'#handBlock', score:'#scoreHand', total:'#totalHand', reset:'#btnResetHand'},
  {key:'ext', star:4, title:'第三档 · 扩展思维（综合应用、易错辨析、思维提升）', prefix:'拓',
   choice:EXT_CHOICE, fill:EXT_FILL,
   host:'#extBlock', score:'#scoreExt', total:'#totalExt', reset:'#btnResetExt'},
  {key:'star5', title:'第四档 · 五星挑战 · 浅奥思维（全册综合 · 鸡兔同笼 · 思维拓展）', prefix:'奥', star:5,
   choice:STAR5_CHOICE, fill:STAR5_FILL,
   host:'#star5Block', score:'#scoreStar5', total:'#totalStar5', reset:'#btnResetStar5'}
]);
