/* ==========================================================================
   第七单元 复习与关联 —— 交互模块
   ========================================================================== */

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
  function render(){
    stage.innerHTML = '';
    const grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:12px;width:100%';
    MAP.forEach(m => {
      const card = document.createElement('div');
      card.style.cssText = `border:2px solid ${m.c};border-radius:12px;padding:12px 14px;background:#fff;cursor:pointer`;
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
  }
  render();
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
})();

/* ==========================================================================
   ③ 图形与几何整理
   ========================================================================== */
(function initGeo(){
  const stage = $('#geoStage'), note = $('#geoNote');
  let g = 0;
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
  }
  document.querySelectorAll('button[data-g]').forEach(b => b.addEventListener('click', () => { g = +b.dataset.g; render(); }));
  render();
})();

/* ==========================================================================
   ④ 统计整理
   ========================================================================== */
(function initStat(){
  const stage = $('#statStage'), note = $('#statNote');
  const CATS = ['足球', '篮球', '跳绳', '毽子'];
  const DATA = [26, 20, 18, 12];
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
    const flow = document.createElement('div');
    flow.style.cssText = 'text-align:left;font-size:16px;line-height:2.1';
    flow.innerHTML = '<b>统计四步走</b><br>' +
      '① <b>收集</b>数据（问卷、举手、记录）<br>' +
      '② <b>整理</b>成统计表<br>' +
      '③ <b>画</b>条形统计图（单式 / 复式）<br>' +
      '④ <b>分析</b>并提出建议<br>' +
      '<span style="color:var(--ink2);font-size:14px">本册重点：条形统计图的四要素、1 格代表几、直条宽窄与间隔。</span>';
    wrap.appendChild(flow);
    stage.appendChild(wrap);
    note.innerHTML = '统计图的价值：<b>一眼看出多少</b>、<b>方便比较</b>、<b>帮助决策</b>。';
  }
  render();
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
   opts:['39.6 万','396 万','39 万','约 40 万'], a:1,
   why:'396000 末四位是 0，可以用等号改写成 396 万。'},
  {q:'一个角是 135°，它是（　）。', opts:['锐角','直角','钝角','平角'], a:2,
   why:'大于 90° 小于 180° 是钝角。'},
  {q:'480 × 25 的积是（　）。', opts:['1200','12000','120000','9600'], a:1,
   why:'48 × 25 = 1200，再添两个 0 → 12000（480 × 25 = 48 × 25 × 100）。'},
  {q:'下面说法正确的是（　）。',
   opts:['垂直的两条直线一定相交','两条直线不相交就一定垂直',
         '平行四边形的对边一定相等','梯形有两组对边平行'], a:0,
   why:'垂直一定相交；不相交是平行；梯形只有一组对边平行。'}
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
   why:'假设全是鸡：35 × 2 = 70，少 24 只脚，24 ÷ 2 = 12 只兔，鸡 35 − 12 = 23。'},
  {q:'一个数近似到万位是 8 万，这个数最大是（　）。',
   opts:['74999','79999','84999','80000'], a:1,
   why:'约 8 万的数范围是 75000 ~ 79999，最大 79999。'},
  {q:'下面说法正确的是（　）。',
   opts:['周角是最大的角','平角比直角大，所以平角是特殊直角',
         '角的大小与边画多长有关','一个周角可以分成两个平角'], a:3,
   why:'周角 360° 是最大的角，但比周角大的角在本单元不研究；平角 = 2 个直角，但不是直角。'},
  {q:'两个完全一样的梯形可以拼成一个平行四边形，这是利用了（　）。',
   opts:['平行四边形的对称性','平移与旋转','三角形的稳定性','周角是 360°'], a:1,
   why:'拼图题的本质是平移、旋转、轴对称等图形的运动。'}
];

const EXT_FILL = [
  {q:'笼子里鸡兔共 20 只，共有 54 只脚，鸡比兔多（　）只。', a:'6',
   why:'假设全是鸡：20 × 2 = 40 只脚，少 14 只；14 ÷ 2 = 7 只兔，鸡 13 只，13 − 7 = 6（只）。'},
  {q:'一个数省略万位后面的尾数约是 6 万，这个数最大是（　）。', a:'64999',
   why:'约 6 万的数范围 55000 ~ 64999。'},
  {q:'商店运来 8 箱苹果，每箱 35 千克，卖出 126 千克后还剩（　）千克。', a:'154',
   why:'35 × 8 = 280，280 − 126 = 154。'},
  {q:'一个平行四边形的底扩大到原来的 2 倍，高缩小到原来的 1/2，面积（　）（填"不变"）。',
   a:'不变', why:'2 × 1/2 = 1，面积不变。'},
  {q:'用 1、2、3、4、5 五个数字组成一个最大的五位数（　）。', a:'54321',
   why:'大的数字放高位。'},
  {q:'一个长方形长 15 厘米、宽 8 厘米，把长缩短到 12 厘米后，面积是（　）平方厘米。',
   a:'96', why:'12 × 8 = 96。'}
];

bootCourse([
  {key:'basic', title:'第一档 · 巩固基础（全册基础知识点过关）', prefix:'基',
   choice:BASIC_CHOICE, fill:BASIC_FILL,
   host:'#basicBlock', score:'#scoreBasic', total:'#totalBasic', reset:'#btnResetBasic'},
  {key:'hand', title:'第二档 · 动手操作（鸡兔同笼、藏宝图、统计与图形）', prefix:'动',
   choice:HAND_CHOICE, fill:HAND_FILL,
   host:'#handBlock', score:'#scoreHand', total:'#totalHand', reset:'#btnResetHand'},
  {key:'ext', title:'第三档 · 扩展思维（综合应用、易错辨析、思维提升）', prefix:'拓',
   choice:EXT_CHOICE, fill:EXT_FILL,
   host:'#extBlock', score:'#scoreExt', total:'#totalExt', reset:'#btnResetExt'}
]);
