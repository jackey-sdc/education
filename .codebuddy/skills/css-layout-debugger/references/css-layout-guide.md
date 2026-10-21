# CSS 布局指南

## Flexbox vs Grid 选择

### 使用 Flexbox 当：
- 一维布局（单行或单列）
- 内容驱动的布局（内容决定大小）
- 导航栏、按钮组、表单项
- 均匀分布的元素

### 使用 Grid 当：
- 二维布局（行和列）
- 设计驱动的布局（固定的结构）
- 卡片网格、相册、表格式布局
- 复杂的对齐需求

## 常见布局模式

### 1. 经典两栏布局
```css
/* 方法1: Flexbox */
.container {
  display: flex;
  gap: 20px;
}
.sidebar {
  width: 300px;
  flex-shrink: 0;
}
.content {
  flex: 1;
  min-width: 0; /* 防止收缩 */
}

/* 方法2: Grid */
.container {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 20px;
}
```

### 2. 垂直居中
```css
/* 方法1: Flexbox */
.container {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 方法2: Grid */
.container {
  display: grid;
  place-items: center;
}

/* 方法3: Absolute + Transform */
.container {
  position: relative;
}
.child {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

### 3. Sticky Footer
```css
/* 方法1: Flexbox */
html, body {
  height: 100%;
}
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.main {
  flex: 1;
}

/* 方法2: Grid */
html, body {
  height: 100%;
}
#app {
  display: grid;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}
```

## BFC (Block Formatting Context)

### 触发 BFC 的方式：
- `overflow: hidden/auto/scroll` (非 visible)
- `display: flow-root` (推荐)
- `display: inline-block`
- `position: absolute/fixed`

### BFC 的作用：
1. 包含浮动元素
2. 防止 margin 穿透
3. 防止元素被浮动元素覆盖

```css
/* 问题：子元素的 margin-top 穿透到父元素外 */
.parent {
  background: #f00;
}
.child {
  margin-top: 20px;
}

/* 解决：建立 BFC */
.parent {
  overflow: hidden; /* 或 */
  display: flow-root;
}
```

## Canvas 布局最佳实践

### 错误做法：
```jsx
// 同时使用 HTML 属性和 CSS
<canvas
  width={600}  // HTML 属性 → canvas 像素分辨率
  height={400}
  style={{ width: '100%' }}  // CSS → 显示尺寸
// 导致 canvas 像素与显示尺寸不匹配
/>
```

### 正确做法 1：纯 CSS
```jsx
<canvas
  ref={canvasRef}
  style={{ width: '100%', height: 'auto' }}
/>
// JS 中设置 canvas.width = 600, canvas.height = 400
```

### 正确做法 2：纯 HTML（仅固定尺寸时）
```jsx
<canvas
  ref={canvasRef}
  width={600}
  height={400}
/>
// 不要用 CSS 覆盖尺寸
```

## 响应式断点建议

```css
/* 移动优先 */
/* 基础样式: 移动端 */

/* 平板 */
@media (min-width: 768px) { }

/* 桌面 */
@media (min-width: 1024px) { }

/* 大屏 */
@media (min-width: 1280px) { }
```

## z-index 层级规范

```css
--z-dropdown: 100;
--z-sticky: 200;
--z-fixed: 300;
--z-modal-backdrop: 400;
--z-modal: 500;
--z-popover: 600;
--z-tooltip: 700;
```

## 避免的常见错误

1. **不要用 `height: 100vh` 做内容页** - 会导致移动端地址栏问题
2. **不要用 `overflow: hidden` 清除浮动** - 用 BFC 或 clearfix
3. **不要同时用 flex 和 grid** - 造成不必要的复杂性
4. **不要省略 `min-width: 0`** - flex 子元素默认不可收缩
5. **不要用 `max-width: 100%` 限制 canvas** - 会导致模糊