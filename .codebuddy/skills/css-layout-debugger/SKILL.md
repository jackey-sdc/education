---
name: css-layout-debugger
description: 当用户遇到 CSS 布局问题，特别是 Flexbox/Grid 嵌套、overflow 冲突、Canvas 显示异常时使用此技能。此技能提供系统化的 CSS 布局调试方法和常见问题解决方案。
---

# CSS Layout Debugger Skill

## 何时使用

当用户遇到以下问题时触发此技能：
- Flexbox 或 Grid 布局导致的元素覆盖或错位
- Canvas 元素不显示或尺寸异常
- 嵌套容器层级过深导致的布局冲突
- overflow 属性导致的元素被裁剪
- 响应式布局在移动端/桌面端表现不一致

## 调试流程

### 1. 确认问题层级

首先确定问题所在的 CSS 文件和行号：
```
问题排查顺序（从外到内）：
1. 父容器 (.parent) - 检查 display, overflow, position
2. 中间容器 (.wrapper/.container) - 检查 flex/grid 设置
3. 子元素 (.child) - 检查自身尺寸和 flex 属性
```

### 2. Canvas 布局问题诊断

**Canvas 同时设置了 HTML 属性和 CSS 样式时会出现问题：**

```jsx
// 问题代码 ❌
<canvas
  ref={canvasRef}
  width={600}      // HTML 属性 - 定义画布分辨率
  height={400}
  style={{ width: '100%' }}  // CSS 样式 - 定义显示尺寸
/>
```

```jsx
// 正确代码 ✅
<canvas
  ref={canvasRef}
  style={{ width: '100%', height: 'auto' }}  // 只用 CSS 控制
/>
```

**Canvas 尺寸由 JavaScript 设置时：**
```jsx
useEffect(() => {
  const canvas = canvasRef.current
  if (!canvas) return

  // 只在 JS 中设置分辨率
  canvas.width = 600
  canvas.height = 400

  // 不要在 CSS 中限制尺寸，让 canvas 自然缩放
}, [])
```

### 3. Flexbox 布局问题诊断

**检查项：**

| 属性 | 问题 | 解决方案 |
|------|------|----------|
| `flex: 1` | 子元素被过度压缩 | 添加 `flex-shrink: 0` 或设置 `min-width` |
| `flex-direction` | 主轴方向错误 | 确认 row/column 设置 |
| `align-items` | 交叉轴对齐问题 | 检查 flex-start/center/stretch |
| `gap` | 间距不生效 | 确认父容器是 flex |
| `min-width: 0` | flex 子元素不收缩 | 父 flex 容器有明确宽度时需要 |

**常见问题代码：**
```css
/* 问题：flex 容器被子孙元素影响 */
.container {
  display: flex;
  flex-direction: column;  /* 错误：与子组件 flex 冲突 */
}

/* 解决：移除 flex-direction: column，让子元素自己决定布局 */
.container {
  display: block;  /* 或使用 flow-root */
}
```

### 4. Overflow 属性问题

| 值 | 行为 | 适用场景 |
|----|------|----------|
| `overflow: hidden` | 裁剪超出内容 | 需要隐藏溢出时，但会裁剪负 margin |
| `overflow: visible` | 显示溢出内容 | 动画、浮动元素、避免裁剪 |
| `overflow: auto` | 按需显示滚动条 | 内容可能超出容器 |
| `overflow: clip` | 完全裁剪 | 彻底隐藏溢出 |

**负 margin 问题：**
```css
/* 问题：overflow: hidden 会裁剪负 margin */
.card {
  overflow: hidden;
  margin-top: -20px;  /* 被裁剪掉 */
}

/* 解决1：使用 padding 代替 */
.card {
  padding-top: 20px;
  margin-top: 0;
}

/* 解决2：建立 BFC */
.card {
  overflow: hidden;  /* 或 */
  display: flow-root;
}
```

### 5. 嵌套层级优化

**原则：尽量减少嵌套层级**

```jsx
// 问题：层级过深 ❌
<div className="a">
  <div className="b">
    <div className="c">
      <div className="d">
        <Canvas />
      </div>
    </div>
  </div>
</div>

// 解决：直接渲染，移除中间容器 ✅
<div className="a">
  <Canvas />
</div>
```

**移除不必要的 wrapper：**
```jsx
// Problem: 多个容器嵌套
<div className="animation-wrapper">
  <div className="animation-container">
    <Component />
  </div>
</div>

// Solution: 扁平化结构
<div className="animation-wrapper">
  <Component />
</div>
```

## 快速修复清单

当遇到布局问题时，按顺序尝试：

1. [ ] 移除 Canvas 的 HTML width/height 属性
2. [ ] Canvas 容器设置 `min-width: 0` 防止收缩
3. [ ] 父容器使用 `display: flow-root` 建立 BFC
4. [ ] 移除 `overflow: hidden`（如非必要）
5. [ ] 检查是否有 `flex-direction: column` 与子 flex 冲突
6. [ ] 简化嵌套层级，移除中间容器
7. [ ] Canvas CSS 设置 `width: 100%; height: auto;`

## 布局调试检查表

```
□ 1. 确认问题元素的直接父容器
□ 2. 检查父容器的 display 属性（flex/grid/block）
□ 3. 检查父容器的 overflow 设置
□ 4. 检查问题元素的 flex 属性（flex-grow/shrink）
□ 5. 确认是否有 flex 嵌套冲突
□ 6. 检查 Canvas 是否同时设置了 HTML 属性和 CSS
□ 7. 尝试移除中间 wrapper 容器
□ 8. 验证移动端响应式断点
```

## 参考资料

参见 `references/css-layout-guide.md` 获取更详细的 CSS 布局指南。