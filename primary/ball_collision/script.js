// 获取DOM元素
const canvas = document.getElementById('simulation-canvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const randomBtn = document.getElementById('random-btn');
const ballCountInput = document.getElementById('ball-count');
const ballCountValue = document.getElementById('ball-count-value');
const addBallBtn = document.getElementById('add-ball-btn');
const removeBallBtn = document.getElementById('remove-ball-btn');
const ballControls = document.getElementById('ball-controls');

// 设置画布尺寸
function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
}

// 初始化时调整画布尺寸
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// 球体类
class Ball {
    constructor(x, y, radius, speedX, speedY, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.speedX = speedX;
        this.speedY = speedY;
        this.color = color;
        // 质量与半径的立方成正比（假设密度相同）
        this.mass = Math.pow(radius, 3);
    }

    // 绘制球体
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    // 更新球体位置
    update() {
        // 检测与墙壁的碰撞
        if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
            this.speedX = -this.speedX;
        }
        if (this.y + this.radius > canvas.height || this.y - this.radius < 0) {
            this.speedY = -this.speedY;
        }

        // 确保球不会卡在边界外
        if (this.x + this.radius > canvas.width) {
            this.x = canvas.width - this.radius;
        }
        if (this.x - this.radius < 0) {
            this.x = this.radius;
        }
        if (this.y + this.radius > canvas.height) {
            this.y = canvas.height - this.radius;
        }
        if (this.y - this.radius < 0) {
            this.y = this.radius;
        }

        // 更新位置
        this.x += this.speedX;
        this.y += this.speedY;
    }
}

// 检测两个球是否碰撞
function checkCollision(ball1, ball2) {
    const dx = ball2.x - ball1.x;
    const dy = ball2.y - ball1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance < ball1.radius + ball2.radius;
}

// 处理两个球的碰撞
function resolveCollision(ball1, ball2) {
    const dx = ball2.x - ball1.x;
    const dy = ball2.y - ball1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // 计算法向单位向量（球心连线方向）
    const nx = dx / distance;
    const ny = dy / distance;
    
    // 计算切向单位向量（垂直于法向）
    const tx = -ny;
    const ty = nx;
    
    // 防止球体重叠
    const overlap = (ball1.radius + ball2.radius - distance) / 2;
    ball1.x -= overlap * nx;
    ball2.x += overlap * nx;
    ball1.y -= overlap * ny;
    ball2.y += overlap * ny;
    
    // 计算碰撞前在法向和切向上的速度分量
    const v1n = ball1.speedX * nx + ball1.speedY * ny;
    const v1t = ball1.speedX * tx + ball1.speedY * ty;
    const v2n = ball2.speedX * nx + ball2.speedY * ny;
    const v2t = ball2.speedX * tx + ball2.speedY * ty;
    
    // 计算碰撞后的法向速度（使用动量守恒和能量守恒）
    const m1 = ball1.mass;
    const m2 = ball2.mass;
    
    const v1nAfter = (v1n * (m1 - m2) + 2 * m2 * v2n) / (m1 + m2);
    const v2nAfter = (v2n * (m2 - m1) + 2 * m1 * v1n) / (m1 + m2);
    
    // 切向速度保持不变
    const v1tAfter = v1t;
    const v2tAfter = v2t;
    
    // 将速度分量转换回x和y方向
    ball1.speedX = v1nAfter * nx + v1tAfter * tx;
    ball1.speedY = v1nAfter * ny + v1tAfter * ty;
    ball2.speedX = v2nAfter * nx + v2tAfter * tx;
    ball2.speedY = v2nAfter * ny + v2tAfter * ty;
}

// 创建球体数组
let balls = [];
let animationId;
let isSimulationRunning = false;
let ballCount = 2; // 默认2个球

// 生成随机颜色
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// 生成随机位置（确保不会重叠）
function getRandomPosition(radius) {
    let x, y;
    let isOverlap;
    let maxAttempts = 100;
    let attempts = 0;
    
    do {
        isOverlap = false;
        x = radius + Math.random() * (canvas.width - 2 * radius);
        y = radius + Math.random() * (canvas.height - 2 * radius);
        
        // 检查是否与现有球体重叠
        for (let i = 0; i < balls.length; i++) {
            const dx = x - balls[i].x;
            const dy = y - balls[i].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < radius + balls[i].radius + 5) { // 添加5像素的额外间距
                isOverlap = true;
                break;
            }
        }
        
        attempts++;
    } while (isOverlap && attempts < maxAttempts);
    
    // 如果尝试多次仍无法找到不重叠的位置，则返回一个默认位置
    if (attempts >= maxAttempts) {
        x = canvas.width / 2;
        y = canvas.height / 2;
    }
    
    return { x, y };
}

// 创建球体控制面板
function createBallControls() {
    ballControls.innerHTML = '';
    
    for (let i = 0; i < ballCount; i++) {
        const controlGroup = document.createElement('div');
        controlGroup.className = 'control-group';
        controlGroup.innerHTML = `
            <h3>球体 ${i + 1}</h3>
            <div class="control-item">
                <label for="ball${i}-radius">半径:</label>
                <input type="range" id="ball${i}-radius" min="10" max="50" value="${Math.floor(Math.random() * 20) + 15}" step="1">
                <span id="ball${i}-radius-value">${Math.floor(Math.random() * 20) + 15}</span>
            </div>
            <div class="control-item">
                <label for="ball${i}-speed-x">水平速度:</label>
                <input type="range" id="ball${i}-speed-x" min="-10" max="10" value="${(Math.random() * 6 - 3).toFixed(1)}" step="0.5">
                <span id="ball${i}-speed-x-value">${(Math.random() * 6 - 3).toFixed(1)}</span>
            </div>
            <div class="control-item">
                <label for="ball${i}-speed-y">垂直速度:</label>
                <input type="range" id="ball${i}-speed-y" min="-10" max="10" value="${(Math.random() * 6 - 3).toFixed(1)}" step="0.5">
                <span id="ball${i}-speed-y-value">${(Math.random() * 6 - 3).toFixed(1)}</span>
            </div>
            <div class="control-item">
                <label for="ball${i}-color">颜色:</label>
                <input type="color" id="ball${i}-color" value="${getRandomColor()}">
            </div>
        `;
        
        ballControls.appendChild(controlGroup);
    }
    
    // 添加事件监听器
    for (let i = 0; i < ballCount; i++) {
        const radiusInput = document.getElementById(`ball${i}-radius`);
        const speedXInput = document.getElementById(`ball${i}-speed-x`);
        const speedYInput = document.getElementById(`ball${i}-speed-y`);
        const colorInput = document.getElementById(`ball${i}-color`);
        const radiusValue = document.getElementById(`ball${i}-radius-value`);
        const speedXValue = document.getElementById(`ball${i}-speed-x-value`);
        const speedYValue = document.getElementById(`ball${i}-speed-y-value`);
        
        radiusInput.addEventListener('input', () => {
            radiusValue.textContent = radiusInput.value;
            if (!isSimulationRunning) {
                initBalls();
            }
        });
        
        speedXInput.addEventListener('input', () => {
            speedXValue.textContent = speedXInput.value;
            if (!isSimulationRunning) {
                initBalls();
            }
        });
        
        speedYInput.addEventListener('input', () => {
            speedYValue.textContent = speedYInput.value;
            if (!isSimulationRunning) {
                initBalls();
            }
        });
        
        colorInput.addEventListener('input', () => {
            if (!isSimulationRunning) {
                initBalls();
            }
        });
    }
}

// 初始化球体
function initBalls() {
    balls = [];
    
    // 为每个球体创建一个Ball对象
    for (let i = 0; i < ballCount; i++) {
        const radiusInput = document.getElementById(`ball${i}-radius`);
        const speedXInput = document.getElementById(`ball${i}-speed-x`);
        const speedYInput = document.getElementById(`ball${i}-speed-y`);
        const colorInput = document.getElementById(`ball${i}-color`);
        
        const radius = parseInt(radiusInput.value);
        const speedX = parseFloat(speedXInput.value);
        const speedY = parseFloat(speedYInput.value);
        const color = colorInput.value;
        
        // 计算位置，避免球体重叠
        const position = getRandomPosition(radius);
        
        balls.push(new Ball(
            position.x,
            position.y,
            radius,
            speedX,
            speedY,
            color
        ));
    }
    
    // 绘制初始状态
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    balls.forEach(ball => ball.draw());
}

// 随机设置所有球的参数
function randomizeBalls() {
    for (let i = 0; i < ballCount; i++) {
        const radiusInput = document.getElementById(`ball${i}-radius`);
        const speedXInput = document.getElementById(`ball${i}-speed-x`);
        const speedYInput = document.getElementById(`ball${i}-speed-y`);
        const colorInput = document.getElementById(`ball${i}-color`);
        const radiusValue = document.getElementById(`ball${i}-radius-value`);
        const speedXValue = document.getElementById(`ball${i}-speed-x-value`);
        const speedYValue = document.getElementById(`ball${i}-speed-y-value`);
        
        const randomRadius = Math.floor(Math.random() * 30) + 10; // 10-40
        const randomSpeedX = (Math.random() * 16 - 8).toFixed(1); // -8 to 8
        const randomSpeedY = (Math.random() * 16 - 8).toFixed(1); // -8 to 8
        const randomColor = getRandomColor();
        
        radiusInput.value = randomRadius;
        speedXInput.value = randomSpeedX;
        speedYInput.value = randomSpeedY;
        colorInput.value = randomColor;
        
        radiusValue.textContent = randomRadius;
        speedXValue.textContent = randomSpeedX;
        speedYValue.textContent = randomSpeedY;
    }
    
    initBalls();
}

// 动画循环
function animate() {
    animationId = requestAnimationFrame(animate);
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 更新所有球体位置
    balls.forEach(ball => ball.update());
    
    // 检测所有球体之间的碰撞
    for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
            if (checkCollision(balls[i], balls[j])) {
                resolveCollision(balls[i], balls[j]);
            }
        }
    }
    
    // 绘制所有球体
    balls.forEach(ball => ball.draw());
}

// 更新球体数量
function updateBallCount() {
    const newCount = parseInt(ballCountInput.value);
    
    if (newCount !== ballCount) {
        ballCount = newCount;
        ballCountValue.textContent = ballCount;
        createBallControls();
        initBalls();
    }
}

// 添加一个球
function addBall() {
    if (ballCount < 10) {
        ballCount++;
        ballCountInput.value = ballCount;
        ballCountValue.textContent = ballCount;
        createBallControls();
        initBalls();
    }
}

// 删除一个球
function removeBall() {
    if (ballCount > 2) {
        ballCount--;
        ballCountInput.value = ballCount;
        ballCountValue.textContent = ballCount;
        createBallControls();
        initBalls();
    }
}

// 添加事件监听器
ballCountInput.addEventListener('input', () => {
    updateBallCount();
});

addBallBtn.addEventListener('click', addBall);
removeBallBtn.addEventListener('click', removeBall);

// 开始按钮事件
startBtn.addEventListener('click', () => {
    if (!isSimulationRunning) {
        isSimulationRunning = true;
        startBtn.textContent = '暂停';
        animate();
    } else {
        isSimulationRunning = false;
        startBtn.textContent = '开始';
        cancelAnimationFrame(animationId);
    }
});

// 重置按钮事件
resetBtn.addEventListener('click', () => {
    isSimulationRunning = false;
    startBtn.textContent = '开始';
    cancelAnimationFrame(animationId);
    initBalls();
});

// 随机按钮事件
randomBtn.addEventListener('click', () => {
    randomizeBalls();
});

// 初始化
createBallControls();
initBalls();