// 权限检查脚本 - 使用 REST API 版本

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
        // 首先尝试使用 firestoreUserApi
        if (window.firestoreUserApi && typeof window.firestoreUserApi.checkUserRoleLevel === 'function') {
            console.log('使用 firestoreUserApi 检查用户角色');
            window.firestoreUserApi.checkUserRoleLevel(requiredRole)
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
            return;
        }

        // 其次尝试使用 firebaseService
        if (window.firebaseService && typeof window.firebaseService.checkUserRoleLevel === 'function') {
            console.log('使用 firebaseService 检查用户角色');
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
            return;
        }

        // 如果都没有，使用内置方法检查
        console.log('使用内置方法检查用户角色');
        checkUserRoleLevelInternal(user.uid, requiredRole)
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

// 内置的角色等级检查方法
async function checkUserRoleLevelInternal(uid, requiredRole) {
    console.log('内置方法检查用户角色等级:', requiredRole);

    try {
        // 角色等级定义
        const ROLE_LEVELS = {
            'user': 1,
            'bronze': 2,
            'silver': 3,
            'gold': 4,
            'admin': 5
        };

        // 获取用户数据
        const userData = await getUserDataInternal(uid);
        if (!userData) {
            return false;
        }

        // 获取用户角色
        const userRole = userData.role || 'user';

        // 获取角色等级
        const userRoleLevel = ROLE_LEVELS[userRole] || 1;
        const requiredRoleLevel = ROLE_LEVELS[requiredRole] || 5;

        // 检查用户角色等级是否满足要求
        return userRoleLevel >= requiredRoleLevel;
    } catch (error) {
        console.error('内置方法检查用户角色等级失败:', error);
        return false;
    }
}

// 内置的获取用户数据方法
async function getUserDataInternal(uid) {
    console.log('内置方法获取用户数据:', uid);

    try {
        // 获取用户认证令牌
        const user = firebase.auth().currentUser;
        if (!user) {
            return null;
        }

        const idToken = await user.getIdToken(true);

        // 构建 REST API URL
        const projectId = 'missfoxcounter';
        const databaseId = 'missfoxsanuser';
        const collectionName = 'users';
        const documentId = uid;

        const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/${collectionName}/${documentId}`;

        console.log('发送 GET 请求到:', url);

        // 发送请求
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${idToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // 解析响应
        const data = await response.json();
        console.log('获取到用户数据:', data);

        // 转换 Firestore 格式的数据为普通对象
        const userData = {};
        if (data.fields) {
            Object.keys(data.fields).forEach(key => {
                const field = data.fields[key];
                if (field.stringValue !== undefined) {
                    userData[key] = field.stringValue;
                } else if (field.booleanValue !== undefined) {
                    userData[key] = field.booleanValue;
                } else if (field.integerValue !== undefined) {
                    userData[key] = parseInt(field.integerValue);
                } else if (field.doubleValue !== undefined) {
                    userData[key] = field.doubleValue;
                } else if (field.timestampValue !== undefined) {
                    userData[key] = new Date(field.timestampValue);
                } else if (field.arrayValue !== undefined) {
                    userData[key] = field.arrayValue.values ? field.arrayValue.values.map(v => {
                        if (v.stringValue !== undefined) return v.stringValue;
                        if (v.mapValue !== undefined) {
                            const obj = {};
                            Object.keys(v.mapValue.fields).forEach(k => {
                                const f = v.mapValue.fields[k];
                                if (f.stringValue !== undefined) obj[k] = f.stringValue;
                                else if (f.timestampValue !== undefined) obj[k] = new Date(f.timestampValue);
                                else obj[k] = f;
                            });
                            return obj;
                        }
                        return v;
                    }) : [];
                } else if (field.mapValue !== undefined) {
                    userData[key] = {};
                    Object.keys(field.mapValue.fields).forEach(k => {
                        const f = field.mapValue.fields[k];
                        if (f.stringValue !== undefined) userData[key][k] = f.stringValue;
                        else if (f.timestampValue !== undefined) userData[key][k] = new Date(f.timestampValue);
                        else userData[key][k] = f;
                    });
                }
            });
        }

        console.log('转换后的用户数据:', userData);
        return userData;
    } catch (error) {
        console.error('内置方法获取用户数据失败:', error);
        return null;
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
