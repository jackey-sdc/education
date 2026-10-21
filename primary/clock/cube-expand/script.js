document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const cube = document.getElementById('cube');
    const cubeBtn = document.getElementById('cube-btn');
    const cuboidBtn = document.getElementById('cuboid-btn');
    const resetBtn = document.getElementById('reset-btn');
    const playAnimationBtn = document.getElementById('play-animation-btn');
    const templatesGrid = document.getElementById('templates-grid');
    const animationStage = document.getElementById('animation-stage');
    
    // 当前状态
    let currentShape = 'cube'; // 默认为立方体
    let selectedTemplate = null; // 当前选中的展开模板
    let isAnimating = false; // 是否正在播放动画
    
    // 立方体和长方体的尺寸配置
    const shapeConfig = {
        cube: {
            dimensions: { width: 200, height: 200, depth: 200 },
            faces: {
                front: { width: 200, height: 200, transform: 'translateZ(100px)' },
                back: { width: 200, height: 200, transform: 'rotateY(180deg) translateZ(100px)' },
                right: { width: 200, height: 200, transform: 'rotateY(90deg) translateZ(100px)' },
                left: { width: 200, height: 200, transform: 'rotateY(-90deg) translateZ(100px)' },
                top: { width: 200, height: 200, transform: 'rotateX(90deg) translateZ(100px)' },
                bottom: { width: 200, height: 200, transform: 'rotateX(-90deg) translateZ(100px)' }
            }
        },
        cuboid: {
            dimensions: { width: 200, height: 150, depth: 100 },
            faces: {
                front: { width: 200, height: 150, transform: 'translateZ(50px)' },
                back: { width: 200, height: 150, transform: 'rotateY(180deg) translateZ(50px)' },
                right: { width: 100, height: 150, transform: 'rotateY(90deg) translateZ(100px)' },
                left: { width: 100, height: 150, transform: 'rotateY(-90deg) translateZ(100px)' },
                top: { width: 200, height: 100, transform: 'rotateX(90deg) translateZ(75px)' },
                bottom: { width: 200, height: 100, transform: 'rotateX(-90deg) translateZ(75px)' }
            }
        }
    };
    
    // 立方体展开模板配置 - 6种基本展开方式
    const cubeTemplates = [
        {
            name: "十字形",
            layout: {
                front: { gridColumn: 2, gridRow: 2 },
                back: { gridColumn: 4, gridRow: 2 },
                right: { gridColumn: 3, gridRow: 2 },
                left: { gridColumn: 1, gridRow: 2 },
                top: { gridColumn: 2, gridRow: 1 },
                bottom: { gridColumn: 2, gridRow: 3 }
            },
            foldingSequence: [
                { face: 'top', axis: 'x', angle: -90, origin: 'bottom' },
                { face: 'right', axis: 'y', angle: -90, origin: 'left' },
                { face: 'left', axis: 'y', angle: 90, origin: 'right' },
                { face: 'bottom', axis: 'x', angle: 90, origin: 'top' },
                { face: 'back', axis: 'y', angle: 180, origin: 'left' }
            ]
        },
        {
            name: "T形",
            layout: {
                front: { gridColumn: 2, gridRow: 2 },
                back: { gridColumn: 2, gridRow: 3 },
                right: { gridColumn: 3, gridRow: 2 },
                left: { gridColumn: 1, gridRow: 2 },
                top: { gridColumn: 2, gridRow: 1 },
                bottom: { gridColumn: 4, gridRow: 2 }
            },
            foldingSequence: [
                { face: 'top', axis: 'x', angle: -90, origin: 'bottom' },
                { face: 'right', axis: 'y', angle: -90, origin: 'left' },
                { face: 'left', axis: 'y', angle: 90, origin: 'right' },
                { face: 'back', axis: 'x', angle: 90, origin: 'top' },
                { face: 'bottom', axis: 'y', angle: -90, origin: 'left' }
            ]
        },
        {
            name: "直线形",
            layout: {
                front: { gridColumn: 2, gridRow: 1 },
                back: { gridColumn: 2, gridRow: 6 },
                right: { gridColumn: 2, gridRow: 3 },
                left: { gridColumn: 2, gridRow: 2 },
                top: { gridColumn: 2, gridRow: 4 },
                bottom: { gridColumn: 2, gridRow: 5 }
            },
            foldingSequence: [
                { face: 'left', axis: 'y', angle: 90, origin: 'right' },
                { face: 'right', axis: 'y', angle: -90, origin: 'left' },
                { face: 'top', axis: 'x', angle: -90, origin: 'bottom' },
                { face: 'bottom', axis: 'x', angle: 90, origin: 'top' },
                { face: 'back', axis: 'y', angle: 180, origin: 'left' }
            ]
        },
        {
            name: "十字变体1",
            layout: {
                front: { gridColumn: 2, gridRow: 2 },
                back: { gridColumn: 2, gridRow: 4 },
                right: { gridColumn: 3, gridRow: 2 },
                left: { gridColumn: 1, gridRow: 2 },
                top: { gridColumn: 2, gridRow: 1 },
                bottom: { gridColumn: 2, gridRow: 3 }
            },
            foldingSequence: [
                { face: 'top', axis: 'x', angle: -90, origin: 'bottom' },
                { face: 'right', axis: 'y', angle: -90, origin: 'left' },
                { face: 'left', axis: 'y', angle: 90, origin: 'right' },
                { face: 'bottom', axis: 'x', angle: 90, origin: 'top' },
                { face: 'back', axis: 'x', angle: 180, origin: 'top' }
            ]
        },
        {
            name: "Z字形",
            layout: {
                front: { gridColumn: 2, gridRow: 2 },
                back: { gridColumn: 3, gridRow: 1 },
                right: { gridColumn: 3, gridRow: 2 },
                left: { gridColumn: 1, gridRow: 2 },
                top: { gridColumn: 2, gridRow: 1 },
                bottom: { gridColumn: 2, gridRow: 3 }
            },
            foldingSequence: [
                { face: 'top', axis: 'x', angle: -90, origin: 'bottom' },
                { face: 'right', axis: 'y', angle: -90, origin: 'left' },
                { face: 'left', axis: 'y', angle: 90, origin: 'right' },
                { face: 'bottom', axis: 'x', angle: 90, origin: 'top' },
                { face: 'back', axis: 'z', angle: 180, origin: 'bottom' }
            ]
        },
        {
            name: "L字形",
            layout: {
                front: { gridColumn: 1, gridRow: 1 },
                back: { gridColumn: 3, gridRow: 3 },
                right: { gridColumn: 2, gridRow: 1 },
                left: { gridColumn: 1, gridRow: 2 },
                top: { gridColumn: 3, gridRow: 1 },
                bottom: { gridColumn: 3, gridRow: 2 }
            },
            foldingSequence: [
                { face: 'left', axis: 'y', angle: 90, origin: 'right' },
                { face: 'right', axis: 'y', angle: -90, origin: 'left' },
                { face: 'top', axis: 'x', angle: -90, origin: 'bottom' },
                { face: 'bottom', axis: 'x', angle: 90, origin: 'top' },
                { face: 'back', axis: 'z', angle: 180, origin: 'top' }
            ]
        }
    ];
    
    // 长方体展开模板配置 - 6种基本展开方式
    const cuboidTemplates = [
        {
            name: "十字形",
            layout: {
                front: { gridColumn: 2, gridRow: 2 },
                back: { gridColumn: 4, gridRow: 2 },
                right: { gridColumn: 3, gridRow: 2 },
                left: { gridColumn: 1, gridRow: 2 },
                top: { gridColumn: 2, gridRow: 1 },
                bottom: { gridColumn: 2, gridRow: 3 }
            },
            foldingSequence: [
                { face: 'top', axis: 'x', angle: -90, origin: 'bottom' },
                { face: 'right', axis: 'y', angle: -90, origin: 'left' },
                { face: 'left', axis: 'y', angle: 90, origin: 'right' },
                { face: 'bottom', axis: 'x', angle: 90, origin: 'top' },
                { face: 'back', axis: 'y', angle: 180, origin: 'left' }
            ]
        },
        {
            name: "T形",
            layout: {
                front: { gridColumn: 2, gridRow: 2 },
                back: { gridColumn: 2, gridRow: 3 },
                right: { gridColumn: 3, gridRow: 2 },
                left: { gridColumn: 1, gridRow: 2 },
                top: { gridColumn: 2, gridRow: 1 },
                bottom: { gridColumn: 4, gridRow: 2 }
            },
            foldingSequence: [
                { face: 'top', axis: 'x', angle: -90, origin: 'bottom' },
                { face: 'right', axis: 'y', angle: -90, origin: 'left' },
                { face: 'left', axis: 'y', angle: 90, origin: 'right' },
                { face: 'back', axis: 'x', angle: 90, origin: 'top' },
                { face: 'bottom', axis: 'y', angle: -90, origin: 'left' }
            ]
        },
        {
            name: "直线形",
            layout: {
                front: { gridColumn: 2, gridRow: 1 },
                back: { gridColumn: 2, gridRow: 6 },
                right: { gridColumn: 2, gridRow: 3 },
                left: { gridColumn: 2, gridRow: 2 },
                top: { gridColumn: 2, gridRow: 4 },
                bottom: { gridColumn: 2, gridRow: 5 }
            },
            foldingSequence: [
                { face: 'left', axis: 'y', angle: 90, origin: 'right' },
                { face: 'right', axis: 'y', angle: -90, origin: 'left' },
                { face: 'top', axis: 'x', angle: -90, origin: 'bottom' },
                { face: 'bottom', axis: 'x', angle: 90, origin: 'top' },
                { face: 'back', axis: 'y', angle: 180, origin: 'left' }
            ]
        },
        {
            name: "十字变体1",
            layout: {
                front: { gridColumn: 2, gridRow: 2 },
                back: { gridColumn: 2, gridRow: 4 },
                right: { gridColumn: 3, gridRow: 2 },
                left: { gridColumn: 1, gridRow: 2 },
                top: { gridColumn: 2, gridRow: 1 },
                bottom: { gridColumn: 2, gridRow: 3 }
            },
            foldingSequence: [
                { face: 'top', axis: 'x', angle: -90, origin: 'bottom' },
                { face: 'right', axis: 'y', angle: -90, origin: 'left' },
                { face: 'left', axis: 'y', angle: 90, origin: 'right' },
                { face: 'bottom', axis: 'x', angle: 90, origin: 'top' },
                { face: 'back', axis: 'x', angle: 180, origin: 'top' }
            ]
        },
        {
            name: "Z字形",
            layout: {
                front: { gridColumn: 2, gridRow: 2 },
                back: { gridColumn: 3, gridRow: 1 },
                right: { gridColumn: 3, gridRow: 2 },
                left: { gridColumn: 1, gridRow: 2 },
                top: { gridColumn: 2, gridRow: 1 },
                bottom: { gridColumn: 2, gridRow: 3 }
            },
            foldingSequence: [
                { face: 'top', axis: 'x', angle: -90, origin: 'bottom' },
                { face: 'right', axis: 'y', angle: -90, origin: 'left' },
                { face: 'left', axis: 'y', angle: 90, origin: 'right' },
                { face: 'bottom', axis: 'x', angle: 90, origin: 'top' },
                { face: 'back', axis: 'z', angle: 180, origin: 'bottom' }
            ]
        },
        {
            name: "L字形",
            layout: {
                front: { gridColumn: 1, gridRow: 1 },
                back: { gridColumn: 3, gridRow: 3 },
                right: { gridColumn: 2, gridRow: 1 },
                left: { gridColumn: 1, gridRow: 2 },
                top: { gridColumn: 3, gridRow: 1 },
                bottom: { gridColumn: 3, gridRow: 2 }
            },
            foldingSequence: [
                { face: 'left', axis: 'y', angle: 90, origin: 'right' },
                { face: 'right', axis: 'y', angle: -90, origin: 'left' },
                { face: 'top', axis: 'x', angle: -90, origin: 'bottom' },
                { face: 'bottom', axis: 'x', angle: 90, origin: 'top' },
                { face: 'back', axis: 'z', angle: 180, origin: 'top' }
            ]
        }
    ];
    
    // 初始化立方体
    function initCube() {
        // 获取所有面
        const faces = document.querySelectorAll('.face');
        
        // 更新面的尺寸和位置
        faces.forEach(face => {
            const faceType = face.classList[1]; // 获取面的类型（front, back等）
            const config = shapeConfig[currentShape].faces[faceType];
            
            face.style.width = config.width + 'px';
            face.style.height = config.height + 'px';
            face.style.transform = config.transform;
        });
        
        // 重置选中状态
        selectedTemplate = null;
        
        // 清空动画舞台
        animationStage.innerHTML = '';
        
        // 生成展开模板
        generateTemplates();
    }
    
    // 生成展开模板
    function generateTemplates() {
        // 清空模板容器
        templatesGrid.innerHTML = '';
        
        // 获取当前形状的模板
        const templates = currentShape === 'cube' ? cubeTemplates : cuboidTemplates;
        
        // 为每个模板创建一个元素
        templates.forEach((template, index) => {
            const templateItem = document.createElement('div');
            templateItem.className = 'template-item';
            templateItem.dataset.index = index;
            
            // 添加模板编号
            const templateNumber = document.createElement('div');
            templateNumber.className = 'template-number';
            templateNumber.textContent = index + 1;
            templateItem.appendChild(templateNumber);
            
            // 创建模板网格
            const templateGrid = document.createElement('div');
            templateGrid.className = 'template-grid';
            
            // 添加面到模板网格
            const allFaces = ['front', 'back', 'right', 'left', 'top', 'bottom'];
            allFaces.forEach(faceType => {
                if (template.layout[faceType]) {
                    const face = document.createElement('div');
                    face.className = `template-face ${faceType}`;
                    face.textContent = faceType.charAt(0).toUpperCase();
                    
                    // 设置网格位置
                    face.style.gridColumn = template.layout[faceType].gridColumn;
                    face.style.gridRow = template.layout[faceType].gridRow;
                    
                    // 设置颜色
                    const colors = {
                        front: 'rgba(255, 87, 34, 0.7)',
                        back: 'rgba(33, 150, 243, 0.7)',
                        right: 'rgba(76, 175, 80, 0.7)',
                        left: 'rgba(255, 193, 7, 0.7)',
                        top: 'rgba(156, 39, 176, 0.7)',
                        bottom: 'rgba(0, 188, 212, 0.7)'
                    };
                    face.style.backgroundColor = colors[faceType];
                    
                    templateGrid.appendChild(face);
                }
            });
            
            templateItem.appendChild(templateGrid);
            
            // 添加点击事件
            templateItem.addEventListener('click', function() {
                selectTemplate(index);
            });
            
            templatesGrid.appendChild(templateItem);
        });
    }
    
    // 选择模板
    function selectTemplate(index) {
        // 如果正在播放动画，则不允许切换模板
        if (isAnimating) return;
        
        // 获取当前形状的模板
        const templates = currentShape === 'cube' ? cubeTemplates : cuboidTemplates;
        selectedTemplate = templates[index];
        
        // 更新模板选中状态
        const templateItems = document.querySelectorAll('.template-item');
        templateItems.forEach(item => {
            if (parseInt(item.dataset.index) === index) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
        
        // 清空动画舞台
        animationStage.innerHTML = '';
        
        // 创建展开图预览
        createExpansionPreview();
    }
    
    // 创建展开图预览
    function createExpansionPreview() {
        if (!selectedTemplate) return;
        
        // 创建展开图容器
        const expansionPreview = document.createElement('div');
        expansionPreview.className = 'animation-expansion';
        expansionPreview.style.opacity = '1';
        
        // 添加面到展开图
        const allFaces = ['front', 'back', 'right', 'left', 'top', 'bottom'];
        allFaces.forEach(faceType => {
            if (selectedTemplate.layout[faceType]) {
                const face = document.createElement('div');
                face.className = `animation-face ${faceType}`;
                face.textContent = faceType.charAt(0).toUpperCase();
                
                // 设置网格位置
                face.style.gridColumn = selectedTemplate.layout[faceType].gridColumn;
                face.style.gridRow = selectedTemplate.layout[faceType].gridRow;
                
                // 设置颜色
                const colors = {
                    front: 'rgba(255, 87, 34, 0.7)',
                    back: 'rgba(33, 150, 243, 0.7)',
                    right: 'rgba(76, 175, 80, 0.7)',
                    left: 'rgba(255, 193, 7, 0.7)',
                    top: 'rgba(156, 39, 176, 0.7)',
                    bottom: 'rgba(0, 188, 212, 0.7)'
                };
                face.style.backgroundColor = colors[faceType];
                
                expansionPreview.appendChild(face);
            }
        });
        
        animationStage.appendChild(expansionPreview);
    }
    
    // 播放动画
    function playAnimation() {
        if (!selectedTemplate || isAnimating) return;
        
        isAnimating = true;
        
        // 清空动画舞台
        animationStage.innerHTML = '';
        
        // 创建动画容器
        const animationContainer = document.createElement('div');
        animationContainer.className = 'animation-container';
        animationStage.appendChild(animationContainer);
        
        // 创建状态指示器
        const statusIndicator = document.createElement('div');
        statusIndicator.className = 'animation-status';
        statusIndicator.textContent = '准备展开...';
        animationStage.appendChild(statusIndicator);
        
        // 创建展开图容器
        const expansionContainer = document.createElement('div');
        expansionContainer.className = 'animation-expansion';
        animationContainer.appendChild(expansionContainer);
        
        // 添加面到展开图
        const allFaces = ['front', 'back', 'right', 'left', 'top', 'bottom'];
        const faceElements = {};
        
        // 首先只添加正面（front）作为基准面
        const frontFace = document.createElement('div');
        frontFace.className = `animation-face front`;
        frontFace.textContent = 'F';
        frontFace.style.gridColumn = selectedTemplate.layout['front'].gridColumn;
        frontFace.style.gridRow = selectedTemplate.layout['front'].gridRow;
        frontFace.style.backgroundColor = 'rgba(255, 87, 34, 0.7)';
        expansionContainer.appendChild(frontFace);
        faceElements['front'] = frontFace;
        
        // 设置初始状态
        statusIndicator.textContent = '立方体初始状态';
        
        // 等待一段时间后开始逐个展开面
        setTimeout(() => {
            // 按照展开顺序逐个添加其他面
            const sequence = selectedTemplate.foldingSequence;
            let currentIndex = 0;
            
            function addNextFace() {
                if (currentIndex >= sequence.length) {
                    // 所有面都已添加，展开完成
                    statusIndicator.textContent = '展开完成！';
                    
                    // 等待一段时间后开始折叠
                    setTimeout(() => {
                        startFolding();
                    }, 2000);
                    return;
                }
                
                const faceInfo = sequence[currentIndex];
                const faceType = faceInfo.face;
                
                // 更新状态指示器
                statusIndicator.textContent = `正在展开 ${faceType} 面...`;
                
                // 创建新面
                const face = document.createElement('div');
                face.className = `animation-face ${faceType}`;
                face.textContent = faceType.charAt(0).toUpperCase();
                face.style.gridColumn = selectedTemplate.layout[faceType].gridColumn;
                face.style.gridRow = selectedTemplate.layout[faceType].gridRow;
                
                // 设置颜色
                const colors = {
                    front: 'rgba(255, 87, 34, 0.7)',
                    back: 'rgba(33, 150, 243, 0.7)',
                    right: 'rgba(76, 175, 80, 0.7)',
                    left: 'rgba(255, 193, 7, 0.7)',
                    top: 'rgba(156, 39, 176, 0.7)',
                    bottom: 'rgba(0, 188, 212, 0.7)'
                };
                face.style.backgroundColor = colors[faceType];
                
                // 添加展开动画效果
                face.style.opacity = '0';
                face.style.transform = 'scale(0.5)';
                face.style.transition = 'all 0.8s ease-out';
                
                // 添加到容器
                expansionContainer.appendChild(face);
                faceElements[faceType] = face;
                
                // 触发动画
                setTimeout(() => {
                    face.style.opacity = '1';
                    face.style.transform = 'scale(1)';
                    
                    // 等待动画完成后继续
                    setTimeout(() => {
                        currentIndex++;
                        addNextFace();
                    }, 1000);
                }, 50);
            }
            
            // 开始添加面
            addNextFace();
        }, 1000);
        
        // 折叠动画
        function startFolding() {
            statusIndicator.textContent = '准备折叠...';
            
            // 等待一段时间后开始折叠
            setTimeout(() => {
                // 按照逆序折叠
                const sequence = [...selectedTemplate.foldingSequence].reverse();
                let currentIndex = 0;
                
                function foldNextFace() {
                    if (currentIndex >= sequence.length) {
                        // 所有面都已折叠，完成
                        statusIndicator.textContent = '折叠完成！';
                        
                        // 等待一段时间后重置
                        setTimeout(() => {
                            isAnimating = false;
                            createExpansionPreview();
                        }, 1500);
                        return;
                    }
                    
                    const faceInfo = sequence[currentIndex];
                    const faceType = faceInfo.face;
                    
                    // 更新状态指示器
                    statusIndicator.textContent = `正在折叠 ${faceType} 面...`;
                    
                    // 获取要折叠的面
                    const face = faceElements[faceType];
                    
                    // 添加折叠动画效果
                    face.style.opacity = '0';
                    face.style.transform = 'scale(0.5)';
                    face.style.transition = 'all 0.8s ease-in';
                    
                    // 等待动画完成后继续
                    setTimeout(() => {
                        // 移除面
                        face.remove();
                        
                        currentIndex++;
                        foldNextFace();
                    }, 1000);
                }
                
                // 开始折叠
                foldNextFace();
            }, 1000);
        }
    }
    
    // 切换形状（立方体/长方体）
    function changeShape(shape) {
        currentShape = shape;
        
        // 更新按钮状态
        if (shape === 'cube') {
            cubeBtn.classList.add('active');
            cuboidBtn.classList.remove('active');
            cube.classList.remove('cuboid');
        } else {
            cuboidBtn.classList.add('active');
            cubeBtn.classList.remove('active');
            cube.classList.add('cuboid');
        }
        
        // 重置立方体和展开图
        initCube();
    }
    
    // 初始化
    initCube();
    
    // 添加事件监听器
    cubeBtn.addEventListener('click', () => changeShape('cube'));
    cuboidBtn.addEventListener('click', () => changeShape('cuboid'));
    resetBtn.addEventListener('click', initCube);
    playAnimationBtn.addEventListener('click', playAnimation);
    
    // 添加拖动旋转功能
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let rotation = { x: -30, y: 45 };
    
    document.addEventListener('mousedown', function(e) {
        isDragging = true;
        previousMousePosition = {
            x: e.clientX,
            y: e.clientY
        };
    });
    
    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        
        const deltaMove = {
            x: e.clientX - previousMousePosition.x,
            y: e.clientY - previousMousePosition.y
        };
        
        rotation.y += deltaMove.x * 0.5;
        rotation.x -= deltaMove.y * 0.5;
        
        cube.style.transform = `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`;
        
        previousMousePosition = {
            x: e.clientX,
            y: e.clientY
        };
    });
    
    document.addEventListener('mouseup', function() {
        isDragging = false;
    });
});