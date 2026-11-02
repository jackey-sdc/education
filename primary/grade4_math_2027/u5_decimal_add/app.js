/* ==========================================================================
   第五单元 小数的加法和减法 —— 交互模块
   口径：① 列竖式必须小数点对齐（相同数位对齐），不是末位对齐
        ② 位数不同，位数少的补 0；不够减向前一位退 1 当 10
        ③ 得数的小数点与上面的小数点对齐
        ④ 混合运算：有括号先算括号，没有先乘除后加减，同级从左往右
        ⑤ 整数运算律对小数同样适用
   ========================================================================== */

/* 把小数拆成整数部分与小数部分（按位对齐用） */
function decParts(str){
  const s = String(str);
  const i = s.indexOf('.');
  return i < 0
    ? {int: s, frac: ''}
    : {int: s.slice(0, i), frac: s.slice(i + 1)};
}
/* 竖式渲染：a op b，showStep 控制显示到第几步 */
function drawDecVert(svg, a, b, op, showStep, opt){
  const o = Object.assign({x0:150, colW:30, rowH:44, top:52}, opt||{});
  const A = decParts(a), B = decParts(b);
  /* 统一小数位数 */
  const fd = Math.max(A.frac.length, B.frac.length);
  const ai = A.int, bi = B.int;
  const af = A.frac.padEnd(fd, '0'), bf = B.frac.padEnd(fd, '0');
  const intDigits = Math.max(ai.length, bi.length);
  /* 总列数 = 整数位 + 小数位 */
  const nCols = intDigits + fd;
  const colX = i => o.x0 + i * o.colW + o.colW / 2;   /* i=0 是最左的整数位 */
  const H = o.top + 150;
  svg.setAttribute('viewBox', `0 0 640 ${H}`);
  svg.setAttribute('width', 640); svg.setAttribute('height', H);
  /* 运算符 */
  label(svg, o.x0 - 34, o.top + 4, op, {size:20, weight:700, fill:'#4b5f7d'});
  /* 被减/被加数（上下两行） */
  const drawNum = (intS, fracS, y, col, weight) => {
    for (let k = 0; k < intS.length; k++){
      const i = intDigits - intS.length + k;
      label(svg, colX(i), y, intS[k], {size:19, weight:700, fill:col});
    }
    for (let k = 0; k < fracS.length; k++){
      const i = intDigits + k;
      label(svg, colX(i), y, fracS[k], {size:19, weight:700, fill:col});
    }
  };
  /* 小数点 */
  const dotX = colX(intDigits - 0.5 + 0.0);
  /* 竖式的小数点画在整数位与第一位小数之间 */
  const dotPos = o.x0 + intDigits * o.colW;
  const dot = (y, col) => s('circle', {cx:dotPos, cy:y - 5, r:3.4, fill:col}, svg);
  drawNum(ai, af, o.top, '#20304a');
  dot(o.top, '#20304a');
  drawNum(bi, bf, o.top + o.rowH, '#20304a');
  dot(o.top + o.rowH, '#20304a');
  /* 横线 */
  const lineY = o.top + o.rowH + 16;
  s('line', {x1:o.x0 - 12, y1:lineY, x2:o.x0 + nCols * o.colW + 6, y2:lineY,
    stroke:'#20304a', 'stroke-width':2}, svg);
  /* 计算过程（竖式逐位） */
  const result = op === '+'
    ? (Number(ai) + Number(bi || '0') + Number('0.' + af) + Number('0.' + bf))
    : (Number(ai) + Number('0.' + af) - Number(bi || '0') - Number('0.' + bf));
  const resStr = String(parseFloat(result.toFixed(fd + 3)));
  const R = decParts(resStr);
  const rf = R.frac;
  const resY = lineY + 30;
  /* 结果行 */
  for (let k = 0; k < R.int.length; k++){
    const i = intDigits - R.int.length + k;
    label(svg, colX(i), resY, R.int[k], {size:19, weight:800,
      fill: showStep >= 3 ? '#1f9d6b' : '#c9d4e4'});
  }
  for (let k = 0; k < rf.length; k++){
    const i = intDigits + k;
    label(svg, colX(i), resY, rf[k], {size:19, weight:800,
      fill: showStep >= 3 ? '#1f9d6b' : '#c9d4e4'});
  }
  if (showStep >= 3) s('circle', {cx:dotPos, cy:resY - 5, r:3.4, fill:'#1f9d6b'}, svg);
  /* 对齐标记 */
  if (showStep <= 2){
    s('line', {x1:dotPos, y1:o.top - 20, x2:dotPos, y2:resY + 8,
      stroke:'#d94a4a', 'stroke-width':2, 'stroke-dasharray':'5 4'}, svg);
    label(svg, dotPos + 8, o.top - 26, '小数点对齐', {size:12.5, weight:700, fill:'#d94a4a',
      anchor:'start'});
  }
  return {resStr, dotPos, colX, intDigits, fd};
}

/* ==========================================================================
   ① 小数加法
   ========================================================================== */
(function initAdd(){
  const sel = $('#addSel'), btn = $('#btnAddStep'), all = $('#btnAddAll'), rst = $('#btnAddReset');
  const stage = $('#addStage'), note = $('#addNote'), stepsEl = $('#addSteps');
  const CASES = [
    {a:'3.2', b:'2.8'},
    {a:'5.6', b:'3.7'},
    {a:'12.5', b:'7.35'},
    {a:'0.9', b:'0.15'}
  ];
  let step = 0;
  const N = 4;
  function render(){
    const c = CASES[+sel.value];
    const sum = +(Number(c.a) + Number(c.b)).toFixed(6);
    stepsEl.innerHTML = ['① 列竖式','② 小数点对齐','③ 相同数位相加','④ 写结果']
      .map((l, k) => `<div class="dot ${k < step ? 'done' : (k === step ? 'on' : '')}" title="${l}">${k+1}</div>`).join('');
    stage.innerHTML = '';
    const svg = s('svg', {viewBox:'0 0 640 210', width:640, height:210});
    stage.appendChild(svg);
    drawDecVert(svg, c.a, c.b, '+', step - 1, {x0:170});
    const ACAP = ['① 列竖式：' + c.a + ' + ' + c.b,
                  '② 小数点对齐（位数不够就补 0）',
                  '③ 相同数位相加，满十进 1',
                  '④ 得数的小数点与上面对齐'];
    label(svg, 320, 196, ACAP[step], {size:13.5, weight:700, fill:'#5b6b80'});
    if (step === 0){
      note.innerHTML = `第 ① 步：把 <b>${c.a}</b> 和 <b>${c.b}</b> 列成竖式。`;
    } else if (step === 1){
      note.innerHTML = `第 ② 步：<b>小数点对齐</b>（也就是相同数位对齐）。` +
        `<br>${c.a} 的小数点后面有 ${c.a.split('.')[1].length} 位，${c.b} 的小数点后面有 ${c.b.split('.')[1].length} 位，` +
        `位数不同的时候<b>要在位数少的前面补 0</b>。`;
    } else if (step === 2){
      note.innerHTML = `第 ③ 步：<b>相同数位上的数相加</b>，满十要向前一位进 1。`;
    } else {
      note.innerHTML = `第 ④ 步：<b>${c.a} + ${c.b} = ${sum}</b>。` +
        `<br><b>得数的小数点要和上面的小数点对齐</b>！` +
        `<br><b>检验</b>：${c.a} + ${c.b} = ${sum} ✓`;
    }
  }
  sel.addEventListener('change', () => { step = 0; render(); });
  btn.addEventListener('click', () => { step = (step + 1) % N; render(); });
  all.addEventListener('click', () => { step = N - 1; render(); });
  rst.addEventListener('click', () => { step = 0; render(); });
  /* 讲解入口：set(例序号 0~3, 步序 0~3) */
  window.MOD = window.MOD || {};
  MOD.add = {
    set(i, s){ sel.value = String(i == null ? 0 : i); step = (s == null ? 0 : s); render(); }
  };
  render();
})();

/* ==========================================================================
   ② 小数减法
   ========================================================================== */
(function initSub(){
  const sel = $('#subSel'), btn = $('#btnSubStep'), all = $('#btnSubAll'), rst = $('#btnSubReset');
  const stage = $('#subStage'), note = $('#subNote'), stepsEl = $('#subSteps');
  const CASES = [
    {a:'20', b:'0.35'},
    {a:'5', b:'3.68'},
    {a:'7.5', b:'2.75'},
    {a:'10', b:'0.06'}
  ];
  let step = 0;
  const N = 4;
  function render(){
    const c = CASES[+sel.value];
    const diff = +(Number(c.a) - Number(c.b)).toFixed(6);
    stepsEl.innerHTML = ['① 列竖式','② 小数点对齐（补 0）','③ 相减，不够减就退位','④ 写结果']
      .map((l, k) => `<div class="dot ${k < step ? 'done' : (k === step ? 'on' : '')}" title="${l}">${k+1}</div>`).join('');
    stage.innerHTML = '';
    const svg = s('svg', {viewBox:'0 0 640 210', width:640, height:210});
    stage.appendChild(svg);
    drawDecVert(svg, c.a, c.b, '−', step - 1, {x0:170});
    const SCAP = ['① 列竖式：' + c.a + ' − ' + c.b,
                  '② 小数点对齐，缺位补 0',
                  '③ 相同数位相减，不够减向前一位借',
                  '④ 得数的小数点与上面对齐'];
    label(svg, 320, 196, SCAP[step], {size:13.5, weight:700, fill:'#5b6b80'});
    if (step === 0){
      note.innerHTML = `第 ① 步：把 <b>${c.a}</b> 和 <b>${c.b}</b> 列成竖式。`;
    } else if (step === 1){
      const need = Math.max((c.a.split('.')[1] || '').length, (c.b.split('.')[1] || '').length);
      note.innerHTML = `第 ② 步：<b>小数点对齐</b>。${c.a} 和 ${c.b} 的小数位数不同，` +
        `要把 <b>${c.a}</b> 看成 <b>${Number(c.a).toFixed(need)}</b>（前面补 0），这样小数点才能对齐。`;
    } else if (step === 2){
      note.innerHTML = `第 ③ 步：<b>相同数位上的数相减</b>；` +
        `<b>哪一位不够减，就从前一位退 1 当 10</b>（也可以用"不够减就加 10 再减"）。`;
    } else {
      note.innerHTML = `第 ④ 步：<b>${c.a} − ${c.b} = ${diff}</b>。` +
        `<br><b>得数的小数点同样要和上面的小数点对齐</b>！` +
        `<br><b>检验</b>：${c.b} + ${diff} = ${(Number(c.b) + diff).toFixed(6)} = ${c.a} ✓`;
    }
  }
  sel.addEventListener('change', () => { step = 0; render(); });
  btn.addEventListener('click', () => { step = (step + 1) % N; render(); });
  all.addEventListener('click', () => { step = N - 1; render(); });
  rst.addEventListener('click', () => { step = 0; render(); });
  /* 讲解入口：set(例序号 0~3, 步序 0~3) */
  window.MOD = window.MOD || {};
  MOD.sub = {
    set(i, s){ sel.value = String(i == null ? 0 : i); step = (s == null ? 0 : s); render(); }
  };
  render();
})();

/* ==========================================================================
   ③ 小数点对齐 —— 错误列法对比
   例：1.2 + 0.68
     · 末位对齐（错）：'2' 和 '8' 挨在一起 → 1.80
     · 小数点对齐（对）：1.20 + 0.68 → 1.88
   两者结果不同，才能让学生看见"错在哪"。
   ========================================================================== */
(function initAlign(){
  const btn = $('#btnAlignStep'), rst = $('#btnAlignReset');
  const stage = $('#alignStage'), note = $('#alignNote'), stepsEl = $('#alignSteps');
  const COLX = i => 100 + i * 34;          /* 第 i 列的中心 x */
  let step = 0;
  const N = 3;
  /* 每一行 = [[列号, 字符], ...]，'.' 画成圆点 */
  const ROWS = {
    wrong: [[[1,'1'],[2,'.'],[3,'2']], [[0,'0'],[1,'.'],[2,'6'],[3,'8']]],
    right: [[[0,'1'],[1,'.'],[2,'2'],[3,'0']], [[0,'0'],[1,'.'],[2,'6'],[3,'8']]]
  };
  function drawRow(svg, spec, y, col){
    spec.forEach(([c, ch]) => {
      if (ch === '.'){
        s('circle', {cx:COLX(c), cy:y - 4, r:3.2, fill:col}, svg);
      } else {
        label(svg, COLX(c), y, ch, {size:19, weight:700, fill:'#20304a'});
      }
    });
  }
  function render(){
    stepsEl.innerHTML = ['① 末位对齐（错）','② 小数点对齐（对）','③ 比较结果']
      .map((l, k) => `<div class="dot ${k < step ? 'done' : (k === step ? 'on' : '')}" title="${l}">${k+1}</div>`).join('');
    stage.innerHTML = '';
    const W = 640, H = 250;
    const svg = s('svg', {viewBox:`0 0 ${W} ${H}`, width:W, height:H});
    stage.appendChild(svg);
    if (step === 0 || step === 3){
      label(svg, 175, 30, step === 3 ? '错在哪：单位不同' : '末位对齐（错误做法）',
        {size:15, weight:800, fill:'#d94a4a'});
      drawRow(svg, ROWS.wrong[0], 90, '#20304a');
      drawRow(svg, ROWS.wrong[1], 134, '#20304a');
      /* 末位对齐线：第 3 列 */
      s('line', {x1:COLX(3), y1:70, x2:COLX(3), y2:160, stroke:'#d94a4a',
        'stroke-width':2, 'stroke-dasharray':'5 4'}, svg);
      s('line', {x1:COLX(1), y1:150, x2:COLX(3) + 17, y2:150, stroke:'#20304a', 'stroke-width':2}, svg);
      label(svg, 380, 118, '1.2 + 0.68', {size:18, weight:700, fill:'#9b2f2f'});
      label(svg, 380, 148, '= 1.80 ❌', {size:19, weight:800, fill:'#d94a4a'});
      label(svg, 100, 196, '把"2"和"8"放在同一列相加——', {size:13, fill:'#4b5f7d', anchor:'start'});
      label(svg, 100, 216, '可"2"的单位是 0.1，"8"的单位是 0.01，根本不能直接加。',
        {size:13, fill:'#4b5f7d', anchor:'start'});
      if (step === 3){
        s('circle', {cx:COLX(3), cy:86, r:16, fill:'none', stroke:'#d94a4a', 'stroke-width':2.4}, svg);
        s('circle', {cx:COLX(3), cy:130, r:16, fill:'none', stroke:'#d94a4a', 'stroke-width':2.4}, svg);
        label(svg, 420, 86, '2 的单位是 0.1', {size:13.5, weight:700, fill:'#9b2f2f', anchor:'start'});
        label(svg, 420, 130, '8 的单位是 0.01', {size:13.5, weight:700, fill:'#9b2f2f', anchor:'start'});
      }
    } else if (step === 1){
      label(svg, 175, 30, '小数点对齐（正确做法）', {size:15, weight:800, fill:'#1f9d6b'});
      drawRow(svg, ROWS.right[0], 90, '#20304a');
      drawRow(svg, ROWS.right[1], 134, '#20304a');
      /* 小数点对齐线：第 1 列（两个小数点都在这里） */
      s('line', {x1:COLX(1), y1:70, x2:COLX(1), y2:160, stroke:'#d94a4a',
        'stroke-width':2.4, 'stroke-dasharray':'6 4'}, svg);
      label(svg, COLX(1) + 8, 44, '两个小数点对齐', {size:13, weight:700, fill:'#d94a4a', anchor:'start'});
      s('line', {x1:COLX(0) - 17, y1:150, x2:COLX(3) + 17, y2:150, stroke:'#20304a', 'stroke-width':2}, svg);
      label(svg, 380, 118, '1.20 + 0.68', {size:18, weight:700, fill:'#126b47'});
      label(svg, 380, 148, '= 1.88 ✓', {size:19, weight:800, fill:'#1f9d6b'});
      label(svg, 100, 196, '位数不够的补 0：1.2 看成 1.20，', {size:13, fill:'#4b5f7d', anchor:'start'});
      label(svg, 100, 216, '这样每一列的计数单位相同，才能直接相加。',
        {size:13, fill:'#4b5f7d', anchor:'start'});
    } else {
      label(svg, 175, 30, '两个结果比一比', {size:15, weight:800, fill:'#20304a'});
      s('rect', {x:80, y:56, width:220, height:54, rx:10, fill:'#fdecec', stroke:'#d94a4a', 'stroke-width':2}, svg);
      label(svg, 190, 88, '末位对齐 → 1.80 ❌', {size:17, weight:800, fill:'#9b2f2f'});
      s('rect', {x:330, y:56, width:230, height:54, rx:10, fill:'#e6f7ef', stroke:'#1f9d6b', 'stroke-width':2}, svg);
      label(svg, 445, 88, '小数点对齐 → 1.88 ✓', {size:17, weight:800, fill:'#126b47'});
      s('rect', {x:80, y:132, width:480, height:76, rx:10, fill:'#fff8ee', stroke:'#f08a24', 'stroke-width':2}, svg);
      label(svg, 320, 158, '同样两个数，列法不同结果就不同！', {size:15.5, weight:800, fill:'#b35c00'});
      label(svg, 320, 182, '所以列竖式一定要"小数点对齐"（相同数位对齐）。',
        {size:14.5, weight:700, fill:'#b35c00'});
      label(svg, 320, 230, '检验：0.68 + 1.88 = 2.56 = 1.2 + 0.68 ✓',
        {size:13.5, fill:'#4b5f7d'});
    }
    if (step === 0) note.innerHTML = '第 ① 步：先看<b>错误做法</b>——把两个数的<b>末位</b>对齐。';
    else if (step === 3) note.innerHTML = '第 ④ 步：<b>为什么错</b>——末位对齐时，同一列的两个数字<b>计数单位不同</b>，' +
      '<b>不同单位的数不能直接相加减</b>。';
    else if (step === 1) note.innerHTML = '第 ② 步：再看<b>正确做法</b>——<b>小数点对齐</b>，位数不够的<b>补 0</b>。';
    else note.innerHTML = `第 ③ 步：<b>教学口径</b>：小数加减法<b>必须小数点对齐</b>，不能末位对齐。` +
      `<br>因为<b>小数的计数单位不同</b>（0.1、0.01……），只有<b>相同数位</b>的数才能直接相加减。`;
  }
  btn.addEventListener('click', () => { step = (step + 1) % N; render(); });
  rst.addEventListener('click', () => { step = 0; render(); });
  /* 讲解入口：set(0 错做法 / 1 对做法 / 2 比结果 / 3 错在哪) */
  window.MOD = window.MOD || {};
  MOD.align = { set(s){ step = (s == null ? 0 : s); render(); } };
  render();
})();

/* ==========================================================================
   ④ 小数加减混合运算
   ========================================================================== */
(function initMixed(){
  const sel = $('#mixSel'), btn = $('#btnMixStep'), all = $('#btnMixAll'), rst = $('#btnMixReset');
  const stage = $('#mixStage'), note = $('#mixNote'), stepsEl = $('#mixSteps');
  const CASES = [
    {expr:'3.6 + 0.4 × 2.5', steps:[
      {e:'0.4 × 2.5 = 1', n:'算式里有<b>乘法</b>和<b>加法</b>，要<b>先算乘法</b>。'},
      {e:'3.6 + 1 = 4.6', n:'再算加法，得到 4.6。'}
    ]},
    {expr:'(7.5 − 2.3) × 2', steps:[
      {e:'7.5 − 2.3 = 5.2', n:'有<b>括号</b>，先算括号里面的减法。'},
      {e:'5.2 × 2 = 10.4', n:'再算括号外面的乘法，得到 10.4。'}
    ]},
    {expr:'12.5 − 2.5 × 4', steps:[
      {e:'2.5 × 4 = 10', n:'先算<b>乘法</b>：2.5 × 4 = 10。'},
      {e:'12.5 − 10 = 2.5', n:'再算减法，得到 2.5。<b>不能</b>从左往右先算 12.5 − 2.5！'}
    ]},
    {expr:'8.4 ÷ 2 + 3.6', steps:[
      {e:'8.4 ÷ 2 = 4.2', n:'算式里有<b>除法</b>和<b>加法</b>，要<b>先算除法</b>。'},
      {e:'4.2 + 3.6 = 7.8', n:'再算加法，得到 7.8。'}
    ]}
  ];
  let step = -1;
  function render(){
    const c = CASES[+sel.value];
    stepsEl.innerHTML = c.steps.map((s, i) =>
      `<div class="dot ${i < step ? 'done' : (i === step ? 'on' : '')}" title="第${i+1}步">${i+1}</div>`).join('');
    stage.innerHTML = '';
    const box = document.createElement('div');
    box.style.cssText = 'width:100%;text-align:center';
    const t0 = document.createElement('div');
    t0.style.cssText = 'font-size:25px;font-weight:800;color:#20304a;letter-spacing:2px;margin-bottom:8px';
    t0.textContent = c.expr + ' = ?';
    box.appendChild(t0);
    if (step >= 0){
      const t1 = document.createElement('div');
      t1.style.cssText = 'font-size:21px;font-weight:800;color:#1f9d6b;letter-spacing:1px';
      if (step >= c.steps.length) { t1.textContent = c.steps[c.steps.length - 1].e; } else { t1.textContent = c.steps[step].e; }
      box.appendChild(t1);
    }
    stage.appendChild(box);
    if (step < 0) note.innerHTML = '点"下一步"，看<b>先算什么、后算什么</b>。';
    else if (step >= c.steps.length) note.innerHTML = `<b>${c.steps[c.steps.length - 1].n}</b><br>` +
      `<b>教学口径</b>：<b>有括号先算括号里面的；没有括号先算乘除后算加减；同级运算从左往右</b>。`;
    else note.innerHTML = `第 <b>${step + 1}</b> 步：${c.steps[step].n}`;
  }
  sel.addEventListener('change', () => { step = -1; render(); });
  btn.addEventListener('click', () => { step++; if (step > CASES[+sel.value].steps.length) step = CASES[+sel.value].steps.length; render(); });
  all.addEventListener('click', () => { step = CASES[+sel.value].steps.length; render(); });
  window.MOD = window.MOD || {};
  MOD.mixed = { set(i, s){ sel.value = String(i == null ? 0 : i); step = (s == null ? -1 : s); render(); } };
  rst.addEventListener('click', () => { step = -1; render(); });
  render();
})();

/* ==========================================================================
   ⑤ 运算律推广到小数
   ========================================================================== */
(function initLaw(){
  const sel = $('#lawSel'), btn = $('#btnLawStep'), all = $('#btnLawAll'), rst = $('#btnLawReset');
  const stage = $('#lawStage'), note = $('#lawNote'), stepsEl = $('#lawSteps');
  const CASES = [
    {steps:[
      {e:'0.7 + 3.9 + 0.3', n:'三个数相加，先找<b>能凑整的数对</b>。'},
      {e:'(0.7 + 0.3) + 3.9', n:'用<b>加法交换律</b>交换位置，用<b>加法结合律</b>重新分组。'},
      {e:'1 + 3.9 = 4.9', n:'凑成整数 1，一步算完，得到 4.9。'}
    ]},
    {steps:[
      {e:'1.25 × 3.6 × 8', n:'三个数连乘，先找<b>能凑整的数对</b>。'},
      {e:'1.25 × 8 × 3.6', n:'用<b>乘法交换律</b>交换位置。'},
      {e:'10 × 3.6 = 36', n:'凑成整数 10，一步算完，得到 36。'}
    ]},
    {steps:[
      {e:'4.5 + 3.7 + 5.5', n:'三个数相加，先找能凑整的数对。'},
      {e:'(4.5 + 5.5) + 3.7', n:'用交换律和结合律重新分组。'},
      {e:'10 + 3.7 = 13.7', n:'凑成整数 10，一步算完，得到 13.7。'}
    ]},
    {steps:[
      {e:'2.5 × 1.3 × 4', n:'三个数连乘，先找能凑整的数对。'},
      {e:'2.5 × 4 × 1.3', n:'用乘法交换律交换位置。'},
      {e:'10 × 1.3 = 13', n:'凑成整数 10，一步算完，得到 13。'}
    ]}
  ];
  let step = -1;
  function render(){
    const c = CASES[+sel.value];
    stepsEl.innerHTML = c.steps.map((s, i) =>
      `<div class="dot ${i < step ? 'done' : (i === step ? 'on' : '')}" title="第${i+1}步">${i+1}</div>`).join('');
    stage.innerHTML = '';
    const box = document.createElement('div');
    box.style.cssText = 'width:100%;text-align:center';
    if (step >= 0){
      const t = document.createElement('div');
      t.style.cssText = 'font-size:24px;font-weight:800;color:#1f9d6b;letter-spacing:1px';
      if (step >= c.steps.length) { t.textContent = c.steps[c.steps.length - 1].e; } else { t.textContent = c.steps[step].e; }
      box.appendChild(t);
    }
    stage.appendChild(box);
    if (step < 0) note.innerHTML = '点"下一步"，看<b>整数运算律</b>怎么用在小数上。';
    else if (step >= c.steps.length) note.innerHTML = `<b>${c.steps[c.steps.length - 1].n}</b><br>` +
      `<b>教学口径</b>：<b>整数加法、乘法的运算律，对小数同样适用</b>——` +
      `因为小数的计数单位虽然不同，但<b>运算性质与整数是一样的</b>。`;
    else note.innerHTML = `第 <b>${step + 1}</b> 步：${c.steps[step].n}`;
  }
  sel.addEventListener('change', () => { step = -1; render(); });
  btn.addEventListener('click', () => { step++; if (step > CASES[+sel.value].steps.length) step = CASES[+sel.value].steps.length; render(); });
  all.addEventListener('click', () => { step = CASES[+sel.value].steps.length; render(); });
  window.MOD = window.MOD || {};
  MOD.law = { set(i, s){ sel.value = String(i == null ? 0 : i); step = (s == null ? -1 : s); render(); } };
  rst.addEventListener('click', () => { step = -1; render(); });
  render();
})();

/* ==========================================================================
   分层练习数据
   ========================================================================== */
const BASIC_CHOICE = [
  {q:'小数加减法列竖式时，正确的做法是（　）。',
   opts:['末位对齐','小数点对齐（相同数位对齐）','最高位对齐','位数多的对齐'], a:1,
   why:'小数加减法要小数点对齐，也就是相同数位对齐，这样每一列的计数单位才相同。',
   hint:'回到动画 ③ 小数点对齐。'},
  {q:'计算 3.2 + 2.8 的结果是（　）。', opts:['5','6.0','5.0','60'], a:1,
   why:'3.2 + 2.8 = 6.0，个位 3+2=5，十分位 2+8=10 满十进 1，得 6.0。',
   hint:'回到动画 ① 小数加法竖式。'},
  {q:'计算 5.6 + 3.7 的结果是（　）。', opts:['8.3','9.3','9.13','8.13'], a:1,
   why:'5.6 + 3.7 = 9.3（十分位 6+7=13，写 3 进 1）。',
   hint:'回到动画 ① 小数加法竖式。'},
  {q:'计算 7.5 − 2.75 的结果是（　）。', opts:['4.75','4.85','5.25','4.8'], a:0,
   why:'7.5 看成 7.50，7.50 − 2.75 = 4.75。',
   hint:'回到动画 ② 小数减法，位数不同要补 0。'},
  {q:'下面算式中，得数的小数点应该与上面的小数点（　）。', opts:['对齐','左移一位','右移一位','无所谓'], a:0,
   why:'得数的小数点必须和上面的小数点对齐，这是小数竖式的关键。',
   hint:'回到动画 ① 和 ② 的第 ④ 步。'},
  {q:'计算 0.9 + 0.15 的结果是（　）。', opts:['1.05','0.24','1.5','0.105'], a:0,
   why:'0.9 看成 0.90，0.90 + 0.15 = 1.05。',
   hint:'回到动画 ①，位数不同先补 0。'},
  {q:'下面说法正确的是（　）。',
   opts:['小数加减法可以末位对齐','小数点向右移动一位，小数的大小不变',
         '小数的末尾添上 0 或去掉 0，小数的大小不变','小数部分中间有 0 可以去掉'], a:2,
   why:'只有小数末尾的 0 才能添/去；小数点移动会改变大小；中间和整数部分的 0 不能动。',
   hint:'回到第四单元动画 ④ 小数的性质。', point:'小数的性质与加减法的关系：得数末尾的 0 可以去掉', care:'计算**过程中**不能随意去 0（会改变数位）；小数点对齐 ≠ 末位对齐'},
  {q:'计算 12.5 + 7.35 的结果是（　）。', opts:['19.85','19.75','20.85','19.8'], a:0,
   why:'12.50 + 7.35 = 19.85。',
   hint:'回到动画 ①，先补 0 再算。'}
];

const BASIC_FILL = [
  {q:'3.2 + 2.8 =（　）。', a:'6', why:'3.2 + 2.8 = 6，写成 6.0 也可以，数值相同。'},
  {q:'5.6 + 3.7 =（　）。', a:'9.3', why:'5.6 + 3.7 = 9.3。', point:'小数加法：小数点对齐，个位相加满十要**进位**', care:'十分位 6 + 7 = 13，写 3 进 1；个位 5 + 3 + 1 = 9', steps:['对齐小数点：5.6 + 3.7', '十分位：6 + 7 = 13，写 3，向进 1', '个位：5 + 3 + 进位 1 = 9', '结果是 9.3']},
  {q:'7.5 − 2.75 =（　）。', a:'4.75', why:'7.50 − 2.75 = 4.75。'},
  {q:'20 − 0.35 =（　）。', a:'19.65', why:'20.00 − 0.35 = 19.65。'},
  {q:'0.9 + 0.15 =（　）。', a:'1.05', why:'0.90 + 0.15 = 1.05。'},
  {q:'12.5 + 7.35 =（　）。', a:'19.85', why:'12.50 + 7.35 = 19.85。', point:'小数加法：小数点对齐，满十进位', care:'12.5 要看成 12.50；十分位 5 + 3 = 8，个位 2 + 7 = 9', steps:['对齐小数点：12.50 + 7.35', '十分位：5 + 3 = 8，不用进位', '个位：2 + 7 = 9', '结果是 19.85']}
];

const HAND_CHOICE = [
  {q:'下面各式中，竖式列法正确的是（　）。',
   opts:['计算 3.2 + 2.8 时把末位对齐','计算 12.5 + 7.35 时把小数点对齐',
         '计算 5 − 3.68 时把末位对齐','计算 0.9 + 0.15 时把最高位对齐'], a:1,
   why:'小数加减法一律小数点对齐，位数少的补 0。',
   hint:'回到动画 ③ 小数点对齐。'},
  {q:'计算 5 − 3.68 的结果是（　）。', opts:['2.32','1.32','2.68','1.68'], a:1,
   why:'5.00 − 3.68 = 1.32。',
   hint:'回到动画 ②，位数不同先补 0。'},
  {q:'计算 10 − 0.06 的结果是（　）。', opts:['9.94','9.4','10.6','9.06'], a:0,
   why:'10.00 − 0.06 = 9.94。',
   hint:'回到动画 ② 小数减法。'},
  {q:'下面各式的计算顺序正确的是（　）。',
   opts:['3.6 + 0.4 × 2.5，先算 3.6 + 0.4','3.6 + 0.4 × 2.5，先算 0.4 × 2.5',
         '12.5 − 2.5 × 4，先算 12.5 − 2.5','(7.5 − 2.3) × 2，先算 7.5'], a:1,
   why:'没有括号时先算乘除；12.5 − 2.5 × 4 要先算 2.5 × 4；(7.5 − 2.3) × 2 要先算括号。',
   hint:'回到动画 ④ 小数加减混合运算。'},
  {q:'用简便方法计算 0.7 + 3.9 + 0.3 的结果是（　）。', opts:['4.9','4.6','5.9','3.9'], a:0,
   why:'(0.7 + 0.3) + 3.9 = 1 + 3.9 = 4.9。',
   hint:'回到动画 ⑤ 运算律推广到小数。'},
  {q:'用简便方法计算 2.5 × 1.3 × 4 的结果是（　）。', opts:['13','6.5','10.4','52'], a:0,
   why:'2.5 × 4 × 1.3 = 10 × 1.3 = 13。',
   hint:'回到动画 ⑤，凑成整数 10。'}
];

const HAND_FILL = [
  {q:'20 − 0.35 =（　）。', a:'19.65', why:'20.00 − 0.35 = 19.65。'},
  {q:'5 − 3.68 =（　）。', a:'1.32', why:'5.00 − 3.68 = 1.32。'},
  {q:'10 − 0.06 =（　）。', a:'9.94', why:'10.00 − 0.06 = 9.94。'},
  {q:'7.5 − 2.75 =（　）。', a:'4.75', why:'7.50 − 2.75 = 4.75。'},
  {q:'0.7 + 3.9 + 0.3 =（　）。', a:'4.9', why:'(0.7 + 0.3) + 3.9 = 4.9。', point:'凑整：0.7 + 0.3 = 1，再加 3.9', care:'先找能凑整的一对，别从左往右', steps:['用交换律把 0.3 挪到 0.7 旁边', '0.7 + 0.3 = 1', '1 + 3.9 = 4.9']},
  {q:'2.5 × 1.3 × 4 =（　）。', a:'13', why:'2.5 × 4 × 1.3 = 13。'}
];

const EXT_CHOICE = [
  {q:'计算 4.5 + 3.7 + 5.5 的简便方法是（　）。',
   opts:['(4.5 + 3.7) + 5.5','(4.5 + 5.5) + 3.7','4.5 × (3.7 + 5.5)','按顺序算最快'], a:1,
   why:'用加法交换律和结合律，把 4.5 和 5.5 凑成 10：10 + 3.7 = 13.7。',
   hint:'回到动画 ⑤ 运算律推广到小数。', point:'加法交换律 + 结合律：把能凑整十的两个数先加', care:'4.5 + 5.5 = 10 先算；别从左往右算成 8.2 再 + 5.5'},
  {q:'下面各式中，能用简便方法计算的是（　）。',
   opts:['1.25 × 3.6 × 8','0.9 + 0.1','2.5 + 7.5','以上都可以'], a:3,
   why:'1.25 × 3.6 × 8 = 1.25 × 8 × 3.6 = 36；0.9 + 0.1 = 1；2.5 + 7.5 = 10，三个都能简便计算。',
   hint:'回到动画 ⑤，凑整是关键。', point:'简便计算的判断标准：**能不能凑整**，而不是“看起来像不像”', care:'0.9 + 0.1 = 1、2.5 + 7.5 = 10、1.25 × 3.6 × 8 都能凑整'},
  {q:'计算 9.8 − 3.6 − 2.4 的结果是（　）。', opts:['3.8','0.2','10','13.8'], a:0,
   why:'9.8 − (3.6 + 2.4) = 9.8 − 6 = 3.8（用减法的性质）。',
   hint:'回到第二单元动画 ② 的"减法的性质"。', point:'减法的性质：a − b − c = a − (b + c)', care:'3.6 + 2.4 = 6 正好凑整；9.8 − 6 = 3.8'},
  {q:'一列火车 3.6 小时行 180 千米，照这样计算，行 360 千米需要（　）小时。',
   opts:['3.6','7.2','5','100'], a:1,
   why:'速度 = 180 ÷ 3.6 = 50 千米/时，360 ÷ 50 = 7.2 小时。',
   hint:'回到第二单元动画 ④ 乘除混合运算，先求速度。', point:'归一问题：先求**1 小时行多少千米**，再求行 360 千米要几小时', care:'180 ÷ 3.6 = 50（千米/时），360 ÷ 50 = 7.2（小时）；别直接 180 × 2'},
  {q:'下面说法正确的是（　）。',
   opts:['计算小数加减法时，可以先把末尾的 0 去掉再算','小数加减法结果的末尾的 0 可以去掉',
         '小数加减法时，整数部分相加不进位到小数点左边','小数点对齐就是最高位对齐'], a:1,
   why:'得数末尾的 0 可以去掉（如 1.50 = 1.5）；计算时不能随意去 0；小数点对齐不是最高位对齐。',
   hint:'回到动画 ④ 与第四单元的"小数的性质"。', point:'小数的性质与加减法的关系：得数末尾的 0 可以去掉', care:'计算**过程中**不能随意去 0（会改变数位）；小数点对齐 ≠ 末位对齐'}
];

const EXT_FILL = [
  {q:'4.5 + 3.7 + 5.5 =（　）。', a:'13.7', why:'(4.5 + 5.5) + 3.7 = 10 + 3.7 = 13.7。', point:'凑整十：加法交换律 + 结合律', care:'先算 4.5 + 5.5 = 10', steps:['4.5 + 5.5 = 10', '10 + 3.7 = 13.7']},
  {q:'1.25 × 3.6 × 8 =（　）。', a:'36', why:'1.25 × 8 × 3.6 = 10 × 3.6 = 36。', point:'乘法交换律 + 结合律：让 1.25 × 8 凑整', care:'1.25 × 8 = 10，再 10 × 3.6 = 36', steps:['用交换律把 8 调到 1.25 旁边', '1.25 × 8 = 10', '10 × 3.6 = 36']},
  {q:'9.8 − 3.6 − 2.4 =（　）。', a:'3.8', why:'9.8 − (3.6 + 2.4) = 9.8 − 6 = 3.8。', point:'减法的性质：连续减两个数，可以先加后减', care:'3.6 + 2.4 = 6；9.8 − 6 = 3.8', steps:['= 9.8 − (3.6 + 2.4)', '= 9.8 − 6', '= 3.8']},
  {q:'3.6 + 0.4 × 2.5 =（　）。', a:'4.6', why:'0.4 × 2.5 = 1，3.6 + 1 = 4.6。', point:'运算顺序：先算乘法，再算加法', care:'0.4 × 2.5 = 1，再 3.6 + 1 = 4.6；不能先算 3.6 + 0.4', steps:['没有括号，先算乘：0.4 × 2.5 = 1', '再算加：3.6 + 1 = 4.6']},
  {q:'8.4 ÷ 2 + 3.6 =（　）。', a:'7.8', why:'8.4 ÷ 2 = 4.2，4.2 + 3.6 = 7.8。', point:'运算顺序：先算除法', care:'8.4 ÷ 2 = 4.2，再 + 3.6 = 7.8；不是 8.4 ÷ (2 + 3.6)', steps:['先算除法：8.4 ÷ 2 = 4.2', '再算加法：4.2 + 3.6 = 7.8']}
];

/* ==========================================================================
   第四档 · 五星挑战（浅奥思维）
   —— 逆向还原、小数巧算、"看起来怪"的算式
   ========================================================================== */
const STAR5_CHOICE = [
  {q:'计算 12.5 − 7.35 的结果是（　）。',
   opts:['5.15','4.15','5.25','6.15'], a:0,
   why:'小数点对齐（相同数位对齐）竖式计算：12.50 − 7.35 = <b>5.15</b>。' +
       '结果是两位小数，末尾的 0 不必保留。',
   hint:'回到动画 ② 小数减法：先把 12.5 看成 12.50，再小数点对齐。', point:'小数减法：**小数点对齐**（不是末位对齐），位数不够补 0', care:'12.5 要看成 12.50 再减；个位不够减要向十分位借', steps:['对齐小数点，把 12.5 看成 12.50', '整数部分 12 不够减 7，向十分位借：12.50 − 7.35', '十分位 9 − 3 = 6，百分位 0 − 5 不够借，再向十分位借', '结果是 5.15', '验算：5.15 + 7.35 = 12.50 ✓']},
  {q:'9.8 − 3.6 − 2.4 的结果是（　）。',
   opts:['3.8','0.2','13.8','16.8'], a:0,
   why:'用<b>减法的性质</b>：9.8 − (3.6 + 2.4) = 9.8 − 6 = <b>3.8</b>。',
   hint:'回到第二单元动画 ② 的"减法的性质"：连续减两个数，可以先加起来再减。', point:'减法的性质：a − b − c = a − (b + c)', care:'3.6 + 2.4 = 6；9.8 − 6 = 3.8', steps:['9.8 − 3.6 − 2.4 = 9.8 − (3.6 + 2.4)', '3.6 + 2.4 = 6', '9.8 − 6 = 3.8']},
  {q:'用简便方法计算 4.5 + 3.7 + 5.5，最简便的算法是（　）。',
   opts:['从左往右依次算','先把 4.5 和 5.5 相加得 10，再加 3.7',
         '先把 3.7 和 5.5 相加','先把 4.5 和 3.7 相加'], a:1,
   why:'用<b>加法交换律和结合律</b>：4.5 + 3.7 + 5.5 = (4.5 + 5.5) + 3.7 = <b>13.7</b>。' +
       '把能凑成整十的两个数放在一起算。',
   hint:'回到动画 ⑤ 运算律推广到小数：先找<b>能凑整的数对</b>。', point:'凑整十优先：4.5 + 5.5 正好是 10', care:'先凑整再算，不要从左往右', steps:['简便计算的关键是**凑整**', '看这三个数：4.5 和 5.5 正好凑成 10', '用加法交换律和结合律，把 5.5 挪到 4.5 旁边先算', '4.5 + 5.5 = 10，再 10 + 3.7 = 13.7']},
  {q:'用简便方法计算 4.5 + 3.75 + 5.5 的结果是（　）。',
   opts:['13.75','12.75','13.7','10.75'], a:0,
   why:'用<b>加法交换律和结合律</b>，把能凑整的两个数放在一起：' +
       '4.5 + 3.75 + 5.5 = (4.5 + 5.5) + 3.75 = 10 + 3.75 = <b>13.75</b>。',
   hint:'回到动画 ⑤ 运算律推广到小数：先找<b>能凑整的数对</b>（4.5 和 5.5）。', point:'加法交换律 + 结合律', care:'4.5 + 5.5 = 10，10 + 3.75 = 13.75（小数点对齐）', steps:['4.5 + 5.5 = 10', '10 + 3.75 = 13.75', '小数点对齐，百分位上 0 + 5 = 5']},
  {q:'下面各式中，结果<b>最大</b>的是（　）。',
   opts:['3.2 + 2.8','0.32 + 0.28','3.2 + 0.28','0.32 + 2.8'], a:0,
   why:'分别是 6、0.6、3.48、3.12，最大的是 <b>3.2 + 2.8 = 6</b>。' +
       '整数部分大的数就大（先比整数部分，再比十分位）。',
   hint:'回到动画 ⑤ 大小比较与第四单元"先比整数部分"。', point:'比较几个和的大小：先估**最高位**的量级', care:'3.2 + 2.8 = 6 最大；0.32 + 2.8 只有 3 点几，比 6 小', steps:['不用一个一个算，先**估**每个和的整数部分', '3.2 + 2.8：整数部分 3 + 2 = 5，结果是 6 左右', '0.32 + 0.28：整数部分都是 0，结果不到 1', '0.32 + 2.8：整数部分 0 + 2 = 2，结果是 3 左右', '3.2 + 2.8 = 6 最大']},
  {q:'一个数加上 3.5 再减去 2.8，等于这个数（　）。',
   opts:['增加 0.7','减少 0.7','不变','减少 6.3'], a:0,
   why:'把两次变化合起来：+3.5 − 2.8 = +0.7，所以这个数<b>增加 0.7</b>。',
   hint:'回到动画 ⑤ 混合运算：把两个一步运算合起来看净效果是多少。', point:'加减抵消：净变化 = +3.5 − 2.8 = +0.7', care:'先加后减，抵消后还**多** 0.7，是增加不是减少', steps:['设这个数为 a，先写成算式：a + 3.5 − 2.8', '把加减合并成一个数：3.5 − 2.8 = 0.7', '净变化是正数，表示这个数会变大', '所以这个数增加 0.7']}
];

const STAR5_FILL = [
  {q:'12.5 − 7.35 =（　）。', a:'5.15', why:'12.50 − 7.35 = 5.15。', point:'小数减法：小数点对齐，位数不够补 0', care:'12.5 看成 12.50；连续退位要一步一步来', steps:['对齐小数点：12.50 − 7.35', '个位 2 不够减 7，退位：11 + 10 = 21，21 − 7 = 14', '十分位 9 借走 1 变 8，8 − 3 = 5', '百分位 0 不够减 5，再借：10 − 5 = 5', '结果 5.15']},
  {q:'9.8 − 3.6 − 2.4 =（　）。', a:'3.8', why:'9.8 − (3.6 + 2.4) = 9.8 − 6 = 3.8。', point:'减法的性质：连续减两个数，可以先加后减', care:'3.6 + 2.4 = 6；9.8 − 6 = 3.8', steps:['= 9.8 − (3.6 + 2.4)', '= 9.8 − 6', '= 3.8']},
  {q:'4.5 + 3.7 + 5.5 =（　）。', a:'13.7', why:'(4.5 + 5.5) + 3.7 = 10 + 3.7 = 13.7。', point:'凑整十：加法交换律 + 结合律', care:'先算 4.5 + 5.5 = 10', steps:['4.5 + 5.5 = 10', '10 + 3.7 = 13.7']},
  {q:'5.6 + 3.7 =（　）。', a:'9.3', why:'5.6 + 3.7 = 9.3。', point:'小数加法：小数点对齐，个位相加满十要**进位**', care:'十分位 6 + 7 = 13，写 3 进 1；个位 5 + 3 + 1 = 9', steps:['对齐小数点：5.6 + 3.7', '十分位：6 + 7 = 13，写 3，向进 1', '个位：5 + 3 + 进位 1 = 9', '结果是 9.3']},
  {q:'0.7 + 3.9 + 0.3 =（　）。', a:'4.9', why:'(0.7 + 0.3) + 3.9 = 1 + 3.9 = 4.9。', point:'凑整：0.7 + 0.3 = 1，再加 3.9', care:'先找能凑整的一对，别从左往右', steps:['用交换律把 0.3 挪到 0.7 旁边', '0.7 + 0.3 = 1', '1 + 3.9 = 4.9']},
  {q:'12.5 + 7.35 =（　）。', a:'19.85', why:'12.50 + 7.35 = 19.85。', point:'小数加法：小数点对齐，满十进位', care:'12.5 要看成 12.50；十分位 5 + 3 = 8，个位 2 + 7 = 9', steps:['对齐小数点：12.50 + 7.35', '十分位：5 + 3 = 8，不用进位', '个位：2 + 7 = 9', '结果是 19.85']}
];

/* 装配四档练习（巩固 / 动手 / 扩展 / 五星挑战） */
bootCourse([
  {key:'basic', title:'第一档 · 巩固基础（笔算加减 · 数位对齐）', prefix:'基', star:3,
   choice:BASIC_CHOICE, fill:BASIC_FILL,
   host:'#basicBlock', score:'#scoreBasic', total:'#totalBasic', reset:'#btnResetBasic'},
  {key:'hand', title:'第二档 · 动手操作（竖式计算 · 混合运算）', prefix:'动', star:3,
   choice:HAND_CHOICE, fill:HAND_FILL,
   host:'#handBlock', score:'#scoreHand', total:'#totalHand', reset:'#btnResetHand'},
  {key:'ext', title:'第三档 · 扩展思维（简便计算 · 巧算 · 易错辨析）', prefix:'拓', star:4,
   choice:EXT_CHOICE, fill:EXT_FILL,
   host:'#extBlock', score:'#scoreExt', total:'#totalExt', reset:'#btnResetExt'},
  {key:'star5', title:'第四档 · 五星挑战（浅奥思维）', prefix:'奥', star:5,
   choice:STAR5_CHOICE, fill:STAR5_FILL,
   host:'#star5Block', score:'#scoreStar5', total:'#totalStar5', reset:'#btnResetStar5'}
]);
