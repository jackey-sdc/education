/* ==========================================================================
   第二单元 混合运算和运算律 —— 交互模块
   口径：① 先乘除后加减，有括号先算括号；同级运算从左往右
        ② 运算律只改变顺序，不改变数和结果
        ③ 乘法分配律可正用可逆用
   ========================================================================== */

/* ==========================================================================
   ① 混合运算的顺序
   ========================================================================== */
(function initOrder(){
  const sel = $('#ordSel'), btn = $('#btnOrdStep'), all = $('#btnOrdAll'), rst = $('#btnOrdReset');
  const stage = $('#ordStage'), note = $('#ordNote'), stepsEl = $('#ordSteps');
  /* 每个算式拆成若干步：{expr 表达式, note 说明} */
  const CASES = [
    {expr:'24 + 6 × 5', steps:[
      {e:'6 × 5 = 30', n:'算式里有<b>乘法</b>和<b>加法</b>，要<b>先算乘法</b>。'},
      {e:'24 + 30 = 54', n:'再算加法。<b>不能</b>从左往右先算 24 + 6！'}
    ]},
    {expr:'120 ÷ 3 + 18', steps:[
      {e:'120 ÷ 3 = 40', n:'算式里有<b>除法</b>和<b>加法</b>，要<b>先算除法</b>。'},
      {e:'40 + 18 = 58', n:'再算加法，得到 58。'}
    ]},
    {expr:'(36 + 54) ÷ 6', steps:[
      {e:'36 + 54 = 90', n:'算式里有<b>括号</b>，要<b>先算括号里面的</b>。'},
      {e:'90 ÷ 6 = 15', n:'再算括号外面的除法，得到 15。'}
    ]},
    {expr:'25 × 4 ÷ 5 + 18', steps:[
      {e:'25 × 4 = 100', n:'先算<b>乘除</b>。'},
      {e:'100 ÷ 5 = 20', n:'除法和乘法是<b>同一级</b>，要<b>从左往右</b>依次算。'},
      {e:'20 + 18 = 38', n:'最后算加法，得到 38。'}
    ]},
    {expr:'(125 - 25) × 8', steps:[
      {e:'125 - 25 = 100', n:'有<b>括号</b>，先算括号里的减法。'},
      {e:'100 × 8 = 800', n:'再算括号外面的乘法，得到 800。'}
    ]}
  ];
  let step = -1;
  function render(){
    const c = CASES[+sel.value];
    stepsEl.innerHTML = c.steps.map((s, i) =>
      `<div class="dot ${i < step ? 'done' : (i === step ? 'on' : '')}" title="第${i+1}步">${i+1}</div>`).join('');
    stage.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.style.cssText = 'width:100%;text-align:center';
    const orig = document.createElement('div');
    orig.style.cssText = 'font-size:26px;font-weight:800;color:#20304a;letter-spacing:2px;margin-bottom:10px';
    orig.textContent = c.expr + ' = ?';
    wrap.appendChild(orig);
    /* 已完成的步骤 */
    if (step >= 0){
      const done = document.createElement('div');
      done.style.cssText = 'font-size:20px;color:#1f9d6b;font-weight:700;margin-bottom:8px';
      done.textContent = (step >= c.steps.length ? c.steps[c.steps.length - 1] : c.steps[step]).e;
      wrap.appendChild(done);
    }
    stage.appendChild(wrap);
    if (step < 0){
      note.innerHTML = `算式 <b>${c.expr}</b>。点"下一步"看计算顺序。<br>` +
        `<b>三句口诀</b>：<b>有括号先算括号；先乘除后加减；同级从左往右</b>。`;
    } else if (step >= c.steps.length){
      const last = c.steps[c.steps.length - 1].e;
      const val = last.split('=').pop().trim();
      note.innerHTML = `<b>${c.expr} = ${val}</b>　${c.steps[c.steps.length - 1].n}` +
        `<br><b>易错提醒</b>：<b>同级运算要从左往右</b>，不能"乘除都先算"。`;
    } else {
      note.innerHTML = `第 <b>${step + 1}</b> 步：${c.steps[step].n}<br>` +
        `<b>当前结果</b>：<b>${c.steps[step].e}</b>`;
    }
  }
  sel.addEventListener('change', () => { step = -1; render(); });
  btn.addEventListener('click', () => { step++; if (step > CASES[+sel.value].steps.length) step = CASES[+sel.value].steps.length; render(); });
  all.addEventListener('click', () => { step = CASES[+sel.value].steps.length; render(); });
  rst.addEventListener('click', () => { step = -1; render(); });
  /* 讲解入口：set(例序号 0~4, 步序 -1~3) */
  window.MOD = window.MOD || {};
  MOD.order = {
    set(i, s){ sel.value = String(i == null ? 0 : i); step = (s == null ? -1 : s); render(); }
  };
  render();
})();

/* ==========================================================================
   ② 加法的运算律
   ========================================================================== */
(function initAddLaw(){
  const sel = $('#addSel'), btn = $('#btnAddStep'), all = $('#btnAddAll'), rst = $('#btnAddReset');
  const stage = $('#addStage'), note = $('#addNote'), stepsEl = $('#addSteps');
  const CASES = [
    {law:'加法交换律', form:'a + b = b + a',
     steps:[
       {e:'38 + 62 = 62 + 38', n:'两个加数<b>交换位置</b>，和不变——这是<b>加法交换律</b>。'},
       {e:'62 + 38 = 100', n:'这样凑成了<b>整百数</b>，算得快多了。'}
     ]},
    {law:'加法结合律', form:'(a + b) + c = a + (b + c)',
     steps:[
       {e:'(88 + 125) + 12', n:'原式按<b>从左往右</b>的顺序算：88 + 125 = 213，不方便。'},
       {e:'88 + (125 + 12)', n:'用<b>加法结合律</b>，先算后两个：125 + 12 = 137。'},
       {e:'88 + 137 = 225', n:'再算 88 + 137 = 225。<b>结果和原式一样</b>，但好算多了。'}
     ]},
    {law:'减法的性质', form:'a - b - c = a - (b + c)',
     steps:[
       {e:'a - 36 - 64', n:'连续减去两个数，可以<b>先把两个减数加起来</b>。'},
       {e:'a - (36 + 64)', n:'用<b>减法的性质</b>变形。'},
       {e:'a - 100', n:'36 + 64 = 100，凑成整百，计算简便。'}
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
    const t1 = document.createElement('div');
    t1.style.cssText = 'font-size:20px;font-weight:800;color:#7a4fd6;margin-bottom:6px';
    t1.textContent = c.law + '：' + c.form;
    box.appendChild(t1);
    if (step >= 0){
      const t2 = document.createElement('div');
      t2.style.cssText = 'font-size:23px;font-weight:800;color:#1f9d6b;letter-spacing:1px';
      t2.textContent = (step >= c.steps.length ? c.steps[c.steps.length - 1] : c.steps[step]).e;
      box.appendChild(t2);
    }
    stage.appendChild(box);
    if (step < 0) note.innerHTML = `本例用的是<b>${c.law}</b>：<b>${c.form}</b>。点"下一步"看变形过程。`;
    else if (step >= c.steps.length) note.innerHTML = `<b>${c.steps[c.steps.length - 1].n}</b><br><b>要点</b>：<b>运算律只改变运算顺序，运算数和结果都不变</b>。`;
    else note.innerHTML = `第 <b>${step + 1}</b> 步：${c.steps[step].n}`;
  }
  sel.addEventListener('change', () => { step = -1; render(); });
  btn.addEventListener('click', () => { step++; if (step > CASES[+sel.value].steps.length) step = CASES[+sel.value].steps.length; render(); });
  all.addEventListener('click', () => { step = CASES[+sel.value].steps.length; render(); });
  rst.addEventListener('click', () => { step = -1; render(); });
  /* 讲解入口：set(例序号 0~2, 步序 -1~3) */
  window.MOD = window.MOD || {};
  MOD.addlaw = {
    set(i, s){ sel.value = String(i == null ? 0 : i); step = (s == null ? -1 : s); render(); }
  };
  render();
})();

/* ==========================================================================
   ③ 乘法的运算律（点子图）
   ========================================================================== */
(function initMulLaw(){
  const a = $('#mulA'), b = $('#mulB'), lab = $('#mulLabel');
  const stage = $('#mulStage'), note = $('#mulNote');
  /* 讲解用分级：0 只有第一组 / 1 加第二组（换了位置）/ 2 加结论框 */
  let lvl = 2;
  function render(){
    const A = +a.value, B = +b.value;
    lab.textContent = A + ' × ' + B + ' = ' + A * B;
    stage.innerHTML = '';
    const W = 640, H = 300;
    const svg = s('svg', {viewBox:`0 0 ${W} ${H}`, width:W, height:H});
    stage.appendChild(svg);
    const total = A * B;
    /* 上面：A 组，每组 B 个 —— 交换律：把两组交换位置 */
    const r1 = 60, cw = 26;
    label(svg, 100, 30, A + ' 组，每组 ' + B + ' 个', {size:14, weight:700, fill:'#2f6fd0'});
    for (let i = 0; i < A; i++){
      for (let j = 0; j < B; j++){
        s('circle', {cx:70 + j*cw, cy:48 + i*cw, r:9, fill:'#2f6fd0', opacity:.85}, svg);
      }
    }
    if (lvl >= 1){
      /* 下面：B 组，每组 A 个 —— 交换律：两个因数交换位置，总个数不变 */
      label(svg, 330, 30, B + ' 组，每组 ' + A + ' 个（换了位置）', {size:14, weight:700, fill:'#f08a24'});
      for (let i = 0; i < B; i++){
        for (let j = 0; j < A; j++){
          s('circle', {cx:300 + j*cw, cy:48 + i*cw, r:9, fill:'#f08a24', opacity:.85}, svg);
        }
      }
    }
    /* 结论 */
    if (lvl >= 2){
      s('rect', {x:150, y:240, width:340, height:42, rx:10, fill:'#f6f2ff', stroke:'#7a4fd6', 'stroke-width':2}, svg);
      label(svg, 320, 267, A + ' × ' + B + ' = ' + B + ' × ' + A + ' = ' + total,
        {size:17, weight:800, fill:'#5b34b8'});
    }
    if (lvl === 0){
      note.innerHTML = `一共 <b>${A}</b> 组，每组 <b>${B}</b> 个，数一数就知道了。`;
      return;
    }
    note.innerHTML = `<b>${A} × ${B} = ${B} × ${A} = ${total}</b>——两个因数<b>交换位置</b>，积不变，这就是<b>乘法交换律</b>。` +
      `<br>如果三个数连乘，还可以用<b>乘法结合律</b>：<b>(a × b) × c = a × (b × c)</b>，先算前两个或先算后两个都行。` +
      `<br>例如 <b>125 × 32 × 25</b>：把 32 和 25 凑成 800，先算 125 × 8 = 1000，再乘 100，就是结合律 + 交换律连用。`;
  }
  a.addEventListener('input', render);
  b.addEventListener('input', render);
  $('#btnMulReset').addEventListener('click', () => { a.value = 3; b.value = 4; lvl = 2; render(); });
  /* 讲解入口：set(组数, 每组个数, 分级 0~2) */
  window.MOD = window.MOD || {};
  MOD.mullaw = {
    set(A, B, l){ a.value = A; b.value = B; lvl = (l == null ? 2 : l); render(); }
  };
  render();
})();

/* ==========================================================================
   ④ 乘法分配律 —— 面积模型
   ========================================================================== */
(function initDistrib(){
  const a = $('#distA'), lab = $('#distLabel');
  const stage = $('#distStage'), note = $('#distNote');
  /* 讲解用分级：0 只有面积图 / 1 加整块算式 / 2 加拆开的两块 / 3 加结论 */
  let lvl = 3;
  function render(){
    const A = +a.value;               /* a 的数值 */
    const B = 100 - A;
    const C = 25;                     /* 宽固定取 25，方便口算 */
    lab.textContent = A + ' + ' + B;      /* 注意用数值 A，不是滑块元素 a */
    stage.innerHTML = '';
    const W = 640, H = 300;
    const svg = s('svg', {viewBox:`0 0 ${W} ${H}`, width:W, height:H});
    stage.appendChild(svg);
    /* areaModel 内部已标好 a / b / c 与 a×c / b×c */
    areaModel(svg, {x:60, y:70, w:340, h:150, a:A/100, b:B/100});
    /* 右边算式：逐级揭示（用具体数，讲的时候指得出来） */
    if (lvl >= 1) label(svg, 480, 108, '(' + A + ' + ' + B + ') × ' + C, {size:16, weight:700, fill:'#20304a'});
    if (lvl >= 2){
      label(svg, 480, 140, '= ' + A + '×' + C + ' + ' + B + '×' + C, {size:16, weight:700, fill:'#1f9d6b'});
      label(svg, 480, 172, '= ' + A * C + ' + ' + B * C, {size:15, weight:700, fill:'#4b5f7d'});
    }
    if (lvl >= 3){
      s('rect', {x:420, y:186, width:200, height:38, rx:9, fill:'#f6f2ff', stroke:'#7a4fd6', 'stroke-width':2}, svg);
      label(svg, 520, 211, '整块 = ' + (A + B) * C, {size:16, weight:800, fill:'#5b34b8'});
    }
    if (lvl === 0){
      note.innerHTML = `一个长方形，宽是 <b>c</b>，长被分成 <b>a</b> 和 <b>b</b> 两段。` +
        `<br>先别算，想想：<b>整块的面积，能怎么求</b>？`;
      return;
    }
    note.innerHTML = `<b>用面积模型看分配律</b>：整个长方形是 <b>(a + b) × c</b>；` +
      `沿竖线切成两块后，面积是 <b>a × c</b> 和 <b>b × c</b>。` +
      `<br><b>所以 (a + b) × c = a × c + b × c</b>。` +
      `<br><b>教学口径</b>：<b>两个数的和与一个数相乘，可以分别用这个数去乘两个数，再把积相加</b>。` +
      `<br><b>逆用</b>：<b>a × c + b × c = (a + b) × c</b>（两个乘法有<b>相同的因数</b>，可以"合"起来）。`;
  }
  a.addEventListener('input', render);
  $('#btnDistReset').addEventListener('click', () => { a.value = 60; lvl = 3; render(); });
  /* 讲解入口：set(分点百分比, 分级 0~3) */
  window.MOD = window.MOD || {};
  MOD.distrib = {
    set(v, l){ a.value = v; lvl = (l == null ? 3 : l); render(); }
  };
  render();
})();

/* ==========================================================================
   ④b 分配律的逆用与变形
   ========================================================================== */
(function initDistrib2(){
  const btn = $('#btnDistStep'), all = $('#btnDistAll'), rst = $('#btnDistReset');
  const stage = $('#dist2Stage'), note = $('#dist2Note'), stepsEl = $('#distSteps');
  const STEPS = [
    {e:'102 × 45', n:'直接算要两步乘法，比较麻烦。<b>想办法把 102 拆开</b>。'},
    {e:'(100 + 2) × 45', n:'把 102 拆成 <b>100 + 2</b>（拆数）。'},
    {e:'100 × 45 + 2 × 45', n:'用<b>乘法分配律</b>展开。'},
    {e:'4500 + 90 = 4590', n:'两项分别算再相加，得到 4590。<b>比直接算快</b>。'},
    {e:'25 × 37 + 25 × 63', n:'换个方向：两项乘法有<b>相同的因数 25</b>。'},
    {e:'25 × (37 + 63)', n:'用<b>分配律的逆用</b>把 25 提出来（合）。'},
    {e:'25 × 100 = 2500', n:'凑成整百，一步算完，得到 2500。'}
  ];
  let step = -1;
  function render(){
    stepsEl.innerHTML = STEPS.map((s, i) =>
      `<div class="dot ${i < step ? 'done' : (i === step ? 'on' : '')}" title="第${i+1}步">${i+1}</div>`).join('');
    stage.innerHTML = '';
    const box = document.createElement('div');
    box.style.cssText = 'width:100%;text-align:center';
    if (step >= 0){
      const t = document.createElement('div');
      t.style.cssText = 'font-size:23px;font-weight:800;color:#1f9d6b;letter-spacing:1px;margin-bottom:6px';
      t.textContent = (step >= STEPS.length ? STEPS[STEPS.length - 1] : STEPS[step]).e;
      box.appendChild(t);
    } else {
      const t = document.createElement('div');
      t.style.cssText = 'font-size:20px;font-weight:700;color:#7a4fd6';
      t.textContent = '102 × 45　　25 × 37 + 25 × 63';
      box.appendChild(t);
    }
    stage.appendChild(box);
    if (step < 0) note.innerHTML = '点"下一步"，看<b>分配律的"拆"与"合"</b>两种用法。';
    else if (step >= STEPS.length) note.innerHTML = `<b>${STEPS[STEPS.length - 1].n}</b><br>` +
      `<b>要点</b>：<b>分配律可以正用（拆开乘），也可以逆用（把相同的因数合起来）</b>。`;
    else note.innerHTML = `第 <b>${step + 1}</b> 步：${STEPS[step].n}`;
  }
  btn.addEventListener('click', () => { step++; if (step > STEPS.length) step = STEPS.length; render(); });
  all.addEventListener('click', () => { step = STEPS.length; render(); });
  rst.addEventListener('click', () => { step = -1; render(); });
  /* 讲解入口：set(步序 -1~7) */
  window.MOD = window.MOD || {};
  MOD.distrib2 = {
    set(s){ step = (s == null ? -1 : s); render(); }
  };
  render();
})();

/* ==========================================================================
   ⑤ 简便计算
   ========================================================================== */
(function initSimple(){
  const sel = $('#simSel'), btn = $('#btnSimStep'), all = $('#btnSimAll'), rst = $('#btnSimReset');
  const stage = $('#simStage'), note = $('#simNote'), stepsEl = $('#simSteps');
  const CASES = [
    {steps:[
      {e:'125 × 32 × 25', n:'三个数连乘，先找<b>能凑整的数对</b>。'},
      {e:'125 × 8 × 4 × 25', n:'把 32 拆成 <b>8 × 4</b>（拆数），用<b>结合律</b>重新分组。'},
      {e:'(125 × 8) × (4 × 25)', n:'用<b>乘法结合律</b>分组。'},
      {e:'1000 × 100 = 100000', n:'两个整千、整百相乘，一步得到 100000。'}
    ]},
    {steps:[
      {e:'99 × 25 + 25', n:'后两项有<b>相同的因数 25</b>。'},
      {e:'(99 + 1) × 25', n:'用<b>分配律的逆用</b>把 25 提出来。'},
      {e:'100 × 25 = 2500', n:'凑成整百，一步算完。'}
    ]},
    {steps:[
      {e:'101 × 36 - 36', n:'后两项有<b>相同的因数 36</b>。'},
      {e:'(101 - 1) × 36', n:'用<b>分配律的逆用</b>（注意减法要写成加 (-36)）。'},
      {e:'100 × 36 = 3600', n:'凑成整百，一步算完。'}
    ]},
    {steps:[
      {e:'25 × 32 × 125', n:'三个数连乘，先找能凑整的数对。'},
      {e:'25 × 4 × 8 × 125', n:'把 32 拆成 4 × 8，重新分组。'},
      {e:'(25 × 4) × (8 × 125)', n:'用<b>乘法结合律</b>分组。'},
      {e:'100 × 1000 = 100000', n:'两个整百、整千相乘，一步得到 100000。'}
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
      t.style.cssText = 'font-size:23px;font-weight:800;color:#1f9d6b;letter-spacing:1px';
      t.textContent = (step >= c.steps.length ? c.steps[c.steps.length - 1] : c.steps[step]).e;
      box.appendChild(t);
    }
    stage.appendChild(box);
    if (step < 0) note.innerHTML = '点"下一步"，看每一步<b>用了哪条运算律</b>。';
    else if (step >= c.steps.length) note.innerHTML = `<b>${c.steps[c.steps.length - 1].n}</b><br>` +
      `<b>教学口径</b>：<b>简便计算的依据是运算律</b>，每一步变形都要写清用了哪条规律，不能凭空"凑"出来。`;
    else note.innerHTML = `第 <b>${step + 1}</b> 步：${c.steps[step].n}`;
  }
  sel.addEventListener('change', () => { step = -1; render(); });
  btn.addEventListener('click', () => { step++; if (step > CASES[+sel.value].steps.length) step = CASES[+sel.value].steps.length; render(); });
  all.addEventListener('click', () => { step = CASES[+sel.value].steps.length; render(); });
  rst.addEventListener('click', () => { step = -1; render(); });
  /* 讲解入口：set(例序号 0~3, 步序 -1~4) */
  window.MOD = window.MOD || {};
  MOD.simple = {
    set(i, s){ sel.value = String(i == null ? 0 : i); step = (s == null ? -1 : s); render(); }
  };
  render();
})();

/* ==========================================================================
   分层练习数据
   ========================================================================== */
const BASIC_CHOICE = [
  {q:'计算 24 + 6 × 5 的结果是（　）。', opts:['54','150','90'], a:0,
   why:'有乘法和加法，先算乘法：6 × 5 = 30，再算 24 + 30 = 54。',
   hint:'回到动画 ①，记住"先乘除，后加减"。'},
  {q:'计算 (36 + 54) ÷ 6 的结果是（　）。', opts:['15','90','6'], a:0,
   why:'有括号先算括号里的：36 + 54 = 90，再算 90 ÷ 6 = 15。',
   hint:'回到动画 ① 运算顺序，括号优先。'},
  {q:'下面各式中，计算顺序正确的是（　）。',
   opts:['25 × 4 ÷ 5 + 18，先算 5 + 18','25 × 4 ÷ 5 + 18，先算 25 × 4',
         '25 × 4 ÷ 5 + 18，先算 25 × 4 ÷ 5','以上都不对'], a:2,
   why:'先算乘除，同级从左往右：25 × 4 = 100，100 ÷ 5 = 20，最后 20 + 18 = 38。',
   hint:'回到动画 ①，先乘除后加减，同级从左往右。'},
  {q:'下面等式中，符合加法交换律的是（　）。',
   opts:['a + b = b + a','(a + b) + c = a + (b + c)','a × b = b × a','a - b = b - a'], a:0,
   why:'加法交换律是 a + b = b + a；选项 B 是加法结合律，C 是乘法交换律，D 是错的。',
   hint:'回到动画 ② 加法的运算律，注意区分交换律和结合律。'},
  {q:'下面等式中，符合加法结合律的是（　）。',
   opts:['a + b = b + a','(a + b) + c = a + (b + c)','a × b = b × a','a + 0 = a'], a:1,
   why:'加法结合律是 (a + b) + c = a + (b + c)，三个数先算前两个或先算后两个，和不变。',
   hint:'回到动画 ② 加法的运算律。'},
  {q:'a - 36 - 64 可以写成（　）。', opts:['a - (36 + 64)','a - 100','(a - 36) - 64','a + 36 + 64'], a:0,
   why:'减法的性质：a - b - c = a - (b + c)，所以 a - 36 - 64 = a - (36 + 64)。',
   hint:'回到动画 ② 的第三个例子"减法的性质"。'},
  {q:'下面说法正确的是（　）。',
   opts:['用运算律变形后，运算数变了，结果也变了','用运算律变形后，运算数和结果都不变',
         '简便计算是一种新的计算方法','交换律可以把 5 + 3 变成 3 × 5'], a:1,
   why:'运算律只改变运算的顺序，运算数和结果都不变。',
   hint:'回到动画 ② 末尾的"要点"提示。', point:'运算律的意义：只改变运算的顺序或形式，**结果一定不变**', care:'“变号”不成立：a − 36 − 64 ≠ a + 36 + 64；分配律也不能把两因数随便改成一样的数'},
  {q:'下面各式中，运用了乘法分配律的是（　）。',
   opts:['25 × 37 + 25 × 63 = 25 × (37 + 63)','25 × 37 = 37 × 25',
         '(25 × 37) × 63 = 25 × (37 × 63)','25 + 37 = 37 + 25'], a:0,
   why:'A 是分配律的逆用（把相同的因数 25 提出来）；B 是乘法交换律，C 是乘法结合律，D 是加法交换律。',
   hint:'回到动画 ④ 乘法分配律，注意"相同因数"这个特征。'}
];

const BASIC_FILL = [
  {q:'120 ÷ 3 + 18 =（　）。', a:'58', why:'先算除法 120 ÷ 3 = 40，再算 40 + 18 = 58。'},
  {q:'(125 - 25) × 8 =（　）。', a:'800', why:'先算括号里的 125 - 25 = 100，再算 100 × 8 = 800。'},
  {q:'25 × 4 ÷ 5 + 18 =（　）。', a:'38', why:'先算乘除：25 × 4 = 100，100 ÷ 5 = 20，再算 20 + 18 = 38。'},
  {q:'125 × 32 × 25 =（　）。', a:'100000', why:'125 × 8 × 4 × 25 = (125 × 8) × (4 × 25) = 1000 × 100 = 100000。', point:'拆数 + 结合律：把 32 拆成 8 × 4，8 去配 125，4 去配 25', care:'拆开后必须**两个都凑整**才算简便；漏掉一半就又回到竖式', steps:['把 32 拆成 8 × 4（因为 125 × 8 = 1000，4 × 25 = 100）', '原式 = 125 × 8 × 4 × 25', '用结合律把 125 × 8 和 4 × 25 分别先算', '1000 × 100 = 100000']},
  {q:'99 × 25 + 25 =（　）。', a:'2500', why:'(99 + 1) × 25 = 100 × 25 = 2500。'},
  {q:'两个数相乘，如果一个因数不变，另一个因数扩大到原来的 4 倍，那么积扩大到原来的（　）倍。', a:'4',
   why:'一个因数不变，另一个扩大到 4 倍，积就扩大到 4 倍。'}
];

const HAND_CHOICE = [
  {q:'用简便方法计算 102 × 45 的结果是（　）。', opts:['4590','4500','4170','4592'], a:0,
   why:'(100 + 2) × 45 = 4500 + 90 = 4590。',
   hint:'回到动画 ④b 第 ① 步，把 102 拆成 100 + 2。'},
  {q:'用简便方法计算 25 × 37 + 25 × 63 的结果是（　）。', opts:['2500','9250','2000','1000'], a:0,
   why:'25 × (37 + 63) = 25 × 100 = 2500。',
   hint:'回到动画 ④b 第 ⑤ 步，两项有相同的因数 25。'},
  {q:'下面计算正确的是（　）。',
   opts:['25 × 4 ÷ 5 + 18 = 25 × 4 ÷ (5 + 18)','25 × 4 ÷ 5 + 18 = 25 × 4 ÷ 5 + 18 = 20 + 18',
         '(25 + 18) ÷ 5 + 4 = 43 ÷ 5 + 4 = 12……3 + 4','以上都不对'], a:1,
   why:'同级运算从左往右：25 × 4 = 100，100 ÷ 5 = 20，再 20 + 18 = 38。',
   hint:'回到动画 ①，同级运算从左往右依次算。'},
  {q:'把 88 + 125 + 12 用简便方法计算，正确做法是（　）。',
   opts:['(88 + 125) + 12','88 + (125 + 12)','(88 + 12) + 125','按原顺序算最快'], a:1,
   why:'用加法结合律，先算 125 + 12 = 137，再算 88 + 137 = 225。',
   hint:'回到动画 ② 的加法结合律例子。'},
  {q:'下面各式中，能用乘法分配律简算的是（　）。',
   opts:['35 × 12 + 35 × 88','35 × 12 × 88','35 + 12 + 88','35 × (12 + 88)'], a:0,
   why:'35 × 12 + 35 × 88 有相同的因数 35，可用分配律逆用：35 × (12 + 88) = 35 × 100 = 3500。',
   hint:'回到动画 ④ 乘法分配律，找"相同的因数"。'},
  {q:'用简便方法计算 101 × 36 - 36 的结果是（　）。', opts:['3636','3600','3663','3240'], a:1,
   why:'101 × 36 - 36 = (101 - 1) × 36 = 100 × 36 = 3600。',
   hint:'回到动画 ④b，把后两项看成 25 × ... 的形式：36 = 1 × 36。'}
];

const HAND_FILL = [
  {q:'102 × 45 =（　）。', a:'4590', why:'(100 + 2) × 45 = 4500 + 90 = 4590。'},
  {q:'25 × 37 + 25 × 63 =（　）。', a:'2500', why:'25 × (37 + 63) = 25 × 100 = 2500。', point:'分配律的逆用：把相同的因数 25 提出来', care:'37 + 63 = 100 正好凑整，这是题目故意设计的', steps:['两项都有因数 25', '= 25 × (37 + 63)', '括号里 37 + 63 = 100', '25 × 100 = 2500']},
  {q:'125 × 32 × 25 =（　）。', a:'100000', why:'(125 × 8) × (4 × 25) = 1000 × 100 = 100000。', point:'拆数 + 结合律：把 32 拆成 8 × 4，8 去配 125，4 去配 25', care:'拆开后必须**两个都凑整**才算简便；漏掉一半就又回到竖式', steps:['把 32 拆成 8 × 4（因为 125 × 8 = 1000，4 × 25 = 100）', '原式 = 125 × 8 × 4 × 25', '用结合律把 125 × 8 和 4 × 25 分别先算', '1000 × 100 = 100000']},
  {q:'用简便方法计算 (125 - 25) × 8 =（　）。', a:'800', why:'(125 - 25) × 8 = 100 × 8 = 800。'},
  {q:'101 × 36 - 36 =（　）。', a:'3600', why:'(101 - 1) × 36 = 100 × 36 = 3600。'}
];

const EXT_CHOICE = [
  {q:'用简便方法计算 88 × 125 的结果是（　）。', opts:['11000','10000','12000','10800'], a:0,
   why:'88 × 125 = 8 × 11 × 125 = 1000 × 11 = 11000。',
   hint:'回到动画 ⑤，把 88 拆成 8 × 11，再和 125 凑整。', point:'拆数 + 乘法交换律、结合律：把 88 拆开，去凑 125 能凑成的整千', care:'88 拆成 8 × 11（不是 80 + 8）；只有 125 × 8 = 1000 能凑整，凑整才是简便的'},
  {q:'计算 125 × 32 × 25 的正确简便过程是（　）。',
   opts:['125 × 32 × 25 = (125 × 32) × 25 = 4000 × 25',
         '125 × 32 × 25 = 125 × 8 × 4 × 25 = (125 × 8) × (4 × 25)',
         '125 × 32 × 25 = 125 + 32 + 25',
         '125 × 32 × 25 = 125 × (32 + 25)'], a:1,
   why:'把 32 拆成 8 × 4，用结合律把 125 和 8 凑成 1000，4 和 25 凑成 100。',
   hint:'回到动画 ⑤ 第 ② 步。', point:'拆数 + 结合律：把 32 拆成 8 × 4，分别去配 125 和 25', care:'拆数只能拆成**乘**（不能拆成加）；结合律只改变**顺序**，每个因数本身不能变'},
  {q:'下面说法正确的是（　）。',
   opts:['交换律可以用于加减法，不能用于乘法','结合律可以改变运算数的位置',
         '分配律的逆用必须先把两个因数都变成一样的数','简便计算的结果与原式结果一定相等'], a:3,
   why:'简便计算用的是运算律，只改变运算顺序，结果一定与原式相等。',
   hint:'回到动画 ② 的"要点"提示。', point:'运算律的意义：只改变运算的顺序或形式，**结果一定不变**', care:'“变号”不成立：a − 36 − 64 ≠ a + 36 + 64；分配律也不能把两因数随便改成一样的数'},
  {q:'一个数乘 99 再加这个数，等于这个数乘（　）。', opts:['100','98','101','90'], a:0,
   why:'x × 99 + x = x × 99 + x × 1 = x × (99 + 1) = x × 100。',
   hint:'回到动画 ⑤，把后面的 x 看成 x × 1。', point:'逆用分配律：a × 99 + a = a × (99 + 1)', care:'要把“这个数”当成**一个整体**提出括号外，两个 99 和 1 相加', steps:['设这个数为 a：a × 99 + a', '两个式子里都有 a，提取公因数 a', '= a × (99 + 1) = a × 100', '所以等于这个数乘 100']},
  {q:'用简便方法计算 25 × 32 × 125 的结果是（　）。', opts:['100000','10000','1000','250000'], a:0,
   why:'(25 × 4) × (8 × 125) = 100 × 1000 = 100000。',
   hint:'回到动画 ⑤ 第 ③ 步，把 32 拆成 4 × 8。', point:'乘法交换律 + 结合律凑整：让互为“好数”的两个因数先相乘', care:'25 和 125 已经很好算，要拆的是 32（拆成 8 × 4），别去硬算 32 × 25'}
];

const EXT_FILL = [
  {q:'88 × 125 =（　）。', a:'11000', why:'8 × 11 × 125 = 1000 × 11 = 11000。', point:'拆数凑整：125 × 8 = 1000，是最值得凑的一对', care:'88 = 8 × 11；先把 88 拆开再交换顺序，不要直接竖式算', steps:['想：125 乘 8 = 1000，能凑整', '把 88 拆成 8 × 11', '125 × 8 × 11 = 1000 × 11 = 11000']},
  {q:'125 × 32 × 25 =（　）。', a:'100000', why:'(125 × 8) × (4 × 25) = 1000 × 100 = 100000。', point:'拆数 + 结合律：把 32 拆成 8 × 4，8 去配 125，4 去配 25', care:'拆开后必须**两个都凑整**才算简便；漏掉一半就又回到竖式', steps:['把 32 拆成 8 × 4（因为 125 × 8 = 1000，4 × 25 = 100）', '原式 = 125 × 8 × 4 × 25', '用结合律把 125 × 8 和 4 × 25 分别先算', '1000 × 100 = 100000']},
  {q:'一个数乘 99 再加这个数，等于这个数乘（　）。', a:'100',
   why:'x × 99 + x = x × (99 + 1) = x × 100。', point:'逆用分配律：a × 99 + a = a × (99 + 1)', care:'要把“这个数”当成**一个整体**提出括号外，两个 99 和 1 相加', steps:['设这个数为 a：a × 99 + a', '两个式子里都有 a，提取公因数 a', '= a × (99 + 1) = a × 100', '所以等于这个数乘 100']},
  {q:'简便计算 99 × 99 + 99 =（　）。', a:'9900',
   why:'99 × 99 + 99 × 1 = 99 × (99 + 1) = 99 × 100 = 9900。', point:'逆用分配律：99 × 99 + 99 = 99 × (99 + 1)', care:'别算成 99 × (99 − 1)；这里加的是 99，要“加 1”', steps:['99 × 99 + 99 里，两项都有 99', '提取公因数 99：99 × (99 + 1)', '括号里 99 + 1 = 100', '99 × 100 = 9900']},
  {q:'25 × 32 × 125 =（　）。', a:'100000', why:'(25 × 4) × (8 × 125) = 100 × 1000 = 100000。', point:'乘法交换律 + 结合律凑整', care:'拆的是 32；25 × 4 = 100，125 × 8 = 1000', steps:['把 32 拆成 8 × 4', '25 × 32 × 125 = 25 × 8 × 4 × 125', '25 × 4 = 100，125 × 8 = 1000', '100 × 1000 = 100000']}
];

/* ==========================================================================
   第四档 · 五星挑战（浅奥思维）
   —— 巧算的"为什么这样拆"、算律的逆向运用
   ========================================================================== */
const STAR5_CHOICE = [
  {q:'下面算式中，能用乘法分配律简算的是（　）。',
   opts:['(25 + 75) × 4','25 + 75 × 4','25 × 4 + 75','(25 + 4) × 75'], a:0,
   why:'<b>(25 + 75) × 4 = 25 × 4 + 75 × 4</b>，符合乘法分配律。' +
       'B 是"先乘后加"，不能分配；C、D 的括号位置不对应同一个因数。',
   hint:'回到动画 ④ 乘法分配律：看两个乘法有没有<b>相同的因数</b>。', point:'分配律的**正用**：(a + b) × c = a × c + b × c', care:'只有“两个部分乘**同一个数**”才能合并；25 + 75 × 4 里 75 只乘了 4，不能拆', steps:['先看每个式子的结构：只有“两个部分乘**同一个数**”才能用分配律合并', 'A：(25 + 75) × 4 —— 25 和 75 都乘 4，正是分配律的正用 ✓', 'B：25 + 75 × 4 —— 只有 75 乘了 4，不能合并', 'C：25 × 4 + 75 —— 没有相同的因数，不能合并', 'D：(25 + 4) × 75 —— 结构像，但它的“和”是 25 + 4，拆开要乘 75，不简便', '所以答案是 A']},
  {q:'125 × 88 用简便方法计算，结果是（　）。',
   opts:['11000','12500','10880','10000'], a:0,
   why:'把 88 拆成 <b>8 × 11</b>，因为 <b>125 × 8 = 1000</b> 能凑整，' +
       '所以 125 × 88 = 125 × 8 × 11 = 1000 × 11 = <b>11000</b>。',
   hint:'回到动画 ⑤ 简便计算：先找<b>能凑整的数对</b>，125 和 8 能凑成 1000。', point:'拆数凑整：125 × 8 = 1000', care:'88 要拆成 8 × 11；125 × 8 恰好整千', steps:['把 88 拆成 8 × 11', '125 × 8 × 11', '125 × 8 = 1000', '1000 × 11 = 11000']},
  {q:'3.7 × 101 − 3.7 的结果是（　）。',
   opts:['3.7','37','370','373.7'], a:2,
   why:'把 − 3.7 看成 − 3.7 × 1，用<b>分配律逆用</b>：' +
       '3.7 × (101 − 1) = 3.7 × 100 = 370。',
   hint:'回到动画 ④b 分配律的逆用：两项乘法要有<b>相同的因数</b>。', point:'逆用分配律：3.7 × 101 − 3.7 = 3.7 × (101 − 1)', care:'括号里是**减 1**（因为原来是减 3.7）；算成 3.7 × 100 = 370', steps:['两项里都有 3.7，可以**提取公因数**', '3.7 × 101 − 3.7 = 3.7 × 101 − 3.7 × 1（把 3.7 看成 3.7 × 1）', '= 3.7 × (101 − 1)', '= 3.7 × 100 = 370']},
  {q:'1.25 × 3.2 × 2.5 的结果是（　）。',
   opts:['10','1','8','100'], a:0,
   why:'用<b>乘法交换律和结合律</b>：1.25 × 2.5 = 3.125，再 3.125 × 3.2 = 10。' +
       '（也可以先算 2.5 × 3.2 = 8，再 1.25 × 8 = 10。）',
   hint:'回到动画 ③ 乘法运算律：先找<b>能凑整的数对</b>。', point:'乘法交换律 + 结合律：先让两个小数相乘**凑成整数**', care:'3.2 × 2.5 = 8，再用 1.25 × 8 = 10；直接按顺序算会很慢', steps:['目标是让两个小数相乘能**凑成整数**', '用交换律把 2.5 调到 3.2 前面：1.25 × 3.2 × 2.5', '3.2 × 2.5 = 8', '1.25 × 8 = 10', '答：10']},
  {q:'4.8 × 0.25 的最简便算法是（　）。',
   opts:['4.8 × (1 ÷ 4) = 4.8 ÷ 4 = 1.2','直接算 4.8 × 0.25 = 1.2',
         '(4.8 + 0.25) × 1 = 5.05','4.8 × 0.25 = 4.8 × 0.5 ÷ 2'], a:0,
   why:'0.25 = 1 ÷ 4，所以 4.8 × 0.25 = 4.8 ÷ 4 = 1.2，<b>÷ 4 比 × 0.25 简单</b>。',
   hint:'回到动画 ⑤ 简便计算：0.25 也就是四分之一，想想能不能"变除法"。', point:'把小数看成**分数**：0.25 = 1/4，所以乘 0.25 等于除以 4', care:'4.8 ÷ 4 可以再拆成 ÷2 ÷2 口算；不要去算 (4.8 + 0.25) × 1', steps:['把 0.25 看成 1/4：0.25 = 1 ÷ 4', '4.8 × 0.25 = 4.8 × (1 ÷ 4) = 4.8 ÷ 4', '4.8 ÷ 4 可以拆成 4.8 ÷ 2 ÷ 2 = 2.4 ÷ 2 = 1.2', '比直接算 4.8 × 0.25 更简便，答：4.8 × (1 ÷ 4) = 4.8 ÷ 4 = 1.2']},
  {q:'下面的简便算法中，<b>依据的运算律用错了</b>的是（　）。',
   opts:['25 × 37 + 25 × 63 = 25 × (37 + 63) = 2500',
         '125 × 32 × 25 = 125 × 8 × 4 × 25 = 100000',
         'a − 36 − 64 = a − (36 + 64)',
         '(20 + 5) × 4 = 20 × 4 + 5'], a:3,
   why:'D 错在<b>漏乘了 5</b>：正确的应该是 (20 + 5) × 4 = 20 × 4 + <b>5 × 4</b> = 100。' +
       '（5 乘的是 4，不是 5 本身。）',
   hint:'回到动画 ④ 面积模型：把长方形沿竖线切开，<b>每一块都要乘宽</b>。', point:'辨析运算律：分配律要求**两部分都乘同一个数**', care:'(20 + 5) × 4 要拆成 20 × 4 + 5 × 4，漏乘 5 就错了', steps:['逐个检查：A 是分配律的逆用，对；B 是结合律，对；C 是减法的性质，对', 'D：(20 + 5) × 4 按分配律应等于 20 × 4 + 5 × 4', '20 × 4 + 5 × 4 = 80 + 20 = 100，而 20 × 4 + 5 = 85', '所以 D 漏乘了 5，用错了乘法分配律']}
];

const STAR5_FILL = [
  {q:'125 × 32 × 25 =（　）。', a:'100000',
   why:'(125 × 8) × (4 × 25) = 1000 × 100 = 100000。', point:'拆数 + 结合律：把 32 拆成 8 × 4，8 去配 125，4 去配 25', care:'拆开后必须**两个都凑整**才算简便；漏掉一半就又回到竖式', steps:['把 32 拆成 8 × 4（因为 125 × 8 = 1000，4 × 25 = 100）', '原式 = 125 × 8 × 4 × 25', '用结合律把 125 × 8 和 4 × 25 分别先算', '1000 × 100 = 100000']},
  {q:'99 × 99 + 99 =（　）。', a:'9900',
   why:'99 × 99 + 99 × 1 = 99 × (99 + 1) = 99 × 100 = 9900。', point:'逆用分配律提取公因数', care:'括号里是加 1', steps:['两项都有 99，提取公因数', '= 99 × (99 + 1)', '= 99 × 100', '= 9900']},
  {q:'25 × 37 + 25 × 63 =（　）。', a:'2500',
   why:'25 × (37 + 63) = 25 × 100 = 2500。', point:'分配律的逆用：把相同的因数 25 提出来', care:'37 + 63 = 100 正好凑整，这是题目故意设计的', steps:['两项都有因数 25', '= 25 × (37 + 63)', '括号里 37 + 63 = 100', '25 × 100 = 2500']},
  {q:'3.7 × 101 − 3.7 =（　）。', a:'370',
   why:'3.7 × (101 − 1) = 3.7 × 100 = 370。', point:'逆用分配律：a × b − a = a × (b − 1)', care:'括号里是减 1，算出 3.7 × 100 = 370', steps:['两项都有 3.7', '= 3.7 × (101 − 1)', '= 3.7 × 100', '= 370']},
  {q:'1.25 × 3.2 × 2.5 =（　）。', a:'10',
   why:'1.25 × 2.5 = 3.125，3.125 × 3.2 = 10。', point:'交换律 + 结合律：先凑整数再算', care:'3.2 × 2.5 = 8；1.25 × 8 = 10', steps:['用交换律把 2.5 调到 3.2 前面：1.25 × 3.2 × 2.5', '3.2 × 2.5 = 8', '1.25 × 8 = 10', '答：10']},
  {q:'4.5 + 3.7 + 5.5 =（　）。', a:'13.7',
   why:'(4.5 + 5.5) + 3.7 = 10 + 3.7 = 13.7。', point:'加法交换律 + 结合律：把能凑成整十的两个数放在一起', care:'4.5 + 5.5 = 10 先算；不要从左往右算 (4.5 + 3.7) = 8.2 再加 5.5', steps:['看哪两个数能凑整十：4.5 和 5.5', '用交换律把 5.5 挪到 4.5 旁边', '4.5 + 5.5 = 10', '10 + 3.7 = 13.7']}
];

/* 装配四档练习（巩固 / 动手 / 扩展 / 五星挑战） */
bootCourse([
  {key:'basic', title:'第一档 · 巩固基础（运算顺序 · 五大运算律）', prefix:'基', star:3,
   choice:BASIC_CHOICE, fill:BASIC_FILL,
   host:'#basicBlock', score:'#scoreBasic', total:'#totalBasic', reset:'#btnResetBasic'},
  {key:'hand', title:'第二档 · 动手操作（按顺序计算 · 变形与简便计算）', prefix:'动', star:3,
   choice:HAND_CHOICE, fill:HAND_FILL,
   host:'#handBlock', score:'#scoreHand', total:'#totalHand', reset:'#btnResetHand'},
  {key:'ext', title:'第三档 · 扩展思维（巧算 · 简便推理 · 易错辨析）', prefix:'拓', star:4,
   choice:EXT_CHOICE, fill:EXT_FILL,
   host:'#extBlock', score:'#scoreExt', total:'#totalExt', reset:'#btnResetExt'},
  {key:'star5', title:'第四档 · 五星挑战（浅奥思维）', prefix:'奥', star:5,
   choice:STAR5_CHOICE, fill:STAR5_FILL,
   host:'#star5Block', score:'#scoreStar5', total:'#totalStar5', reset:'#btnResetStar5'}
]);
