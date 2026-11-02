/* ==========================================================================
   第五单元 平行四边形和梯形 —— 交互模块
   --------------------------------------------------------------------------
   每个模块在末尾暴露一个 MOD.xxx 控制器，给讲解脚本一个"绝对状态"入口：
   MOD.pv.set(80) 表示"直接到垂直那一态"，而不是"再拖几下"。
   这样讲解可以任意跳拍重讲，画面永远和脚本对应。
   ========================================================================== */
window.MOD = window.MOD || {};

/* ==========================================================================
   ① 平行与垂直
   ========================================================================== */
(function initPV(){
  const range = $('#pvRange'), lab = $('#pvLabel'), stage = $('#pvStage'), note = $('#pvNote');
  function render(){
    const v = +range.value;
    stage.innerHTML = '';
    const svg = s('svg', {viewBox:'0 0 460 280', width:460, height:280});
    stage.appendChild(svg);
    const y = 170;
    s('line', {x1:50, y1:y, x2:410, y2:y, stroke:'#2f6fd0', 'stroke-width':3.5, 'stroke-linecap':'round'}, svg);
    label(svg, 415, y + 5, 'l', {size:14, fill:'#4b5f7d'});
    let name, desc, angTxt;
    if (v < 25){
      /* 平行 */
      const off = 60;
      s('line', {x1:50, y1:y - off, x2:410, y2:y - off, stroke:'#1f9d6b', 'stroke-width':3.5, 'stroke-linecap':'round'}, svg);
      label(svg, 415, y - off + 5, 'm', {size:14, fill:'#4b5f7d'});
      name = '平行'; desc = '两条直线<b>不相交</b>，在同一平面内没有公共点。';
      angTxt = '不会相交';
      lab.textContent = '平行';
    } else if (v < 60){
      /* 相交但不垂直 */
      const ang = 25 + (v - 25) / 35 * 40;
      const p = polar(230, y, 160, ang);
      s('line', {x1:230 - (p[0]-230), y1:y - (p[1]-y), x2:p[0], y2:p[1], stroke:'#f08a24', 'stroke-width':3.5, 'stroke-linecap':'round'}, svg);
      name = '相交'; desc = '两条直线<b>相交</b>，但没有交成直角，所以<b>不垂直</b>。';
      angTxt = '夹角 ' + ang.toFixed(0) + ' 度';
      lab.textContent = '相交（不垂直）';
    } else {
      /* 垂直 */
      s('line', {x1:230, y1:y - 110, x2:230, y2:y + 40, stroke:'#d94a4a', 'stroke-width':3.5, 'stroke-linecap':'round'}, svg);
      label(svg, 244, y - 116, 'm', {size:14, fill:'#4b5f7d', anchor:'start'});
      /* 直角符号 */
      s('path', {d:`M ${230+16} ${y} L ${230+16} ${y-16} L ${230} ${y-16}`, fill:'none', stroke:'#d94a4a', 'stroke-width':1.6}, svg);
      name = '垂直'; desc = '两条直线相交成<b>直角</b>，互相垂直。垂直是相交的特殊情况。';
      angTxt = '夹角 90 度';
      lab.textContent = '垂直';
    }
    label(svg, 230, 36, '现在的关系：' + name + '（' + angTxt + '）', {size:17, fill:'#4b5f7d'});
    note.innerHTML = `当前：<b>${name}</b>。${desc}<br>` +
      `<b>重要</b>：平行和垂直都必须在<b>同一平面内</b>才成立；判断垂直要看到<b>直角</b>，光看"斜着交叉"不算。`;
  }
  range.addEventListener('input', render);
  $('#btnPvReset').addEventListener('click', () => { range.value = 0; render(); });
  render();

  /* 讲解控制器：0 = 平行，40 = 相交不垂直，80 = 垂直 */
  MOD.pv = {
    set(v){ range.value = String(Math.max(0, Math.min(100, v | 0))); render(); },
    get v(){ return +range.value; }
  };
})();

/* ==========================================================================
   ② 画垂线
   ========================================================================== */
(function initDrawP(){
  const stage = $('#dpStage'), note = $('#dpNote'), steps = $('#dpSteps');
  let step = 0, pos = 0;
  /* 两种情形：点 P 在直线外 / 点 P 在直线上（画法同一招，三角尺摆法不同） */
  const POS = [[300, 90], [230, 220]];
  function render(){
    stage.innerHTML = '';
    const svg = s('svg', {viewBox:'0 0 480 300', width:480, height:300});
    stage.appendChild(svg);
    const y = 220, P = POS[pos], onLine = P[1] === y;
    s('line', {x1:40, y1:y, x2:440, y2:y, stroke:'#2f6fd0', 'stroke-width':3.5, 'stroke-linecap':'round'}, svg);
    label(svg, 448, y + 5, 'l', {size:14, fill:'#4b5f7d'});
    s('circle', {cx:P[0], cy:P[1], r:5, fill:'#20304a'}, svg);
    label(svg, P[0] + 12, P[1] - 6, 'P', {size:15, fill:'#20304a'});
    if (step >= 1){
      /* 三角尺：直角边贴住直线 l，另一直角边过点 P */
      const d = onLine
        ? `M ${P[0]} ${y} L ${P[0]+70} ${y} L ${P[0]} ${y-70} Z`
        : `M ${P[0]} ${P[1]} L ${P[0]} ${y} L ${P[0]+70} ${y} Z`;
      s('path', {d, fill:'rgba(240,138,36,.18)', stroke:'#f08a24', 'stroke-width':2.5}, svg);
      label(svg, P[0] + 34, y - (onLine ? 26 : 12), '三角尺', {size:13, fill:'#b35c00'});
    }
    if (step >= 2){
      s('line', {x1:P[0], y1:onLine ? y - 130 : P[1], x2:P[0], y2:y,
        stroke:'#d94a4a', 'stroke-width':3.5, 'stroke-linecap':'round'}, svg);
      s('path', {d:`M ${P[0]+16} ${y} L ${P[0]+16} ${y-16} L ${P[0]} ${y-16}`, fill:'none', stroke:'#d94a4a', 'stroke-width':1.8}, svg);
    }
    if (step >= 3){
      label(svg, P[0] + 26, y - 24, '直角', {size:13, fill:'#a93226'});
      if (onLine) label(svg, P[0] + 10, y - 74, '垂线', {size:13, fill:'#a93226', anchor:'start'});
      else label(svg, P[0] + 8, (P[1] + y) / 2, '垂线段', {size:13, fill:'#a93226', anchor:'start'});
    }
    const msgs = [
      '第 ① 步：把三角尺的<b>一条直角边</b>与已知直线 <b>l</b> 重合。',
      '第 ② 步：沿着三角尺的<b>另一条直角边</b>，经过已知点 <b>P</b> 画一条线。',
      '第 ③ 步：在交点处<b>标上直角符号</b>，这条线就是直线 l 经过点 P 的<b>垂线</b>。',
      onLine
        ? '画好了！点在直线上，垂线是一条穿过它的直线，直角符号就标在交点处。'
        : '画好了！<b>垂线段</b>就是从 P 到垂足的那条线段，它的长度就是<b>点 P 到直线 l 的距离</b>。'
    ];
    const TITLES = ['① 靠边：直角边贴上直线', '② 画线：沿另一直角边过 P', '③ 标直角：直角符号是关键',
      '④ 完成：靠边、画线、标直角', '④ 完成：点在直线上也一样'];
    label(svg, 240, 32, TITLES[Math.min(step, TITLES.length - 1)], {size:15, fill:'#4b5f7d'});
    if (onLine) label(svg, 240, 54, '点在直线上（情形二）', {size:12.5, fill:'#93a1b5'});
    steps.innerHTML = ['①靠边','②画线','③标直角','④完成']
      .map((l, i) => `<div class="dot ${i < step ? 'done' : (i === step ? 'on' : '')}" title="${l}">${i+1}</div>`).join('');
    note.innerHTML = msgs[Math.min(step, msgs.length - 1)];
  }
  $('#btnDpStep').addEventListener('click', () => { step = (step + 1) % 4; render(); });
  $('#btnDpAll').addEventListener('click', () => { step = 4; render(); });
  $('#btnDpReset').addEventListener('click', () => { step = 0; render(); });
  render();

  MOD.dp = {
    set(n){ step = Math.max(0, Math.min(4, n | 0)); render(); },
    pick(i){ pos = (i | 0) ? 1 : 0; step = 0; render(); },
    get step(){ return step; },
    get pos(){ return pos; }
  };
})();

/* ==========================================================================
   ③ 点到直线的距离
   ========================================================================== */
(function initDist(){
  const rx = $('#distX'), ry = $('#distY'), lab = $('#distLabel'), stage = $('#distStage'), note = $('#distNote');
  function render(){
    const X = +rx.value, Y = +ry.value;
    stage.innerHTML = '';
    const svg = s('svg', {viewBox:'0 0 420 260', width:420, height:260});
    stage.appendChild(svg);
    const y = 220;
    s('line', {x1:30, y1:y, x2:390, y2:y, stroke:'#2f6fd0', 'stroke-width':3.5, 'stroke-linecap':'round'}, svg);
    s('circle', {cx:X, cy:Y, r:5, fill:'#20304a'}, svg);
    label(svg, X + 10, Y - 8, 'P', {size:15, fill:'#20304a'});
    /* 三条连线：左斜、右斜、垂直（垂直那条始终落在 P 正下方，否则"最短"无从比较） */
    const xs = [Math.max(40, X - 120), Math.min(380, X + 110), X];
    const colors = ['#9db4d8', '#f08a24', '#1f9d6b'];
    xs.forEach((tx, i) => {
      const isPerp = Math.abs(tx - X) < 1;
      s('line', {x1:X, y1:Y, x2:tx, y2:y, stroke:colors[i], 'stroke-width':isPerp ? 3.5 : 2,
        'stroke-dasharray':isPerp ? '' : '6 5'}, svg);
      const d = Math.sqrt((tx - X) ** 2 + (y - Y) ** 2);
      const mid = [(X + tx) / 2 + 6, (Y + y) / 2];
      haloText(svg, mid[0], mid[1], d.toFixed(1), null, {size:12.5, fill:colors[i], rot:false});
    });
    /* 直角符号 */
    const foot = [X, y];
    s('path', {d:`M ${foot[0]-14} ${foot[1]} L ${foot[0]-14} ${foot[1]-14} L ${foot[0]} ${foot[1]-14}`,
      fill:'none', stroke:'#1f9d6b', 'stroke-width':1.8}, svg);
    const dPerp = Math.abs(y - Y);
    lab.textContent = `垂线段最短：${dPerp.toFixed(1)}`;
    note.innerHTML = `从点 P 到直线 l 的所有连线中，<b>垂直的那条（绿色）最短</b>，长度是 <b>${dPerp.toFixed(1)}</b>，` +
      `它就是点 P 到直线 l 的<b>距离</b>。<br><b>画到直线的距离，要从点出发向直线画垂线段。</b>`;
  }
  rx.addEventListener('input', render); ry.addEventListener('input', render);
  $('#btnDistReset').addEventListener('click', () => { rx.value = 240; ry.value = 60; render(); });
  render();

  /* 讲解控制器：把 P 直接放到指定位置（x 20–380，y 20–150） */
  MOD.dist = {
    set(x, y){
      if (x != null) rx.value = String(Math.max(20, Math.min(380, x | 0)));
      if (y != null) ry.value = String(Math.max(20, Math.min(150, y | 0)));
      render();
    },
    get x(){ return +rx.value; },
    get y(){ return +ry.value; }
  };
})();

/* ==========================================================================
   ④ 平行四边形
   ========================================================================== */
(function initPara(){
  const skew = $('#paraSkew'), sideCtrl = $('#paraSide'), lab = $('#paraLabel'), stage = $('#paraStage'), note = $('#paraNote');
  /* 1 厘米 = 10 像素：滑块管"厘米"，画面管"像素"，这样数值对四年级才有量感 */
  const PX = 10, BASE = 20;
  function render(){
    const k = +skew.value, side = +sideCtrl.value;
    const angle = k * Math.PI / 180;
    const H = Math.round(side * Math.sin(angle));          /* 高（厘米） */
    const HPx = Math.round(side * PX * Math.sin(angle));
    const dxPx = Math.round(side * PX * Math.cos(angle));
    const basePx = BASE * PX;
    stage.innerHTML = '';
    const svg = s('svg', {viewBox:'0 0 480 260', width:480, height:260});
    stage.appendChild(svg);
    const ox = 90, oy = 210;
    const A = [ox, oy], B = [ox + basePx, oy], C = [ox + basePx + dxPx, oy - HPx], D = [ox + dxPx, oy - HPx];
    s('polygon', {points:`${A} ${B} ${C} ${D}`, fill:'rgba(217,74,74,.10)', stroke:'#d94a4a', 'stroke-width':3}, svg);
    [[A,'A'],[B,'B'],[C,'C'],[D,'D']].forEach(([p, t]) => {
      s('circle', {cx:p[0], cy:p[1], r:4, fill:'#20304a'}, svg);
      label(svg, p[0] + (t === 'B' || t === 'C' ? -12 : 12), p[1] + (t === 'A' || t === 'B' ? 16 : -8), t, {size:14, fill:'#20304a'});
    });
    /* 底和高 */
    s('line', {x1:A[0], y1:A[1] + 26, x2:B[0], y2:B[1] + 26, stroke:'#2f6fd0', 'stroke-width':2, 'stroke-dasharray':'6 4'}, svg);
    label(svg, (A[0]+B[0])/2, A[1] + 44, '底 = ' + BASE, {size:14, fill:'#2f6fd0'});
    s('line', {x1:A[0] - 26, y1:A[1], x2:A[0] - 26, y2:D[1], stroke:'#1f9d6b', 'stroke-width':2, 'stroke-dasharray':'6 4'}, svg);
    label(svg, A[0] - 34, (A[1]+D[1])/2, '高 = ' + H, {size:14, fill:'#1f9d6b', anchor:'end'});
    /* 直角符号 */
    s('path', {d:`M ${A[0]-26} ${A[1]-16} L ${A[0]-10} ${A[1]-16} L ${A[0]-10} ${A[1]}`, fill:'none', stroke:'#1f9d6b', 'stroke-width':1.5}, svg);
    const per = 2 * (BASE + side);
    const area = BASE * H;
    lab.textContent = `底 ${BASE} · 腰 ${side} · 高 ${H} · 周长 ${per} · 面积 ${area}（厘米）`;
    note.innerHTML = `平行四边形：<b>两组对边分别平行且相等</b>。<br>` +
      `对边 AB = CD = ${BASE} 厘米，AD = BC = ${side} 厘米，周长 = (${BASE} + ${side}) × 2 = <b>${per}</b> 厘米；` +
      `高 = ${H} 厘米，面积 = 底 × 高 = ${BASE} × ${H} = <b>${area}</b> 平方厘米。<br>` +
      `<b>关键结论</b>：<b>边长不变时，周长不变</b>；倾斜使高变小，<b>面积也变小</b>。`;
  }
  skew.addEventListener('input', render); sideCtrl.addEventListener('input', render);
  $('#btnParaReset').addEventListener('click', () => { skew.value = 45; sideCtrl.value = 12; render(); });
  render();

  /* 讲解控制器：倾斜角 20–70 度；腰长 7–14 厘米 */
  MOD.para = {
    setSkew(k){ skew.value = String(Math.max(20, Math.min(70, k | 0))); render(); },
    setSide(n){ sideCtrl.value = String(Math.max(7, Math.min(14, n | 0))); render(); },
    reset(){ skew.value = 45; sideCtrl.value = 12; render(); },
    get skew(){ return +skew.value; },
    get side(){ return +sideCtrl.value; }
  };
})();

/* ==========================================================================
   ⑤ 梯形
   ========================================================================== */
(function initTrap(){
  const stage = $('#trapStage'), note = $('#trapNote');
  /* 三种梯形的真实几何：dl/dr 是上下底两端在水平方向的错位量
     等腰：dl === dr（两腰相等）；直角：dl === 0（左腰垂直于两底）
     第四项是反例：dl === dr 且上下底只差在长度 → 两腰平行，是平行四边形 */
  const KINDS = [
    {t:'一般梯形', topW:150, botW:240, dl:30, dr:60,
     desc:'只有<b>一组</b>对边平行（上底 ∥ 下底），两腰<b>既不平行也不相等</b>。'},
    {t:'等腰梯形', topW:140, botW:240, dl:50, dr:50,
     desc:'两腰<b>相等</b>（是轴对称图形）。上下底相差 ' + (240-140) + ' 厘米，两腰的水平错位各 ' + 50 + ' 厘米。'},
    {t:'直角梯形', topW:160, botW:240, dl:0, dr:80,
     desc:'有一个角是<b>直角</b>，左腰<b>垂直</b>于两底（dl = 0）。'},
    {t:'平行四边形（反例）', topW:240, botW:240, dl:30, dr:-30,
     desc:'两组对边<b>分别平行</b>：上底和下底都是 240，两腰同向倾斜。它是<b>平行四边形</b>，<b>不是</b>梯形。'}
  ];
  let kind = 0;
  function render(){
    stage.innerHTML = '';
    const svg = s('svg', {viewBox:'0 0 480 300', width:480, height:300});
    stage.appendChild(svg);
    const K = KINDS[kind];
    const oy = 220, topY = 120, left = 130;
    const botW = K.botW, topW = K.topW;
    const A = [left, oy], B = [left + botW, oy],
          C = [left + botW - K.dr, topY], D = [left + K.dl, topY];
    s('polygon', {points:`${A} ${B} ${C} ${D}`, fill:'rgba(122,79,214,.10)', stroke:'#7a4fd6', 'stroke-width':3}, svg);
    [[A,'A'],[B,'B'],[C,'C'],[D,'D']].forEach(([p, t]) => {
      s('circle', {cx:p[0], cy:p[1], r:4, fill:'#20304a'}, svg);
      label(svg, p[0] + (t === 'B' || t === 'C' ? -12 : 12), p[1] + (t === 'A' || t === 'B' ? 16 : -8), t, {size:14, fill:'#20304a'});
    });
    /* 直角梯形标出直角符号 */
    if (kind === 2){
      s('path', {d:`M ${A[0]+14} ${A[1]} L ${A[0]+14} ${A[1]-14} L ${A[0]} ${A[1]-14}`,
        fill:'none', stroke:'#7a4fd6', 'stroke-width':1.6}, svg);
    }
    /* 上底 / 下底 / 高 */
    s('line', {x1:D[0], y1:D[1] - 24, x2:C[0], y2:C[1] - 24, stroke:'#2f6fd0', 'stroke-width':2, 'stroke-dasharray':'6 4'}, svg);
    label(svg, (D[0]+C[0])/2, D[1] - 34, '上底 = ' + topW, {size:14, fill:'#2f6fd0'});
    s('line', {x1:A[0], y1:A[1] + 28, x2:B[0], y2:B[1] + 28, stroke:'#2f6fd0', 'stroke-width':2, 'stroke-dasharray':'6 4'}, svg);
    label(svg, (A[0]+B[0])/2, A[1] + 46, '下底 = ' + botW, {size:14, fill:'#2f6fd0'});
    s('line', {x1:A[0] - 28, y1:A[1], x2:A[0] - 28, y2:D[1], stroke:'#1f9d6b', 'stroke-width':2, 'stroke-dasharray':'6 4'}, svg);
    label(svg, A[0] - 36, (A[1]+D[1])/2, '高 = ' + (oy - topY), {size:14, fill:'#1f9d6b', anchor:'end'});
    label(svg, 240, 34, K.t, {size:18, fill:'#7a4fd6'});
    note.innerHTML = `<b>${K.t}</b>：${K.desc}<br>` +
      `梯形有<b>一组</b>对边平行（上底 ∥ 下底），另一组对边<b>不平行</b>。<br>` +
      `梯形的高：从上底上的一点向下底画<b>垂线段</b>，这条垂线段的长度就是高（每个梯形的高都相等）。`;
  }
  document.querySelectorAll('button[data-t]').forEach(b => b.addEventListener('click', () => {
    kind = +b.dataset.t; render();
  }));
  render();

  /* 讲解控制器：0 一般梯形 / 1 等腰梯形 / 2 直角梯形 */
  MOD.trap = {
    pick(i){ kind = Math.max(0, Math.min(KINDS.length - 1, i | 0)); render(); },
    get kind(){ return kind; }
  };
})();

/* ==========================================================================
   ⑥ 四边形家族图
   ========================================================================== */
(function initTree(){
  const stage = $('#treeStage'), note = $('#treeNote');
  const GROUPS = [
    {t:'四边形', color:'#20304a', kids:[
      {t:'平行四边形', color:'#d94a4a', kids:[
        {t:'长方形', color:'#f08a24', kids:[{t:'正方形', color:'#1f9d6b', kids:[]}]},
        {t:'一般平行四边形', color:'#e08a8a', kids:[]}
      ]},
      {t:'梯形', color:'#7a4fd6', kids:[
        {t:'等腰梯形', color:'#9a7ae0', kids:[]},
        {t:'直角梯形', color:'#b9a3ec', kids:[]},
        {t:'一般梯形', color:'#cfc2f5', kids:[]}
      ]}
    ]}
  ];
  const NODES = {}, PARENT = {};
  let focusName = null, pathEl = null;
  (function walk(n, p){ PARENT[n.t] = p; (n.kids || []).forEach(k => walk(k, n.t)); })(GROUPS[0], null);
  function pathOf(name){
    const out = []; let c = name;
    while (c){ out.unshift(c); c = PARENT[c]; }
    return out;
  }
  function applyFocus(){
    const set = new Set(focusName ? pathOf(focusName) : []);
    Object.keys(NODES).forEach(name => {
      const el = NODES[name], on = set.has(name), dim = !!focusName && !on;
      el.style.background = on ? '#fff7e6' : '#fff';
      el.style.boxShadow = on ? '0 0 0 3px rgba(240,138,36,.38)' : 'none';
      el.style.opacity = dim ? '.34' : '1';
      el.style.transform = on ? 'scale(1.07)' : 'none';
    });
    if (pathEl) pathEl.textContent = focusName ? '路径：' + pathOf(focusName).join(' → ') : '';
  }
  function focus(name){
    if (!NODES[name]) return;
    focusName = name; applyFocus();
    const p = pathOf(name);
    note.innerHTML = `<b>${name}</b>：${describe(name)}` +
      (p.length > 1 ? `<br>它在 <b>${p.slice(0, -1).join(' → ')}</b> 里面：往上每走一步，都多一个条件，圈就更小。` : '');
  }
  function render(){
    stage.innerHTML = '';
    Object.keys(NODES).forEach(k => delete NODES[k]);
    const box = document.createElement('div');
    box.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:10px;width:100%';
    function drawNode(node, depth){
      const wrap = document.createElement('div');
      wrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:8px';
      const d = document.createElement('div');
      d.textContent = node.t;
      d.style.cssText = `padding:7px 18px;border-radius:10px;border:2.5px solid ${node.color};color:${node.color};` +
        `background:#fff;font-weight:700;font-size:${depth === 0 ? 17 : 15}px;cursor:pointer;transition:.25s`;
      d.addEventListener('click', () => focus(node.t));
      NODES[node.t] = d;
      wrap.appendChild(d);
      if (node.kids && node.kids.length){
        const line = document.createElement('div');
        line.style.cssText = 'width:2px;height:14px;background:var(--line)';
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;gap:26px;align-items:flex-start';
        node.kids.forEach(k => {
          const col = document.createElement('div');
          col.style.cssText = 'display:flex;flex-direction:column;align-items:center';
          col.appendChild(drawNode(k, depth + 1));
          row.appendChild(col);
        });
        wrap.append(line, row);
      }
      return wrap;
    }
    box.appendChild(drawNode(GROUPS[0], 0));
    pathEl = document.createElement('div');
    pathEl.style.cssText = 'font-size:13.5px;color:#93a1b5;min-height:20px;margin-top:4px;text-align:center';
    box.appendChild(pathEl);
    stage.appendChild(box);
    applyFocus();
    if (!focusName) note.innerHTML = '点击图中任意一个图形，看它的定义。<b>分类要用一个标准</b>：先看两组对边是否都平行。';
  }
  function describe(t){
    const map = {
      '四边形':'由四条线段首尾相连围成的封闭图形，有 4 个角。',
      '平行四边形':'两组对边分别平行且相等。',
      '长方形':'对边相等、四个角都是直角的平行四边形。',
      '正方形':'四条边都相等、四个角都是直方的长方形。',
      '梯形':'只有一组对边平行的四边形。',
      '等腰梯形':'两腰相等的梯形。',
      '直角梯形':'有一个角是直角的梯形。'
    };
    return map[t] || '它属于上面这一类。';
  }
  render();

  /* 讲解控制器：点亮某个图形到"四边形"的整条路径，其余变淡 */
  MOD.tree = {
    focus(n){ focus(n); },
    clear(){ focusName = null; applyFocus(); note.innerHTML = '点击图中任意一个图形，看它的定义。'; },
    get at(){ return focusName; }
  };
})();

/* ==========================================================================
   分层练习数据
   ========================================================================== */
const BASIC_CHOICE = [
  {q:'在同一平面内，不相交的两条直线叫做（　）。',
   opts:['线段','平行线','垂线','射线'], a:1, why:'同一平面内不相交的两条直线互相平行。'},
  {q:'两条直线相交成直角，就说这两条直线（　）。',
   opts:['互相平行','互相垂直','互相相交','互相垂直或平行'], a:1, why:'相交成直角就是互相垂直。'},
  {q:'下面说法正确的是（　）。',
   opts:['两条直线不相交就一定垂直','垂直的两条直线一定相交',
         '从直线外一点到这条直线所画的垂直线段最短','点到直线的距离就是点到直线的线段长'], a:2,
   why:'垂线段最短，它的长度才是"点到直线的距离"。'},
  {q:'平行四边形的两组对边（　）。',
   opts:['互相平行','互相垂直','平行且相等','长度相等'], a:2,
   why:'平行四边形的两组对边分别平行且相等。'},
  {q:'只有一组对边平行的四边形是（　）。',
   opts:['平行四边形','梯形','长方形','正方形'], a:1, why:'梯形只有一组对边平行。'},
  {q:'下面各图形中，一定是梯形的是（　）。',
   opts:['两组对边分别平行的四边形','只有一组对边平行的四边形','四个角都是直角的四边形','对边相等的四边形'], a:1,
   why:'只有一组对边平行的四边形才是梯形。'},
  {q:'平行四边形有（　）种不同方向的高。',
   opts:['1','2','4','无数'], a:1,
   why:'平行四边形有两组对边，每组底对应一个方向的高，所以有 2 种不同方向的高；同一条底上的高互相平行。'},
  {q:'正方形是特殊的（　）。',
   opts:['梯形','平行四边形','三角形','圆形'], a:1,
   why:'正方形是特殊的长方形，长方形是特殊的平行四边形。'}
];

const BASIC_FILL = [
  {q:'在同一平面内，相交成（　）角的两条直线互相垂直。', a:'直', why:'垂直就是相交成直角。'},
  {q:'正方形有（　）条边相等，四个角都是（　）角。', a:['4','直'],
   why:'正方形四条边相等，四个角都是直角。'},
  {q:'平行四边形有（　）组对边平行且相等。', a:'2', why:'两组。'},
  {q:'长方形有（　）组对边平行且相等。', a:'2', why:'长方形是特殊的平行四边形。'},
  {q:'从直线外一点到这条直线所画的（　）线段最短，它的长度叫做这点到直线的距离。',
   a:'垂直', why:'教材原话：垂线段最短。'},
  {q:'两腰相等的梯形叫做（　）梯形。', a:'等腰', why:'等腰梯形。'},
  {q:'有一个角是直角的梯形叫做（　）梯形。', a:'直角', why:'直角梯形。'},
  {q:'平行四边形的两条对边既（　）又（　）。', a:['平行','相等'], why:'两组对边分别平行且相等。'}
];

const HAND_CHOICE = [
  {q:'下面图形中，一定是平行四边形的是（　）。',
   opts:['两组对边分别平行的四边形','四个角都是直角的四边形','只有一组对边平行的四边形','对边相等的四边形'], a:0,
   why:'定义：两组对边分别平行的四边形是平行四边形。其他条件不能保证。'},
  {q:'两组对边分别相等的四边形一定是（　）。',
   opts:['长方形','正方形','平行四边形','梯形'], a:2,
   why:'两组对边分别相等是平行四边形的特征，所以这个四边形一定是平行四边形。'},
  {q:'一个梯形，上底 6 厘米，下底 10 厘米，高 5 厘米，它的面积是（　）平方厘米。',
   opts:['40','30','50','25'], a:0, why:'(6 + 10) × 5 ÷ 2 = 40。'},
  {q:'下面说法正确的是（　）。',
   opts:['垂直的线段最短','从直线外一点到直线的所有连线中，垂线段最短',
         '两点之间线段最短','平行四边形的周长与形状有关'], a:1,
   why:'这是"两点之间线段最短"的推广：从直线外一点到直线的所有连线中，垂线段最短。'}
];

const HAND_FILL = [
  {q:'画垂线时，三角尺的一条直角边要与已知直线（　），另一条直角边要经过已知（　）。',
   a:['重合','点'], why:'画垂线的三步：靠边、画线、标直角。'},
  {q:'长方形的两条对边（　）且（　），四个角都是直角。', a:['平行','相等'],
   why:'长方形是特殊的平行四边形。'},
  {q:'平行四边形相邻两条边分别是 8 厘米和 12 厘米，周长是（　）厘米。',
   a:'40', why:'(8 + 12) × 2 = 40。'},
  {q:'一个平行四边形底是 15 厘米，高是 6 厘米，面积是（　）平方厘米。',
   a:'90', why:'15 × 6 = 90。'},
  {q:'一个梯形上底 4 厘米，下底 10 厘米，高是 5 厘米，面积是（　）平方厘米。',
   a:'35', why:'(4 + 10) × 5 ÷ 2 = 35。'},
  {q:'一个等腰梯形的上底 4 厘米、下底 6 厘米，两腰各长 5 厘米，它的周长是（　）厘米。',
   a:'20', why:'4 + 6 + 5 + 5 = 20。'},
  {q:'从直线外一点到这条直线一共画了 3 条线段，其中最短的一条长 8 厘米，这点到直线的距离是（　）厘米。',
   a:'8', why:'距离就是垂线段的长度。'},
  {q:'正方形的边长是 6 厘米，它的周长是（　）厘米，面积是（　）平方厘米。',
   a:['24','36'], why:'周长 6 × 4 = 24，面积 6 × 6 = 36。'}
];

const EXT_CHOICE = [
  {q:'一个平行四边形的周长是 30 厘米，一条边长 5 厘米，另一条边长（　）厘米。',
   opts:['5','10','15','20'], a:1, why:'周长 = (a + b) × 2，30 ÷ 2 = 15 = 5 + b，b = 10。', point:'平行四边形**对边相等**，周长 = (相邻两边) × 2', care:'设另一边为 a：30 = (5 + a) × 2，所以 5 + a = 15，a = 10；别忘了除以 2'},
  {q:'把一个平行四边形沿对角线剪成两个三角形，两个三角形的面积（　）。',
   opts:['相等','不相等','无法确定','一个是一半'], a:0,
   why:'平行四边形的对角线把它分成两个完全一样的三角形，所以面积相等，各是原平行四边形的一半。', point:'平行四边形的**对角线**把面积平均分成两份', care:'两个三角形完全一样，面积**相等**，各是原平行四边形的一半'},
  {q:'下面图形中，一定是梯形的是（　）。',
   opts:['两条邻边都相等的四边形','一条对角线相等的四边形','只有一组对边平行的四边形','四个角都是锐角的四边形'], a:2,
   why:'只有一组对边平行的四边形是梯形。', point:'梯形的定义：**只有一组对边平行**', care:'两条邻边都相等的是菱形（可能是正方形）；四个角都是锐角的四边形不存在'},
  {q:'一个平行四边形底扩大 2 倍、高缩小到原来的 1/2，面积（　）。',
   opts:['扩大到 2 倍','缩小到 1/2','不变','扩大到 4 倍'], a:2,
   why:'面积 = 底 × 高：2 × 1/2 = 1 倍，所以不变。', point:'面积 = 底 × 高，底和高的变化要**分别算**再相乘', care:'2 × 1/2 = 1，所以面积**不变**；别只算底的变化'},
  {q:'等腰梯形的一个底角是 60°，与它在同一底上的另一个底角是（　）。',
   opts:['60°','90°','120°','150°'], a:0, why:'等腰梯形同一底上的两个底角相等。', point:'等腰梯形同一底上的两个**底角相等**', care:'同一底上的两个底角才相等；另一个底角也是 60°，另一个底上的角是 120°'},
  {q:'把一张长方形纸沿一条直线剪下，可能剪出（　）。',
   opts:['一定是梯形','一定是平行四边形','可能是梯形','一定是三角形'], a:2,
   why:'斜着剪可能得到梯形或平行四边形，取决于剪法。', point:'**分类讨论**剪法：不同角度剪，得到的图形不同', care:'斜着剪可能得到梯形；沿着对角线剪得到三角形；与边平行剪还是长方形'}
];

const EXT_FILL = [
  {q:'一个平行四边形的周长是 46 厘米，其中一条边长 8 厘米，相邻的边长（　）厘米。',
   a:'15', why:'46 ÷ 2 = 23 = 8 + 相邻边，相邻边 = 15。', point:'周长 = (相邻两边) × 2', care:'46 ÷ 2 = 23，23 − 8 = 15'},
  {q:'一个梯形的上底是 8 厘米，下底是 12 厘米，高是 5 厘米，面积是（　）平方厘米。',
   a:'50', why:'(8 + 12) × 5 ÷ 2 = 50。', point:'梯形面积 = (上底 + 下底) × 高 ÷ 2', care:'(8 + 12) × 5 ÷ 2 = 100 ÷ 2 = 50；括号里先算，再乘高，最后**除以 2**'},
  {q:'把一个平行四边形的底扩大到原来的 3 倍，高缩小到原来的 1/3，面积（　）（填"不变"或倍数）。',
   a:'不变', why:'3 × 1/3 = 1，面积不变。', point:'面积 = 底 × 高，两个变化**相乘**', care:'3 × 1/3 = 1，所以面积**不变**'},
  {q:'等腰梯形的上底 6 厘米、下底 10 厘米，两腰各 5 厘米，它的周长是（　）厘米。',
   a:'26', why:'6 + 10 + 5 + 5 = 26。', point:'周长 = 上底 + 下底 + 两腰', care:'6 + 10 + 5 + 5 = 26；等腰梯形两腰相等，只加一次会算成 21'},
  {q:'一个长方形长 12 厘米、宽 8 厘米，把它拉成一个平行四边形（长和宽不变），面积会（　）（填"变大""变小"或"不变"）。',
   a:'变小', why:'长和宽不变，但拉斜后平行四边形的高小于原来的宽 8 厘米，所以面积变小。', point:'长方形拉成平行四边形：周长不变，面积变小', care:'底仍是 12 厘米，但高变小；不能再用 8 厘米直接当高'},
  {q:'直角梯形的上底 5 厘米、下底 9 厘米、高 4 厘米，它的面积是（　）平方厘米。',
   a:'28', why:'(5 + 9) × 4 ÷ 2 = 28。', point:'梯形面积 = (上底 + 下底) × 高 ÷ 2', care:'(5 + 9) × 4 ÷ 2 = 56 ÷ 2 = 28'}
];

const STAR5_CHOICE = [
  {q:'一个平行四边形的两条对边分别长 8 cm 和 5 cm，它的周长是（　）cm。', opts:['26 cm', '13 cm', '40 cm', '80 cm'], a:0,
   why:'平行四边形<b>对边相等</b>，周长 = (一条边 + 相邻边) × 2。' +
       '(8 + 5) × 2 = <b>26</b>（cm）。',
   point:'平行四边形**对边相等**，周长 = (一条边 + 相邻边) × 2',
   care:'别忘了**乘 2**（两条对边）',
   steps:['平行四边形<b>对边相等</b>，周长 = (一条边 + 相邻边) × 2。', '(8 + 5) × 2 = <b>26</b>（cm）。']},
  {q:'一个梯形的上底 6 cm、下底 10 cm、高 5 cm，沿对角线把它剪成两个三角形，这两个三角形面积的和是（　）cm²。', opts:['40 cm²', '50 cm²', '80 cm²', '20 cm²'], a:0,
   why:'沿对角线剪成两个三角形，面积和就是原来的梯形面积。' +
       '梯形面积 = (上底 + 下底) × 高 ÷ 2 = (6 + 10) × 5 ÷ 2 = <b>40</b>（cm²）。',
   point:'对角线把梯形分成两个三角形，两个三角形的面积和 = 原梯形面积',
   care:'剪开不改变总面积；梯形面积公式最后要**除以 2**',
   steps:['两个三角形拼起来就是原梯形', '(6 + 10) × 5 ÷ 2 = 40（cm²）']},
  {q:'一个平行四边形的底是 20 cm、高是 5 cm，沿对角线剪成两个三角形。其中一个三角形的面积是（　）cm²。', opts:['50 cm²', '40 cm²', '100 cm²', '25 cm²'], a:0,
   why:'平行四边形面积 = 20 × 5 = 100（cm²）；沿对角线剪成的两个三角形面积相等，' +
       '所以每个三角形的面积 = 100 ÷ 2 = <b>50</b>（cm²）。',
   point:'平行四边形的对角线把面积平均分成两份',
   care:'每个三角形与平行四边形等底等高，但面积要**除以 2**',
   steps:['平行四边形面积：20 × 5 = 100（cm²）', '两个三角形面积相等：100 ÷ 2 = 50（cm²）']},
  {q:'一个平行四边形的底扩大到原来的 3 倍，高缩小到原来的 1/3，它的面积（　）。', opts:['不变', '扩大到 3 倍', '缩小到 1/3', '扩大到 9 倍'], a:0,
   why:'面积 = 底 × 高，底和高要<b>分别算</b>再相乘。' +
       '3 × 1/3 = 1，所以面积<b>不变</b>。',
   point:'面积 = 底 × 高，**两个变化分别算再相乘**',
   care:'3 × 1/3 = 1，别只算底的变化',
   steps:['3 × 1/3 = 1', '所以面积不变']},
  {q:'下面图形中，<b>一定</b>是梯形的是（　）。', opts:['两条邻边都相等的四边形', '一条对角线相等的四边形', '只有一组对边平行的四边形', '四个角都是锐角的四边形'], a:2,
   why:'梯形的定义：<b>只有一组对边平行</b>。' +
       'A 是菱形（可能是正方形）；B 可能是很多图形；D 不存在（四个角都是锐角的四边形画不出来）。',
   point:'梯形的定义：<b>只有一组对边平行</b>',
   care:'两条邻边都相等是菱形；四个角都是锐角的四边形不存在',
   steps:['只有一组对边平行的四边形一定是梯形', 'A 是菱形，B 不一定，D 不存在']},
  {q:'把一张长方形纸沿一条直线剪下，<b>可能</b>剪出（　）。', opts:['一定是梯形', '一定是平行四边形', '可能是梯形', '一定是三角形'], a:2,
   why:'要看<b>怎么剪</b>：' +
       '斜着剪（不与边平行）→ 可能得到梯形；沿对角线剪 → 得到两个三角形；与边平行剪 → 还是长方形。' +
       '所以只能说"<b>可能</b>是梯形"。',
   point:'**分类讨论**：剪线与边的位置关系不同，得到的图形不同',
   care:'斜着剪可能得到梯形；沿对角线剪得到三角形；与边平行剪还是长方形',
   steps:['与边平行剪 → 长方形', '沿对角线剪 → 两个三角形', '斜着剪 → 可能是梯形', '所以只能说"可能是梯形"']},
];

const STAR5_FILL = [
  {q:'一个平行四边形相邻两条边分别是 12 cm 和 7 cm，它的周长是（　）cm。', a:'38',
   why:'平行四边形对边相等，周长 = (12 + 7) × 2 = <b>38</b>（cm）。',
   point:'周长 = (相邻两边) × 2',
   care:'别忘了乘 2',
   steps:['周长 = (相邻两边) × 2（别忘了乘 2）。', '(12 + 7) × 2 = <b>38</b>（cm）。']},
  {q:'一个平行四边形的面积是 48 平方厘米，高是 6 厘米，它的底是（　）厘米。', a:'8',
   why:'底 = 面积 ÷ 高 = 48 ÷ 6 = <b>8</b>（cm）。',
   point:'底 = 面积 ÷ 高',
   care:'别把 48 ÷ 6 写成 48 × 6',
   steps:['面积 = 底 × 高 → 底 = <b>面积 ÷ 高</b>。', '48 ÷ 6 = <b>8</b>（cm）。']},
  {q:'一个梯形的上底是 7 厘米、下底是 13 厘米、高是 4 厘米，它的面积是（　）平方厘米。', a:'40',
   why:'(7 + 13) × 4 ÷ 2 = 80 ÷ 2 = <b>40</b>（cm²）。' +
       '⚠️ 括号里先算、再乘高、最后<b>除以 2</b>。',
   point:'梯形面积 = (上底 + 下底) × 高 ÷ 2',
   care:'括号先算、再乘高、最后**除以 2**',
   steps:['梯形面积 = (上底 + 下底) × 高 ÷ <b>2</b>。', '(7 + 13) × 4 ÷ 2 = 80 ÷ 2 = <b>40</b>（cm²）。']},
  {q:'一个平行四边形的底是 15 厘米、高是 4 厘米，把高扩大到原来的 2 倍，面积扩大到（　）平方厘米。', a:'120',
   why:'原来面积：15 × 4 = 60（cm²）。' +
       '高扩大到 2 倍，底不变，面积也扩大到 2 倍：60 × 2 = <b>120</b>（cm²）。',
   point:'底不变时，面积随高**同比变化**',
   care:'高扩大 2 倍，底不变，面积也扩大 2 倍',
   steps:['原来面积：15 × 4 = 60（cm²）', '高扩大 2 倍 → 面积 60 × 2 = 120（cm²）']},
  {q:'等腰梯形的上底 8 厘米、下底 12 厘米，两腰各 5 厘米，它的周长是（　）厘米。', a:'30',
   why:'周长 = 上底 + 下底 + 两腰 = 8 + 12 + 5 + 5 = <b>30</b>（cm）。' +
       '等腰梯形两腰相等，但<b>两条腰都要加上</b>。',
   point:'周长 = 上底 + 下底 + 两腰',
   care:'两腰**都要加**，别只加一条',
   steps:['周长 = 上底 + 下底 + <b>两腰</b>（两条都要加）。', '8 + 12 + 5 + 5 = <b>30</b>（cm）。']},
  {q:'一个直角梯形的上底 4 厘米、下底 10 厘米、高是 5 厘米，它的面积是（　）平方厘米。', a:'35',
   why:'梯形面积 = (上底 + 下底) × 高 ÷ 2。' +
       '(4 + 10) × 5 ÷ 2 = 70 ÷ 2 = <b>35</b>（cm²）。',
   point:'梯形面积 = (上底 + 下底) × 高 ÷ 2',
   care:'最后要**除以 2**',
   steps:['梯形面积 = (上底 + 下底) × 高 ÷ 2。', '(4 + 10) × 5 ÷ 2 = 70 ÷ 2 = <b>35</b>（cm²）。']},
];

bootCourse([
  {key:'basic', star:3, title:'第一档 · 巩固基础（垂直平行与图形的特征）', prefix:'基',
   choice:BASIC_CHOICE, fill:BASIC_FILL,
   host:'#basicBlock', score:'#scoreBasic', total:'#totalBasic', reset:'#btnResetBasic'},
  {key:'hand', star:3, title:'第二档 · 动手操作（画垂线、找高、算周长面积）', prefix:'动',
   choice:HAND_CHOICE, fill:HAND_FILL,
   host:'#handBlock', score:'#scoreHand', total:'#totalHand', reset:'#btnResetHand'},
  {key:'ext', star:4, title:'第三档 · 扩展思维（推理、变式与等积变形）', prefix:'拓',
   choice:EXT_CHOICE, fill:EXT_FILL,
   host:'#extBlock', score:'#scoreExt', total:'#totalExt', reset:'#btnResetExt'},
  {key:'star5', title:'第四档 · 五星挑战 · 浅奥思维（面积模型 · 图形分类 · 等积变形）', prefix:'奥', star:5,
   choice:STAR5_CHOICE, fill:STAR5_FILL,
   host:'#star5Block', score:'#scoreStar5', total:'#totalStar5', reset:'#btnResetStar5'}
]);
