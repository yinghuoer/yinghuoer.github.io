// 权限控制组件

// 确保 Firebase 服务已加载
if (!window.firebaseService) {
    console.error('Firebase 服务未加载');
}

// 初始化权限控制
function initPermissionControl() {
    // 查找所有需要权限控制的元素
    const permissionElements = document.querySelectorAll('[data-permission]');
    const roleElements = document.querySelectorAll('[data-role]');

    // 处理基于权限的元素
    permissionElements.forEach(element => {
        const permission = element.getAttribute('data-permission');

        // 默认隐藏需要权限的元素
        element.style.display = 'none';

        // 检查用户是否有权限
        window.firebaseService.checkUserPermission(permission)
            .then(hasPermission => {
                if (hasPermission) {
                    // 如果有权限，显示元素
                    element.style.display = '';
                }
            })
            .catch(error => {
                console.error('检查权限失败:', error);
            });
    });

    // 处理基于角色的元素
    roleElements.forEach(element => {
        const role = element.getAttribute('data-role');

        // 默认隐藏需要角色的元素
        element.style.display = 'none';

        // 检查用户角色是否达到要求
        window.firebaseService.checkUserRoleLevel(role)
            .then(hasRole => {
                if (hasRole) {
                    // 如果角色等级足够，显示元素
                    element.style.display = '';
                }
            })
            .catch(error => {
                console.error('检查角色失败:', error);
            });
    });

    // 查找所有需要替换的内容
    const permissionContainers = document.querySelectorAll('.permission-container');

    permissionContainers.forEach(container => {
        const permission = container.getAttribute('data-permission');
        const role = container.getAttribute('data-role');

        // 获取受保护内容和替代内容
        const protectedContent = container.querySelector('.protected-content');
        const alternativeContent = container.querySelector('.alternative-content');

        if (protectedContent && alternativeContent) {
            // 默认隐藏受保护内容，显示替代内容
            protectedContent.style.display = 'none';
            alternativeContent.style.display = '';

            // 检查权限
            if (permission) {
                window.firebaseService.checkUserPermission(permission)
                    .then(hasPermission => {
                        if (hasPermission) {
                            // 如果有权限，显示受保护内容，隐藏替代内容
                            protectedContent.style.display = '';
                            alternativeContent.style.display = 'none';
                        }
                    })
                    .catch(error => {
                        console.error('检查权限失败:', error);
                    });
            }

            // 检查角色
            if (role) {
                window.firebaseService.checkUserRoleLevel(role)
                    .then(hasRole => {
                        if (hasRole) {
                            // 如果角色等级足够，显示受保护内容，隐藏替代内容
                            protectedContent.style.display = '';
                            alternativeContent.style.display = 'none';
                        }
                    })
                    .catch(error => {
                        console.error('检查角色失败:', error);
                    });
            }
        }
    });
}

// 在DOM加载完成后初始化权限控制
document.addEventListener('DOMContentLoaded', function() {
    // 等待用户认证状态
    firebase.auth().onAuthStateChanged(function(user) {
        // 初始化权限控制
        initPermissionControl();
    });
});

// 导出函数
window.permissionControl = {
    initPermissionControl
};
