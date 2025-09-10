// DOM元素
const contentFrame = document.getElementById('content-frame');
const contentTitle = document.getElementById('content-title');
const themeToggleIcon = document.getElementById('theme-toggle-icon');
const fullscreenBtn = document.getElementById('fullscreen-btn');
const navItems = document.querySelectorAll('.nav-item');
const searchInput = document.querySelector('.search-box input');

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 检查本地存储中的主题设置
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        themeToggleIcon.classList.remove('bi-moon-stars');
        themeToggleIcon.classList.add('bi-sun');
    }
    
    // 添加事件监听器
    setupEventListeners();
    
    // 如果URL中有hash，加载对应页面
    if (window.location.hash) {
        const path = window.location.hash.substring(1);
        loadContent(path);
    }
});

// 设置事件监听器
function setupEventListeners() {
    // 导航项点击事件
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const path = item.getAttribute('data-path');
            if (path) {
                loadContent(path);
                
                // 更新活动状态
                navItems.forEach(navItem => navItem.classList.remove('active'));
                item.classList.add('active');
                
                // 在小屏幕上关闭侧边栏
                if (window.innerWidth < 768) {
                    document.querySelector('.sidebar').classList.remove('show');
                }
                
                // 更新URL hash
                window.location.hash = path;
            }
        });
    });
    
    // 主题切换
    themeToggleIcon.parentElement.addEventListener('click', toggleTheme);
    
    // 全屏按钮
    fullscreenBtn.addEventListener('click', toggleFullscreen);
    
    // 搜索功能
    searchInput.addEventListener('input', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const firstVisible = document.querySelector('.nav-item:not([style*="display: none"])');
            if (firstVisible) {
                firstVisible.click();
            }
        }
    });
    
    // 监听iframe加载完成事件
    contentFrame.addEventListener('load', () => {
        try {
            // 尝试获取iframe中页面的标题
            const iframeTitle = contentFrame.contentDocument.title;
            if (iframeTitle) {
                contentTitle.textContent = iframeTitle;
            }
            
            // 如果iframe中有暗色模式，同步主题
            if (document.body.classList.contains('dark-mode')) {
                const iframeBody = contentFrame.contentDocument.body;
                if (iframeBody) {
                    iframeBody.classList.add('dark-mode');
                }
            }
        } catch (e) {
            // 跨域安全限制可能会导致错误
            console.warn('无法访问iframe内容:', e);
        }
    });
}

// 加载内容到iframe
function loadContent(path) {
    // 显示加载动画
    contentFrame.style.opacity = '0.6';
    
    // 加载新内容
    contentFrame.src = path;
    
    // 更新标题（从路径中提取）
    const pathParts = path.split('/');
    const fileName = pathParts[pathParts.length - 1].split('.')[0];
    const formattedTitle = fileName
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    
    contentTitle.textContent = formattedTitle;
    
    // 内容加载完成后的动画
    contentFrame.onload = () => {
        contentFrame.style.opacity = '1';
    };
}

// 切换主题
function toggleTheme() {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    
    // 更新图标
    if (isDarkMode) {
        themeToggleIcon.classList.remove('bi-moon-stars');
        themeToggleIcon.classList.add('bi-sun');
    } else {
        themeToggleIcon.classList.remove('bi-sun');
        themeToggleIcon.classList.add('bi-moon-stars');
    }
    
    // 保存到本地存储
    localStorage.setItem('darkMode', isDarkMode);
    
    // 同步iframe中的主题
    try {
        const iframeBody = contentFrame.contentDocument.body;
        if (iframeBody) {
            if (isDarkMode) {
                iframeBody.classList.add('dark-mode');
            } else {
                iframeBody.classList.remove('dark-mode');
            }
        }
    } catch (e) {
        console.warn('无法访问iframe内容:', e);
    }
}

// 切换全屏模式
function toggleFullscreen() {
    const isFullscreen = document.body.classList.toggle('fullscreen-mode');
    
    if (isFullscreen) {
        fullscreenBtn.innerHTML = '<i class="bi bi-fullscreen-exit"></i> 退出全屏';
        
        // 尝试请求浏览器全屏
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) {
            document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
            document.documentElement.webkitRequestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) {
            document.documentElement.msRequestFullscreen();
        }
    } else {
        fullscreenBtn.innerHTML = '<i class="bi bi-arrows-fullscreen"></i> 全屏';
        
        // 退出浏览器全屏
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}

// 处理搜索
function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase();
    
    navItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (text.includes(searchTerm) || searchTerm === '') {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
}

// 监听浏览器全屏变化事件
document.addEventListener('fullscreenchange', handleFullscreenChange);
document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
document.addEventListener('mozfullscreenchange', handleFullscreenChange);
document.addEventListener('MSFullscreenChange', handleFullscreenChange);

function handleFullscreenChange() {
    if (!document.fullscreenElement && 
        !document.webkitFullscreenElement && 
        !document.mozFullScreenElement && 
        !document.msFullscreenElement) {
        // 如果退出了浏览器全屏，也退出我们的全屏模式
        document.body.classList.remove('fullscreen-mode');
        fullscreenBtn.innerHTML = '<i class="bi bi-arrows-fullscreen"></i> 全屏';
    }
}