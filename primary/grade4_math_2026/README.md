# 人教版四年级数学上册 · 动画课件（2026 秋）

依据**人教版（2024 年审定）四年级数学上册**教材，为 2026 年秋季学期整理的整套
"**课程大纲 + 动画课件 + 分层练习**"。全部课件为**单文件、零依赖、离线可用**，
双击 `index.html` 即可在教室电脑上直接上课。

## 目录结构

```
primary/grade4_math_2026/
├── index.html              # 课程总览（单元地图 / 教学流程 / 易错点速查 / 评价建议）
├── README.md               # 本文件
├── build.py                # 构建脚本：assets/ + 各单元源码 → 各单元 index.html
├── assets/
│   ├── style.css           # 共享样式（含打印样式）
│   └── engine.js           # 共享引擎：SVG 绘图工具 + 分层练习引擎 + 答案区
├── u1_big_number/          # 第一单元 万以上数的认识
├── u2_angle/               # 第二单元 角的度量
├── u3_multiply/            # 第三单元 多位数乘两位数
├── u4_models/              # 第四单元 加法模型和乘法模型
├── u5_parallelogram/       # 第五单元 平行四边形和梯形
├── u6_barchart/            # 第六单元 条形统计图
├── u7_practice/            # 第七单元 复习与关联（含数学广角、综合实践）
└── tests/
    ├── test_unit.py        # 单元回归测试（JS 报错 / 交互巡检 / 样式自检）
    ├── test_answers.py     # 答案自洽性测试（回填标准答案应全部判定正确）
    └── make_preview.py     # 生成各单元预览图
```

每个单元目录内含：`index.html`（主课件）、`教案.md`、`README.md`、
`preview.png` / `preview_full.png`、`tests/test_unit.py`。

## 教材对照（2026 秋 · 人教版四上）

| 单元 | 内容 | 课时 | 课件 | 动画模块 | 练习题 |
|---|---|---|---|---|---|
| 一 | 万以上数的认识（含《1亿有多大》） | 8 | `u1_big_number/` | 6 | 35 |
| 二 | 角的度量 | 8 | `u2_angle/` | 5 | 40 |
| 三 | 多位数乘两位数 | 9 | `u3_multiply/` | 5 | 40 |
| 四 | 加法模型和乘法模型 | 6 | `u4_models/` | 5 | 40 |
| 五 | 平行四边形和梯形 | 9 | `u5_parallelogram/` | 6 | 40 |
| 六 | 条形统计图 | 5 | `u6_barchart/` | 4 | 31 |
| 七 | 复习与关联（含鸡兔同笼、《寻找宝藏》） | 5 | `u7_practice/` | 6 | 33 |

**合计：37 个交互动画模块、259 道分层练习题，每题均有解析。**

## 课件设计约定

- **三层练习**：巩固基础（概念过关）→ 动手操作（读图/操作）→ 扩展思维（推理迁移），
  每档独立计分、可单独重做。
- **反馈策略**：答错只给**提示**并指回对应动画模块，**不泄露答案**；答对才给**解析**。
- **陷阱题**：把最高频错误做成干扰项（115° 读成 65°、改写与近似数混淆、
  纵轴刻度不足导致直条出格、鸡兔同笼不检验等）。
- **答案区**：集中折叠在页面末尾，便于讲评与打印；内置 `@media print` 样式，
  打印时隐藏导航与按钮。

## 使用方式

1. **教师演示**：打开 `index.html` → 进入某个单元 → 顶部导航切换模块 → 全屏（F11）。
2. **学生练习**：把单元的 `index.html` 发到学生电脑（或局域网共享），学生作答后展开答案自评。
3. **打印讲评**：展开"答案与解析" → Ctrl/Cmd+P（打印样式已内置）。

## 源码与重建

单元课件是**构建产物**。修改流程：

```bash
# 1. 改共享样式 / 引擎
vim assets/style.css assets/engine.js

# 2. 改某个单元的内容与逻辑
vim u1_big_number/body.html u1_big_number/app.js

# 3. 重新构建（全部或单个单元）
python3 build.py              # 构建全部
python3 build.py u1_big_number # 只构建一个

# 4. 回归测试
python3 tests/test_answers.py            # 答案自洽性
python3 u1_big_number/tests/test_unit.py # 单元巡检

# 5. 重新生成预览图
python3 tests/make_preview.py
```

### 绘图约定（改动画前必读）

- 角度一律用**数学正方向（逆时针）为正**，坐标换算统一走 `polar()`（SVG 的 y 轴向下，需翻 y）。
- 圆弧统一走 `arcPoints()`，`sweep` 固定 0，不要手写 `A` 命令；起止角满足 `end = start + span`。
- 画角统一走 `drawAngle()`（自动处理"走短弧"，避免弧线绕远路）。
- 数据用数组描述，渲染函数**全量重绘**，不做增量更新。
- 圆周数字沿切向排版并加白色描边光晕（`haloText`），避免被射线压住。

## 自检（可选）

```bash
pip install playwright && playwright install chromium
python3 tests/test_answers.py            # 259 题回填标准答案，应全部判定正确
python3 u2_angle/tests/test_unit.py       # 单个单元：JS 报错 / 交互巡检 / 样式自检
```

> 注：`tests/test_unit.py` 还会检查 **CSS 自定义属性是否生效**——
> 早期版本曾因 `:root` 规则被破坏导致按钮白底白字、肉眼极易漏检，因此此项已固化为自动断言。
