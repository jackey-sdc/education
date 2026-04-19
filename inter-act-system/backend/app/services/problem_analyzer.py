# 题目分析器服务
import re
from app.models.problem import SubjectEnum, DifficultyEnum

class ProblemAnalyzer:
    """题目分析器"""
    
    def __init__(self):
        """初始化题目分析器"""
        # 数学关键词
        self.math_keywords = [
            "二次函数", "一次函数", "反比例函数", "三角函数", "几何", "代数",
            "方程", "不等式", "数列", "概率", "统计", "集合", "向量", "导数",
            "顶点式", "一般式", "零点", "单调性", "奇偶性", "周期性",
            "平行", "垂直", "全等", "相似", "勾股定理", "圆", "椭圆"
        ]
        
        # 物理关键词
        self.physics_keywords = [
            "自由落体", "牛顿运动定律", "动能", "势能", "动量", "电磁感应",
            "电路", "光学", "热学", "力学", "电学", "磁学", "重力加速度",
            "速度", "加速度", "位移", "时间", "质量", "力", "功", "功率",
            "机械能", "守恒定律", "万有引力", "弹力", "摩擦力", "合力"
        ]
        
        # 化学关键词
        self.chemistry_keywords = [
            "化学反应", "分子结构", "元素周期表", "化学键", "化学平衡",
            "酸碱反应", "氧化还原", "有机化学", "无机化学", "化学计量",
            "摩尔", "摩尔质量", "气体摩尔体积", "浓度", "反应速率",
            "化学方程式", "质量守恒", "电子转移", "离子反应", "沉淀"
        ]
    
    def analyze(self, content):
        """分析题目
        
        Args:
            content: 题目内容
            
        Returns:
            分析结果，包含学科、知识点、难度等
        """
        # 识别学科
        subject = self._identify_subject(content)
        
        # 提取知识点
        knowledge_points = self._extract_knowledge_points(content, subject)
        
        # 计算难度
        difficulty = self._calculate_difficulty(knowledge_points)
        
        # 提取已知条件
        known_conditions = self._extract_known_conditions(content)
        
        # 提取求解目标
        target = self._extract_target(content)
        
        return {
            "subject": subject,
            "knowledge_points": knowledge_points,
            "difficulty": difficulty,
            "known_conditions": known_conditions,
            "target": target
        }
    
    def _identify_subject(self, content):
        """识别题目学科
        
        Args:
            content: 题目内容
            
        Returns:
            学科名称
        """
        # 统计各学科关键词出现次数
        math_count = sum(1 for keyword in self.math_keywords if keyword in content)
        physics_count = sum(1 for keyword in self.physics_keywords if keyword in content)
        chemistry_count = sum(1 for keyword in self.chemistry_keywords if keyword in content)
        
        # 根据关键词出现次数判断学科
        counts = {
            "math": math_count,
            "physics": physics_count,
            "chemistry": chemistry_count
        }
        
        # 找到出现次数最多的学科
        max_count = max(counts.values())
        if max_count == 0:
            # 如果没有关键词，根据内容特征判断
            if "函数" in content or "方程" in content or "几何" in content:
                return "math"
            elif "力" in content or "运动" in content or "能量" in content:
                return "physics"
            elif "化学" in content or "反应" in content or "分子" in content:
                return "chemistry"
            else:
                return "math"  # 默认数学
        else:
            return max(counts, key=counts.get)
    
    def _extract_knowledge_points(self, content, subject):
        """提取知识点
        
        Args:
            content: 题目内容
            subject: 学科
            
        Returns:
            知识点列表
        """
        knowledge_points = []
        
        if subject == "math":
            keywords = self.math_keywords
        elif subject == "physics":
            keywords = self.physics_keywords
        else:  # chemistry
            keywords = self.chemistry_keywords
        
        for keyword in keywords:
            if keyword in content:
                knowledge_points.append(keyword)
        
        # 如果没有找到知识点，根据学科添加默认知识点
        if not knowledge_points:
            if subject == "math":
                knowledge_points.append("代数")
            elif subject == "physics":
                knowledge_points.append("力学")
            else:  # chemistry
                knowledge_points.append("化学反应")
        
        return knowledge_points
    
    def _calculate_difficulty(self, knowledge_points):
        """计算题目难度
        
        Args:
            knowledge_points: 知识点列表
            
        Returns:
            难度级别
        """
        # 根据知识点数量和复杂度计算难度
        difficulty_level = len(knowledge_points)
        
        if difficulty_level <= 1:
            return "easy"
        elif difficulty_level <= 3:
            return "medium"
        else:
            return "hard"
    
    def _extract_known_conditions(self, content):
        """提取已知条件
        
        Args:
            content: 题目内容
            
        Returns:
            已知条件列表
        """
        # 简单的已知条件提取
        # 查找包含数字和单位的句子
        conditions = []
        
        # 正则表达式匹配包含数字的句子
        sentences = re.split(r'[。！？]', content)
        for sentence in sentences:
            if re.search(r'\d+', sentence) and len(sentence) > 5:
                conditions.append(sentence.strip())
        
        # 查找包含"已知"、"给出"、"告诉"等关键词的句子
        keywords = ["已知", "给出", "告诉", "测得", "求得", "经过", "取得"]
        for sentence in sentences:
            for keyword in keywords:
                if keyword in sentence and sentence.strip() not in conditions:
                    conditions.append(sentence.strip())
                    break
        
        # 如果只有一个条件但包含多个信息，尝试分割
        if len(conditions) == 1 and "，" in conditions[0]:
            parts = conditions[0].split("，")
            if len(parts) >= 2:
                conditions = [p.strip() for p in parts if len(p.strip()) > 5]
        
        return conditions
    
    def _extract_target(self, content):
        """提取求解目标
        
        Args:
            content: 题目内容
            
        Returns:
            求解目标
        """
        # 查找包含"求"、"计算"、"确定"等关键词的句子
        keywords = ["求", "计算", "确定", "求算", "求解", "找出", "确定"]
        
        sentences = re.split(r'[。！？]', content)
        for sentence in sentences:
            for keyword in keywords:
                if keyword in sentence:
                    return sentence.strip()
        
        return ""
