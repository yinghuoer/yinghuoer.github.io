// 权限检查脚本 - 用于后日谈页面

// 防止页面内容闪现，隐藏所有内容直到权限验证完成
(function() {
    // 创建并添加样式标签
    const style = document.createElement('style');
    style.textContent = 'body { display: none !important; }';
    document.head.appendChild(style);

    // 确保在页面加载时隐藏内容
    window.addEventListener('DOMContentLoaded', function() {
        if (document.body.style.display !== 'block') {
            document.body.style.display = 'none';
        }
    });
})();

// 获取当前页面路径
const currentPath = window.location.pathname;

// 根据页面路径确定所需权限
let requiredPermission = '';
let requiredRole = '';

if (currentPath.includes('peter3-afterstory1.html')) {
    requiredPermission = 'read:afterstory1';
    requiredRole = 'bronze';
} else if (currentPath.includes('peter3-afterstory2.html')) {
    requiredPermission = 'read:afterstory2';
    requiredRole = 'silver';
}

// 立即执行权限检查
function checkPermissionAndRedirect() {
    console.log('执行权限检查...');

    // 确保 Firebase 已加载
    if (typeof firebase === 'undefined' || !firebase.auth) {
        console.log('Firebase 未加载，等待...');
        setTimeout(checkPermissionAndRedirect, 100);
        return;
    }

    // 如果没有设置权限要求，显示页面
    if (!requiredPermission || !requiredRole) {
        console.log('没有权限要求，显示页面');
        document.body.style.display = 'block';
        return;
    }

    console.log('所需权限:', requiredPermission, '所需角色:', requiredRole);

    // 检查用户是否登录
    const user = firebase.auth().currentUser;
    console.log('当前用户:', user ? user.email : '未登录');

    if (user) {
        // 等待 firebaseService 加载
        if (typeof window.firebaseService === 'undefined' || !window.firebaseService.checkUserRoleLevel) {
            console.log('firebaseService 未加载，等待...');
            setTimeout(checkPermissionAndRedirect, 100);
            return;
        }

        // 使用角色检查，更可靠
        window.firebaseService.checkUserRoleLevel(requiredRole)
            .then(hasRole => {
                console.log('用户角色检查结果:', hasRole);
                if (hasRole) {
                    // 有权限，显示页面
                    document.body.style.display = 'block';
                } else {
                    // 没有权限，重定向
                    console.log('权限不足，重定向到未授权页面');
                    window.location.href = '../unauthorized.html';
                }
            })
            .catch(error => {
                console.error('检查权限失败:', error);
                window.location.href = '../unauthorized.html';
            });
    } else {
        // 用户未登录，等待认证状态
        console.log('用户未登录，等待认证状态...');
        firebase.auth().onAuthStateChanged(function(user) {
            console.log('认证状态变化:', user ? user.email : '未登录');
            if (user) {
                // 重新检查
                checkPermissionAndRedirect();
            } else {
                // 用户未登录，重定向到登录页面
                console.log('用户未登录，重定向到登录页面');
                window.location.href = '../login.html?redirect=' + encodeURIComponent(window.location.href);
            }
        });
    }
}

// 立即执行权限检查
checkPermissionAndRedirect();

// 页面加载完成后再次检查，确保安全
document.addEventListener('DOMContentLoaded', function() {
    console.log('页面加载完成，再次检查权限...');

    // 如果页面已经显示，则不需要再次检查
    if (document.body.style.display === 'block') {
        console.log('页面已显示，无需再次检查');
        return;
    }

    // 确保页面内容不可见，直到权限检查完成
    document.body.style.display = 'none';

    // 再次检查权限
    setTimeout(checkPermissionAndRedirect, 100);
});
