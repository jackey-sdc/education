// 前端单元测试示例：学科卡片组件测试
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SubjectCard from '../../src/components/specific/SubjectCard';

// Mock 样式文件
jest.mock('../../src/styles/SubjectCard.css', () => ({}));

describe('SubjectCard Component', () => {
  const mockProps = {
    icon: '📐',
    title: '数学',
    description: '几何图形变换、函数图像绘制、概率分布可视化',
    onClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly with provided props', () => {
    render(<SubjectCard {...mockProps} />);
    
    expect(screen.getByText('数学')).toBeInTheDocument();
    expect(screen.getByText('几何图形变换、函数图像绘制、概率分布可视化')).toBeInTheDocument();
    expect(screen.getByText('开始学习')).toBeInTheDocument();
  });

  test('calls onClick when card is clicked', () => {
    render(<SubjectCard {...mockProps} />);
    
    const card = screen.getByText('数学').closest('.subject-card');
    fireEvent.click(card);
    
    expect(mockProps.onClick).toHaveBeenCalledTimes(1);
  });

  test('calls onClick when button is clicked', () => {
    render(<SubjectCard {...mockProps} />);
    
    const button = screen.getByText('开始学习');
    fireEvent.click(button);
    
    expect(mockProps.onClick).toHaveBeenCalledTimes(1);
  });

  test('has correct class names', () => {
    render(<SubjectCard {...mockProps} />);
    
    const card = screen.getByText('数学').closest('.subject-card');
    expect(card).toHaveClass('card');
    expect(card).toHaveClass('subject-card');
  });

  test('renders icon correctly', () => {
    render(<SubjectCard {...mockProps} />);
    
    const iconElement = screen.getByText('📐').closest('.subject-icon');
    expect(iconElement).toBeInTheDocument();
  });

  test('renders gradient button', () => {
    render(<SubjectCard {...mockProps} />);
    
    const button = screen.getByText('开始学习');
    expect(button).toHaveClass('gradient-btn');
  });

  test('handles hover effect', () => {
    render(<SubjectCard {...mockProps} />);
    
    const card = screen.getByText('数学').closest('.subject-card');
    fireEvent.mouseEnter(card);
    
    // 验证悬停效果（如果有CSS过渡效果）
    // 这里可以测试transform或box-shadow等属性的变化
  });
});