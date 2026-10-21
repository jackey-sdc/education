"""答案自洽性测试：把标准答案回填到对应填空题，确认引擎判定为"答对了"。
顺带验证：答案归一化、复合答案（多空）、单位处理、选择/填空配对是否正确。
用法： python3 tests/test_answers.py [unit ...]
"""
import pathlib, sys
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
units = sys.argv[1:] or [p.parent.name for p in sorted(ROOT.glob('u*/meta.json'))]
bad = 0

with sync_playwright() as p:
    b = p.chromium.launch()
    for u in units:
        pg = b.new_page()
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto((ROOT / u / 'index.html').as_uri())
        pg.wait_for_timeout(400)
        data = pg.evaluate("()=>window.__QUIZ_DATA__")
        # 逐档：选择题答案先验，再验填空题
        good = badn = 0
        fails = []
        for g in data:
            # 选择题：点正确选项，应显示"答对了"
            for i, q in enumerate(g['choice']):
                ans = q['a'] if isinstance(q['a'], list) else [q['a']]
                ok = pg.evaluate("""([host,idx,ans])=>{
                  const qs=[...document.querySelectorAll(host+' .q')].filter(q=>q.querySelector('.opts'));
                  const q=qs[idx];
                  if(!q) return 'missing';
                  q.querySelectorAll('.opt')[ans[0]].click();
                  return q.querySelector('.fb').classList.contains('good') ? 'ok' : 'no';
                }""", ['#'+g['key']+'Block', i, ans])
                if ok == 'ok': good += 1
                else: badn += 1; fails.append(f"[{g['key']}] 选择题 {i+1} {ok}")
            # 填空题：按顺序回填
            fills = g['fill']
            if fills:
                res = pg.evaluate("""([host,list])=>{
                  const qs=[...document.querySelectorAll(host+' .q')].filter(q=>q.querySelector('input[type=text]'));
                  const out=[];
                  qs.forEach((q,i)=>{
                    const a=(list[i]&&list[i].a);
                    const arr=Array.isArray(a)?a:[a];
                    const inputs=[...q.querySelectorAll('input[type=text]')];
                    if(inputs.length===1){
                      inputs[0].value=arr[0];
                    } else {
                      inputs.forEach((inp,k)=>{ inp.value = arr[k]!==undefined?arr[k]:''; });
                    }
                    const btn=[...q.querySelectorAll('button')].find(b=>b.textContent.includes('检查'));
                    if(btn) btn.click();
                    out.push(q.querySelector('.fb').classList.contains('good'));
                  });
                  return out;
                }""", ['#'+g['key']+'Block', fills])
                for i, ok in enumerate(res):
                    if ok: good += 1
                    else: badn += 1; fails.append(f"[{g['key']}] 填空题 {i+1}: {fills[i]['q'][:46]}")
        # 附加检查：每道填空题的"空数"必须与答案个数一致
        mismatch = pg.evaluate("""()=>{
          const out=[];
          (window.__QUIZ_DATA__||[]).forEach(g=>{
            const qs=[...document.querySelectorAll('#'+g.key+'Block .q')].filter(q=>q.querySelector('input[type=text]'));
            const fills=g.fill||[];
            qs.forEach((q,i)=>{
              const blanks=(q.querySelector('.qt').textContent.match(/（\\s*）/g)||[]).length;
              const a=fills[i]&&fills[i].a;
              const n=Array.isArray(a)?a.length:1;
              if(blanks!==n) out.push(g.key+' 第'+(i+1)+'题：题干 '+blanks+' 空 / 答案 '+n+' 个');
              const ins=q.querySelectorAll('input[type=text]').length;
              if(ins!==blanks) out.push(g.key+' 第'+(i+1)+'题：渲染 '+ins+' 个输入框 / 应为 '+blanks);
            });
          });
          return out;
        }""")
        if mismatch:
            print('    ⚠️ 空数与答案个数不一致：')
            for m in mismatch: print('      ', m)
            badn += len(mismatch)
        total = good + badn
        print(f"{'✅' if badn==0 else '❌'} {u}: {good}/{total} 题回填标准答案判定正确")
        for f in fails[:12]: print('    未通过：', f)
        if errs: print('    JS 报错：', errs)
        bad += (1 if (badn or errs) else 0)
        pg.close()
    b.close()
print('\n=== 全部通过 ✅ ===' if not bad else '\n=== 存在失败 ===')
sys.exit(1 if bad else 0)
