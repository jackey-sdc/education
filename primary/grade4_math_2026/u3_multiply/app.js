/* ==========================================================================
   第三单元 多位数乘两位数 —— 交互模块
   ========================================================================== */

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
})();

/* ==========================================================================
   ② 笔算乘法（竖式逐步演示）
   ========================================================================== */
(function initVertical(){
  const ITEMS = [
    {a:145, b:12}, {a:236, b:34}, {a:307, b:25}, {a:48, b:27}
  ];
  const sel = $('#vmSel'), stage = $('#vmStage'), note = $('#vmNote'), steps = $('#vmSteps');
  let step = 0;

  /* 生成竖式步骤 */
  function mulSteps(a, b){
    const A = String(a).split('').map(Number).reverse();
    const B = String(b).split('').map(Number).reverse();
    const out = [];
    B.forEach((bd, i) => {
      let carry = 0; const digits = [];
      A.forEach((ad, j) => {
        const prod = ad * bd + carry;
        const digit = prod % 10, nc = Math.floor(prod / 10);
        out.push({i, j, ad, bd, prod, digit, carry, nc});
        carry = nc;
        digits.unshift(digit);
      });
      if (carry > 0) digits.unshift(carry);
      out.push({rowDone: i, digits: digits.slice()});
    });
    return out;
  }

  function render(){
    const it = ITEMS[+sel.value];
    const a = it.a, b = it.b;
    const all = mulSteps(a, b);
    const calcSteps = all.filter(x => !('rowDone' in x));
    const total = calcSteps.length;
    const cur = Math.min(step, total);
    stage.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;gap:24px;align-items:center;flex-wrap:wrap;justify-content:center';

    /* 竖式：HTML 格子 */
    const cols = Math.max(String(a).length, String(b).length, String(a * b).length) + 2;
    const grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(' + cols + ',46px);gap:0;font-variant-numeric:tabular-nums';
    const cell = (txt, opt) => {
      const o = Object.assign({color:'var(--ink)', size:26, weight:700, bg:'transparent', border:'none', cls:''}, opt||{});
      const d = document.createElement('div');
      if (o.cls) d.className = o.cls;
      d.textContent = txt;
      d.style.cssText = `text-align:center;font-size:${o.size}px;font-weight:${o.weight};color:${o.color};` +
        `height:38px;line-height:38px;background:${o.bg};border:${o.border};`;
      return d;
    };
    const A = String(a).split(''), B = String(b).split('');
    const Acols = A.length, Bcols = B.length;
    /* 行1：第二个因数（b），右对齐 */
    for (let i = 0; i < cols; i++){
      const idx = i - (cols - Bcols);
      grid.appendChild(cell(idx >= 0 ? B[idx] : '', {size:26, weight:600}));
    }
    /* 行2：第一个因数（a），右对齐 */
    for (let i = 0; i < cols; i++){
      const idx = i - (cols - Acols);
      grid.appendChild(cell(idx >= 0 ? A[idx] : '', {size:26, weight:600}));
    }
    /* 横线 */
    const line = document.createElement('div');
    line.style.cssText = `grid-column:1 / ${cols + 1};height:0;border-top:2.5px solid var(--ink);margin:4px 0`;
    grid.appendChild(line);
    /* 部分积行：第 i 行是 a × (b 的第 i 位)，整体左移 i 位 */
    const Bv = String(b).split('').map(Number).reverse();
    const rows = [];
    for (let i = 0; i < Bv.length; i++){
      const str = String(a * Bv[i]);
      const row = [];
      for (let k = 0; k < cols; k++){
        const r = (cols - 1 - k) - i;          /* r = 该位在部分积中是从右数第几位 */
        row.push((r >= 0 && r < str.length) ? str[str.length - 1 - r] : '');
      }
      rows.push(row);
    }
    for (let i = 0; i < rows.length; i++){
      const partial = rows[i].slice();
      const mySteps = calcSteps.filter(x => x.i === i);
      const complete = mySteps.length === calcSteps.filter(x => x.i === i).length;
      mySteps.forEach(st2 => {
        const k = cols - 1 - i - st2.j;        /* 写在哪一列 */
        if (k >= 0) partial[k] = String(st2.digit);
      });
      for (let k = 0; k < cols; k++){
        const isCur = calcSteps[cur - 1] && calcSteps[cur - 1].i === i &&
                      calcSteps[cur - 1].j === (cols - 1 - i - k);
        grid.appendChild(cell(partial[k], {
          color: isCur ? '#fff' : (complete ? 'var(--purple)' : 'var(--ink)'),
          bg: isCur ? 'var(--accent)' : 'transparent',
          size: 24, weight: complete ? 700 : 500
        }));
      }
    }
    /* 结果行 */
    const resStr = String(a * b);
    const resRow = [];
    for (let k = 0; k < cols; k++){
      const idx = k - (cols - resStr.length);
      resRow.push(idx >= 0 ? resStr[idx] : '');
    }
    const line2 = document.createElement('div');
    line2.style.cssText = `grid-column:1 / ${cols + 1};height:0;border-top:2.5px solid var(--ink);margin:4px 0`;
    grid.appendChild(line2);
    resRow.forEach(txt => {
      grid.appendChild(cell(txt, {color: cur >= total ? 'var(--green)' : 'var(--ink2)',
        size: 26, weight:800, cls:'res'}));
    });
    wrap.appendChild(grid);

    /* 右侧说明 */
    const info = document.createElement('div');
    info.style.cssText = 'font-size:17px;line-height:2;text-align:left;min-width:260px';
    if (cur === 0){
      info.innerHTML = `先写<b>竖式</b>：<br>① 上面写第二个因数 <b>${b}</b>，个位与 <b>${a}</b> 的个位对齐<br>② 下面写第一个因数 <b>${a}</b><br>③ 从<b>个位</b>算起`;
    } else {
      const st2 = calcSteps[cur - 1];
      const colName = ['个', '十', '百', '千'][st2.j] || '';
      info.innerHTML = `正在算：<b>${st2.ad} × ${st2.bd}</b>` +
        (st2.carry ? ` <span style="color:var(--orange)">+ 进位 ${st2.carry}</span>` : '') +
        ` = <b>${st2.prod}</b><br>` +
        `在<b>${colName}位</b>写 <b>${st2.digit}</b>` +
        (st2.nc ? `，向<b>${['个','十','百'][st2.j] || '前'}位</b>进 <b>${st2.nc}</b>` : '，不用进位') +
        `<br><span style="color:var(--ink2);font-size:15px">竖式里第 ${cur} / ${total} 步</span>`;
    }
    wrap.appendChild(info);
    stage.appendChild(wrap);

    steps.innerHTML = Array.from({length: total + 1}, (_, i) =>
      `<div class="dot ${i < cur ? 'done' : (i === cur ? 'on' : '')}" title="第${i}步">${i}</div>`).join('');

    note.innerHTML = cur >= total
      ? `所以 <b>${a} × ${b} = ${a * b}</b>。别忘了：相同数位对齐、从个位算起、满几进几。`
      : '点"下一步"，一步一步看竖式怎么算。';
  }
  sel.addEventListener('change', () => { step = 0; render(); });
  $('#btnVmStep').addEventListener('click', () => { step++; render(); });
  $('#btnVmAll').addEventListener('click', () => { step = 99; render(); });
  $('#btnVmReset').addEventListener('click', () => { step = 0; render(); });
  render();
})();

/* ==========================================================================
   ③ 因数中间或末尾有 0 的乘法
   ========================================================================== */
(function initZero(){
  const ITEMS = [
    {a:'25', b:'40'}, {a:'25', b:'4'}, {a:'160', b:'30'}, {a:'30', b:'40'}, {a:'240', b:'50'}
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
})();

/* ==========================================================================
   ⑤ 估算
   ========================================================================== */
(function initEstimate(){
  const ITEMS = [
    {a:302, b:21, lim:400, unit:'元', ask:'400 元够买这本书吗？'},
    {a:48, b:29, lim:1500, unit:'个', ask:'1500 个够装这些产品吗？'},
    {a:198, b:52, lim:10000, unit:'元', ask:'1 万元够付这笔货款吗？'}
  ];
  const sel = $('#estSel'), range = $('#estRange'), stage = $('#estStage'), note = $('#estNote');
  function render(){
    const it = ITEMS[+sel.value];
    const mode = +range.value;   /* 0: 都看成整十/整百  1: 只看成整十  2: 不估 */
    const a = it.a, b = it.b;
    const aRound = mode === 0 ? Math.round(a / 100) * 100 : Math.round(a / 10) * 10;
    const bRound = mode === 0 ? Math.round(b / 10) * 10 : Math.round(b / 10) * 10;
    const est = mode === 2 ? a * b : aRound * bRound;
    stage.innerHTML = '';
    const box = document.createElement('div');
    box.style.cssText = 'text-align:center;font-size:24px;font-weight:800;line-height:2;font-variant-numeric:tabular-nums';
    const l1 = document.createElement('div');
    l1.textContent = mode === 2 ? `${a} × ${b} = ${a * b}` : `${a} ≈ ${aRound}，${b} ≈ ${bRound}`;
    const l2 = document.createElement('div');
    l2.innerHTML = mode === 2 ? `（没有估算）` : `${a} × ${b} ≈ ${aRound} × ${bRound} = <span style="color:var(--green)">${est}</span>`;
    const l3 = document.createElement('div');
    l3.style.cssText = 'font-size:18px;font-weight:600;color:var(--ink2)';
    l3.textContent = `精确值：${a} × ${b} = ${a * b}　（${mode === 2 ? '' : '估算值 ' + (est >= a * b ? '偏大' : '偏小') + ' ' + Math.abs(est - a * b)}）`;
    box.append(l1, l2, l3);
    stage.appendChild(box);
    const enough = a * b <= it.lim;
    note.innerHTML = `<b>${it.ask}</b><br>精确值 ${a * b} ${it.unit}，` +
      `估算值约 ${est} ${it.unit}。` +
      (mode === 2
        ? `精确计算得 ${a * b} ${it.unit}，${enough ? '<b>够</b>' : '<b>不够</b>'}。`
        : `因为估算${est >= a * b ? '偏大' : '偏小'}，` +
          `所以：${enough ? '精确值比 ' + it.lim + ' 小 → <b>够</b>（估算值大，说明肯定够）' : '精确值比 ' + it.lim + ' 大 → <b>不够</b>（估算值小，说明连估都不够）'}。`);
  }
  sel.addEventListener('change', render);
  range.addEventListener('input', render);
  $('#btnEstReset').addEventListener('click', () => { range.value = 0; render(); });
  render();
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
  {q:'竖式计算 36 × 25 时，个位上算（　）×（　）=（　），在个位写（　）向十位进（　）；十位上算（　）×（　）=（　）；最后的积是（　）。',
   a:['6','5','30','0','3','2','5','10','900'],
   why:'个位：6 × 5 = 30，个位写 0，向十位进 3；十位：2 × 5 = 10，再加进位 3 得 13，写 3 进 1；百位：2 × 2 + 1 = 5，所以积是 900。'},
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
   why:'另一个因数乘 10，积也乘 10：300 × 10 = 3000。'},
  {q:'一个数乘 5 后得 450，这个数乘 50 后得（　）。',
   opts:['45','450','4500','45000'], a:2, why:'一个因数乘 10，积乘 10：450 × 10 = 4500。'},
  {q:'要使 25 × □ 的积是 1000，□ 里应填（　）。', opts:['4','40','400','25'], a:1,
   why:'25 × 40 = 1000。'},
  {q:'估算 41 × 39 时，下面哪种估法最接近精确积 1599？',
   opts:['40 × 40 = 1600','50 × 50 = 2500','40 × 30 = 1200','41 × 40 = 1640'], a:0,
   why:'把两个因数都看成最接近的整十数 40 × 40 = 1600，与 1599 只差 1。'},
  {q:'每套 4 本书，售价 78 元。买 5 套比买 4 套多花（　）元。',
   opts:['78','156','390','468'], a:0,
   why:'多买 1 套，多花 78 元。'},
  {q:'用 48 × 25 计算，下面哪种算法最简便？',
   opts:['48 × 25 = 48 × 100 ÷ 4 = 1200','48 × 25 = 48 × 20 + 48 × 5 = 1200',
         '48 × 25 = (48 + 25) × 2 = 146','48 × 25 = 48 × 5 × 5 = 6000'], a:0,
   why:'48 × 100 = 4800，4800 ÷ 4 = 1200；用 25 = 100 ÷ 4 最简便。'}
];

const EXT_FILL = [
  {q:'已知 a × 15 = 240，那么 a × 150 =（　）。', a:'2400',
   why:'另一个因数乘 10，积也乘 10。'},
  {q:'一个长方形的长是 25 厘米，宽是 12 厘米，它的周长是（　）厘米。', a:'74',
   why:'周长 = (25 + 12) × 2 = 74（25 × 2 = 50，12 × 2 = 24，50 + 24 = 74）。'},
  {q:'一个长方形的长是 25 厘米，宽是 12 厘米，它的面积是（　）平方厘米。', a:'300',
   why:'面积 = 25 × 12 = 300（用 25 × 100 ÷ 4 的思路：25 × 12 = 25 × 4 × 3 = 300）。'},
  {q:'原价 198 元的书包，现在降价 30 元，现价（　）元。', a:'168',
   why:'198 − 30 = 168。'},
  {q:'一件商品原价 250 元，降价 50 元后降价率是（　）%。', a:'20',
   why:'50 ÷ 250 = 0.2 = 20%。'},
  {q:'一辆汽车 3 小时行 195 千米，照这样计算，7 小时行（　）千米。', a:'455',
   why:'195 × 7 = 1365；先求每小时：195 ÷ 3 = 65，65 × 7 = 455。'}
];

bootCourse([
  {key:'basic', title:'第一档 · 巩固基础（口算、笔算、积的变化规律）', prefix:'基',
   choice:BASIC_CHOICE, fill:BASIC_FILL,
   host:'#basicBlock', score:'#scoreBasic', total:'#totalBasic', reset:'#btnResetBasic'},
  {key:'hand', title:'第二档 · 动手操作（竖式过程、估算与实际应用）', prefix:'动',
   choice:HAND_CHOICE, fill:HAND_FILL,
   host:'#handBlock', score:'#scoreHand', total:'#totalHand', reset:'#btnResetHand'},
  {key:'ext', title:'第三档 · 扩展思维（规律逆推、简便算法、综合应用）', prefix:'拓',
   choice:EXT_CHOICE, fill:EXT_FILL,
   host:'#extBlock', score:'#scoreExt', total:'#totalExt', reset:'#btnResetExt'}
]);
