#!/usr/bin/env python3
"""L4 语义校验器的植入自测。

做法：复制 `templates/check_answers.py` 到临时课件目录，先放一组**故意错误**的题，
要求校验器报错；再换成**修正版**，要求全绿。这样能证明语义规则不是空跑。
"""
import pathlib, shutil, subprocess, sys, tempfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
TEMPLATE = ROOT / 'templates' / 'check_answers.py'

BAD_APP = r'''
const BASIC_CHOICE = [
  {q:'两车同时同向行驶，甲车每小时行 60 千米，乙车每小时行 45 千米。甲车在乙车前面 90 千米，几小时后乙车追上甲车？', opts:['5 小时','6 小时'], a:1, why:'90 ÷ (60 − 45) = 6（小时）。'},
  {q:'把 396000 改写成用"万"作单位的数是（　）。', opts:['39.6 万','396 万'], a:1, why:'396000 = 396 万。'},
  {q:'下面各数中，与 0.45 相等的是（　）。', opts:['0.450','0.4500'], a:0, why:'0.450 和 0.4500 都等于 0.45。'},
  {q:'把一个平行四边形沿高剪成两个直角三角形，两个三角形的面积（　）。', opts:['相等','不相等'], a:0, why:'面积相等。'},
  {q:'一个数加上 3.5 再减去 2.8，等于这个数（　）。', opts:['增加 0.7','减少 0.7'], a:0, why:'净变化是增加 0.7。', steps:['3.5 − 2.8 = 0.7','所以这个数减少 0.7']},
  {q:'一个角的内部画一条射线，把它分成两个角，其中一个是 55°，原来的角最大可能是（　）°。', opts:['359°','360°'], a:0, why:'最大是 359°。'},
  {q:'一个数乘 25 后，积的末尾有 3 个 0，这个数最小是（　）。', opts:['40','4'], a:0, why:'最小是 40。'}
];
const HAND_CHOICE = [
  {q:'计算 9.8 − 3.6 − 6.4 的结果是（　）。', opts:['-0.2','0.2'], a:0, why:'9.8 − (3.6 + 6.4) = -0.2。'}
];
const EXT_CHOICE = [];
const STAR5_CHOICE = [];
const BASIC_FILL = [
  {q:'读 400507008 时，只读出（　）个零。', a:'3', why:'读出了 3 个零。'}
];
const HAND_FILL = [];
const EXT_FILL = [];
const STAR5_FILL = [];
'''

GOOD_APP = r'''
const BASIC_CHOICE = [
  {q:'两车同时同向行驶，甲车每小时行 45 千米，乙车每小时行 60 千米。甲车在乙车前面 90 千米，几小时后乙车追上甲车？', opts:['5 小时','6 小时'], a:1, why:'90 ÷ (60 − 45) = 6（小时）。'},
  {q:'把 396000 改写成用"万"作单位的数是（　）。', opts:['39.6 万','396 万'], a:0, why:'396000 ÷ 10000 = 39.6，所以 396000 = 39.6 万。'},
  {q:'下面各数中，与 0.45 相等的是（　）。', opts:['0.450','0.045'], a:0, why:'0.450 等于 0.45，0.045 不等于 0.45。'},
  {q:'把一个平行四边形沿对角线剪成两个三角形，两个三角形的面积（　）。', opts:['相等','不相等'], a:0, why:'对角线把平行四边形分成两个完全一样的三角形，面积相等。'},
  {q:'一个数加上 3.5 再减去 2.8，等于这个数（　）。', opts:['增加 0.7','减少 0.7'], a:0, why:'净变化是增加 0.7。', steps:['3.5 − 2.8 = 0.7','所以这个数增加 0.7']},
  {q:'一个角的内部画一条射线，把它分成两个角，其中一个是 55°，原来的角最大可能是（　）°。（原角度数取整数）', opts:['359°','360°'], a:0, why:'最大是 359°。'},
  {q:'一个自然数乘 25 后，积的末尾有 3 个 0，这个自然数最小是（　）。', opts:['40','4'], a:0, why:'最小是 40。'}
];
const HAND_CHOICE = [
  {q:'计算 9.8 − 3.6 − 2.4 的结果是（　）。', opts:['3.8','0.2'], a:0, why:'9.8 − (3.6 + 2.4) = 3.8。'}
];
const EXT_CHOICE = [];
const STAR5_CHOICE = [];
const BASIC_FILL = [
  {q:'读 400507008 时，只读出（　）个零。', a:'2', why:'四亿零五十万七千零八，一共 2 个零。'}
];
const HAND_FILL = [];
const EXT_FILL = [];
const STAR5_FILL = [];
'''


def run_case(base: pathlib.Path, app_text: str):
    unit = base / 'u_demo'
    unit.mkdir(parents=True, exist_ok=True)
    (unit / 'meta.json').write_text('{}', encoding='utf-8')
    (unit / 'app.js').write_text(app_text, encoding='utf-8')
    return subprocess.run(
        [sys.executable, str(base / 'tests' / 'check_answers.py'), 'u_demo'],
        cwd=base, text=True, capture_output=True)


def main():
    with tempfile.TemporaryDirectory(prefix='courseware-semantic-') as td:
        base = pathlib.Path(td)
        (base / 'tests').mkdir()
        shutil.copy2(TEMPLATE, base / 'tests' / 'check_answers.py')

        bad = run_case(base, BAD_APP)
        expected = ['必须改题', '改写为 万 单位应为 39.6万', '有多个选项都等于 0.45',
                    '沿高剪开', '过程结论说', '应读出 2 个零', '算式结果是负数',
                    '未限定整度数时没有最大值', '题干需说明"自然数"或"整数"']
        missing = [x for x in expected if x not in bad.stdout]
        if bad.returncode == 0 or missing:
            print('❌ 语义校验器植入测试失败')
            print('  退出码:', bad.returncode)
            print('  缺失命中:', missing)
            print(bad.stdout)
            return 1

        good = run_case(base, GOOD_APP)
        if good.returncode != 0:
            print('❌ 修正版本应全绿，但校验器仍报错')
            print(good.stdout)
            return 1
        print('✅ 语义校验器植入测试通过：错误版必报，修正版全绿')
        return 0


if __name__ == '__main__':
    sys.exit(main())
