# 本仓库的单元课件流水线（新增课件的主路径）

`education/primary/grade4_math_2026/` 已有一套"多份源码 → 单文件课件"的构建流水线。
**在本仓库做系列课件时走这条路径**，不要另起炉灶。

```
primary/grade4_math_2026/
├── assets/
│   ├── style.css      # 共享样式（CSS 变量、卡片、题目、答案区、打印样式）
│   └── engine.js      # 共享引擎（DOM/SVG 工具 + 分层练习引擎 + 答案区生成）
├── u1_big_number/     # 单元目录（教材顺序）
│   ├── meta.json      # 元数据：标题/导航/档位/上下单元
│   ├── body.html      # 内容骨架（含 <!--QUIZ--> <!--ANSWERS--> 占位符）
│   ├── app.js         # 该单元的数据 + 渲染逻辑 + bootCourse(...)
│   └── index.html     # ⚙️ 构建产物（由 build.py 生成）
├── build.py           # 构建脚本
```

## 一、新增一个单元的步骤

1. **建目录** `uN_主题/`（N 按教材单元顺序，如 `u2_angle`）。
2. **写 `meta.json`**：
   | 字段 | 说明 |
   |---|---|
   | `id` | 单元标识，与目录名一致 |
   | `title` / `subtitle` | 课题 / 副标题（教材版本 + 单元 + 内容范围） |
   | `accent` | `{"--accent","--accent-l","--accent-d"}` 主题色；缺省用蓝 |
   | `badges` | 顶部徽章文案数组，如 `["8 个课时","分层练习 30 题"]` |
   | `nav` | `[["#锚点","① 标题"], …]`，顺序即页面顺序 |
   | `tiers` | 三档练习：`{key,tag,title,desc}`，key 用 `basic/hand/ext` |
   | `prev` / `next` | 相邻单元的相对路径，**记得把链子接上** |
   | `foot` | 页脚版权行 |
3. **写 `body.html`**：只写内容与结构，练习区放占位符：
   ```html
   <!--QUIZ-->      <!-- 由 build.py 替换为三档练习卡 -->
   <!--ANSWERS-->   <!-- 由 build.py 替换为答案折叠区 -->
   ```
   动图容器用 `<div id="xxx" class="stage"></div>`，由 `app.js` 填充。
4. **写 `app.js`**：数据 + 渲染 + 最后调用
   ```js
   bootCourse([
     {key:'basic', title:'第一档 · 巩固基础（…）', prefix:'基',
      choice:BASIC_CHOICE, fill:BASIC_FILL,
      host:'#basicBlock', score:'#scoreBasic', total:'#totalBasic', reset:'#btnResetBasic'},
     {key:'hand',  title:'第二档 · 动手操作（…）', prefix:'动', …},
     {key:'ext',   title:'第三档 · 扩展思维（…）', prefix:'拓', …}
   ]);
   ```
5. **构建**：
   ```bash
   cd primary/grade4_math_2026
   python3 build.py            # 构建全部单元
   python3 build.py u2_angle   # 只构建指定单元
   ```
   产物 `uN_xxx/index.html` 是**零依赖单文件**，双击即用。
6. **验收**（见 SKILL.md 的四层自检，指向构建产物 `index.html`）：

   ```bash
   cd primary/grade4_math_2026
   python3 tests/audit.py                 # 四层验收（结构/内容/交互/视觉），对全部单元
   python3 tests/audit.py u2_angle        # 只查一个单元
   python3 tests/test_answers.py          # 回填标准答案，验证题答自洽
   python3 u2_angle/tests/test_unit.py    # 该单元的几何断言 + 交互巡检
   ```

   ⚠️ **`test_answers.py` 只能验证"内部自洽"，验证不了"答案本身对不对"**：
   引擎与题目数据同源，`a:` 下标写错时引擎照样判"答对"。
   因此**必须再加一道"独立复算"验收**（见下方"四下册流水线"）。

   - `tests/audit.py` 是**流水线版的四层验收**：外部资源扫描、导航锚点、
     "显示题数 == 标称题数"、题目数 == 答案数 == 解析数、计分与重做、
     **答错不泄露答案**、填空答案归一化、打印模式、**SVG 出框**（`getBBox()` vs `viewBox`）。
   - 各单元 `tests/test_unit.py` 的 `ASSERTS` 写**本单元特有**的几何断言
     （"图 = 数"同源，例如竖式结果 == a×b、条形高度 ∝ 数值）。
   - 断言前必须先 `reload()` 并显式设定参数——交互巡检会留下残留状态（LESSONS #7）。
7. **接链**：把新单元登记进平台 `index.html` 左侧目录，并更新前后单元的 `prev`/`next`。

## 二、共享引擎已提供的 API（**不要重复造轮子**）

| 函数 | 用途 |
|---|---|
| `s(tag, attrs, parent)` | 创建 SVG 元素（带命名空间） |
| `clear(node)` | 清空容器（全量重绘的基础） |
| `polar(cx,cy,r,deg)` | 极坐标换算，**数学正方向 = 逆时针** |
| `arcPoints(cx,cy,r,start,span)` | **数学逆时针弧**，sweep 固定 0（已固化本仓库最大的坑） |
| `haloText(parent,x,y,str,deg,opt)` | 沿切向旋转 + 白色描边光晕的圆周文字 |
| `label(parent,x,y,str,opt)` | 常规文字 |
| `fmt(n)` / `cn2num(s)` / `norm(v)` | 千分位 / 中文数字互转 / 答案归一化 |
| `makeCounter(scoreId,totalId,total)` / `updateCounter(c)` | 计分器 |
| `mountQuizInto(host,items,c,prefix,offset)` | 渲染一组题，返回重做函数 |
| `renderAnswers(hostSel,groups)` | 渲染答案区 |
| `bootCourse(groups)` | **一键装配三档练习 + 答案区 + 重做按钮** |

题目数据结构：
```js
// 选择题
{q:'题干', opts:['A项','B项','C项'], a:1, why:'解析', hint:'答错提示'}
// 填空题（a 可以是数组表示多种写法）
{q:'题干：（　）', a:['180'], why:'解析', hint:'提示'}
```

## 三、流水线带来的新坑

- **构建产物与源码可能不同步**：改了 `assets/` 或 `app.js` 后必须重新 `python3 build.py`；
  验收要验**产物**，不是源码。
- **`nav` 锚点必须与 body.html 的 section id 一致**，否则导航点不动。
- **`tiers` 的 key 必须与 app.js 里 `bootCourse` 的 `host/score/total/reset` 对应**，
  否则该档练习不显示。
- **共享 engine.js 是全局资产**：改它会影响所有单元，改完必须把所有单元都构建并回归一遍。
- **`prev`/`next` 链**：新增单元后要同时更新前后单元的 meta，否则导航断裂。

## 四、独立单文件模式（跨学科或一次性课件）

不适合流水线时，用 `templates/lesson-template.html` 做**单文件零依赖课件**：
结构、工具层、练习引擎都已内置，直接复制改写即可（区别：没有构建步骤，改完即生效）。


---

## 四下册流水线（`primary/grade4_math_2027/`）

与人教版（2024 年审定）**四年级数学下册**配套，目录结构、共享引擎、验收脚本与四上册完全同构，
可整套照搬。新增的差异只有一处——**多了一道"独立复算"验收**。

```bash
cd primary/grade4_math_2027
python3 build.py                          # 构建全部单元
python3 tests/audit.py                   # 四层验收
python3 tests/test_answers.py            # 题答自洽
python3 tests/check_answers.py           # ★ 选择题答案独立复算（防答案下标写错）
python3 u5_decimal_add/tests/test_unit.py # 单元几何断言 + 交互巡检 + 结论可达性
```

### ① 为什么要"独立复算"

`test_answers.py` 把标准答案回填进引擎，看引擎是否判"答对"。
它验证的是**引擎与题目数据自洽**——如果 `a:2` 本该是 `a:1`，
两者一起错，测试**照样全绿**。

`check_answers.py` 换一条路走：**从题干里解析出算式，用 Python 独立算出答案**，
再和 `a:` 指向的**选项文本**比对。两个数据源相互独立，才能互相证伪。

```python
extract_expr(q)  # 从题干取"要算的算式"，并判断是不是问"商"（商要取整数商）
eval_arith(expr, int_div)  # 用 Decimal 精确计算（支持括号、优先级）
```

要点：
- **用 `Decimal` 不用 float**：`5 − 3.68` 用 float 得 `1.3199999999999998`，会误判。
- **区分"结果"和"商"**：`892 ÷ 22` 问的是**商**（整数商 40），不是精确商 40.5454。
- **题干的问法要能识别**（"结果""得数""商""积""和""差"），否则不该复算。

### ② 共享 helper 的两条纪律

1. **不得覆盖宿主 svg 的 `viewBox`**：`numberLine()` 曾擅自 `setAttribute('viewBox', ...)`，
   把同一张 svg 里画的其他元素全部挤出画布。正确做法是
   `if (!svg.getAttribute('viewBox')) { … }`——**画布尺寸归调用方所有**。
2. **分步演示的"结论态"要可达**：`step` 统一约定可取到 `steps.length`（结论态），
   渲染时用 `steps[steps.length-1]` 兜底。若按钮夹在 `length-1` 而渲染判断 `>= length`，
   **每个模块的"教学口径"总结都永远看不到**——而且测试不一定能发现。

### ③ 新增回归断言：`CONCLUSION_ASSERTS`

```python
CONCLUSION_ASSERTS = {
    'u1_divide': [('#btnDivAll', '#divNote', '竖式三句话')],
    'u5_decimal_add': [('#btnLawAll', '#lawNote', '整数加法、乘法的运算律')],
}
# 点"完整演示"后，断言结论文本确实出现在提示区
```
