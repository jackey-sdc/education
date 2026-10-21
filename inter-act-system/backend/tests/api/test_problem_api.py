# 接口级测试示例：题目API测试
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

class TestProblemAPI:
    """题目API测试类"""
    
    def test_get_problems(self):
        """测试获取题目列表"""
        response = client.get("/api/problems")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    
    def test_get_problem_detail(self):
        """测试获取题目详情"""
        # 先创建一个题目
        create_response = client.post("/api/problems", json={
            "content": "测试题目",
            "subject": "math",
            "difficulty_level": 2
        })
        assert create_response.status_code == 201
        problem_id = create_response.json()["problem_id"]
        
        # 获取题目详情
        detail_response = client.get(f"/api/problems/{problem_id}")
        assert detail_response.status_code == 200
        assert detail_response.json()["content"] == "测试题目"
        assert detail_response.json()["subject"] == "math"
    
    def test_create_problem(self):
        """测试创建题目"""
        response = client.post("/api/problems", json={
            "content": "已知二次函数 f(x) = ax² + bx + c 的图像经过点 (0, 3)，且当 x = 1 时取得最小值 2，求函数的解析式。",
            "subject": "math",
            "difficulty_level": 2
        })
        assert response.status_code == 201
        assert "problem_id" in response.json()
        assert response.json()["content"] == "已知二次函数 f(x) = ax² + bx + c 的图像经过点 (0, 3)，且当 x = 1 时取得最小值 2，求函数的解析式。"
    
    def test_analyze_problem(self):
        """测试分析题目"""
        response = client.post("/api/problems/analyze", json={
            "content": "已知二次函数 f(x) = ax² + bx + c 的图像经过点 (0, 3)，且当 x = 1 时取得最小值 2，求函数的解析式。"
        })
        assert response.status_code == 200
        assert "subject" in response.json()
        assert "knowledge_points" in response.json()
        assert "difficulty" in response.json()
        assert response.json()["subject"] == "math"
    
    def test_update_problem(self):
        """测试更新题目"""
        # 先创建一个题目
        create_response = client.post("/api/problems", json={
            "content": "测试题目",
            "subject": "math",
            "difficulty_level": 2
        })
        assert create_response.status_code == 201
        problem_id = create_response.json()["problem_id"]
        
        # 更新题目
        update_response = client.put(f"/api/problems/{problem_id}", json={
            "content": "更新后的测试题目",
            "subject": "physics",
            "difficulty_level": 3
        })
        assert update_response.status_code == 200
        assert update_response.json()["content"] == "更新后的测试题目"
        assert update_response.json()["subject"] == "physics"
    
    def test_delete_problem(self):
        """测试删除题目"""
        # 先创建一个题目
        create_response = client.post("/api/problems", json={
            "content": "测试题目",
            "subject": "math",
            "difficulty_level": 2
        })
        assert create_response.status_code == 201
        problem_id = create_response.json()["problem_id"]
        
        # 删除题目
        delete_response = client.delete(f"/api/problems/{problem_id}")
        assert delete_response.status_code == 204
        
        # 验证题目已删除
        detail_response = client.get(f"/api/problems/{problem_id}")
        assert detail_response.status_code == 404