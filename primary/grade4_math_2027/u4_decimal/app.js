/* ==========================================================================
   第四单元 小数的认识 —— 交互模块
   口径：① 把单位"1"平均分成 10/100/1000 份，取其中的份数用小数表示
        ② 计数单位 0.1/0.01/0.001，相邻进率 10；数位与计数单位一一对应
        ③ 读法：整数部分按整数读，小数点读"点"，小数部分依次读每一位
        ④ 性质：只有"末尾"的 0 才能添/去；中间的 0、整数部分的 0 不能动
        ⑤ 比较：先整数部分，再依次比十分位、百分位……
        ⑥ 小数点右移扩大，左移缩小
   ========================================================================== */

/* 小数读法：整数部分按整数读，小数部分逐位读 */
function readDecimal(str){
  const s = String(str).trim();
  const i = s.indexOf('.');
  if (i < 0) return {int: s, frac: '', text: s};
  const intPart = s.slice(0, i), frac = s.slice(i + 1);
  const CN = ['零','一','二','三','四','五','六','七','八','九'];
  /* 整数部分转中文（支持 0~9999） */
  function int2cn(n){
    n = String(n);
    if (n.length <= 3){
      let out = '', zero = false;
      for (let i = 0; i < n.length; i++){
        const d = +n[i], p = n.length - 1 - i;
        if (d === 0){ zero = true; continue; }
        if (zero && out) out += '零';
        zero = false;
        if (d === 1 && p === 1 && i === 0) out += '十';
        else out += CN[d] + ['','十','百','千'][p];
      }
      return out;
    }
    /* 四位：拆成"几千几百几十几" */
    const d = n[0], rest = n.slice(1);
    return CN[d] + '千' + int2cn(rest);
  }
  const intText = intPart === '' ? '零' : int2cn(intPart);
  const fracText = frac.split('').map(c => CN[+c]).join('');
  return {int: intPart, frac, intText, fracText,
          text: intText + '点' + fracText};
}

/* ==========================================================================
   ① 小数的意义 —— 十格图
   ========================================================================== */
(function initMeaning(){
  const fill = $('#decFill'), lab = $('#decLabel');
  const stage = $('#decStage'), note = $('#decNote');
  function render(){
    const n = +fill.value;
    lab.textContent = '0.' + n;
    stage.innerHTML = '';
    const W = 640, H = 250;
    const svg = s('svg', {viewBox:`0 0 ${W} ${H}`, width:W, height:H});
    stage.appendChild(svg);
    /* 十格图 */
    tenGrid(svg, 70, 60, 34, n, '#f08a24');
    label(svg, 70 + 34*2.5, 60 + 34*2 + 26, '把"1"平均分成 10 份', {size:13, fill:'#4b5f7d'});
    /* 箭头 */
    s('path', {d:'M 260 95 L 300 95 M 290 87 L 300 95 L 290 103', fill:'none',
      stroke:'#8fa3bd', 'stroke-width':2, 'stroke-linecap':'round', 'stroke-linejoin':'round'}, svg);
    /* 分数表示 */
    s('rect', {x:320, y:60, width:120, height:68, rx:8, fill:'#e8f1ff', stroke:'#2f6fd0', 'stroke-width':2}, svg);
    label(svg, 380, 86, n + '/10', {size:22, weight:800, fill:'#2f6fd0'});
    label(svg, 380, 112, '= ' + (n/10).toFixed(1), {size:15, weight:700, fill:'#4b5f7d'});
    /* 小数 */
    s('rect', {x:470, y:60, width:130, height:68, rx:8, fill:'#fff2e2', stroke:'#f08a24', 'stroke-width':2}, svg);
    label(svg, 535, 102, '0.' + n, {size:26, weight:800, fill:'#b35c00'});
    /* 计数单位链 */
    const units = [['0.1', '十分位'], ['0.01', '百分位'], ['0.001', '千分位']];
    let ux = 70;
    units.forEach(([u, nm], i) => {
      s('rect', {x:ux, y:170, width:120, height:52, rx:9,
        fill: i === 0 ? '#fff2e2' : '#f7f9fd', stroke: i === 0 ? '#f08a24' : '#c9d4e4', 'stroke-width':1.8}, svg);
      label(svg, ux + 60, 192, u, {size:17, weight:800, fill: i === 0 ? '#b35c00' : '#4b5f7d'});
      label(svg, ux + 60, 212, nm, {size:12, fill:'#4b5f7d'});
      if (i < 2){
        label(svg, ux + 136, 196, '× 10', {size:12.5, weight:700, fill:'#8a97a8'});
      }
      ux += 176;
    });
    note.innerHTML = n === 0
      ? '把"1"平均分成 10 份，<b>涂 0 份</b>表示 <b>0</b>。拖动滑块试试。'
      : `十格图中涂 <b>${n} 格</b>，就是 <b>${n}/10</b>，写作小数是 <b>0.${n}</b>。` +
        `<br><b>教学口径</b>：把单位"1"<b>平均分成 10 份</b>，其中 1 份是 <b>0.1</b>，` +
        `${n} 份就是 <b>0.${n}</b>。` +
        `<br><b>计数单位</b>：<b>0.1（十分位）、0.01（百分位）、0.001（千分位）</b>；` +
        `<b>相邻两个计数单位之间的进率是 10</b>（0.1 → 0.01 是 ÷10，0.01 → 0.001 也是 ÷10）。`;
  }
  fill.addEventListener('input', render);
  $('#btnDecReset').addEventListener('click', () => { fill.value = 3; render(); });
  /* 讲解入口：set(涂几格 0~10) */
  window.MOD = window.MOD || {};
  MOD.meaning = {
    set(n){ fill.value = n; render(); }
  };
  render();
})();

/* ==========================================================================
   ② 数位顺序表
   ========================================================================== */
(function initPlace(){
  const inp = $('#placeNum'), btn = $('#btnPlaceStep'), rst = $('#btnPlaceReset');
  const stage = $('#placeStage'), note = $('#placeNote'), stepsEl = $('#placeSteps');
  let step = 0;
  const COLS = [
    {t:'千位', u:'1000'}, {t:'百位', u:'100'}, {t:'十位', u:'10'}, {t:'个位', u:'1'},
    {t:'.', u:'—'},
    {t:'十分位', u:'0.1'}, {t:'百分位', u:'0.01'}, {t:'千分位', u:'0.001'}
  ];
  function render(){
    const raw = (inp.value || '0').trim();
    const neg = raw.startsWith('-');
    const v = raw.replace('-', '');
    const i = v.indexOf('.');
    const intPart = i < 0 ? v : v.slice(0, i);
    const frac = i < 0 ? '' : v.slice(i + 1);
    stepsEl.innerHTML = ['① 拆分整数与小数','② 定位每一位','③ 对照计数单位']
      .map((l, k) => `<div class="dot ${k < step ? 'done' : (k === step ? 'on' : '')}" title="${l}">${k+1}</div>`).join('');
    stage.innerHTML = '';
    const W = 640, H = 210;
    const svg = s('svg', {viewBox:`0 0 ${W} ${H}`, width:W, height:H});
    stage.appendChild(svg);
    /* 数位表 */
    const cw = 74, x0 = 22, y0 = 52;
    COLS.forEach((c, k) => {
      const x = x0 + k * cw;
      const isDot = c.t === '.';
      const isFrac = ['十分位','百分位','千分位'].indexOf(c.t) >= 0;
      s('rect', {x, y:y0, width:cw-3, height:56, rx:6,
        fill: isDot ? '#f08a24' : (isFrac ? '#e6f7ef' : '#e8f1ff'),
        stroke: isDot ? '#f08a24' : '#c9d4e4', 'stroke-width':1.6}, svg);
      label(svg, x + (cw-3)/2, y0 + 20, c.t, {size:12.5, weight:700,
        fill: isDot ? '#fff' : '#20304a'});
      label(svg, x + (cw-3)/2, y0 + 40, c.u, {size:11.5, fill: isDot ? '#fff' : '#4b5f7d'});
    });
    /* 各位上的数字 */
    const intDigits = intPart.split('').reverse();
    const fracDigits = frac.split('');
    const intCols = 4, fracCols = 3;
    const putInt = (d, idx) => {
      const x = x0 + (intCols - 1 - idx) * cw;
      label(svg, x + (cw-3)/2, y0 - 14, d, {size:22, weight:800, fill:'#2f6fd0'});
    };
    for (let k = 0; k < intDigits.length && k < intCols; k++) putInt(intDigits[k], k);
    for (let k = 0; k < fracDigits.length && k < fracCols; k++){
      const x = x0 + (intCols + 1 + k) * cw;
      label(svg, x + (cw-3)/2, y0 - 14, fracDigits[k], {size:22, weight:800, fill:'#b35c00'});
    }
    /* 标注 */
    s('rect', {x:x0, y:y0 + 62, width:intCols*cw - 3, height:24, rx:6, fill:'#e8f1ff', opacity:.7}, svg);
    label(svg, x0 + (intCols*cw - 3)/2, y0 + 79, '整数部分', {size:13, weight:700, fill:'#2f6fd0'});
    s('rect', {x:x0 + (intCols+1)*cw, y:y0 + 62, width:fracCols*cw - 3, height:24, rx:6, fill:'#e6f7ef', opacity:.7}, svg);
    label(svg, x0 + (intCols+1)*cw + (fracCols*cw - 3)/2, y0 + 79, '小数部分', {size:13, weight:700, fill:'#157a52'});
    /* 当前这一拍的说明，直接写在画面上 */
    const PCAP = ['① 以小数点为界：左边整数，右边小数',
                  '② 小数部分从十分位起：十分位 → 百分位 → 千分位',
                  '③ 每一位都有自己的计数单位：0.1 / 0.01 / 0.001'];
    label(svg, 320, y0 + 118, PCAP[step], {size:13.5, weight:700, fill:'#5b6b80'});
    /* 说明 */
    if (step === 0){
      note.innerHTML = `这个小数是 <b>${neg ? '-' : ''}${v}</b>。` +
        `<br>第 ① 步：把它拆成<b>整数部分 ${intPart || '0'}</b> 和 <b>小数部分 ${frac || '0'}</b>（以小数点为界）。`;
    } else if (step === 1){
      note.innerHTML = `第 ② 步：把每一位的数字填进数位顺序表。` +
        `<br>小数点<b>左边是整数部分</b>，<b>右边是小数部分</b>，` +
        `小数部分从<b>十分位</b>开始，依次是<b>百分位、千分位</b>。`;
    } else {
      const r = readDecimal(v);
      note.innerHTML = `第 ③ 步：对照计数单位——` +
        `<b>十分位</b>上的计数单位是 <b>0.1</b>，<b>百分位</b>上是 <b>0.01</b>，<b>千分位</b>上是 <b>0.001</b>。` +
        `<br><b>数位与计数单位一一对应</b>。这个数读作 <b>${r.text}</b>。` +
        `<br><b>教学口径</b>：<b>相邻两个计数单位之间的进率是 10</b>。`;
    }
  }
  inp.addEventListener('input', () => { step = 0; render(); });
  btn.addEventListener('click', () => { step = (step + 1) % 3; render(); });
  rst.addEventListener('click', () => { inp.value = '3.205'; step = 0; render(); });
  /* 讲解入口：set(小数文本, 步序 0~2) */
  window.MOD = window.MOD || {};
  MOD.place = {
    set(v, s){ inp.value = v; step = (s == null ? 0 : s); render(); }
  };
  render();
})();

/* ==========================================================================
   ③ 小数的读法和写法
   ========================================================================== */
(function initRead(){
  const btn = $('#btnReadStep'), all = $('#btnReadAll'), rst = $('#btnReadReset');
  const stage = $('#readStage'), note = $('#readNote'), stepsEl = $('#readSteps');
  const CASES = ['3.205', '20.05', '0.50', '100.3'];
  let ci = 0, step = 0;
  const N = 3;
  function render(){
    const v = CASES[ci];
    const r = readDecimal(v);
    stepsEl.innerHTML = ['① 拆整数和小数','② 整数部分读','③ 小数部分逐位读']
      .map((l, k) => `<div class="dot ${k < step ? 'done' : (k === step ? 'on' : '')}" title="${l}">${k+1}</div>`).join('');
    stage.innerHTML = '';
    const box = document.createElement('div');
    box.style.cssText = 'width:100%;text-align:center';
    const num = document.createElement('div');
    num.style.cssText = 'font-size:34px;font-weight:800;color:#e0761f;letter-spacing:3px;margin-bottom:8px';
    num.textContent = v;
    box.appendChild(num);
    if (step >= 1){
      const t = document.createElement('div');
      t.style.cssText = 'font-size:21px;color:#4b5f7d;font-weight:700;margin-bottom:4px';
      t.textContent = step === 1
        ? '整数部分 ' + r.int + ' → 读作「' + r.intText + '」'
        : '小数部分 ' + r.frac + ' → 读作「' + r.fracText + '」';
      box.appendChild(t);
    }
    if (step >= 2){
      const t2 = document.createElement('div');
      t2.style.cssText = 'font-size:24px;color:#1f9d6b;font-weight:800;letter-spacing:2px';
      t2.textContent = '读作：' + r.text;
      box.appendChild(t2);
    }
    stage.appendChild(box);
    if (step === 0) note.innerHTML = `小数 <b>${v}</b>。第 ① 步：以<b>小数点</b>为界分成整数部分和小数部分。`;
    else if (step === 1) note.innerHTML = `第 ② 步：<b>整数部分按整数的读法读</b>——${r.int} 读作「${r.intText}」。`;
    else {
      let extra = '';
      if (r.frac.includes('0') && r.frac.replace(/0+$/, '') !== ''){
        extra = '<br><b>注意</b>：小数部分<b>中间</b>的 0 <b>一定要读出来</b>（' + r.fracText + '）。';
      } else if (/0$/.test(r.frac)){
        extra = '<br><b>注意</b>：按原数逐位读时，0.50 读作「零点五零」；化简成 0.5 后才读作「零点五」。';
      }
      note.innerHTML = `第 ③ 步：<b>小数点读作「点」</b>，<b>小数部分依次读出每一位数字</b>。` +
        `<br>所以 <b>${v}</b> 读作 <b>「${r.text}」</b>。${extra}` +
        `<br><b>教学口径</b>：<b>小数部分的 0 也要读</b>，只有<b>末尾</b>的 0 可以省略。`;
    }
  }
  btn.addEventListener('click', () => { step++; if (step >= N){ step = 0; ci = (ci + 1) % CASES.length; } render(); });
  all.addEventListener('click', () => { step = N - 1; render(); });
  rst.addEventListener('click', () => { step = 0; ci = 0; render(); });
  /* 讲解入口：set(例序号 0~3, 步序 0~2) */
  window.MOD = window.MOD || {};
  MOD.read = {
    set(i, s){ ci = (i == null ? 0 : i); step = (s == null ? 0 : s); render(); }
  };
  render();
})();

/* ==========================================================================
   ④ 小数的性质
   ========================================================================== */
(function initProperty(){
  const btn = $('#btnPropStep'), all = $('#btnPropAll'), rst = $('#btnPropReset');
  const stage = $('#propStage'), note = $('#propNote'), stepsEl = $('#propSteps');
  const CASES = [
    {a:'0.5', b:'0.50', why:'<b>0.50</b> 的末尾添了一个 0，末尾的 0 不改变大小，所以 <b>0.5 = 0.50</b>。'},
    {a:'1.2', b:'1.200', why:'<b>1.200</b> 末尾添了两个 0，同样不改变大小，<b>1.2 = 1.200</b>。'},
    {a:'0.50', b:'0.5', why:'把<b>末尾</b>的 0 去掉，大小不变，<b>0.50 = 0.5</b>——这就是<b>化简</b>。'},
    {a:'0.305', b:'0.35', why:'<b>0.305</b> 中间的 0 <b>不能</b>去掉！<b>0.305 ≠ 0.35</b>，因为它们表示的大小不同。'}
  ];
  let ci = 0, step = 0;
  const N = 4;
  function render(){
    const c = CASES[ci];
    stepsEl.innerHTML = ['① 写出两个小数','② 放到数轴上看','③ 比较大小','④ 得出性质']
      .map((l, k) => `<div class="dot ${k < step ? 'done' : (k === step ? 'on' : '')}" title="${l}">${k+1}</div>`).join('');
    stage.innerHTML = '';
    const box = document.createElement('div');
    box.style.cssText = 'width:100%';
    const W = 640, H = 220;
    const svg = s('svg', {viewBox:`0 0 ${W} ${H}`, width:W, height:H});
    box.appendChild(svg);
    /* 两个小数 */
    label(svg, 150, 34, c.a, {size:26, weight:800, fill:'#e0761f'});
    label(svg, 150, 66, c.b, {size:26, weight:800, fill:'#1f9d6b'});
    /* 数轴 */
    const nl = numberLine(svg, {x0:60, x1:580, y:150, min:0, max:2, tick:0.5,
      marks:[{v:+c.a, t:c.a, color:'#e0761f'}, {v:+c.b, t:c.b, color:'#1f9d6b'}]});
    /* 当前这一拍的说明，直接写在画面上 */
    const same0 = (+c.a === +c.b);
    const QCAP = ['① 两个小数写出来：' + c.a + ' 和 ' + c.b,
                  '② 标到数轴上看它们的位置',
                  same0 ? '③ 两个点重合 → 大小相等' : '③ 两个点不重合 → 大小不等',
                  same0 ? '④ 所以 ' + c.a + ' = ' + c.b : '④ 所以 ' + c.a + ' ≠ ' + c.b];
    label(svg, 320, 202, QCAP[step], {size:13.5, weight:700, fill:'#5b6b80'});
    stage.appendChild(box);
    const same = (+c.a === +c.b);
    if (step === 0){
      note.innerHTML = `两个小数：<b>${c.a}</b> 和 <b>${c.b}</b>。第 ① 步：把它们分别写出来。`;
    } else if (step === 1){
      note.innerHTML = `第 ② 步：把两个小数标在<b>数轴</b>上，看它们的点在哪里。`;
    } else if (step === 2){
      note.innerHTML = `第 ③ 步：两个点在数轴上${same ? '<b>完全重合</b>，说明<b>大小相等</b>' : '<b>不重合</b>，说明<b>大小不相等</b>'}。`;
    } else {
      note.innerHTML = `第 ④ 步：${c.why}` +
        `<br><b>教学口径</b>：<b>小数的末尾添上 0 或去掉 0，小数的大小不变</b>。` +
        `<br><b>所以</b>：<b>0.5 = 0.50</b>（可以化简）；<b>0.305 ≠ 0.35</b>（中间的 0 不能去）；` +
        `<b>小数末尾</b>的 0 可以去（0.50 = 0.5，100.50 = 100.5）；但<b>整数部分</b>的 0 不能乱去（100.05 ≠ 1.5，100.50 ≠ 1.5）。`;
    }
  }
  btn.addEventListener('click', () => { step++; if (step >= N){ step = 0; ci = (ci + 1) % CASES.length; } render(); });
  all.addEventListener('click', () => { step = N - 1; render(); });
  rst.addEventListener('click', () => { step = 0; ci = 0; render(); });
  /* 讲解入口：set(例序号 0~3, 步序 0~3) */
  window.MOD = window.MOD || {};
  MOD.prop = {
    set(i, s){ ci = (i == null ? 0 : i); step = (s == null ? 0 : s); render(); }
  };
  render();
})();

/* ==========================================================================
   ⑤ 大小比较 与 小数点移动
   ========================================================================== */
(function initCompare(){
  const btn = $('#btnCmpStep'), all = $('#btnCmpAll'), rst = $('#btnCmpReset');
  const stage = $('#cmpStage'), note = $('#cmpNote'), stepsEl = $('#cmpSteps');
  const CASES = [
    {a:'0.5', b:'0.48', tip:'整数部分都是 0，就比<b>十分位</b>：5 &gt; 4，所以 <b>0.5 &gt; 0.48</b>。'},
    {a:'3.6', b:'3.06', tip:'整数部分都是 3，比<b>十分位</b>：6 &gt; 0，所以 <b>3.6 &gt; 3.06</b>。'},
    {a:'1.09', b:'1.9', tip:'十分位：0 &lt; 9，所以 <b>1.09 &lt; 1.9</b>。<b>位数多的小数不一定大！</b>'}
  ];
  let ci = 0, step = 0;
  const N = 3;
  function render(){
    const c = CASES[ci];
    stepsEl.innerHTML = ['① 比整数部分','② 比十分位','③ 得出结论']
      .map((l, k) => `<div class="dot ${k < step ? 'done' : (k === step ? 'on' : '')}" title="${l}">${k+1}</div>`).join('');
    stage.innerHTML = '';
    const box = document.createElement('div');
    box.style.cssText = 'width:100%';
    const W = 640, H = 200;
    const svg = s('svg', {viewBox:`0 0 ${W} ${H}`, width:W, height:H});
    box.appendChild(svg);
    const aI = c.a.split('.')[0], bI = c.b.split('.')[0];
    const aF = (c.a.split('.')[1] || ''), bF = (c.b.split('.')[1] || '');
    /* 两个数并排 */
    const draw = (txt, x, col, highlight) => {
      const [ip, fp] = txt.split('.');
      label(svg, x, 40, ip + '.', {size:26, weight:800, fill:'#20304a'});
      fp.split('').forEach((ch, k) => {
        const isTenth = k === 0;
        label(svg, x + 42 + k * 18, 40, ch, {size:26, weight:800,
          fill: highlight === 'tenth' && isTenth ? '#d94a4a' : col});
      });
    };
    draw(c.a, 90, '#e0761f', step === 1);
    draw(c.b, 380, '#1f9d6b', step === 1);
    label(svg, 90, 66, '整数 ' + aI + (step === 0 ? ' ｜ 十分位 ' + (aF[0]||'0') : ''),
      {size:13, fill:'#4b5f7d', anchor:'start'});
    label(svg, 380, 66, '整数 ' + bI + (step === 0 ? ' ｜ 十分位 ' + (bF[0]||'0') : ''),
      {size:13, fill:'#4b5f7d', anchor:'start'});
    /* 数轴 */
    const maxV = Math.max(+c.a, +c.b) * 1.25;
    numberLine(svg, {x0:60, x1:580, y:130, min:0, max:maxV, tick:maxV/4,
      marks:[{v:+c.a, t:c.a, color:'#e0761f'}, {v:+c.b, t:c.b, color:'#1f9d6b'}]});
    /* 当前这一拍的说明，直接写在画面上 */
    const rel = (+c.a > +c.b) ? '>' : ((+c.a < +c.b) ? '<' : '=');
    const CCAP = ['① 先比整数部分：' + aI + ' 和 ' + bI,
                  '② 整数部分相同，再比十分位：' + (aF[0] || '0') + ' 和 ' + (bF[0] || '0'),
                  '③ 结论：' + c.a + ' ' + rel + ' ' + c.b];
    label(svg, 320, 176, CCAP[step], {size:13.5, weight:700, fill:'#5b6b80'});
    box.appendChild(svg);
    stage.appendChild(box);
    if (step === 0) note.innerHTML = `第 ① 步：<b>先比整数部分</b>——${aI} 和 ${bI} ${aI === bI ? '<b>相同</b>，继续比十分位' : (aI > bI ? '<b>前者大</b>，直接得出结论' : '<b>后者大</b>，直接得出结论')}。`;
    else if (step === 1) note.innerHTML = `第 ② 步：整数部分相同，就<b>依次比十分位、百分位</b>。` +
      `<br>${c.a} 的十分位是 <b>${aF[0]||'0'}</b>，${c.b} 的十分位是 <b>${bF[0]||'0'}</b>。`;
    else note.innerHTML = `第 ③ 步：${c.tip}` +
      `<br><b>教学口径</b>：<b>先比整数部分，再依次比十分位、百分位……</b>` +
      `<br><b>易错</b>：<b>位数多的小数不一定大</b>（0.5 &gt; 0.48）。`;
  }
  btn.addEventListener('click', () => { step++; if (step >= N){ step = 0; ci = (ci + 1) % CASES.length; } render(); });
  all.addEventListener('click', () => { step = N - 1; render(); });
  rst.addEventListener('click', () => { step = 0; ci = 0; render(); });
  /* 讲解入口：set(例序号 0~2, 步序 0~2) */
  window.MOD = window.MOD || {};
  MOD.cmp = {
    set(i, s){ ci = (i == null ? 0 : i); step = (s == null ? 0 : s); render(); }
  };
  render();
})();

/* ==========================================================================
   ⑤b 小数点移动引起大小变化
   ========================================================================== */
(function initMove(){
  const btn = $('#btnMoveStep'), rst = $('#btnMoveReset');
  const stage = $('#moveStage'), note = $('#moveNote');
  let moved = 0;
  function render(){
    stage.innerHTML = '';
    const box = document.createElement('div');
    box.style.cssText = 'width:100%;text-align:center';
    const base = 2.5;
    const val = moved === 0 ? base : (moved > 0 ? base * Math.pow(10, moved) : base / Math.pow(10, -moved));
    const txt = moved === 0 ? '2.5' : (moved > 0
      ? base.toFixed(1) + '0'.repeat(moved) + ''
      : (() => { let s = '2.5'; const k = -moved; let i = s.indexOf('.') + 1 + k; return s.slice(0,i) + '.' + s.slice(i); })());
    const big = document.createElement('div');
    big.style.cssText = 'font-size:34px;font-weight:800;color:#e0761f;letter-spacing:3px';
    big.textContent = txt;
    box.appendChild(big);
    const sub = document.createElement('div');
    sub.style.cssText = 'font-size:19px;color:#4b5f7d;font-weight:700;margin-top:6px';
    sub.textContent = moved === 0 ? '原数 2.5' :
      (moved > 0 ? '小数点向右移 ' + moved + ' 位 → 扩大到原数的 ' + Math.pow(10, moved) + ' 倍' +
        '（' + base + ' × ' + Math.pow(10, moved) + ' = ' + val + '）' :
        '小数点向左移 ' + (-moved) + ' 位 → 缩小到原数的 1/' + Math.pow(10, -moved) +
        '（' + base + ' ÷ ' + Math.pow(10, -moved) + ' = ' + val + '）');
    box.appendChild(sub);
    stage.appendChild(box);
    note.innerHTML = moved === 0
      ? '点"移动"，看<b>小数点</b>移动时，这个数的大小怎么变。'
      : `<b>${txt}</b>　${sub.textContent}` +
        `<br><b>教学口径</b>：<b>小数点向右移动一位（多位），扩大到原数的 10 倍（100 倍、1000 倍……）；` +
        `小数点向左移动一位（多位），缩小到原数的 1/10（1/100、1/1000……）</b>。` +
        `<br><b>记忆窍门</b>：<b>右移扩大，左移缩小</b>。`;
  }
  btn.addEventListener('click', () => { moved = moved >= 3 ? -3 : moved + 1; render(); });
  rst.addEventListener('click', () => { moved = 0; render(); });
  /* 讲解入口：set(移动位数 -3~3) */
  window.MOD = window.MOD || {};
  MOD.move = {
    set(n){ moved = (n == null ? 0 : n); render(); }
  };
  render();
})();

/* ==========================================================================
   分层练习数据
   ========================================================================== */
const BASIC_CHOICE = [
  {q:'把"1"平均分成 10 份，其中 3 份是（　）。', opts:['0.3','3.10','0.03','30'], a:0,
   why:'平均分成 10 份，1 份是 0.1，3 份就是 3 × 0.1 = 0.3。',
   hint:'回到动画 ① 小数的意义，看十格图。'},
  {q:'0.3 里面有几个 0.1？', opts:['3','0.3','30','1'], a:0,
   why:'0.1 的计数单位，3 个 0.1 是 0.3。',
   hint:'回到动画 ①，涂了 3 格就是 3 个 0.1。'},
  {q:'小数点右边第一位是（　）。', opts:['个位','十分位','百分位','千分位'], a:1,
   why:'小数部分的数位依次是：十分位、百分位、千分位。',
   hint:'回到动画 ② 数位顺序表。'},
  {q:'0.45 中，数字 4 在（　）位上，表示 4 个（　）。',
   opts:['十分；0.1','百分；0.01','百分；0.1','十分；0.01'], a:0,
   why:'小数点右边第一位是十分位，数字 4 在十分位，表示 4 个 0.1。',
   hint:'回到动画 ②，数位与计数单位一一对应。'},
  {q:'下面各数中，正确的读法是（　）。', opts:['3.205 读作三又二点零五','3.205 读作三点二零五',
    '3.205 读作三点二〇五','3.205 读作三又零点二〇五'], a:1,
   why:'小数部分要依次读出每一位，所以 3.205 读作"三点二零五"，中间的 0 一定要读。',
   hint:'回到动画 ③ 小数的读法。'},
  {q:'下面说法正确的是（　）。', opts:['小数的末尾添上 0 大小会变大','小数的末尾添上 0 大小不变',
    '0.50 中的 0 可以都去掉','小数中间的 0 可以去掉'], a:1,
   why:'小数的末尾添上 0 或去掉 0，大小不变；0.50 可以化简成 0.5，但整数部分的 0 和中间的 0 不能随便去掉。',
   hint:'回到动画 ④ 小数的性质。', point:'小数的性质只对**末尾**的 0 有效，中间的 0 是数位不能动', care:'0.405 中间的 0 在百分位，去掉就变成 0.45 了；中间的 0 不能去'},
  {q:'比较 0.5 和 0.48 的大小，结果是（　）。', opts:['0.5 > 0.48','0.5 < 0.48','0.5 = 0.48','无法比较'], a:0,
   why:'整数部分相同，比十分位：5 > 4，所以 0.5 > 0.48。位数多的小数不一定大。',
   hint:'回到动画 ⑤ 大小比较，先比整数部分再比十分位。'},
  {q:'把 0.36 的小数点向右移动两位，得到的数是（　）。', opts:['36','3.6','360','0.0036'], a:0,
   why:'向右移两位扩大到原数的 100 倍：0.36 × 100 = 36。',
   hint:'回到动画 ⑤b 小数点移动，右移扩大。'}
];

const BASIC_FILL = [
  {q:'0.7 里面有（　）个 0.1。', a:'7', why:'7 个 0.1 是 0.7。'},
  {q:'小数部分的计数单位依次是 0.1、（　）、（　）。', a:['0.01','0.001'],
   why:'十分位 0.1、百分位 0.01、千分位 0.001。'},
  {q:'0.608 中的 6 在（　）位上，表示 6 个（　）。', a:['百分','0.01'],
   why:'0.608 的第二位是百分位，计数单位 0.01，表示 6 个 0.01。'},
  {q:'3.05 读作（三点（　）五）。', a:'零', why:'小数部分依次读每一位，中间的 0 要读出来。'},
  {q:'把 0.50 化简是（　）。', a:'0.5', why:'去掉小数末尾的 0，大小不变，所以 0.50 = 0.5。'},
  {q:'0.6 扩大到原来的 10 倍是（　）。', a:'6', why:'小数点向右移一位，扩大到原数的 10 倍：0.6 × 10 = 6。'}
];

const HAND_CHOICE = [
  {q:'0.7 化成两位小数是（　）。', opts:['0.70','0.07','0.7','70'], a:0,
   why:'在 0.7 的末尾添一个 0 得 0.70，大小不变。',
   hint:'回到动画 ④ 小数的性质。'},
  {q:'下面各数中，最大的是（　）。', opts:['0.9','0.809','0.81','0.89'], a:0,
   why:'先比整数部分都相同，再比十分位：0.9 的十分位是 9，其余都是 0 或 8。',
   hint:'回到动画 ⑤ 大小比较。'},
  {q:'把 4.07 的小数点向左移动一位，得到的数是（　）。', opts:['0.407','40.7','0.4070','4.7'], a:0,
   why:'向左移一位缩小到原数的 1/10：4.07 ÷ 10 = 0.407。',
   hint:'回到动画 ⑤b 小数点移动，左移缩小。'},
  {q:'下面各数中，读法正确的是（　）。', opts:['0.30 读作零点三','0.30 读作零点三零',
    '0.30 读作零点零零三','0.30 读作三零点零'], a:1,
   why:'小数部分依次读每一位，末尾的 0 读作"零"，标准读法是"零点三零"。',
   hint:'回到动画 ③ 小数的读法。'},
  {q:'下面各式中，结果相等的是（　）。', opts:['0.4 和 0.40','0.4 和 0.04','0.4 和 4.0','0.4 和 40'], a:0,
   why:'只有小数末尾添 0 才相等，0.4 = 0.40；其余都变了。',
   hint:'回到动画 ④ 小数的性质。'},
  {q:'把 0.08 扩大到原来的 100 倍，得到的数是（　）。', opts:['8','0.8','0.008','80'], a:0,
   why:'向右移两位扩大到原数的 100 倍：0.08 × 100 = 8。',
   hint:'回到动画 ⑤b 小数点移动。'}
];

const HAND_FILL = [
  {q:'0.35 里面有（　）个 0.01。', a:'35', why:'百分位上是 5，表示 5 个 0.01；两位共 35 个 0.01。'},
  {q:'把 0.6 改写成两位小数是（　）。', a:'0.60', why:'末尾添 0，大小不变，0.6 = 0.60。'},
  {q:'比较大小：0.7（　）0.68（填"＞"、"＜"或"＝"）。', a:'＞',
   why:'整数部分相同，比十分位 7 > 6，所以 0.7 > 0.68。'},
  {q:'把 2.5 的小数点向右移动两位，得到的数是（　）。', a:'250',
   why:'2.5 × 100 = 250。'},
  {q:'把 250 的小数点向左移动两位，得到的数是（　）。', a:'2.5',
   why:'250 ÷ 100 = 2.5。'}
];

const EXT_CHOICE = [
  {q:'一个数的小数点向右移动两位后，比原来的数扩大到原来的（　）倍。',
   opts:['2','10','100','1000'], a:2,
   why:'向右移动一位扩大 10 倍，移动两位扩大 100 倍。',
   hint:'回到动画 ⑤b 小数点移动。', point:'小数点右移一位就**扩大 10 倍**，右移 n 位就扩大 10ⁿ 倍', care:'是 10 的**平方** = 100，不是 10；右移两位 ÷ 回来要移两位'},
  {q:'下面各数中，与 0.45 相等的是（　）。', opts:['0.450','0.045','0.405','0.54'], a:0,
   why:'0.450 是在 0.45 末尾添 0，所以相等；0.045、0.405、0.54 都和 0.45 不相等。',
   hint:'回到动画 ④ 小数的性质。', point:'小数的性质：末尾添 0 或去掉 0，大小**不变**', care:'只比较数值：0.450 = 0.45；0.045、0.405、0.54 都不相等'},
  {q:'下面说法正确的是（　）。', opts:['0.405 中间的 0 可以去掉','0.405 中间的 0 不能去掉',
    '0.405 和 0.45 相等','0.405 中的 0 都可以去掉'], a:1,
   why:'只有末尾的 0 才能去掉，中间的 0 不能动；0.405 去掉中间的 0 会变成 0.45，大小改变。',
   hint:'回到动画 ④ 的"关键区别"。', point:'小数的性质只对**末尾**的 0 有效，中间的 0 是数位不能动', care:'0.405 中间的 0 在百分位，去掉就变成 0.45；中间的 0 不能去'},
  {q:'一个三位小数，把它的小数点向右移动一位后是（　）位小数。', opts:['2','3','4','无法确定'], a:0,
   why:'小数点向右移动一位，原来的第三位小数就移到了整数部分，所以三位小数变成两位小数。例如 0.123 → 1.23，是两位小数。',
   hint:'回到动画 ⑤b，看小数点移动后数字怎么排。', point:'小数点右移一位，**最高位不够要补 0**，位数减 1', care:'三位小数右移一位 → 两位小数；整数部分不够位时要补 0（如 0.123 → 1.23）'},
  {q:'0.8 和 0.80 两个数，（　）。', opts:['大小相等，计数单位也相同','大小相等，计数单位不同',
    '大小不同，计数单位相同','大小不同，计数单位也不同'], a:1,
   why:'大小相等，但 0.8 的计数单位是 0.1，0.80 的计数单位是 0.01，计数单位不同。',
   hint:'回到动画 ② 数位顺序表和 ④ 小数的性质。', point:'小数的大小看**数值**，计数单位看**数位**——两者要分开想', care:'0.8 的计数单位是 0.1，0.80 的计数单位是 0.01；数值相等但精确程度不同'}
];

const EXT_FILL = [
  {q:'一个数的小数点向右移动（　）位，就扩大到原来的 100 倍。', a:'2',
   why:'向右移动一位扩大 10 倍，移动两位扩大 100 倍。', point:'扩大 100 倍 = 扩大 10² 倍 = 小数点右移 2 位', care:'别移 1 位（那是 10 倍）'},
  {q:'0.0700 化简后是（　）。', a:'0.07',
   why:'去掉小数**末尾**的 0，大小不变：0.0700 = 0.07（中间的 0 保留，因为它占着十分位）。', point:'化简 = 去掉**末尾**的 0', care:'末尾两个 0 都能去，0.070 中间的 0 不能去'},
  {q:'把 1.05 的小数点向右移动一位，得到的数是（　）。', a:'10.5', why:'1.05 × 10 = 10.5。', point:'小数点右移一位：整数部分左移，小数部分右移；**位数不够要补 0**', care:'1.05 → 10.5（0.05 的 0 补到十分位变 5）；不是 10.05'},
  {q:'一个数除以 100，等于把这个数的小数点向左移动（　）位。', a:'2',
   why:'除以 100 就是缩小到 1/100，对应小数点向左移动 2 位。', point:'除以 100 = 缩小 100 倍 = 小数点左移 2 位', care:'位数不够时要在前面补 0（0.12 ÷ 100 = 0.0012）'},
  {q:'把 0.72 改写成三位小数是（　）。', a:'0.720', why:'末尾添 0，大小不变：0.72 = 0.720。', point:'改写 = 在**末尾**补 0，大小不变', care:'0.72 = 0.720；补的是末尾不是前面'}
];

/* ==========================================================================
   第四档 · 五星挑战（浅奥思维）
   —— 计数单位的深层理解、逆向推理、小数点的"反着想"
   ========================================================================== */
const STAR5_CHOICE = [
  {q:'0.1 与 0.01 的差是（　）。',
   opts:['0.09','0.9','0.011','0.1'], a:0,
   why:'0.1 = 0.10，0.10 − 0.01 = <b>0.09</b>。' +
       '也可以用计数单位想：0.1 是 10 个 0.01，10 − 1 = 9 个 0.01，就是 0.09。',
   hint:'回到动画 ①：先<b>化到同一个计数单位</b>再相减（0.1 = 10 个 0.01）。', point:'小数加减先**小数点对齐**，再按整数加减算', care:'0.1 要看成 0.10 再减；也可以用计数单位想：10 个 0.01 减 1 个 0.01', steps:['把两个数的小数点对齐：0.10 − 0.01', '按整数减法算：10 − 1 = 9', '结果是 0.09', '验算：0.01 + 0.09 = 0.10 ✓']},
  {q:'0.007 里面有（　）个 0.001。',
   opts:['0.7','7','70','1000'], a:1,
   why:'0.007 的计数单位是 <b>0.001</b>，数一数有 7 个 0.001，所以是 <b>7</b> 个。',
   hint:'回到动画 ② 数位顺序表：0.007 的千分位上是 7，计数单位是 0.001。', point:'看**计数单位**：0.007 的计数单位是 0.001，数一数有几个', care:'0.007 里面有 7 个 0.001；别写成 0.7 或 70', steps:['0.007 的计数单位是 0.001', '把 0.007 平均分成 0.001 的一份', '数一数：0.001、0.002、…、0.007，一共 7 份', '所以有 7 个 0.001']},
  {q:'把 3.6 的小数点向右移动两位，得到的数是（　）。',
   opts:['0.036','36','360','0.36'], a:2,
   why:'小数点<b>向右移一位</b>扩大到原数的 10 倍，<b>移两位就扩大 100 倍</b>：' +
       '3.6 × 100 = <b>360</b>。',
   hint:'回到动画 ⑤b 小数点移动：<b>右移扩大，左移缩小</b>，移动几位就乘/除 10 的几次方。', point:'右移两位 = 扩大 100 倍', care:'3.6 × 100 = 360', steps:['3.6 右移一位是 36', '再右移一位是 360', '等价地 3.6 × 100 = 360']},
  {q:'把 4.090 化简，结果是（　）。',
   opts:['4.09','4.9','4.900','40.9'], a:0,
   why:'化简就是<b>去掉小数末尾的 0</b>：4.090 → 4.09。' +
       '注意<b>中间的 0 不能去</b>（0 在十分位，去掉就变成 4.9 了）。',
   hint:'回到动画 ④ 小数的性质：只有<b>末尾</b>的 0 能去掉，中间的 0 保留。', point:'化简只去**末尾**的 0', care:'末尾的 0 能去，中间的 0 不能去：4.090 → 4.09（不是 4.9）', steps:['化简就是去掉小数**末尾**的 0', '4.090 的末尾有一个 0，去掉', '中间的 0 在十分位，表示十分位上是 0，**不能去**', '所以 4.090 = 4.09（不是 4.9）']},
  {q:'0.1 与 0.09 相比，（　）。',
   opts:['0.1 > 0.09','0.1 < 0.09','0.1 = 0.09','无法比较'], a:0,
   why:'先<b>化到相同位数</b>：0.1 = 0.10，0.10 > 0.09，所以 <b>0.1 > 0.09</b>。' +
       '（也可以数一数：0.1 是 10 个 0.01，0.09 是 9 个 0.01。）',
   hint:'回到动画 ⑤ 大小比较：位数不同就<b>补 0</b>，再一位一位地比。', point:'比较小数：先比整数部分，再依次比十分位、百分位', care:'十分位上 1 > 0，所以 0.1 > 0.09；别被位数多就以为大', steps:['比小数：先比整数部分（都是 0），再依次比十分位、百分位', '十分位：0.1 的十分位是 1，0.09 的十分位是 0', '1 > 0，所以 0.1 > 0.09', '也可以看成：0.1 = 0.10，0.10 > 0.09']},
  {q:'一个三位小数保留一位小数是 0.1，这个三位小数最大是（　）。',
   opts:['0.099','0.149','0.15','0.19'], a:1,
   why:'保留一位小数就是<b>看第二位</b>，第二位比 5 小就<b>舍去</b>。' +
       '最大是 <b>0.149</b>（第二位是 4，舍去 149 的后两位得 0.1）。' +
       '若取 0.15，第二位是 5 就要进位成 0.2 了。',
   hint:'回到动画 ④：末尾添 0 大小不变，想清楚"哪些三位小数的第二位小于 5"。', point:'四舍五入的逆向推理', care:'百分位 ≤ 4，千分位取 9 才最大', steps:['保留一位得 0.1 → 百分位必须 ≤ 4', '求最大 → 百分位取 4，千分位取 9', '所以是 0.149', '检验：0.149 ≈ 0.1 ✓']}
];

const STAR5_FILL = [
  {q:'0.1 − 0.01 =（　）。', a:'0.09', why:'0.1 = 0.10，0.10 − 0.01 = 0.09。', point:'小数点对齐再算', care:'0.1 看成 0.10', steps:['对齐小数点：0.10 − 0.01', '按整数减法：10 − 1 = 9', '结果是 0.09']},
  {q:'0.007 里面有（　）个 0.001。', a:'7', why:'千分位上的 7 表示 7 个 0.001。', point:'看**计数单位**：0.007 的计数单位是 0.001，数一数有几个', care:'0.007 里面有 7 个 0.001；别写成 0.7 或 70', steps:['0.007 的计数单位是 0.001', '把 0.007 平均分成 0.001 的一份', '数一数：0.001、0.002、…、0.007，一共 7 份', '所以有 7 个 0.001']},
  {q:'把 3.6 的小数点向右移动两位，得到的数是（　）。', a:'360',
   why:'向右移两位扩大到原数的 100 倍：3.6 × 100 = 360。', point:'右移两位 = 扩大 100 倍', care:'3.6 × 100 = 360', steps:['3.6 右移一位是 36', '再右移一位是 360', '等价地 3.6 × 100 = 360']},
  {q:'把 4.090 化简是（　）。', a:'4.09', why:'去掉小数末尾的 0：4.090 = 4.09。', point:'化简只去末尾的 0', care:'中间那个 0 不能去', steps:['末尾的 0 可以去掉', '中间的 0 表示千分位，不能动', '4.090 → 4.09']},
  {q:'一个三位小数保留一位小数是 0.1，这个三位小数最大是（　）。', a:'0.149',
   why:'第二位小于 5 才舍去，最大是 0.149（第二位是 4）。', point:'四舍五入的逆向推理', care:'百分位 ≤ 4，千分位取 9 才最大', steps:['保留一位得 0.1 → 百分位必须 ≤ 4', '求最大 → 百分位取 4，千分位取 9', '所以是 0.149', '检验：0.149 ≈ 0.1 ✓']},
  {q:'一个数的小数点向右移动两位后是 12，这个数原来是（　）。', a:'0.12',
   why:'向右移两位扩大到 100 倍，所以原数 = 12 ÷ 100 = 0.12。', point:'**逆向**移动：右移两位要左移两位，位数不够前面补 0', care:'12 的小数点左移两位 → 0.12；整数部分只有一个数位，要在前面补 0', steps:['现在是 12，要还原就**反向**移动：小数点左移两位', '12 的小数点左移一位是 1.2', '再左移一位是 0.12', '所以原来的数是 0.12']}
];

/* 装配四档练习（巩固 / 动手 / 扩展 / 五星挑战） */
bootCourse([
  {key:'basic', title:'第一档 · 巩固基础（意义 · 数位 · 读写 · 性质）', prefix:'基', star:3,
   choice:BASIC_CHOICE, fill:BASIC_FILL,
   host:'#basicBlock', score:'#scoreBasic', total:'#totalBasic', reset:'#btnResetBasic'},
  {key:'hand', title:'第二档 · 动手操作（十格图 · 比较 · 小数点移动）', prefix:'动', star:3,
   choice:HAND_CHOICE, fill:HAND_FILL,
   host:'#handBlock', score:'#scoreHand', total:'#totalHand', reset:'#btnResetHand'},
  {key:'ext', title:'第三档 · 扩展思维（化简 · 推理 · 易错辨析）', prefix:'拓', star:4,
   choice:EXT_CHOICE, fill:EXT_FILL,
   host:'#extBlock', score:'#scoreExt', total:'#totalExt', reset:'#btnResetExt'},
  {key:'star5', title:'第四档 · 五星挑战（浅奥思维）', prefix:'奥', star:5,
   choice:STAR5_CHOICE, fill:STAR5_FILL,
   host:'#star5Block', score:'#scoreStar5', total:'#totalStar5', reset:'#btnResetStar5'}
]);
