# 方法级测试示例：题目分析器测试
import pytest
from app.services.problem_analyzer import ProblemAnalyzer

class TestProblemAnalyzer:
    """题目分析器测试类"""
    
    def setup_method(self):
        """设置测试环境"""
        self.analyzer = ProblemAnalyzer()
    
    def test_analyze_math_problem(self):
        """测试分析数学题目"""
        problem_content = "已知二次函数 f(x) = ax² + bx + c 的图像经过点 (0, 3)，且当 x = 1 时取得最小值 2，求函数的解析式。"
        result = self.analyzer.analyze(problem_content)
        
        assert result['subject'] == 'math'
        assert '二次函数' in result['knowledge_points']
        assert len(result['knowledge_points']) >= 1
        assert result['difficulty'] in ['easy', 'medium', 'hard']
    
    def test_analyze_physics_problem(self):
        """测试分析物理题目"""
        problem_content = "一个物体从高处自由下落，经过2秒落地，求下落的高度。（重力加速度g=9.8m/s²）"
        result = self.analyzer.analyze(problem_content)
        
        assert result['subject'] == 'physics'
        assert '重力加速度' in result['knowledge_points'] or '力学' in result['knowledge_points']
        assert '下落' in problem_content or '自由' in problem_content
        assert result['difficulty'] in ['easy', 'medium', 'hard']
    
    def test_analyze_chemistry_problem(self):
        """测试分析化学题目"""
        problem_content = "将1mol H2和1mol O2混合点燃，完全反应后生成多少摩尔的H2O？"
        result = self.analyzer.analyze(problem_content)
        
        assert result['subject'] == 'chemistry'
        assert '摩尔' in result['knowledge_points'] or '化学反应' in result['knowledge_points']
        assert '反应' in problem_content
        assert result['difficulty'] in ['easy', 'medium', 'hard']
    
    def test_extract_known_conditions(self):
        """测试提取已知条件"""
        problem_content = "已知二次函数 f(x) = ax² + bx + c 的图像经过点 (0, 3)，且当 x = 1 时取得最小值 2，求函数的解析式。"
        known_conditions = self.analyzer._extract_known_conditions(problem_content)
        
        assert len(known_conditions) >= 1
        assert any('二次函数' in cond for cond in known_conditions)
    
    def test_calculate_difficulty(self):
        """测试计算题目难度"""
        knowledge_points = ['二次函数', '顶点式', '最小值']
        difficulty = self.analyzer._calculate_difficulty(knowledge_points)
        
        assert difficulty in ['easy', 'medium', 'hard']
        assert difficulty == 'medium'
    
    def test_analyze_easy_problem(self):
        """测试简单题目难度识别"""
        problem_content = "计算1+1等于几"
        result = self.analyzer.analyze(problem_content)
        
        assert result['subject'] in ['math', 'physics', 'chemistry']
        assert result['difficulty'] == 'easy'
    
    def test_analyze_hard_problem(self):
        """测试困难题目难度识别"""
        problem_content = "已知二次函数f(x)=ax²+bx+c的图像经过点(0,3)，当x=1时取得最小值2，且f(2)=5，求a,b,c的值，并画出函数图像，讨论其单调性和奇偶性。"
        result = self.analyzer.analyze(problem_content)
        
        assert result['subject'] == 'math'
        assert result['difficulty'] in ['medium', 'hard']
