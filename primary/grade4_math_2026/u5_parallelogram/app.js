/* ==========================================================================
   第五单元 平行四边形和梯形 —— 交互模块
   ========================================================================== */

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
    let name, desc;
    if (v < 25){
      /* 平行 */
      const off = 60;
      s('line', {x1:50, y1:y - off, x2:410, y2:y - off, stroke:'#1f9d6b', 'stroke-width':3.5, 'stroke-linecap':'round'}, svg);
      label(svg, 415, y - off + 5, 'm', {size:14, fill:'#4b5f7d'});
      name = '平行'; desc = '两条直线<b>不相交</b>，在同一平面内没有公共点。';
      lab.textContent = '平行';
    } else if (v < 60){
      /* 相交但不垂直 */
      const ang = 25 + (v - 25) / 35 * 40;
      const p = polar(230, y, 160, ang);
      s('line', {x1:230 - (p[0]-230), y1:y - (p[1]-y), x2:p[0], y2:p[1], stroke:'#f08a24', 'stroke-width':3.5, 'stroke-linecap':'round'}, svg);
      name = '相交'; desc = '两条直线<b>相交</b>，但没有交成直角，所以<b>不垂直</b>。';
      lab.textContent = '相交（不垂直）';
    } else {
      /* 垂直 */
      s('line', {x1:230, y1:y - 150, x2:230, y2:y + 40, stroke:'#d94a4a', 'stroke-width':3.5, 'stroke-linecap':'round'}, svg);
      /* 直角符号 */
      s('path', {d:`M ${230+16} ${y} L ${230+16} ${y-16} L ${230} ${y-16}`, fill:'none', stroke:'#d94a4a', 'stroke-width':1.6}, svg);
      name = '垂直'; desc = '两条直线相交成<b>直角</b>，互相垂直。垂直是相交的特殊情况。';
      lab.textContent = '垂直';
    }
    note.innerHTML = `当前：<b>${name}</b>。${desc}<br>` +
      `<b>重要</b>：平行和垂直都必须在<b>同一平面内</b>才成立；判断垂直要看到<b>直角</b>，光看"斜着交叉"不算。`;
  }
  range.addEventListener('input', render);
  $('#btnPvReset').addEventListener('click', () => { range.value = 0; render(); });
  render();
})();

/* ==========================================================================
   ② 画垂线
   ========================================================================== */
(function initDrawP(){
  const stage = $('#dpStage'), note = $('#dpNote'), steps = $('#dpSteps');
  let step = 0;
  function render(){
    stage.innerHTML = '';
    const svg = s('svg', {viewBox:'0 0 480 300', width:480, height:300});
    stage.appendChild(svg);
    const y = 220, P = [300, 90];
    s('line', {x1:40, y1:y, x2:440, y2:y, stroke:'#2f6fd0', 'stroke-width':3.5, 'stroke-linecap':'round'}, svg);
    label(svg, 448, y + 5, 'l', {size:14, fill:'#4b5f7d'});
    s('circle', {cx:P[0], cy:P[1], r:5, fill:'#20304a'}, svg);
    label(svg, P[0] + 12, P[1] - 6, 'P', {size:15, fill:'#20304a'});
    if (step >= 1){
      /* 三角尺 */
      s('path', {d:`M ${P[0]} ${P[1]} L ${P[0]} ${y} L ${P[0]+70} ${y} Z`, fill:'rgba(240,138,36,.18)',
        stroke:'#f08a24', 'stroke-width':2.5}, svg);
      label(svg, P[0] + 34, y - 12, '三角尺', {size:13, fill:'#b35c00'});
    }
    if (step >= 2){
      s('line', {x1:P[0], y1:P[1], x2:P[0], y2:y, stroke:'#d94a4a', 'stroke-width':3.5, 'stroke-linecap':'round'}, svg);
      s('path', {d:`M ${P[0]+16} ${y} L ${P[0]+16} ${y-16} L ${P[0]} ${y-16}`, fill:'none', stroke:'#d94a4a', 'stroke-width':1.8}, svg);
    }
    if (step >= 3){
      label(svg, P[0] + 26, y - 24, '直角', {size:13, fill:'#a93226'});
      label(svg, P[0] + 8, (P[1] + y) / 2, '垂线段', {size:13, fill:'#a93226', anchor:'start'});
    }
    const msgs = [
      '第 ① 步：把三角尺的<b>一条直角边</b>与已知直线 <b>l</b> 重合。',
      '第 ② 步：沿着三角尺的<b>另一条直角边</b>，经过已知点 <b>P</b> 画一条线。',
      '第 ③ 步：在交点处<b>标上直角符号</b>，这条线就是直线 l 经过点 P 的<b>垂线</b>。',
      '画好了！<b>垂线段</b>就是从 P 到垂足的那条线段，它的长度就是<b>点 P 到直线 l 的距离</b>。'
    ];
    steps.innerHTML = ['①靠边','②画线','③标直角','④完成']
      .map((l, i) => `<div class="dot ${i < step ? 'done' : (i === step ? 'on' : '')}" title="${l}">${i+1}</div>`).join('');
    note.innerHTML = msgs[Math.min(step, msgs.length - 1)];
  }
  $('#btnDpStep').addEventListener('click', () => { step = (step + 1) % 4; render(); });
  $('#btnDpAll').addEventListener('click', () => { step = 4; render(); });
  $('#btnDpReset').addEventListener('click', () => { step = 0; render(); });
  render();
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
    /* 三条连线 */
    const xs = [60, 180, 330];
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
})();

/* ==========================================================================
   ④ 平行四边形
   ========================================================================== */
(function initPara(){
  const skew = $('#paraSkew'), h = $('#paraH'), lab = $('#paraLabel'), stage = $('#paraStage'), note = $('#paraNote');
  function render(){
    const k = +skew.value, H = +h.value, base = 200, side = 120;
    stage.innerHTML = '';
    const svg = s('svg', {viewBox:'0 0 480 260', width:480, height:260});
    stage.appendChild(svg);
    const ox = 90, oy = 210;
    const dx = Math.tan(k * Math.PI / 180) * H;
    const A = [ox, oy], B = [ox + base, oy], C = [ox + base + dx, oy - H], D = [ox + dx, oy - H];
    s('polygon', {points:`${A} ${B} ${C} ${D}`, fill:'rgba(217,74,74,.10)', stroke:'#d94a4a', 'stroke-width':3}, svg);
    [[A,'A'],[B,'B'],[C,'C'],[D,'D']].forEach(([p, t]) => {
      s('circle', {cx:p[0], cy:p[1], r:4, fill:'#20304a'}, svg);
      label(svg, p[0] + (t === 'B' || t === 'C' ? -12 : 12), p[1] + (t === 'A' || t === 'B' ? 16 : -8), t, {size:14, fill:'#20304a'});
    });
    /* 底和高 */
    s('line', {x1:A[0], y1:A[1] + 26, x2:B[0], y2:B[1] + 26, stroke:'#2f6fd0', 'stroke-width':2, 'stroke-dasharray':'6 4'}, svg);
    label(svg, (A[0]+B[0])/2, A[1] + 44, '底 = 200', {size:14, fill:'#2f6fd0'});
    s('line', {x1:A[0] - 26, y1:A[1], x2:A[0] - 26, y2:D[1], stroke:'#1f9d6b', 'stroke-width':2, 'stroke-dasharray':'6 4'}, svg);
    label(svg, A[0] - 44, (A[1]+D[1])/2, '高 = ' + H, {size:14, fill:'#1f9d6b'});
    /* 直角符号 */
    s('path', {d:`M ${A[0]-26} ${A[1]-16} L ${A[0]-10} ${A[1]-16} L ${A[0]-10} ${A[1]}`, fill:'none', stroke:'#1f9d6b', 'stroke-width':1.5}, svg);
    const per = 2 * (base + Math.round(Math.sqrt(H * H + dx * dx)));
    const area = base * H;
    lab.textContent = `底 200 · 高 ${H} · 周长 ${per} · 面积 ${area}`;
    const sideLen = Math.round(Math.sqrt(H * H + dx * dx));
    note.innerHTML = `平行四边形：<b>两组对边分别平行且相等</b>。<br>` +
      `对边 AB = CD = 200，AD = BC ≈ ${sideLen}，周长 = (200 + ${sideLen}) × 2 = <b>${per}</b>；` +
      `面积 = 底 × 高 = 200 × ${H} = <b>${area}</b>。<br>` +
      `<b>关键结论</b>：<b>底和高不变时，面积不变</b>；倾斜使腰变长，<b>周长会变</b>。`;
  }
  skew.addEventListener('input', render); h.addEventListener('input', render);
  $('#btnParaReset').addEventListener('click', () => { skew.value = 35; h.value = 100; render(); });
  render();
})();

/* ==========================================================================
   ⑤ 梯形
   ========================================================================== */
(function initTrap(){
  const stage = $('#trapStage'), note = $('#trapNote');
  let kind = 0;
  function render(){
    stage.innerHTML = '';
    const svg = s('svg', {viewBox:'0 0 480 280', width:480, height:280});
    stage.appendChild(svg);
    const oy = 210, topY = 110;
    let topW = 120, botW = 240, left = 120;
    let title, desc;
    if (kind === 0){ title = '一般梯形'; desc = '只有<b>一组</b>对边平行（上底 ∥ 下底），另一组对边不平行。'; }
    if (kind === 1){ title = '等腰梯形'; desc = '两腰<b>相等</b>（是轴对称图形），上底 <b>130</b>，两腰各 <b>65</b>。'; topW = 130; left = 115; }
    if (kind === 2){ title = '直角梯形'; desc = '有一个角是<b>直角</b>，其中一条腰<b>垂直</b>于两底。'; topW = 140; left = 120; }
    const A = [left, oy], B = [left + botW, oy], C = [left + botW - (botW - topW) / 2, topY], D = [left + (botW - topW) / 2, topY];
    s('polygon', {points:`${A} ${B} ${C} ${D}`, fill:'rgba(122,79,214,.10)', stroke:'#7a4fd6', 'stroke-width':3}, svg);
    [[A,'A'],[B,'B'],[C,'C'],[D,'D']].forEach(([p, t]) => {
      s('circle', {cx:p[0], cy:p[1], r:4, fill:'#20304a'}, svg);
      label(svg, p[0] + (t === 'B' || t === 'C' ? -12 : 12), p[1] + (t === 'A' || t === 'B' ? 16 : -8), t, {size:14, fill:'#20304a'});
    });
    /* 上底下底高 */
    s('line', {x1:D[0], y1:D[1] - 22, x2:C[0], y2:C[1] - 22, stroke:'#2f6fd0', 'stroke-width':2, 'stroke-dasharray':'6 4'}, svg);
    label(svg, (D[0]+C[0])/2, D[1] - 32, '上底 = ' + topW, {size:14, fill:'#2f6fd0'});
    s('line', {x1:A[0], y1:A[1] + 26, x2:B[0], y2:B[1] + 26, stroke:'#2f6fd0', 'stroke-width':2, 'stroke-dasharray':'6 4'}, svg);
    label(svg, (A[0]+B[0])/2, A[1] + 44, '下底 = ' + botW, {size:14, fill:'#2f6fd0'});
    s('line', {x1:A[0] - 26, y1:A[1], x2:A[0] - 26, y2:D[1], stroke:'#1f9d6b', 'stroke-width':2, 'stroke-dasharray':'6 4'}, svg);
    label(svg, A[0] - 46, (A[1]+D[1])/2, '高 = ' + (oy - topY), {size:14, fill:'#1f9d6b'});
    label(svg, 240, 34, title, {size:18, fill:'#7a4fd6'});
    note.innerHTML = `<b>${title}</b>：${desc}<br>` +
      `梯形有<b>一组</b>对边平行（上底 ∥ 下底），另一组对边<b>不平行</b>。<br>` +
      `梯形的高：从上底上的一点向下底画<b>垂线段</b>，这条垂线段的长度就是高（每个梯形的高都相等）。`;
  }
  $('#trapStage').addEventListener('click', e => {});
  document.querySelectorAll('button[data-t]').forEach(b => b.addEventListener('click', () => {
    kind = +b.dataset.t; render();
  }));
  render();
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
  function render(){
    stage.innerHTML = '';
    const box = document.createElement('div');
    box.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:10px;width:100%';
    function drawNode(node, depth){
      const wrap = document.createElement('div');
      wrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:8px';
      const d = document.createElement('div');
      d.textContent = node.t;
      d.style.cssText = `padding:7px 18px;border-radius:10px;border:2.5px solid ${node.color};color:${node.color};` +
        `background:#fff;font-weight:700;font-size:${depth === 0 ? 17 : 15}px;cursor:pointer`;
      d.addEventListener('click', () => {
        note.innerHTML = `<b>${node.t}</b>：${describe(node.t)}`;
      });
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
    stage.appendChild(box);
    note.innerHTML = '点击图中任意一个图形，看它的定义。<b>分类要用一个标准</b>：先看两组对边是否都平行。';
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
  {q:'平行四边形有（　）组高。',
   opts:['1','2','4','无数'], a:1,
   why:'两条底分别对应一组高，共 2 组高（每个底上有无数条高，但高互相平行）。'},
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
  {q:'四根小棒摆成一个四边形，围成的图形一定是（　）。',
   opts:['长方形','正方形','平行四边形','梯形'], a:2,
   why:'用直尺围成的四边形对边分别平行，是平行四边形。'},
  {q:'一个梯形，上底 6 厘米，下底 10 厘米，高 5 厘米，它的面积是（　）平方厘米。',
   opts:['40','30','50','25'], a:0, why:'(6 + 10) × 5 ÷ 2 = 40。'},
  {q:'下面说法正确的是（　）。',
   opts:['垂直的线段最短','从直线外一点到直线的所有连线中，垂线段最短',
         '两点之间线段最短','平行四边形的周长与形状有关'], a:1,
   why:'这是"两点之间线段最短"的推广；平行四边形底和高不变时周长不变。'}
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
   opts:['5','10','15','20'], a:1, why:'周长 = (a + b) × 2，30 ÷ 2 = 15 = 5 + b，b = 10。'},
  {q:'把一个平行四边形沿高剪成两个直角三角形，两个三角形的面积（　）。',
   opts:['相等','不相等','无法确定','一个是一半'], a:0,
   why:'等底等高的两个三角形面积相等。'},
  {q:'下面图形中，一定是梯形的是（　）。',
   opts:['两条邻边都相等的四边形','一条对角线相等的四边形','只有一组对边平行的四边形','四个角都是锐角的四边形'], a:2,
   why:'只有一组对边平行的四边形是梯形。'},
  {q:'一个平行四边形底扩大 2 倍、高缩小到原来的 1/2，面积（　）。',
   opts:['扩大到 2 倍','缩小到 1/2','不变','扩大到 4 倍'], a:1,
   why:'面积 = 底 × 高：2 × 1/2 = 1 倍，所以不变。'},
  {q:'等腰梯形的一个底角是 60°，与它相邻的底角是（　）。',
   opts:['60°','90°','120°','150°'], a:0, why:'等腰梯形同一底上的两个角相等。'},
  {q:'把一张长方形纸沿一条直线剪下，可能剪出（　）。',
   opts:['一定是梯形','一定是平行四边形','可能是梯形','一定是三角形'], a:2,
   why:'斜着剪可能得到梯形或平行四边形，取决于剪法。'}
];

const EXT_FILL = [
  {q:'一个平行四边形的周长是 46 厘米，其中一条边长 8 厘米，相邻的边长（　）厘米。',
   a:'15', why:'46 ÷ 2 = 23 = 8 + 相邻边，相邻边 = 15。'},
  {q:'一个梯形的上底是 8 厘米，下底是 12 厘米，高是 5 厘米，面积是（　）平方厘米。',
   a:'50', why:'(8 + 12) × 5 ÷ 2 = 50。'},
  {q:'把一个平行四边形的底扩大到原来的 3 倍，高缩小到原来的 1/3，面积（　）（填"不变"或倍数）。',
   a:'不变', why:'3 × 1/3 = 1，面积不变。'},
  {q:'等腰梯形的上底 6 厘米、下底 10 厘米，两腰各 5 厘米，它的周长是（　）厘米。',
   a:'26', why:'6 + 10 + 5 + 5 = 26。'},
  {q:'一个长方形长 12 厘米、宽 8 厘米，把它拉成一个平行四边形（长和宽不变），它的面积是（　）平方厘米。',
   a:'96', why:'面积 = 底 × 高 = 12 × 8 = 96，与形状无关。'},
  {q:'直角梯形的上底 5 厘米、下底 9 厘米、高 4 厘米，它的面积是（　）平方厘米。',
   a:'28', why:'(5 + 9) × 4 ÷ 2 = 28。'}
];

bootCourse([
  {key:'basic', title:'第一档 · 巩固基础（垂直平行与图形的特征）', prefix:'基',
   choice:BASIC_CHOICE, fill:BASIC_FILL,
   host:'#basicBlock', score:'#scoreBasic', total:'#totalBasic', reset:'#btnResetBasic'},
  {key:'hand', title:'第二档 · 动手操作（画垂线、找高、算周长面积）', prefix:'动',
   choice:HAND_CHOICE, fill:HAND_FILL,
   host:'#handBlock', score:'#scoreHand', total:'#totalHand', reset:'#btnResetHand'},
  {key:'ext', title:'第三档 · 扩展思维（推理、变式与等积变形）', prefix:'拓',
   choice:EXT_CHOICE, fill:EXT_FILL,
   host:'#extBlock', score:'#scoreExt', total:'#totalExt', reset:'#btnResetExt'}
]);
