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


/* ==========================================================================
   讲解器 v2：语音 + 字幕 + 动画同步（零外部依赖、离线可用）
   --------------------------------------------------------------------------
   ① 一拍 = 一条字幕 + 一个"绝对状态"的动画 + 一句朗读；
   ② 每份脚本一个独立实例：一页挂多份讲解（每个知识点一份）互不干扰；
   ③ 没有中文语音时自动降级为"按句长计时 + 字幕 + 动画"，课堂照样能讲；
   ④ 播放 / 暂停 / 继续 / 停止 / 重播 / 语速 / 点任意一拍重讲；
     空格暂停、Esc 停止（只响应屏幕上看得到的那一份）；
   ⑤ 同一时刻只有一份在说话，开新的会自动停掉旧的。
   --------------------------------------------------------------------------
   业务侧只提供脚本，不碰语音：
     [{beat:'读题', say:'...', sub:'...', act(){...}}]
   ========================================================================== */
const Narrator = (function(){
  const synth = (typeof window !== 'undefined' && window.speechSynthesis) ? window.speechSynthesis : null;
  const NUM = ['①','②','③','④','⑤','⑥','⑦','⑧','⑨'];
  let voices = [], current = null, lastApi = null;

  function loadVoices(){
    if(!synth) return;
    try{
      const all = synth.getVoices() || [];
      voices = all.filter(v => /^(zh|cmn)/i.test(v.lang || '') || /Chinese|中文|普通话/i.test(v.name || ''));
      const score = v => (/zh[-_]?cn/i.test(v.lang || '') ? 2 : 1) +
                        (/Ting|婷婷|Xiao|晓晓|Mei|美佳|Hui|慧|Siri|Google/i.test(v.name || '') ? 1 : 0);
      voices.sort((a, b) => score(b) - score(a));
    }catch(e){ voices = []; }
  }
  loadVoices();
  if(synth && synth.addEventListener){
    synth.addEventListener('voiceschanged', () => { loadVoices(); document.dispatchEvent(new Event('narr-voices')); });
  }
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const hasVoice = () => !!(synth && voices.length);
  /* 中文一句的自然时长（降级计时 + 兜底共用） */
  function estMs(text, rate){
    const n = (text || '').replace(/[，。！？、；：""''（）《》\s]/g, '').length;
    return Math.max(1500, Math.round(n * 300 / (rate || 1) + 700));
  }
  const bold = t => (typeof mdBold === 'function' ? mdBold(t || '') : (t || ''));

  function mount(host, cfg){
    cfg = cfg || {};
    const mountEl = typeof host === 'string' ? $(host) : host;
    if(!mountEl) return null;
    const steps = cfg.steps || [];
    const beats = cfg.beats || steps.map(s => s.beat || '');
    const total = steps.length;
    /* 音频查表用的键前缀：'#s-single' → 's-single' */
    const secId = (typeof cfg.sec === 'string' ? cfg.sec : (cfg.sec && cfg.sec.id ? '#' + cfg.sec.id : ''))
                    .replace(/^#/, '');
    let idx = -1, state = 'idle', token = 0, rate = 1, voice = null;
    let timerId = null, timerResolve = null, timerRemain = 0, timerStart = 0;

    /* ---------------- DOM ----------------
       ⚠️ 不清空宿主容器：有的调用点直接把讲解挂到舞台上，清空会把画面抹掉。
       重复挂载时只替换上一份讲解自己插进去的那个 inner。 */
    const inner = document.createElement('div');
    inner.className = 'narr-inner';
    const prevInner = mountEl.querySelector(':scope > .narr-inner');
    if(prevInner) prevInner.remove();
    mountEl.appendChild(inner);
    mountEl.classList.add('narr-host');

    const subWrap = document.createElement('div'); subWrap.className = 'narr-subwrap';
    const tagEl = document.createElement('span'); tagEl.className = 'narr-tag';
    const txtEl = document.createElement('div'); txtEl.className = 'narr-txt idle';
    const idleText = cfg.idle || '点「开始讲解」，跟着语音和画面一步一步看。';
    txtEl.textContent = idleText;
    subWrap.append(tagEl, txtEl);

    const prog = document.createElement('div'); prog.className = 'narr-prog';
    const progBar = document.createElement('i'); prog.appendChild(progBar);

    const beatsEl = document.createElement('div'); beatsEl.className = 'narr-beats';
    beats.forEach((b, i) => {
      const c = document.createElement('button'); c.type = 'button'; c.className = 'narr-beat';
      const n = document.createElement('i'); n.textContent = NUM[i] || (i + 1);
      c.append(n, document.createTextNode(b));
      c.title = '只重讲这一拍';
      c.addEventListener('click', () => jump(i));
      beatsEl.appendChild(c);
    });

    /* 控制条：插到 cfg.barIn（一般是"算一算 / 下一步"那一行）里，与主操作并列 */
    const bar = document.createElement('div'); bar.className = 'narr-bar';
    const mk = (text, cls, title) => {
      const b = document.createElement('button'); b.type = 'button';
      b.className = 'narr-btn ' + cls; b.textContent = text; if(title) b.title = title;
      return b;
    };
    const playBtn = mk('🔊 开始讲解', 'narr-play', '语音 + 字幕 + 动画同步推进');
    const pauseBtn = mk('⏸ 暂停', 'ghost narr-pause');
    const stopBtn  = mk('⏹ 停止', 'ghost narr-stop');
    const rateWrap = document.createElement('label'); rateWrap.className = 'narr-rate-wrap';
    rateWrap.append(document.createTextNode('语速'));
    const rateIn = document.createElement('input');
    rateIn.type = 'range'; rateIn.min = '0.7'; rateIn.max = '1.3'; rateIn.step = '0.05'; rateIn.value = '1';
    const rateVal = document.createElement('span'); rateVal.textContent = '1.0×';
    rateWrap.append(rateIn, rateVal);
    const voSel = document.createElement('select'); voSel.className = 'narr-vo-sel';
    const voTip = document.createElement('span'); voTip.className = 'narr-vo';
    bar.append(playBtn, pauseBtn, stopBtn, rateWrap, voSel, voTip);

    inner.append(subWrap, prog, beatsEl);
    const barHost = cfg.barIn ? (typeof cfg.barIn === 'string' ? $(cfg.barIn) : cfg.barIn) : null;
    if(barHost) barHost.appendChild(bar);
    else inner.insertBefore(bar, subWrap);

    /* ---------------- 语音 ----------------
       两条路：有预生成音频就播音频（首选），没有则退回系统语音。
       两者都返回 Promise，在「念完」时 resolve，主循环无需区分。

       音频表由 build.py 注入：window.NARR_AUDIO = { "s-single-1": "data:audio/mp4;base64,…" }
       按「小节 id + 拍序号」查表，narr.js 里不写任何音频路径。 */
    const AUDIO = (typeof window !== 'undefined' && window.NARR_AUDIO) || {};
    let audioEl = null, audioTimer = null;

    function audioSrc(i){
      if(!secId) return null;
      return AUDIO[secId + '-' + (i + 1)] || null;
    }
    /* 该节是否全程有音频（决定是否隐藏语速/音色控件） */
    const hasAudio = total > 0 && steps.every((_, i) => !!audioSrc(i));

    function speakAudio(src){
      return new Promise(resolve => {
        if(!audioEl){
          /* 挂到文档里：游离的 Audio 对象在部分浏览器上会被自动播放策略拦，
             挂上之后 .play() 与暂停行为稳定，也方便自检脚本观察 */
          audioEl = document.createElement('audio');
          audioEl.id = 'narr-audio';
          audioEl.preload = 'auto';
          audioEl.style.display = 'none';
          document.body.appendChild(audioEl);
        }
        let settled = false;
        const done = () => {
          if(settled) return;
          settled = true;
          audioEl.onended = null; audioEl.onerror = null;
          if(audioTimer){ clearTimeout(audioTimer); audioTimer = null; }
          resolve();
        };
        try{
          audioEl.onended = done;
          audioEl.onerror = () => {
            console.warn('[讲解音频] 播放失败，本拍跳过语音：', src.slice(0, 40) + '…');
            done();
          };
          audioEl.src = src;
          audioEl.playbackRate = 1;
          const p = audioEl.play();
          if(p && p.catch) p.catch(() => { /* 被暂停/停止打断属正常，不算错误 */ });
          /* 兜底：个别浏览器 onended 不触发，按时长 + 2s 放行 */
          audioTimer = setTimeout(done, 60000);
        }catch(e){ done(); }
      });
    }

    function speakTTS(text){
      return new Promise(resolve => {
        const ms = estMs(text, rate);
        if(!hasVoice()){ timerId = setTimeout(() => { timerId = null; resolve(); }, ms); return; }
        let settled = false;
        const done = () => { if(settled) return; settled = true; if(timerId){ clearTimeout(timerId); timerId = null; } resolve(); };
        try{
          if(!voice) voice = voices[0];
          const u = new SpeechSynthesisUtterance(text);
          u.lang = (voice && voice.lang) || 'zh-CN';
          if(voice) u.voice = voice;
          u.rate = rate; u.pitch = 1; u.volume = 1;
          u.onend = done; u.onerror = done;
          /* 兜底：个别环境 onend 不触发，按估算时长放行 */
          timerId = setTimeout(done, ms * 2 + 5000);
          synth.speak(u);
        }catch(e){ timerId = setTimeout(() => { timerId = null; resolve(); }, ms); }
      });
    }

    function speak(text, i){
      const src = audioSrc(i);
      return src ? speakAudio(src) : speakTTS(text);
    }
    /* 句间留白 / 降级计时的可暂停等待 */
    function wait(ms){
      return new Promise(resolve => {
        timerResolve = resolve; timerRemain = ms; timerStart = Date.now();
        timerId = setTimeout(() => { timerId = null; timerResolve = null; resolve(); }, ms);
      });
    }
    function freeze(){
      if(!timerId) return;
      clearTimeout(timerId); timerId = null;
      timerRemain = Math.max(60, timerRemain - (Date.now() - timerStart));
    }
    function thaw(){
      if(!timerResolve || timerId) return;
      timerStart = Date.now();
      timerId = setTimeout(() => { timerId = null; const r = timerResolve; timerResolve = null; r && r(); }, timerRemain);
    }
    function gate(){
      return new Promise(resolve => {
        const t = setInterval(() => { if(state !== 'paused'){ clearInterval(t); resolve(); } }, 100);
      });
    }

    /* ---------------- 渲染 ---------------- */
    function paint(){
      [...beatsEl.children].forEach((c, k) => {
        c.classList.toggle('on', k === idx);
        c.classList.toggle('done', idx >= 0 && k < idx);
      });
      progBar.style.width = idx >= 0 ? Math.round((idx + 1) / total * 100) + '%' : '0%';
    }
    function setButtons(){
      const playing = (state === 'playing' || state === 'paused');
      playBtn.disabled = playing;
      playBtn.textContent = state === 'done' ? '↻ 再讲一遍' : '🔊 开始讲解';
      pauseBtn.disabled = !playing;
      pauseBtn.textContent = state === 'paused' ? '▶ 继续' : '⏸ 暂停';
      stopBtn.disabled = (state === 'idle');
      /* 有预录音频时，语速与音色都已固定，这两个控件留着只会让人误以为能调 */
      if(hasAudio){
        rateWrap.style.display = 'none';
        voSel.style.display = 'none';
      }else{
        rateWrap.style.opacity = playing ? '.5' : '1';
      }
      (cfg.lock || []).forEach(sel => $$(sel).forEach(el => { el.disabled = playing; }));
    }
    function showStep(i){
      idx = i;
      const st = steps[i];
      tagEl.textContent = st.beat || beats[i] || '';
      tagEl.classList.toggle('show', !!(st.beat || beats[i]));
      txtEl.classList.remove('idle');
      txtEl.innerHTML = st.sub || bold(st.say);
      paint();
    }
    function clearHi(){
      $$('.narr-focus').forEach(el => el.classList.remove('narr-focus'));
      $$('.narr-reveal').forEach(el => el.classList.remove('narr-reveal'));
    }
    function resetView(){
      idx = -1;
      tagEl.classList.remove('show');
      txtEl.classList.add('idle');
      txtEl.textContent = idleText;
      clearHi(); paint();
    }

    /* ---------------- 主循环 ---------------- */
    async function run(from){
      const my = ++token;
      state = 'playing'; setButtons();
      if(synth){ try{ synth.cancel(); }catch(e){} }
      await sleep(60);
      for(let i = from; i < total; i++){
        if(my !== token) return;
        showStep(i);
        const st = steps[i];
        if(typeof st.act === 'function'){ try{ st.act(i); }catch(e){} }
        clearHi();
        (st.focus ? [].concat(st.focus) : []).forEach(s => $$(s).forEach(el => el.classList.add('narr-focus')));
        (st.reveal ? [].concat(st.reveal) : []).forEach(s => $$(s).forEach(el => el.classList.add('narr-reveal')));
        await sleep(120);                       /* 先让画面动，再开口 */
        await speak(st.say || '', i);
        if(my !== token) return;
        await gate();
        if(my !== token) return;
        await wait(360);                        /* 句间留白，给学生反应时间 */
        if(my !== token) return;
      }
      state = 'done'; setButtons(); paint();
      [...beatsEl.children].forEach(c => c.classList.add('done'));
    }

    function play(from){
      if(current && current !== api) current.stop(true);
      current = api; lastApi = api;
      run(typeof from === 'number' ? from : 0);
    }
    function stop(silent){
      token++; state = 'idle';
      if(synth){ try{ synth.cancel(); }catch(e){} }
      if(audioEl){ try{ audioEl.pause(); }catch(e){} }
      if(audioTimer){ clearTimeout(audioTimer); audioTimer = null; }
      if(timerId){ clearTimeout(timerId); timerId = null; }
      if(timerResolve){ const r = timerResolve; timerResolve = null; r && r(); }
      if(current === api) current = null;
      clearHi();
      if(!silent) resetView();
      setButtons();
    }
    function togglePause(){
      if(state === 'playing'){
        state = 'paused'; freeze();
        if(audioEl){ try{ audioEl.pause(); }catch(e){} }
        if(hasVoice()){ try{ synth.pause(); }catch(e){} }
      }else if(state === 'paused'){
        state = 'playing';
        if(audioEl && audioEl.src){ try{ const p = audioEl.play(); if(p && p.catch) p.catch(()=>{}); }catch(e){} }
        if(hasVoice()){ try{ synth.resume(); }catch(e){} }
        thaw();
      }
      setButtons();
    }
    function jump(i){
      if(i < 0 || i >= total) return;
      stop(true);
      play(i);
    }

    /* ---------------- 事件 ---------------- */
    playBtn.addEventListener('click', () => play(0));
    pauseBtn.addEventListener('click', togglePause);
    stopBtn.addEventListener('click', () => stop(false));
    rateIn.addEventListener('input', () => {
      rate = parseFloat(rateIn.value) || 1;
      rateVal.textContent = rate.toFixed(1) + '×';
    });
    document.addEventListener('keydown', e => {
      if(state !== 'playing' && state !== 'paused') return;
      const box = mountEl.getBoundingClientRect();
      const vis = box.bottom > 0 && box.top < (window.innerHeight || 0);
      if(!vis) return;
      if(e.code === 'Space'){ e.preventDefault(); togglePause(); }
      if(e.code === 'Escape'){ stop(false); }
    });

    /* ---------------- 语音下拉 ---------------- */
    function fillVoices(){
      voSel.innerHTML = '';
      if(hasAudio){
        voTip.textContent = '预录讲解 · 离线可播';
        voTip.title = '本课讲解使用预录语音，音质与电脑有没有中文语音无关';
        return;
      }
      if(!hasVoice()){
        const o = document.createElement('option');
        o.textContent = '无中文语音 · 字幕模式'; o.disabled = true; o.selected = true;
        voSel.appendChild(o);
        voTip.textContent = '字幕 + 动画';
        voTip.title = '系统没有可用中文语音，已自动改为按句长计时推进';
        return;
      }
      const auto = document.createElement('option');
      auto.value = ''; auto.textContent = '自动（推荐）';
      voSel.appendChild(auto);
      voices.forEach((v, i) => {
        const o = document.createElement('option');
        o.value = String(i); o.textContent = v.name + '（' + v.lang + '）';
        voSel.appendChild(o);
      });
      voTip.textContent = '';   /* 下拉里已经写着语音名，不再重复 */
      voTip.title = '使用系统自带中文语音，离线可用';
    }
    voSel.addEventListener('change', () => {
      voice = voSel.value === '' ? voices[0] : voices[+voSel.value];
      const keep = idx;
      if(state === 'playing' || state === 'paused'){
        stop(true); if(keep >= 0){ state = 'idle'; play(keep); }
      }
    });
    document.addEventListener('narr-voices', fillVoices);
    setTimeout(fillVoices, 260);

    const api = {
      play, stop, jump, togglePause,
      get state(){ return state; },
      get alive(){ return state === 'playing' || state === 'paused'; },  /* 兼容旧调用点 */
      get index(){ return idx; },
      get total(){ return total; },
      steps, host: mountEl, cfg
    };
    setButtons();
    lastApi = api;
    return api;
  }

  /* 把一批讲解脚本挂到各自的 section 上（约定：每个 section 一个 .stage） */
  function boot(list){
    return (list || []).map(cfg => {
      const sec = typeof cfg.sec === 'string' ? $(cfg.sec) : cfg.sec;
      if(!sec) return null;
      const stage = $(cfg.stage || '.stage', sec);
      if(!stage) return null;
      const host = document.createElement('div');
      host.className = 'narr-host';
      stage.parentNode.insertBefore(host, stage.nextSibling);
      const conf = Object.assign({}, cfg, {
        barIn: cfg.barIn ? (typeof cfg.barIn === 'string' ? $(cfg.barIn, sec) : cfg.barIn)
                         : $(cfg.barSel || '.controls', sec)
      });
      const api = mount(host, conf);
      if(api){ api.section = sec; sec.dataset.narr = '1'; }
      return api;
    }).filter(Boolean);
  }

  /* 兼容旧调用：attach(容器, 配置) 返回实例；play() 播放最近挂载的那一份 */
  function attach(mountSel, cfg){
    const el = typeof mountSel === 'string' ? $(mountSel) : mountSel;
    if(!el) return null;
    return mount(el, cfg);
  }

  return {
    mount, boot, attach,
    play(from){ lastApi && lastApi.play(from); },
    stop(silent){ lastApi && lastApi.stop(silent); },
    togglePause(){ lastApi && lastApi.togglePause(); },
    stepTo(n){ lastApi && lastApi.jump(n); },
    get supported(){ return !!synth; },
    get voices(){ return voices.slice(); },
    get speaking(){ return !!current; }
  };
})();

/* ---------------- 星级体系 ---------------- */
/* 三星 = 基础随堂练；四星 = 拓展；五星 = 浅奥挑战 */
const STAR_ICON = {3:'★★★', 4:'★★★★', 5:'★★★★★'};
const STAR_NAME = {3:'三星 · 基础', 4:'四星 · 拓展', 5:'五星 · 浅奥'};


/* ==========================================================================
   庆祝效果：答对四星/五星题时触发
   —— 音效用 Web Audio 实时合成（零外部文件，保持"零依赖离线可用"）
   —— 满屏点赞用 DOM + CSS 动画，不引任何动画库
   ========================================================================== */
let _audioCtx = null;
function audioCtx(){
  if(!_audioCtx){
    const AC = window.AudioContext || window.webkitAudioContext;
    if(!AC) return null;
    try{ _audioCtx = new AC(); }catch(e){ return null; }
  }
  if(_audioCtx.state === 'suspended'){ try{ _audioCtx.resume(); }catch(e){} }
  return _audioCtx;
}
/* 单音"叮"：清脆、克制，用于四星题答对 */
function playChime(freq){
  const ctx = audioCtx(); if(!ctx) return;
  const t0 = ctx.currentTime;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(freq || 880, t0);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(0.18, t0 + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.42);
  o.connect(g); g.connect(ctx.destination);
  o.start(t0); o.stop(t0 + 0.45);
}
/* 喜悦琶音 C5-E5-G5-C6：用于五星题答对 / 全部挑战题通关 */
function playFanfare(){
  const ctx = audioCtx(); if(!ctx) return;
  [[523.25,0],[659.25,0.11],[783.99,0.22],[1046.50,0.34]].forEach(([f, dt])=>{
    const t0 = ctx.currentTime + dt;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'triangle';
    o.frequency.setValueAtTime(f, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(0.22, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.55);
    o.connect(g); g.connect(ctx.destination);
    o.start(t0); o.stop(t0 + 0.6);
  });
}
/* 点赞层（全局只建一次） */
function likeLayer(){
  let l = document.getElementById('cheerLayer');
  if(!l){
    l = document.createElement('div');
    l.id = 'cheerLayer';
    l.className = 'cheer-layer';
    l.setAttribute('aria-hidden','true');
    document.body.appendChild(l);
  }
  return l;
}
const LIKE_ICONS = ['👍','⭐','🎉','❤️','🌟','👏','💯'];
/* 满屏点赞：origin 为 {x,y} 时从该点扩散，否则全屏随机 */
const MAX_LIKES = 90;                 /* 同屏点赞上限，避免连续答对时刷屏 */
function spawnLikes(count, origin){
  const layer = likeLayer();
  /* 超过上限时，先把最早的那批移除，再补新的 */
  let alive = [...layer.querySelectorAll('.like-fly')];
  while(alive.length >= MAX_LIKES){
    const old = alive.shift();
    if(old.parentNode) old.parentNode.removeChild(old);
  }
  const n = Math.max(0, Math.min(count, MAX_LIKES - alive.length));
  for(let i = 0; i < n; i++){
    const el = document.createElement('span');
    el.className = 'like-fly';
    el.textContent = LIKE_ICONS[(Math.random() * LIKE_ICONS.length) | 0];
    const x = origin ? origin.x + (Math.random() * 240 - 120) : Math.random() * window.innerWidth;
    el.style.left = x + 'px';
    el.style.fontSize = (18 + Math.random() * 30) + 'px';
    el.style.animationDuration = (1.5 + Math.random() * 1.5) + 's';
    el.style.animationDelay = (Math.random() * 0.6) + 's';
    layer.appendChild(el);
    setTimeout(()=>{ if(el.parentNode) el.parentNode.removeChild(el); }, 4200);
  }
}
/* 中央横幅："你好棒！"（同一时刻只显示一条，避免叠成一摞） */
function showBanner(main, sub, cls){
  const layer = likeLayer();
  /* 只保留最新一条横幅：旧的立刻淡出移除 */
  [...layer.querySelectorAll('.cheer-banner')].forEach(old=>{
    if(old.classList.contains('out')) return;
    old.classList.add('out');
    setTimeout(()=>{ if(old.parentNode) old.parentNode.removeChild(old); }, 700);
  });
  const el = document.createElement('div');
  el.className = 'cheer-banner' + (cls ? ' ' + cls : '');
  el.innerHTML = '<div class="cheer-main">' + main + '</div>' +
                (sub ? '<div class="cheer-sub">' + sub + '</div>' : '');
  layer.appendChild(el);
  setTimeout(()=>{ el.classList.add('out'); }, 2000);
  setTimeout(()=>{ if(el.parentNode) el.parentNode.removeChild(el); }, 2800);
}
/* 答对一道题的庆祝入口：star>=4 才庆祝 */
function celebrateCorrect(q, anchorEl, opts){
  const o = opts || {};
  const star = q && q.star ? q.star : 3;
  if(star < 4) return;
  const r = anchorEl && anchorEl.getBoundingClientRect
    ? anchorEl.getBoundingClientRect()
    : {left: window.innerWidth/2, top: window.innerHeight/2, width:0};
  const origin = {x: r.left + (r.width||0)/2, y: r.top};
  if(star === 5){
    showBanner('你好棒！', '五星浅奥挑战题被你攻克啦', 'big');
    spawnLikes(46, origin);
    playFanfare();
  } else {
    showBanner('答对啦！', '四星拓展题 +1 ⭐', 'normal');
    spawnLikes(14, origin);
    playChime(880);
  }
  if(o.grand && !celebrateCorrect._grandDone){
    celebrateCorrect._grandDone = true;      /* 全页只庆祝一次 */
    setTimeout(()=>{
      showBanner('太棒了！', '所有挑战题全部答对 ⭐⭐⭐⭐⭐', 'grand');
      spawnLikes(60);
      playFanfare();
    }, 900);
  }
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

/* 四星/五星题是否全部答对（用于触发"通关"级庆祝） */
function hardAllDone(items, state){
  const hard = [];
  items.forEach((q, i)=>{ if((q.star||3) >= 4) hard.push(state[i]); });
  return hard.length > 0 && hard.every(x => x.ok);
}

/* 把一组题目渲染进 host；返回重做函数 */

/* ---------------- 题目右侧：数学思维提示 + 详细解题过程 ---------------- */
/* 题库里的 point / care / steps 用 **粗体** 标记重点，渲染前转成 <b>。
   （题干与解析本来就允许写 HTML 标签，两种写法都能用。） */
function mdBold(s){
  return String(s == null ? '' : s).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
}
/* 难度题（星级 ≥ 4）在题干右侧挂一块"思维提示"：
     point —— 考察什么知识点（从数学思维角度说清"为什么这么做"）
     care  —— 易错提醒（学生最容易栽在哪一步）
   答错时若题目带 steps，给出**分步解题过程**（最后一步默认折叠，点开揭晓，
   既能学习又不至于一眼看到答案）。 */
function buildAside(q){
  if(!(q.point || q.care)) return null;
  const el = document.createElement('div');
  el.className = 'q-aside';
  let h = '<div class="qa-h">🧭 数学思维提示</div>';
  if(q.point) h += `<div class="qa-row"><span class="qa-k">考点</span><span class="qa-v">${mdBold(q.point)}</span></div>`;
  if(q.care)  h += `<div class="qa-row"><span class="qa-k">易错</span><span class="qa-v">${mdBold(q.care)}</span></div>`;
  el.innerHTML = h;
  return el;
}
/* 题目正确答案的文字（选择题取选项文本，填空题取答案串） */
function answerTexts(q){
  const a = Array.isArray(q.a) ? q.a : [q.a];
  if(Array.isArray(q.opts)){
    const os = q.opts.map(o => typeof o === 'string' ? o : (o.t || ''));
    return a.map(i => os[i]).filter(x => typeof x === 'string' && x);
  }
  return a.map(x => String(x));
}
/* 某一步里是否"把答案写出来了"（按数字/词边界匹配，避免 '3' 命中 '30'） */
function stepHasAnswer(s, ansList){
  return ansList.some(a => {
    if(!a) return false;
    const esc = a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp('(^|[^0-9A-Za-z.])' + esc + '($|[^0-9A-Za-z.])').test(s);
  });
}
function buildSteps(q){
  const st = q.steps;
  if(!st || !st.length) return '';
  const arr = Array.isArray(st) ? st : [st];
  const ansList = answerTexts(q);
  /* 题干里本来就写着答案（如"平均数是 24 … 去掉的数是"）时，
     过程里出现这个数不算"泄露"，也就不必折叠。 */
  const publicAns = ansList.some(a => q.q && q.q.indexOf(a) >= 0);
  let h = '<div class="steps"><div class="steps-h">🧩 详细解题过程（跟着一步一步走）</div>';
  /* 找到第一个"把答案写出来"的步骤；从它到末尾**合并成一个**折叠块
     （否则会出现两个相邻的折叠块，学生要点两次才能看完）。 */
  let firstHide = -1;
  if(!publicAns){
    for(let k = 0; k < arr.length; k++){
      if(stepHasAnswer(arr[k], ansList)){ firstHide = k; break; }
    }
  }
  if(firstHide < 0) firstHide = arr.length - 1;   /* 没有含答案的步骤：折叠最后一步 */
  const hidden = arr.length - firstHide;
  const label = hidden === 1 ? '最后一步 —— 点开揭晓' : `最后 ${hidden} 步 —— 点开揭晓`;
  arr.forEach((s, k) => {
    if(k < firstHide){
      h += `<div class="step"><span class="sn">${k + 1}</span><span>${mdBold(s)}</span></div>`;
    } else if(k === firstHide){
      let body = '';
      for(let j = firstHide; j < arr.length; j++){
        body += `<div class="step-body"><span class="sn">${j + 1}</span><span>${mdBold(arr[j])}</span></div>`;
      }
      h += `<details class="step step-final"><summary><span class="sn">${firstHide + 1}</span>${label}</summary>${body}</details>`;
    }
  });
  return h + '</div>';
}
function wrongFeedback(q){
  const steps = buildSteps(q);
  if(steps) return `❌ 答案不对，别急～ 看看下面的思路：${steps}`;
  return `❌ 答案不对，再想想～<span class="why">💡 提示：${q.hint || '回到上面的演示动画，把相关的那一步再看一遍。'}</span>`;
}

/* 题目级讲解：给难题挂一个"🔊 听思路"按钮。
   复用同一个 Narrator 引擎 —— 讲解脚本由题目数据（point / why / steps）自动拼出，
   所以**练习题讲解零额外成本**，新增一道题的讲解不用写代码。
   触发方式：点题干旁的 🔊 → 字幕条出现在该题下方，语音念思路。 */
function attachQuestionNarrator(hostSel, items){
  const host = typeof hostSel === 'string' ? $(hostSel) : hostSel;
  if(!host) return;
  const boxes = host.querySelectorAll('.q');
  items.forEach((q, i) => {
    if((q.star || 3) < 4) return;                 /* 只给难题加，避免页面太吵 */
    const box = boxes[i];
    if(!box) return;
    const qt = box.querySelector('.qt');
    if(!qt || qt.querySelector('.q-narr-btn')) return;
    const steps = buildQuestionSteps(q);
    if(!steps.length) return;
    /* ⚠️ 容器与控件在**加载时**就建好，点击时只播放：
       若等到点击才建，每点一题就往页面里插一段 DOM → 页面不断变长，
       后续按钮的坐标一直在变（自动化巡检会因此超时）。 */
    const holder = document.createElement('div');
    holder.className = 'q-narr-sub';
    box.appendChild(holder);
    const inst = Narrator.attach(holder, { title:'思路讲解', steps, barIn: holder });
    const btn = document.createElement('button');
    btn.className = 'q-narr-btn';
    btn.title = '听思路（语音 + 字幕）';
    btn.textContent = '🔊';
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if(inst) inst.play();
    });
    qt.appendChild(btn);
  });
}

/* 由题目数据拼出讲解脚本（题目级讲解的"六拍"简化版）：
   ① 想什么（考点/思维方法）→ ② 怎么想（解析）→ ③ 易错提醒 → ④ 检验 */
function buildQuestionSteps(q){
  const steps = [];
  if(q.point) steps.push({ say:'这道题考的是：' + q.point.replace(/\*\*/g,''), focus:'.qt' });
  if(q.why)   steps.push({ say:'我们这样想：' + q.why.replace(/<[^>]+>/g,'').replace(/\*\*/g,'') });
  if(q.care)  steps.push({ say:'要注意：' + q.care.replace(/\*\*/g,'') });
  return steps;
}

function mountQuizInto(host, items, c, prefix, offset){
  clear(host);
  const state = items.map(()=>({done:false, ok:false}));
  const isChoice = it => Array.isArray(it.opts) && it.opts.length;
  const optsOf  = it => (it.opts||[]).map(o => typeof o === 'string' ? o : (o.t || ''));

  items.forEach((q, i) => {
    const box = document.createElement('div'); box.className = 'q';
    const star = q.star || 3;
    if(star >= 4) box.classList.add('q-star' + star);
    const qt = document.createElement('div'); qt.className = 'qt';
    qt.innerHTML = `<span class="qno">${prefix}${i + 1 + offset}</span>` +
      `<span class="qstars s${star}" title="${STAR_NAME[star] || ''}">${STAR_ICON[star] || ''}</span>` +
      `${q.q}`;
    const main = document.createElement('div'); main.className = 'qmain';
    main.appendChild(qt);
    const fb = document.createElement('div'); fb.className = 'fb';

    if (isChoice(q)){
      const opts = document.createElement('div'); opts.className = 'opts';
      optsOf(q).forEach((o, k) => {
        const d = document.createElement('div'); d.className = 'opt'; d.dataset.k = k;
        d.innerHTML = `<span class="k">${LETTERS[k]}.</span><span>${o}</span>`;
        d.addEventListener('click', () => choose(k, d));
        opts.appendChild(d);
      });
      main.appendChild(opts);
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
      wrap.appendChild(btn); main.appendChild(wrap);
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
          celebrateCorrect(q, box, {grand: hardAllDone(items, state)});
        } else {
          fb.className = 'fb show bad';
          fb.innerHTML = wrongFeedback(q);
        }
      };
      btn.addEventListener('click', check);
      inputs.forEach(inp => inp.addEventListener('keydown', e => { if (e.key === 'Enter') check(); }));
    }
    main.appendChild(fb);
    box.appendChild(main);
    const aside = buildAside(q);
    if(aside){ box.appendChild(aside); box.classList.add('q-has-aside'); }
    host.appendChild(box);

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
          celebrateCorrect(q, box, {grand: hardAllDone(items, state)});
      } else {
        el.classList.add('wrong');
        fb.className = 'fb show bad';
        fb.innerHTML = wrongFeedback(q);
      }
    }
  });

  /* 难题挂"🔊 听思路"（题目级讲解，与知识点讲解同一引擎） */
  attachQuestionNarrator(host, items);

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
    /* 星级：档位默认 star，题目可单独覆盖 */
    items.forEach(it => { if(!it.star) it.star = g.star || 3; });
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

/* ==========================================================================
   左侧章节栏：点击隐藏/展开（状态记忆）+ 滚动高亮当前章节
   ========================================================================== */
(function initSideNav(){
  const KEY = 'g4m_nav_collapsed';
  const body = document.body;
  let collapsed = false;
  try { collapsed = localStorage.getItem(KEY) === '1'; } catch (err) {}
  body.classList.toggle('nav-collapsed', collapsed);

  const toggle = document.getElementById('navToggle');
  const handle = document.getElementById('navShow');
  const scrim  = document.getElementById('navScrim');

  function setCollapsed(v){
    collapsed = v;
    body.classList.toggle('nav-collapsed', v);
    body.classList.remove('nav-open');
    try { localStorage.setItem(KEY, v ? '1' : '0'); } catch (err) {}
    if (toggle) toggle.setAttribute('aria-expanded', String(!v));
    if (toggle) toggle.title = v ? '显示章节栏' : '隐藏章节栏';
  }
  const isMobile = () => window.matchMedia('(max-width:940px)').matches;
  if (toggle) toggle.addEventListener('click', () => {
    if (isMobile()) body.classList.toggle('nav-open');   /* 移动端：抽屉式 */
    else setCollapsed(!collapsed);                        /* 桌面端：折叠式 */
  });
  if (handle) handle.addEventListener('click', () => {
    if (isMobile()) body.classList.add('nav-open');
    else setCollapsed(false);   /* 桌面的把手 = 重新展开章节栏 */
  });
  if (scrim)  scrim.addEventListener('click', () => body.classList.remove('nav-open'));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') body.classList.remove('nav-open');
    if (e.key === '[' && (e.metaKey || e.ctrlKey)) setCollapsed(!collapsed);
  });

  /* 嵌在平台 iframe 里时，"返回平台"没意义 → 换成"新窗口打开" */
  const back = document.getElementById('backToPlatform');
  const open = document.getElementById('openStandalone');
  const embedded = window.self !== window.top;
  if (embedded){
    if (back) back.style.display = 'none';
    if (open){ open.href = location.href; open.style.display = ''; }
  } else if (open){
    open.style.display = 'none';
  }

  /* 移动端点导航后自动收起 */
  $$('.sidenav a').forEach(a => a.addEventListener('click', () => {
    if (window.matchMedia('(max-width:940px)').matches) body.classList.remove('nav-open');
  }));

  /* 滚动到哪一章，左栏就高亮哪一章 */
  const links = $$('.sidenav a[href^="#"]');
  const map = new Map();
  links.forEach(a => {
    const el = document.getElementById(a.getAttribute('href').slice(1));
    if (el) map.set(el, a);
  });
  if (map.size && 'IntersectionObserver' in window){
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        links.forEach(l => l.classList.remove('active'));
        const a = map.get(en.target);
        if (a) a.classList.add('active');
      });
    }, {rootMargin:'-8% 0px -78% 0px', threshold:0});
    map.forEach((a, el) => io.observe(el));
  }
  setCollapsed(collapsed);
})();

/* ==========================================================================
   四年级下册共享绘图 helper（人教版 2024 年审定 新教材）
   —— 笔算除法竖式 / 条形统计图 / 数轴 / 十格图 / 面积模型
   ========================================================================== */

/* ------------------------------------------------------------------
   笔算除法：把 a ÷ b 拆成标准竖式的若干步
   每步 = {col 本步所在列, partial 当前部分, q 商, prod 乘积, diff 余数}
   规则（人教版口径）：
     · 未开始试商时，被除数的前几位不够除就继续看下一位（不写商）
     · 一旦开始，每一列都要写商，商可能是 0
     · 每步的"部分"= 上一步的余数添上被除数的下一位
   ------------------------------------------------------------------ */
function divSteps(a, b){
  const sa = String(a);
  let rem = 0, started = false;
  const steps = [];
  for (let i = 0; i < sa.length; i++){
    rem = rem * 10 + Number(sa[i]);
    if (!started && rem < b && i < sa.length - 1) continue;   /* 前面几位不够除，继续看 */
    started = true;
    const q = Math.floor(rem / b);
    const prod = q * b;
    steps.push({col:i, partial:rem, q, prod, diff:rem - prod});
    rem = rem - prod;
  }
  return steps;
}
/* 除数看作接近的整十数（四舍五入）：24→20，26→30，25→30，21→20 */
function roundTen(b){ return b % 10 === 0 ? b : (b % 10 < 5 ? Math.floor(b/10)*10 : Math.ceil(b/10)*10); }

/* 画笔算除法竖式（人教版标准式样）
   revealed = 已显示的步数（-1 表示只画题面）
   图形约定：
     · 除数在左，被除数在右，中间是"┌"形竖式括号
     · 商写在被除数**各位的正上方**（除到哪一位，商就写在那一位上面）
     · 横线以下只显示"当前这一步"的算理：当前部分 → 乘积 → 横线 → 余数
   返回 {steps, show, colX, stepRows}，便于做几何断言 */
function drawLongDiv(svg, a, b, revealed, opt){
  const o = Object.assign({colW:46, x0:176, top:214}, opt||{});
  const steps = divSteps(a, b);
  const sa = String(a), sb = String(b);
  const n = sa.length;
  const show = Math.max(0, Math.min(revealed + 1, steps.length));
  const H = o.top + 150;
  svg.setAttribute('viewBox', `0 0 640 ${H}`);
  svg.setAttribute('width', 640); svg.setAttribute('height', H);
  const colX = i => o.x0 + i * o.colW + o.colW / 2;
  const right = o.x0 + n * o.colW + 10;

  /* —— 竖式括号：上横线 + 左侧竖线 + 下横线 —— */
  s('line', {x1:o.x0 - 8, y1:74, x2:right, y2:74, stroke:'#20304a', 'stroke-width':2.2}, svg);
  s('line', {x1:o.x0 - 8, y1:74, x2:o.x0 - 8, y2:122, stroke:'#20304a', 'stroke-width':2.2}, svg);
  s('line', {x1:o.x0 - 8, y1:122, x2:right, y2:122, stroke:'#20304a', 'stroke-width':2.2}, svg);

  /* —— 除数（写在竖线左边）—— */
  const dw = 21;
  sb.split('').forEach((ch, k) =>
    label(svg, o.x0 - 22 - (sb.length - 1 - k) * dw - dw / 2, 106, ch, {size:21, weight:700}));

  /* —— 被除数 —— */
  sa.split('').forEach((ch, i) => label(svg, colX(i), 106, ch, {size:21, weight:700}));

  /* —— 商：写在被除数各位正上方，当前这一步高亮 —— */
  const cur = show - 1;
  steps.forEach((st, k) => {
    if (k >= show) return;
    const on = k === cur;
    if (on) s('circle', {cx:colX(st.col), cy:46, r:16, fill:'none',
      stroke:'#1f9d6b', 'stroke-width':1.8, 'stroke-dasharray':'4 3'}, svg);
    label(svg, colX(st.col), 46, String(st.q),
      {size:21, weight:800, fill:on ? '#1f9d6b' : '#93a9c6'});
  });

  /* —— 横线以下：只显示当前这一步的算理 —— */
  const stepRows = [];
  if (show > 0){
    const st = steps[cur];
    const put = (str, yy, color, size) => {
      const t = String(str);
      t.split('').forEach((ch, j) =>
        label(svg, colX(st.col - (t.length - 1 - j)), yy, ch,
          {size:size || 17, weight:700, fill:color}));
    };
    /* 当前部分：高亮框要正好盖住参与计算的那几位（按列对齐，不能只盖右半边）*/
    const used = String(st.partial).length;
    const firstCol = st.col - used + 1;
    s('rect', {x:colX(firstCol) - o.colW / 2 + 3, y:132,
      width:used * o.colW - 6, height:30, rx:6,
      fill:'#e8f1ff', stroke:'#2f6fd0', 'stroke-width':1.5}, svg);
    put(st.partial, 153, '#2f6fd0');
    label(svg, o.x0 - 68, 153, '当前部分', {size:12.5, fill:'#4b5f7d', anchor:'end'});
    /* 乘积 */
    put(st.prod, 196, '#f08a24');
    label(svg, o.x0 - 68, 196, b + ' × ' + st.q, {size:12.5, fill:'#4b5f7d', anchor:'end'});
    /* 减法横线 */
    const w = Math.max(String(st.prod).length, used) * o.colW;
    s('line', {x1:colX(st.col) - w / 2 + 3, y1:206, x2:colX(st.col) + w / 2 - 3, y2:206,
      stroke:'#20304a', 'stroke-width':1.8}, svg);
    /* 余数 + 落下的下一位（灰字），二者连读就是下一步的"当前部分"）*/
    put(st.diff, 230, '#1f9d6b');
    if (cur + 1 < steps.length){
      label(svg, colX(st.col + 1), 230, sa[st.col + 1],
        {size:17, weight:700, fill:'#a9bdd2'});
    }
    label(svg, o.x0 - 68, 230, '余数', {size:12.5, fill:'#4b5f7d', anchor:'end'});
    stepRows.push({k:cur, col:st.col, q:st.q, prod:st.prod, diff:st.diff, partial:st.partial});
  }
  return {steps, show, colX, stepRows};
}

/* ---------------- 条形统计图 ---------------- */
function barChart(svg, opt){
  const o = Object.assign({w:640, h:340, pad:{l:56, r:20, t:34, b:52}, unit:1,
    maxV:null, title:'', yLabel:'', series:[{name:'', color:'#2f6fd0', data:[]}],
    cats:[], grid:true, legend:true, highlight:-1, valueLabels:true}, opt||{});
  const {w, h, pad} = o;
  const maxV = o.maxV || Math.max(...o.series.flatMap(sr => sr.data));
  const top = Math.ceil(maxV / o.unit) * o.unit;
  const cw = (w - pad.l - pad.r) / o.cats.length;
  const chartH = h - pad.t - pad.b;
  const yOf = v => pad.t + chartH - (v / top) * chartH;
  if (o.title) label(svg, w / 2, 20, o.title, {size:17, weight:800, fill:'#20304a'});
  if (o.grid){
    for (let v = 0; v <= top; v += o.unit){
      const y = yOf(v);
      s('line', {x1:pad.l, y1:y, x2:w - pad.r, y2:y, stroke: v === 0 ? '#8fa3bd' : '#eef2f8',
        'stroke-width': v === 0 ? 1.6 : 1}, svg);
      haloText(svg, pad.l - 10, y, String(v), null, {size:12, fill:'#4b5f7d', rot:false});
    }
  }
  if (o.yLabel) label(svg, pad.l - 10, pad.t - 16, o.yLabel, {size:12, fill:'#4b5f7d', anchor:'end'});
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
    haloText(svg, pad.l + cw * ci + cw / 2, h - pad.b + 18, c, null, {size:13, fill:'#20304a', rot:false});
  });
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

/* ---------------- 数轴 ---------------- */
function numberLine(svg, opt){
  /* 注意：不要再覆盖宿主 svg 的 viewBox —— 调用方往往在同一张 svg 里画别的内容，
     覆盖会���别的元素挤出画布（LESSONS #18：数轴覆盖 viewBox 造成出框）。 */
  const o = Object.assign({x0:60, x1:580, y:92, min:0, max:1, tick:0.1, labels:true,
    marks:[], title:''}, opt||{});
  if (!svg.getAttribute('viewBox')){
    svg.setAttribute('viewBox', '0 0 640 150');
    svg.setAttribute('width', 640); svg.setAttribute('height', 150);
  }
  const X = v => o.x0 + (v - o.min) / (o.max - o.min) * (o.x1 - o.x0);
  if (o.title) label(svg, 320, 24, o.title, {size:15, weight:700, fill:'#20304a'});
  s('line', {x1:o.x0, y1:o.y, x2:o.x1, y2:o.y, stroke:'#20304a', 'stroke-width':2}, svg);
  s('path', {d:`M ${o.x1+6} ${o.y} L ${o.x1-8} ${o.y-5} L ${o.x1-8} ${o.y+5} Z`, fill:'#20304a'}, svg);
  const dec = String(o.tick).split('.')[1] ? String(o.tick).split('.')[1].length : 0;
  for (let v = o.min; v <= o.max + 1e-9; v += o.tick){
    const x = X(v);
    s('line', {x1:x, y1:o.y, x2:x, y2:o.y + 7, stroke:'#8fa3bd', 'stroke-width':1.3}, svg);
    if (o.labels) haloText(svg, x, o.y + 22, dec ? v.toFixed(dec) : String(v), null,
      {size:12, fill:'#4b5f7d', rot:false});
  }
  (o.marks||[]).forEach(m => {
    const x = X(m.v);
    s('circle', {cx:x, cy:o.y, r:6, fill:m.color || '#d94a4a'}, svg);
    haloText(svg, x, o.y - 17, m.t, null, {size:13, weight:700, fill:m.color || '#d94a4a', rot:false});
  });
  return {X};
}

/* ---------------- 十格图（小数的意义）---------------- */
function tenGrid(svg, x, y, cell, filled, color){
  for (let i = 0; i < 10; i++){
    const r = Math.floor(i / 5), c = i % 5;
    const on = i < filled;
    s('rect', {x:x + c*cell, y:y + r*cell, width:cell-2, height:cell-2, rx:3,
      fill:on ? (color||'#f08a24') : '#f7f9fd', stroke:on ? (color||'#f08a24') : '#c9d4e4',
      'stroke-width':1.4}, svg);
  }
  s('rect', {x:x, y:y, width:cell*5, height:cell*2, rx:4, fill:'none',
    stroke:'#20304a', 'stroke-width':1.6}, svg);
}

/* ---------------- 面积模型（乘法分配律）---------------- */
function areaModel(svg, opt){
  /* (a + b) × c = a × c + b × c 的一维面积模型：
     一个长方形（长 = a+b，宽 = c），沿长边按 a : b 分成两块，
     两块的面积分别是 a×c 与 b×c，其和等于整块面积。 */
  const o = Object.assign({x:130, y:60, w:320, h:150, a:0.6, b:0.4}, opt||{});
  const ax = o.x + o.w * o.a;
  const right = o.x + o.w;
  /* 整块 */
  s('rect', {x:o.x, y:o.y, width:o.w, height:o.h, rx:4, fill:'#e8f1ff',
    stroke:'#2f6fd0', 'stroke-width':2}, svg);
  /* 两块（a×c 与 b×c），高度与整块一致，保证面积可加 */
  s('rect', {x:o.x, y:o.y, width:ax - o.x, height:o.h, rx:3, fill:'#f08a24', opacity:.9}, svg);
  s('rect', {x:ax, y:o.y, width:right - ax, height:o.h, rx:3, fill:'#1f9d6b', opacity:.88}, svg);
  /* 分割线 */
  s('line', {x1:ax, y1:o.y - 10, x2:ax, y2:o.y + o.h + 10, stroke:'#20304a', 'stroke-width':2.2}, svg);
  /* 标注 */
  label(svg, (o.x + ax)/2, o.y + o.h/2 + 6, 'a × c', {size:15, weight:800, fill:'#fff'});
  label(svg, (ax + right)/2, o.y + o.h/2 + 6, 'b × c', {size:15, weight:800, fill:'#fff'});
  /* 长度标记 a / b 与宽度 c */
  label(svg, (o.x + ax)/2, o.y - 20, 'a', {size:15, weight:700, fill:'#b35c00'});
  label(svg, (ax + right)/2, o.y - 20, 'b', {size:15, weight:700, fill:'#126b47'});
  label(svg, o.x - 18, o.y + o.h/2 + 6, 'c', {size:15, weight:700, fill:'#4b5f7d'});
  return {ax, right};
}
