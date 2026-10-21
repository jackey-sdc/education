# education

教学资源仓库。

## 课件

| 路径 | 说明 |
|---|---|
| `primary/angles_measurement/` | 《角的认识与度量》四年级数学互动课件（单文件 HTML + 教案 + 自检脚本） |
| `primary/clock/`、`primary/ball_collision/` | 小学阶段其他课件 |
| `stars/`、`trinity/` | 其他学段资源 |

课件统一放在平台左侧目录（见 `index.html` 的「小学教育」分类），点击即可在 iframe 中打开。

- **左侧目录栏可点击隐藏**：点左上角 ☰ 收起目录，内容区铺满整屏；收起后左边缘出现竖排把手，点它展开（状态记忆在 localStorage）。
- **四年级数学课件自带左侧章节栏**：单元页左侧列出各动画模块与练习区，可跳转并随滚动高亮；
  点右上角「☰ 章节栏」同样可收起。窄屏自动变为抽屉式。

## 工具

| 路径 | 说明 |
|---|---|
| `skills/courseware-builder/` | **课件生成 skill**：做新的互动课件时照它的流程和验收标准走 |

启用（安装到 Codex 技能目录，之后新会话即可自动发现）：

```bash
bash skills/courseware-builder/install.sh          # 幂等，可重复执行
python3 skills/courseware-builder/scripts/self_check.py   # skill 自身健康检查
```

skill 包含：

| 文件 | 作用 |
|---|---|
| `SKILL.md` | 通用流程与三条原则（口径先行 / 证据优先 / 模块化）、自迭代协议 |
| `LESSONS.md` | 经验沉淀表（每条带根因、预防规则、回归测试出处） |
| `CHANGELOG.md` | skill 自身的版本记录 |
| `templates/lesson-template.html` | 可直接运行的独立课件骨架 |
| `templates/visual_test.py` | 四层自检脚本（结构/内容/交互/视觉，含几何断言） |
| `references/pipeline.md` | `primary/grade4_math_2026` 单元流水线与共享引擎 API |
| `references/{graphics,patterns,pedagogy,checklist}.md` | 绘图正确性、可视化模式、练习设计、交付清单 |

**改动 skill 后固定三步**：改 → `bash install.sh` 同步 → `python3 scripts/self_check.py` 体检。
