/* ==========================================================================
   共享引擎：DOM/SVG 工具 + 分层练习引擎 + 答案区生成
   —— 所有单元课件共用（构建时内联进各自的 index.html）
   ========================================================================== */
'use strict';
const $  = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => [...(r || document).querySelectorAll(s)];

/* ---------------- SVG 基础 ---------------- */
const SVGNS = 'http://www.w3.org/2000/svg';
function s(tag, attrs, parent){
  const n = document.createElementNS(SVGNS, tag);
  for (const k in (attrs||{})) if (attrs[k] !== undefined && attrs[k] !== null) n.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(n);
  return n;
}
function clear(node){ while(node && node.firstChild) node.removeChild(node.firstChild); }

/* 角度约定：数学正方向 = 逆时针为正；SVG 的 y 轴向下，换算时翻 y */
function polar(cx, cy, r, deg){
  const a = deg * Math.PI / 180;
  return [cx + r * Math.cos(a), cy - r * Math.sin(a)];
}
/* 数学逆时针弧：sweep 固定 0；large-arc-flag 由跨角是否大于 180° 决定 */
function arcPoints(cx, cy, r, startDeg, spanDeg){
  const p1 = polar(cx, cy, r, startDeg), p2 = polar(cx, cy, r, startDeg + spanDeg);
  const large = spanDeg > 180 ? 1 : 0;
  return { p1, p2, d:`M ${p1[0]} ${p1[1]} A ${r} ${r} 0 ${large} 0 ${p2[0]} ${p2[1]}` };
}
/* 圆周数字：沿切向旋转 + 白色描边光晕，避免被射线/指针压住 */
function haloText(parent, x, y, str, deg, opt){
  const o = Object.assign({size:13, fill:'#20304a', rot:true}, opt||{});
  const t = s('text', {x, y, 'font-size':o.size, fill:o.fill, 'text-anchor':'middle',
    'dominant-baseline':'central', 'paint-order':'stroke', stroke:'#fff',
    'stroke-width':3.5, 'stroke-linejoin':'round'}, parent);
  if (o.rot && deg !== undefined && deg !== null) t.setAttribute('transform', `rotate(${deg - 90} ${x} ${y})`);
  t.textContent = str;
  return t;
}
function label(parent, x, y, str, opt){
  const o = Object.assign({size:14, fill:'#20304a', anchor:'middle', weight:600}, opt||{});
  const t = s('text', {x, y, 'font-size':o.size, fill:o.fill, 'text-anchor':o.anchor,
    'font-weight':o.weight}, parent);
  t.textContent = str;
  return t;
}
function fmt(n){ return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }


/* ---------------- 画一个角（通用） ---------------- */
/* vertex=(vx,vy)，a1/a2 为两条边的极角（度，逆时针为正） */
function drawAngle(svg, vx, vy, a1, a2, opt){
  const o = Object.assign({r:120, color:'#2f6fd0', arc:true, arcColor:'#f08a24',
    arcR:34, label:null, lw:3, dash:null}, opt||{});
  const p1 = polar(vx, vy, o.r, a1), p2 = polar(vx, vy, o.r, a2);
  s('line', {x1:vx, y1:vy, x2:p1[0], y2:p1[1], stroke:o.color, 'stroke-width':o.lw,
    'stroke-linecap':'round', 'stroke-dasharray':o.dash || ''}, svg);
  s('line', {x1:vx, y1:vy, x2:p2[0], y2:p2[1], stroke:o.color, 'stroke-width':o.lw,
    'stroke-linecap':'round', 'stroke-dasharray':o.dash || ''}, svg);
  if (o.arc){
    let start = a1, span = a2 - a1;
    if (span < 0){ start = a2; span = -span; }   /* 走短弧 */
    if (span > 360) span = 360;
    const arc = arcPoints(vx, vy, o.arcR, start, span);
    s('path', {d:arc.d, fill:'none', stroke:o.arcColor, 'stroke-width':3.5,
      'stroke-linecap':'round'}, svg);
    const mid = polar(vx, vy, o.arcR, start + span/2);
    if (o.label) haloText(svg, mid[0], mid[1], o.label, null, {size:15, fill:'#b35c00'});
  }
  s('circle', {cx:vx, cy:vy, r:4.5, fill:o.color}, svg);
  return {p1, p2};
}

/* ---------------- 答案归一化 ---------------- */
const CN_D = {'零':0,'〇':0,'一':1,'二':2,'两':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9};
const CN_U = {'十':10,'百':100,'千':1000};
/* 中文数字 → 阿拉伯数字（支持 三千五百万 / 十二万 / 3千万 / 3.5万 等混写） */
function cn2num(str){
  const toks = str.match(/\d+(?:\.\d+)?|[零〇一二两三四五六七八九十百千万亿]/g) || [];
  let out = 0, section = 0, num = 0;
  for (const t of toks){
    if (/^\d/.test(t)) num = parseFloat(t);
    else if (t in CN_D) num = CN_D[t];
    else if (t in CN_U){ section += (num || 1) * CN_U[t]; num = 0; }
    else if (t === '万'){ section = (section + num) * 10000; out += section; section = 0; num = 0; }
    else if (t === '亿'){ out = (out + section + num) * 100000000; section = 0; num = 0; }
  }
  return out + section + num;
}
function norm(v){
  let t = String(v).trim();
  t = t.replace(/[０-９]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0));
  if (/[零〇一二两三四五六七八九十百千万亿]/.test(t)){
    const v2 = cn2num(t); t = (Number.isFinite(v2) ? String(v2) : t);
  }
  t = t.replace(/\s/g, '')
       .replace(/[，。、；：]/g, '')
       .replace(/[，,]/g, '')
       .replace(/[．。]/g, '.')
       .replace(/[（(]/g, '(').replace(/[）)]/g, ')')
       .replace(/[×xX*]/g, '*').replace(/[÷]/g, '/')
       .replace(/[＝=]/g, '=')
       .replace(/[约≈]/g, '')
       .replace(/[度°]/g, '')
       .replace(/平方千米/g, 'km2').replace(/平方千米/g, 'km2')
       .replace(/平方厘米/g, 'cm2').replace(/平方分米/g, 'dm2').replace(/平方米/g, 'm2')
       .replace(/平方毫米/g, 'mm2')
       .replace(/千米|公里/g, 'km').replace(/米/g, 'm')
       .replace(/公顷/g, 'ha')
       .replace(/时/g, 'h').replace(/分/g, 'min').replace(/秒/g, 's')
       .replace(/元/g, 'yuan');
  return t;
}

/* ==========================================================================
   练习引擎
   item: { q, opts?[], a:index | index[] | string | string[], why, hint }
   ========================================================================== */
const LETTERS = ['A','B','C','D','E','F'];
function makeCounter(scoreId, totalId, total){
  return { ok:0, total, scoreEl:$(scoreId), totalEl:$(totalId) };
}
function updateCounter(c){
  if (!c) return;
  if (c.scoreEl) c.scoreEl.textContent = c.ok;
  if (c.totalEl) c.totalEl.textContent = c.total;
}

/* 把一组题目渲染进 host；返回重做函数 */
function mountQuizInto(host, items, c, prefix, offset){
  clear(host);
  const state = items.map(()=>({done:false, ok:false}));
  const isChoice = it => Array.isArray(it.opts) && it.opts.length;
  const optsOf  = it => (it.opts||[]).map(o => typeof o === 'string' ? o : (o.t || ''));

  items.forEach((q, i) => {
    const box = document.createElement('div'); box.className = 'q';
    const qt = document.createElement('div'); qt.className = 'qt';
    qt.innerHTML = `<span class="qno">${prefix}${i + 1 + offset}</span>${q.q}`;
    box.appendChild(qt);
    const fb = document.createElement('div'); fb.className = 'fb';

    if (isChoice(q)){
      const opts = document.createElement('div'); opts.className = 'opts';
      optsOf(q).forEach((o, k) => {
        const d = document.createElement('div'); d.className = 'opt'; d.dataset.k = k;
        d.innerHTML = `<span class="k">${LETTERS[k]}.</span><span>${o}</span>`;
        d.addEventListener('click', () => choose(k, d));
        opts.appendChild(d);
      });
      box.appendChild(opts);
    } else {
      /* 填空题：按题干中的空数渲染输入框（多空题逐空作答、逐空比对） */
      const answers = Array.isArray(q.a) ? q.a : [q.a];
      const blanks = (q.q.match(/（\s*）/g) || []).length;
      const n = Math.max(1, blanks);
      const wrap = document.createElement('div'); wrap.className = 'controls';
      const inputs = [];
      for (let k = 0; k < n; k++){
        const inp = document.createElement('input'); inp.type = 'text';
        inp.placeholder = n > 1 ? `第 ${k+1} 空` : '答案填这里';
        inp.style.cssText = `width:${n > 1 ? 96 : 180}px;text-align:center;font-weight:700`;
        wrap.appendChild(inp); inputs.push(inp);
      }
      const btn = document.createElement('button'); btn.className = 'ghost'; btn.textContent = '检查';
      wrap.appendChild(btn); box.appendChild(wrap);
      const check = () => {
        if (state[i].done) return;
        const ok = (n === 1)
          ? answers.some(a => norm(a) === norm(inputs[0].value))
          : (answers.length >= n && inputs.every((inp, k) => norm(inp.value) === norm(answers[k])));
        inputs.forEach(inp => inp.classList.add(ok ? 'ok' : 'no'));
        if (ok){
          state[i].done = true; state[i].ok = true; c.ok++; updateCounter(c);
          inputs.forEach(inp => inp.readOnly = true);
          fb.className = 'fb show good';
          fb.innerHTML = `✅ 答对了！${q.why ? '<span class="why">💡 ' + q.why + '</span>' : ''}`;
        } else {
          fb.className = 'fb show bad';
          fb.innerHTML = `❌ 答案不对，再想想～<span class="why">💡 提示：${q.hint || '回到上面的演示动画，把相关的那一步再看一遍。'}</span>`;
        }
      };
      btn.addEventListener('click', check);
      inputs.forEach(inp => inp.addEventListener('keydown', e => { if (e.key === 'Enter') check(); }));
    }
    box.appendChild(fb); host.appendChild(box);

    function choose(k, el){
      if (state[i].done) return;
      const answer = Array.isArray(q.a) ? q.a : [q.a];
      if (answer.includes(k)){
        state[i].done = true; state[i].ok = true; c.ok++; updateCounter(c);
        [...el.parentElement.children].forEach(x => {
          x.classList.add('locked');
          if (+x.dataset.k === k) x.classList.add('right');
        });
        fb.className = 'fb show good';
        fb.innerHTML = `✅ 答对了！${q.why ? '<span class="why">💡 ' + q.why + '</span>' : ''}`;
      } else {
        el.classList.add('wrong');
        fb.className = 'fb show bad';
        fb.innerHTML = `❌ 再想想～<span class="why">💡 提示：${q.hint || '回到上面的演示动画，把相关的那一步再看一遍。'}</span>`;
      }
    }
  });

  return function reset(){
    c.ok -= state.filter(x => x.ok).length;
    state.forEach(x => { x.done = false; x.ok = false; });
    mountQuizInto(host, items, c, prefix, offset);
    updateCounter(c);
  };
}

/* 答案区：按分组渲染 */
function renderAnswers(hostSel, groups){
  const host = $(hostSel); if (!host) return;
  let html = '';
  groups.forEach(g => {
    html += `<h4 style="margin:16px 0 6px;color:var(--accent)">${g.title}</h4>`;
    g.items.forEach((q, i) => {
      const ans = (Array.isArray(q.opts) && q.opts.length)
        ? (Array.isArray(q.a) ? q.a : [q.a]).map(k => `${LETTERS[k]}. ${q.opts[k]}`).join(' / ')
        : (Array.isArray(q.a) ? q.a.join(' 或 ') : q.a);
      html += `<div class="ans-item"><b>${g.prefix || ''}${i + 1}. ${ans}</b> —— ${q.why || ''}</div>`;
    });
  });
  host.innerHTML = html;
}

/* 标准装配：三档练习（巩固 / 动手 / 扩展） */
function bootCourse(groups){
  const resets = [], answerGroups = [];
  groups.forEach(g => {
    const items = [].concat(g.choice || [], g.fill || []);
    const c = makeCounter(g.score, g.total, items.length);
    const host = $(g.host);
    if (!host) return;
    /* 一次性挂载全部题目：mountQuizInto 内部会 clear(host)，
       若分两次挂载，后一次（填空）会把前一次（选择）整块覆盖掉。 */
    mountQuizInto(host, items, c, g.prefix || '', 0);
    const resetFn = () => {
      c.ok = 0; updateCounter(c);
      mountQuizInto(host, items, c, g.prefix || '', 0);
    };
    resets.push(resetFn);
    answerGroups.push({title:g.title, prefix:g.prefix || '', items});
    updateCounter(c);
  });
  renderAnswers('#answerKey', answerGroups);
  /* 暴露题目数据，便于自动化测试与二次开发 */
  window.__QUIZ_DATA__ = groups.map(g => ({
    key: g.key, title: g.title, prefix: g.prefix || '',
    choice: g.choice || [], fill: g.fill || []
  }));
  window.__ANSWER_KEY__ = answerGroups;
  groups.forEach((g, i) => {
    const btn = $(g.reset); if (btn) btn.addEventListener('click', () => resets[i] && resets[i]());
  });
}
