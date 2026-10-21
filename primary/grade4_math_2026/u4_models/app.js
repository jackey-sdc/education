/* ==========================================================================
   第四单元 加法模型和乘法模型 —— 交互模块
   ========================================================================== */

/* ==========================================================================
   ① 加法模型
   ========================================================================== */
(function initAdd(){
  const a = $('#addA'), b = $('#addB'), lab = $('#addLabel'), stage = $('#addStage'), note = $('#addNote');
  function render(){
    const A = +a.value, B = +b.value, T = A + B;
    lab.textContent = `${A} + ${B} = ${T}`;
    stage.innerHTML = '';
    const box = document.createElement('div');
    box.style.cssText = 'text-align:center;width:100%;max-width:620px';
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;gap:8px;align-items:center;justify-content:center;flex-wrap:wrap';
    const unitW = 16;
    const mk = (val, color, bg, title) => {
      const d = document.createElement('div');
      d.style.cssText = `display:flex;flex-wrap:wrap;gap:3px;justify-content:center;padding:8px;border-radius:12px;background:${bg};border:2px solid ${color}`;
      const n = Math.min(val, 120);
      for (let i = 0; i < n; i++){
        const u = document.createElement('div');
        u.style.cssText = `width:${unitW}px;height:${unitW}px;border-radius:4px;background:${color}`;
        d.appendChild(u);
      }
      const t = document.createElement('div');
      t.style.cssText = 'width:100%;text-align:center;font-size:14px;font-weight:700;color:' + color;
      t.textContent = title + ' ' + val;
      d.appendChild(t);
      return d;
    };
    const p1 = mk(A, '#2f6fd0', '#e8f1ff', '甲班');
    const plus = document.createElement('div');
    plus.textContent = '+'; plus.style.cssText = 'font-size:26px;font-weight:800;color:var(--ink2)';
    const p2 = mk(B, '#f08a24', '#fff2e2', '乙班');
    row.append(p1, plus, p2);
    const eq = document.createElement('div');
    eq.textContent = '='; eq.style.cssText = 'font-size:26px;font-weight:800;color:var(--ink2);margin:6px 0';
    const tot = mk(T, '#1f9d6b', '#e6f7ef', '合计');
    box.append(row, eq, tot);
    stage.appendChild(box);
    note.innerHTML = `加法模型：<b>甲班 ${A} 人 + 乙班 ${B} 人 = 合计 ${T} 人</b>。<br>` +
      `求"一共"用加法；知道<b>总数</b>和其中一部分，求另一部分用<b>减法</b>：${T} − ${A} = ${B}。`;
  }
  a.addEventListener('input', render); b.addEventListener('input', render);
  $('#btnAddReset').addEventListener('click', () => { a.value = 28; b.value = 26; render(); });
  render();
})();

/* ==========================================================================
   ② 单价 · 数量 · 总价
   ========================================================================== */
(function initPrice(){
  const ITEMS = [
    {name:'牛奶', unit:'盒', price:18, qty:3, mode:'price'},
    {name:'苹果', unit:'千克', price:9, qty:4, mode:'price'},
    {name:'校服', unit:'套', price:120, qty:5, mode:'price'},
    {name:'粉笔', unit:'箱', price:null, qty:4, total:840, mode:'unit'},
    {name:'大米', unit:'袋', price:null, qty:4, total:236, mode:'unit2'}
  ];
  const sel = $('#priceSel'), stage = $('#priceStage'), note = $('#priceNote'), steps = $('#priceSteps');
  let step = 0;
  function render(){
    const it = ITEMS[+sel.value];
    stage.innerHTML = '';
    /* 小票 */
    const rec = document.createElement('div');
    rec.style.cssText = 'width:300px;border:1.5px dashed var(--ink2);border-radius:10px;padding:14px 18px;background:#fff;font-size:15px';
    let lines = [`超市购物小票`, '────────────────'];
    if (it.mode === 'price'){
      lines.push(`商品：${it.name}`);
      lines.push(`单价：${it.price} 元 / ${it.unit}`);
      lines.push(`数量：${it.qty} ${it.unit}`);
      lines.push(it.step === 2 ? `总价：${it.price * it.qty} 元` : `总价：？ 元`);
    } else if (it.mode === 'unit'){
      lines.push(`商品：${it.name}`);
      lines.push(`总价：${it.total} 元`);
      lines.push(`数量：${it.qty} ${it.unit}`);
      lines.push(`单价：？ 元 / ${it.unit}`);
    } else {
      lines.push(`商品：${it.name}`);
      lines.push(`原价：84 元 / ${it.unit}`);
      lines.push(`数量：${it.qty} ${it.unit}`);
      lines.push(`现价：${it.total} 元（每袋便宜了 84 − ${it.total / it.qty} = ${84 - it.total / it.qty} 元）`);
    }
    lines.forEach(l => {
      const d = document.createElement('div');
      d.textContent = l;
      rec.appendChild(d);
    });
    const wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;gap:24px;align-items:center;flex-wrap:wrap;justify-content:center';
    wrap.appendChild(rec);

    const calc = document.createElement('div');
    calc.style.cssText = 'text-align:left;font-size:18px;line-height:2';
    let msg = '';
    if (it.mode === 'price'){
      if (step === 0) msg = `先认出三个量：<b>单价 ${it.price} 元/${it.unit}</b>、<b>数量 ${it.qty} ${it.unit}</b>、<b>总价</b>（小票上还没算出来）。`;
      if (step === 1) msg = `求<b>总价</b>，用乘法：<b>单价 × 数量 = 总价</b>。`;
      if (step === 2) msg = `<b>${it.price} × ${it.qty} = ${it.price * it.qty}（元）</b>，所以总价是 ${it.price * it.qty} 元。`;
      if (step >= 3) msg = `答案：总价 <b>${it.price * it.qty} 元</b>（别忘写单位"元"）。`;
    } else if (it.mode === 'unit'){
      if (step === 0) msg = `小票上给的是<b>总价 ${it.total} 元</b>和<b>数量 ${it.qty} ${it.unit}</b>，要求<b>单价</b>。`;
      if (step === 1) msg = `求<b>单价</b>，用除法：<b>总价 ÷ 数量 = 单价</b>。`;
      if (step === 2) msg = `<b>${it.total} ÷ ${it.qty} = ${it.total / it.qty}（元）</b>。`;
      if (step >= 3) msg = `答案：单价 <b>${it.total / it.qty} 元 / ${it.unit}</b>。`;
    } else {
      if (step === 0) msg = `原价 <b>84 元/袋</b>，现价共 ${it.total} 元，共 ${it.qty} 袋——单价是<b>变化</b>的，要先算现价的单价。`;
      if (step === 1) msg = `第一步：求<b>现价单价</b>：<b>总价 ÷ 数量 = ${it.total} ÷ ${it.qty} = ${it.total / it.qty}（元/袋）</b>。`;
      if (step === 2) msg = `第二步：求<b>便宜多少</b>：<b>84 − ${it.total / it.qty} = ${84 - it.total / it.qty}（元）</b>。`;
      if (step >= 3) msg = `答：每袋比原价便宜 <b>${84 - it.total / it.qty} 元</b>。`;
    }
    calc.innerHTML = msg;
    wrap.appendChild(calc);
    stage.appendChild(wrap);
    steps.innerHTML = ['①读信息','②想关系','③列式算','④写答']
      .map((l, i) => `<div class="dot ${i < step ? 'done' : (i === step ? 'on' : '')}" title="${l}">${i+1}</div>`).join('');
    note.innerHTML = msg;
  }
  sel.addEventListener('change', () => { step = 0; render(); });
  $('#btnPriceStep').addEventListener('click', () => { step = (step + 1) % 4; render(); });
  $('#btnPriceReset').addEventListener('click', () => { step = 0; render(); });
  render();
})();

/* ==========================================================================
   ③ 速度 · 时间 · 路程
   ========================================================================== */
(function initSpeed(){
  const v = $('#spdV'), t = $('#spdT'), lab = $('#spdLabel'), stage = $('#spdStage'), note = $('#spdNote');
  function render(){
    const V = +v.value, T = +t.value, S = V * T;
    lab.textContent = `${V} 千米/时 × ${T} 小时 = ${S} 千米`;
    stage.innerHTML = '';
    const box = document.createElement('div');
    box.style.cssText = 'width:100%;max-width:660px';
    /* 公路 */
    const road = document.createElement('div');
    road.style.cssText = 'position:relative;height:110px;background:#eef3fb;border-radius:12px;overflow:hidden';
    const car = document.createElement('div');
    car.style.cssText = 'position:absolute;left:12px;top:34px;font-size:34px';
    car.textContent = '🚗';
    const bar = document.createElement('div');
    bar.style.cssText = `position:absolute;left:56px;top:46px;height:10px;border-radius:6px;background:linear-gradient(90deg,var(--accent),#7a4fd6);width:${Math.min(96, S/9)}%`;
    const home = document.createElement('div');
    home.style.cssText = 'position:absolute;left:10px;top:78px;font-size:13px;color:var(--ink2)';
    home.textContent = '家';
    const dst = document.createElement('div');
    dst.style.cssText = 'position:absolute;right:10px;top:78px;font-size:13px;color:var(--ink2)';
    dst.textContent = '学校';
    road.append(car, bar, home, dst);
    const info = document.createElement('div');
    info.style.cssText = 'margin-top:10px;font-size:19px;text-align:center;font-weight:700';
    info.innerHTML = `速度 <b style="color:var(--accent)">${V} 千米/时</b> × 时间 <b style="color:var(--orange)">${T} 小时</b> = 路程 <b style="color:var(--purple)">${S} 千米</b>`;
    box.append(road, info);
    stage.appendChild(box);
    note.innerHTML = `路程 = 速度 × 时间；反过来：<b>速度 = 路程 ÷ 时间</b>，<b>时间 = 路程 ÷ 速度</b>。<br>` +
      `<b>注意</b>：速度是复合单位，写成"${V} 千米/时"，读作"${V} 千米每时"。`;
  }
  v.addEventListener('input', render); t.addEventListener('input', render);
  $('#btnSpdReset').addEventListener('click', () => { v.value = 60; t.value = 3; render(); });
  render();
})();

/* ==========================================================================
   ④ 模型辨析（四步法）
   ========================================================================== */
(function initJudge(){
  const CASES = [
    {q:'图书角有故事书 56 本，科技书 38 本，一共有多少本？',
     model:'加法模型', why:'求"一共"，把两部分合起来：56 + 38 = 94（本）。'},
    {q:'每套故事书 18 元，买 6 套要多少钱？',
     model:'乘法模型', why:'单价 × 数量 = 总价：18 × 6 = 108（元）。'},
    {q:'一辆汽车 3 小时行了 180 千米，平均每小时行多少千米？',
     model:'乘法模型', why:'速度 = 路程 ÷ 时间：180 ÷ 3 = 60（千米/时）。'},
    {q:'书架上原来有 72 本书，借走了 25 本，还剩多少本？',
     model:'加法模型', why:'总量 − 分量 = 另一部分量：72 − 25 = 47（本）。'},
    {q:'一箱牛奶 48 元，学校买了 4 箱，付了 200 元，应找回多少元？',
     model:'乘法模型', why:'先算总价 48 × 4 = 192（元），再算 200 − 192 = 8（元）。'}
  ];
  const stage = $('#judgeStage'), note = $('#judgeNote'), steps = $('#judgeSteps');
  let idx = 0, step = 0;
  function render(){
    const c = CASES[idx];
    stage.innerHTML = '';
    const q = document.createElement('div');
    q.style.cssText = 'font-size:20px;font-weight:700;text-align:center;max-width:620px;line-height:1.8';
    q.textContent = '题目：' + c.q;
    stage.appendChild(q);
    const flow = document.createElement('div');
    flow.style.cssText = 'display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:14px';
    const labels = ['① 审题', '② 判模型', '③ 找关系', '④ 列式'];
    labels.forEach((l, i) => {
      const d = document.createElement('div');
      d.textContent = l;
      d.style.cssText = `padding:8px 14px;border-radius:999px;font-size:14px;font-weight:700;` +
        `background:${i < step ? 'var(--green-l)' : 'var(--accent-l)'};color:${i < step ? '#126b47' : 'var(--accent)'};` +
        `border:1.5px solid ${i < step ? 'var(--green)' : 'var(--accent-l)'}`;
      flow.appendChild(d);
    });
    stage.appendChild(flow);
    steps.innerHTML = labels.map((l, i) =>
      `<div class="dot ${i < step ? 'done' : (i === step ? 'on' : '')}" title="${l}">${i+1}</div>`).join('');
    const msgs = [
      '第 ① 步 <b>审题</b>：把题目读两遍，用笔画出<b>已知条件</b>和<b>要问的问题</b>。',
      `第 ② 步 <b>判模型</b>：这是<b>${c.model}</b>。`,
      '第 ③ 步 <b>找关系</b>：写出关系式——' +
        (c.model === '加法模型' ? '部分量 + 部分量 = 总量；总量 − 部分量 = 部分量。' :
                                 '单价 × 数量 = 总价；总价 ÷ 数量 = 单价；总价 ÷ 单价 = 数量。' +
                                 (c.q.includes('千米') ? '路程 = 速度 × 时间。' : '')),
      '第 ④ 步 <b>列式计算</b>并<b>写答</b>：' + c.why
    ];
    note.innerHTML = msgs[Math.min(step, msgs.length - 1)];
  }
  $('#btnJudgeNext').addEventListener('click', () => { step = (step + 1) % 4; render(); });
  $('#btnJudgeShow').addEventListener('click', () => { step = 4; render(); });
  $('#btnJudgeReset').addEventListener('click', () => { step = 0; idx = 0; render(); });
  render();
})();

/* ==========================================================================
   ⑤ 综合应用（两步问题）
   ========================================================================== */
(function initApply(){
  const ITEMS = [
    {q:'买 15 双运动鞋，每双 48 元；另外买 30 根跳绳，每根 6 元。一共花多少钱？',
     s1:'先算运动鞋的钱：单价 × 数量 = 总价 → 48 × 15 = 720（元）',
     s2:'再算跳绳的钱：6 × 30 = 180（元）',
     s3:'最后合起来：720 + 180 = 900（元）',
     a:'900'},
    {q:'家到动物园 240 千米，汽车每小时行 80 千米，几小时到达？',
     s1:'求<b>时间</b>，用<b>路程 ÷ 速度</b>',
     s2:'列式：240 ÷ 80 = 3（小时）',
     s3:'答：3 小时到达',
     a:'3'},
    {q:'每箱牛奶 60 元，买 4 箱，付出 300 元，应找回多少钱？',
     s1:'先算<b>总价</b>：60 × 4 = 240（元）',
     s2:'再算<b>找回</b>：300 − 240 = 60（元）',
     s3:'答：应找回 60 元',
     a:'60'}
  ];
  const sel = $('#applySel'), note = $('#applyNote'), steps = $('#applySteps');
  let step = 0;
  function render(){
    const it = ITEMS[+sel.value];
    steps.innerHTML = ['①第一步','②第二步','③第三步']
      .map((l, i) => `<div class="dot ${i < step ? 'done' : (i === step ? 'on' : '')}" title="${l}">${i+1}</div>`).join('');
    const msgs = [
      `<b>题目</b>：${it.q}`,
      it.s1,
      it.s2,
      it.s3
    ];
    note.innerHTML = msgs[Math.min(step, msgs.length - 1)];
    if (step === 0) note.className = 'tip';
  }
  sel.addEventListener('change', () => { step = 0; render(); });
  $('#btnApplyStep').addEventListener('click', () => { step = (step + 1) % 4; render(); });
  $('#btnApplyReset').addEventListener('click', () => { step = 0; render(); });
  render();
})();

/* ==========================================================================
   分层练习数据
   ========================================================================== */
const BASIC_CHOICE = [
  {q:'"每支笔 3 元，买 8 支"中，"3 元"是（　）。',
   opts:['单价','数量','总价','速度'], a:0,
   why:'表示"每支多少钱"，是单价。'},
  {q:'已知总价和数量，求单价用（　）。',
   opts:['总价 ÷ 数量','总价 × 数量','数量 ÷ 总价','总价 + 数量'], a:0,
   why:'总价 ÷ 数量 = 单价。'},
  {q:'一辆车每小时行 60 千米，4 小时行（　）千米。',
   opts:['15','64','240','150'], a:2, why:'速度 × 时间 = 路程：60 × 4 = 240。'},
  {q:'图书角有故事书 56 本，科技书 38 本，一共有（　）本。',
   opts:['18','94','88','76'], a:1, why:'部分 + 部分 = 总量：56 + 38 = 94。'},
  {q:'每套校服 120 元，买 5 套需要（　）元。',
   opts:['25','125','600','610'], a:2, why:'120 × 5 = 600。'},
  {q:'下面各式中，求"路程"正确的是（　）。',
   opts:['路程 = 速度 × 时间','路程 = 速度 ÷ 时间','路程 = 时间 ÷ 速度','路程 = 速度 + 时间'], a:0,
   why:'速度 × 时间 = 路程。'},
  {q:'3 小时行 240 千米，速度是（　）。',
   opts:['80 千米','80 千米/时','720 千米','8 千米/时'], a:1,
   why:'速度 = 路程 ÷ 时间 = 240 ÷ 3 = 80，单位要写"千米/时"。'},
  {q:'要买 6 支单价 12 元的笔，付出 100 元，应找回（　）元。',
   opts:['28','72','88','100'], a:0,
   why:'总价 12 × 6 = 72，100 − 72 = 28。'}
];

const BASIC_FILL = [
  {q:'单价 × 数量 =（　）；总价 ÷ 数量 =（　）。', a:['总价','单价'],
   why:'乘法模型的三量关系。'},
  {q:'速度 × 时间 =（　）；路程 ÷ 时间 =（　）。', a:['路程','速度'],
   why:'速度、时间的乘法模型。'},
  {q:'每套 68 元，买了 4 套，一共（　）元。', a:'272', why:'68 × 4 = 272。'},
  {q:'一共 270 元买了 5 个同样的书包，每个（　）元。', a:'54', why:'270 ÷ 5 = 54。'},
  {q:'一箱橘子 150 元，买了 6 箱，共（　）元。', a:'900', why:'150 × 6 = 900。'},
  {q:'汽车 4 小时行了 320 千米，平均每小时行（　）千米。', a:'80', why:'320 ÷ 4 = 80。'},
  {q:'甲仓库有 45 吨货，乙仓库有 38 吨，甲比乙多（　）吨。', a:'7', why:'45 − 38 = 7。'},
  {q:'停车场有 128 辆车，开走 45 辆，还剩（　）辆。', a:'83', why:'128 − 45 = 83。'}
];

const HAND_CHOICE = [
  {q:'下面各题中，属于"乘法模型"的是（　）。',
   opts:['一共有多少本书','每本多少钱','一共买了 6 本书，每本 15 元，共多少钱','还剩多少本'], a:2,
   why:'出现"单价 × 数量 = 总价"关系的是乘法模型。'},
  {q:'每千克苹果 8 元，买 5 千克，付出 50 元，应找回（　）元。',
   opts:['8','10','40','50'], a:1, why:'总价 8 × 5 = 40，50 − 40 = 10。'},
  {q:'妈妈买了 3 千克排骨，每千克 38 元，付了 200 元，应找回（　）元。',
   opts:['86','114','124','200'], a:0, why:'38 × 3 = 114，200 − 114 = 86。'},
  {q:'一辆汽车 5 小时行 300 千米，2 小时行（　）千米。',
   opts:['100','120','150','600'], a:1, why:'先求速度：300 ÷ 5 = 60，60 × 2 = 120。'}
];

const HAND_FILL = [
  {q:'填表：单价 25 元，数量 8 个，总价（　）元。', a:'200', why:'25 × 8 = 200。'},
  {q:'填表：总价 360 元，数量 12 个，单价（　）元。', a:'30', why:'360 ÷ 12 = 30。'},
  {q:'填表：速度 80 千米/时，时间 3 小时，路程（　）千米。', a:'240', why:'80 × 3 = 240。'},
  {q:'填表：路程 480 千米，速度 60 千米/时，时间（　）小时。', a:'8', why:'480 ÷ 60 = 8。'},
  {q:'学校买 6 个足球，每个 85 元，又买 8 根跳绳，每根 12 元，一共花了（　）元。',
   a:'606', why:'85 × 6 = 510，12 × 8 = 96，510 + 96 = 606。'},
  {q:'一辆客车每小时行 65 千米，行了 4 小时后离目的地还有 60 千米，全程（　）千米。',
   a:'320', why:'65 × 4 = 260，260 + 60 = 320。'},
  {q:'甲乙两班做纸盒，甲班做了 128 个，乙班比甲班多做了 36 个，乙班做了（　）个。',
   a:'164', why:'128 + 36 = 164。'},
  {q:'果园里有梨树 85 棵，桃树的棵数比梨树的 2 倍多 20 棵，桃树有（　）棵。',
   a:'190', why:'85 × 2 = 170，170 + 20 = 190。'}
];

const EXT_CHOICE = [
  {q:'小刚 3 小时走了 21 千米，照这样计算，他走 8 小时要走（　）千米。',
   opts:['56','49','63','42'], a:0, why:'先求速度 21 ÷ 3 = 7，7 × 8 = 56。'},
  {q:'一个数的 3 倍是 240，这个数的 5 倍是（　）。',
   opts:['400','240','480','800'], a:0, why:'这个数 = 240 ÷ 3 = 80，80 × 5 = 400。'},
  {q:'甲乙两地相距 450 千米，两车同时从两地相对开出，甲车每小时行 40 千米，乙车每小时行 50 千米，几小时相遇？',
   opts:['4','4.5','5','6'], a:2,
   why:'两车同时相对开出，每小时一共行 40 + 50 = 90 千米，450 ÷ 90 = 5（小时）。'},
  {q:'下面说法正确的是（　）。',
   opts:['单价越贵，总价一定越贵','数量越多，总价一定越多（单价不变时）',
         '速度越快，路程一定越远','时间越长，路程一定越长'], a:1,
   why:'总价 = 单价 × 数量，单价不变时数量越多总价越大；其他说法都缺少条件。'},
  {q:'一支钢笔 15 元，一个笔记本 6 元，买 3 支钢笔的钱最多可以买（　）个笔记本。',
   opts:['6','7','8','9'], a:1,
   why:'15 × 3 = 45（元），45 ÷ 6 = 7……7；买 8 个要 48 元，不够，所以最多买 7 个。'},
  {q:'一本书 28 页，小明每天看 6 页，几天能看完？',
   opts:['4','5','6','7'], a:0, why:'28 ÷ 6 = 4 余 4，要 5 天才能看完。'}
];

const EXT_FILL = [
  {q:'商店运来 5 箱饮料，每箱 48 瓶，卖出 138 瓶后还剩（　）瓶。',
   a:'102', why:'48 × 5 = 240，240 − 138 = 102。'},
  {q:'一辆车 5 小时行 250 千米，照这样计算，8 小时行（　）千米。',
   a:'400', why:'250 ÷ 5 = 50，50 × 8 = 400。'},
  {q:'每套 168 元的演出票，买 8 张，付 1500 元，应找回（　）元。',
   a:'156', why:'168 × 8 = 1344，1500 − 1344 = 156。'},
  {q:'妈妈买了 2 千克排骨和 1 千克鱼，排骨每千克 38 元，鱼每千克 56 元，一共花了（　）元。',
   a:'132', why:'38 × 2 = 76，76 + 56 = 132。'},
  {q:'某校四年级有 3 个班，每班 42 人，五年级人数比四年级多 26 人，五年级有（　）人。',
   a:'152', why:'42 × 3 = 126，126 + 26 = 152。'},
  {q:'一个数的 4 倍比它的 3 倍多 25，这个数是（　）。',
   a:'25', why:'多出来的是 1 倍：25 ÷ (4 − 3) = 25。'}
];

bootCourse([
  {key:'basic', title:'第一档 · 巩固基础（两个模型、三组关系式）', prefix:'基',
   choice:BASIC_CHOICE, fill:BASIC_FILL,
   host:'#basicBlock', score:'#scoreBasic', total:'#totalBasic', reset:'#btnResetBasic'},
  {key:'hand', title:'第二档 · 动手操作（表格填充、选关系式、实际购物）', prefix:'动',
   choice:HAND_CHOICE, fill:HAND_FILL,
   host:'#handBlock', score:'#scoreHand', total:'#totalHand', reset:'#btnResetHand'},
  {key:'ext', title:'第三档 · 扩展思维（两步以上、逆推、变式与陷阱）', prefix:'拓',
   choice:EXT_CHOICE, fill:EXT_FILL,
   host:'#extBlock', score:'#scoreExt', total:'#totalExt', reset:'#btnResetExt'}
]);
