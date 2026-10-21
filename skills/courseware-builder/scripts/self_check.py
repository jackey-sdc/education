#!/usr/bin/env python3
"""
skill 自身健康检查（自迭代的安全网）
====================================
检查：
  1. 结构：SKILL.md 存在、frontmatter 完整、name 与目录名一致
  2. 引用：SKILL.md 里提到的 references/ templates/ scripts/ 文件都真实存在
  3. 语法：所有 .py 能通过编译；模板 HTML 含关键标记
  4. 记忆：LESSONS.md 每条经验都带回归测试出处；CHANGELOG 有版本记录
  5. 漂移：已安装副本（~/.codex/skills/<name>）与仓库源是否一致

运行： python3 scripts/self_check.py
"""
import hashlib, pathlib, py_compile, re, sys, tempfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
NAME = ROOT.name
SKILLS_DIR = pathlib.Path.home() / ".codex" / "skills"
INSTALLED = SKILLS_DIR / NAME

fails, warns = [], []


def ok(msg):
    print(f"✅ {msg}")


def bad(msg):
    print(f"❌ {msg}")
    fails.append(msg)


# ---------- 1. 结构 ----------
skill = ROOT / "SKILL.md"
if not skill.exists():
    bad("缺少 SKILL.md")
    print("\n=== 失败 ===")
    sys.exit(1)
txt = skill.read_text(encoding="utf-8")
fm = re.match(r"^---\n(.*?)\n---", txt, re.S)
if not fm:
    bad("SKILL.md 缺少 YAML frontmatter")
else:
    name = re.search(r"^name:\s*(\S+)", fm.group(1), re.M)
    desc = re.search(r"^description:\s*(.+)", fm.group(1), re.M | re.S)
    if not name:
        bad("frontmatter 缺 name")
    elif name.group(1) != NAME:
        bad(f"frontmatter name({name.group(1)}) 与目录名({NAME}) 不一致")
    else:
        ok(f"frontmatter 完整，name = {name.group(1)}")
    if not desc:
        bad("frontmatter 缺 description")
    else:
        ok(f"description 长度 {len(desc.group(1))} 字符")

# ---------- 2. 引用完整性 ----------
refs = set(re.findall(r"`((?:references|templates|scripts)/[\w./-]+)`", txt))
refs |= set(re.findall(r"`(LESSONS\.md|CHANGELOG\.md|install\.sh)`", txt))
for r in sorted(refs):
    p = ROOT / r
    if p.exists():
        ok(f"引用存在：{r}")
    else:
        bad(f"引用缺失：{r}")

# ---------- 3. 语法 ----------
for py in sorted(ROOT.rglob("*.py")):
    if "__pycache__" in str(py):
        continue
    try:
        py_compile.compile(str(py), doraise=True, cfile=str(pathlib.Path(tempfile.gettempdir()) / (py.stem + ".pyc")))
        ok(f"语法 OK：{py.relative_to(ROOT)}")
    except Exception as e:
        bad(f"语法错误 {py.relative_to(ROOT)}: {e}")

tpl = ROOT / "templates" / "lesson-template.html"
if tpl.exists():
    h = tpl.read_text(encoding="utf-8")
    for marker, desc in [("function arcPoints", "弧线 helper"),
                         ("function polar", "极坐标 helper"),
                         ("mountQuizInto", "练习引擎"),
                         ("@media print", "打印样式")]:
        (ok if marker in h else bad)(f"模板含 {desc}" + ("" if marker in h else f"（缺 {marker}）"))
else:
    bad("缺少 templates/lesson-template.html")

# ---------- 4. 经验档案 ----------
lessons = ROOT / "LESSONS.md"
if lessons.exists():
    rows = [l for l in lessons.read_text(encoding="utf-8").splitlines()
            if l.startswith("|") and not re.match(r"^\|[\s\-|]+\|$", l)]
    rows = [r for r in rows if not r.startswith("| # ")]
    for r in rows:
        cells = [c.strip() for c in r.strip("|").split("|")]
        if len(cells) < 6:
            bad(f"LESSONS 行缺列：{r[:40]}…")
        elif not any(k in r for k in ("断言", "测试", "检查", "截图", "assert", "test", "check")):
            warns.append(f"LESSONS 行未注明回归测试：{r[:40]}…")
    ok(f"LESSONS 共 {len(rows)} 条经验")
else:
    bad("缺少 LESSONS.md")

chlog = ROOT / "CHANGELOG.md"
if chlog.exists() and re.search(r"^## \[", chlog.read_text(encoding="utf-8"), re.M):
    ok("CHANGELOG 有版本记录")
else:
    bad("CHANGELOG.md 缺少版本记录")

# ---------- 5. 安装副本漂移 ----------
def digest(root: pathlib.Path):
    out = {}
    for p in sorted(root.rglob("*")):
        if p.is_file() and "__pycache__" not in str(p) and not p.name.endswith(".pyc"):
            out[str(p.relative_to(root))] = hashlib.md5(p.read_bytes()).hexdigest()
    return out

if not INSTALLED.exists():
    warns.append(f"未安装到 {INSTALLED}（运行 bash install.sh）")
else:
    a, b = digest(ROOT), digest(INSTALLED)
    diff = [k for k in set(a) | set(b) if a.get(k) != b.get(k)]
    if diff:
        bad(f"安装副本与仓库源不一致（{len(diff)} 个文件）：{', '.join(diff[:5])}"
            f"{' …' if len(diff) > 5 else ''} → 运行 bash install.sh 同步")
    else:
        ok(f"安装副本与仓库源一致（{len(a)} 个文件）")

for w in warns:
    print(f"⚠️  {w}")
print("\n=== skill 健康 ===" if not fails else "\n=== 存在问题，需修复 ===")
sys.exit(1 if fails else 0)
