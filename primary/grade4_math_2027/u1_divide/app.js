/* ==========================================================================
   第一单元 除数是两位数的除法 —— 交互模块
   口径：试商把除数看作接近的整十数（四舍五入）；商大了调小、商小了调大；
        每次调 1；余数必须比除数小；除到哪一位，商写在那一位上面。
   ========================================================================== */

/* ==========================================================================
   ① 口算除法 —— 想乘法算除法
   ========================================================================== */
(function initOral(){
  const a = $('#oralA'), b = $('#oralB'), lab = $('#oralLabel');
  const stage = $('#oralStage'), note = $('#oralNote');
  /* 讲解用：0 常态 / 1 突出"想乘法算除法" / 2 藏起结果（提问） */
  let mode = 0;
  function render(){
    const tens = +a.value, d = +b.value;          /* 被除数 = tens×10，除数 = d×10 */
    const A = tens * 10, B = d * 10;
    lab.textContent = A + ' ÷ ' + B + ' = ?';
    stage.innerHTML = '';
    const W = 640, H = 250;
    const svg = s('svg', {viewBox:`0 0 ${W} ${H}`, width:W, height:H});
    stage.appendChild(svg);
    /* 被除数：tens 根小棒，每根 10。
       横向按可用宽度自适应（小棒宽度/间距随根数收缩），右侧留出算式区，
       保证根数最多时也不出框。 */
    const AREA_X = 30, AREA_W = 420;      /* 小棒可用区域 */
    const by = 168, maxH = 96;
    const pitch = Math.min(30, AREA_W / tens);
    const bh = Math.max(10, Math.min(22, pitch - 6));
    const gap = pitch - bh;
    const bx = AREA_X + (AREA_W - tens * pitch) / 2;
    const unitH = Math.min(bh * 10, maxH);
    for (let i = 0; i < tens; i++){
      const x = bx + i * pitch;
      s('rect', {x, y:by - unitH, width:bh, height:unitH, rx:3, fill:'#2f6fd0', opacity:.85}, svg);
      label(svg, x + bh/2, by + 20, '10', {size:11.5, fill:'#4b5f7d'});
    }
    /* 分组：每 B(=d×10) 涂成一组 */
    const per = B / 10;                             /* 每组几根 */
    for (let i = 0; i < tens; i++){
      const gi = Math.floor(i / per);
      const x = bx + i * pitch;
      s('rect', {x, y:by - unitH, width:bh, height:unitH, rx:3, fill:'none',
        stroke: gi % 2 ? '#f08a24' : '#1f9d6b', 'stroke-width':2.4}, svg);
    }
    /* 除法竖式 */
    label(svg, 500, 60, A + ' ÷ ' + B + ' =', {size:19, weight:700, fill:'#20304a'});
    const res = A / B;
    const hide = (mode === 2);
    label(svg, 500, 100, hide ? '?' : (Number.isInteger(res) ? String(res) : (res.toFixed(2) + '……')),
      {size:26, weight:800, fill: hide ? '#b6c4d8' : '#1f9d6b'});
    if (mode === 1){
      s('rect', {x:400, y:118, width:210, height:34, rx:8, fill:'#fff8ee',
        stroke:'#f08a24', 'stroke-width':2}, svg);
    }
    label(svg, 500, 140, hide ? ('想：' + B + ' × ? = ?')
      : ('想：' + B + ' × ' + res + ' = ' + A),
      {size:14, weight: mode === 1 ? 700 : 400, fill: mode === 1 ? '#b35c00' : '#4b5f7d'});
    if (mode === 1){
      /* 从分组区拉一条箭头到"想乘法"，把"除法靠乘法想"这层关系画出来 */
      s('path', {d:`M ${AREA_X + AREA_W - 10} ${by - unitH - 26} L 392 ${by - unitH - 26} L 392 135`,
        fill:'none', stroke:'#f08a24', 'stroke-width':1.8, 'stroke-dasharray':'6 5'}, svg);
      label(svg, (AREA_X + AREA_W + 392) / 2, by - unitH - 34,
        `每份 ${B} 根，共 ${res} 份`, {size:13, weight:700, fill:'#b35c00'});
    }
    note.innerHTML = hide
      ? `先别急着看答案：<b>${A} ÷ ${B}</b>，商是几？` +
        `<br>想一想——<b>${B} 乘几</b>才等于 <b>${A}</b>？`
      : (Number.isInteger(res)
      ? `<b>${A} ÷ ${B} = ${res}</b>　想乘法算除法：<b>${B} 乘 ${res} 等于 ${A}</b>，所以商是 ${res}。` +
        `<br>被除数里有 <b>${res} 个 ${B}</b>（每份 ${B}）。`
      : `被除数 ${A} 里有 ${Math.floor(res)} 个 ${B} 还多 ${A % B}，所以商是 ${Math.floor(res)}，余 ${A % B}。`);
  }
  a.addEventListener('input', render);
  b.addEventListener('input', render);
  $('#btnOralReset').addEventListener('click', () => { a.value = 6; b.value = 2; mode = 0; render(); });
  /* 讲解入口：set(被除数÷10, 除数÷10, 模式) */
  window.MOD = window.MOD || {};
  MOD.oral = {
    set(tens, d, m){ a.value = tens; b.value = d; mode = (m == null ? 0 : m); render(); }
  };
  render();
})();

/* ==========================================================================
   ①b 口算除法（二）—— 几百几十除以几十
   ========================================================================== */
(function initOral2(){
  const btn = $('#btnOralStep'), all = $('#btnOralAll'), rst = $('#btnOralR2');
  const stage = $('#oral2Stage'), note = $('#oral2Note'), stepsEl = $('#oralSteps');
  const CASES = [
    {a:240, b:30, unit:'百'},
    {a:350, b:50, unit:'十'},
    {a:480, b:60, unit:'十'},
    {a:120, b:40, unit:'十'}
  ];
  let ci = 0, step = 0;
  function render(){
    const c = CASES[ci];
    const steps = ['① 看被除数末尾有几个 0', '② 去掉相同个数的 0', '③ 按"想乘法算除法"算', '④ 写出结果'];
    stepsEl.innerHTML = steps.map((l, i) =>
      `<div class="dot ${i < step ? 'done' : (i === step ? 'on' : '')}" title="${l}">${i+1}</div>`).join('');
    stage.innerHTML = '';
    const box = document.createElement('div');
    box.style.cssText = 'font-size:19px;font-weight:700;color:#20304a;letter-spacing:1px';
    box.textContent = c.a + ' ÷ ' + c.b + ' = ?';
    stage.appendChild(box);
    if (step === 0){
      note.innerHTML = `第 ① 步：<b>${c.a}</b> 末尾有 <b>${String(c.a).replace(/0+$/,'').length ? (String(c.a).match(/0+$/)||[''])[0].length : 0} 个 0</b>，` +
        `<b>${c.b}</b> 末尾有 <b>${(String(c.b).match(/0+$/)||[''])[0].length} 个 0</b>。` +
        `<br>被除数和除数<b>末尾的 0 个数相同</b>，所以可以同时去掉。`;
    } else if (step === 1){
      const a2 = c.a / 10, b2 = c.b / 10;
      note.innerHTML = `第 ② 步：去掉末尾相同个数的 0，<b>${c.a} ÷ ${c.b} 变成 ${a2} ÷ ${b2}</b>。` +
        `<br><b>注意</b>：去掉 0 后单位变了——原来的<b>${c.unit}</b>变成了<b>${c.unit === '百' ? '十' : '个'}</b>。`;
    } else if (step === 2){
      const a2 = c.a / 10, b2 = c.b / 10;
      note.innerHTML = `第 ③ 步：想乘法算除法——<b>${b2} 乘几等于 ${a2}</b>？` +
        `<br>因为 <b>${b2} × ${a2 / b2} = ${a2}</b>，所以商是 <b>${a2 / b2}</b>。`;
    } else {
      note.innerHTML = `第 ④ 步：<b>${c.a} ÷ ${c.b} = ${c.a / c.b}</b>　` +
        `<br>检验：${c.b} × ${c.a / c.b} = ${c.b * (c.a / c.b)} ✓`;
    }
  }
  btn.addEventListener('click', () => { step = (step + 1) % 4; if (step === 0) ci = (ci + 1) % CASES.length; render(); });
  all.addEventListener('click', () => { step = 3; render(); });
  rst.addEventListener('click', () => { step = 0; ci = 0; render(); });
  /* 讲解入口：set(例序号 0~3, 步序 0~3) */
  window.MOD = window.MOD || {};
  MOD.oral2 = {
    set(i, s){ ci = (i == null ? 0 : i); step = (s == null ? 0 : s); render(); }
  };
  render();
})();

/* ==========================================================================
   ② 笔算除法 —— 竖式分步演示
   ========================================================================== */
(function initVertical(){
  const sel = $('#divSel'), btn = $('#btnDivStep'), all = $('#btnDivAll'), rst = $('#btnDivReset');
  const stage = $('#divStage'), note = $('#divNote'), stepsEl = $('#divSteps');
  const CASES = [
    {a:425, b:25, tip:'先看被除数前两位 <b>42</b>，42÷25 商 <b>1</b>；余 17 落下 5 得 175，175÷25 商 <b>7</b>。'},
    {a:576, b:18, tip:'先看前两位 <b>57</b>，57÷18 商 <b>3</b>；余 3 落下 6 得 36，36÷18 商 <b>2</b>。'},
    {a:936, b:24, tip:'先看前两位 <b>93</b>，93÷24 商 <b>3</b>；余 21 落下 6 得 216，216÷24 商 <b>9</b>。'},
    {a:784, b:28, tip:'先看前两位 <b>78</b>，78÷28 商 <b>2</b>；余 22 落下 4 得 224，224÷28 商 <b>8</b>。'}
  ];
  let step = -1;
  function render(){
    const c = CASES[+sel.value];
    const steps = divSteps(c.a, c.b);
    const total = steps.length;
    stepsEl.innerHTML = steps.map((st, i) =>
      `<div class="dot ${i < step ? 'done' : (i === step ? 'on' : '')}" title="第${i+1}步">${i+1}</div>`).join('');
    stage.innerHTML = '';
    const svg = s('svg', {viewBox:'0 0 640 300', width:640, height:300});
    stage.appendChild(svg);
    const r = drawLongDiv(svg, c.a, c.b, step, {top:140, stepH:78});
    if (step < 0){
      note.innerHTML = `点"下一步"开始。<b>${c.tip}</b>`;
    } else if (step >= total){
      const q = steps.map(x => x.q).join('');
      note.innerHTML = `<b>${c.a} ÷ ${c.b} = ${q}</b>　${c.tip}` +
        `<br><b>竖式三句话</b>：① <b>除到哪一位，商就写在那一位上面</b>；② 每次除得的<b>余数比除数小</b>；③ 商中间的 0 也要写。`;
    } else {
      const st = steps[step];
      const colName = ['个位','十位','百位','千位'][st.col] || '第' + (st.col + 1) + '位';
      note.innerHTML = `第 <b>${step + 1}</b> 步：当前部分 <b>${st.partial}</b> ÷ ${c.b} = 商 <b>${st.q}</b>，` +
        `乘积 <b>${st.prod}</b>，余数 <b>${st.diff}</b>。` +
        `<br>商 <b>${st.q}</b> 写在<b>${colName}</b>上面 —— 因为这一位除完还落下了一位，` +
        `所以要除到<b>${colName}</b>再往上写。` +
        `<br>检验：余数 ${st.diff} ${st.diff < c.b ? '<b>比除数 ' + c.b + ' 小 ✓</b>' : '<b>比除数大 ✗ 要调商</b>'}`;
    }
  }
  sel.addEventListener('change', () => { step = -1; render(); });
  /* step 可以走到 steps.length —— 那是"结论"状态，用来呈现竖式三句话 */
  btn.addEventListener('click', () => { step++; const t = divSteps(CASES[+sel.value].a, CASES[+sel.value].b).length; if (step > t) step = t; render(); });
  all.addEventListener('click', () => { step = divSteps(CASES[+sel.value].a, CASES[+sel.value].b).length; render(); });
  rst.addEventListener('click', () => { step = -1; render(); });
  /* 讲解入口：set(例序号 0~3, 步序 -1~5；5 = 结论态) */
  window.MOD = window.MOD || {};
  MOD.div = {
    set(i, s){ sel.value = String(i == null ? 0 : i); step = (s == null ? -1 : s); render(); }
  };
  render();
})();

/* ==========================================================================
   ③ 试商与调商
   ========================================================================== */
(function initTrial(){
  const sel = $('#trialSel'), btn = $('#btnTrialStep'), all = $('#btnTrialAll'), rst = $('#btnTrialReset');
  const stage = $('#trialStage'), note = $('#trialNote'), stepsEl = $('#trialSteps');
  /* 每例：试商过程（手算真实过程，不用 divSteps） */
  const CASES = [
    {a:405, b:15, trial:20, guess:3, real:2,
     story:'被除数前两位 <b>40</b>，把除数 <b>15</b> 看作 <b>20</b>，试商 <b>3</b>：20×3=60，60 比 40 大，' +
           '说明<b>商大了</b>，要<b>调小</b>成 2；15×2=30，30&lt;40 ✓，余 10。'},
    {a:630, b:21, trial:20, guess:3, real:3,
     story:'被除数前两位 <b>63</b>，把除数 <b>21</b> 看作 <b>20</b>，试商 <b>3</b>：20×3=60，60&lt;63 ✓，' +
           '再看 21×3=63，正好，<b>商就是 3</b>，不用调。'},
    {a:828, b:27, trial:30, guess:2, real:3,
     story:'被除数前两位 <b>82</b>，把除数 <b>27</b> 看作 <b>30</b>，试商 <b>2</b>：30×2=60，60&lt;82 ✓，' +
           '但 27×3=81≤82，说明<b>商小了</b>，要<b>调大</b>成 3。'},
    {a:896, b:28, trial:30, guess:3, real:3,
     story:'被除数前两位 <b>89</b>，把除数 <b>28</b> 看作 <b>30</b>，试商 <b>3</b>：30×3=90，90&gt;89，' +
           '要<b>调小</b>成 2；28×3=84&lt;89 ✓，再试 3 正好余 5 —— <b>每次只调 1</b>。'}
  ];
  let step = 0;
  const N = 4;
  function render(){
    const c = CASES[+sel.value];
    const names = ['① 看作整十数', '② 试商', '③ 检查乘积', '④ 调商得结论'];
    stepsEl.innerHTML = names.map((l, i) =>
      `<div class="dot ${i < step ? 'done' : (i === step ? 'on' : '')}" title="${l}">${i+1}</div>`).join('');
    stage.innerHTML = '';
    const W = 640, H = 250;
    const svg = s('svg', {viewBox:`0 0 ${W} ${H}`, width:W, height:H});
    stage.appendChild(svg);
    /* 左边：被除数前两位 + 除数 + 箭头 */
    label(svg, 130, 60, '被除数前两位', {size:13, fill:'#4b5f7d'});
    const head = Math.floor(c.a / 10);
    label(svg, 130, 96, String(head), {size:34, weight:800, fill:'#2f6fd0'});
    label(svg, 250, 60, '除数', {size:13, fill:'#4b5f7d'});
    label(svg, 250, 96, String(c.b), {size:34, weight:800, fill:'#20304a'});
    /* 箭头 */
    s('path', {d:`M 330 92 L 372 92 M 362 84 L 372 92 L 362 100`, fill:'none',
      stroke:'#8fa3bd', 'stroke-width':2, 'stroke-linecap':'round', 'stroke-linejoin':'round'}, svg);
    /* 看作的整十数 */
    label(svg, 470, 60, '看作整十数', {size:13, fill:'#4b5f7d'});
    label(svg, 470, 96, String(c.trial), {size:34, weight:800,
      fill: step === 0 ? '#f08a24' : '#c9d4e4'});
    /* 试商框 */
    label(svg, 130, 160, '试商', {size:13, fill:'#4b5f7d'});
    s('rect', {x:160, y:132, width:76, height:44, rx:8, fill:'#fff',
      stroke: step >= 1 ? '#1f9d6b' : '#c9d4e4', 'stroke-width':2}, svg);
    label(svg, 198, 162, step >= 1 ? String(c.guess) : '?', {size:24, weight:800,
      fill: step >= 1 ? '#1f9d6b' : '#b6c4d8'});
    /* 乘积检查 */
    label(svg, 280, 160, '检验乘积', {size:13, fill:'#4b5f7d'});
    const prod = c.trial * c.guess;
    const okBig = prod > head;
    s('rect', {x:356, y:132, width:230, height:44, rx:8, fill:'#fff',
      stroke: step >= 2 ? (okBig ? '#f08a24' : '#1f9d6b') : '#c9d4e4', 'stroke-width':2}, svg);
    label(svg, 471, 162, step >= 2 ? (c.trial + '×' + c.guess + '=' + prod + (okBig ? ' 偏大' : ' 合适')) : '?',
      {size:16, weight:700, fill: step >= 2 ? (okBig ? '#b35c00' : '#126b47') : '#b6c4d8'});
    /* 结论 */
    label(svg, 130, 218, '正确的商', {size:13, fill:'#4b5f7d'});
    s('rect', {x:200, y:190, width:76, height:44, rx:8, fill:'#fff',
      stroke: step >= 3 ? '#1f9d6b' : '#c9d4e4', 'stroke-width':2}, svg);
    label(svg, 238, 220, step >= 3 ? String(c.real) : '?', {size:24, weight:800,
      fill: step >= 3 ? '#1f9d6b' : '#b6c4d8'});

    if (step === 0) note.innerHTML = `第 ① 步：把除数 <b>${c.b}</b> 看作与它<b>接近的整十数</b> <b>${c.trial}</b>（四舍五入）。`;
    else if (step === 1) note.innerHTML = `第 ② 步：用 <b>${c.trial}</b> 去试商，<b>${head} ÷ ${c.trial}</b> 约等于 <b>${c.guess}</b>。`;
    else if (step === 2) note.innerHTML = `第 ③ 步：检验乘积——<b>${c.trial} × ${c.guess} = ${prod}</b>，` +
      (okBig ? `比被除数 ${head} <b>大</b>，说明<b>商大了</b>。` : `比被除数 ${head} <b>小</b>，还要再试大一点。`);
    else note.innerHTML = `第 ④ 步：${c.story}<br><b>调商口诀</b>：<b>商大了调小，商小了调大，每次只调 1</b>。`;
  }
  sel.addEventListener('change', () => { step = 0; render(); });
  btn.addEventListener('click', () => { step = (step + 1) % N; render(); });
  all.addEventListener('click', () => { step = N - 1; render(); });
  rst.addEventListener('click', () => { step = 0; render(); });
  /* 讲解入口：set(例序号 0~3, 步序 0~3) */
  window.MOD = window.MOD || {};
  MOD.trial = {
    set(i, s){ sel.value = String(i == null ? 0 : i); step = (s == null ? 0 : s); render(); }
  };
  render();
})();

/* ==========================================================================
   ④ 商的变化规律
   ========================================================================== */
(function initRule(){
  const k = $('#ruleK'), lab = $('#ruleLabel');
  const stage = $('#ruleStage'), note = $('#ruleNote');
  const A = 240, B = 16, Q = A / B;
  /* 讲解用分级：0 只给原式 / 1 加"同时乘" / 2 加"同时除以" / 3 给结论 */
  let lvl = 3;
  function render(){
    const m = +k.value;
    lab.textContent = '×' + m;
    stage.innerHTML = '';
    const W = 640, H = 280;
    const svg = s('svg', {viewBox:`0 0 ${W} ${H}`, width:W, height:H});
    stage.appendChild(svg);
    const bw = 150, bh = 54, y1 = 52;
    /* 起点：原式 */
    label(svg, 320, 26, lvl === 0 ? '先看一个已经会算的除法' : '被除数和除数同时变，商怎么变？',
      {size:14, weight:700, fill:'#20304a'});
    s('rect', {x:100, y:y1, width:bw, height:bh, rx:8, fill:'#e8f1ff', stroke:'#2f6fd0', 'stroke-width':2}, svg);
    label(svg, 100 + bw/2, y1 + bh/2 + 8, A + ' ÷ ' + B, {size:17, weight:800, fill:'#2f6fd0'});
    label(svg, 320, y1 + bh/2 + 8, '=', {size:22, weight:800, fill:'#4b5f7d'});
    s('rect', {x:360, y:y1, width:80, height:bh, rx:8, fill:'#fff', stroke:'#1f9d6b', 'stroke-width':2}, svg);
    label(svg, 400, y1 + bh/2 + 8, lvl === 0 ? '?' : String(Q),
      {size:19, weight:800, fill: lvl === 0 ? '#b6c4d8' : '#1f9d6b'});
    if (lvl === 0){
      note.innerHTML = `<b>${A} ÷ ${B}</b>，先用"想乘法算除法"算出商：` +
        `<b>${B} 乘几等于 ${A}</b>？<br>先记住这个商，下面要看它会不会变。`;
      return;
    }
    /* 上：被除数除数同时乘 m */
    label(svg, 320, y1 - 14, '① 同时乘 ' + m + '（0 除外）', {size:14, weight:700, fill:'#20304a'});
    s('rect', {x:400, y:y1 - 4, width:bw + 60, height:bh, rx:8, fill:'#fff', stroke:'#1f9d6b', 'stroke-width':2}, svg);
    label(svg, 400 + (bw + 60)/2, y1 - 4 + bh/2 + 8, (A*m) + ' ÷ ' + (B*m), {size:17, weight:800, fill:'#1f9d6b'});
    if (lvl >= 2){
      /* 下：同时除以 m */
      const y2 = 148;
      label(svg, 320, y2 - 12, '② 同时除以 ' + m + '（0 除外）', {size:14, weight:700, fill:'#20304a'});
      s('rect', {x:100, y:y2, width:bw + 60, height:bh, rx:8, fill:'#fff', stroke:'#f08a24', 'stroke-width':2}, svg);
      label(svg, 100 + (bw + 60)/2, y2 + bh/2 + 8, (A/m) + ' ÷ ' + (B/m), {size:17, weight:800, fill:'#b35c00'});
      label(svg, 470, y2 + bh/2 + 8, '商还是 ' + Q, {size:16, weight:800, fill:'#b35c00'});
    }
    if (lvl >= 3){
      s('rect', {x:230, y:218, width:180, height:34, rx:8, fill:'#fff8ee', stroke:'#f08a24', 'stroke-width':2}, svg);
      label(svg, 320, 241, '两种变法，商都是 ' + Q, {size:16, weight:800, fill:'#b35c00'});
    }
    note.innerHTML = lvl === 1
      ? `<b>${A} ÷ ${B} = ${Q}</b>，现在被除数和除数<b>同时乘 ${m}</b>：` +
        `<b>${A*m} ÷ ${B*m}</b>，商还是 <b>${Q}</b>。` +
        `<br>为什么？<b>被除数和除数都变成原来的 ${m} 倍，倍数关系没变</b>。`
      : `<b>${A} ÷ ${B} = ${Q}</b>，<b>${A*m} ÷ ${B*m} = ${Q}</b>，<b>${A/m} ÷ ${B/m} = ${Q}</b>。` +
        `<br><b>教学口径</b>：<b>被除数和除数同时乘或除以相同的数（0 除外），商不变</b>。` +
        `<br><b>推论</b>：被除数不变、除数<b>扩大</b>几倍，商就<b>缩小</b>到原来的几分之一；` +
        `被除数<b>扩大</b>几倍（除数不变），商就<b>扩大</b>几倍。`;
  }
  k.addEventListener('input', render);
  $('#btnRuleReset').addEventListener('click', () => { k.value = 2; render(); });
  /* 讲解入口：set(倍数 1~5, 分级 0~3) */
  window.MOD = window.MOD || {};
  MOD.rule = {
    set(m, l){ k.value = m; lvl = (l == null ? 3 : l); render(); }
  };
  render();
})();

/* ==========================================================================
   ⑤ 解决问题 —— 进一法与去尾法
   ========================================================================== */
(function initSolve(){
  const stage = $('#solveStage'), note = $('#solveNote');
  const CASES = [
    {t:'租船', unit:'条船', per:4, n:25, method:'进一法', icon:'🚗',
     q:'25 个同学去划船，每条船最多坐 4 人。至少要租多少条船？',
     why:'25 ÷ 4 = 6……1，剩下的 1 人也要坐船，所以要 <b>6 + 1 = 7</b> 条船。',
     tip:'人不能"分成 0.25 条船"，剩下的人也得有船坐 → <b>进一法</b>'},
    {t:'裁布', unit:'件衣服', per:3, n:25, method:'去尾法', icon:'✂️',
     q:'有 25 米布，做一件衣服要 3 米。最多能做多少件衣服？',
     why:'25 ÷ 3 = 8……1，剩下的 1 米不够做一件衣服，所以最多做 <b>8</b> 件。',
     tip:'不够做一整件的布就浪费掉 → <b>去尾法</b>'},
    {t:'订餐', unit:'份套餐', per:5, n:32, method:'进一法', icon:'🍱',
     q:'32 人订餐，每份套餐 5 人一份。至少要订多少份套餐？',
     why:'32 ÷ 5 = 6……2，剩下 2 人也要一份套餐，所以要 <b>6 + 1 = 7</b> 份。',
     tip:'套餐不能"订 0.4 份"，剩下的人也得吃上 → <b>进一法</b>'},
    {t:'装盒', unit:'盒', per:6, n:40, method:'去尾法', icon:'📦',
     q:'有 40 颗糖，每盒装 6 颗。最多能装满多少盒？',
     why:'40 ÷ 6 = 6……4，剩下的 4 颗装不满一盒，所以最多装满 <b>6</b> 盒。',
     tip:'装不满的一盒不算"装满" → <b>去尾法</b>'}
  ];
  let ci = 0;
  /* 讲解用分级：0 只读题 / 1 出除法 / 2 出处理方式和图示 / 3 出结论 */
  let phase = 3;
  function render(){
    const c = CASES[ci];
    stage.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.style.cssText = 'width:100%;font-size:16px;color:#20304a';
    const q = document.createElement('div');
    q.style.cssText = 'font-weight:700;margin-bottom:10px';
    q.innerHTML = c.icon + ' ' + c.q;
    wrap.appendChild(q);
    const bar = document.createElement('div');
    bar.style.cssText = 'display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:8px';
    const res = c.n / c.per, q0 = Math.floor(res), r = c.n % c.per;
    const mk = (txt, bg, col) => {
      const d = document.createElement('span');
      d.style.cssText = `background:${bg};color:${col};padding:6px 16px;border-radius:10px;font-weight:800;font-size:20px`;
      d.textContent = txt; bar.appendChild(d);
    };
    if (phase >= 1) mk(c.n + ' ÷ ' + c.per + ' = ' + q0 + (r ? '……' + r : ''), '#eef3fb', '#2f6fd0');
    if (phase >= 2){
      if (c.method === '进一法'){
        mk('余下的也要占一份：' + q0 + ' + 1 = ' + (q0 + 1), '#fff2e2', '#b35c00');
      } else {
        mk('不够一份的不算：舍去余数 ' + r + ' → ' + q0, '#e6f7ef', '#126b47');
      }
    }
    if (phase >= 3) mk(c.method, '#20304a', '#fff');
    wrap.appendChild(bar);
    stage.appendChild(wrap);
    /* 图示：每份 c.per 个 —— 到第 2 级才出现，正好用来讲"剩下一份怎么办" */
    if (phase >= 2){
      const svg = s('svg', {viewBox:'0 0 640 120', width:640, height:120});
      stage.appendChild(svg);
      const per = c.per, groups = Math.ceil(c.n / per);
      const perW = Math.max(8, Math.min(34, 560 / (groups * per)));
      const groupGap = Math.max(6, Math.min(14, 560 / groups - per * perW));
      const totalW = groups * per * perW + (groups - 1) * groupGap;
      const startX = Math.max(10, (640 - totalW) / 2);
      for (let g = 0; g < groups; g++){
        const gx = startX + g * (per * perW + groupGap);
        for (let i = 0; i < per; i++){
          const filled = g * per + i < c.n;
          s('circle', {cx:gx + i*perW + perW/2, cy:58, r:Math.max(2, perW/2 - 2),
            fill: filled ? '#2f6fd0' : 'none', stroke: filled ? '#2f6fd0' : '#c9d4e4',
            'stroke-width':1.4, 'stroke-dasharray': filled ? '' : '3 3'}, svg);
        }
        label(svg, gx + per*perW/2, 100, '第' + (g+1) + '组', {size:11.5, fill:'#4b5f7d'});
      }
      /* 最后一组不满的用橙色圈出来，讲解时"剩下这一点"看得见 */
      if (r){
        const g = groups - 1;
        const gx = startX + g * (per * perW + groupGap);
        s('rect', {x:gx - 5, y:22, width:per * perW + 6, height:72, rx:8, fill:'none',
          stroke:'#f08a24', 'stroke-width':2.2, 'stroke-dasharray':'6 4'}, svg);
        label(svg, gx + per*perW/2, 14, '只有 ' + r + ' 个', {size:12, weight:700, fill:'#b35c00'});
      }
    }
    if (phase === 0){
      note.innerHTML = `<b>${c.q}</b><br>先别算，想一想：<b>这个问题问的是"至少"还是"最多"</b>？`;
    } else if (phase === 1){
      note.innerHTML = `<b>${c.n} ÷ ${c.per} = ${q0}${r ? '……' + r : ''}</b>` +
        `<br>算到这一步还没结束——<b>余下的 ${r} 怎么办</b>？这才是关键。`;
    } else {
      note.innerHTML = `<b>${c.q}</b><br>${c.why}<br><b>为什么？</b>${c.tip}<br>` +
        `<b>教学口径</b>：<b>进一法 = 商上加 1</b>（剩下的也要占一份）；<b>去尾法 = 舍去余数</b>（不够一份就不算）。`;
    }
  }
  document.querySelectorAll('[data-sc]').forEach(b => {
    b.addEventListener('click', () => { ci = +b.dataset.sc; phase = 3; render(); });
  });
  $('#btnSolveReset').addEventListener('click', () => { ci = 0; phase = 3; render(); });
  /* 讲解入口：set(例序号 0~3, 分级 0~3) */
  window.MOD = window.MOD || {};
  MOD.solve = {
    set(i, p){ ci = (i == null ? 0 : i); phase = (p == null ? 3 : p); render(); }
  };
  render();
})();

/* ==========================================================================
   分层练习数据
   —— 口径与课件、教案一致：试商看整十数 / 商大调小商小调大 / 余数小于除数 /
      商中间末尾的 0 也要写 / 同时乘除同数商不变 / 进一法与去尾法
   ========================================================================== */
const BASIC_CHOICE = [
  {q:'425 ÷ 25 的商是（　）。', opts:['17','25','15','27'], a:0,
   why:'425 ÷ 25 = 17。先看前两位 42，42 ÷ 25 商 1，余 17 落下 5 得 175，175 ÷ 25 商 7。',
   hint:'回到动画 ② 笔算除法，按"从高位除起、逐位落数"一步步算。'},
  {q:'计算 630 ÷ 21 时，试商应该把 21 看作（　）。', opts:['2','20','21','30'], a:1,
   why:'试商把除数看作与它接近的整十数。21 的个位是 1，四舍五入看作 20。',
   hint:'回到动画 ③ 试商与调商，想想"接近的整十数"怎么取。'},
  {q:'下面说法正确的是（　）。', opts:['余数可以和除数一样大','余数必须比除数小','余数一定比除数大','余数只能是 0'], a:1,
   why:'每次除得的余数必须比除数小，否则说明商试小了，还要调大。',
   hint:'回到动画 ③ 的检验环节，看余数和除数比大小。'},
  {q:'240 ÷ 30 的商是（　）。', opts:['6','7','8','24'], a:2,
   why:'240 ÷ 30 = 8。想乘法算除法：30 乘 8 等于 240。',
   hint:'回到动画 ① 口算除法，用"想乘法算除法"的方法算。'},
  {q:'计算 936 ÷ 26 时，试商应该把 26 看作（　）。', opts:['20','26','30','2'], a:2,
   why:'26 的个位是 6，比 5 大，四舍五入看作 30。',
   hint:'回到动画 ③ 试商与调商，注意"接近的整十数"的取法。'},
  {q:'一个数除以 15，商是 6，余数最大是（　）。', opts:['5','6','14','15'], a:2,
   why:'余数必须比除数小，比 15 小的最大整数是 14。',
   hint:'回到动画 ③ 的检验环节，余数要比除数小。'},
  {q:'试商时发现商大了，应该（　）。', opts:['调大商','调小商','不用调','把除数换小'], a:1,
   why:'商大了要调小，商小了要调大，而且每次只调 1。',
   hint:'回到动画 ③ 的第 ④ 步，把调商口诀读一遍。'},
  {q:'下面各式中，与 720 ÷ 16 的商相等的是（　）。', opts:['7200 ÷ 160','720 ÷ 160','72 ÷ 16','7200 ÷ 16'], a:0,
   why:'被除数和除数同时乘 100（0 除外），商不变：7200 ÷ 160 = 45 = 720 ÷ 16。',
   hint:'回到动画 ④ 商的变化规律，看被除数和除数同时变化时商怎么变。'}
];

const BASIC_FILL = [
  {q:'425 ÷ 25 =（　）。', a:'17',
   why:'竖式计算：42 ÷ 25 商 1，落下 5 得 175，175 ÷ 25 商 7，所以商是 17。', point:'拆数法：把被除数拆成“除数的整十倍 + 除数”，两块分别口算再相加', care:'拆出的两块都要能整除，425 = 400 + 25 正好都整除', steps:['把 425 拆成 400 + 25（400 是 25 的整十倍）', '400 ÷ 25 = 16，25 ÷ 25 = 1', '两部分相加：16 + 1 = 17']},
  {q:'576 ÷ 18 =（　）。', a:'32',
   why:'57 ÷ 18 商 3，余 3 落下 6 得 36，36 ÷ 18 商 2，所以商是 32。'},
  {q:'一个数除以 21，商是 8，余数最大是（　）。', a:'20',
   why:'余数必须比除数 21 小，最大的余数是 20。'},
  {q:'828 ÷ 27 = 30……（　）。', a:'18',
   why:'828 ÷ 27 = 30……18，验算：27 × 30 + 18 = 828。'},
  {q:'计算 405 ÷ 15 时，试商把除数看作（　）。', a:'20',
   why:'15 的个位是 5，四舍五入看作 20，用 20 试商。'},
  {q:'被除数和除数同时乘 3 或除以 3，商（　）。', a:'不变',
   why:'这就是商的变化规律：被除数和除数同时乘或除以相同的数（0 除外），商不变。'}
];

const HAND_CHOICE = [
  {q:'下面各式中，商是 32 的是（　）。', opts:['576 ÷ 18','936 ÷ 24','784 ÷ 28','405 ÷ 15'], a:0,
   why:'576 ÷ 18 = 32；936 ÷ 24 = 39，784 ÷ 28 = 28，405 ÷ 15 = 27。',
   hint:'回到动画 ② 笔算除法，选一道题用竖式算一算。'},
  {q:'用竖式计算 936 ÷ 24 时，先看被除数的前两位 93，93 ÷ 24 的商是（　）。', opts:['3','4','5','9'], a:0,
   why:'93 ÷ 24 = 3……21，所以第一步商 3，落在被除数的十位上。',
   hint:'回到动画 ② 笔算除法，注意先看被除数的前两位。'},
  {q:'一个数除以 25，商是 12，余数最大时，这个数最大是（　）。', opts:['300','312','324','325'], a:2,
   why:'余数最大是 24，这个数 = 25 × 12 + 24 = 324。',
   hint:'回到动画 ③，先确定最大余数，再想"被除数 = 除数 × 商 + 余数"。', point:'余数的边界推理：余数必须比除数小，先定余数的上限再倒推', care:'余数最大是 24（**不是 25**，必须严格小于除数）'},
  {q:'已知 720 ÷ 16 = 45，那么 7200 ÷ 160 的商是（　）。', opts:['45','450','4.5','4500'], a:0,
   why:'被除数和除数同时乘 100，商不变，商还是 45。',
   hint:'回到动画 ④ 商的变化规律。'},
  {q:'25 个同学去划船，每条船最多坐 4 人，至少要租（　）条船。', opts:['6','7','25','4'], a:1,
   why:'25 ÷ 4 = 6……1，剩下的 1 人也要坐船，至少要租 6 + 1 = 7 条船（进一法）。',
   hint:'回到动画 ⑤ 解决问题，想想剩下的 1 个人怎么办。'},
  {q:'有 25 米布，做一件衣服要 3 米，最多能做（　）件衣服。', opts:['8','9','12','13'], a:0,
   why:'25 ÷ 3 = 8……1，剩下的 1 米不够做一件，最多做 8 件（去尾法）。',
   hint:'回到动画 ⑤ 解决问题，想想剩下的布够不够做一件。'}
];

const HAND_FILL = [
  {q:'576 ÷ 18 的商是（　）。', a:'32',
   why:'57 ÷ 18 商 3 落 6 得 36，36 ÷ 18 商 2，商是 32。'},
  {q:'用竖式计算 936 ÷ 24 时，试商要把 24 看作（　）。', a:'20',
   why:'24 的个位是 4，比 5 小，四舍五入看作 20 试商。'},
  {q:'828 ÷ 27 = 30……（　）。', a:'18',
   why:'验算 27 × 30 + 18 = 828，所以余数是 18（18 < 27 ✓）。'},
  {q:'25 米布，每 3 米做一件衣服，最多做（　）件。', a:'8',
   why:'25 ÷ 3 = 8……1，剩下的 1 米不够做一件，用去尾法得 8 件。'},
  {q:'一个数除以 24，商是 15，余数最大是（　）。', a:'23',
   why:'余数必须比除数 24 小，最大的余数是 23。'}
];

const EXT_CHOICE = [
  {q:'被除数和除数同时乘 5，商（　）。', opts:['扩大到原来的 5 倍','缩小到原来的 1/5','不变','无法确定'], a:2,
   why:'被除数和除数同时乘或除以相同的数（0 除外），商不变。',
   hint:'回到动画 ④ 商的变化规律，看分子分母同时变化时商怎么变。', point:'商不变的规律：被除数和除数**同时**变，比值不变——商本身就是两个数的比', care:'题眼是“同时”。只变一个，商一定变；除数不能是 0'},
  {q:'被除数不变，除数扩大到原来的 3 倍，商（　）。', opts:['扩大到原来的 3 倍','缩小到原来的 1/3','不变','无法确定'], a:1,
   why:'除数扩大 3 倍，被除数不变，商就缩小到原来的 1/3。',
   hint:'回到动画 ④ 商的变化规律，注意"只有除数变了"的情况。', point:'归一思想：被除数固定，除数变大几倍，商就**反向**缩小几倍', care:'用“想乘法算除法”检验：原来的商 × 3 才是新的被除数，别把扩大与缩小记反'},
  {q:'一个数除以 18，商是 20，余数是 17，这个数是（　）。', opts:['360','377','374','357'], a:1,
   why:'被除数 = 除数 × 商 + 余数 = 18 × 20 + 17 = 377。',
   hint:'回到动画 ⑤，先把"除数 × 商"这一部分算出来，再加上余数。', point:'除法算式各部分的关系：被除数 = 除数 × 商 + 余数（倒着求被除数）', care:'余数要加在“除数 × 商”的**末尾**；别把余数当商的一部分去乘'},
  {q:'892 ÷ 22 的商是（　）。', opts:['39','40','41','42'], a:1,
   why:'892 ÷ 22 = 40……12，验算 22 × 40 = 880，880 + 12 = 892。',
   hint:'回到动画 ② 笔算除法，用竖式算一遍。', point:'有余数除法的竖式：从高位除起，落下再除，商写在对应数位上', care:'22 是两位数，892 十位上的 9 太小，要**看前两位 89** 再试商'},
  {q:'计算 630 ÷ 21 时，把 21 看作 20 试商，估商 3，检验 3 × 21 = 63 正好。那么 630 ÷ 21 的商是（　）。',
   opts:['30','3','31','29'], a:0,
   why:'630 ÷ 21 = 30。因为 630 正好是 21 的 30 倍，所以商是 30。',
   hint:'回到动画 ② 笔算除法，算完后记得用"商 × 除数 + 余数 = 被除数"检验。', point:'试商与检验：估出的商只是“前两位”对应的商，整百位上的 0 要自己补上', care:'检验用**原来的除数 21**（不是看作的 20）；3 个 21 是 63，630 里能放 30 个'}
];

const EXT_FILL = [
  {q:'一个数除以 18，商是 20，余数是 17，这个数是（　）。', a:'377',
   why:'18 × 20 + 17 = 377。', point:'除法算式各部分的关系：被除数 = 除数 × 商 + 余数（倒着求被除数）', care:'余数要加在“除数 × 商”的**末尾**；别把余数当商的一部分去乘'},
  {q:'3600 ÷ 90 =（　）。', a:'40',
   why:'想乘法算除法：90 × 40 = 3600，所以商是 40。', point:'商的变化规律 + 想乘法算除法：90 × 40 = 3600', care:'同时去掉一个 0 简化成 360 ÷ 9 可以，但**不能**写成 3600 ÷ 9'},
  {q:'一个数除以 25，商是 12，余数最大时，这个数最大是（　）。', a:'324',
   why:'余数最大是 24，25 × 12 + 24 = 324。', point:'余数的边界推理：余数必须比除数小，先定余数的上限再倒推', care:'余数最大是 24（**不是 25**，必须严格小于除数）'},
  {q:'被除数扩大到原来的 4 倍，除数不变，商扩大到原来的（　）倍。', a:'4',
   why:'被除数扩大几倍，除数不变，商也扩大几倍。', point:'商随被除数变化的规律：一个变、另一个不变，商同比变化', care:'先看**哪个数变了**：除数不变时商跟着被除数走；反过来才缩小'},
  {q:'有 240 名学生，每辆车最多坐 45 人，至少要（　）辆车。', a:'6',
   why:'240 ÷ 45 = 5……15，剩下的 15 人也要坐车，至少要 5 + 1 = 6 辆（进一法）。', point:'进一法：实际问题取整要“进一”不能“去尾”——剩下的人也要坐车', care:'240 ÷ 45 = 5……15，余下的 15 人照样要车，所以 5 + 1 = 6 辆，这里最容易写成 5'}
];

/* ==========================================================================
   第四档 · 五星挑战（浅奥思维）
   —— 两步以上思考：逆向求解、移多补少、算理辨析
   ========================================================================== */
const STAR5_CHOICE = [
  {q:'甲、乙两筐苹果共 96 个。从甲筐拿出 8 个放进乙筐后，两筐一样多。甲筐原来有（　）个。',
   opts:['40','48','56','64'], a:2,
   why:'甲给乙 8 个后相等，说明<b>原来甲比乙多 8 + 8 = 16 个</b>。' +
       '甲 + 乙 = 96，甲 − 乙 = 16，所以甲 = (96 + 16) ÷ 2 = 56（个）。',
   hint:'回到动画 ① 的"移多补少"：先想清楚"原来甲比乙多几个"，再列式。', point:'和差问题：“一进一出”让差改变 2 倍，再用 (和 + 差) ÷ 2 求大数', care:'甲少 8、乙多 8，差减少 8 + 8 = 16；原来甲比乙多 **16** 个，不是 8 个', steps:['甲给乙 8 个：甲少 8 个，乙多 8 个，两筐相差的数少了 8 + 8 = 16（个）', '移动后两筐一样多，说明**原来**甲比乙多 16 个', '列出两个关系：甲 + 乙 = 96，甲 − 乙 = 16', '和差问题：甲 = (96 + 16) ÷ 2 = 112 ÷ 2 = 56（个）', '检验：乙 = 96 − 56 = 40，56 − 8 = 48，40 + 8 = 48，两筐确实一样多']},
  {q:'一个数除以 27，商是 14，余数是 20。这个数是（　）。',
   opts:['378','380','392','398'], a:3,
   why:'被除数 = 除数 × 商 + 余数 = 27 × 14 + 20 = 378 + 20 = 398。' +
       '检验：398 ÷ 27 = 14……20 ✓',
   hint:'回到动画 ⑤ 解决问题：竖式里"被除数 = 除数 × 商 + 余数"，把余数加回去。', point:'算式各部分的关系倒推被除数：除数 × 商 + 余数', care:'余数 20 必须小于除数 27 才合法；算完要“除回去”检验', steps:['被除数 = 除数 × 商 + 余数', '= 27 × 14 + 20', '先算 27 × 14 = 378', '再加余数：378 + 20 = 398', '检验：398 ÷ 27 = 14……20 ✓（余数 20 < 27，合法）']},
  {q:'计算 425 ÷ 25 时，用"拆数"的办法最简便的是（　）。',
   opts:['425 = 400 + 25，所以 425 ÷ 25 = 16 + 1 = 17',
         '425 = 425 + 0，所以商是 0',
         '先算 4 + 2 + 5 = 11，再算 425 ÷ 11',
         '425 ÷ 25 = 425 ÷ 5 ÷ 5，因为除以 25 等于连续除以两次 5'], a:0,
   why:'把被除数拆成"<b>除数的整十倍</b> + 除数"：400 ÷ 25 = 16，25 ÷ 25 = 1，和是 17。' +
       '这正是竖式里"42 ÷ 25 得 1"和"落下 5 后 175 ÷ 25 得 7"的另一种写法。',
   hint:'回到动画 ② 笔算除法：把 425 看成 400 + 25 分别除以 25。', point:'拆数法：把被除数拆成“除数的整十倍 + 除数”，让每一块都能口算', care:'拆的时候**每一块都要能整除**才算简便；“425 ÷ 5 ÷ 5”虽然成立，但没有利用 425 的特征', steps:['想：25 乘几最接近 425？25 × 16 = 400，最接近', '把 425 拆成 400 + 25 —— 400 是 25 的整十倍', '分别算：400 ÷ 25 = 16，25 ÷ 25 = 1', '两部分相加：16 + 1 = 17']},
  {q:'一个数除以 13，商是 12，余数<b>最大</b>。这个数是（　）。',
   opts:['156','168','169','180'], a:1,
   why:'余数必须<b>比除数小</b>，除数是 13 时余数最大是 <b>12</b>。' +
       '这个数 = 13 × 12 + 12 = 156 + 12 = <b>168</b>。检验：168 ÷ 13 = 12……12 ✓',
   hint:'回到动画 ③ 试商与调商的"检验"环节：余数 < 除数；再回到动画 ⑤ 解决问题：被除数 = 除数 × 商 + 余数。', point:'余数边界的**逆向推理**：余数最大 → 除数取最小合法值', care:'“余数最大”不是“余数 = 12”！要先想“余数要最大，除数该取多少”；除数取 13 时余数才是 12', steps:['余数必须比除数小，所以要让余数最大，除数得取**最小**的合法值', '商是 12，取除数 13（12 < 13 ✓）', '这时余数最大 = 13 − 1 = 12', '被除数 = 13 × 12 + 12 = 156 + 12 = 168', '检验：168 ÷ 13 = 12……12 ✓']},
  {q:'计算 936 ÷ 24 时，把除数 24 看作 20 试商，估商是 43。这样试商（　）。',
   opts:['正好，不用调','商大了，要调小','商小了，要调大','无法判断'], a:1,
   why:'试商 43 时，要用<b>原来的除数</b>检验：24 × 43 = 1032 > 936，' +
       '说明<b>商大了</b>，要调小。正确商是 39（24 × 39 = 936 ✓）。',
   hint:'回到动画 ③ 第 ③ 步"检验乘积"：检验时要用真的除数，不能只看看作的数。', point:'试商后的检验：把估的商**乘回**被除数，比一比大小', care:'检验要用**原来的除数 24**，不是看作的 20；24 × 43 = 1032 比 936 大', steps:['试商 43，先用原来的除数检验：24 × 43 = 1032', '比较：1032 > 936，说明估的商**大了**', '商大了要调小，正确商是 39', '验证：24 × 39 = 936，正好']},
  {q:'一根绳子对折两次后长 3 米，这根绳子原来长（　）米。',
   opts:['6','12','24','36'], a:1,
   why:'对折 1 次变一半，对折 2 次变成原来的 <b>1/4</b>。' +
       '3 × 4 = 12（米）。也可以想：3 × 2 = 6，6 × 2 = 12。',
   hint:'回到动画 ④ 商的变化规律："除以 2 相当于缩到 1/2"，对折两次就是除以 4。', point:'倍数关系的逆运算：对折一次 ÷2，对折两次 ÷（2×2）', care:'“对折两次”是变成 4 份，不是 2 份；容易错成 3 × 2 = 6', steps:['对折 1 次，长度变成原来的 1/2', '再对折 1 次，变成 1/2 × 1/2 = 1/4', '现在长 3 米，原来 = 3 × 4 = 12（米）', '验算：12 ÷ 2 ÷ 2 = 3 ✓']}
];

const STAR5_FILL = [
  {q:'425 ÷ 25 =（　）。', a:'17',
   why:'拆数法：425 = 400 + 25，400 ÷ 25 = 16，25 ÷ 25 = 1，16 + 1 = 17。', point:'拆数法：把被除数拆成“除数的整十倍 + 除数”，两块分别口算再相加', care:'拆出的两块都要能整除，425 = 400 + 25 正好都整除', steps:['把 425 拆成 400 + 25（400 是 25 的整十倍）', '400 ÷ 25 = 16，25 ÷ 25 = 1', '两部分相加：16 + 1 = 17']},
  {q:'4250 ÷ 25 =（　）。', a:'170',
   why:'被除数末尾添一个 0 就多除 10：4250 ÷ 25 = 17 × 10 = 170。', point:'商的变化规律：除数不变，被除数扩大 10 倍，商也扩大 10 倍', care:'是**被除数**末尾添 0，商才跟着添 0；别把除数也改了', steps:['4250 = 425 × 10', '除数不变，被除数扩大 10 倍，商也扩大 10 倍', '425 ÷ 25 = 17，所以 4250 ÷ 25 = 17 × 10 = 170']},
  {q:'一个数除以 27，商是 14，余数是 20，这个数是（　）。', a:'398',
   why:'27 × 14 + 20 = 378 + 20 = 398。', point:'算式各部分的关系倒推被除数：除数 × 商 + 余数', care:'余数 20 必须小于除数 27 才合法；算完要“除回去”检验', steps:['被除数 = 除数 × 商 + 余数', '= 27 × 14 + 20', '先算 27 × 14 = 378', '再加余数：378 + 20 = 398', '检验：398 ÷ 27 = 14……20 ✓（余数 20 < 27，合法）']},
  {q:'一个数除以 25，商是 9，余数是 7，这个数再除以 5 的余数是（　）。', a:'2',
   why:'这个数 = 25 × 9 + 7 = 232；232 ÷ 5 = 46……2，所以余数是 2。', point:'逆向思维：先把原数**还原出来**，再求新的余数', care:'不能拿“9 ÷ 5”“7 ÷ 5”去算，必须先求出这个数本身', steps:['先把这个数求出来：25 × 9 + 7 = 225 + 7 = 232', '再算 232 ÷ 5 = 46……2', '所以余数是 2']},
  {q:'被除数除以除数，商是 12，余数最大是 12，这时除数是（　）。', a:'13',
   why:'余数 12 必须比除数小，除数最小取 13（12 < 13 ✓），此时余数最大。', point:'余数边界的逆向推理：余数已知且最大，除数取最小合法值', care:'除数必须**大于**余数 12，最小取 13；取 12 就成了余数等于除数，不合法', steps:['余数必须比除数小，所以除数要大于 12', '满足条件的最小除数是 13', '检验：12 < 13 ✓，此时余数 12 合法且最大']},
  {q:'甲、乙两筐苹果共 96 个，从甲筐拿出 8 个放进乙筐后两筐一样多，甲筐原来有（　）个。', a:'56',
   why:'甲比乙多 16 个，甲 = (96 + 16) ÷ 2 = 56（个）。', point:'和差问题：“一进一出”使差变成 2 倍，再用 (和 + 差) ÷ 2', care:'甲给乙 8 个，差要减少 8 + 8 = 16 个，原来甲比乙多 16 个', steps:['甲给乙 8 个：甲少 8、乙多 8，差减少 16（个）', '移动后一样多，说明原来甲比乙多 16 个', '甲 + 乙 = 96，甲 − 乙 = 16', '甲 = (96 + 16) ÷ 2 = 56（个）']}
];

/* 装配四档练习（巩固 / 动手 / 扩展 / 五星挑战） */
bootCourse([
  {key:'basic', title:'第一档 · 巩固基础（口算 · 试商 · 余数）', prefix:'基', star:3,
   choice:BASIC_CHOICE, fill:BASIC_FILL,
   host:'#basicBlock', score:'#scoreBasic', total:'#totalBasic', reset:'#btnResetBasic'},
  {key:'hand', title:'第二档 · 动手操作（读竖式 · 调商 · 进一法去尾法）', prefix:'动', star:3,
   choice:HAND_CHOICE, fill:HAND_FILL,
   host:'#handBlock', score:'#scoreHand', total:'#totalHand', reset:'#btnResetHand'},
  {key:'ext', title:'第三档 · 扩展思维（商的变化规律 · 推理 · 陷阱辨析）', prefix:'拓', star:4,
   choice:EXT_CHOICE, fill:EXT_FILL,
   host:'#extBlock', score:'#scoreExt', total:'#totalExt', reset:'#btnResetExt'},
  {key:'star5', title:'第四档 · 五星挑战（浅奥思维）', prefix:'奥', star:5,
   choice:STAR5_CHOICE, fill:STAR5_FILL,
   host:'#star5Block', score:'#scoreStar5', total:'#totalStar5', reset:'#btnResetStar5'}
]);
