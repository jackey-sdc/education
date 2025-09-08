// 太阳系行星数据
const planetData = [
    {
        name: "太阳",
        radius: 25,
        distance: 0,
        rotationSpeed: 0.005,
        revolutionSpeed: 0,
        color: 0xff7733,
        emissive: 0xff5533,
        info: "太阳系的中心恒星，直径约1,392,000公里"
    },
    {
        name: "水星",
        radius: 3,
        distance: 40,
        rotationSpeed: 0.006,
        revolutionSpeed: 0.08,
        color: 0x888888,
        info: "最靠近太阳的行星，表面温度极高"
    },
    {
        name: "金星",
        radius: 5,
        distance: 60,
        rotationSpeed: 0.003,
        revolutionSpeed: 0.06,
        color: 0xffaa33,
        info: "地球的姊妹星，有浓厚的大气层"
    },
    {
        name: "地球",
        radius: 5.5,
        distance: 80,
        rotationSpeed: 0.012,
        revolutionSpeed: 0.04,
        color: 0x2233ff,
        info: "我们的家园，唯一已知有生命的行星"
    },
    {
        name: "火星",
        radius: 3.5,
        distance: 100,
        rotationSpeed: 0.011,
        revolutionSpeed: 0.03,
        color: 0xff6633,
        info: "红色行星，可能有水存在"
    },
    {
        name: "木星",
        radius: 12,
        distance: 140,
        rotationSpeed: 0.03,
        revolutionSpeed: 0.02,
        color: 0xffaa77,
        info: "太阳系最大的行星，有著名的大红斑"
    },
    {
        name: "土星",
        radius: 11,
        distance: 180,
        rotationSpeed: 0.028,
        revolutionSpeed: 0.015,
        color: 0xffeeaa,
        info: "有美丽的光环系统"
    },
    {
        name: "天王星",
        radius: 8,
        distance: 220,
        rotationSpeed: 0.02,
        revolutionSpeed: 0.01,
        color: 0xaaffff,
        info: "侧向自转的冰巨星"
    },
    {
        name: "海王星",
        radius: 8,
        distance: 260,
        rotationSpeed: 0.021,
        revolutionSpeed: 0.008,
        color: 0x3366ff,
        info: "最远的行星，有强烈的风暴"
    }
];

// 初始化Three.js场景
let scene, camera, renderer, controls;
let planets = [];
let speedMultiplier = 1;
let autoRotate = true;

function init() {
    
    // 检查WebGL支持
    if (!checkWebGLSupport()) {
        return;
    }
    
    // 创建场景
    scene = new THREE.Scene();
    
    // 创建相机
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.z = 300;
    camera.position.y = 100;
    
    // 创建渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);
    
    // 添加轨道控制
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    // 添加环境光
    const ambientLight = new THREE.AmbientLight(0x333333);
    scene.add(ambientLight);
    
    // 添加点光源模拟太阳光
    const sunLight = new THREE.PointLight(0xffaa88, 2, 300);
    scene.add(sunLight);
    
    // 创建星空背景
    createStars();
    
    // 创建行星
    createPlanets();
    
    // 添加事件监听
    window.addEventListener('resize', onWindowResize);
    renderer.domElement.addEventListener('click', onPlanetClick);
    
    // 控制面板事件
    document.getElementById('autoRotate').addEventListener('change', (e) => {
        autoRotate = e.target.checked;
    });
    
    document.getElementById('speed').addEventListener('input', (e) => {
        speedMultiplier = parseFloat(e.target.value);
        document.getElementById('speedValue').textContent = speedMultiplier.toFixed(1);
    });
    
    // 隐藏加载提示
    document.getElementById('loading').style.display = 'none';
    
    // 开始动画
    animate();
}

function createStars() {
    const starGeometry = new THREE.BufferGeometry();
    // 根据设备性能调整星星数量
    const starCount = window.devicePixelRatio > 1 ? 5000 : 3000;
    const positions = new Float32Array(starCount * 3);
    
    for (let i = 0; i < starCount; i++) {
        const i3 = i * 3;
        positions[i3] = (Math.random() - 0.5) * 2000;
        positions[i3 + 1] = (Math.random() - 0.5) * 2000;
        positions[i3 + 2] = (Math.random() - 0.5) * 2000;
    }
    
    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.7,
        sizeAttenuation: true
    });
    
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
}

function createPlanets() {
    planetData.forEach((data, index) => {
        // 根据设备性能调整几何体分段数
        const segmentDetail = window.devicePixelRatio > 1 ? 32 : 24;
        const geometry = new THREE.SphereGeometry(data.radius, segmentDetail, segmentDetail);
        let material;
        
        if (index === 0) { // 太阳
            material = new THREE.MeshBasicMaterial({
                color: data.color,
                emissive: data.emissive,
                emissiveIntensity: 0.8
            });
        } else {
            material = new THREE.MeshPhongMaterial({
                color: data.color,
                shininess: 20,
                specular: 0x333333
            });
        }
        
        const planet = new THREE.Mesh(geometry, material);
        
        // 创建轨道
        if (index > 0) {
            const orbitGeometry = new THREE.RingGeometry(data.distance - 0.5, data.distance + 0.5, 64);
            const orbitMaterial = new THREE.MeshBasicMaterial({
                color: 0x444444,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.2
            });
            const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
            orbit.rotation.x = Math.PI / 2;
            scene.add(orbit);
        }
        
        // 为土星添加光环
        if (data.name === "土星") {
            const ringGeometry = new THREE.RingGeometry(data.radius * 1.3, data.radius * 2.2, 64);
            const ringMaterial = new THREE.MeshBasicMaterial({
                color: 0xddccaa,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.7
            });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.rotation.x = Math.PI / 2;
            planet.add(ring);
        }
        
        planet.userData = data;
        planets.push(planet);
        scene.add(planet);
    });
}

function animate() {
    requestAnimationFrame(animate);
    
    const time = Date.now() * 0.001;
    
    // 更新行星位置和旋转
    planets.forEach((planet, index) => {
        const data = planet.userData;
        
        if (index === 0) { // 太阳
            planet.rotation.y += data.rotationSpeed * speedMultiplier;
        } else {
            // 公转
            const orbitAngle = time * data.revolutionSpeed * speedMultiplier;
            const orbitRadius = data.distance;
            
            // 椭圆轨道
            const eccentricity = 0.1;
            const xRadius = orbitRadius * (1 + eccentricity);
            const zRadius = orbitRadius * (1 - eccentricity);
            
            planet.position.x = Math.cos(orbitAngle) * xRadius;
            planet.position.z = Math.sin(orbitAngle) * zRadius;
            
            // 轨道倾斜
            const inclination = Math.PI / 12;
            planet.position.y = Math.sin(orbitAngle) * Math.sin(inclination) * orbitRadius * 0.3;
            
            // 自转
            planet.rotation.y += data.rotationSpeed * speedMultiplier;
        }
    });
    
    // 更新控制
    controls.autoRotate = autoRotate;
    if (autoRotate) {
        controls.autoRotateSpeed = 0.5;
    }
    controls.update();
    
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onPlanetClick(event) {
    const mouse = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    
    const intersects = raycaster.intersectObjects(planets);
    
    if (intersects.length > 0) {
        const planet = intersects[0].object;
        const data = planet.userData;
        
        const infoDiv = document.getElementById('planetInfo');
        infoDiv.innerHTML = `
            <h3>${data.name}</h3>
            <p>${data.info}</p>
            <p>半径: ${data.radius} 单位</p>
            <p>距离: ${data.distance} 单位</p>
        `;
        infoDiv.style.display = 'block';
        
        // 使用变量存储timeout ID，便于清除
        if (window.planetInfoTimeout) {
            clearTimeout(window.planetInfoTimeout);
        }
        window.planetInfoTimeout = setTimeout(() => {
            infoDiv.style.display = 'none';
        }, 3000);
    }
}

// 检查WebGL支持并启动应用
function checkWebGLSupport() {
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) {
            throw new Error('WebGL not supported');
        }
        return true;
    } catch (e) {
        const warning = document.createElement('div');
        warning.className = 'loading';
        warning.innerHTML = '您的浏览器不支持WebGL，无法显示3D太阳系模型。';
        document.body.appendChild(warning);
        return false;
    }
}

// 启动应用
init();