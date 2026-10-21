/* ==========================================================================
   第二单元 角的度量 —— 交互模块
   角度约定：数学正方向 = 逆时针；polar() 换算时翻 y；圆弧一律用 arcPoints()
   教学口径：量角器内圈 0° 在右端、外圈 0° 在左端；锐角读内圈、钝角读外圈
   ========================================================================== */

/* ==========================================================================
   ① 线段 / 射线 / 直线
   ========================================================================== */
(function initLine(){
  const stage = $('#lineStage'), note = $('#lineNote');
  let step = 0;
  const KINDS = [
    {name:'线段', ends:2, dir:0},
    {name:'射线', ends:1, dir:1},
    {name:'直线', ends:0, dir:2}
  ];
  /* 箭头：dir=1 向右，dir=-1 向左；箭头长 16、底边宽 18 */
  const arrow = (g, x, y, dir, color) => {
    const L = 16, W = 9;
    s('polygon', {points:`${x + dir*L},${y} ${x},${y-W} ${x},${y+W}`, fill:color}, g);
  };
  function render(){
    stage.innerHTML = '';
    const W = 460, H = 188;
    const svg = s('svg', {viewBox:`0 0 ${W} ${H}`, width:W, height:H});
    stage.appendChild(svg);
    KINDS.forEach((k, i) => {
      const y = 58 + i * 58, x0 = 200, len = 75 + step * 40;
      const g = s('g', {}, svg);
      if (k.name === '线段'){
        s('line', {x1:x0, y1:y, x2:x0+len, y2:y, stroke:'#2f6fd0', 'stroke-width':4, 'stroke-linecap':'round'}, g);
        s('circle', {cx:x0, cy:y, r:6, fill:'#20304a'}, g);
        s('circle', {cx:x0+len, cy:y, r:6, fill:'#20304a'}, g);
        if (step > 0){
          /* 线段不能延长：圈出两个端点并标注 */
          s('circle', {cx:x0, cy:y, r:11, fill:'none', stroke:'#f08a24', 'stroke-width':2.5}, g);
          s('circle', {cx:x0+len, cy:y, r:11, fill:'none', stroke:'#f08a24', 'stroke-width':2.5}, g);
          label(svg, x0 + len + 18, y - 16, '两个端点，不能再延长', {size:13, fill:'#b35c00', anchor:'start'});
        }
      } else if (k.name === '射线'){
        s('line', {x1:x0, y1:y, x2:x0+len, y2:y, stroke:'#1f9d6b', 'stroke-width':4, 'stroke-linecap':'round'}, g);
        s('circle', {cx:x0, cy:y, r:6, fill:'#20304a'}, g);
        arrow(g, x0+len, y, 1, '#1f9d6b');
        if (step > 0){
          /* 射线向一个方向无限延伸 */
          s('line', {x1:x0+len+18, y1:y, x2:x0+len+len*0.8, y2:y, stroke:'#9db4d8', 'stroke-width':3, 'stroke-dasharray':'7 6'}, g);
          arrow(g, x0+len+len*0.8, y, 1, '#9db4d8');
          label(svg, x0 + len + 20, y - 16, '向一个方向无限延伸', {size:13, fill:'#4b5f7d', anchor:'start'});
        }
      } else {
        s('line', {x1:x0-len, y1:y, x2:x0+len, y2:y, stroke:'#7a4fd6', 'stroke-width':4, 'stroke-linecap':'round'}, g);
        arrow(g, x0-len, y, -1, '#7a4fd6');
        arrow(g, x0+len, y, 1, '#7a4fd6');
        if (step > 0){
          s('line', {x1:x0-len-len*0.7, y1:y, x2:x0-len-18, y2:y, stroke:'#9db4d8', 'stroke-width':3, 'stroke-dasharray':'7 6'}, g);
          arrow(g, x0-len-len*0.7, y, -1, '#9db4d8');
          s('line', {x1:x0+len+18, y1:y, x2:x0+len+len*0.7, y2:y, stroke:'#9db4d8', 'stroke-width':3, 'stroke-dasharray':'7 6'}, g);
          arrow(g, x0+len+len*0.7, y, 1, '#9db4d8');
          label(svg, x0 + len + 20, y - 16, '向两个方向无限延伸', {size:13, fill:'#4b5f7d', anchor:'start'});
        }
      }
      label(svg, 26, y - 15, k.name, {size:16, anchor:'start', fill:'#20304a'});
    });

    const msgs = [
      '线段有 <b>2 个端点</b>，可以量出长度；射线有 <b>1 个端点</b>；直线<b>没有端点</b>。点"延伸"看它们怎么变。',
      '线段：<b>不能</b>再延长——两个端点是它的一部分。',
      '射线：可以向<b>一个方向</b>无限延伸。',
      '直线：可以向<b>两个方向</b>无限延伸。'
    ];
    note.innerHTML = msgs[Math.min(step, msgs.length-1)];
  }
  $('#btnLineExtend').addEventListener('click', () => { step = (step + 1) % 4; render(); });
  $('#btnLineReset').addEventListener('click', () => { step = 0; render(); });
  render();
})();

/* ==========================================================================
   ② 角的再认识
   ========================================================================== */
(function initAngle(){
  const range = $('#angRange'), lab = $('#angLabel'), stage = $('#angStage'), note = $('#angNote');
  function classify(t){
    if (t === 0) return ['这个角的两条边重合了，还不能叫角。', 'var(--ink2)'];
    if (t < 90) return ['<b>锐角</b>：大于 0° 而小于 90° 的角。', 'var(--green)'];
    if (t === 90) return ['<b>直角</b>：两条边互相垂直，张成 90°。', 'var(--accent)'];
    if (t < 180) return ['<b>钝角</b>：大于 90° 而小于 180° 的角。', 'var(--orange)'];
    if (t === 180) return ['<b>平角</b>：两条边成一条直线，张成 180°。', 'var(--purple)'];
    if (t < 360) return ['比平角还大的角，本单元暂不研究。', 'var(--ink2)'];
    return ['<b>周角</b>：一条边绕顶点转了一整圈，张成 360°。', 'var(--red)'];
  }
  function render(){
    const t = +range.value;
    lab.textContent = t + '°';
    stage.innerHTML = '';
    const svg = s('svg', {viewBox:'0 0 420 300', width:420, height:300});
    stage.appendChild(svg);
    const cx = 200, cy = 250;
    s('circle', {cx, cy, r:6, fill:'#20304a'}, svg);
    drawAngle(svg, cx, cy, 0, t, {r:150, color:'#2f6fd0', arcColor:'#f08a24', arcR:40, label:t + '°'});
    /* 标出两条边 */
    const pA = polar(cx, cy, 160, 0), pB = polar(cx, cy, 160, t);
    label(svg, pA[0], pA[1] + 16, 'OA', {size:14, fill:'#4b5f7d'});
    label(svg, pB[0] + (t > 90 ? -14 : 10), pB[1] - 8, 'OB', {size:14, fill:'#4b5f7d'});
    const [msg, color] = classify(t);
    note.innerHTML = `这个角是 ${t}°。${msg}`;
    note.style.borderLeftColor = color;
  }
  range.addEventListener('input', render);
  $('#btnAngReset').addEventListener('click', () => { range.value = 60; render(); });
  render();
})();

/* 角的大小与边长无关 */
(function initStretch(){
  const stage = $('#angStretchStage'), note = $('#angStretchNote');
  let long = false;
  function render(){
    stage.innerHTML = '';
    const svg = s('svg', {viewBox:'0 0 460 260', width:460, height:260});
    stage.appendChild(svg);
    const r = long ? 210 : 110;
    const cx = 90, cy = 210;
    drawAngle(svg, cx, cy, 0, 55, {r, color:'#2f6fd0', arcColor:'#f08a24', arcR:34, label:'55°'});
    label(svg, cx + 70, cy + 26, long ? '边变长了' : '边比较短', {size:15, fill:'#4b5f7d'});
    note.innerHTML = long
      ? '两条边都<b>拉长</b>了，可是角的大小还是 <b>55°</b>——<b>角的大小与边画多长没有关系</b>，只与两条边张开的程度有关。'
      : '点"把边拉长"，比较两次的度数。';
  }
  $('#btnAngStretch').addEventListener('click', () => { long = !long; render(); });
  $('#btnAngStretchReset').addEventListener('click', () => { long = false; render(); });
  render();
})();

/* ==========================================================================
   ③ 量角器
   ========================================================================== */
/* 画一个量角器：内圈 0 在右端、外圈 0 在左端 */
function drawProtractor(svg, cx, cy, R){
  const g = s('g', {}, svg);
  /* 半圆外框 */
  s('path', {d:`M ${cx-R} ${cy} A ${R} ${R} 0 0 1 ${cx+R} ${cy}`, fill:'rgba(240,138,36,.10)',
    stroke:'#f08a24', 'stroke-width':2}, g);
  /* 0 刻度线（左右两条） */
  s('line', {x1:cx-R, y1:cy, x2:cx+R, y2:cy, stroke:'#c96f12', 'stroke-width':1.2, 'stroke-dasharray':'5 5'}, g);
  const rIn = R - 44, rIn2 = R - 26;     /* 内圈刻度 */
  const rOut = R + 3, rOut2 = R + 16;    /* 外圈刻度 */
  for (let v = 0; v <= 180; v++){
    const big = (v % 10 === 0), mid = (v % 5 === 0);
    /* 内圈：值 v 在几何角 φ = v */
    const p1 = polar(cx, cy, rIn, v), p2 = polar(cx, cy, big ? rIn2 : (mid ? rIn2 - 4 : rIn2 - 2), v);
    s('line', {x1:p1[0], y1:p1[1], x2:p2[0], y2:p2[1], stroke:'#b35c00', 'stroke-width':big ? 1.4 : 0.7}, g);
    /* 外圈：值 v 在几何角 φ = 180 - v */
    const q1 = polar(cx, cy, rOut, 180 - v), q2 = polar(cx, cy, big ? rOut2 : (mid ? rOut2 - 3 : rOut2 - 1.5), 180 - v);
    s('line', {x1:q1[0], y1:q1[1], x2:q2[0], y2:q2[1], stroke:'#b35c00', 'stroke-width':big ? 1.4 : 0.7}, g);
  }
  /* 数字：内圈在内侧（每 10°），外圈在外侧（每 10°） */
  for (let v = 0; v <= 180; v += 10){
    const ip = polar(cx, cy, R - 60, v);
    haloText(g, ip[0], ip[1], v, null, {size:11, fill:'#b35c00', rot:false});
    const op = polar(cx, cy, R + 32, 180 - v);
    haloText(g, op[0], op[1], v, null, {size:12, fill:'#b35c00', rot:false});
  }
  return g;
}
/* 高亮某一圈在 [from,to] 范围内的读数区 */
function highlightScale(g, cx, cy, R, ring, from, to, color){
  const rr = ring === 'inner' ? R - 46 : R + 22;
  const a = arcPoints(cx, cy, rr, from, to - from);
  s('path', {d:a.d, fill:'none', stroke:color, 'stroke-width':10, 'stroke-linecap':'round', opacity:.85}, g);
  /* 读数落在"弧的末端"——也就是另一边射线与刻度圈相交的位置 */
  const end = polar(cx, cy, rr, to);
  const txt = polar(cx, cy, rr + (ring === 'inner' ? -42 : 26), to);
  return {end, txt};
}
(function initMeasure(){
  const range = $('#pmRange'), lab = $('#pmLabel'), stage = $('#pmStage'),
        note = $('#pmNote'), steps = $('#pmSteps');
  let step = 0;
  function render(){
    const th = +range.value;
    lab.textContent = th + '°';
    const acute = th <= 90;
    stage.innerHTML = '';
    const svg = s('svg', {viewBox:'0 0 540 380', width:540, height:380});
    stage.appendChild(svg);
    const cx = 270, cy = 320, R = 175;
    const g = drawProtractor(svg, cx, cy, R);
    /* 0 刻度线（与角的一条边重合） */
    const a0 = acute ? 0 : 180;
    s('line', {x1:cx, y1:cy, x2:polar(cx, cy, R + 30, a0)[0], y2:polar(cx, cy, R + 30, a0)[1],
      stroke:'#2f6fd0', 'stroke-width':1.4, 'stroke-dasharray':'6 5'}, g);
    /* 角 */
    const a1 = acute ? 0 : 180, a2 = acute ? th : 180 - th;
    drawAngle(svg, cx, cy, a1, a2, {r:R - 8, color:'#2f6fd0', arcColor:'#f08a24', arcR:38});
    /* 读数 */
    let msg;
    if (step === 0){
      msg = '第 ① 步：把<b>量角器的中心</b>与角的<b>顶点</b>重合。';
    } else if (step === 1){
      msg = `第 ② 步：让量角器的 <b>${acute ? '内圈' : '外圈'} 0 刻度线</b>与角的一条边重合。` +
            (acute ? '锐角用内圈 0（内圈 0 在<b>右端</b>）。' : '钝角要把量角器<b>转过来</b>，用<b>外圈 0</b>（外圈 0 在<b>左端</b>）。');
    } else if (step === 2){
      const from = acute ? 0 : 180, to = acute ? th : 180 - th;
      const h = highlightScale(g, cx, cy, R, acute ? 'inner' : 'outer', from, to, '#1f9d6b');
      haloText(g, h.txt[0], h.txt[1], th + '°', null, {size:17, fill:'#126b47', rot:false});
      msg = `第 ③ 步：另一边所对的刻度是 <b>${th}°</b>（读<b>${acute ? '内' : '外'}圈</b>）。`;
    } else {
      const from = acute ? 0 : 180, to = acute ? th : 180 - th;
      const h = highlightScale(g, cx, cy, R, acute ? 'inner' : 'outer', from, to, '#1f9d6b');
      haloText(g, h.txt[0], h.txt[1], th + '°', null, {size:17, fill:'#126b47', rot:false});
      msg = `这个角是 <b>${th}°</b>，是<b>${acute ? '锐角' : '钝角'}</b>。` +
            (acute ? '锐角读<b>内圈</b>。' : '钝角读<b>外圈</b>；如果错读内圈，就会读成 ' + (180 - th) + '°！');
    }
    steps.innerHTML = ['① 中心对顶点','② 0 刻度线对边','③ 读另一边所对刻度','④ 结论']
      .map((l, i) => `<div class="dot ${i < step ? 'done' : (i === step ? 'on' : '')}" title="${l}">${i+1}</div>`).join('');
    note.innerHTML = msg;
  }
  range.addEventListener('input', () => { step = 0; render(); });
  $('#btnPmStep').addEventListener('click', () => { step = (step + 1) % 4; render(); });
  $('#btnPmReset').addEventListener('click', () => { step = 0; range.value = 40; render(); });
  render();
})();

/* 内外圈对比（115° 陷阱） */
(function initTrap(){
  const stage = $('#trapStage'), note = $('#trapNote');
  function render(){
    const th = 115;
    stage.innerHTML = '';
    const svg = s('svg', {viewBox:'0 0 540 380', width:540, height:380});
    stage.appendChild(svg);
    const cx = 270, cy = 320, R = 175;
    const g = drawProtractor(svg, cx, cy, R);
    const a2 = 180 - th;
    drawAngle(svg, cx, cy, 180, a2, {r:R - 8, color:'#2f6fd0', arcColor:'#f08a24', arcR:38});
    /* 正确：外圈 0 在左（φ=180），读到 φ=a2 处 = th */
    const hO = highlightScale(g, cx, cy, R, 'outer', a2, 180, '#1f9d6b');
    haloText(g, hO.txt[0], hO.txt[1] + 26, '外圈读 ' + th + '° ✓', null, {size:15, fill:'#126b47', rot:false});
    /* 错误：读内圈同一位置 = 180 - th */
    const midI = polar(cx, cy, R - 60, a2);
    haloText(g, midI[0], midI[1], '内圈 ' + (180 - th) + '° ✗', null, {size:14, fill:'#c0392b', rot:false});
    note.innerHTML = `读<b>外圈</b>是 <b>${th}°</b>（正确）；同一位置读<b>内圈</b>却是 <b>${180-th}°</b>——这就是"115° 被读成 65°"的原因。` +
      `<br>记法：<b>锐角读内圈，钝角读外圈</b>。`;
  }
  $('#btnTrap').addEventListener('click', render);
  render();
})();

/* ==========================================================================
   ④ 画角
   ========================================================================== */
(function initDraw(){
  const range = $('#drRange'), lab = $('#drLabel'), stage = $('#drStage'),
        note = $('#drNote'), steps = $('#drSteps');
  let step = 0;
  function render(){
    const th = +range.value;
    lab.textContent = th + '°';
    stage.innerHTML = '';
    const svg = s('svg', {viewBox:'0 0 460 320', width:460, height:320});
    stage.appendChild(svg);
    const cx = 90, cy = 250, R = 120;
    /* 第①步：射线 OA */
    s('line', {x1:cx, y1:cy, x2:cx + R + 60, y2:cy, stroke:'#2f6fd0', 'stroke-width':3, 'stroke-linecap':'round'}, svg);
    s('circle', {cx, cy, r:4.5, fill:'#20304a'}, svg);
    label(svg, cx + R + 66, cy + 5, 'A', {size:15, fill:'#4b5f7d'});
    /* 第②步：以 A 为圆心画弧 */
    const arcC = [cx + R, cy];
    if (step >= 1){
      s('path', {d:`M ${arcC[0]-R} ${arcC[1]} A ${R} ${R} 0 0 1 ${arcC[0]+R} ${arcC[1]}`,
        fill:'none', stroke:'#f08a24', 'stroke-width':2.5}, svg);
      s('circle', {cx:arcC[0], cy:arcC[1], r:4.5, fill:'#f08a24'}, svg);
      label(svg, arcC[0] + 14, arcC[1] + 20, '弧', {size:13, fill:'#b35c00'});
    }
    /* 第③步：用量角器在弧上找点 C */
    let C = null;
    if (step >= 2){
      const g = drawProtractor(svg, arcC[0], arcC[1], 118);
      const p = polar(arcC[0], arcC[1], 118, 180 - th);
      C = p;
      s('circle', {cx:p[0], cy:p[1], r:6, fill:'#1f9d6b'}, svg);
      label(svg, p[0] - 16, p[1] - 8, 'C', {size:15, fill:'#126b47'});
    }
    /* 第④步：连接 OC 并标度数 */
    if (step >= 3 && C){
      s('line', {x1:cx, y1:cy, x2:C[0], y2:C[1], stroke:'#2f6fd0', 'stroke-width':3, 'stroke-linecap':'round'}, svg);
      const arc = arcPoints(cx, cy, 34, 0, 180 - th);
      s('path', {d:arc.d, fill:'none', stroke:'#f08a24', 'stroke-width':3.5}, svg);
      const mid = polar(cx, cy, 34, (180 - th) / 2);
      haloText(svg, mid[0], mid[1], th + '°', null, {size:15, fill:'#b35c00', rot:false});
    }
    const msgs = [
      '第 ① 步：<b>画一条射线 OA</b>，以 A 为角的顶点。',
      '第 ② 步：<b>以 A 为圆心</b>，用圆规画一条弧，交 OA 于一点（弧要画得长一些）。',
      '第 ③ 步：把<b>量角器</b>放在弧上，中心对准 A，读出 ' + th + '° 的位置，点上点 C。',
      '第 ④ 步：<b>连接 A 与 C</b>，标出角的度数 ' + th + '°。画好了！'
    ];
    steps.innerHTML = ['①画射线','②画弧','③找点','④连点标度']
      .map((l, i) => `<div class="dot ${i < step ? 'done' : (i === step ? 'on' : '')}" title="${l}">${i+1}</div>`).join('');
    note.innerHTML = msgs[Math.min(step, msgs.length-1)];
  }
  range.addEventListener('input', () => { step = 0; render(); });
  $('#btnDrStep').addEventListener('click', () => { step = (step + 1) % 4; render(); });
  $('#btnDrAll').addEventListener('click', () => { step = 3; render(); });
  $('#btnDrReset').addEventListener('click', () => { step = 0; range.value = 65; render(); });
  render();
})();

/* ==========================================================================
   ⑤ 角的计算（拼角）
   ========================================================================== */
(function initCalc(){
  const r1 = $('#c1Range'), r2 = $('#c2Range'), stage = $('#calcStage'),
        note = $('#calcNote'), lab = $('#calcLabel');
  function render(){
    let a1 = +r1.value, a2 = +r2.value;
    if (a1 + a2 > 175){ if (document.activeElement === r1) a1 = 175 - a2; else a2 = 175 - a1;
      r1.value = a1; r2.value = a2; }
    const a3 = 180 - a1 - a2;
    lab.textContent = `∠1=${a1}°  ∠2=${a2}°  ∠3=${a3}°`;
    stage.innerHTML = '';
    const svg = s('svg', {viewBox:'0 0 460 270', width:460, height:270});
    stage.appendChild(svg);
    const cx = 230, cy = 230, R = 175;
    /* 平角 */
    s('line', {x1:cx - R, y1:cy, x2:cx + R, y2:cy, stroke:'#2f6fd0', 'stroke-width':3, 'stroke-linecap':'round'}, svg);
    const p1 = polar(cx, cy, R, 180 - a1), p2 = polar(cx, cy, R, 180 - a1 - a2);
    s('line', {x1:cx, y1:cy, x2:p1[0], y2:p1[1], stroke:'#2f6fd0', 'stroke-width':3, 'stroke-linecap':'round'}, svg);
    s('line', {x1:cx, y1:cy, x2:p2[0], y2:p2[1], stroke:'#2f6fd0', 'stroke-width':3, 'stroke-linecap':'round'}, svg);
    s('circle', {cx, cy, r:4.5, fill:'#20304a'}, svg);
    const A1 = arcPoints(cx, cy, 52, 180 - a1, a1);
    const A2 = arcPoints(cx, cy, 52, 180 - a1 - a2, a2);
    const A3 = arcPoints(cx, cy, 52, 0, 180 - a1 - a2);
    s('path', {d:A1.d, fill:'none', stroke:'#f08a24', 'stroke-width':4}, svg);
    s('path', {d:A2.d, fill:'none', stroke:'#7a4fd6', 'stroke-width':4}, svg);
    s('path', {d:A3.d, fill:'none', stroke:'#1f9d6b', 'stroke-width':4}, svg);
    const m1 = polar(cx, cy, 52, 180 - a1 / 2), m2 = polar(cx, cy, 52, 180 - a1 - a2 / 2),
          m3 = polar(cx, cy, 52, (180 - a1 - a2) / 2);
    haloText(svg, m1[0], m1[1], a1 + '°', null, {size:14, fill:'#b35c00', rot:false});
    haloText(svg, m2[0], m2[1], a2 + '°', null, {size:14, fill:'#7a4fd6', rot:false});
    haloText(svg, m3[0], m3[1], a3 + '°', null, {size:14, fill:'#126b47', rot:false});
    note.innerHTML = `平角是 <b>180°</b>，所以 <b>∠1 + ∠2 + ∠3 = 180°</b>，` +
      `<b>∠3 = 180° − ${a1}° − ${a2}° = ${a3}°</b>。`;
  }
  r1.addEventListener('input', render); r2.addEventListener('input', render);
  $('#btnCalcReset').addEventListener('click', () => { r1.value = 60; r2.value = 50; render(); });
  render();
})();

/* ==========================================================================
   练习用的迷你角图（题目内嵌 SVG）
   ========================================================================== */
function miniAngleSVG(theta, opt){
  const o = Object.assign({w:130, h:100, mark:true}, opt||{});
  const cy = o.h - 20;
  /* 顶点与半径自适应：保证两条边的端点都落在画布内（钝角时尤其重要） */
  const cosT = Math.cos(theta * Math.PI / 180);
  let r = 82, cx = 26;
  if (cosT < 0){
    cx = 8 - r * cosT;
    if (cx + r > 122){ r = 122 - cx; }
  }
  const p1 = polar(cx, cy, r, 0), p2 = polar(cx, cy, r, theta);
  const arc = arcPoints(cx, cy, 24, 0, theta);
  return `<svg width="${o.w}" height="${o.h}" viewBox="0 0 ${o.w} ${o.h}" style="vertical-align:middle;background:#fbfcff;border:1px solid #e3e9f2;border-radius:8px">` +
    `<line x1="${cx}" y1="${cy}" x2="${p1[0]}" y2="${p1[1]}" stroke="#2f6fd0" stroke-width="2.5" stroke-linecap="round"/>` +
    `<line x1="${cx}" y1="${cy}" x2="${p2[0]}" y2="${p2[1]}" stroke="#2f6fd0" stroke-width="2.5" stroke-linecap="round"/>` +
    `<path d="${arc.d}" fill="none" stroke="#f08a24" stroke-width="2.5"/>` +
    `<circle cx="${cx}" cy="${cy}" r="3.2" fill="#20304a"/></svg>`;
}

/* ==========================================================================
   分层练习数据
   ========================================================================== */
const BASIC_CHOICE = [
  {q:'下面说法正确的是（　）。',
   opts:['线段有两个端点，可以向两端无限延长','射线只有一个端点，可以向一个方向无限延伸',
         '直线没有端点，只能向一个方向无限延伸','射线有两个端点'], a:1,
   why:'线段有两个端点，长度有限；射线一个端点、一端无限延伸；直线没有端点、两端无限延伸。'},
  {q:'角的大小与（　）有关。',
   opts:['边画的长短','顶点的位置','两条边张开的大小','角的大小和边长都有关'], a:2,
   why:'角的大小只看两条边张开的程度，与边画多长完全无关。'},
  {q:'1 个周角等于（　）个直角。', opts:['2','3','4','6'], a:2,
   why:'周角 360°，直角 90°，360 ÷ 90 = 4。'},
  {q:'115° 的角是（　）。', opts:['锐角','直角','钝角','平角'], a:2,
   why:'大于 90° 小于 180° 的角是钝角。'},
  {q:'量角时，量角器的中心要和角的（　）重合。', opts:['一条边','顶点','角的两边','任意一点'], a:1,
   why:'三步法第①步：量角器中心与角的顶点重合。'},
  {q:'下面各角中，（　）是钝角。',
   opts:['89°','90°','135°','180°'], a:2,
   why:'只有 135° 满足大于 90° 小于 180°。'},
  {q:'钟面上 3 时整，时针与分针的夹角是（　）。',
   opts:['30°','60°','90°','120°'], a:2,
   why:'钟面一圈 360°，分成 12 大格，每格 30°；3 时整相差 3 大格 = 90°。'},
  {q:'用量角器量角时，下面做法正确的是（　）。',
   opts:['量角器中心对准角的顶点，0 刻度线与角的一条边重合',
         '量角器中心对准角的一条边，0 刻度线与顶点重合',
         '把角的一条边对准量角器的外框',
         '量角器中心对准顶点，读数时看离角远的那一圈'], a:0,
   why:'三步法：中心对顶点 → 0 刻度线对边 → 读另一边所对的刻度。'}
];

const BASIC_FILL = [
  {q:'线段有（　）个端点，射线有（　）个端点。', a:['2','1'],
   why:'线段两个端点，射线一个端点，直线没有端点。'},
  {q:'锐角是大于 0° 而小于（　）° 的角。', a:'90', why:'直角是 90°，比它小的是锐角。'},
  {q:'平角是（　）°，周角是（　）°。', a:['180','360'],
   why:'平角两条边成一条直线，周角一条边转一整圈。'},
  {q:'一个角由（　）个顶点和（　）条射线组成。', a:['1','2'],
   why:'角由一个顶点和两条射线组成。'},
  {q:'∠AOB 和 ∠BOA 是（　）个角（填"同一个"或"两个"）。', a:'同一个',
   why:'角的顶点是中间那个字母，两条边换了顺序，读法不同但指的是同一个角。'},
  {q:'钟面上 6 时整，时针与分针成（　）° 的角。', a:'180',
   why:'6 时整两针正好相反，是平角。'},
  {q:'把一个平角分成两个角，其中一个是 65°，另一个是（　）°。', a:'115',
   why:'平角 180°，180 − 65 = 115。'},
  {q:'一个直角被分成两个角，其中一个是 35°，另一个是（　）°。', a:'55',
   why:'直角 90°，90 − 35 = 55。'}
];

const HAND_CHOICE = [
  {q:'用量角器量角时，下面做法正确的是（　）。',
   opts:['量角器的中心与角的顶点重合','量角器的中心与角的顶点不重合','把角的顶点放在量角器的边缘',
         '只要看到刻度就可以读数'], a:0,
   why:'中心与顶点重合，才能保证读到的刻度对得上这个角。'},
  {q:'画一个 40° 的角，正确的步骤是（　）。',
   opts:['画射线 → 画弧 → 用量角器找点 → 连线并标度数',
         '画弧 → 画射线 → 连线 → 标度数',
         '量角 → 画射线 → 标度数',
         '画射线 → 连线 → 标度数 → 画弧'], a:0,
   why:'先定一条边，再画弧定半径，再找点，连线标度数。'},
  {q:'量一个 115° 的角，应该读（　）。',
   opts:['内圈刻度','外圈刻度','任意一圈','两圈都可以'], a:1,
   why:'钝角读外圈；读内圈会误读成 65°。'},
  {q:'两个角拼成一个平角，其中一个角是 100°，另一个角是（　）。',
   opts:['80°','90°','100°','170°'], a:0,
   why:'平角 180°，180 − 100 = 80。'}
];

const HAND_FILL = [
  {q:'量一量，下图中的角是（　）°。　' + miniAngleSVG(65),
   a:'65', why:'把量角器中心对准顶点、0 刻度线对准一条边，读另一边所对的刻度。'},
  {q:'量一量，下图中的角是（　）°。　' + miniAngleSVG(115),
   a:'115', why:'这是钝角，要读外圈；别读成 65°。'},
  {q:'量一量，下图中的角是（　）°。　' + miniAngleSVG(30),
   a:'30', why:'每小格 1°、每大格 10°，数一数刻度。'},
  {q:'一个平角被分成三个角，分别是 50°、60° 和（　）°。', a:'70',
   why:'50 + 60 + ∠ = 180，所以 ∠ = 70。'},
  {q:'三角尺上最大的角是（　）°。', a:'90', why:'一块三角尺上有 45°、45°、90° 三种角。'},
  {q:'用一副三角尺拼成一个角，最大的角是（　）°。', a:'135',
   why:'90° + 45° = 135°。'},
  {q:'钟面上 8 时整，时针与分针的夹角是（　）°。', a:'120',
   why:'相差 8 − 4 = 4 个大格，4 × 30° = 120°。'},
  {q:'把一个周角分成两个角，其中一个是 100°，另一个是（　）°。', a:'260',
   why:'周角 360°，360 − 100 = 260。'}
];

const EXT_CHOICE = [
  {q:'量角时，把 115° 错读成 65°，最可能的原因是（　）。',
   opts:['量角器中心没有对准顶点','钝角读了内圈刻度','角的一条边没有和 0 刻度线重合','数错了小格数'], a:1,
   why:'115° 所在位置的内圈读数正好是 65°，这是最典型的陷阱。'},
  {q:'钟面上 3 时 30 分，时针与分针的夹角是（　）。',
   opts:['75°','90°','105°','150°'], a:0,
   why:'分针在 6（180°），时针在 3 与 4 正中（105°），相差 75°。'},
  {q:'把一个周角分成三个角，其中两个都是 100°，第三个是（　）。',
   opts:['100°','160°','180°','260°'], a:1,
   why:'360 − 100 − 100 = 160。'},
  {q:'∠AOB = ∠BOC，∠AOC = 90°，那么 ∠BOC 是（　）。',
   opts:['45°','90°','135°','180°'], a:0,
   why:'OB 把 ∠AOC 平分成两个相等的角：90 ÷ 2 = 45。'},
  {q:'两个角拼成一个直角，其中一个角是 38°，另一个角是（　）。',
   opts:['38°','45°','52°','62°'], a:2,
   why:'90 − 38 = 52。'},
  {q:'下面说法正确的是（　）。',
   opts:['角的两条边画得越长，角就越大','角的大小只与边张开的大小有关',
         '周角比平角大，所以它不是角','钝角一定比直角大'], a:1,
   why:'角的大小与边长无关；周角、平角都是角；钝角大于直角。'}
];

const EXT_FILL = [
  {q:'一个角的内部画一条射线，把它分成两个角，其中一个是 55°，原来的角最大可能是（　）°。',
   a:'235', why:'两个角都大于 55°，原来的角最大 110 + 125 = 235°；先想一想：原来角的两部分各能到 180°。'},
  {q:'把一个平角分成两个角，其中一个角比另一个角大 30°，较小的角是（　）°。',
   a:'75', why:'两角和 180°，差 30°，小角 = (180 − 30) ÷ 2 = 75。'},
  {q:'钟面上从 3 时到 7 时，时针转过的角度是（　）°。',
   a:'120', why:'4 个大格 × 30° = 120°。'},
  {q:'钟面上分针从 12 走到 6，转过的角度是（　）°。',
   a:'180', why:'分针 1 分钟转 6°，30 分钟转 180°。'},
  {q:'一个直角加上一个平角，和是（　）°。',
   a:'270', why:'90 + 180 = 270。'},
  {q:'钟面上 4 时整，时针与分针的夹角是（　）°。',
   a:'120', why:'4 时整相差 4 个大格（从 12 到 4 是 4 格，从 4 到 6 是 2 格，共 4 格），4 × 30 = 120。'}
];

bootCourse([
  {key:'basic', title:'第一档 · 巩固基础（线与角、分类、量角器）', prefix:'基',
   choice:BASIC_CHOICE, fill:BASIC_FILL,
   host:'#basicBlock', score:'#scoreBasic', total:'#totalBasic', reset:'#btnResetBasic'},
  {key:'hand', title:'第二档 · 动手操作（看图量角、画角、拼角）', prefix:'动',
   choice:HAND_CHOICE, fill:HAND_FILL,
   host:'#handBlock', score:'#scoreHand', total:'#totalHand', reset:'#btnResetHand'},
  {key:'ext', title:'第三档 · 扩展思维（钟面角、推理、易错辨析）', prefix:'拓',
   choice:EXT_CHOICE, fill:EXT_FILL,
   host:'#extBlock', score:'#scoreExt', total:'#totalExt', reset:'#btnResetExt'}
]);
