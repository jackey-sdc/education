#!/usr/bin/env python3
"""**答案与题意校验器模板**（courseware-builder · L2 独立复算 + L3 解析交叉 + L4 语义）

用法（拷进课件目录的 tests/ 后按需改）：
    cp templates/check_answers.py <课件目录>/tests/check_answers.py
    python3 tests/check_answers.py [unit ...]

它检查：
    L2 独立复算 —— 用 Python 重新算一遍，答案算错了也能发现
    L3 交叉校验 —— 答案(a:) 与 解析(why:) 是分别写的，抓它们打架
    L4 语义检查 —— 题干前提、条件完整性、结果类型、单位/数位、图形模型、
                   选项唯一性、steps 是否与答案一致

⚠️ 改完规则必须做**植入测试**：植入一处该规则应抓到的错 → 必须报；还原 → 必须全绿。
   校验脚本自己出错时，输出同样是"全部通过 ✅"，和真的通过一模一样。

⚠️ 按课件调整：
   1) CHOICE_KEYS / FILL_KEYS —— 本册的档位数组名；
   2) ITEM_RE / FILL_ITEM_RE —— 若字段名不是 q/opts/a/why/steps；
   3) ALLOW_NEGATIVE_RESULTS —— 低年级默认 False，引入负数后可改 True；
   4) check_semantic_rules() 里是**数学示例规则**，其他学科请替换成对应口径检查。

原理与规则详见 skill 的 `references/answers.md`。
"""
import pathlib, re, sys, json
from decimal import Decimal as D

ROOT = pathlib.Path(__file__).resolve().parent.parent
UNITS = sys.argv[1:] or [p.parent.name for p in sorted(ROOT.glob('u*/meta.json'))]

# ⚠️ 按课件改：档位数组名 / 字段名 / 是否允许负数 / 学科语义规则。

# 题目里出现的算式 → 独立复算函数
def eval_arith(expr, int_div=False):
    """精确算术（Decimal），支持 + - * / 与括号；
       int_div=True 时除法取整数商（对应"商是（　）"这类题）。"""
    e = expr.strip()
    if not re.fullmatch(r'[\d\s\.\+\-\*/\(\)]+', e):
        return None
    if not re.search(r'\d', e):
        return None
    # 把数字字面量替换成 Decimal(...)，保证精度与优先级
    def repl(m):
        return "D('" + m.group(0) + "')"
    src = re.sub(r'\d+(?:\.\d+)?', repl, e)
    try:
        if int_div:
            src = src.replace('/', '//')
            val = eval(src, {'__builtins__': {}, 'D': D}, {})
        else:
            val = eval(src, {'__builtins__': {}, 'D': D}, {})
    except Exception:
        return None
    return D(str(val)) if isinstance(val, (int, float, D)) else None

def extract_expr(q):
    """从题干里取出"要算的算式"，并判断是不是问"商"。
       返回 (算式, 是否取整数商) 或 None。
       规则：
         · 题干必须以"是（　）"收尾（问结果）
         · 取"是（　）"之前**最靠近**的一段由数字和运算符组成的连续串
         · 出现"商"字则除法按整数商算（竖式除法的商）
    """
    if '（　）' not in q:
        return None
    head = q.split('（　）')[0]
    # 提问短语：结果 / 得数 / 商 / 积 / 和 / 等于
    ask = None
    for kw in ['结果', '得数', '商', '积', '和', '差']:
        if head.rstrip('：: ').endswith(kw) or re.search(kw + r'[是为]?\s*$', head):
            ask = kw
            break
    if ask is None:
        return None
    # 取靠近"是（　）"的最后一个连续算式段
    # 操作数：数字 或 括号表达式
    NUM = r'(?:\d+(?:\.\d+)?|\([^()]*\))'
    runs = re.findall(NUM + r'(?:\s*[+\-−*/×÷]\s*' + NUM + r')+', head)
    if not runs:
        return None
    expr = runs[-1].replace('×','*').replace('÷','/').replace('−','-')
    return expr, (ask == '商')

UNIT_WORDS = ['°', '度', '元', '%', 'cm', '厘米', '千米', '米', '棵', '本', '个',
              '人', '次', '倍', '页', '题', 'kg', '分', '秒']


def norm_num(x):
    """把数字统一成可比较的字符串（去掉末尾 0，保留整数形态）。
    先剥掉单位/符号（°、度、元、%、cm…），否则带单位的选项会被整体跳过。
    **只认"单个数"**：'3 cm、4 cm、5 cm' 这类复合选项必须判为"非数字"，
    否则把单位一删就粘成 345，误判成数值型答案。"""
    if isinstance(x, str):
        t = x
        for u in UNIT_WORDS:
            t = t.replace(u, '')
        t = t.replace(' ', '')
        # 复合选项（多个数连排）一律不当数值
        if not re.fullmatch(r'-?\d+(?:\.\d+)?', t):
            return None
        try:
            x = D(t)
        except Exception:
            return None
    if isinstance(x, D):
        x = x.normalize()
        if x == x.to_integral_value():
            return str(int(x))
        return format(x, 'f')
    return None


# ---------- 2. 统一的题目解析器（避免各函数各写一套正则而互相漏配） ----------
# why 可能是多段拼接：'第一段' + '第二段' + '第三段'…
# ⚠️ 旧版只捕获**最多两段**，第三段以后被丢弃 → 解析被截断，
#    结论值取不到、"信息不足"的理由读不到 → 大量误报。
ITEM_RE = re.compile(
    r"\{\s*q:'((?:[^'\\]|\\.)*)'\s*,\s*opts:\[(.*?)\]\s*,\s*a:(\d+)\s*,\s*"
    r"why:\s*((?:'(?:[^'\\]|\\.)*'\s*(?:\+\s*)?)+)", re.S)
WHY_SEG = re.compile(r"'((?:[^'\\]|\\.)*)'")
CHOICE_KEYS = ['BASIC_CHOICE', 'HAND_CHOICE', 'EXT_CHOICE', 'STAR5_CHOICE']
FILL_KEYS = ['BASIC_FILL', 'HAND_FILL', 'EXT_FILL', 'STAR5_FILL']
ALLOW_NEGATIVE_RESULTS = False  # 四年级及以下默认不引入负数；高年级可改 True


def parse_choice_items(app, key):
    """把一个 *CHOICE 数组解析成 [{q, opts, a, why}]。
    ⚠️ 历史坑：`Pattern.finditer(body)` 的第二参数是 **pos**，不是 flags，
    写成 `finditer(body, re.S)` 会静默丢掉 re.S，多行 opts 全部漏匹配；
    这里统一用 re.S 编译在 ITEM_RE 里。"""
    m = re.search(rf'const {key} = \[(.*?)\n\];', app, re.S)
    if not m:
        return []
    out = []
    for f in ITEM_RE.finditer(m.group(1)):
        out.append(dict(
            q=f.group(1),
            opts=re.findall(r"'((?:[^'\\]|\\.)*)'", f.group(2)),
            a=int(f.group(3)),
            why=''.join(WHY_SEG.findall(f.group(4) or '')),
        ))
    return out


def clean_text(s):
    """去掉 HTML 标签与标点，只留可比对的文字。"""
    s = re.sub(r'<[^>]+>', '', s)
    return re.sub(r'[，。；、（）()「」"\'\s]', '', s)

def find_items(app, key):
    m = re.search(rf'const {key} = \[(.*?)\n\];', app, re.S)
    if not m:
        return []
    return re.findall(r"\{\s*q:'((?:[^'\\]|\\.)*)'.*?opts:\[(.*?)\].*?a:(\d+)", m.group(1), re.S)

# 「信息不足」类选项与理由词
UNDET_OPTIONS = ['无法确定', '不能确定', '不一定', '无法比较', '信息不足',
                 '条件不足', '无法判断', '都有可能', '不能比较', '无法回答']
UNDET_REASON = re.compile(
    r'没有给出|没给出|未给出|信息不足|条件不足|无法确定|不能确定|不一定|'
    r'取决于|要看|无法判断|都有可能|无法比较')
# 总括型选项（"以上都可以"这类）——解析会逐条罗列子选项，不能用结论去比对
SUMMARY_OPT_RE = re.compile(r'以上|都|均|一切')
# 中文数字表述：答案写 2，解析写"两位小数"
CN_DIGIT = {'0': '零', '1': '一', '2': '两', '3': '三', '4': '四', '5': '五',
            '6': '六', '7': '七', '8': '八', '9': '九', '10': '十'}
NUM_PAT = r'-?\d+(?:\.\d+)?'
UNIT_PAT = (r'(?:\s*(?:°|度|元|%|cm|厘米|千米|米|棵|本|个|人|次|倍|页|题|kg|分|秒))?')
# 解析里"明确结论"的措辞
CONCLUSION_RES = [re.compile(p) for p in [
    r'答案是\s*(' + NUM_PAT + UNIT_PAT + ')',
    r'结果是\s*(' + NUM_PAT + UNIT_PAT + ')',
    r'得数是\s*(' + NUM_PAT + UNIT_PAT + ')',
    r'商是\s*(' + NUM_PAT + UNIT_PAT + ')',
    r'平均数是\s*(' + NUM_PAT + UNIT_PAT + ')',
    r'周长是\s*(' + NUM_PAT + UNIT_PAT + ')',
    r'(?:所以|因此|可见|从而|故)[^，。；]{0,16}?是\s*(' + NUM_PAT + UNIT_PAT + ')',
]]


def plain(text):
    """去掉 <b>/<i> 等表现层标签。
    ⚠️ 实战坑：课件里结论值常写成 '= <b>168</b>。'
    不剥标签就取不出结论值 → 把对的题误报成错。"""
    return re.sub(r'<[^>]+>', '', text)


def why_numbers(why):
    """解析里出现过的所有数值（含正负号），去重保序。"""
    out = []
    for v in re.findall(NUM_PAT + UNIT_PAT, plain(why)):
        n = norm_num(v)
        if n is not None and n not in out:
            out.append(n)
    return out


ARROW_CONCL = re.compile(r'→\s*(' + NUM_PAT + r')' + UNIT_PAT)


def arrow_conclusion(why):
    """解析里用箭头 '→' 指出的**最终结果**。
    箭头在课件里专表"算到这里"，比等号可靠：
      · 等号后面可能是中间步骤（'425 ÷ 25 = 17，……175 ÷ 25 商 7'）；
      · 也可能是验算（'22 × 40 = 880，880 + 12 = 892'）；
    而 '→ 1000' 一定是这一步的结论。"""
    ms = list(ARROW_CONCL.finditer(plain(why)))
    if not ms:
        return None
    return norm_num(ms[-1].group(1))


def conclusion_number(why):
    """从解析里抽取"明确写出的结论数值"，抽不到返回 None。"""
    for rx in CONCLUSION_RES:
        ms = list(rx.finditer(plain(why)))
        if ms:
            return norm_num(ms[-1].group(1))
    return None


def cn_number_present(value, why):
    """答案写阿拉伯数字、解析写中文数字（2 ↔ 两位）时也算命中。"""
    m = re.fullmatch(r'-?(\d+)', value or '')
    if not m:
        return False
    d = m.group(1)
    return d in CN_DIGIT and bool(
        re.search(CN_DIGIT[d] + r'(?:位|个|次|人|页|题|棵|本|条)', why))


def equal_conclusions(why):
    """解析里所有 `= 纯数字` 的值（真正的"结论型"等号）。
    '平均数 = 总数量 ÷ 总份数' 这类公式不算（等号后不是数）。"""
    out = []
    for m in re.findall(r'=\s*(' + NUM_PAT + r')' + UNIT_PAT, plain(why)):
        n = norm_num(m)
        if n is not None and n not in out:
            out.append(n)
    return out


def option_numbers(text):
    """选项里出现的所有数值。"""
    out = []
    for m in re.findall(NUM_PAT, text):
        n = norm_num(m)
        if n is not None and n not in out:
            out.append(n)
    return out


def simple_value_option(text):
    """只含**一个**数值的选项（'17' / '多 2 棵'）才参与"结论冲突"比对。
    '3 cm、4 cm、5 cm'、'7200 ÷ 160' 这类含多个数或含运算符的选项不参与，
    否则中间量会被误判成结论。"""
    vals = option_numbers(text)
    if len(vals) != 1:
        return None
    if norm_num(text) is not None:
        return vals[0]
    if re.fullmatch(r'[多少]\s*-?\d+(?:\.\d+)?\s*(?:棵|个|人|次|倍|页|题|分|秒|元|cm|米)?',
                    clean_text(text)):
        return vals[0]
    return None


ZEROS_WORD = re.compile(r'[添补去][^。；]{0,6}0')


def zeros_related(a, b, why):
    """a 与 b 是否只差若干个 0，且解析里出现了"添/补/去 0"的措辞。
    '25 × 4 = 100，再添 1 个 0 → 1000' —— 100 与 1000 是推导，不是冲突。"""
    if not ZEROS_WORD.search(plain(why)):
        return False
    try:
        da, db = D(a), D(b)
    except Exception:
        return False
    if da == 0 or db == 0:
        return False
    for k in range(1, 6):
        if da == db * (10 ** k) or db == da * (10 ** k):
            return True
    return False


def conclusion_conflicts(key, it, chosen):
    """解析的**等号结论**命中了别的选项数值，而答案值不在结论里 → 冲突。

    实战踩过的坑：
      · '425 ÷ 25 = 15。……' 答案却是 17 —— 解析结论写错了（不是"最后一个等号"能抓的）；
      · '平均数就差 8 ÷ 4 = 2 棵' 答案写成"多 4 棵" —— 解析结论指向"多 2 棵"。
    判定：E = 解析中所有 `= 纯数字` 的值。
      若 答案值 ∉ E，且 E 里命中了**某个非答案选项**的数值 → 报冲突。
    只对"单个数值型选项"生效，避免 '7200 ÷ 160' 这类含中间量的选项被误判。"""
    problems = []
    E = equal_conclusions(it['why'])
    if not E:
        return problems
    mine = simple_value_option(chosen)
    if mine is None:
        return problems
    if mine in E:
        return problems
    others = set()
    for i, o in enumerate(it['opts']):
        if i == it['a']:
            continue
        v = simple_value_option(o)
        if v is not None:
            others.add(v)
    hit = set(E) & others
    # "25 × 4 = 100，再添 1 个 0 → 1000"：解析里的 100 与答案 1000 是**推导**关系，
    # 不是打架 → 这种写法下不报。
    hit = {v for v in hit if not zeros_related(mine, v, it['why'])}
    if hit:
        problems.append(
            f'[{key}] {it["q"][:34]} -> 解析的等号结论是「{sorted(hit)[0]}」，'
            f'但答案选项是「{chosen}」→ 解析与答案打架')
    return problems



# 末句里提到某选项时，若前面带否定词（"D 不存在（…）"），那是**排除**它，不是结论指向它
NEG_CTX = re.compile(r'(不存在|不是|不对|不正确|错|不可能|没有|不成立|不能|不会|要看|注意)')


def mentioned_as_conclusion(tail, opt):
    """末句是否"把该选项作为结论"提出（而非否定掉它）。"""
    i = tail.find(opt)
    if i < 0:
        return False
    prefix = tail[max(0, i - 8):i]
    return not NEG_CTX.search(prefix)

def check_why_consistency(unit):
    """**答案 × 解析 交叉校验**（两条独立书写的字段，必须互为证伪）。

    背景：`a:`（答案下标）与 `why:`（解析）是分别写的，手误就会打架。
    旧的"取解析里最后一个 `= 数字`"启发式不可用——
      · '892 ÷ 22 = 40……12，验算 22 × 40 = 880，880 + 12 = 892。' 最后一个等号是**验算**，不是结论；
      · 多步解析里中间步骤会被误当结论。
    改为按语义分两路：

    ▸ 数值型答案（选项本身是一个数）
      N1 结论数值一致：解析若明确写出结论（"答案是 X"/"所以……是 X"），必须等于答案；
      N2 答案必现：答案的数值必须出现在解析里（中文数字表述也算），
         否则说明解析在讲另一个数 → 下标多半写错了。
    ▸ 定性型答案（选项是一句话）
      Q1 信息不足族：答案属"无法确定"类时，解析必须给出"信息不足"的理由，否则报错；
      Q2 结论选项一致：解析末句若**唯一**命中某个选项，该选项必须是正确答案；
         总括型选项（"以上都可以"）豁免，因为解析会逐条罗列子选项。
    """
    path = ROOT / unit / 'app.js'
    app = path.read_text(encoding='utf-8')
    problems = []
    for key in CHOICE_KEYS:
        for it in parse_choice_items(app, key):
            opts, a, why = it['opts'], it['a'], it['why']
            if a >= len(opts) or not opts[a]:
                continue
            chosen = opts[a]
            cn = norm_num(chosen)
            if cn is not None:
                # ── 数值型 ──
                arrow = arrow_conclusion(why)
                # 箭头值若不是任何一个选项的值，多半是**举例**（'如 0.123 → 1.23'），不据此判错
                opt_vals = {v for v in (simple_value_option(o) for o in opts) if v is not None}
                if arrow is not None and arrow != cn and arrow in opt_vals:
                    problems.append(
                        f'[{key}] {it["q"][:34]} -> 解析的最终结果写的是「{arrow}」，'
                        f'但答案选项是「{chosen}」')
                    continue
                concl = conclusion_number(why)
                if concl is not None and concl != cn:
                    problems.append(
                        f'[{key}] {it["q"][:34]} -> 解析结论写的是「{concl}」，'
                        f'但答案选项是「{chosen}」')
                    continue
                ns = why_numbers(why)
                if ns and cn not in ns and not cn_number_present(cn, why):
                    problems.append(
                        f'[{key}] {it["q"][:34]} -> 答案「{chosen}」在解析里根本没出现'
                        f'（解析中的数值：{sorted(set(ns))}）→ 下标可能写错')
                problems += conclusion_conflicts(key, it, chosen)
            else:
                # ── 定性型 ──
                why_c = clean_text(why)
                # ① 解析把某个选项**否定**掉了（"D 不存在（…）"），而答案却指向它 → 下标写错。
                #    （放在最前面，避免被下面的"信息不足族/总括型"分支提前 continue 掉）
                if '不可能' not in it['q']:
                    neg_hit = [i for i, o in enumerate(opts)
                               if clean_text(o) and len(clean_text(o)) >= 4
                               and clean_text(o) in why_c
                               and not mentioned_as_conclusion(why_c, clean_text(o))]
                    if a in neg_hit:
                        problems.append(
                            f'[{key}] {it["q"][:34]} -> 解析把选项「{chosen}」否定了，'
                            f'但 a:{a} 却指向它')
                        continue
                # ② 答案属"信息不足"族时，解析必须给出理由
                if any(u in chosen for u in UNDET_OPTIONS):
                    if not UNDET_REASON.search(why):
                        problems.append(
                            f'[{key}] {it["q"][:34]} -> 答案写「{chosen}」，'
                            f'但解析没有说明为什么信息不足')
                    continue
                # ③ 总括型选项（"以上都可以"）豁免：解析会逐条罗列子选项
                if SUMMARY_OPT_RE.search(chosen):
                    continue
                # ④ 解析末句若唯一命中某个选项，该选项必须是正确答案
                sents = [x for x in re.split(r'[。；\n]', re.sub(r'<[^>]+>', '', why))
                         if x.strip()]
                tail = clean_text(sents[-1]) if sents else ''
                matched = [i for i, o in enumerate(opts)
                           if clean_text(o) and len(clean_text(o)) >= 4
                           and mentioned_as_conclusion(tail, clean_text(o))]
                # 判据：解析里若出现**多个 `= 数字`**，说明它在逐条罗列每个选项的计算结果
                # （"40 × 60 = 2400；50 × 40 = 2000；…"），末句提到的那个只是最后一个，
                # 不能当成"结论" → 跳过。
                # 反之若整段还提到别的选项（对比说明），末句才是真正的结论。
                enumerating = len(re.findall(r'=\s*\d', why_c)) >= 2
                if len(matched) == 1 and matched[0] != a and not enumerating:
                    problems.append(
                        f'[{key}] {it["q"][:34]} -> 解析结论指向选项「{opts[matched[0]]}」，'
                        f'但 a:{a} 指向「{chosen}」')
                    continue
                # ⑤ 解析里被"支持"的选项集合：答案不在其中、且答案本身没被提到 → 信息不足，跳过
                supported = [i for i, o in enumerate(opts)
                             if clean_text(o) and len(clean_text(o)) >= 4
                             and mentioned_as_conclusion(why_c, clean_text(o))]
                if (supported and a not in supported
                        and chosen in why_c
                        and '不可能' not in it['q']):
                    problems.append(
                        f'[{key}] {it["q"][:34]} -> 解析里支持的是选项「{opts[supported[0]]}」，'
                        f'但 a:{a} 指向「{chosen}」')
                    continue
                # 整个解析里若出现**多个**选项，说明是在对比说明 / 逐条罗列，
                # 末句提到的那个不一定是所选答案 → 不据此判冲突。
                all_hit = [i for i, o in enumerate(opts)
                           if clean_text(o) and len(clean_text(o)) >= 4
                           and clean_text(o) in clean_text(why)]
                if len(matched) == 1 and matched[0] != a and len(all_hit) == 1:
                    problems.append(
                        f'[{key}] {it["q"][:34]} -> 解析结论指向选项「{opts[matched[0]]}」，'
                        f'但 a:{a} 指向「{chosen}」')
                problems += conclusion_conflicts(key, it, chosen)
    return problems


def check_unique_options(unit):
    """检查选择题选项是否**互不相同**，以及"无法确定"类选项的唯一性。
    实战踩过的坑：
      · 同一题里两个选项都成立（如"一个锐角是 30°，另一个是 60°"）→ 题目有多解；
      · 选项重复 → 学生怎么选都对。
    可机械化的部分在这里做；含"无法确定"且答案不是它的，会提示人工确认。"""
    path = ROOT / unit / 'app.js'
    app = path.read_text(encoding='utf-8')
    problems = []
    for key in CHOICE_KEYS:
        for q, optblock, a in find_items(app, key):
            opts = re.findall(r"'((?:[^'\\]|\\.)*)'", optblock)
            if len(opts) != len(set(opts)):
                problems.append(f'[{key}] {q[:34]} -> 选项有重复: {opts}')
            # "无法确定"与具体数值并存时，只有在**题干信息不足**时才是陷阱。
            # 真陷阱：选项里有"无法确定"，而**答案却是一个具体数值**，
            # 且题干说"人数相同"却没给人数 —— 这时"多几"无法确定。
            # （若答案是定性描述如"一定更大"，人数相同已足够判定，不算问题。）
            # ── 陷阱：说"人数相同"却没给人数，答案却写死成具体差值 ──
            # 旧版只在选项含"无法确定"时才查，漏掉了
            # 「人数相同，总数多 8 棵 → 平均数多几棵」这种**没有**"无法确定"选项的题：
            # 人数没给，差值根本算不出来，答案不可能是"多 2 棵"。
            same_n2 = re.search(r'人数相同|同样多|人数一样', q)
            given_n2 = re.search(r'每组\s*\d+\s*人|每班\s*\d+\s*人|\d+\s*人', q)
            if same_n2 and not given_n2:
                picked2 = opts[int(a)]
                if re.match(r'\s*[多少]\s*-?\d', picked2):
                    problems.append(
                        f'[{key}] {q[:34]} -> 人数相同但未给人数，'
                        f'答案不该是具体差值「{picked2}」')
            if '无法确定' in opts and len(opts) > 2 and not opts[int(a)].startswith('无法确定'):
                numeric = re.fullmatch(r'\s*\d+(\.\d+)?\s*', opts[int(a)])
                same_n  = re.search(r'人数相同|同样多', q)
                given_n = re.search(r'每组\s*\d+\s*人|\d+\s*人', q)
                if numeric and same_n and not given_n:
                    problems.append(
                        f'[{key}] {q[:34]} -> 人数相同但未给人数，答案不该是具体值「{opts[int(a)]}」')
    return problems


TARGET_RES = [
    (re.compile(r'积是\s*(\d+(?:\.\d+)?)'), '积', False),
    (re.compile(r'商是\s*(\d+(?:\.\d+)?)'), '商', True),
    (re.compile(r'和是\s*(\d+(?:\.\d+)?)'), '和', False),
    (re.compile(r'差是\s*(\d+(?:\.\d+)?)'), '差', False),
    (re.compile(r'结果是\s*(\d+(?:\.\d+)?)'), '结果', False),
]


def check_option_products(unit):
    """「下面各式中，积是 2400 的是（　）。」这类题：把**每个选项**都算一遍。

    这类题的选项本身就是算式（如 '40 × 60'），
    check_unit 的"从题干取算式"用不上（题干里没有算式），
    所以这里换一条路：从题干取**目标值**，逐个复算选项，看谁等于目标值。"""
    path = ROOT / unit / 'app.js'
    app = path.read_text(encoding='utf-8')
    problems = []
    for key in CHOICE_KEYS:
        for it in parse_choice_items(app, key):
            q, opts, a = it['q'], it['opts'], it['a']
            if a >= len(opts):
                continue
            # 目标值必须紧挨着 '（　）' —— 也就是**被问的那个量**。
            # '一个数除以 15，商是 6，余数最大是（　）' 问的是余数不是商，不能拿来比。
            head = q.split('（　）')[0]
            target = None
            int_div = False
            best = None
            for rx, name, idv in TARGET_RES:
                for m in rx.finditer(head):
                    gap = len(head) - m.end()
                    if gap <= 3 and (best is None or m.end() > best[0]):
                        best = (m.end(), norm_num(m.group(1)), idv)
            if best:
                target, int_div = best[1], best[2]
            if target is None:
                continue
            hits = []
            for i, o in enumerate(opts):
                expr = o.replace('×', '*').replace('÷', '/').replace('−', '-')
                val = eval_arith(expr, int_div)
                if val is None:
                    continue
                if norm_num(val) == target:
                    hits.append(i)
            # 只有一个选项算出来等于目标值时，它必须是答案
            if len(hits) == 1 and hits[0] != a:
                problems.append(
                    f'[{key}] {q[:34]} -> 复算只有「{opts[hits[0]]}」等于 {target}，'
                    f'但 a:{a} 指向「{opts[a]}」→ 下标写错')
    return problems


def check_unit(unit):
    path = ROOT / unit / 'app.js'
    app = path.read_text(encoding='utf-8')
    problems = []
    for key in CHOICE_KEYS:
        for q, optblock, a in find_items(app, key):
            opts = re.findall(r"'((?:[^'\\]|\\.)*)'", optblock)
            if not opts:
                continue
            ai = int(a)
            if ai >= len(opts):
                problems.append(f'[{key}] {q[:34]} -> a:{ai} 超出选项数 {len(opts)}')
                continue
            picked = opts[ai]
            # 题干里取"要算的算式"：要**整段**取出（含优先级与括号），
            # 不能只取第一个 "A op B"（否则 "24+6×5" 会被算成 "24+6"）
            # 估算题（如"估算 302 × 21，最合适的结果是"）的选项是**估算值**，
            # 与精确复算结果本就不相等，不能拿来判下标对错。
            if re.search(r'估算|估一估|大约|约是多少|大约是', q):
                continue
            got = extract_expr(q)
            if not got:
                continue
            lhs, int_div = got
            val = eval_arith(lhs, int_div)
            if val is None:
                continue
            truth = norm_num(val)
            chosen = norm_num(picked)
            if truth is None or chosen is None:
                continue
            if truth != chosen:
                problems.append(
                    f'[{key}] {q[:36]}\n         独立复算 = {truth}，但 a:{ai} 指向的选项是「{picked}」→ ❌ 下标写错')
            else:
                # 复算值必须真的出现在选项里（防止选项本身写错）
                allnorm = [norm_num(o) for o in opts]
                if truth not in allnorm:
                    problems.append(
                        f'[{key}] {q[:36]}\n         独立复算 = {truth}，但选项里没有这个值 → ❌ 选项集合有误')
    return problems



# ── 追及问题的"能不能追上"判断 ──
# 实战教训：追及题算出了"90 ÷ (60 − 45) = 6 小时"，但**追的人（乙车 45）比被追的（甲车 60）更慢**。
# 更关键的是：题干既然问"几小时后追上"，就不能靠把答案改成"无法确定"来补救——
# 这个前提本身不成立，必须改写题目（例如让乙车更快）。纯算术复算抓不到，必须单独建模检查。
SPEED_RE = re.compile(r'([甲乙丙丁A-Z])车?每小时行\s*(\d+(?:\.\d+)?)\s*千米')
FRONT_RE = re.compile(r'([甲乙丙丁A-Z])车?在\s*([甲乙丙丁A-Z])车?前面')
NO_CHASE = ('无法确定', '追不上', '不能追', '不会追上', '无法追上')


def check_chase(unit):
    """追及题：追的人必须**更快**，否则答案不能是具体时间。"""
    problems = []
    path = ROOT / unit / 'app.js'
    app = path.read_text(encoding='utf-8')
    for key in CHOICE_KEYS:
        for it in parse_choice_items(app, key):
            q = it['q']
            if '追上' not in q and '追及' not in q:
                continue
            speeds = {m.group(1): float(m.group(2)) for m in SPEED_RE.finditer(q)}
            fm = FRONT_RE.search(q)
            if len(speeds) < 2 or not fm:
                continue
            front, back = fm.group(1), fm.group(2)
            if front not in speeds or back not in speeds:
                continue
            chosen = it['opts'][it['a']] if it['a'] < len(it['opts']) else ''
            # 追的人 = 后车；只有后车**更快**才追得上
            if speeds[back] <= speeds[front]:
                # 后车不比前车快：若题干仍问"几小时后追上"，是**前提矛盾**，改答案也救不了。
                asks_time = re.search(r'几小时|多少小时|多长时间|何时', q)
                if asks_time:
                    problems.append(
                        f'[{key}] {q[:40]} -> 前车 {front}（{speeds[front]:g} 千米/时）'
                        f'在后车 {back}（{speeds[back]:g} 千米/时）前面，后车更慢，'
                        f'却问"几小时后追上" → 前提不成立，必须改题，不能只把答案改成"无法确定"')
                elif not any(x in chosen for x in NO_CHASE):
                    problems.append(
                        f'[{key}] {q[:40]} -> 前车 {front}（{speeds[front]:g} 千米/时）'
                        f'在后车 {back}（{speeds[back]:g} 千米/时）前面，但后车**更慢**，'
                        f'追不上，答案不应是「{chosen}」')
            else:
                # 后车更快 → 能追上，答案应是具体时间
                if any(x in chosen for x in NO_CHASE):
                    problems.append(
                        f'[{key}] {q[:40]} -> 后车 {back}（{speeds[back]:g}）比前车 '
                        f'{front}（{speeds[front]:g}）快，能追上，答案不应是「{chosen}」')
    return problems


def check_fill_blanks(unit):
    """填空题的（　）个数必须与答案数组长度一致。"""
    path = ROOT / unit / 'app.js'
    app = path.read_text(encoding='utf-8')
    problems = []
    for key in FILL_KEYS:
        for it in parse_fill_items(app, key):
            blanks = plain_q(it['q']).count('（　）')
            n = len(it['answers'])
            if blanks != n:
                problems.append(
                    f'[{key}] {it["q"][:42]} -> 题干 {blanks} 个空，答案给了 {n} 个')
    return problems


def check_steps_consistency(unit):
    """检查 steps 详细过程是否真的支持声明的答案。

    抓过的真实错误：
      · 五星鸡兔同笼题答案 10 只，steps 却还是另一道题（答案 8 只）；
      · "加 3.5 再减 2.8"答案写成"减少 0.7"，但 steps 最后一步写的是"增加 0.7"。
    """
    path = ROOT / unit / 'app.js'
    app = path.read_text(encoding='utf-8')
    problems = []
    block_re = re.compile(r"\{\s*q:'((?:[^'\\]|\\.)*)'[\s\S]*?(?=\n\s*\{q:|\n\];)", re.S)
    for block in block_re.finditer(app):
        body, q = block.group(0), block.group(1)
        sm = re.search(r'steps:\s*\[(.*?)\]', body, re.S)
        if not sm:
            continue
        steps = [plain_q(x) for x in WHY_SEG.findall(sm.group(1))]
        if not steps:
            continue

        om = re.search(r'opts:\[(.*?)\]\s*,\s*a:(\d+)', body, re.S)
        if om:
            opts = FILL_STR_RE.findall(om.group(1))
            ai = int(om.group(2))
            answers = [opts[ai]] if ai < len(opts) else []
        else:
            am = re.search(r"a:\s*(?:'((?:[^'\\]|\\.)*)'|\[(.*?)\])", body, re.S)
            if not am:
                continue
            answers = ([am.group(1)] if am.group(1) is not None
                       else FILL_STR_RE.findall(am.group(2) or ''))

        steps_nums = [first_number(x) for x in re.findall(NUM_RE, ' '.join(steps))]
        steps_nums = {x for x in steps_nums if x is not None}
        for ans in answers:
            val = first_number(ans)
            if val is not None and val not in steps_nums:
                problems.append(
                    f'{q[:42]} -> 答案「{ans}」没有出现在 steps 详细过程中 '
                    f'→ 可能沿用了另一道题的步骤')

        ans0 = plain_q(answers[0] if answers else '')
        conclusion_steps = [x for x in steps if re.match(r'^\s*(?:所以|因此|故|即)', x)]
        for check_step in conclusion_steps or [steps[-1]]:
            for a_word, b_word in [('增加', '减少'), ('减少', '增加'),
                                   ('变大', '变小'), ('变小', '变大'),
                                   ('扩大到', '缩小到'), ('缩小到', '扩大到')]:
                if a_word in ans0 and b_word in check_step:
                    problems.append(
                        f'{q[:42]} -> 答案说「{ans0}」，但过程结论说「{check_step[:36]}」')
                    break
            else:
                continue
            break
    return problems


# ── 题型语义检查（L4：算术之外） ──
# 这些规则专门抓"算得出，但题意/数学关系不成立"的错误。
# 每加一条规则都做植入测试：构造错误 → 必须报；修复 → 必须全绿。

ALL_Q_RE = re.compile(r"\{\s*q:'((?:[^'\\]|\\.)*)'", re.S)
FILL_ITEM_RE = re.compile(
    r"\{\s*q:'((?:[^'\\]|\\.)*)'\s*,\s*a:\s*(?:'((?:[^'\\]|\\.)*)'|\[(.*?)\])\s*,",
    re.S)
FILL_STR_RE = re.compile(r"'((?:[^'\\]|\\.)*)'")
NUM_RE = re.compile(r'-?\d+(?:\.\d+)?')


def plain_q(text):
    return re.sub(r'<[^>]+>', '', text or '')


def first_number(text):
    m = NUM_RE.search(plain_q(text))
    if not m:
        return None
    try:
        return D(m.group())
    except Exception:
        return None


def parse_fill_items(app, key):
    """解析常规填空对象（不含题干后接函数调用的图形题）。"""
    m = re.search(rf'const {key} = \[(.*?)\n\];', app, re.S)
    if not m:
        return []
    out = []
    for f in FILL_ITEM_RE.finditer(m.group(1)):
        if f.group(2) is not None:
            answers = [f.group(2)]
        else:
            answers = FILL_STR_RE.findall(f.group(3) or '')
        out.append({'q': f.group(1), 'answers': answers})
    return out


def _read_four_digits(n):
    units = ['千', '百', '十', '']
    digits = f'{n:04d}'
    out, pending_zero, started = [], False, False
    for ch, unit in zip(digits, units):
        d = int(ch)
        if d == 0:
            if started:
                pending_zero = True
        else:
            if pending_zero:
                out.append('零')
                pending_zero = False
            out.append('一二三四五六七八九'[d - 1] + unit)
            started = True
    return ''.join(out)


def _read_zero_count(n):
    """整数按中文分级读法（亿/万/个）统计读出的\"零\"个数。"""
    groups, units, i = [], ['', '万', '亿', '兆'], 0
    while n > 0:
        groups.append((n % 10000, units[i]))
        n //= 10000
        i += 1
    text, higher = [], False
    for value, unit in reversed(groups):
        if value == 0:
            continue
        if higher and value < 1000:
            text.append('零')
        text.append(_read_four_digits(value) + unit)
        higher = True
    return ''.join(text).count('零')


def check_semantic_rules(unit):
    """题干前提、结果类型、单位/数位、图形模型等语义检查。"""
    path = ROOT / unit / 'app.js'
    app = path.read_text(encoding='utf-8')
    problems = []

    all_items = [(key, it, True) for key in CHOICE_KEYS for it in parse_choice_items(app, key)]
    all_items += [(key, {'q': it['q'], 'opts': None, 'a': 0,
                         'answers': it['answers'], 'why': ''}, False)
                  for key in FILL_KEYS for it in parse_fill_items(app, key)]

    for key, it, is_choice in all_items:
        q = plain_q(it['q'])
        chosen = ''
        answer_value = None
        if is_choice:
            if it['a'] < len(it['opts']):
                chosen = it['opts'][it['a']]
                answer_value = first_number(chosen)
            else:
                continue
        else:
            chosen = it['answers'][0] if it['answers'] else ''
            answer_value = first_number(chosen)

        # 1) 近似数的逆向边界：四舍五入到万/亿位后，最大/最小是确定的。
        if ('近似' in q or '省略' in q) and ('最大' in q or '最小' in q):
            for unit_name, step in [('万', D(10000)), ('亿', D(100000000))]:
                m = re.search(
                    rf'(?:近似数(?:是)?|近似到[万亿]位(?:是)?|省略[万亿]位后面的尾数约?是)'
                    rf'\s*(\d+(?:\.\d+)?)\s*{unit_name}', q)
                if not m:
                    continue
                base = D(m.group(1)) * step
                expected = base + step / 2 - 1 if '最大' in q else base - step / 2
                if answer_value is not None and answer_value != expected:
                    problems.append(
                        f'[{key}] {q[:42]} -> {unit_name}位四舍五入的边界应为 {expected:g}，'
                        f'答案却是「{chosen}」')
                break

        # 2) 改写单位：数值必须与进率严格一致（不是"近似"）。
        m = re.search(r'把\s*(\d+)\s*改写成用\s*["“]?([万亿])', q)
        if m and '约' not in q:
            base = D(m.group(1))
            unit_name = m.group(2)
            expected = base / (D(10000) if unit_name == '万' else D(100000000))
            if answer_value is not None and answer_value != expected:
                problems.append(
                    f'[{key}] {q[:42]} -> 改写为 {unit_name} 单位应为 {expected:g}{unit_name}，'
                    f'答案却是「{chosen}」')

        # 3) 小数的数位：数字在十分位/百分位/千分位必须按位置判断。
        m = re.search(r'(\d+\.\d+)\s*中，数字\s*(\d)\s*在', q)
        if m:
            number, digit = m.group(1), m.group(2)
            frac = number.split('.', 1)[1]
            idx = frac.find(digit)
            place_names = ['十分', '百分', '千分', '万分']
            if 0 <= idx < len(place_names) and place_names[idx] not in plain_q(chosen):
                problems.append(
                    f'[{key}] {q[:42]} -> 数字 {digit} 在{place_names[idx]}位，'
                    f'答案却写成「{chosen}」')

        # 4) "与 X 相等"型选择题必须只有一个数值选项等于 X。
        if is_choice and '与' in q and '相等' in q:
            m = re.search(r'与\s*(-?\d+(?:\.\d+)?)\s*相等', q)
            if m:
                target = D(m.group(1))
                hits = []
                for i, opt in enumerate(it['opts']):
                    t = plain_q(opt).strip()
                    if re.fullmatch(r'-?\d+(?:\.\d+)?', t) and D(t) == target:
                        hits.append(i)
                if len(hits) > 1:
                    problems.append(
                        f'[{key}] {q[:42]} -> 有多个选项都等于 {target:g}：'
                        f'{"、".join(it["opts"][i] for i in hits)} → 必须改干扰项')

        # 5) "一副三角尺拼角"：若限定小于平角，最大是 90°+60°=150°；
        #    未限定小于平角时，最大可取 90°+90°=180°。
        if '一副三角尺' in q and '拼成' in q and '最大' in q:
            expected = D(150) if '小于平角' in q else D(180)
            if answer_value is not None and answer_value != expected:
                problems.append(
                    f'[{key}] {q[:42]} -> 一副三角尺拼角的最大值应为 {expected:g}°，'
                    f'答案却是「{chosen}」')

        # 6) 读数中"零"的个数（只检查"读……只读出几个零"型）。
        m = re.search(r'读\s*(\d+)\s*时，只读出', q)
        if m:
            expected = _read_zero_count(int(m.group(1)))
            if answer_value is not None and answer_value != D(expected):
                problems.append(
                    f'[{key}] {q[:42]} -> 按分级读法应读出 {expected} 个零，'
                    f'答案却是「{chosen}」')

        # 7) 多步竖式：个位向十位进位后，十位计算必须体现加进位。
        if '竖式计算' in q and '十位上算' in q and '向十位进' in q:
            tail = q[q.index('十位上算'):]
            if '加' not in tail:
                problems.append(
                    f'[{key}] {q[:42]} -> 个位已向十位进位，但十位步骤没有加进位 → 过程不完整')

        # 8) 图形模型前提：这些表述本身不成立或信息不足。
        if '沿高' in q and '剪成两个直角三角形' in q:
            problems.append(
                f'[{key}] {q[:42]} -> 沿高剪开不能一般地得到两个直角三角形；'
                f'应改说"沿对角线剪成两个三角形"或重新设计')
        if re.search(r'长方形.*拉成.*平行四边形.*长和宽不变.*面积是', q):
            problems.append(
                f'[{key}] {q[:42]} -> 长宽不变拉成平行四边形后，高会变小，面积不能直接按长×宽算')
        if '两组都没参加' in q and not re.search(r'每人只参加一个|只参加一项', q):
            problems.append(
                f'[{key}] {q[:42]} -> 未说明两个兴趣小组互不重叠，'
                f'"两组都没参加"的人数无法唯一确定')
        if ('去掉' in q and ('去掉的数是' in q or '去掉的是' in q)
                and not re.search(r'剩下.*平均|仍.*平均', q)):
            problems.append(
                f'[{key}] {q[:42]} -> 只给了原平均数，没有给"剩下的数的平均数"，'
                f'无法确定去掉的数')
        if '四根小棒' in q and '一定是' in q:
            problems.append(
                f'[{key}] {q[:42]} -> 四根小棒长度未给出，不能断言一定围成平行四边形')

    # 8b) 复式条形图：若题目逐项比较两根直条，不能同时把"总量"和"每一项"
    #     都做成看似唯一的结论；否则同一条信息可能推出多个正确选项。
    for key in CHOICE_KEYS:
        for it in parse_choice_items(app, key):
            q = plain_q(it['q'])
            opts = [plain_q(o) for o in it['opts']]
            if '直条总是比' in q and any('总量' in o for o in opts) and any('每一项' in o for o in opts):
                problems.append(
                    f'[{key}] {q[:42]} -> 逐项比较与总量/平均数结论混在同一题，'
                    f'可能不止一个正确选项 → 应明确只问"同一个项目"的比较')

    # 8c) 离散取值前提：问"最大角/底角最大"时若答案按整数度计算，题干必须给出整数条件。
    for key, it, is_choice in all_items:
        q = plain_q(it['q'])
        if '等腰三角形' in q and '顶角是钝角' in q and '底角最大' in q and '整' not in q:
            problems.append(
                f'[{key}] {q[:42]} -> 底角只严格小于 45°，未限定整度数时没有最大值；'
                f'题干需补"取整度数"')
        if '原来的角最大可能是' in q and '整' not in q:
            problems.append(
                f'[{key}] {q[:42]} -> 原角可以无限接近 360° 却达不到，'
                f'未限定整度数时没有最大值')
        if ('乘' in q and '末尾有' in q and '个 0' in q and '最小' in q
                and not re.search(r'自然数|整数', q)):
            problems.append(
                f'[{key}] {q[:42]} -> "积的末尾有几个 0"的最小值依赖整数取值，'
                f'题干需说明"自然数"或"整数"')

    # 8d) 负数结果：四年级默认不引入负数，纯算式结果不得小于 0。
    if not ALLOW_NEGATIVE_RESULTS:
        for key, it, is_choice in all_items:
            q = plain_q(it['q'])
            if '（　）' not in q:
                continue
            expr = None
            got = extract_expr(q)
            if got:
                expr = got[0]
            else:
                head = q.split('（　）')[0]
                m = re.search(r'([0-9][0-9\s.()+\-−×÷*/]*[0-9]|[0-9])\s*=\s*$', head)
                if m:
                    expr = m.group(1)
            if not expr:
                continue
            expr = expr.replace('×', '*').replace('÷', '/').replace('−', '-')
            if not re.search(r'[+\-*/]', expr):
                continue
            val = eval_arith(expr)
            if val is not None and val < 0:
                problems.append(
                    f'[{key}] {q[:42]} -> 算式结果是负数（{val:g}），'
                    f'默认超出本年级范围 → 改数据或明确负数单元')

    # 9) 定性结论短语：只检查"所以/因此/故"后直接给出的短结论。
    for key in CHOICE_KEYS:
        for it in parse_choice_items(app, key):
            if it['a'] >= len(it['opts']):
                continue
            chosen = plain_q(it['opts'][it['a']])
            if norm_num(chosen) is not None:
                continue
            why = plain_q(it['why'])
            parts = re.split(r'所以|因此|故', why)
            if len(parts) < 2:
                continue
            tail = parts[-1].strip(' ，。；：:')
            verdicts = ['不变', '变大', '变小', '增加', '减少', '扩大到', '缩小到', '相等', '不相等']
            lead = next((v for v in verdicts if tail.startswith(v)), None)
            if lead and lead not in chosen:
                syn_ok = ((lead in ('变大', '扩大到') and ('变大' in chosen or '扩大到' in chosen))
                          or (lead in ('变小', '缩小到') and ('变小' in chosen or '缩小到' in chosen)))
                if not syn_ok:
                    problems.append(
                        f'[{key}] {it["q"][:42]} -> 解析结论是「{tail[:24]}」，'
                        f'但答案选项是「{chosen}」→ 短结论与答案打架')

    # 10) 纯数值等式/不等式自检：抓 "0.36 = 0.09" 这类明显错误。
    # ⚠️ 只扫描解析/步骤文本，不扫描选项；选项里的 "5060708 = 5080607"
    #    本来就是故意设置的错误说法，不能当成课件的结论。
    explanation_texts = []
    WHY_ALL_RE = re.compile(r"why:\s*((?:'(?:[^'\\]|\\.)*'\s*(?:\+\s*)?)+)", re.S)
    STEPS_RE = re.compile(r"steps:\s*\[(.*?)\]", re.S)
    for m in WHY_ALL_RE.finditer(app):
        explanation_texts.extend(WHY_SEG.findall(m.group(1)))
    for m in STEPS_RE.finditer(app):
        explanation_texts.extend(WHY_SEG.findall(m.group(1)))
    for text in explanation_texts:
        for m in re.finditer(r'(?<![\d.])(-?\d+(?:\.\d+)?)\s*(=|≠)\s*(-?\d+(?:\.\d+)?)(?![\d.])', text):
            left, op, right = m.groups()
            pre = text[:m.start(1)].rstrip()
            post = text[m.end(3):].lstrip()
            if pre and (pre[-1].isdigit() or pre[-1] in '+-×÷*/−=<>≠乘加减除'):
                continue
            if post and (post[0].isdigit() or post[0] in '+-×÷*/−'):
                continue
            # 如果同一句里左侧数值前面已经出现运算符，它只是算式的一部分，
            # 不是独立等式（如 "5 + 3 + 进位 1 = 9"）。
            clause_start = max(text.rfind(ch, 0, m.start(1)) for ch in '，。；：:')
            between = text[clause_start + 1:m.start(1)]
            if re.search(r'[+\-×÷*/−]', between):
                continue
            if post.startswith(('万', '亿', '个', '位', '厘米', '米', '元', '°', '度')):
                continue
            try:
                eq = D(left) == D(right)
            except Exception:
                continue
            if (op == '=' and not eq) or (op == '≠' and eq):
                problems.append(
                    f'数值关系错误："{left} {op} {right}" → 实际应为 '
                    f'{"相等" if eq else "不相等"}')

    # 11) 小数的性质：0.50 的末尾 0 可以去掉，不能教成"0.50 ≠ 0.5"。
    for bad_phrase in ('0.50 也不能写成 0.5', '0.50 ≠ 0.5', '100.50 ≠ 100.5'):
        if bad_phrase in app:
            problems.append(f'小数性质表述错误：出现了「{bad_phrase}」')

    return problems


bad = 0
for u in UNITS:
    probs = (check_unit(u) + check_unique_options(u) + check_why_consistency(u)
             + check_option_products(u) + check_chase(u) + check_semantic_rules(u)
             + check_fill_blanks(u) + check_steps_consistency(u))
    if probs:
        print(f'❌ {u}: {len(probs)} 处答案/语义问题')
        for p in probs:
            print('   -', p)
        bad += 1
    else:
        print(f'✅ {u}: 答案复算与语义检查全部通过')
print('\n=== 全部通过 ✅ ===' if not bad else '\n=== 存在答案/语义错误 ❌ ===')
sys.exit(1 if bad else 0)
