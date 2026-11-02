/* ==========================================================================
   第三单元 多位数乘两位数 —— 交互模块
   --------------------------------------------------------------------------
   每个模块在末尾暴露一个 MOD.xxx 控制器，给讲解脚本一个"绝对状态"入口：
   MOD.oral.set(2) 表示"直接跳到第 3 步"，而不是"点两次下一步"。
   这样讲解可以任意跳拍重讲，画面永远和脚本对应。
   ========================================================================== */
window.MOD = window.MOD || {};

/* ==========================================================================
   ① 口算乘法
   ========================================================================== */
(function initOral(){
  const ITEMS = [
    {a:'20', b:'30', hint:'先算 2 × 3 = 6，两个因数末尾一共有 2 个 0，积的末尾就添 2 个 0。'},
    {a:'300', b:'40', hint:'先算 3 × 4 = 12，末尾一共有 3 个 0，积的末尾添 3 个 0。'},
    {a:'120', b:'30', hint:'120 看作 12，30 看作 3：12 × 3 = 36，再添 1 个 0 → 360。'},
    {a:'25', b:'40', hint:'40 看作 4：25 × 4 = 100，再添 1 个 0 → 1000。'},
    {a:'13', b:'20', hint:'20 看作 2：13 × 2 = 26，再添 1 个 0 → 260。'}
  ];
  const sel = $('#oralSel'), stage = $('#oralStage'), note = $('#oralNote'), steps = $('#oralSteps');
  let step = 0;
  function zeros(str){ return (str.match(/0/g) || []).length; }
  function render(){
    const it = ITEMS[+sel.value];
    const zA = zeros(it.a), zB = zeros(it.b);
    const sa = it.a.replace(/0/g, ''), sb = it.b.replace(/0/g, '');
    const core = (+sa) * (+sb);
    const res = it.a * it.b;
    stage.innerHTML = '';
    const box = document.createElement('div');
    box.style.cssText = 'text-align:center;font-size:26px;font-weight:800;line-height:2.1;font-variant-numeric:tabular-nums';
    const line = (t, color) => { const d = document.createElement('div'); d.textContent = t; if (color) d.style.color = color; box.appendChild(d); };
    line(`${it.a} × ${it.b}`);
    if (step === 0){ line('把因数末尾的 0 暂时藏起来', 'var(--ink2)'); }
    if (step === 1){ line(`${sa} × ${sb}`, 'var(--accent)'); }
    if (step === 2){ line(`${sa} × ${sb} = ${core}`, 'var(--accent)'); }
    if (step >= 3){ line(`${it.a} × ${it.b} = ${res}`, 'var(--green)'); }
    stage.appendChild(box);
    steps.innerHTML = ['①藏起0','②算前面的数','③写出得数','④添上0']
      .map((l, i) => `<div class="dot ${i < step ? 'done' : (i === step ? 'on' : '')}" title="${l}">${i+1}</div>`).join('');
    const msgs = [
      `先想一想：<b>${it.a}</b> 末尾有 <b>${zA}</b> 个 0，<b>${it.b}</b> 末尾有 <b>${zB}</b> 个 0。`,
      `把 0 藏起来：<b>${sa} × ${sb}</b>。`,
      `算出前面的积：<b>${sa} × ${sb} = ${core}</b>。`,
      `再在积的末尾添上 <b>${zA + zB}</b> 个 0，得 <b>${res}</b>。${it.hint}`
    ];
    note.innerHTML = msgs[Math.min(step, msgs.length-1)];
  }
  sel.addEventListener('change', () => { step = 0; render(); });
  $('#btnOralStep').addEventListener('click', () => { step = (step + 1) % 4; render(); });
  $('#btnOralReset').addEventListener('click', () => { step = 0; render(); });
  render();

  MOD.oral = {
    steps: 4,
    pick(i){ sel.value = String(i); sel.dispatchEvent(new Event('change')); },
    set(n){ step = Math.max(0, Math.min(3, n | 0)); render(); },
    get step(){ return step; }
  };
})();

/* ==========================================================================
   ② 笔算乘法（竖式逐步演示）
   ========================================================================== */
(function initVertical(){
  const ITEMS = [
    {a:145, b:12}, {a:236, b:34}, {a:307, b:25}, {a:48, b:27}
  ];
  const sel = $('#vmSel'), stage = $('#vmStage'), note = $('#vmNote'), steps = $('#vmSteps');
  const CN = ['个', '十', '百', '千'];
  let step = 0;

  /* 竖式的两个阶段：① 逐位相乘得部分积  ② 两个部分积按列相加得积 */
  function build(a, b){
    const A = String(a).split('').map(Number).reverse();
    const B = String(b).split('').map(Number).reverse();
    const mul = [];
    B.forEach((bd, i) => {
      let carry = 0;
      A.forEach((ad, j) => {
        const prod = ad * bd + carry;
        const digit = prod % 10, nc = Math.floor(prod / 10);
        mul.push({type:'mul', i, j, ad, bd, prod, digit, carry, nc});
        carry = nc;
      });
    });
    /* 第 i 个部分积已经左移 i 位：a × B[i] × 10^i */
    const rowVal = i => a * B[i] * Math.pow(10, i);
    const add = [];
    let carry = 0;
    const nCols = String(a * b).length;
    for (let c = 0; c < nCols; c++){
      const present = [];
      B.forEach((bd, i) => {
        const sv = String(rowVal(i));
        if (c < sv.length) present.push({i, d: +sv[sv.length - 1 - c]});
      });
      const carryIn = carry;
      let sum = carryIn;
      present.forEach(p => sum += p.d);
      const digit = sum % 10; carry = Math.floor(sum / 10);
      add.push({type:'add', col:c, present, carryIn, sum, digit, carry});
    }
    return {A, B, mul, add, total: mul.length + add.length, rowVal};
  }

  function render(){
    const it = ITEMS[+sel.value];
    const a = it.a, b = it.b, M = build(a, b);
    const cur = Math.min(step, M.total);
    const cols = Math.max(String(a).length, String(b).length, String(a * b).length) + 2;

    stage.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;gap:24px;align-items:center;flex-wrap:wrap;justify-content:center';
    const grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(' + cols + ',46px);gap:0;font-variant-numeric:tabular-nums';
    const cell = (txt, opt) => {
      const o = Object.assign({color:'var(--ink)', size:26, weight:700, bg:'transparent', cls:''}, opt||{});
      const d = document.createElement('div');
      if (o.cls) d.className = o.cls;
      d.textContent = txt;
      d.style.cssText = `text-align:center;font-size:${o.size}px;font-weight:${o.weight};color:${o.color};` +
        `height:38px;line-height:38px;background:${o.bg};`;
      return d;
    };
    const hline = () => {
      const l = document.createElement('div');
      l.style.cssText = `grid-column:1 / ${cols + 1};height:0;border-top:2.5px solid var(--ink);margin:4px 0`;
      grid.appendChild(l);
    };

    /* 行1：第二个因数（乘数）；行2：第一个因数 */
    const A = String(a).split(''), B = String(b).split('');
    for (let i = 0; i < cols; i++){
      const idx = i - (cols - B.length);
      grid.appendChild(cell(idx >= 0 ? B[idx] : '', {size:26, weight:600}));
    }
    for (let i = 0; i < cols; i++){
      const idx = i - (cols - A.length);
      grid.appendChild(cell(idx >= 0 ? A[idx] : '', {size:26, weight:600}));
    }
    hline();

    /* 部分积行：按人教版写法，每个部分积都是"已经左移好的完整积" */
    const rowCells = M.B.map(() => new Array(cols).fill(''));
    let idx = 0;
    M.mul.forEach(st2 => {
      if (idx < cur) rowCells[st2.i][cols - 1 - st2.i - st2.j] = String(st2.digit);
      idx++;
    });
    M.B.forEach((bd, i) => {
      if (i === 0) return;
      const total = M.mul.filter(x => x.i === i).length;
      const done = M.mul.slice(0, cur).filter(x => x.i === i).length;
      if (done === total) rowCells[i][cols - 1] = '0';   /* 左移补 0（个位占位） */
    });
    const mulDone = Math.min(cur, M.mul.length);
    M.B.forEach((bd, i) => {
      const total = M.mul.filter(x => x.i === i).length;
      const done = M.mul.slice(0, cur).filter(x => x.i === i).length;
      const complete = done === total;
      const active = cur > 0 && cur <= M.mul.length && M.mul[cur - 1] && M.mul[cur - 1].i === i;
      for (let k = 0; k < cols; k++){
        const isCur = active && M.mul[cur - 1].i === i &&
                      M.mul[cur - 1].j === (cols - 1 - i - k);
        grid.appendChild(cell(rowCells[i][k], {
          color: isCur ? '#fff' : (complete ? 'var(--purple)' : 'var(--ink)'),
          bg: isCur ? 'var(--accent)' : 'transparent',
          size: 24, weight: complete ? 700 : 500
        }));
      }
    });

    /* 积：两个部分积都完成后，按列相加逐位写出 */
    const resCells = new Array(cols).fill('');
    const addDone = Math.max(0, cur - M.mul.length);
    M.add.forEach((st2, i) => { if (i < addDone) resCells[cols - 1 - st2.col] = String(st2.digit); });
    if (addDone > 0) hline();
    for (let k = 0; k < cols; k++){
      const isCur = addDone > 0 && addDone <= M.add.length && M.add[addDone - 1].col === (cols - 1 - k);
      grid.appendChild(cell(resCells[k], {
        color: isCur ? '#fff' : (addDone > 0 ? 'var(--green)' : 'var(--ink2)'),
        bg: isCur ? 'var(--accent)' : 'transparent',
        size: 26, weight: 800, cls: 'res'
      }));
    }
    wrap.appendChild(grid);

    /* 右侧说明 */
    const info = document.createElement('div');
    info.style.cssText = 'font-size:17px;line-height:2;text-align:left;min-width:280px';
    if (cur === 0){
      info.innerHTML = `先写<b>竖式</b>：<br>① 上面写第二个因数 <b>${b}</b>，个位与 <b>${a}</b> 的个位对齐<br>② 下面写第一个因数 <b>${a}</b><br>③ 从<b>个位</b>算起`;
    } else if (cur <= M.mul.length){
      const st2 = M.mul[cur - 1];
      const colName = CN[st2.j + st2.i] || '';           /* 部分积里该位已经左移 i 位 */
      const rowTxt = st2.i === 0
        ? `用 <b>${st2.bd}</b> 乘 ${a} 的${CN[st2.j]}位`
        : `用<b>十位上的 ${st2.bd}</b> 乘 ${a}（这一行是 ${a} × ${st2.bd} × 10）`;
      info.innerHTML = `${rowTxt}：<b>${st2.ad} × ${st2.bd}</b>` +
        (st2.carry ? ` <span style="color:var(--orange)">+ 进位 ${st2.carry}</span>` : '') +
        ` = <b>${st2.prod}</b><br>` +
        `在<b>${colName}位</b>写 <b>${st2.digit}</b>` +
        (st2.nc ? `，向<b>${CN[st2.j + st2.i + 1] || '前'}位</b>进 <b>${st2.nc}</b>` : '，不用进位');
    } else {
      const st2 = M.add[addDone - 1];
      const colName = CN[st2.col] || '';
      const addTxt = st2.present.map(p => p.d).join(' + ') + (st2.carryIn ? ` + ${st2.carryIn}` : '');
      info.innerHTML = `把两个部分积<b>相加</b>：<br>` +
        `<b>${colName}位</b>：${addTxt} = <b>${st2.sum}</b>，` +
        `写 <b>${st2.digit}</b>` + (st2.carry ? `，向<b>${CN[st2.col + 1] || '前'}位</b>进 <b>${st2.carry}</b>` : '，不用进位') +
        `<br><span style="color:var(--ink2);font-size:15px">竖式里第 ${cur} / ${M.total} 步</span>`;
    }
    wrap.appendChild(info);
    stage.appendChild(wrap);

    steps.innerHTML = Array.from({length: M.total + 1}, (_, i) =>
      `<div class="dot ${i < cur ? 'done' : (i === cur ? 'on' : '')}" title="第${i}步">${i}</div>`).join('');

    const p0 = M.rowVal(0), p1 = M.B.length > 1 ? M.rowVal(1) : null;
    note.innerHTML = cur === 0
      ? '点"下一步"，看竖式里先算什么、再算什么、满几进几。注意：相同数位要对齐，从个位算起。'
      : cur <= M.mul.length
        ? `先算部分积：${a} × ${B[0]} = <b>${p0}</b>` + (p1 !== null ? `，${a} × ${B[1]} × 10 = <b>${p1}</b>` : '') +
          '（十位上的数乘得的积要<b>末尾补 0</b>，写成左移后的完整积）。'
        : `两个部分积相加：<b>${p0}${p1 !== null ? ' + ' + p1 : ''} = ${a * b}</b>。`;
  }
  sel.addEventListener('change', () => { step = 0; render(); });
  $('#btnVmStep').addEventListener('click', () => { step++; render(); });
  $('#btnVmAll').addEventListener('click', () => { step = 999; render(); });
  $('#btnVmReset').addEventListener('click', () => { step = 0; render(); });
  render();

  MOD.vertical = {
    set(n){ step = Math.max(0, n | 0); render(); },
    total(a, b){
      const it = ITEMS[+sel.value];
      return build(it.a, it.b).total;
    },
    get step(){ return step; }
  };
})();

/* ==========================================================================
   ③ 因数中间或末尾有 0 的乘法
   ========================================================================== */
(function initZero(){
  const ITEMS = [
    {a:'25', b:'40'}, {a:'25', b:'4'}, {a:'160', b:'30'}, {a:'30', b:'40'}, {a:'240', b:'50'},
    {a:'307', b:'25'}   /* 中间有 0 的反例：能藏的只有末尾的 0 */
  ];
  const sel = $('#zeroSel'), stage = $('#zeroStage'), note = $('#zeroNote'), steps = $('#zeroSteps');
  let step = 0;
  function zeros(str){ return (str.match(/0/g) || []).length; }
  function render(){
    const it = ITEMS[+sel.value];
    const a = +it.a, b = +it.b;
    const za = zeros(it.a), zb = zeros(it.b);
    /* 末尾 0 的个数 */
    const trail = n => { let k = 0, m = n; while (m % 10 === 0 && m !== 0){ k++; m /= 10; } return k; };
    const ta = trail(a), tb = trail(b);
    stage.innerHTML = '';
    const box = document.createElement('div');
    box.style.cssText = 'text-align:center;font-size:24px;font-weight:800;line-height:2.1;font-variant-numeric:tabular-nums';
    const line = (t, c) => { const d = document.createElement('div'); d.textContent = t; if (c) d.style.color = c; box.appendChild(d); };
    line(`${it.a} × ${it.b}`);
    if (step === 0){
      line(`<span style="font-size:19px;font-weight:600;color:var(--ink2)">先看末尾各有几个 0：${it.a} 有 ${ta} 个，${it.b} 有 ${tb} 个</span>`);
    } else if (step === 1){
      const a2 = a / Math.pow(10, ta), b2 = b / Math.pow(10, tb);
      line(`${a2} × ${b2}`, 'var(--accent)');
    } else if (step === 2){
      const a2 = a / Math.pow(10, ta), b2 = b / Math.pow(10, tb);
      line(`${a2} × ${b2} = ${a2 * b2}`, 'var(--accent)');
    } else {
      line(`${it.a} × ${it.b} = ${a * b}`, 'var(--green)');
    }
    stage.appendChild(box);
    steps.innerHTML = ['①看末尾0','②藏起0','③算一算','④添上0']
      .map((l, i) => `<div class="dot ${i < step ? 'done' : (i === step ? 'on' : '')}" title="${l}">${i+1}</div>`).join('');
    const msgs = [
      `先看因数<b>末尾</b>有几个 0：<b>${it.a}</b> 末尾 ${ta} 个，<b>${it.b}</b> 末尾 ${tb} 个。`,
      `把末尾的 0 暂时去掉，先算 <b>${a / Math.pow(10, ta)} × ${b / Math.pow(10, tb)}</b>。`,
      `算出得数 <b>${(a / Math.pow(10, ta)) * (b / Math.pow(10, tb))}</b>。`,
      `在得数末尾添上 <b>${ta + tb}</b> 个 0，得 <b>${a * b}</b>。` +
      (za + zb > ta + tb ? '<br><span style="color:var(--orange)">注意：因数<b>中间</b>的 0 不能去掉，它占着数位呢！</span>' : '')
    ];
    note.innerHTML = msgs[Math.min(step, msgs.length-1)];
  }
  sel.addEventListener('change', () => { step = 0; render(); });
  $('#btnZeroStep').addEventListener('click', () => { step = (step + 1) % 4; render(); });
  $('#btnZeroReset').addEventListener('click', () => { step = 0; render(); });
  render();

  MOD.zero = {
    pick(i){ sel.value = String(i); sel.dispatchEvent(new Event('change')); },
    set(n){ step = Math.max(0, Math.min(3, n | 0)); render(); },
    get step(){ return step; }
  };
})();

/* ==========================================================================
   ④ 积的变化规律
   ========================================================================== */
(function initLaw(){
  const range = $('#lawRange'), lab = $('#lawLabel'), stage = $('#lawStage'), note = $('#lawNote');
  const A = 12;
  let last = 5;
  function render(){
    const b = +range.value;
    const p = A * b;
    lab.textContent = `${A} × ${b} = ${p}`;
    stage.innerHTML = '';
    const box = document.createElement('div');
    box.style.cssText = 'text-align:center;font-size:24px;font-weight:800;line-height:2;font-variant-numeric:tabular-nums';
    const d1 = document.createElement('div');
    d1.textContent = `${A} × ${last} = ${A * last}`;
    d1.style.color = 'var(--ink2)';
    const d2 = document.createElement('div');
    d2.innerHTML = `<span style="color:var(--accent)">${A} × ${b} = ${p}</span>`;
    const d3 = document.createElement('div');
    const ratio = last === 0 ? '' : (b / last);
    d3.innerHTML = last === b ? '（第二个因数没变，积也没变）'
      : `第二个因数 ${last} → ${b}，${b > last ? '扩大到' : '缩小到'}原来的 ${(b/last).toFixed(2).replace(/\.?0+$/,'')} 倍，` +
        `积也${b > last ? '扩大到' : '缩小到'}原来的 ${(b/last).toFixed(2).replace(/\.?0+$/,'')} 倍` +
        `（${A * last} → ${p}）`;
    d3.style.cssText = 'font-size:18px;font-weight:600;color:var(--ink2);margin-top:6px';
    box.append(d1, d2, d3);
    stage.appendChild(box);
    note.innerHTML = `<b>规律</b>：一个因数不变，另一个因数乘（除以）几，积就<b>乘（除以）同样的几</b>。` +
      `<br>例如：12 × 5 = 60，12 × 50 = 600（第二个因数乘 10，积也乘 10）。`;
    last = b;
  }
  range.addEventListener('input', render);
  $('#btnLawHalf').addEventListener('click', () => { range.value = Math.max(1, Math.round(+range.value / 2)); render(); });
  $('#btnLawTriple').addEventListener('click', () => { range.value = Math.min(20, +range.value * 3); render(); });
  $('#btnLawReset').addEventListener('click', () => { range.value = 5; render(); });
  render();

  MOD.law = {
    /* 讲解里连续调用会自然形成"上一次 → 这一次"的对比 */
    set(b){ range.value = String(b); render(); },
    reset(){ last = 5; range.value = '5'; render(); },
    get b(){ return +range.value; }
  };
})();

/* ==========================================================================
   ⑤ 估算
   ========================================================================== */
(function initEstimate(){
  const ITEMS = [
    {a:302, b:21, lim:7000, unit:'元', ask:'7000 元够买 21 套吗？'},
    {a:48, b:29, lim:1500, unit:'个', ask:'1500 个够装这些产品吗？'},
    {a:198, b:52, lim:10000, unit:'元', ask:'1 万元够付这笔货款吗？'}
  ];
  const sel = $('#estSel'), range = $('#estRange'), stage = $('#estStage'), note = $('#estNote');
  /* 讲解专用中间态：'raw' 只出题（不剧透）、'round' 只换数（还没乘）。
     手动操作任何控件都会清掉它，回到正常三档。 */
  let ov = null;
  function render(){
    const it = ITEMS[+sel.value];
    const mode = +range.value;   /* 0: 都看成整十/整百  1: 只看成整十  2: 不估 */
    const a = it.a, b = it.b;
    /* 三位数看成整百，两位数看成整十 —— 否则 48 会被看成 0 */
    const r100 = n => (n >= 100 ? Math.round(n / 100) * 100 : Math.round(n / 10) * 10);
    const aRound = mode === 0 ? r100(a) : Math.round(a / 10) * 10;
    const bRound = mode === 0 ? r100(b) : Math.round(b / 10) * 10;
    const est = mode === 2 ? a * b : aRound * bRound;

    stage.innerHTML = '';
    const box = document.createElement('div');
    box.style.cssText = 'text-align:center;font-size:24px;font-weight:800;line-height:2;font-variant-numeric:tabular-nums';
    const dim = 'font-size:19px;font-weight:600;color:var(--ink2)';
    const line = (html, css) => { const d = document.createElement('div'); d.innerHTML = html; if(css) d.style.cssText = css; box.appendChild(d); };

    if(ov === 'raw'){
      line(`${a} × ${b} = ？`);
      line('先别急着算', dim);
      stage.appendChild(box);
      note.innerHTML = `<b>${it.ask}</b><br>先想：真要一位一位乘出来吗？`;
      return;
    }
    if(ov === 'round'){
      line(`${a} ≈ <span style="color:var(--accent)">${r100(a)}</span>，${b} ≈ <span style="color:var(--accent)">${r100(b)}</span>`);
      line('把两个因数都看成整十整百数', dim);
      stage.appendChild(box);
      note.innerHTML = '<b>估算第一步</b>：先换数，再相乘。换数只为好算，数变了但意思没变。';
      return;
    }

    if(mode === 2){
      line(`${a} × ${b} = ${a * b}`);
      line('精确计算（不估算）', dim);
    } else {
      line(`${a} ≈ ${aRound}，${b} ≈ ${bRound}`);
      line(`${a} × ${b} ≈ ${aRound} × ${bRound} = <span style="color:var(--green)">${est}</span>`);
      line(`估算值比精确值${est >= a * b ? '偏大' : '偏小'} ${Math.abs(est - a * b)}`, dim);
    }
    stage.appendChild(box);
    const enough = a * b <= it.lim;
    const diff = Math.abs(est - a * b);
    const up = est >= a * b;      /* 估大 = 把因数看大了 */
    const concl = enough
      ? `精确值 <b>${a * b}</b>，不超过 ${it.lim}，<b>够</b>。`
      : `精确值 <b>${a * b}</b>，超过 ${it.lim}，<b>不够</b>。`;
    const reason = mode === 2
      ? '这一步是精确计算，用来核对估算靠不靠谱。'
      : (up
          ? `估算把因数看大了，估出 ${est}；${enough
              ? `实际只会更少，所以肯定够。`
              : `估大了还超过 ${it.lim}，实际更少，能不能够要看精确值。`}`
          : `估算把因数看小了，估出 ${est}，比精确值少 ${diff}。${enough
              ? `${est} 加上少算的 ${diff} 还不到 ${it.lim}，所以够。`
              : `估小了都超过 ${it.lim}，实际更多，肯定不够。`}`);
    note.innerHTML = `<b>${it.ask}</b><br>${concl}${reason}`;
  }
  sel.addEventListener('change', () => { ov = null; render(); });
  range.addEventListener('input', () => { ov = null; render(); });
  $('#btnEstReset').addEventListener('click', () => { ov = null; range.value = 0; render(); });
  render();

  MOD.est = {
    pick(i){ ov = null; sel.value = String(i); render(); },
    setMode(m){ ov = null; range.value = String(m); render(); },
    /* 讲解中间态：只出题 / 只换数 */
    raw(){ ov = 'raw'; render(); },
    round(){ ov = 'round'; render(); },
    get mode(){ return +range.value; }
  };
})();

/* ==========================================================================
   分层练习数据
   ========================================================================== */
const BASIC_CHOICE = [
  {q:'口算 20 × 30 =（　）。', opts:['60','600','6000','60000'], a:1,
   why:'2 × 3 = 6，两个因数末尾一共 2 个 0，积的末尾添 2 个 0 → 600。'},
  {q:'口算 300 × 40 =（　）。', opts:['1200','12000','120000','1200000'], a:1,
   why:'3 × 4 = 12，末尾一共 3 个 0 → 12000。'},
  {q:'笔算 145 × 12，积是（　）。', opts:['1740','17400','2900','1450'], a:0,
   why:'145 × 2 = 290，145 × 10 = 1450，290 + 1450 = 1740。'},
  {q:'一个因数不变，另一个因数乘 3，积就（　）。',
   opts:['乘 3','乘 9','乘 30','不变'], a:0,
   why:'积的变化规律：一个因数不变，另一个因数乘几，积就乘几。'},
  {q:'25 × 40 =（　）。', opts:['100','1000','10000','250'], a:1,
   why:'40 末尾 1 个 0：25 × 4 = 100，再添 1 个 0 → 1000。'},
  {q:'下面各式中，积是 2400 的是（　）。',
   opts:['40 × 60','50 × 40','60 × 30','30 × 60'], a:0,
   why:'40 × 60 = 2400；50 × 40 = 2000；60 × 30 = 1800；30 × 60 = 1800。'},
  {q:'估算 302 × 21，最合适的结果是（　）。',
   opts:['6000','60000','6300','6021'], a:0,
   why:'把 302 看成 300，21 看成 20：300 × 20 = 6000。'},
  {q:'笔算时，"满几进几"是指（　）。',
   opts:['哪一位上的积满几十，就向前一位进几','每一位加满十就往前一位加一',
         '数满十位就进一','进位可以省略不写'], a:0,
   why:'哪一位上的积满几十，就向前一位进几，进位的数要写清楚。'}
];

const BASIC_FILL = [
  {q:'口算 25 × 4 =（　），25 × 40 =（　）。', a:['100','1000'],
   why:'先算 25 × 4 = 100，40 末尾 1 个 0，积添 1 个 0。'},
  {q:'口算 12 × 30 =（　）。', a:'360', why:'12 × 3 = 36，添 1 个 0 → 360。'},
  {q:'笔算 236 × 34 =（　）。', a:'8024',
   why:'236 × 4 = 944，236 × 30 = 7080，944 + 7080 = 8024。'},
  {q:'笔算 307 × 25 =（　）。', a:'7675',
   why:'307 × 5 = 1535，307 × 20 = 6140，1535 + 6140 = 7675。'},
  {q:'48 × 27 =（　）。', a:'1296', why:'48 × 7 = 336，48 × 20 = 960，336 + 960 = 1296。'},
  {q:'30 × 40 =（　）。', a:'1200', why:'3 × 4 = 12，末尾 2 个 0 → 1200。'},
  {q:'已知 25 × 16 = 400，那么 25 × 160 =（　）。', a:'4000',
   why:'一个因数不变，另一个因数乘 10，积也乘 10。'},
  {q:'估算 198 × 52 ≈（　）。', a:'10000',
   why:'把 198 看成 200，52 看成 50：200 × 50 = 10000。'}
];

const HAND_CHOICE = [
  {q:'小明计算 24 × 15 时，把 24 × 15 算成了 24 × 10 + 24 × 5，这样算（　）。',
   opts:['正确，用了乘法分配律','错误，24 × 10 + 24 × 5 = 24 × 15 是对的，但竖式要写清楚',
         '错误，应该用 24 × 10 + 24 × 10','错误，应该先算 24 + 10'], a:0,
   why:'24 × 15 = 24 × 10 + 24 × 5 = 240 + 120 = 360，方法正确。'},
  {q:'商店每个书包 128 元，妈妈带了 1000 元，最多能买（　）个书包。',
   opts:['7','8','9','10'], a:0,
   why:'128 × 7 = 896 ≤ 1000，128 × 8 = 1024 > 1000，所以最多 7 个。'},
  {q:'估算 302 × 21 时，把 302 看成 300，21 看成 20，估算结果是（　）。',
   opts:['6000','6300','6020','60000'], a:0, why:'300 × 20 = 6000。'},
  {q:'下面哪个算式的估算结果最接近 49 × 29 的精确积（1421）？',
   opts:['50 × 30 = 1500','40 × 30 = 1200','50 × 20 = 1000','45 × 29 = 1305'], a:0,
   why:'把因数看成最接近的整十数：50 × 30 = 1500，与 1421 最接近。'}
];

const HAND_FILL = [
  {q:'竖式计算 36 × 25 时，先用 5 乘 36 得（　），再用 20 乘 36 得（　），最后相加得（　）。',
   a:['180','720','900'],
   why:'5 × 36 = 180，20 × 36 = 720，180 + 720 = 900。'},
  {q:'一个礼盒装 24 支笔，50 个礼盒一共装（　）支笔。', a:'1200',
   why:'24 × 50 = 24 × 5 × 10 = 1200。'},
  {q:'每张门票 45 元，30 名同学一共需要（　）元。', a:'1350',
   why:'45 × 30 = 45 × 3 × 10 = 1350。'},
  {q:'修一条路，每天修 125 米，8 天修了（　）米。', a:'1000',
   why:'125 × 8 = 1000。'},
  {q:'估算：每个书架装 45 本书，21 个书架大约装（　）本。', a:'900',
   why:'把 21 看成 20：45 × 20 = 900，正好是整十数相乘，好算。'},
  {q:'一辆车每小时行 60 千米，3 小时行（　）千米。', a:'180',
   why:'60 × 3 = 180。'},
  {q:'小明有 240 元，买了 3 个同样的书包，每个（　）元。', a:'80',
   why:'240 ÷ 3 = 80。'},
  {q:'25 × 4 = 100，那么 250 × 4 =（　）。', a:'1000',
   why:'一个因数不变，另一个因数乘 10，积也乘 10。'}
];

const EXT_CHOICE = [
  {q:'已知 12 × 25 = 300，那么 12 × 250 =（　）。', opts:['3000','30000','300','30'], a:0,
   why:'另一个因数乘 10，积也乘 10：300 × 10 = 3000。', point:'积的变化规律：一个因数扩大 10 倍，积也扩大 10 倍', care:'25 变成 250 是**扩大** 10 倍（不是变 10），所以积也扩大 10 倍 = 3000'},
  {q:'一个数乘 5 后得 450，这个数乘 50 后得（　）。',
   opts:['45','450','4500','45000'], a:2, why:'一个因数乘 10，积乘 10：450 × 10 = 4500。', point:'**倒推**求原数，再算新的积', care:'先求这个数：450 ÷ 5 = 90；再 90 × 50 = 4500（别用 450 × 10 = 4500，虽然结果一样，但第一步思路要说清）', steps:['先倒推出这个数：450 ÷ 5 = 90', '再算 90 × 50 = 4500', '也可以这样想：乘数从 5 变成 50，扩大 10 倍，积也扩大 10 倍 → 450 × 10 = 4500']},
  {q:'要使 25 × □ 的积是 1000，□ 里应填（　）。', opts:['4','40','400','25'], a:1,
   why:'25 × 40 = 1000。', point:'**倒推**：除数 = 积 ÷ 已知因数', care:'1000 ÷ 25 = 40；别写 25 × 40 时把 25 看成 250', steps:['想：25 × □ = 1000', '两边同时除以 25：□ = 1000 ÷ 25', '= 40']},
  {q:'估算 41 × 39 时，下面哪种估法最接近精确积 1599？',
   opts:['40 × 40 = 1600','50 × 50 = 2500','40 × 30 = 1200','41 × 40 = 1640'], a:0,
   why:'把两个因数都看成最接近的整十数 40 × 40 = 1600，与 1599 只差 1。', point:'估算要**把两个因数都看成最接近的整十数**', care:'41 ≈ 40，39 ≈ 40，40 × 40 = 1600，与 1599 只差 1，最接近'},
  {q:'每套 4 本书，售价 78 元。买 5 套比买 4 套多花（　）元。',
   opts:['78','156','390','468'], a:0,
   why:'多买 1 套，多花 78 元。', point:'**倍数关系**：多买 1 套就多花 1 套的钱', care:'5 − 4 = 1（套），1 × 78 = 78 元；别算成 5 × 78 = 390', steps:['5 套比 4 套多买 5 − 4 = 1 套', '每套 78 元', '多花 78 × 1 = 78（元）']},
  {q:'用 48 × 25 计算，下面哪种算法最简便？',
   opts:['48 × 25 = 48 × 100 ÷ 4 = 1200','48 × 25 = 48 × 20 + 48 × 5 = 1200',
         '48 × 25 = (48 + 25) × 2 = 146','48 × 25 = 48 × 5 × 5 = 6000'], a:0,
   why:'48 × 100 = 4800，4800 ÷ 4 = 1200；用 25 = 100 ÷ 4 最简便。', point:'简便算法的标准：**能不能凑成整十整百**', care:'25 = 100 ÷ 4，所以 48 × 25 = 48 × 100 ÷ 4 = 1200，一步口算就行'}
];

const EXT_FILL = [
  {q:'已知 a × 15 = 240，那么 a × 150 =（　）。', a:'2400',
   why:'另一个因数乘 10，积也乘 10。', point:'积的变化规律：一个因数扩大 10 倍，积扩大 10 倍', care:'15 变 150 是扩大 10 倍，240 × 10 = 2400'},
  {q:'一个长方形的长是 25 厘米，宽是 12 厘米，它的周长是（　）厘米。', a:'74',
   why:'周长 = (25 + 12) × 2 = 74（25 × 2 = 50，12 × 2 = 24，50 + 24 = 74）。', point:'长方形周长 = (长 + 宽) × 2', care:'(25 + 12) × 2 = 37 × 2 = 74；别用 25 + 12 = 37'},
  {q:'一个长方形的长是 25 厘米，宽是 12 厘米，它的面积是（　）平方厘米。', a:'300',
   why:'面积 = 25 × 12 = 300（用 25 × 100 ÷ 4 的思路：25 × 12 = 25 × 4 × 3 = 300）。', point:'长方形面积 = 长 × 宽', care:'25 × 12 = 300；周长用 (25+12)×2，面积用 25×12，别混'},
  {q:'原价 198 元的书包，现在降价 30 元，现价（　）元。', a:'168',
   why:'198 − 30 = 168。', point:'降价就是**减法**', care:'198 − 30 = 168；别把 30 看成“降价 30%”'},
  {q:'一个数的 5 倍比它的 3 倍多 42，这个数是（　）。', a:'21',
   why:'5 倍比 3 倍多 5 − 3 = 2 倍，这 2 倍正好是 42，所以 1 倍是 42 ÷ 2 = 21。' +
        '检验：21 × 5 = 105，21 × 3 = 63，105 − 63 = 42 ✓',
   point:'差倍关系：同一个数的 5 倍与 3 倍相差 2 倍，这 2 倍就是 42',
   care:'先求“几倍”：5 − 3 = 2；2 倍是 42，所以 1 倍是 42 ÷ 2 = 21，别直接 42 ÷ 5',
   steps:['同一个数，5 倍比 3 倍多 5 − 3 = 2（倍）', '这 2 倍是 42，所以 1 倍是 42 ÷ 2 = 21', '检验：21 × 5 = 105，21 × 3 = 63，105 − 63 = 42 ✓'],
   hint:'回到动画 ④ 倍的关系：先想清楚"同一个数的几倍之间差几倍"。'},
  {q:'一辆汽车 3 小时行 195 千米，照这样计算，7 小时行（　）千米。', a:'455',
   why:'195 × 7 = 1365；先求每小时：195 ÷ 3 = 65，65 × 7 = 455。', point:'归一问题：先求**1 小时行多少千米**，再乘 7', care:'195 ÷ 3 = 65（千米/时），65 × 7 = 455；别直接 195 × 7'}
];

const STAR5_CHOICE = [
  {q:'已知 12 × 25 = 300，那么 12 × 2500 =（　）。', opts:['30000', '3000', '300', '300000'], a:0,
   why:'一个因数由 25 变成 2500，是<b>扩大了 100 倍</b>（添两个 0）。' +
       '另一个因数不变，积也扩大 100 倍。' +
       '所以 12 × 2500 = 300 × 100 = <b>30000</b>。',
   point:'积的变化规律：一个因数扩大 100 倍（添两个 0），积也扩大 100 倍',
   care:'25 → 2500 是扩大 **100** 倍（两个 0），不是 10 倍；另一个因数不能动',
   steps:['25 变成 2500，相当于把被乘数扩大 100 倍', '另一个因数 12 不变', '所以积也扩大 100 倍：300 × 100 = 30000']},
  {q:'计算 25 × 32 × 125 的结果是（　）。', opts:['100000', '10000', '1000', '250000'], a:0,
   why:'<b>乘法交换律 + 结合律</b>：25 和 125 都是"好数"，要把 32 拆开去配它们。' +
       '32 = 8 × 4，而 25 × 4 = 100，125 × 8 = 1000。' +
       '所以 25 × 32 × 125 = 25 × 8 × 4 × 125 = 1000 × 100 = <b>100000</b>。',
   point:'乘法交换律 + 结合律：**把中间的数拆开**去配两边的好数',
   care:'25 和 125 已经好算，要拆的是 32（拆成 8 × 4）；拆完两块都要凑整',
   steps:['32 = 8 × 4', '25 × 4 = 100，125 × 8 = 1000', '25 × 32 × 125 = 25 × 8 × 4 × 125 = 1000 × 100 = 100000']},
  {q:'一个数乘 9 再加这个数，等于这个数乘（　）。', opts:['10', '18', '90', '8'], a:0,
   why:'先把文字<b>翻译成算式</b>：这个数 × 9 + 这个数。' +
       '两项都有"这个数"，提取公因数：这个数 × (9 + 1) = 这个数 × <b>10</b>。',
   point:'逆用分配律',
   care:'整体提公因数',
   steps:['把文字翻译成算式：<b>这个数 × 9 + 这个数</b>。', '两项都有"这个数"，提取公因数：这个数 × (9 + 1)', '= 这个数 × <b>10</b>。']},
  {q:'三位数乘两位数，积最大是（　）位。', opts:['5', '4', '6', '3'], a:0,
   why:'最大的三位数是 999，最大的两位数是 99。' +
       '估一下：999 × 99 <b>小于</b> 1000 × 100 = 100000。' +
       '所以积最多是 <b>5</b> 位。',
   point:'上界估算',
   care:'999 × 99 < 100000',
   steps:['999 × 99 < 1000 × 100 = 100000', '所以最多 5 位']},
  {q:'一个自然数乘 25 后，积的末尾有 3 个 0，这个自然数最小是（　）。', opts:['40', '4', '400', '4000'], a:0,
   why:'25 = 100 ÷ 4，所以 这个数 × 25 = (这个数 ÷ 4) × 100。' +
       '末尾的 0 来自这个 ×100；要末尾有 3 个 0，<b>这个数 ÷ 4 本身还要带 1 个 0</b>。' +
       '所以 这个数 ÷ 4 = 10，这个数 = 40。' +
       '检验：40 × 25 = 1000，末尾正好 3 个 0 ✓',
   point:'把 25 看成 **100 ÷ 4**，末尾的 0 由 ÷4 之后的结果决定',
   care:'末尾 0 的个数不是由 25 决定，而是由"这个数 ÷ 4"决定',
   steps:['这个数 × 25 = (这个数 ÷ 4) × 100', '要末尾有 3 个 0，"这个数 ÷ 4"要再带 1 个 0', '即 这个数 ÷ 4 = 10 → 这个数 = 40', '检验：40 × 25 = 1000 ✓']},
  {q:'下面说法<b>错误</b>的是（　）。', opts:['两个因数都乘同一个数，积也乘这个数', '一个因数乘 2，积就乘 2', '因数中有 0，积就是 0', '积的位数一定等于两个因数位数之和'], a:0,
   why:'A 错：两个因数都乘 5，积要乘 <b>5 × 5 = 25</b> 倍，不是 5 倍。' +
       'B 对：因数不变时，积随另一个因数同比变化。' +
       'C 错：因数是 0 积才为 0；因数是 20 这样的数，积不为 0。' +
       'D 错：位数不一定相加，如 25 × 4 = 100（2 位 × 1 位 → 3 位）。',
   point:'辨析积的变化规律——**两个因数同时变**时积按**平方**变',
   care:'两因数都乘 5，积乘 25 倍；因数含 0（如 20）不等于积为 0',
   steps:['A 错：两因数都乘 5，积要乘 5 × 5 = 25 倍', 'B 对：因数不变时积随另一个因数同比变化', 'C 错：因数是 0 积才为 0；20 × 5 = 100 ≠ 0', 'D 错：25 × 4 = 100，2 位 × 1 位 = 3 位，不相加']},
];

const STAR5_FILL = [
  {q:'125 × 88 =（　）。', a:'11000',
   why:'把 88 拆成 8 × 11，因为 125 × 8 = 1000 能凑整。' +
       '125 × 8 × 11 = 1000 × 11 = <b>11000</b>。',
   point:'拆数凑整：125 × 8 = 1000',
   care:'88 要拆成 8 × 11，不是拆成加法',
   steps:['把 88 拆成 8 × 11', '125 × 8 = 1000', '1000 × 11 = 11000']},
  {q:'25 × 32 × 125 =（　）。', a:'100000',
   why:'把 32 拆成 8 × 4（25 × 4 = 100，125 × 8 = 1000）。' +
       '25 × 32 × 125 = 25 × 8 × 4 × 125 = 1000 × 100 = <b>100000</b>。',
   point:'拆数 + 结合律',
   care:'拆开后两块都要凑整',
   steps:['32 = 8 × 4', '25 × 4 = 100，125 × 8 = 1000', '1000 × 100 = 100000']},
  {q:'一个数乘 9 再减去这个数，等于这个数乘（　）。', a:'8',
   why:'这个数 × 9 − 这个数 = 这个数 × (9 − 1) = 这个数 × <b>8</b>。',
   point:'逆用分配律',
   care:'整体提公因数，括号里是**减 1**',
   steps:['翻译成算式：<b>这个数 × 9 − 这个数</b>。', '提取公因数：这个数 × (9 − 1)', '= 这个数 × <b>8</b>。']},
  {q:'三位数乘两位数，积最小是（　）位。', a:'4',
   why:'最小的三位数是 100，最小的两位数是 10。100 × 10 = 1000，所以积最少 <b>4</b> 位。',
   point:'下界估算',
   care:'100 × 10 = 1000，是 4 位数，所以最少 4 位',
   steps:['最小的三位数 100，最小的两位数 10', '100 × 10 = 1000，是 4 位数', '所以积最少 4 位']},
  {q:'用简便方法计算 25 × 16 × 4 =（　）。', a:'1600',
   why:'用结合律让 25 和 4 先算：25 × 4 = 100。' +
       '100 × 16 = <b>1600</b>。',
   point:'结合律：让 25 和 4 先算',
   care:'先看哪两个数相乘能凑整',
   steps:['25 × 4 = 100', '100 × 16 = 1600']},
  {q:'估算 298 × 21 的积大约是（　）。', a:'6000',
   why:'把 298 看成 300，21 看成 20。' +
       '300 × 20 = <b>6000</b>。' +
       '精确值 6258 与 6000 相差不大，估算合理。',
   point:'估算：把两个因数都看成**最接近的整十数**',
   care:'298 ≈ 300，21 ≈ 20；不要只估一个因数',
   steps:['298 看成 300，21 看成 20', '300 × 20 = 6000']},
];

bootCourse([
  {key:'basic', star:3, title:'第一档 · 巩固基础（口算、笔算、积的变化规律）', prefix:'基',
   choice:BASIC_CHOICE, fill:BASIC_FILL,
   host:'#basicBlock', score:'#scoreBasic', total:'#totalBasic', reset:'#btnResetBasic'},
  {key:'hand', star:3, title:'第二档 · 动手操作（竖式过程、估算与实际应用）', prefix:'动',
   choice:HAND_CHOICE, fill:HAND_FILL,
   host:'#handBlock', score:'#scoreHand', total:'#totalHand', reset:'#btnResetHand'},
  {key:'ext', star:4, title:'第三档 · 扩展思维（规律逆推、简便算法、综合应用）', prefix:'拓',
   choice:EXT_CHOICE, fill:EXT_FILL,
   host:'#extBlock', score:'#scoreExt', total:'#totalExt', reset:'#btnResetExt'},
  {key:'star5', title:'第四档 · 五星挑战 · 浅奥思维（竖式原理 · 运算律 · 规律探究）', prefix:'奥', star:5,
   choice:STAR5_CHOICE, fill:STAR5_FILL,
   host:'#star5Block', score:'#scoreStar5', total:'#totalStar5', reset:'#btnResetStar5'}
]);
