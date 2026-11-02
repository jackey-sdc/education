/* ==========================================================================
   第三单元 三角形 —— 交互模块
   口径：① 任意两边之和大于第三边（等于时围不成）
        ② 按角分：锐角/直角/钝角三角形；按边分：不等边/等腰/等边
        ③ 三角形内角和 = 180°，与大小形状无关
        ④ 高 = 从顶点向对边所在直线作的垂线段；每个三角形有 3 条高
   ========================================================================== */

/* 工具：由两点与夹角构造三角形顶点（vertex 为顶点，deg 为两边的夹角） */
function triVertex(vx, vy, len, degA, degB){
  const a = degA * Math.PI / 180, b = degB * Math.PI / 180;
  return [vx + len * Math.cos(a), vy - len * Math.sin(a),
          vx + len * Math.cos(b), vy - len * Math.sin(b)];
}

/* ==========================================================================
   ① 三角形的特性 —— 稳定性
   ========================================================================== */
(function initFeature(){
  const btn = $('#btnFeaPush'), rst = $('#btnFeaReset');
  const stage = $('#feaStage'), note = $('#feaNote');
  let pushed = 0;
  /* 讲解用分级：0 静态 / 1 加"推一推" / 2 推出结果 / 3 解释三边定死 / 4 生活应用 */
  let lvl = 4;
  function render(){
    stage.innerHTML = '';
    const W = 640, H = 300;
    const svg = s('svg', {viewBox:`0 0 ${W} ${H}`, width:W, height:H});
    stage.appendChild(svg);
    /* 左边：三角形框架 */
    label(svg, 150, 28, '三角形框架', {size:15, weight:800, fill:'#1f9d6b'});
    const t = pushed * 26;
    const A = [150 - t, 190], B = [150 + t, 190], C = [150, 60 - t];
    s('line', {x1:A[0], y1:A[1], x2:B[0], y2:B[1], stroke:'#1f9d6b', 'stroke-width':7,
      'stroke-linecap':'round'}, svg);
    s('line', {x1:B[0], y1:B[1], x2:C[0], y2:C[1], stroke:'#1f9d6b', 'stroke-width':7,
      'stroke-linecap':'round'}, svg);
    s('line', {x1:C[0], y1:C[1], x2:A[0], y2:A[1], stroke:'#1f9d6b', 'stroke-width':7,
      'stroke-linecap':'round'}, svg);
    [['A',A],['B',B],['C',C]].forEach(([nm, p]) => {
      s('circle', {cx:p[0], cy:p[1], r:6, fill:'#157a52'}, svg);
      haloText(svg, p[0], p[1] - 16, nm, null, {size:13, weight:700, fill:'#157a52', rot:false});
    });
    /* 右边：四边形框架 */
    label(svg, 450, 28, '四边形框架', {size:15, weight:800, fill:'#f08a24'});
    const d = pushed * 26;
    const P = [[340, 190], [340 + 220, 190], [340 + 220, 190 - 120], [340, 190 - 120]];
    P[2] = [340 + 220 - d, 190 - 120];
    P[3] = [340 + d, 190 - 120];
    for (let i = 0; i < 4; i++){
      const p1 = P[i], p2 = P[(i + 1) % 4];
      s('line', {x1:p1[0], y1:p1[1], x2:p2[0], y2:p2[1], stroke:'#f08a24', 'stroke-width':7,
        'stroke-linecap':'round'}, svg);
    }
    P.forEach(p => s('circle', {cx:p[0], cy:p[1], r:6, fill:'#c96f12'}, svg));
    if (lvl >= 5){
      s('line', {x1:P[0][0], y1:P[0][1], x2:P[2][0], y2:P[2][1], stroke:'#d94a4a',
        'stroke-width':5, 'stroke-linecap':'round'}, svg);
      label(svg, 450, 232, '加一根斜撑', {size:13, weight:700, fill:'#9b2f2f'});
    }
    if (pushed > 0){
      label(svg, 450, 215, '被推歪了！', {size:15, weight:800, fill:'#b35c00'});
    } else if (lvl >= 2){
      label(svg, 450, 215, '还是正正方方', {size:14, weight:700, fill:'#8a6a3a'});
    }
    if (lvl >= 1){
      [150, 450].forEach(cx => {
        s('path', {d:`M ${cx} 246 L ${cx} 200 M ${cx - 7} 208 L ${cx} 197 L ${cx + 7} 208`,
          fill:'none', stroke:'#d94a4a', 'stroke-width':2.4,
          'stroke-linecap':'round', 'stroke-linejoin':'round'}, svg);
        label(svg, cx, 262, '推一推', {size:12.5, weight:700, fill:'#9b2f2f'});
      });
    }
    if (lvl >= 3){
      label(svg, 320, 285, '三角形的三条边一定，三个角就跟着定了',
        {size:14, weight:800, fill:'#126b47'});
    }
    if (lvl >= 4){
      label(svg, 320, 285 - 0, '', {size:12});
      s('rect', {x:140, y:268, width:360, height:22, rx:7, fill:'#fdf6ec'}, svg);
      label(svg, 320, 283, '自行车三角架、房梁都用三角形加固', {size:13, weight:700, fill:'#8a6a3a'});
    }
    note.innerHTML = pushed === 0
      ? '点"推一推"，给两个框架施加同样的力，看看有什么不一样。'
      : `<b>三角形纹丝不动，四边形被推歪了</b>。` +
        `<br>这是因为<b>三角形三条边的长度固定后，它的形状就不能再变了</b>——这就是<b>三角形的稳定性</b>。` +
        `<br><b>教学口径</b>：三角形有<b>三条边、三个顶点、三个角</b>；<b>三角形具有稳定性</b>，四边形不具有。` +
        `<br><b>生活应用</b>：自行车三角架、房梁为什么都用三角形支撑，就是利用这个稳定性。`;
  }
  btn.addEventListener('click', () => { pushed = pushed ? 0 : 1; render(); });
  rst.addEventListener('click', () => { pushed = 0; lvl = 4; render(); });
  /* 讲解入口：set(是否推歪 0/1, 分级 0~4) */
  window.MOD = window.MOD || {};
  MOD.feature = {
    set(p, l){ pushed = (p ? 1 : 0); lvl = (l == null ? 4 : l); render(); }
  };
  render();
})();

/* ==========================================================================
   ② 三边关系
   ========================================================================== */
(function initThree(){
  const a = $('#triA'), b = $('#triB'), c = $('#triC'), lab = $('#triLabel');
  const stage = $('#triStage'), note = $('#triNote');
  /* 讲解用：hideRes = 1 时先把"能不能围成"藏起来，留给孩子判断 */
  let hideRes = 0;
  function render(){
    const A = +a.value, B = +b.value, C = +c.value;
    const ok = (A + B > C) && (A + C > B) && (B + C > A);
    lab.textContent = A + ', ' + B + ', ' + C;
    stage.innerHTML = '';
    const W = 640, H = 400;
    const svg = s('svg', {viewBox:`0 0 ${W} ${H}`, width:W, height:H});
    stage.appendChild(svg);

    /* —— 第一行：三根小棒（示意三边长度）—— */
    const scale = 26, y0 = 40;
    let x = 40;
    const bars = [[A, '#2f6fd0'], [B, '#1f9d6b'], [C, '#f08a24']];
    bars.forEach(([len, col]) => {
      s('rect', {x, y:y0, width:len * scale, height:24, rx:4, fill:col, opacity:.9}, svg);
      label(svg, x + len * scale / 2, y0 + 46, String(len), {size:14, weight:700, fill:'#4b5f7d'});
      x += len * scale + 18;
    });

    /* —— 第二行：真实三角形（按三边长度作图，海伦公式定位顶点）—— */
    let tri = null;
    if (ok){
      /* 底边取 C，另两边 A、B；顶点由余弦定理定位 */
      const cLen = C, bLen = B, aLen = A;
      let px = (bLen*bLen + cLen*cLen - aLen*aLen) / (2*cLen);
      let py = Math.sqrt(Math.max(0, bLen*bLen - px*px));
      const tw = cLen, th = py;
      const k = Math.min(200 / tw, 110 / Math.max(th, 0.001));   /* 等比缩放 */
      const ox = 320 - (tw * k) / 2, oy = 210;                    /* 底边所在 y */
      const P0 = [ox, oy], P1 = [ox + tw * k, oy], P2 = [ox + px * k, oy - th * k];
      s('polygon', {points:[P0,P1,P2].map(q=>q.join(',')).join(' '),
        fill:'#e6f7ef', stroke:'#1f9d6b', 'stroke-width':3}, svg);
      /* 三边长度标注 */
      label(svg, (P0[0]+P1[0])/2, oy + 22, 'C=' + C, {size:12.5, weight:700, fill:'#b35c00'});
      label(svg, (P0[0]+P2[0])/2 - 14, (P0[1]+P2[1])/2, 'B=' + B, {size:12.5, weight:700, fill:'#126b47'});
      label(svg, (P1[0]+P2[0])/2 + 16, (P1[1]+P2[1])/2, 'A=' + A, {size:12.5, weight:700, fill:'#2f6fd0'});
      tri = {P0, P1, P2};
    } else {
      label(svg, 320, 180, '围不成三角形 ✗', {size:20, weight:800, fill:'#9b2f2f'});
      label(svg, 320, 210, '三根小棒首尾相接时留出了空隙（或刚好拉直）',
        {size:13.5, fill:'#4b5f7d'});
    }

    /* —— 第三行：三条不等式，横排一行 —— */
    const ineq = [['A + B > C', A + B, C], ['A + C > B', A + C, B], ['B + C > A', B + C, A]];
    const bw = 186, gap = 21, bx0 = (W - (bw * 3 + gap * 2)) / 2, by = 250;
    ineq.forEach(([txt, sum, other], i) => {
      const good = sum > other;
      const x = bx0 + i * (bw + gap);
      s('rect', {x, y:by, width:bw, height:44, rx:9,
        fill:good ? '#e6f7ef' : '#fdecec', stroke:good ? '#1f9d6b' : '#d94a4a',
        'stroke-width':1.6}, svg);
      label(svg, x + bw/2, by + 18, txt, {size:14, weight:700, fill:good ? '#126b47' : '#9b2f2f'});
      label(svg, x + bw/2, by + 36,
        hideRes ? '? ? ?' : (sum + (good ? ' > ' : ' ≤ ') + other),
        {size:13, weight:800, fill:good ? '#126b47' : '#9b2f2f'});
    });

    /* —— 结论 —— */
    s('rect', {x:150, y:320, width:340, height:42, rx:10,
      fill:ok ? '#e6f7ef' : '#fdecec', stroke:ok ? '#1f9d6b' : '#d94a4a', 'stroke-width':2}, svg);
    label(svg, 320, 347, hideRes ? '能围成吗？' : (ok ? '能围成三角形 ✓' : '围不成三角形 ✗'),
      {size:18, weight:800, fill:ok ? '#126b47' : '#9b2f2f'});

    note.innerHTML = ok
      ? `<b>三边长 ${A}、${B}、${C} 能围成三角形</b>：三条不等式<b>全部成立</b>。` +
        `<br><b>教学口径</b>：<b>三角形任意两边之和大于第三边</b>。`
      : `<b>三边长 ${A}、${B}、${C} 围不成三角形</b>：有一条不等式<b>不成立</b>。` +
        `<br>当两边之和<b>等于</b>第三边时，三条边在一条直线上（退化成线段），<b>围不成三角形</b>。`;
  }
  a.addEventListener('input', render); b.addEventListener('input', render); c.addEventListener('input', render);
  $('#btnTriReset').addEventListener('click', () => { a.value = 6; b.value = 5; c.value = 8; render(); });
  /* 讲解入口：set(边 A, 边 B, 边 C) */
  window.MOD = window.MOD || {};
  MOD.three = {
    set(A, B, C, h){ a.value = A; b.value = B; c.value = C; hideRes = (h ? 1 : 0); render(); }
  };
  render();
})();

/* ==========================================================================
   ③ 三角形的分类
   ========================================================================== */
(function initClass(){
  const a = $('#clsA'), b = $('#clsB'), lab = $('#clsLabel');
  const stage = $('#clsStage'), note = $('#clsNote');
  function render(){
    const A = +a.value, B = +b.value;      /* 两个底角 */
    const C = 180 - A - B;                  /* 顶角 */
    /* 按角分 */
    let byAngle, byAngleColor;
    if (C === 90 || A === 90 || B === 90){ byAngle = '直角三角形'; byAngleColor = '#d94a4a'; }
    else if (C > 90 || A > 90 || B > 90){ byAngle = '钝角三角形'; byAngleColor = '#f08a24'; }
    else { byAngle = '锐角三角形'; byAngleColor = '#1f9d6b'; }
    /* 按边分：底边固定，比较两腰 */
    lab.textContent = '底角 ' + A + '° , ' + B + '°';
    stage.innerHTML = '';
    const W = 640, H = 300;
    const svg = s('svg', {viewBox:`0 0 ${W} ${H}`, width:W, height:H});
    stage.appendChild(svg);
    /* 三角形：底角 A（左）、B（右），顶角 C。
       用"底边固定 + 两腰长度由余弦定理定"的画法，避免 tan(接近90°) 溢出。 */
    const bx = 130, by = 235, R = 200;
    const pL = [bx, by];
    const pR = [bx + R, by];
    /* 顶角 C 固定在底边中点上方；A、B 决定腰长与顶点位置。
       先按 A 算出顶点候选，再用 B 校正：顶点在底边上的投影 x 满足
       tan(A) = h / (x - bx)，tan(B) = h / (bx + R - x)  →  解出 h、x。 */
    const tA = Math.tan(A * Math.PI / 180), tB = Math.tan(B * Math.PI / 180);
    let pT;
    if (!isFinite(tA) || !isFinite(tB) || (tA + tB) < 1e-6){
      /* 角度极端（接近 0 或接近 180）：退化为贴边的情形 */
      pT = [bx + R / 2, by - 1];
    } else {
      const h = R * tA * tB / (tA + tB);
      const x = bx + R * tA / (tA + tB);
      /* 夹角很小时高会冲破天际 —— 限高并同步压缩底边，保证始终在画布内 */
      const MAXH = 150;
      if (h > MAXH){
        const k = MAXH / h;
        pT = [bx + (x - bx) * 1, by - MAXH];
      } else {
        pT = [x, by - h];
      }
    }
    s('polygon', {points:`${pL[0]},${pL[1]} ${pT[0]},${pT[1]} ${pR[0]},${pR[1]}`,
      fill:'#f7f9fd', stroke:byAngleColor, 'stroke-width':3}, svg);
    /* 三个角标注 */
    const arc = (cx, cy, r, a0, a1, txt, color) => {
      const arcP = arcPoints(cx, cy, r, a0, a1 - a0);
      s('path', {d:arcP.d, fill:'none', stroke:color, 'stroke-width':2.4}, svg);
      const mid = polar(cx, cy, r + 16, (a0 + a1) / 2);
      haloText(svg, mid[0], mid[1], txt, null, {size:14, weight:800, fill:color, rot:false});
    };
    arc(pL[0], pL[1], 26, 0, A, A + '°', A > 90 ? '#d94a4a' : '#2f6fd0');
    arc(pR[0], pR[1], 26, 180 - B, 180, B + '°', B > 90 ? '#d94a4a' : '#2f6fd0');
    arc(pT[0], pT[1], 26, 180 - C - 90, 180 - C + 90, C + '°', C > 90 ? '#d94a4a' : '#2f6fd0');
    /* 右边结论 */
    label(svg, 430, 60, '按角分', {size:15, weight:800, fill:'#4b5f7d'});
    s('rect', {x:370, y:74, width:230, height:40, rx:9, fill:'#f7f9fd', stroke:byAngleColor, 'stroke-width':2}, svg);
    label(svg, 485, 100, byAngle, {size:17, weight:800, fill:byAngleColor});
    label(svg, 430, 150, '按边分', {size:15, weight:800, fill:'#4b5f7d'});
    s('rect', {x:370, y:164, width:230, height:40, rx:9, fill:'#f7f9fd', stroke:'#7a4fd6', 'stroke-width':2}, svg);
    /* 按边分：底角相等 ⇒ 对边相等 ⇒ 等腰 */
    const isIsosceles = Math.abs(A - B) < 0.01;
    label(svg, 485, 190, isIsosceles ? '等腰三角形（等边）' : '不等边三角形',
      {size:17, weight:800, fill:'#5b34b8'});
    label(svg, 430, 240, '两个底角相等 ⇒ 对边相等', {size:13, fill:'#4b5f7d'});
    note.innerHTML = `<b>按角分</b>：这个三角形是<b>${byAngle}</b>（三个角分别是 ${A}°、${B}°、${C}°）。` +
      `<br><b>按边分</b>：${isIsosceles ? '<b>等腰三角形</b>——两个底角相等，对应的两条腰也相等；两个底角都是 60° 时就是<b>等边三角形</b>。' : '<b>不等边三角形</b>——三条边都不相等。'}` +
      `<br><b>教学口径</b>：<b>等边三角形是特殊的等腰三角形</b>（等边三角形有 3 条相等的边，当然也满足"有 2 条边相等"）。`;
  }
  a.addEventListener('input', render); b.addEventListener('input', render);
  $('#btnClsReset').addEventListener('click', () => { a.value = 60; b.value = 60; render(); });
  /* 讲解入口：set(底角 A, 底角 B) */
  window.MOD = window.MOD || {};
  MOD.cls = {
    set(A, B){ a.value = A; b.value = B; render(); }
  };
  render();
})();

/* ==========================================================================
   ④ 内角和 —— 拼角
   ========================================================================== */
(function initAngle(){
  const btn = $('#btnAngStep'), all = $('#btnAngAll'), rst = $('#btnAngReset');
  const stage = $('#angStage'), note = $('#angNote'), stepsEl = $('#angSteps');
  const ANGLES = [52, 68, 60];               /* 三个内角，和 = 180 */
  const N = 4;
  let step = 0;
  function render(){
    stepsEl.innerHTML = ['① 原来是一个三角形', '② 撕下第一个角', '③ 撕下第二个角', '④ 拼成一条直线']
      .map((l, i) => `<div class="dot ${i < step ? 'done' : (i === step ? 'on' : '')}" title="${l}">${i+1}</div>`).join('');
    stage.innerHTML = '';
    const W = 640, H = 300;
    const svg = s('svg', {viewBox:`0 0 ${W} ${H}`, width:W, height:H});
    stage.appendChild(svg);
    if (step === 0){
      /* 完整三角形 */
      const p1 = [140, 230], p2 = [340, 230], p3 = [220, 90];
      s('polygon', {points:`${p1[0]},${p1[1]} ${p2[0]},${p2[1]} ${p3[0]},${p3[1]}`,
        fill:'#e6f7ef', stroke:'#1f9d6b', 'stroke-width':3}, svg);
      const arc = (cx, cy, r, a0, a1, txt) => {
        const ap = arcPoints(cx, cy, r, a0, a1 - a0);
        s('path', {d:ap.d, fill:'none', stroke:'#f08a24', 'stroke-width':2.6}, svg);
        const mid = polar(cx, cy, r + 17, (a0 + a1) / 2);
        haloText(svg, mid[0], mid[1], txt, null, {size:14, weight:800, fill:'#b35c00', rot:false});
      };
      arc(p1[0], p1[1], 28, 0, ANGLES[0], ANGLES[0] + '°');
      arc(p2[0], p2[1], 28, 180 - ANGLES[1], 180, ANGLES[1] + '°');
      arc(p3[0], p3[1], 28, 180 - ANGLES[2] - 90, 180 - ANGLES[2] + 90, ANGLES[2] + '°');
      note.innerHTML = '这是一个三角形，三个内角分别是 <b>52°、68°、60°</b>。点"下一步"把它们撕下来拼一拼。';
    } else if (step === 1){
      /* 撕下第一个角 */
      const p1 = [140, 230], p2 = [340, 230], p3 = [220, 90];
      s('polygon', {points:`${p1[0]},${p1[1]} ${p2[0]},${p2[1]} ${p3[0]},${p3[1]}`,
        fill:'#f7f9fd', stroke:'#c9d4e4', 'stroke-width':2, 'stroke-dasharray':'5 4'}, svg);
      const arc = (cx, cy, r, a0, a1, txt) => {
        const ap = arcPoints(cx, cy, r, a0, a1 - a0);
        s('path', {d:ap.d, fill:'none', stroke:'#f08a24', 'stroke-width':2.6}, svg);
        const mid = polar(cx, cy, r + 17, (a0 + a1) / 2);
        haloText(svg, mid[0], mid[1], txt, null, {size:14, weight:800, fill:'#b35c00', rot:false});
      };
      arc(p1[0], p1[1], 28, 0, ANGLES[0], ANGLES[0] + '°');
      /* 撕下来的角放到右边 */
      const cx2 = 480, cy2 = 200;
      const ap = arcPoints(cx2, cy2, 46, 90, 90 + ANGLES[0]);
      s('path', {d:`M ${cx2} ${cy2} L ${ap.p1[0]} ${ap.p1[1]} A 46 46 0 0 1 ${ap.p2[0]} ${ap.p2[1]} Z`,
        fill:'#fff2e2', stroke:'#f08a24', 'stroke-width':2.4}, svg);
      label(svg, cx2 + 4, cy2 - 70, ANGLES[0] + '°', {size:14, weight:800, fill:'#b35c00'});
      note.innerHTML = `把 <b>${ANGLES[0]}°</b> 的角撕下来，放在一边。`;
    } else if (step === 2){
      /* 两个角拼起来 */
      const cx2 = 420, cy2 = 200;
      const a1 = arcPoints(cx2, cy2, 46, 90, 90 + ANGLES[0]);
      s('path', {d:`M ${cx2} ${cy2} L ${a1.p1[0]} ${a1.p1[1]} A 46 46 0 0 1 ${a1.p2[0]} ${a1.p2[1]} Z`,
        fill:'#fff2e2', stroke:'#f08a24', 'stroke-width':2.4}, svg);
      const a2 = arcPoints(cx2, cy2, 46, 90 + ANGLES[0], 90 + ANGLES[0] + ANGLES[1]);
      s('path', {d:`M ${cx2} ${cy2} L ${a2.p1[0]} ${a2.p1[1]} A 46 46 0 0 1 ${a2.p2[0]} ${a2.p2[1]} Z`,
        fill:'#f1ebff', stroke:'#7a4fd6', 'stroke-width':2.4}, svg);
      label(svg, cx2 - 66, cy2 - 60, ANGLES[0] + '°', {size:14, weight:800, fill:'#b35c00'});
      label(svg, cx2 + 62, cy2 - 60, ANGLES[1] + '°', {size:14, weight:800, fill:'#5b34b8'});
      note.innerHTML = `再把 <b>${ANGLES[1]}°</b> 的角紧挨着拼上去，两个角合起来是 <b>${ANGLES[0] + ANGLES[1]}°</b>。`;
    } else {
      /* 三个角拼成平角 */
      const cx2 = 400, cy2 = 200;
      let a0 = 90;
      const cols = ['#fff2e2', '#f1ebff', '#e6f7ef'];
      const strokes = ['#f08a24', '#7a4fd6', '#1f9d6b'];
      ANGLES.forEach((ang, i) => {
        const p = arcPoints(cx2, cy2, 46, a0, a0 + ang);
        s('path', {d:`M ${cx2} ${cy2} L ${p.p1[0]} ${p.p1[1]} A 46 46 0 0 1 ${p.p2[0]} ${p.p2[1]} Z`,
          fill:cols[i], stroke:strokes[i], 'stroke-width':2.4}, svg);
        const mid = polar(cx2, cy2, 68, a0 + ang / 2);
        haloText(svg, mid[0], mid[1], ang + '°', null, {size:13.5, weight:800, fill:strokes[i], rot:false});
        a0 += ang;
      });
      /* 直线 */
      const lp = polar(cx2, cy2, 130, 90);
      const lp2 = polar(cx2, cy2, 130, 270);
      s('line', {x1:lp[0], y1:lp[1], x2:lp2[0], y2:lp2[1], stroke:'#20304a', 'stroke-width':2.4,
        'stroke-dasharray':'7 5'}, svg);
      label(svg, cx2 + 108, cy2 - 14, '平角 180°', {size:14, weight:800, fill:'#20304a'});
      s('rect', {x:250, y:255, width:300, height:38, rx:9, fill:'#e6f7ef', stroke:'#1f9d6b', 'stroke-width':2}, svg);
      label(svg, 400, 280, ANGLES[0] + '° + ' + ANGLES[1] + '° + ' + ANGLES[2] + '° = 180°',
        {size:17, weight:800, fill:'#126b47'});
      note.innerHTML = `<b>三个角正好拼成一条直线（平角 180°）</b>！` +
        `<br>所以 <b>${ANGLES[0]}° + ${ANGLES[1]}° + ${ANGLES[2]}° = 180°</b>。` +
        `<br><b>教学口径</b>：<b>三角形的内角和等于 180°</b>；` +
        `<b>不管三角形是锐角、直角还是钝角，也不管它大还是小，内角和都是 180°</b>。`;
    }
  }
  btn.addEventListener('click', () => { step = (step + 1) % N; render(); });
  all.addEventListener('click', () => { step = N - 1; render(); });
  rst.addEventListener('click', () => { step = 0; render(); });
  /* 讲解入口：set(步序 0~3) */
  window.MOD = window.MOD || {};
  MOD.ang = {
    set(s){ step = (s == null ? 0 : s); render(); }
  };
  render();
})();

/* ==========================================================================
   ⑤ 画高
   ========================================================================== */
(function initHeight(){
  const sel = $('#hSel'), btn = $('#btnHStep'), all = $('#btnHAll'), rst = $('#btnHReset');
  const stage = $('#hStage'), note = $('#hNote'), stepsEl = $('#hSteps');
  const CASES = [
    {name:'锐角三角形', pts:[[120, 220], [400, 220], [250, 80]]},
    {name:'直角三角形', pts:[[120, 220], [400, 220], [120, 70]]},
    {name:'钝角三角形', pts:[[120, 220], [400, 220], [90, 150]]}
  ];
  let drawn = 0;    /* 已画的高的条数 */
  function render(){
    const c = CASES[+sel.value];
    stepsEl.innerHTML = [0, 1, 2].map(i =>
      `<div class="dot ${i < drawn ? 'done' : (i === drawn ? 'on' : '')}" title="第${i+1}条高">${i+1}</div>`).join('');
    stage.innerHTML = '';
    const W = 640, H = 290;
    const svg = s('svg', {viewBox:`0 0 ${W} ${H}`, width:W, height:H});
    stage.appendChild(svg);
    const P = c.pts;
    label(svg, 320, 22, c.name, {size:15, weight:800, fill:'#157a52'});
    s('polygon', {points:P.map(p => p.join(',')).join(' '), fill:'#f7f9fd',
      stroke:'#1f9d6b', 'stroke-width':3}, svg);
    ['A','B','C'].forEach((nm, i) => {
      s('circle', {cx:P[i][0], cy:P[i][1], r:5.5, fill:'#157a52'}, svg);
      haloText(svg, P[i][0], P[i][1] - 16, nm, null, {size:13, weight:700, fill:'#157a52', rot:false});
    });
    /* 画高：从顶点 i 向对边 P[(i+1)%3]--P[(i+2)%3] 作垂线 */
    for (let k = 0; k < drawn; k++){
      const vi = k;
      const viPt = P[vi];
      const e1 = P[(vi + 1) % 3], e2 = P[(vi + 2) % 3];
      /* 对边方向 */
      const dx = e2[0] - e1[0], dy = e2[1] - e1[1];
      const len = Math.hypot(dx, dy);
      const ux = dx / len, uy = dy / len;
      /* 顶点到对边的投影 */
      const t = ((viPt[0] - e1[0]) * ux + (viPt[1] - e1[1]) * uy);
      const foot = [e1[0] + ux * t, e1[1] + uy * t];
      s('line', {x1:viPt[0], y1:viPt[1], x2:foot[0], y2:foot[1], stroke:'#d94a4a',
        'stroke-width':3.4}, svg);
      /* 垂足直角符号 */
      const nx = -(foot[1] - e1[1]) / len, ny = (foot[0] - e1[0]) / len;
      const sgn = ((viPt[0] - foot[0]) * nx + (viPt[1] - foot[1]) * ny) > 0 ? 1 : -1;
      const L = 14;
      const p1 = [foot[0] + ux * L, foot[1] + uy * L];
      const p2 = [foot[0] + ux * L + nx * L * sgn, foot[1] + uy * L + ny * L * sgn];
      const p3 = [foot[0] + nx * L * sgn, foot[1] + ny * L * sgn];
      s('polyline', {points:`${p1[0]},${p1[1]} ${p2[0]},${p2[1]} ${p3[0]},${p3[1]}`,
        fill:'none', stroke:'#d94a4a', 'stroke-width':1.6}, svg);
      s('circle', {cx:foot[0], cy:foot[1], r:4, fill:'#d94a4a'}, svg);
    }
    const names = ['从 A 向 BC 作垂线', '从 B 向 AC 作垂线', '从 C 向 AB 作垂线'];
    /* 把"已经画了哪几条高"写成画面上的清单，讲解时一眼能对上 */
    for (let k = 0; k < drawn; k++){
      label(svg, 470, 48 + k * 22, '高' + (k + 1) + '　' + names[k],
        {size:12.5, weight:700, fill:'#9b2f2f'});
    }
    if (drawn === 0) label(svg, 470, 48, '还没画高', {size:12.5, fill:'#8fa3bd'});
    note.innerHTML = drawn === 0
      ? `这是一个<b>${c.name}</b>。点"画高"，看从顶点向对边作垂线段。`
      : drawn === 3
        ? `<b>三条高都画完了</b>：${names.join('；')}。` +
          `<br><b>教学口径</b>：<b>从三角形的一个顶点向它的对边所在直线作垂线，顶点和垂足之间的线段叫做三角形的高</b>；` +
          `<b>每个三角形都有 3 条高</b>。`
        : `正在画：<b>${names[drawn - 1]}</b>。注意高与对边<b>垂直</b>（有直角符号）。`;
  }
  sel.addEventListener('change', () => { drawn = 0; render(); });
  btn.addEventListener('click', () => { drawn = drawn >= 3 ? 0 : drawn + 1; render(); });
  all.addEventListener('click', () => { drawn = 3; render(); });
  rst.addEventListener('click', () => { drawn = 0; render(); });
  /* 讲解入口：set(例序号 0~2, 已画高数 0~3) */
  window.MOD = window.MOD || {};
  MOD.height = {
    set(i, n){ sel.value = String(i == null ? 0 : i); drawn = (n == null ? 0 : n); render(); }
  };
  render();
})();

/* ==========================================================================
   分层练习数据
   ========================================================================== */
const BASIC_CHOICE = [
  {q:'下面说法正确的是（　）。', opts:['三角形有 3 条边、3 个顶点、3 个角','三角形只有 3 个角，没有边',
    '三角形具有稳定性，四边形也具有稳定性','三角形容易变形，所以常用来做框架'], a:0,
   why:'三角形由三条线段首尾顺次连接组成，有 3 条边、3 个顶点、3 个角；三角形具有稳定性，四边形不具有。',
   hint:'回到动画 ① 三角形的特性。', point:'高的定义：从顶点向对边作**垂线**，高与对应底互相垂直', care:'直角三角形有 **3** 条高（两条直角边也是高）；等腰三角形**不一定**是等边的'},
  {q:'下面各组线段能围成三角形的是（　）。', opts:['2 cm、3 cm、6 cm','3 cm、4 cm、5 cm','1 cm、2 cm、3 cm','4 cm、4 cm、9 cm'], a:1,
   why:'只需检验较小的两边之和是否大于第三边：3 + 4 = 7 > 5 ✓；其余各组都有两边之和不大于第三边。',
   hint:'回到动画 ② 三边关系，检验"任意两边之和大于第三边"。'},
  {q:'三角形中最大的角是 100°，这个三角形是（　）。', opts:['锐角三角形','直角三角形','钝角三角形','无法确定'], a:2,
   why:'有一个角是钝角（大于 90°）的三角形是钝角三角形。',
   hint:'回到动画 ③ 三角形的分类，按角分。'},
  {q:'三角形的内角和是（　）。', opts:['90°','180°','360°','随三角形大小变化'], a:1,
   why:'三角形的内角和等于 180°，与三角形的大小和形状无关。',
   hint:'回到动画 ④ 内角和，看三个角拼成平角。'},
  {q:'下面说法正确的是（　）。',
   opts:['等边三角形不是等腰三角形','等边三角形是特殊的等腰三角形','等腰三角形一定是等边三角形',
         '直角三角形一定是等腰三角形'], a:1,
   why:'等边三角形有 3 条边相等，当然也满足"有两条边相等"，所以它是特殊的等腰三角形。',
   hint:'回到动画 ③ 末尾的"教学口径"提示。', point:'高的定义：从顶点向对边作**垂线**，高与对应底互相垂直', care:'直角三角形有 **3** 条高（两条直角边也是高）；等腰三角形**不一定**是等边的'},
  {q:'三角形的三条高（　）。', opts:['只有 1 条','有 2 条','有 3 条','条数不确定'], a:2,
   why:'每个三角形有 3 个顶点，从每个顶点向对边作垂线各得一条高，所以有 3 条高。',
   hint:'回到动画 ⑤ 画高。'},
  {q:'一个三角形中，两个角分别是 50° 和 60°，第三个角是（　）。', opts:['70°','80°','90°','100°'], a:0,
   why:'180° - 50° - 60° = 70°。',
   hint:'回到动画 ④，三角形内角和是 180°。'},
  {q:'直角三角形中，两个锐角的和是（　）。', opts:['90°','180°','45°','60°'], a:0,
   why:'直角三角形内角和 180°，减去直角 90°，两个锐角的和是 90°。',
   hint:'回到动画 ④ 内角和，先分别求出两个锐角各是多少。'}
];

const BASIC_FILL = [
  {q:'三角形的内角和是（　）°。', a:'180', why:'三角形的内角和等于 180°。'},
  {q:'三角形有（　）条边，（　）个顶点，（　）个角。', a:['3','3','3'],
   why:'三角形由三条线段首尾顺次连接组成，有 3 条边、3 个顶点、3 个角。'},
  {q:'三根小棒长 4 cm、6 cm、9 cm，（　）能围成三角形（填"能"或"不能"）。', a:'能',
   why:'三条不等式都成立：4 + 6 = 10 > 9 ✓，4 + 9 = 13 > 6 ✓，6 + 9 = 15 > 4 ✓，所以能围成三角形。',
   hint:'回到动画 ②，把三条不等式都检验一遍。'},
  {q:'一个三角形的两个角是 40° 和 65°，第三个角是（　）°。', a:'75',
   why:'180° - 40° - 65° = 75°。'},
  {q:'钝角三角形中，钝角一定（　）90°（填"大于"或"小于"）。', a:'大于',
   why:'钝角三角形的定义就是有一个角是钝角，钝角大于 90°，另外两个角都是锐角。'},
  {q:'直角三角形中，两个锐角的和是（　）°。', a:'90',
   why:'内角和 180° 减去直角 90°，两个锐角的和是 90°。'},
  {q:'等腰直角三角形中，两个锐角都是（　）°。', a:'45',
   why:'两个锐角相等且和为 90°，所以都是 45°。'}
];

const HAND_CHOICE = [
  {q:'等腰三角形的两个底角（　）。', opts:['都是 90°','相等','一个是锐角一个是钝角','互余'], a:1,
   why:'等腰三角形两腰相等，对应的两个底角相等。',
   hint:'回到动画 ③ 分类，拖动滑块观察两个底角的变化。'},
  {q:'一个三角形中最大的角是 80°，这个三角形是（　）。', opts:['锐角三角形','直角三角形','钝角三角形','无法确定'], a:0,
   why:'最大的角是 80°（小于 90°），三个角都是锐角，是锐角三角形。',
   hint:'回到动画 ③ 分类。'},
  {q:'下面各组三角形中，一定是等腰三角形的是（　）。',
   opts:['两个角相等的三角形','两个角都是 60° 的三角形','三边相等的三角形','以上都不对'], a:0,
   why:'两个角相等的三角形，根据"等角对等边"必是等腰三角形；两个角都是 60° 的是等边三角形（是特殊的等腰）；三边相等是等边。',
   hint:'回到动画 ③，"两个底角相等 ⇒ 对边相等"。'},
  {q:'把一个三角形的一个角撕下来放到另一个位置，这个三角形的（　）。',
   opts:['内角和变大','内角和变小','内角和仍是 180°','变成四边形'], a:2,
   why:'撕下一个角拼到别处，三个内角合起来仍是 180°（拼成平角），所以内角和不改变。',
   hint:'回到动画 ④ 拼角动画。'},
  {q:'一个等腰三角形的顶角是 40°，它的一个底角是（　）。', opts:['70°','80°','100°','140°'], a:0,
   why:'底角 = (180° - 40°) ÷ 2 = 70°。',
   hint:'回到动画 ④，用内角和 180° 先求出两个底角的和。'},
  {q:'三角形的三条高中，（　）。',
   opts:['锐角三角形的高都在三角形内','直角三角形有 1 条直角边也是高',
         '钝角三角形的高都在三角形外','以上都不对'], a:0,
   why:'锐角三角形的高都在内部；直角三角形的两条直角边也是高（共 3 条）；钝角三角形有 2 条高在外部延长线上。',
   hint:'回到动画 ⑤ 切换三种三角形，看看高画在哪里。'}
];

const HAND_FILL = [
  {q:'等腰三角形的顶角是 40°，一个底角是（　）°。', a:'70', why:'(180° - 40°) ÷ 2 = 70°。'},
  {q:'一个等腰三角形的顶角是 100°，一个底角是（　）°。', a:'40', why:'(180° - 100°) ÷ 2 = 40°。'},
  {q:'三根小棒长 3 cm、4 cm、5 cm，能（　）围成三角形（填"能"或"不能"）。', a:'能',
   why:'3 + 4 = 7 > 5 ✓，3 + 5 = 8 > 4 ✓，4 + 5 = 9 > 3 ✓，三条不等式都成立，能围成三角形。'},
  {q:'一个三角形中最大的角是 100°，这个三角形是钝角三角形，它的另外两个角的和是（　）°。', a:'80',
   why:'180° - 100° = 80°。'},
  {q:'等腰直角三角形中，两个锐角都是（　）°。', a:'45',
   why:'两个锐角相等且和为 90°，所以都是 45°。'}
];

const EXT_CHOICE = [
  {q:'一个等腰三角形和一个直角三角形都按边分，等腰三角形属于（　）。', opts:['不等边三角形','等腰三角形','等边三角形','无法分类'], a:1,
   why:'按边分三角形只有三类：不等边、等腰、等边。',
   hint:'回到动画 ③ 分类。', point:'分类必须**按同一个标准**：按角分和按边分是两套互不干扰的标准', care:'“按边分”时，等腰三角形仍属等腰三角形；直角三角形按边分则属于“不等边”'},
  {q:'三角形的两条边长分别是 3 cm 和 7 cm，第三条边的长度（　）。',
   opts:['大于 4 cm 且小于 10 cm','大于 7 cm','小于 3 cm','等于 10 cm'], a:0,
   why:'第三边要大于 7 - 3 = 4，且小于 7 + 3 = 10，所以是大于 4 且小于 10。',
   hint:'回到动画 ② 三边关系，两边之和大于第三边、两边之差小于第三边。', point:'三边关系转化为不等式：第三边同时大于两边的**差**、小于两边的**和**', care:'两个条件要同时满足，只答一个不完整；差是 7 − 3 = 4，和是 7 + 3 = 10'},
  {q:'一个三角形的两个内角分别是 30° 和 45°，这个三角形是（　）。', opts:['锐角三角形','直角三角形','钝角三角形','无法确定'], a:2,
   why:'第三个角是 180° - 30° - 45° = 105°，有一个钝角，所以是钝角三角形。',
   hint:'回到动画 ④，先算出第三个角再判断。', point:'先求第三个角，再按角分类——分类看的是**最大角**', care:'第三角 = 105° > 90° 是钝角；不能因为 30°、45° 都是锐角就判锐角三角形'},
  {q:'把一个三角形的三个角都剪下来拼成一个角，这个角是（　）。', opts:['90°','180°','360°','不能拼'], a:1,
   why:'三个内角和是 180°，拼起来是一个平角。',
   hint:'回到动画 ④。', point:'内角和定理的应用：三个角拼起来正好是一个**平角**', care:'拼成的是 180°（平角）不是 360°（周角）；三角形内角和是 180°'},
  {q:'下面说法正确的是（　）。',
   opts:['三角形的形状可以随便改变，只要边长不变','三角形的高与对应的底互相垂直',
         '直角三角形有 2 条高','等腰三角形一定是等边三角形'], a:1,
   why:'高是顶点到对边的垂线段，所以与底垂直；直角三角形有 3 条高；等腰三角形不一定是等边。',
   hint:'回到动画 ⑤ 画高。', point:'高的定义：从顶点向对边作**垂线**，高与对应底互相垂直', care:'直角三角形有 **3** 条高（两条直角边也是高）；等腰三角形**不一定**是等边的'}
];

const EXT_FILL = [
  {q:'三角形的两条边长是 5 cm 和 9 cm，第三条边最短可以是（　）cm。', a:'5',
   why:'第三边要大于 9 - 5 = 4，最小的整数是 5。', point:'三边关系求最值 + 整厘米数的取值', care:'第三边要**大于** 9 − 5 = 4（严格大于），最小取 5，不是 4'},
  {q:'三角形的两条边长是 5 cm 和 9 cm，第三条边最长可以是（　）cm。', a:'13',
   why:'第三边要小于 9 + 5 = 14，最大的整数是 13。', point:'三边关系求最值 + 整厘米数的取值', care:'第三边要**小于** 9 + 5 = 14（严格小于），最大取 13，不是 14'},
  {q:'一个等腰三角形的顶角是 100°，它的一个底角是（　）°。', a:'40', why:'(180° - 100°) ÷ 2 = 40°。', point:'等腰三角形两底角相等：(180° − 顶角) ÷ 2', care:'顶角是唯一的那个角；两底角各 40°'},
  {q:'一个三角形的两个内角分别是 30° 和 45°，第三个角是（　）°。', a:'105',
   why:'180° - 30° - 45° = 105°，有一个钝角，是钝角三角形。', point:'内角和定理：第三个角 = 180° − 已知两角之和', care:'先算 30° + 45° = 75°，再 180° − 75° = 105°；别直接 180 − 30 − 45 时算错'},
  {q:'一个等腰三角形的底角是 70°，它的顶角是（　）°。', a:'40', why:'180° - 70° × 2 = 40°。', point:'等腰三角形两底角相等：顶角 = 180° − 底角 × 2', care:'两个底角都是 70°，要减两次 70°'}
];

/* ==========================================================================
   第四档 · 五星挑战（浅奥思维）
   —— 分类探究、边界推理、"不能确定"的判断
   ========================================================================== */
const STAR5_CHOICE = [
  {q:'等腰三角形的一个角是 100°，它的底角是（　）。',
   opts:['40°','50°','80°','100°'], a:0,
   why:'等腰三角形<b>不可能有两个 100° 的角</b>（那样和就超过 180°），' +
       '所以 100° 只能是<b>顶角</b>，两个底角 = (180° − 100°) ÷ 2 = <b>40°</b>。',
   hint:'回到动画 ③ 分类：先想"100° 能不能是底角"，再定顶角。', point:'**分类讨论**：先判断已知角是顶角还是底角', care:'100° 若是底角，两底角和就超过 180°，不可能；所以它只能是顶角', steps:['先判断 100° 的身份：如果是底角，两个底角就是 100° + 100° = 200° > 180°，不可能', '所以 100° 只能是**顶角**', '两个底角相等：(180° − 100°) ÷ 2 = 40°', '答：底角是 40°']},
  {q:'等腰三角形的一个角是 40°，这个三角形<b>不可能</b>是（　）。',
   opts:['锐角三角形','直角三角形','钝角三角形','等边三角形'], a:1,
   why:'分两种情况：① 40° 是**顶角** → 两个底角 = (180° − 40°) ÷ 2 = 70°，是<b>锐角</b>三角形；' +
       '② 40° 是**底角** → 顶角 = 180° − 40° × 2 = <b>100°</b>，是<b>钝角</b>三角形。' +
       '两种情况都不是直角三角形，所以直角三角形不可能。',
   hint:'回到动画 ③ 分类：<b>等腰三角形的两个底角一定相等</b>，但顶角可以和底角不一样——' +
        '两种情况都要算一算，别只算一种。', point:'**分类讨论**两种可能，再用三角形的分类排除', care:'40° 当顶角和当底角都要算；两种情况都不能出现直角三角形', steps:['情况①：40° 是**顶角** → 两个底角 = (180° − 40°) ÷ 2 = 70°，三个角都小于 90°，是**锐角**三角形', '情况②：40° 是**底角** → 顶角 = 180° − 40° × 2 = 100° > 90°，是**钝角**三角形', '两种情况都不是直角三角形', '所以直角三角形不可能']},
  {q:'三角形的两边长分别是 3 cm 和 7 cm，第三边的长度（　）。',
   opts:['大于 4 cm 且小于 10 cm','大于 7 cm','小于 3 cm','等于 10 cm'], a:0,
   why:'由<b>三角形任意两边之和大于第三边</b>：' +
       '3 + 7 > 第三边 → 第三边 < 10；3 + 第三边 > 7 → 第三边 > 4。' +
       '所以第三边<b>大于 4 cm 且小于 10 cm</b>。',
   hint:'回到动画 ② 三边关系：把第三边和每一组两边分别检验一次。', point:'三边关系：第三边 > 两边之差，且 < 两边之和', care:'7 − 3 = 4，7 + 3 = 10；两个条件要同时成立', steps:['第三边要同时满足两个条件（三角形三边关系）', '条件一：第三边 > 两边之差 = 7 − 3 = 4', '条件二：第三边 < 两边之和 = 7 + 3 = 10', '所以第三边大于 4 cm 且小于 10 cm']},
  {q:'一个等腰三角形的顶角是钝角，它的一个底角最大是（　）。（底角取整度数）',
   opts:['89°','45°','44°','90°'], a:2,
   why:'顶角是钝角（> 90°），那么两个底角的和就<b>小于 90°</b>。' +
       '两个底角相等，所以每个底角 < 45°，<b>最大的整数底角是 44°</b>。',
   hint:'回到动画 ④ 内角和：底角和 = 180° − 钝角 < 90°，再除以 2。', point:'用**不等式**推底角的范围：顶角 > 90° → 底角 < 45°', care:'底角要**严格小于** 45°（等于 45° 时顶角正好 90°，那是直角不是钝角）', steps:['设底角为 x，则顶角 = 180° − 2x', '顶角是钝角 → 180° − 2x > 90° → 2x < 90° → x < 45°', 'x 是整数，所以最大取 44°', '检验：两底角 44° → 顶角 = 180° − 88° = 92° > 90°，确实是钝角 ✓']},
  {q:'直角三角形的两个锐角互余。下面说法正确的是（　）。',
   opts:['两个锐角的和是 90°，两个锐角的积一定是 900',
         '两个锐角一定相等，都是 45°',
         '一个锐角越大，另一个就越小，但它们的和始终是 90°',
         '直角三角形中至少有一个角是钝角'], a:2,
   why:'C 对：直角三角形内角和 180°，减去直角 90°，两个锐角的和<b>恒为 90°</b>，' +
       '所以一个变大另一个必然变小。A 的积不固定（30×60=1800，45×45=2025）；' +
       'B 只在等腰直角三角形才成立；D 错，直角三角形没有钝角。',
   hint:'回到动画 ④ 内角和：算出两个锐角的<b>和</b>，再想"和不变时两个数怎么变"。', point:'互余：两个角的**和**固定为 90°，所以一个变大另一个必然变小', care:'互余只管和，不管积，也不代表两角相等；直角三角形里没有钝角', steps:['互余：两个锐角的**和**是 90°', '因为和固定在 90°，所以一个角变大，另一个必然变小', '但互余**不管积**：两角积不是固定值；也不代表两角相等（45° 和 45° 只是其中一种）', '直角三角形里也没有钝角', '所以正确的是“一个锐角越大，另一个就越小，但它们的和始终是 90°”']},
  {q:'一个三角形的三条边长都是整厘米数，其中两条边是 5 cm 和 9 cm，这个三角形的<b>周长最大</b>是（　）cm。',
   opts:['27','28','26','25'], a:0,
   why:'第三边要<b>大于 9 − 5 = 4</b> 且<b>小于 9 + 5 = 14</b>，' +
       '最大取 13 cm。周长 = 5 + 9 + 13 = <b>27 cm</b>。',
   hint:'回到动画 ② 三边关系：第三边的<b>上界</b>是两边之和（不能取到），再 -1 找最大整数。', point:'三边关系求最值 —— 整厘米数要用“取整”处理', care:'第三边要**小于** 9 + 5 = 14，最大取 13；周长 = 5 + 9 + 13 = 27', steps:['第三边要大于 9 − 5 = 4，小于 9 + 5 = 14', '第三边是整厘米数，能取的最大值是 13（不能取 14，因为要严格小于）', '周长 = 5 + 9 + 13 = 27（cm）', '检验：5 + 9 = 14 > 13 ✓ 仍能围成三角形']}
];

const STAR5_FILL = [
  {q:'等腰三角形的一个角是 100°，它的底角是（　）°。', a:'40',
   why:'100° 只能是顶角，底角 = (180° − 100°) ÷ 2 = 40°。', point:'分类讨论后确定顶角，再用内角和求底角', care:'100° 只能是顶角（当底角则两底角超过 180°）', steps:['若 100° 是底角，两底角 = 200° > 180°，不可能', '所以 100° 是顶角', '底角 = (180° − 100°) ÷ 2 = 40°']},
  {q:'等腰三角形的一个角是 40°，它的顶角比底角大（　）°。', a:'60',
   why:'分两种情况：① 40° 是顶角 → 底角 = (180° − 40°) ÷ 2 = 70°，此时顶角 40° 比底角 70° **小**，不合题意，舍去；' +
       '② 40° 是底角 → 顶角 = 180° − 40° × 2 = 100°，顶角比底角大 100° − 40° = <b>60°</b> ✓', point:'分类讨论 + 用“顶角比底角大”这个条件**排除**一种可能', care:'40° 当顶角时顶角反而更小，与题意矛盾，所以只能是底角', steps:['情况①：40° 是**顶角** → 底角 = (180° − 40°) ÷ 2 = 70°，此时顶角 40° 比底角 70° **小**，与题意矛盾，舍去', '情况②：40° 是**底角** → 顶角 = 180° − 40° × 2 = 100°', '顶角比底角大：100° − 40° = 60°']},
  {q:'三角形的两边长 3 cm 和 7 cm，第三边最短可以是（　）cm。', a:'5',
   why:'第三边要大于 7 − 3 = 4，最小的整数是 5 cm。', point:'三边关系 + 整厘米数取最小值', care:'第三边要严格大于 7 − 3 = 4，最小取 5', steps:['第三边要大于两边的差：7 − 3 = 4（严格大于）', '还要小于两边的和：7 + 3 = 10', '题目要求是**整厘米数**，所以在 4 与 10 之间取最小整数', '最小取 5 cm']},
  {q:'一个等腰三角形的顶角是钝角，它的一个底角最大是（　）°。（底角取整度数）', a:'44',
   why:'底角和 < 90°，每个底角 < 45°，最大的整数是 44°。', point:'不等式推范围：底角 < 45°', care:'严格小于 45°，且取整数', steps:['设底角 x，顶角 = 180° − 2x', '180° − 2x > 90° → x < 45°', 'x 取整数，最大是 44°', '检验：顶角 = 180° − 88° = 92°，是钝角 ✓']},
  {q:'一个三角形的三条边长都是整厘米数，其中两条是 5 cm 和 9 cm，周长最大是（　）cm。', a:'27',
   why:'第三边最大取 13 cm，周长 = 5 + 9 + 13 = 27 cm。', point:'第三边取整厘米数下的最大值，再求周长', care:'第三边最大 13（不能取 14）', steps:['第三边 < 9 + 5 = 14，整厘米数最大取 13', '周长 = 5 + 9 + 13 = 27（cm）', '检验：5 + 9 = 14 > 13 ✓']},
  {q:'直角三角形中，一个锐角是 35°，另一个锐角是（　）°。', a:'55',
   why:'两个锐角的和 = 180° − 90° = 90°，所以另一个是 90° − 35° = 55°。', point:'直角三角形的两个锐角互余，和为 90°', care:'另一个 = 90° − 35° = 55°', steps:['直角三角形的两个锐角互余，和是 90°', '另一个锐角 = 90° − 35° = 55°', '检验：35° + 55° = 90° ✓']}
];

/* 装配四档练习（巩固 / 动手 / 扩展 / 五星挑战） */
bootCourse([
  {key:'basic', title:'第一档 · 巩固基础（特性 · 三边关系 · 分类 · 内角和）', prefix:'基', star:3,
   choice:BASIC_CHOICE, fill:BASIC_FILL,
   host:'#basicBlock', score:'#scoreBasic', total:'#totalBasic', reset:'#btnResetBasic'},
  {key:'hand', title:'第二档 · 动手操作（摆小棒 · 分类判断 · 画高）', prefix:'动', star:3,
   choice:HAND_CHOICE, fill:HAND_FILL,
   host:'#handBlock', score:'#scoreHand', total:'#totalHand', reset:'#btnResetHand'},
  {key:'ext', title:'第三档 · 扩展思维（推理 · 角度计算 · 易错辨析）', prefix:'拓', star:4,
   choice:EXT_CHOICE, fill:EXT_FILL,
   host:'#extBlock', score:'#scoreExt', total:'#totalExt', reset:'#btnResetExt'},
  {key:'star5', title:'第四档 · 五星挑战（浅奥思维）', prefix:'奥', star:5,
   choice:STAR5_CHOICE, fill:STAR5_FILL,
   host:'#star5Block', score:'#scoreStar5', total:'#totalStar5', reset:'#btnResetStar5'}
]);
