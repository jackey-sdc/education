/* ==========================================================================
   第六单元 条形统计图 —— 交互模块
   --------------------------------------------------------------------------
   每个模块在末尾暴露一个 MOD.xxx 控制器，给讲解脚本一个"绝对状态"入口：
   MOD.sc.set(10) 表示"直接把一格设成 10 人"，而不是"再拖几下"。
   ========================================================================== */
window.MOD = window.MOD || {};

/* 通用：画条形统计图 */
function barChart(svg, opt){
  const o = Object.assign({w:640, h:340, pad:{l:56, r:20, t:34, b:52}, unit:1,
    maxV:null, title:'', yLabel:'', series:[{name:'', color:'#2f6fd0', data:[]}],
    cats:[], grid:true, legend:true, highlight:-1, valueLabels:true}, opt||{});
  const {w, h, pad} = o;
  const maxV = o.maxV || Math.max(...o.series.flatMap(sr => sr.data)) ;
  const top = Math.ceil(maxV / o.unit) * o.unit;
  const cw = (w - pad.l - pad.r) / o.cats.length;
  const chartH = h - pad.t - pad.b;
  const yOf = v => pad.t + chartH - (v / top) * chartH;
  /* 标题 */
  if (o.title) label(svg, w / 2, 20, o.title, {size:17, weight:800, fill:'#20304a'});
  /* 网格与纵轴刻度 */
  if (o.grid){
    for (let v = 0; v <= top; v += o.unit){
      const y = yOf(v);
      s('line', {x1:pad.l, y1:y, x2:w - pad.r, y2:y, stroke: v === 0 ? '#8fa3bd' : '#eef2f8',
        'stroke-width': v === 0 ? 1.6 : 1}, svg);
      haloText(svg, pad.l - 10, y, String(v), null, {size:12, fill:'#4b5f7d', rot:false});
    }
  }
  /* 纵轴单位 */
  if (o.yLabel) label(svg, pad.l - 10, pad.t - 16, o.yLabel, {size:12, fill:'#4b5f7d', anchor:'end'});
  /* 直条 */
  const nS = o.series.length;
  const barW = Math.min(34, (cw * 0.62) / nS);
  o.cats.forEach((c, ci) => {
    o.series.forEach((sr, si) => {
      const v = sr.data[ci];
      if (v === undefined) return;
      const cx = pad.l + cw * ci + cw / 2;
      const x = cx - (nS * barW + (nS - 1) * 4) / 2 + si * (barW + 4);
      const y = yOf(v);
      const hl = o.highlight === ci;
      s('rect', {x, y, width:barW, height:pad.t + chartH - y, rx:3,
        fill:hl ? '#f08a24' : sr.color, opacity:hl ? 1 : 0.92}, svg);
      if (o.valueLabels) haloText(svg, x + barW / 2, y - 9, String(v), null,
        {size:12.5, fill:hl ? '#b35c00' : sr.color, rot:false});
    });
    /* 横轴标签 */
    haloText(svg, pad.l + cw * ci + cw / 2, h - pad.b + 18, c, null, {size:13, fill:'#20304a', rot:false});
  });
  /* 图例 */
  if (o.legend && nS > 0){
    let lx = pad.l;
    o.series.forEach(sr => {
      s('rect', {x:lx, y:h - 18, width:14, height:14, rx:3, fill:sr.color}, svg);
      label(svg, lx + 20, h - 7, sr.name, {size:12.5, fill:'#4b5f7d', anchor:'start'});
      lx += 26 + sr.name.length * 13;
    });
  }
  return {yOf, cw, top};
}

/* ==========================================================================
   ① 单式条形统计图
   ========================================================================== */
(function initSingle(){
  const unit = $('#scUnit'), lab = $('#scLabel'), stage = $('#scStage'), note = $('#scNote');
  const CATS = ['足球', '篮球', '跳绳', '毽子', '其他'];
  const DATA = [28, 22, 18, 12, 6];
  function render(){
    const u = +unit.value;
    const maxV = Math.max(...DATA);
    const top = Math.ceil(maxV / u) * u;
    lab.textContent = `1 格代表 ${u} 人`;
    stage.innerHTML = '';
    const svg = s('svg', {viewBox:'0 0 640 340', width:640, height:340});
    stage.appendChild(svg);
    barChart(svg, {cats:CATS, unit:u, maxV:top,
      title:'四年级同学最喜欢的运动人数统计', yLabel:'人数',
      series:[{name:'人数', color:'#0e8fa8', data:DATA}]});
    note.innerHTML = `<b>四要素</b>：标题、横轴（项目）、纵轴（单位：人数）、直条。<br>` +
      `本图 <b>1 格代表 ${u} 人</b>，纵轴一共到 ${top} 人。<b>数据最大是 ${maxV}，所以至少要画到 ${Math.ceil(maxV/u)*u}</b>——` +
      `直条不能超出纵轴的最高格。<br><b>画图要求</b>：直条<b>宽窄一样</b>、<b>间隔相同</b>、都从 0 起画。`;
  }
  unit.addEventListener('input', render);
  $('#btnScReset').addEventListener('click', () => { unit.value = 1; render(); });
  render();

  /* 讲解控制器：1 格代表 1–10 人 */
  MOD.sc = {
    set(u){ unit.value = String(Math.max(1, Math.min(10, u | 0))); render(); },
    get unit(){ return +unit.value; }
  };
})();

/* ==========================================================================
   ② 复式条形统计图
   ========================================================================== */
(function initDouble(){
  const stage = $('#dbStage'), note = $('#dbNote'), steps = $('#dbSteps');
  const CATS = ['周一', '周二', '周三', '周四', '周五'];
  const A = [20, 25, 22, 30, 28];
  const B = [15, 18, 20, 24, 26];
  let step = 0;
  function render(){
    stage.innerHTML = '';
    const svg = s('svg', {viewBox:'0 0 640 340', width:640, height:340});
    stage.appendChild(svg);
    const shown = step >= 5 ? 2 : (step >= 3 ? 1 : 0);
    const series = [];
    if (shown >= 1) series.push({name:'四（1）班', color:'#0e8fa8', data:A});
    if (shown >= 2) series.push({name:'四（2）班', color:'#f08a24', data:B});
    barChart(svg, {cats:CATS, unit:5, maxV:30,
      title:'四（1）班与四（2）班每天课外阅读时间', yLabel:'分钟',
      series:series.length ? series : [{name:'', color:'#cfdcee', data:[0,0,0,0,0]}],
      valueLabels: shown >= 2});
    const msgs = [
      '第 ① 步：确定<b>标题</b>和<b>横轴项目</b>（星期），选好<b>纵轴单位</b>（1 格代表 5 分钟）。',
      '第 ② 步：先画<b>四（1）班</b>的直条：周一 20 分钟、周二 25 分钟……',
      '第 ③ 步：在每个项目旁边画<b>四（2）班</b>的直条，两组直条<b>并排</b>、宽窄一致。',
      '第 ④ 步：写上<b>图例</b>，让人知道哪种颜色表示哪个班。',
      '第 ⑤ 步：检查——纵轴到 30 分钟够吗？直条有没有超出？图例写了吗？'
    ];
    steps.innerHTML = ['①定标题','②画一组','③画另一组','④写图例','⑤检查']
      .map((l, i) => `<div class="dot ${i < step ? 'done' : (i === step ? 'on' : '')}" title="${l}">${i+1}</div>`).join('');
    /* 图上标一行当前状态：讲解跳拍时，学生一眼知道"现在画到哪一步" */
    const cap = document.createElement('div');
    cap.style.cssText = 'text-align:center;font-size:14px;color:#93a1b5;margin-top:6px';
    cap.textContent = ['空图：先定标题和两条轴','标题与横轴项目','确认纵轴单位（1 格 5 分钟）',
      '先画四（1）班','四（1）班画完','四（2）班并排画上','加图例，再检查'][Math.min(step, 6)];
    stage.appendChild(cap);
    note.innerHTML = msgs[Math.min(step, msgs.length - 1)];
  }
  $('#btnDbStep').addEventListener('click', () => { step = (step + 1) % 6; render(); });
  $('#btnDbAll').addEventListener('click', () => { step = 6; render(); });
  $('#btnDbReset').addEventListener('click', () => { step = 0; render(); });
  render();

  /* 讲解控制器：0 空图 → 1 标题与轴 → 3 一组直条 → 5 两组并排 → 6 图例与检查 */
  MOD.db = {
    set(n){ step = Math.max(0, Math.min(6, n | 0)); render(); },
    get step(){ return step; }
  };
})();

/* ==========================================================================
   ③ 数据的收集与整理
   ========================================================================== */
(function initCollect(){
  const stage = $('#clStage'), note = $('#clNote'), steps = $('#clSteps');
  const ITEMS = ['苹果', '香蕉', '橙子', '葡萄', '草莓'];
  const COUNTS = [12, 18, 9, 15, 6];
  let step = 0;
  function render(){
    stage.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.style.cssText = 'width:100%;max-width:640px';
    if (step === 0){
      const d = document.createElement('div');
      d.style.cssText = 'font-size:17px;line-height:2';
      d.innerHTML = '<b>第 ① 步：明确调查目的与对象。</b><br>' +
        '问题："四年级同学最喜欢吃哪种水果？"　对象：四年级全体同学<br>' +
        '方法：每人只能选一种，用<b>投票（举手）</b>的方式记录。';
      wrap.appendChild(d);
    } else if (step === 1){
      const d = document.createElement('div');
      d.style.cssText = 'font-size:17px;line-height:2';
      d.innerHTML = '<b>第 ② 步：记录数据（用"正"字记录）。</b><br>' +
        '<div style="background:#fff;border:1px solid var(--line);border-radius:10px;padding:12px 16px;margin-top:8px">' +
        ITEMS.map((it, i) => `<div>${it}：${'正'.repeat(Math.ceil(COUNTS[i]/5))} ${COUNTS[i]}</div>`).join('') +
        '</div>';
      wrap.appendChild(d);
    } else if (step === 2){
      const d = document.createElement('div');
      d.style.cssText = 'font-size:17px;line-height:2';
      d.innerHTML = '<b>第 ③ 步：整理成统计表。</b><br>' +
        '<table class="plain" style="margin-top:8px"><tr><th>水果</th>' +
        ITEMS.map(i => `<th>${i}</th>`).join('') + '</tr>' +
        '<tr><td class="l">人数</td>' + COUNTS.map(c => `<td>${c}</td>`).join('') + '</tr></table>';
      wrap.appendChild(d);
    } else {
      const svg = s('svg', {viewBox:'0 0 640 340', width:640, height:340});
      wrap.appendChild(svg);
      barChart(svg, {cats:ITEMS, unit:2, maxV:20,
        title:'四年级同学最喜欢吃的水果人数统计', yLabel:'人数',
        series:[{name:'人数', color:'#0e8fa8', data:COUNTS}]});
    }
    stage.appendChild(wrap);
    steps.innerHTML = ['①定目的','②记数据','③整成表','④画统计图']
      .map((l, i) => `<div class="dot ${i < step ? 'done' : (i === step ? 'on' : '')}" title="${l}">${i+1}</div>`).join('');
    const msgs = [
      '调查统计一般分四步：<b>确定调查目的 → 记录数据 → 整理成统计表 → 画统计图</b>。',
      '记录数据可以用<b>"正"字法</b>，每人在相应的水果下面画一笔"正"，最后数一数有几笔。',
      '把数据<b>整理成统计表</b>，一眼就能看清各项目的多少。',
      '最后画成<b>条形统计图</b>，直条的高度表示人数的多少。'
    ];
    note.innerHTML = msgs[Math.min(step, msgs.length - 1)];
  }
  $('#btnClStep').addEventListener('click', () => { step = (step + 1) % 4; render(); });
  $('#btnClReset').addEventListener('click', () => { step = 0; render(); });
  render();

  /* 讲解控制器：0 定目的 → 1 正字记录 → 2 统计表 → 3 统计图 */
  MOD.cl = {
    set(n){ step = Math.max(0, Math.min(3, n | 0)); render(); },
    get step(){ return step; }
  };
})();

/* ==========================================================================
   ④ 读图分析
   ========================================================================== */
(function initRead(){
  const stage = $('#rdStage'), note = $('#rdNote');
  const A = [20, 25, 22, 30, 28], B = [15, 18, 20, 24, 26];
  const CATS = ['周一', '周二', '周三', '周四', '周五'];
  const QS = [
    {q:'四（1）班周四阅读多长时间？', a:'30 分钟', why:'看四（1）班（蓝色）周四的直条，正好到 30。'},
    {q:'哪一天两个班阅读时间相差最大？', a:'周二', why:'周一 20 − 15 = 5，周二 25 − 18 = 7，周三 22 − 20 = 2，周四 30 − 24 = 6，周五 28 − 26 = 2，最大是周二的 7 分钟。'},
    {q:'四（2）班五天共阅读多少分钟？', a:'103 分钟', why:'15 + 18 + 20 + 24 + 26 = 103。'},
    {q:'四（1）班比四（2）班阅读时间多吗？为什么用复式统计图？', a:'多，复式图能直接比', why:'四（1）班每天都比四（2）班多；复式条形统计图把两组数据放在一起，一眼就能比较。'}
  ];
  let idx = 0, showDiff = false;
  const DIFF = A.map((a, i) => a - B[i]);
  const MAX_D = Math.max(...DIFF), MAX_I = DIFF.indexOf(MAX_D);
  function render(){
    stage.innerHTML = '';
    const svg = s('svg', {viewBox:'0 0 640 340', width:640, height:340});
    stage.appendChild(svg);
    barChart(svg, {cats:CATS, unit:5, maxV:30,
      title:'四（1）班与四（2）班每天课外阅读时间', yLabel:'分钟',
      series:[{name:'四（1）班', color:'#0e8fa8', data:A},
              {name:'四（2）班', color:'#f08a24', data:B}]});
    const q = document.createElement('div');
    q.style.cssText = 'font-size:18px;font-weight:700;text-align:center;margin-top:8px';
    q.textContent = showDiff ? '盘点：每天相差多少分钟？' : `问题 ${idx + 1}：${QS[idx].q}`;
    stage.appendChild(q);
    if (showDiff){
      const cap = document.createElement('div');
      cap.style.cssText = 'text-align:center;font-size:13.5px;color:#93a1b5;margin-top:6px';
      cap.textContent = '蓝色减橙色（分钟）';
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;gap:18px;justify-content:center;flex-wrap:wrap;margin-top:2px;font-size:15.5px;font-weight:700';
      CATS.forEach((c, i) => {
        const sp = document.createElement('span');
        const hot = DIFF[i] === MAX_D;
        sp.innerHTML = `${c} <b style="color:${hot ? '#d94a4a' : '#20304a'}">${DIFF[i]}</b>`;
        row.appendChild(sp);
      });
      stage.append(cap, row);
    }
    note.innerHTML = showDiff
      ? `<b>五天差值</b>：${DIFF.join(' / ')}，最大是 <b>${MAX_D}</b>，在<b>${CATS[MAX_I]}</b>。` +
        `要逐日比完才知道谁最大，不能只看某一天。`
      : `<b>分析</b>：${QS[idx].a}。${QS[idx].why}`;
  }
  $('#btnRdStep').addEventListener('click', () => { idx = (idx + 1) % QS.length; showDiff = false; render(); });
  $('#btnRdReset').addEventListener('click', () => { idx = 0; showDiff = false; render(); });
  render();

  /* 讲解控制器：set(i) 切问题；diffs(true) 打开"五天差值盘点"视图 */
  MOD.rd = {
    set(i){ idx = Math.max(0, Math.min(QS.length - 1, i | 0)); showDiff = false; render(); },
    diffs(on){ showDiff = !!on; render(); },
    get idx(){ return idx; },
    get diffMode(){ return showDiff; }
  };
})();

/* ==========================================================================
   分层练习数据
   ========================================================================== */
const BASIC_CHOICE = [
  {q:'条形统计图中，1 格表示 5 人，某直条高 4 格，表示（　）人。',
   opts:['4','9','20','25'], a:2, why:'4 × 5 = 20 人。'},
  {q:'画条形统计图时，下面做法正确的是（　）。',
   opts:['直条宽窄可以不一样','直条间隔可以随便定','直条要一样宽、间隔相同，且不能超出纵轴',
         '纵轴上的格子数可以比最大数据小'], a:2,
   why:'这是画条形统计图的基本要求。'},
  {q:'统计图上画的是四年级各班人数，横轴表示的是（　）。',
   opts:['人数','班级','单位','标题'], a:1, why:'横轴表示项目（班级），纵轴表示数量（人数）。'},
  {q:'要看两个班参加社团的人数多少，最好选用（　）。',
   opts:['单式条形统计图','复式条形统计图','统计表就行','折线统计图'], a:1,
   why:'复式条形统计图能同时表示两组数据，方便比较。'},
  {q:'条形统计图中，直条的高度表示（　）。',
   opts:['数量的多少','项目的名称','单位','图例'], a:0, why:'直条越高，表示这一项目的数量越多。'},
  {q:'下面说法正确的是（　）。',
   opts:['直条越长，说明这个班人数越少','纵轴上 1 格代表的数越大，直条就越矮',
         '统计图能反映数量的多少','条形统计图能看出变化趋势'], a:2,
   why:'条形统计图能一眼看出数量的多少；折线统计图才看变化趋势。'}
];

const BASIC_FILL = [
  {q:'条形统计图一般包括（　）、（　）、（　）和直条。',
   a:['标题','横轴项目','纵轴'], why:'四要素。'},
  {q:'1 格代表 10 本，某个直条高 7 格，表示（　）本。', a:'70', why:'7 × 10 = 70。'},
  {q:'1 格代表 2 人，某直条高 9 格，表示（　）人。', a:'18', why:'9 × 2 = 18。'},
  {q:'画条形统计图时，纵轴最高格必须不小于数据中的（　）。', a:'最大数',
   why:'否则直条会画出图外。'},
  {q:'两个班参加同一社团的人数分别是 18 人和 24 人，相差（　）人。', a:'6', why:'24 − 18 = 6。'},
  {q:'统计图中一个直条高 12 格，1 格代表 3 人，表示（　）人。', a:'36', why:'12 × 3 = 36。'}
];

const HAND_CHOICE = [
  {q:'要表示一周中每天的最高气温变化，选用（　）比较合适。',
   opts:['条形统计图','折线统计图','统计表','扇形统计图'], a:1,
   why:'条形统计图能看出数量的多少，折线统计图能看出**变化趋势**。' +
       '本题问的是"每天最高气温的**变化**"，所以要选<b>折线统计图</b>。'},
  {q:'一个统计图中，1 格表示 5 人，某直条高 8 格，要改成 1 格表示 10 人，这个直条应该画（　）格高。',
   opts:['4','8','16','20'], a:0, why:'数量不变：8 × 5 = 40 人，40 ÷ 10 = 4 格。'},
  {q:'下面是四（1）班参加社团人数统计：足球 12、篮球 15、合唱 9、手工 6。人数最多的比最少的多（　）人。',
   opts:['3','6','9','12'], a:2, why:'15 − 6 = 9。'}
];

const HAND_FILL = [
  {q:'下面是一（1）班图书角借书情况：故事书 26 本、科技书 18 本、连环画 12 本。借科技书的比借连环画的多（　）本。',
   a:'6', why:'18 − 12 = 6。'},
  {q:'一（1）班共有 45 人，每人只参加一个兴趣小组。参加数学兴趣小组的 18 人，参加英语兴趣小组的 15 人，两组都没参加的有（　）人。',
   a:'12', why:'每人只参加一个小组，所以参加兴趣小组的共 18 + 15 = 33 人；45 − 33 = 12（人）。'},
  {q:'某商店本月卖出运动鞋 120 双，凉鞋 85 双，运动鞋比凉鞋多卖（　）双。', a:'35', why:'120 − 85 = 35。'},
  {q:'统计图中 1 格代表 20 个，两根直条分别高 5 格和 3 格，两数相差（　）个。', a:'40',
   why:'(5 − 3) × 20 = 40。'},
  {q:'把"1 格代表 5 人"改成"1 格代表 10 人"，原来高 6 格的直条要画（　）格高。', a:'3',
   why:'6 × 5 = 30 人，30 ÷ 10 = 3 格。'},
  {q:'四（1）班 30 人，平均每组 6 人，可以分成（　）组。', a:'5', why:'30 ÷ 6 = 5。'}
];

const EXT_CHOICE = [
  {q:'两组数据要比较"相差多少"，用复式条形统计图比单式的优势是（　）。',
   opts:['画起来更快','两组数据放在一起，可以直接比高低',
         '看起来更好看','能表示变化趋势'], a:1, why:'复式图把两组直条并排，一眼比出高低。', point:'复式条形统计图：两组数据**并排**放，可以直接比高低', care:'单式只能看一组；复式也不能表示变化趋势（那是折线图）'},
  {q:'在复式条形统计图中，同一项目的甲直条比乙直条高，说明（　）。',
   opts:['甲这个项目的数量比乙多','甲的数据总量一定比乙大','甲的平均数一定比乙大','无法判断'], a:0,
   why:'同一项目的两根直条直接比较，甲更高就表示这个项目甲的数量更多；但不能据此直接判断总量或平均数。', point:'复式条形图先看**同一项目**的两根直条', care:'只比较同一项目：甲直条高，说明这个项目甲多；不要越级判断总量或平均数'},
  {q:'统计图中，一共有 5 个项目，1 格代表 4 人，其中最高的直条高 15 格，这一项有（　）人。',
   opts:['15','45','60','75'], a:2, why:'15 × 4 = 60。', point:'看统计图要**先看清每格代表几**', care:'15 格 × 4 人 = 60 人；别直接答 15'},
  {q:'下面各统计图中，能看出数量多少但看不出变化趋势的是（　）。',
   opts:['条形统计图','折线统计图','扇形统计图','统计表'], a:0,
   why:'条形统计图用直条高度表示数量多少。', point:'条形统计图擅长**比数量**，折线统计图擅长看**变化趋势**', care:'扇形统计图看的是各部分占总数的**百分比**'}
];

const EXT_FILL = [
  {q:'四（1）班 45 人，四（2）班 48 人，两个班一共（　）人。', a:'93', why:'45 + 48 = 93。', point:'求和', care:'45 + 48 = 93'},
  {q:'某班平均每人捐书 3 本，全班 40 人，一共捐（　）本。', a:'120', why:'3 × 40 = 120。', point:'总数 = 平均数 × 份数', care:'3 × 40 = 120'},
  {q:'统计图记录了 5 天的人数，分别是 12、15、18、15、20，最多的比最少的多（　）人。',
   a:'8', why:'20 − 12 = 8。', point:'从数据里找**最大**和**最小**再相减', care:'最多 20，最少 12，20 − 12 = 8'},
  {q:'两个班的图书角藏书分别是 128 本和 96 本，如果每个班都借出 35 本，两个班一共借出（　）本。',
   a:'70', why:'35 × 2 = 70。', point:'**乘法分配律的雏形**：每班借出同样多，就是 35 × 2', care:'35 × 2 = 70；别去减 128 和 96（那是剩下的，不是借出的）'},
  {q:'4 个数的平均数是 15，增加一个数 20 后，新的 5 个数的平均数是（　）。', a:'16',
   why:'原来 4 个数的和是 15 × 4 = 60，加上 20 得 80，80 ÷ 5 = 16。', point:'**倒推**：先算原来的总和，再加新数，再除以新的份数', care:'15 × 4 = 60，60 + 20 = 80，80 ÷ 5 = 16；份数从 4 变成 5 了', steps:['原来 4 个数的总和：15 × 4 = 60', '加上 20：60 + 20 = 80', '新的份数是 5：80 ÷ 5 = 16']},
  {q:'四（1）班和四（2）班参加航模小组的人数分别是 24 人和 18 人，如果每 3 人分成一组，两班一共能分成（　）组。',
   a:'14', why:'(24 + 18) ÷ 3 = 42 ÷ 3 = 14（组）。', point:'先求总人数，再按每组人数分组', care:'24 + 18 = 42（人），42 ÷ 3 = 14（组）；别分别算完再相加'}
];

const STAR5_CHOICE = [
  {q:'一组数据 12、15、18、15、20 的平均数是（　）。', opts:['15', '16', '17', '18'], a:1,
   why:'先求总和：12 + 15 + 18 + 15 + 20 = <b>80</b>。' +
       '再除以份数：80 ÷ 5 = <b>16</b>。',
   point:'求平均数：先求**总和**，再除以**份数**',
   care:'别直接拿中间那个数 18 除以 2',
   steps:['总和：12 + 15 + 18 + 15 + 20 = 80', '平均数：80 ÷ 5 = 16']},
  {q:'把 12、15、18、15、20 这组数据中的一个 15 改成 20，平均数（　）。', opts:['增大 1', '减小 1', '不变', '增大 0.5'], a:0,
   why:'总和增加了 20 − 15 = <b>5</b>，份数仍是 5 个。' +
       '平均数增加 5 ÷ 5 = <b>1</b>，所以平均数<b>增大 1</b>。' +
       '（原平均数 16，新平均数 17）',
   point:'平均数的变化量 = 变化量 ÷ 份数',
   care:'份数没变（还是 5 个数）；总和多 5，平均数多 5 ÷ 5 = 1',
   steps:['总和增加 20 − 15 = 5', '份数仍是 5', '平均数增加 5 ÷ 5 = 1，所以平均数增大 1']},
  {q:'两个班人数分别是 24 人和 18 人，平均每班（　）人。', opts:['21 人', '42 人', '20 人', '19 人'], a:0,
   why:'先求总人数：24 + 18 = <b>42</b>（人）。' +
       '再除以班数：42 ÷ 2 = <b>21</b>（人）。' +
       '注意是"平均每班"，份数是 2（班），不是 42（人）。',
   point:'先求总人数再平均；"平均每班"的份数是**班数**',
   care:'别用 24 ÷ 2；先 24 + 18 = 42，再 42 ÷ 2 = 21',
   steps:['总人数：24 + 18 = 42（人）', '平均每班：42 ÷ 2 = 21（人）']},
  {q:'统计图中 1 格代表 4 人，某一直条高 15 格，它表示（　）人。', opts:['15 人', '60 人', '19 人', '45 人'], a:1,
   why:'先看清<b>每格代表几</b>：1 格 = 4 人。' +
       '15 格 × 4 人 = <b>60</b> 人。',
   point:'看统计图先看清**每格代表几**',
   care:'15 格 × 4 = 60，不是 15 + 4 也不是 15 × 4 × …',
   steps:['1 格 = 4 人', '15 格 × 4 人 = 60 人']},
  {q:'把甲、乙两组数据画成复式条形统计图，两组的直条画在同一格子里，这样做的优点是（　）。', opts:['画起来更快', '可以直接比较两组数据的高低', '看起来更好看', '能看出变化趋势'], a:1,
   why:'复式条形统计图把两组数据<b>并排画在一起</b>，同一个项目的两根直条一比高低。' +
       '所以优点是<b>可以直接比较两组数据的高低</b>。' +
       '它不能表示变化趋势（那是折线统计图的本领）。',
   point:'复式条形图把两组数据**并排**画，同一项目的两根直条一比高低',
   care:'它**不能**表示变化趋势（那是折线统计图的本领）',
   steps:['两组直条画在同一格子里 → 同一项目可以直接比高低', '所以优点是可以直接比较两组数据的高低']},
  {q:'下面说法<b>错误</b>的是（　）。', opts:['条形统计图能看出数量的多少', '折线统计图能看出变化趋势', '扇形统计图能看出各部分占总数的百分比', '复式条形统计图能看出变化趋势'], a:3,
   why:'D 错：<b>折线</b>统计图才能看出变化趋势，复式条形图看的是两组数据的高低。',
   point:'辨析三种统计图各自的**本领**',
   care:'看变化趋势要用**折线**统计图，复式条形图看的是高低',
   steps:['D 错：复式条形统计图能看出两组数据的高低，但看不出变化趋势', 'A、B、C 都正确']},
];

const STAR5_FILL = [
  {q:'五个数的平均数是 18，它们的总和是（　）。', a:'90',
   why:'总和 = 平均数 × 份数 = 18 × 5 = <b>90</b>。',
   point:'总和 = 平均数 × 份数',
   care:'18 × 5 = 90',
   steps:['总和 = <b>平均数 × 份数</b>。', '18 × 5 = <b>90</b>。']},
  {q:'六个数的平均数是 20，去掉一个数后剩下 5 个数的平均数是 19，去掉的数是（　）。', a:'25',
   why:'原来总和：20 × 6 = 120。' +
       '剩下总和：19 × 5 = 95。' +
       '去掉的数 = 120 − 95 = <b>25</b>。',
   point:'平均数**逆推**：分别算两边总和再相减',
   care:'份数变了（6 → 5），别用同一个份数',
   steps:['原来总和：20 × 6 = 120', '剩下总和：19 × 5 = 95', '去掉的数 = 120 − 95 = 25']},
  {q:'统计图记录了 5 天的人数：12、15、18、15、20，这组数据的平均数是（　）。', a:'16',
   why:'总和：12 + 15 + 18 + 15 + 20 = 80。' +
       '平均数：80 ÷ 5 = <b>16</b>。',
   point:'先求总和再除以份数',
   care:'份数是 5（5 天）',
   steps:['总和 = 80', '80 ÷ 5 = 16']},
  {q:'四（1）班 45 人，四（2）班 48 人，两个班平均每班（　）人。', a:'46.5',
   why:'总人数：45 + 48 = 93（人）。' +
       '平均每班：93 ÷ 2 = <b>46.5</b>（人）。',
   point:'总人数 ÷ 班数',
   care:'45 + 48 = 93，93 ÷ 2 = 46.5（可能不是整数）',
   steps:['总人数：45 + 48 = 93（人）', '93 ÷ 2 = 46.5（人）']},
  {q:'一组数据 12、15、18、15、20 的平均数是 16，把其中最小的 12 改成 18，平均数变成（　）。', a:'17.2',
   why:'总和：12 + 15 + 18 + 15 + 20 = 80。' +
       '把 12 换成 18，总和变成 80 − 12 + 18 = 86。' +
       '新平均数：86 ÷ 5 = <b>17.2</b>。',
   point:'**替换法**：先改总和，再除以份数',
   care:'份数仍是 5；总和要减 12 再加 18',
   steps:['原总和 = 80', '改成 18 后总和 = 80 − 12 + 18 = 86', '86 ÷ 5 = 17.2']},
  {q:'两个班共 42 人，每 4 人分成一组，一共能分成（　）组。', a:'11',
   why:'42 ÷ 4 = 10……2，剩下的 2 人也要单独一组。' +
       '所以要 10 + 1 = <b>11</b> 组（进一法）。',
   point:'**进一法**：剩下的人也要单独一组',
   care:'42 ÷ 4 = 10……2，剩 2 人还要 1 组 → 11 组',
   steps:['42 ÷ 4 = 10……2', '剩下的 2 人也要单独一组', '10 + 1 = 11（组）']},
];

bootCourse([
  {key:'basic', star:3, title:'第一档 · 巩固基础（统计图的要素与读数）', prefix:'基',
   choice:BASIC_CHOICE, fill:BASIC_FILL,
   host:'#basicBlock', score:'#scoreBasic', total:'#totalBasic', reset:'#btnResetBasic'},
  {key:'hand', star:3, title:'第二档 · 动手操作（填表、换算单位、选统计图）', prefix:'动',
   choice:HAND_CHOICE, fill:HAND_FILL,
   host:'#handBlock', score:'#scoreHand', total:'#totalHand', reset:'#btnResetHand'},
  {key:'ext', star:4, title:'第三档 · 扩展思维（复式图分析、平均数、综合）', prefix:'拓',
   choice:EXT_CHOICE, fill:EXT_FILL,
   host:'#extBlock', score:'#scoreExt', total:'#totalExt', reset:'#btnResetExt'},
  {key:'star5', title:'第四档 · 五星挑战 · 浅奥思维（数据推断 · 平均数 · 图表辨析）', prefix:'奥', star:5,
   choice:STAR5_CHOICE, fill:STAR5_FILL,
   host:'#star5Block', score:'#scoreStar5', total:'#totalStar5', reset:'#btnResetStar5'}
]);
