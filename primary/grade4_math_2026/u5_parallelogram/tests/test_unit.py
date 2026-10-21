"""u5_parallelogram 的回归测试（Playwright）：JS 报错 + 交互巡检 + 样式自检 + 答案条目数。
用法： python3 tests/test_unit.py
"""
import pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[2] / 'tests'))
import importlib.util
spec = importlib.util.spec_from_file_location(
    'shared_test', pathlib.Path(__file__).resolve().parents[2] / 'tests' / 'test_unit.py')
mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
if __name__ == '__main__':
    sys.argv = [sys.argv[0], 'u5_parallelogram']
    sys.exit(mod.main())
