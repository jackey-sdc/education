/* ==========================================================================
   第一单元 万以上数的认识 —— 交互模块
   ========================================================================== */

/* ---------- 中文数字互转（教材口径：十进、每级末尾 0 不读） ---------- */
const CN_DIG = ['零','一','二','三','四','五','六','七','八','九'];
const CN_UNIT = ['','十','百','千'];
/* 0~9999 的读法 */
function fourCN(n){
  const str = String(n);
  let out = '', zero = false;
  for (let i = 0; i < str.length; i++){
    const num = +str[i], pos = str.length - 1 - i;
    if (num === 0){ zero = true; continue; }
    if (zero && out) out += '零';
    zero = false;
    if (num === 1 && pos === 1 && i === 0) out += '十';
    else out += CN_DIG[num] + CN_UNIT[pos];
  }
  return out;
}
/* 整数读法（支持到千亿） */
function toCN(n){
  if (n === 0) return '零';
  const yi = Math.floor(n / 1e8), wan = Math.floor(n % 1e8 / 1e4), ge = n % 1e4;
  let s = '';
  if (yi) s += fourCN(yi) + '亿';
  if (wan){
    if (yi && wan < 1000) s += '零';
    s += fourCN(wan) + '万';
  }
  if (ge){
    if ((yi || wan) && ge < 1000) s += '零';
    s += fourCN(ge);
  }
  return s;
}
/* 分级：从右往左每四位一组，最右边一组是个级，往左依次是万级、亿级…… */
const LEVEL_NAMES = ['个级', '万级', '亿级', '千亿级'];
function splitGroups(str){
  const s = String(str).replace(/[^0-9]/g, '');
  if (!s) return [];
  const pad = (4 - s.length % 4) % 4;
  const p = '0'.repeat(pad) + s;
  const n = p.length / 4, out = [];
  for (let i = 0; i < n; i++){
    const name = LEVEL_NAMES[n - 1 - i] || ('第' + (i + 1) + '级');
    out.push({t: name, v: p.slice(i * 4, i * 4 + 4)});
  }
  return out;
}
/* 某一级（4 位以内）的读法 */
function groupCN(v){
  const n = +v;
  if (n === 0) return '';
  return fourCN(n);
}

/* ==========================================================================
   ① 数位顺序表
   ========================================================================== */
(function initPlace(){
  const units = [
    {name:'个',    pos:'个位',     up:'十'},
    {name:'十',   pos:'十位',     up:'百'},
    {name:'百',   pos:'百位',     up:'千'},
    {name:'千',   pos:'千位',     up:'万'},
    {name:'万',   pos:'万位',     up:'十万'},
    {name:'十万', pos:'十万位',   up:'百万'},
    {name:'百万', pos:'百万位',   up:'千万'},
    {name:'千万', pos:'千万位',   up:'亿'},
    {name:'亿',   pos:'亿位',     up:'十亿'},
    {name:'十亿', pos:'十亿位',   up:'百亿'},
    {name:'百亿', pos:'百亿位',   up:'千亿'},
    {name:'千亿', pos:'千亿位',   up:''}
  ];
  const host = $('#placeTable');
  const info = $('#placeInfo');
  const demo = $('#placeDemo');
  const steps = $('#unitSteps');

  const levels = [
    {t:'个级',  cls:'g1', units:[0,1,2,3]},
    {t:'万级',  cls:'g2', units:[4,5,6,7]},
    {t:'亿级',  cls:'g3', units:[8,9,10,11]}
  ];

  function build(){
    host.innerHTML = '';
    const tbl = document.createElement('table'); tbl.className = 'plain';
    tbl.style.width = '100%';
    tbl.innerHTML = '<tr><th style="width:90px">数位</th>' +
      levels.map(l => `<th>${l.t}</th>`).join('') + '</tr>';
    const r1 = document.createElement('tr');
    r1.innerHTML = '<th class="l">计数单位</th>' + levels.map(() => '<th></th>').join('');
    const r2 = document.createElement('tr');
    r2.innerHTML = '<th class="l">数位顺序</th>' + levels.map(() => '<th></th>').join('');
    tbl.appendChild(r1); tbl.appendChild(r2);
    levels.forEach((l, li) => {
      const td1 = r1.children[li+1], td2 = r2.children[li+1];
      l.units.forEach(ui => {
        const u = units[ui];
        const b = document.createElement('div');
        b.className = 'chip'; b.style.cursor = 'pointer'; b.style.margin = '3px 0';
        b.dataset.i = ui;
        b.textContent = u.name;
        b.addEventListener('click', () => pick(ui));
        td1.appendChild(b);
        const sp = document.createElement('div');
        sp.textContent = u.pos; sp.style.fontSize = '13px'; sp.style.color = 'var(--ink2)';
        td2.appendChild(sp);
      });
    });
    host.appendChild(tbl);
    steps.innerHTML = '';
  }

  function pick(i, quiet){
    const u = units[i];
    info.innerHTML = `<b>${u.pos}</b>上的 1 表示 <b>${u.name}</b>；<b>${u.pos}</b>上的数位计数单位是"${u.name}"。` +
      (u.up ? `<br>10 个 ${u.name} = 1 个 ${u.up}，所以相邻两个计数单位之间的进率是 <b>10</b>。` : '');
    demo.textContent = `已选：${u.pos}（${u.name}）`;
    if (!quiet){
      $$('#placeTable .chip').forEach(c => c.classList.toggle('on', +c.dataset.i === i));
    }
  }

  /* 演示：10 个一万 = 1 个十万 */
  let demoTimer = null;
  $('#btnUnitDemo').addEventListener('click', () => {
    let k = 0;
    const order = [4,5];
    const paint = () => {
      steps.innerHTML = order.map((_, i) => `<div class="dot ${i < k ? 'done' : (i === k ? 'on' : '')}">${i+1}</div>`).join('');
      $$('#placeTable .chip').forEach(c => c.classList.remove('on'));
      const idx = order[Math.min(k, order.length-1)];
      const chip = $(`#placeTable .chip[data-i="${idx}"]`);
      if (chip) chip.classList.add('on');
      if (k === 0){ info.innerHTML = '先看<b>万位</b>上的计数单位"万"：1 个万。'; demo.textContent = '1 个万'; }
      if (k === 1){ info.innerHTML = '再看<b>十万位</b>上的计数单位"十万"：10 个万 = 1 个十万。<b>进率是 10</b>。'; demo.textContent = '10 个万 = 1 个十万'; }
      k++;
      if (k > 2){ k = 0; }
    };
    paint();
    clearInterval(demoTimer);
    demoTimer = setInterval(paint, 1600);
  });
  $('#btnUnitReset').addEventListener('click', () => {
    clearInterval(demoTimer); steps.innerHTML = '';
    $$('#placeTable .chip').forEach(c => c.classList.remove('on'));
    info.innerHTML = '点击上表中的计数单位试试。';
    demo.textContent = '';
  });
  build();
  pick(0, true);
})();

/* ==========================================================================
   ② 分级读数器
   ========================================================================== */
(function initRead(){
  const inp = $('#readNum'), stage = $('#readStage'), txt = $('#readText'),
        note = $('#readNote'), steps = $('#readSteps');
  let step = 0, timer = null;

  function render(){
    const raw = inp.value.replace(/[^0-9]/g, '');
    if (!raw){ stage.innerHTML = ''; txt.textContent = ''; note.textContent = '请输入一个整数。'; return; }
    const groups = splitGroups(raw);
    const n = +raw;
    const box = document.createElement('div');
    box.style.cssText = 'display:flex;gap:22px;flex-wrap:wrap;justify-content:center';
    groups.forEach((g, gi) => {
      const col = document.createElement('div');
      const lv = document.createElement('div');
      lv.textContent = g.t; lv.style.cssText = 'font-size:13px;color:var(--ink2);margin-bottom:4px';
      const num = document.createElement('div');
      num.style.cssText = 'font-size:34px;font-weight:800;letter-spacing:2px;font-variant-numeric:tabular-nums';
      const C = {亿级:['var(--purple)','var(--purple-l)'], 万级:['var(--accent)','var(--accent-l)'],
                 个级:['var(--orange)','var(--orange-l)']};
      const cc = C[g.t] || ['var(--ink)','transparent'];
      const active = step === gi + 1;
      num.style.color = active ? cc[0] : 'var(--ink)';
      num.style.background = active ? cc[1] : 'transparent';
      num.style.padding = '0 8px'; num.style.borderRadius = '10px';
      num.textContent = g.v;
      num.dataset.g = gi;
      col.append(lv, num);
      box.appendChild(col);
    });
    stage.innerHTML = '';
    stage.appendChild(box);

    const labels = ['原始数字', '① 分级', '② 读亿级', '③ 读万级', '④ 读个级', '⑤ 合起来'];
    steps.innerHTML = labels.map((l, i) =>
      `<div class="dot ${i < step ? 'done' : (i === step ? 'on' : '')}" title="${l}">${i+1}</div>`).join('');

    const yi = groups.find(g => g.t === '亿级'), wan = groups.find(g => g.t === '万级'), ge = groups.find(g => g.t === '个级');
    let msg = '';
    if (step === 0){ msg = `这是一个 ${raw.length} 位的数。先点"读一级"看看它怎么分级。`; txt.textContent = ''; }
    if (step === 1){ msg = '从右往左每四位分一级：亿级 → 万级 → 个级。'; txt.textContent = ''; }
    if (step === 2){ txt.textContent = (yi && +yi.v ? groupCN(yi.v) + '亿' : '亿级是 0，不读'); msg = '读<b>最高级</b>（亿级）。'; }
    if (step === 3){ txt.textContent = (wan && +wan.v ? groupCN(wan.v) + '万' : '万级是 0，不读'); msg = '再读<b>万级</b>。'; }
    if (step === 4){ txt.textContent = (ge && +ge.v ? groupCN(ge.v) : '个级是 0，不读'); msg = '最后读<b>个级</b>。'; }
    if (step >= 5){ txt.textContent = toCN(n); msg = `完整读法：<b>${toCN(n)}</b>　（写法：${raw}）`; }
    note.innerHTML = msg;
  }

  function next(){
    if (step >= 5) step = 0; else step++;
    render();
  }
  $('#btnReadStep').addEventListener('click', () => { clearInterval(timer); next(); });
  $('#btnReadRandom').addEventListener('click', () => {
    clearInterval(timer);
    const digits = [6,7,8,9,9,10][Math.floor(Math.random()*6)];
    let s = String(1 + Math.floor(Math.random()*9));
    for (let i = 1; i < digits; i++) s += Math.floor(Math.random()*10);
    inp.value = s; step = 0; render();
  });
  $('#btnReadAll').addEventListener('click', () => {
    clearInterval(timer); step = 0; render();
    timer = setInterval(() => { step++; if (step > 5){ clearInterval(timer); return; } render(); }, 1100);
  });
  $('#btnReadReset').addEventListener('click', () => { clearInterval(timer); step = 0; render(); });
  inp.addEventListener('input', () => { clearInterval(timer); step = 0; render(); });
  render();
})();

/* ==========================================================================
   ②b 写数：从读法还原
   ========================================================================== */
(function initWrite(){
  const inp = $('#writeCn'), stage = $('#writeStage'), txt = $('#writeText');
  $('#btnWrite').addEventListener('click', () => {
    const cn = inp.value.trim();
    if (!cn){ return; }
    const v = cn2num(cn);
    const raw = String(v);
    const groups = splitGroups(raw);
    stage.innerHTML = '';
    const box = document.createElement('div');
    box.style.cssText = 'display:flex;gap:22px;flex-wrap:wrap;justify-content:center';
    const C = {亿级:['var(--purple)','var(--purple-l)'], 万级:['var(--accent)','var(--accent-l)'],
               个级:['var(--orange)','var(--orange-l)']};
    groups.forEach((g, gi) => {
      const col = document.createElement('div');
      const lv = document.createElement('div');
      lv.textContent = g.t; lv.style.cssText = 'font-size:13px;color:var(--ink2);margin-bottom:4px';
      const cc = C[g.t] || ['var(--ink)','transparent'];
      const num = document.createElement('div');
      num.style.cssText = `font-size:34px;font-weight:800;letter-spacing:2px;color:${cc[0]};background:${cc[1]};padding:0 8px;border-radius:10px`;
      num.textContent = g.v;
      col.append(lv, num); box.appendChild(col);
    });
    stage.appendChild(box);
    txt.textContent = raw;
    txt.innerHTML = `写法：<b>${raw}</b>　（读作：${toCN(v)}）`;
  });
  $('#btnWriteClear').addEventListener('click', () => { inp.value = ''; stage.innerHTML = ''; txt.textContent = ''; });
})();

/* ==========================================================================
   ③ 大小比较
   ========================================================================== */
(function initCompare(){
  const PAIRS = [
    ['5060708', '5080607'],
    ['3702000', '3700200'],
    ['999999', '1000000'],
    ['12亿', '120000万'],
    ['30600000', '3060000']
  ];
  const stage = $('#cmpStage'), note = $('#cmpNote'), steps = $('#cmpSteps');
  let step = 0, timer = null;
  const toVal = t => /亿/.test(t) ? +t.replace('亿','') * 1e8 : (/万/.test(t) ? +t.replace('万','') * 1e4 : +t);

  function render(){
    const [a, b] = PAIRS[+$('#cmpSel').value];
    const va = toVal(a), vb = toVal(b);
    const sa = String(va), sb = String(vb);
    stage.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;gap:18px;align-items:center;flex-wrap:wrap;justify-content:center;font-size:30px;font-weight:800;font-variant-numeric:tabular-nums';
    const ea = document.createElement('div'), eb = document.createElement('div'), op = document.createElement('div');
    ea.style.cssText = 'padding:6px 14px;border-radius:12px;background:var(--accent-l)';
    eb.style.cssText = 'padding:6px 14px;border-radius:12px;background:var(--orange-l)';
    op.textContent = '○'; op.style.color = 'var(--ink2)';
    ea.textContent = a; eb.textContent = b;
    wrap.append(ea, op, eb);
    stage.appendChild(wrap);

    const lab = ['看位数', '比最高位', '再比下一位', '得出结论'];
    steps.innerHTML = lab.map((l, i) =>
      `<div class="dot ${i < step ? 'done' : (i === step ? 'on' : '')}" title="${l}">${i+1}</div>`).join('');

    const lenA = sa.length, lenB = sb.length;
    const pad = Math.max(lenA, lenB);
    const A = sa.padStart(pad, '0'), B = sb.padStart(pad, '0');
    let msg = '', result = '';
    if (step === 0){
      if (lenA !== lenB){
        msg = `左边是 ${lenA} 位数，右边是 ${lenB} 位数。<b>位数多的数比较大</b>。`;
        result = va > vb ? '＞' : '＜';
        op.textContent = result;
      } else {
        msg = `两个数都是 ${lenA} 位数，<b>位数相同</b>，就从最高位开始一位一位比。`;
      }
    }
    if (step === 1){
      const chA = A[0], chB = B[0];
      op.textContent = '○';
      msg = `比最高位（${chA} 和 ${chB}）：` + (chA === chB ? '<b>相等</b>，再比下一位。' : (chA > chB ? '左边<b>大</b>，后面不用比了。' : '右边<b>大</b>，后面不用比了。'));
      if (chA !== chB) result = chA > chB ? '＞' : '＜';
    }
    if (step === 2){
      let i = 0; while (i < pad && A[i] === B[i]) i++;
      if (i < pad){
        msg = `从最高位起，第 ${i+1} 位上 ${A[i]} ${A[i] > B[i] ? '＞' : '＜'} ${B[i]}，<b>左边${A[i] > B[i] ? '大' : '小'}</b>。`;
        result = A[i] > B[i] ? '＞' : '＜';
      } else {
        msg = '每一位都相同，两个数<b>相等</b>。';
        result = '＝';
      }
    }
    if (step >= 3){
      op.textContent = result;
      msg = `所以 <b>${a} ${result} ${b}</b>。${a === '12亿' ? '注意：12 亿 和 120000 万 是<b>同一个数</b>，单位不同而已。' : ''}`;
    }
    note.innerHTML = msg;
  }
  $('#btnCmp').addEventListener('click', () => { clearInterval(timer); step = 0; render(); });
  $('#btnCmpReset').addEventListener('click', () => { clearInterval(timer); step = 0; render(); });
  $('#cmpSel').addEventListener('change', () => { clearInterval(timer); step = 0; render(); });
  render();
})();

/* ==========================================================================
   ④ 数的改写
   ========================================================================== */
(function initRewrite(){
  const LIST = ['12000000','3800000','50600000','1250000000','99000000','7040000000',
                '5000000000','23500000','8000000','999000000'];
  const range = $('#rwRange'), stage = $('#rwStage'), note = $('#rwNote'), lab = $('#rwLabel');

  function render(){
    const raw = LIST[+range.value];
    const n = +raw;
    lab.textContent = raw.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    stage.innerHTML = '';
    const box = document.createElement('div');
    box.style.cssText = 'font-size:26px;font-weight:800;font-variant-numeric:tabular-nums;text-align:center;line-height:2';
    const row = (lhs, rhs, cls) => {
      const d = document.createElement('div');
      d.innerHTML = lhs + ' <span style="color:var(--ink2)">'+rhs+'</span>';
      if (cls) d.style.color = cls;
      return d;
    };
    const canW = n % 10000 === 0, canY = n % 1e8 === 0;
    box.appendChild(row(raw.replace(/\B(?=(\d{3})+(?!\d))/g, ','), '原数'));
    if (canW) box.appendChild(row(`${fmt(n/10000)} 万`, `= ${raw.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}（准确数，用等号）`, 'var(--green)'));
    else box.appendChild(row('—', '末四位不是 0，不能改写成用"万"作单位的数', 'var(--ink2)'));
    if (canY) box.appendChild(row(`${n/1e8} 亿`, `= ${raw.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}（准确数，用等号）`, 'var(--green)'));
    else box.appendChild(row('—', '末八位不全是 0，不能改写成用"亿"作单位的数', 'var(--ink2)'));
    stage.appendChild(box);
    note.innerHTML = canW || canY
      ? '改写只是把<b>写法</b>变简便，数的大小<b>没有变</b>，所以用"<b>＝</b>"。'
      : '记住：<b>只有整万数 / 整亿数才能改写</b>，否则就变成"求近似数"了（要用 ≈）。';
  }
  range.addEventListener('input', render);
  $('#btnRwReset').addEventListener('click', () => { range.value = 0; render(); });
  render();
})();

/* ==========================================================================
   ⑤ 求近似数（四舍五入）
   ========================================================================== */
(function initApprox(){
  const LIST = ['456780000','125600000','987650000','320040000','800050000',
                '123450000','999900000','456700000','712340000','303030000'];
  const range = $('#apRange'), stage = $('#apStage'), note = $('#apNote'), lab = $('#apLabel');
  let mode = null;

  function digitsHTML(str, markIdx){
    return [...str].map((ch, i) => {
      const hl = i === markIdx ? 'background:var(--orange-l);color:#b35c00;border-radius:6px;padding:0 4px;font-weight:800' : '';
      return `<span style="${hl}">${ch}</span>`;
    }).join('');
  }
  function render(){
    const raw = LIST[+range.value];
    const n = +raw;
    lab.textContent = raw.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    stage.innerHTML = '';
    if (!mode){
      stage.innerHTML = '<div class="note" style="font-size:17px">先选一种省略方式：</div>';
      note.innerHTML = '拖动滑块选数，点上面的按钮看四舍五入是怎么发生的。';
      return;
    }
    const box = document.createElement('div');
    box.style.cssText = 'text-align:center;line-height:2.1';
    const digits = [...raw];
    if (mode === 'w'){
      /* 省略万位后面的尾数 → 看千位（从右数第 4 位） */
      const keep = raw.length - 4;           // 保留到万位
      const dec = +raw[keep];                // 千位上的数字
      const res = String((Math.floor(n / 10000) + (dec >= 5 ? 1 : 0)) * 10000);
      box.innerHTML =
        `<div style="font-size:28px;font-weight:800">${digitsHTML(raw, keep)}</div>` +
        `<div class="note">保留<b>万位</b>，就要看<b>千位</b>上的 ${dec}——` +
        (dec >= 5 ? '<b>满 5 向前一位进 1</b>，其余舍去' : '<b>不满 5，全部舍去</b>') + `。</div>` +
        `<div style="font-size:30px;font-weight:800;color:var(--green)">${res.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} ≈ ${res.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} 万</div>`;
      note.innerHTML = '求近似数得到的是<b>估计数</b>，大小变了，所以用"<b>≈</b>"。';
    } else {
      /* 省略亿位后面的尾数 → 看千万位 */
      const keep = raw.length - 8;
      const dec = +raw[keep];
      const res = String((Math.floor(n / 1e8) + (dec >= 5 ? 1 : 0)) * 1e8);
      box.innerHTML =
        `<div style="font-size:28px;font-weight:800">${digitsHTML(raw, keep)}</div>` +
        `<div class="note">保留<b>亿位</b>，就要看<b>千万位</b>上的 ${dec}——` +
        (dec >= 5 ? '<b>满 5 向前一位进 1</b>，其余舍去' : '<b>不满 5，全部舍去</b>') + `。</div>` +
        `<div style="font-size:30px;font-weight:800;color:var(--green)">${res.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} ≈ ${(+res/1e8).toLocaleString()} 亿</div>`;
      note.innerHTML = '保留亿位，就看<b>千万位</b>——差一位看错，整个答案就错了。';
    }
    stage.appendChild(box);
  }
  range.addEventListener('input', render);
  $('#btnApW').addEventListener('click', () => { mode = 'w'; render(); });
  $('#btnApY').addEventListener('click', () => { mode = 'y'; render(); });
  $('#btnApReset').addEventListener('click', () => { mode = null; range.value = 0; render(); });
  render();
})();

/* ==========================================================================
   ⑥ 1亿有多大
   ========================================================================== */
(function initBillion(){
  const DATA = {
    money: {title:'1 亿元 = 100 万张 100 元钞票', bars:[
      {n:'百元钞票叠起来的高度', v:100, txt:'约 100 米'},
      {n:'10 层居民楼', v:30, txt:'约 30 米'},
      {n:'珠穆朗玛峰', v:8848, txt:'8848 米'}
    ], note:'每张百元钞票厚约 0.1 毫米，<b>1 万张</b>约 1 米，所以 100 万张约 <b>100 米</b>高，比一栋 10 层楼还高 3 倍多。'},
    rice: {title:'1 亿粒大米有多重', bars:[
      {n:'1 亿粒大米', v:20, txt:'约 20 吨'},
      {n:'一头大象', v:5, txt:'约 5 吨'},
      {n:'一辆 5 吨卡车', v:5, txt:'5 吨'}
    ], note:'一粒大米约 0.2 克，1 亿粒约 <b>20 吨</b>，相当于 <b>4 头大象</b>、装满 <b>4 辆卡车</b>。'},
    time: {title:'1 亿秒是多久', bars:[
      {n:'1 亿秒', v:3.2, txt:'约 3.2 年'},
      {n:'1 年', v:1, txt:'约 3150 万秒'},
      {n:'1 天', v:1/365, txt:'86400 秒'}
    ], note:'1 年约 3150 万秒，1 亿秒 ÷ 3150 万 ≈ <b>3.2 年</b>，比我们在小学待的时间还长。'},
    steps: {title:'1 亿步能走多远', bars:[
      {n:'1 亿步（每步 0.5 米）', v:5000, txt:'约 5000 千米'},
      {n:'绕地球赤道一圈', v:40075, txt:'约 4 万千米'},
      {n:'北京到上海', v:1200, txt:'约 1200 千米'}
    ], note:'每步约 0.5 米，1 亿步 ≈ <b>5000 千米</b>，可以从北京走到上海再回来好几趟。'}
  };
  const stage = $('#bnStage'), note = $('#bnNote');
  function render(k){
    const d = DATA[k];
    stage.innerHTML = '';
    const t = document.createElement('div');
    t.style.cssText = 'font-size:19px;font-weight:800;margin-bottom:10px';
    t.textContent = d.title;
    stage.appendChild(t);
    const max = Math.max(...d.bars.map(b => b.v));
    d.bars.forEach(b => {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;gap:10px;width:100%;max-width:640px;margin:6px 0';
      const name = document.createElement('div');
      name.style.cssText = 'width:190px;text-align:right;font-size:14px;color:var(--ink2)';
      name.textContent = b.n;
      const track = document.createElement('div');
      track.style.cssText = 'flex:1;height:24px;background:#eef3fb;border-radius:8px;overflow:hidden';
      const fill = document.createElement('div');
      fill.style.cssText = `height:100%;width:${Math.max(3, b.v/max*100)}%;border-radius:8px;background:linear-gradient(90deg,var(--accent),#7a4fd6)`;
      track.appendChild(fill);
      const val = document.createElement('div');
      val.style.cssText = 'width:110px;font-size:14px;font-weight:700;color:var(--accent)';
      val.textContent = b.txt;
      row.append(name, track, val);
      stage.appendChild(row);
    });
    note.innerHTML = d.note;
  }
  $('#bnBtns').addEventListener('click', e => {
    const b = e.target.closest('button[data-k]');
    if (b) render(b.dataset.k);
  });
  render('money');
})();

/* ==========================================================================
   分层练习数据
   ========================================================================== */
const BASIC_CHOICE = [
  {q:'在 50806230 中，数字 8 所在的数位是（　），它表示（　）。',
   opts:['万位，表示 8 万','十万位，表示 8 十万','百万位，表示 8 百万','千万位，表示 8 千万'], a:2,
   why:'从右往左第 4 位是百万位，8 个百万 = 800 万。'},
  {q:'3004000 读作（　）。',
   opts:['三百万四千','三百万零四千','三十万四千','三千万四千'], a:0,
   why:'分级后万级是 300、个级是 4000：三百（万）四千。每级末尾的 0 都不读，所以不读"零"。'},
  {q:'10 个一千万是 1 个（　）。', opts:['百万','亿','十亿','千万'], a:1,
   why:'相邻两个计数单位间的进率是 10。'},
  {q:'把 900000 改写成用"万"作单位的数是（　）万。', opts:['9','90','900','90 万'], a:1,
   why:'900000 末四位是 0，900000 = 90 万，用等号连接。'},
  {q:'省略万位后面的尾数：386500 ≈ （　）万。', opts:['38','39','38.6','386'], a:1,
   why:'保留万位看千位，千位上是 6，满 5 进 1，得 39 万。'},
  {q:'下面说法正确的是（　）。',
   opts:['495600 可以改写成 4956 万','495600 改写成用"万"作单位的数约是 50 万',
         '495600 改写成用"万"作单位的数约是 49 万','495600 改写成用"万"作单位的数是 49.56 万'],
   a:1,
   why:'末四位不是 0，不能用等号改写；求近似数看千位 5 满 5 进 1，得约 50 万。'},
  {q:'一个数的近似数是 3 万，这个数最大是（　）。',
   opts:['30000','34999','35000','39999'], a:1,
   why:'约 3 万的数范围是 25000 ~ 34999，最大是 34999。'},
  {q:'下面两个数比较，正确的是（　）。',
   opts:['5060708 ＞ 5080607','5060708 ＜ 5080607','5060708 = 5080607'], a:1,
   why:'位数相同，从最高位比起：千位 0 ＜ 8。'}
];

const BASIC_FILL = [
  {q:'数位顺序表中，最高位是（　）位，最低位是（　）位。（填"亿"或"个"）',
   a:['亿','个'], why:'数位顺序表从右往左是个位、十位……一直到千亿位，最高是亿位。'},
  {q:'由 5 个百万、3 个十万和 2 个千组成的数，写作（　）。', a:'5302000',
   why:'5 个百万 = 5000000，3 个十万 = 300000，2 个千 = 2000，合起来 5302000。'},
  {q:'把 250000000 改写成用"亿"作单位的数是（　）亿。', a:'2.5', why:'250000000 = 2.5 亿。'},
  {q:'省略万位后面的尾数：684000 ≈ （　）万。', a:'68', why:'看千位是 0，不满 5 舍去。'},
  {q:'省略万位后面的尾数：685000 ≈ （　）万。', a:'69', why:'看千位是 5，满 5 进 1。'},
  {q:'一个数的最高位是千万位，它是（　）位数。', a:'8', why:'千万位是从右往左第 8 位。'},
  {q:'最大的六位数是（　），最小的七位数是（　）。', a:['999999','1000000'],
   why:'最大六位数是 999999；最小的七位数是 1000000。'}
];

const HAND_CHOICE = [
  {q:'3405620305 这个数，万级的数字是（　）。',
   opts:['0034','0562','0305','3405'], a:1,
   why:'从右往左每四位一级：0034 | 0562 | 0305，即亿级 34、万级 562、个级 305。'},
  {q:'一个数的近似数是 60 万，这个数最小是（　）。',
   opts:['550000','599999','600000','500000'], a:0,
   why:'约 60 万的数范围是 550000 ~ 649999，最小 550000。'}
];

const HAND_FILL = [
  {q:'把 3405620305 分级，亿级是（　），万级是（　），个级是（　）。',
   a:['34','562','305'], why:'0034 | 0562 | 0305，即 34 亿、562 万、305。'},
  {q:'用 3、0、0、5、0、0、0 这七个数字组成一个最大的七位数，是（　）。',
   a:'3500000', why:'把最大的数字放最高位：3 000 000 里的 3，再把 5 放在千位 → 3500000。'},
  {q:'五个百万组成的数写作（　）。', a:'5000000', why:'5 个百万 = 500 万 = 5000000。'},
  {q:'由 3 个千万、5 个十万、8 个百组成的数是（　）。', a:'30500800',
   why:'千万位写 3，十万位写 5，百位写 8，其余数位一个单位也没有，写 0 占位。'},
  {q:'用 0、0、1、2、3 组成一个最大的五位数，是（　）。', a:'32100',
   why:'大的数字放高位：3、2、1、0、0 → 32100。'},
  {q:'500000000 是由（　）个一千万组成的。', a:'50', why:'1 千万 = 1000 万；500000000 ÷ 10000000 = 50。'},
  {q:'一个数最高位是千万位、最低位是个位，这个数最大是（　）。', a:'99999999',
   why:'8 位数，最大是 99999999。'}
];

const EXT_CHOICE = [
  {q:'一个数的近似数是 25 万，这个数最大是（　）。',
   opts:['245000','250000','254999','259999'], a:2,
   why:'四舍五入到万位得 25 万的数范围是 245000 ~ 254999，最大的是 254999。'},
  {q:'把 125000000 省略亿位后面的尾数，约是（　）亿。',
   opts:['1','1.2','1.25','2'], a:0,
   why:'保留亿位看千万位：125000000 的千万位是 1，不满 5 舍去，得约 1 亿。'},
  {q:'下面各数中，最大的是（　）。',
   opts:['9999999','10000000','9990000','9900000'], a:1,
   why:'10000000 是八位数，其余是七位数，位数多的大。'},
  {q:'用 4、5、0、0、0、8、0 组成一个只读一个"零"的七位数，最小的是（　）。',
   opts:['4000058','4005008','4050008','4000805'], a:0,
   why:'连续两个 0 会只读一个"零"，所以 0 不能相邻；要最小就把大数字放低位 → 4000058，读作四百万零五十八。'},
  {q:'估算：把 89234 省略万位后面的尾数，约是（　）万。',
   opts:['8','9','89','892'], a:1,
   why:'看千位 2，不满 5 舍去，得约 9 万。'}
];

const EXT_FILL = [
  {q:'一个数的近似数是 25 万，这个数最大是（　）。', a:'254999',
   why:'四舍五入到万位：245000~254999，最大 254999。'},
  {q:'用 4、5、0、0、0、8、0 组成一个只读一个"零"的七位数，最大的一个是（　）。',
   a:'8500400', why:'0 不能相邻；把 8、5 放高位，剩一个 0 放在万级末尾 → 8500400，读作八百五十万零四百。'},
  {q:'一个数省略亿位后面的尾数约是 7 亿，这个数最大是（　）。',
   a:'749999999', why:'约 7 亿的数范围 650000000 ~ 749999999。'},
  {q:'1 亿元相当于（　）个 100 万元。', a:'100',
   why:'1 亿 = 10000 万 = 100 个 100 万。'},
  {q:'1 万张 100 元钞票摞起来厚约 1 米，那么 1 亿元（100 万张）摞起来大约高（　）米。',
   a:'100', why:'100 万张 ÷ 1 万张 = 100 倍，1 米 × 100 = 100 米，约比 30 米高的 10 层楼还高 3 倍。'},
  {q:'一个数的近似数是 4 万，这个数最小是（　）。', a:'35000',
   why:'约 4 万的数范围 35000 ~ 44999。'}
];

bootCourse([
  {key:'basic', title:'第一档 · 巩固基础（万以上数的读写、改写与近似）', prefix:'基',
   choice:BASIC_CHOICE, fill:BASIC_FILL,
   host:'#basicBlock', score:'#scoreBasic', total:'#totalBasic', reset:'#btnResetBasic'},
  {key:'hand', title:'第二档 · 动手操作（分级、组数、数位填空）', prefix:'动',
   choice:HAND_CHOICE, fill:HAND_FILL,
   host:'#handBlock', score:'#scoreHand', total:'#totalHand', reset:'#btnResetHand'},
  {key:'ext', title:'第三档 · 扩展思维（近似数的范围、估算与推理）', prefix:'拓',
   choice:EXT_CHOICE, fill:EXT_FILL,
   host:'#extBlock', score:'#scoreExt', total:'#totalExt', reset:'#btnResetExt'}
]);
