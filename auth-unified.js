// 统一的用户认证服务

// 使用统一的 Firebase 实例
console.log('初始化 auth-unified.js，检查 firebaseInstances:', window.firebaseInstances);

// 创建认证服务对象
window.authService = {};

// 检查Firebase实例是否存在
if (window.firebaseInstances) {
    window.authService.auth = window.firebaseInstances.auth;
    window.authService.db = window.firebaseInstances.db;
    window.authService.rtdb = window.firebaseInstances.rtdb;
    window.authService.storage = window.firebaseInstances.storage;
} else {
    console.error('Firebase实例未初始化，尝试直接初始化');
    window.authService.auth = firebase.auth();
    window.authService.db = firebase.firestore();
    window.authService.rtdb = firebase.database();
    window.authService.storage = firebase.storage();
}

// 设置语言为中文
window.authService.auth.languageCode = 'zh-CN';

// 使用 firebase-service.js 中的用户角色定义
// 如果不存在，则创建一个默认的
if (!window.USER_ROLES) {
    window.USER_ROLES = {
        USER: 'user',       // 普通用户
        BRONZE: 'bronze',   // 青铜级用户
        SILVER: 'silver',   // 白银级用户
        GOLD: 'gold',       // 黄金级用户
        ADMIN: 'admin'      // 管理员
    };
}

// 初始化认证功能
function initAuth() {
    console.log('初始化认证功能');

    // 检查Firebase是否已初始化
    if (!window.firebase) {
        console.error('Firebase未初始化');
        return;
    }

    // 监听认证状态变化
    window.authService.auth.onAuthStateChanged(user => {
        // 更新用户界面
        updateUserUI(user);

        // 处理用户状态变化
        handleAuthStateChanged(user);
    });

    // 初始化登录/注册模态框
    initAuthModals();
}

// 处理认证状态变化
function handleAuthStateChanged(user) {
    // 获取当前页面
    const currentPage = getCurrentPage();
    console.log('当前页面:', currentPage);

    if (user) {
        // 用户已登录
        console.log('用户已登录:', user.displayName || user.email);

        // 只在首次登录时创建用户记录，不要每次都更新
        // 检查用户是否刚刚登录
        const creationTime = new Date(user.metadata.creationTime).getTime();
        const lastSignInTime = new Date(user.metadata.lastSignInTime).getTime();
        const timeDiff = Math.abs(lastSignInTime - creationTime);
        const isNewUser = timeDiff < 60000; // 小于1分钟认为是新用户

        // 全局变量，用于其他函数判断是否是新用户
        window.isNewUser = isNewUser;

        if (isNewUser) {
            console.log('检测到新用户，创建用户记录');
            createOrUpdateUserRecord(user).catch(error => {
                console.error('处理用户数据失败:', error);
            });
        } else {
            console.log('非新用户，不创建用户记录，避免覆盖现有数据');
        }

        // 检查邮箱验证状态
        if (!user.emailVerified) {
            // 邮箱未验证
            console.log('用户邮箱未验证');

            // 如果不在验证邮箱页面或登录/注册页面，重定向到验证邮箱页面
            const allowedPages = ['verify-email.html', 'login.html', 'register.html'];
            if (!allowedPages.includes(currentPage)) {
                // 如果是新用户，添加延迟，确保验证邮件有足够的时间发送
                if (window.isNewUser) {
                    console.log('新用户注册，延迟3秒后重定向到验证邮箱页面');

                    // 不再发送验证邮件，因为已经在注册时发送过了
                    console.log('新用户注册，验证邮件已在注册时发送');

                    setTimeout(() => {
                        redirectTo('verify-email.html');
                    }, 3000); // 延迟3秒
                } else {
                    redirectTo('verify-email.html');
                }
                return;
            }
        } else {
            // 邮箱已验证
            console.log('用户邮箱已验证');

            // 如果在验证邮箱页面，重定向到首页
            if (currentPage === 'verify-email.html') {
                redirectTo('index.html');
                return;
            }
        }

        // 根据当前页面执行特定操作
        switch (currentPage) {
            case 'login.html':
            case 'register.html':
                // 已登录用户访问登录/注册页面
                if (user.emailVerified) {
                    // 如果邮箱已验证，重定向到首页
                    redirectTo('index.html');
                } else {
                    // 如果邮箱未验证，重定向到验证邮箱页面
                    redirectTo('verify-email.html');
                }
                break;

            case 'reset-password.html':
                // 已登录用户访问重置密码页面，重定向到个人资料页面
                redirectTo('profile.html');
                break;

            default:
                // 处理当前页面的特定功能
                handleCurrentPage(user);
                break;
        }
    } else {
        // 用户未登录
        console.log('用户未登录');

        // 需要登录才能访问的页面
        const protectedPages = ['profile.html', 'verify-email.html', 'profile-edit.html'];

        if (protectedPages.includes(currentPage)) {
            // 重定向到登录页面
            redirectTo('login.html');
        }
    }
}

// 通用函数：获取当前页面名称
function getCurrentPage() {
    const path = window.location.pathname;
    return path.substring(path.lastIndexOf('/') + 1) || 'index.html';
}

// 通用函数：重定向到指定页面
function redirectTo(page) {
    window.location.href = page;
}

// 通用函数：显示错误消息
function showError(message) {
    // 创建或获取消息容器
    let messageContainer = document.getElementById('messageContainer');

    // 如果消息容器不存在，创建一个
    if (!messageContainer) {
        messageContainer = document.createElement('div');
        messageContainer.id = 'messageContainer';
        messageContainer.style.position = 'fixed';
        messageContainer.style.top = '20px';
        messageContainer.style.right = '20px';
        messageContainer.style.zIndex = '9999';
        document.body.appendChild(messageContainer);
    }

    // 创建错误消息元素
    const messageElement = document.createElement('div');
    messageElement.className = 'message error';
    messageElement.style.padding = '1rem';
    messageElement.style.marginBottom = '1rem';
    messageElement.style.borderRadius = '10px';
    messageElement.style.backgroundColor = '#fff0f0';
    messageElement.style.color = '#d32f2f';
    messageElement.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
    messageElement.style.display = 'flex';
    messageElement.style.alignItems = 'center';
    messageElement.style.animation = 'slideIn 0.3s ease forwards';
    messageElement.style.transition = 'opacity 0.3s ease';

    // 添加错误图标和消息文本
    messageElement.innerHTML = `
        <i class="fas fa-exclamation-circle" style="margin-right: 0.5rem; font-size: 1.2rem;"></i>
        <span>${message}</span>
    `;

    // 添加到消息容器
    messageContainer.appendChild(messageElement);

    // 添加动画样式（如果还没有添加）
    if (!document.getElementById('message-animation-style')) {
        const style = document.createElement('style');
        style.id = 'message-animation-style';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // 5秒后自动移除
    setTimeout(() => {
        messageElement.style.opacity = '0';
        setTimeout(() => {
            if (messageContainer.contains(messageElement)) {
                messageContainer.removeChild(messageElement);
            }
        }, 300);
    }, 5000);

    // 同时更新页面中的错误消息容器（如果存在）
    const errorElement = document.getElementById('auth-error');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';

        // 5秒后自动隐藏
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }
}

// 通用函数：显示成功消息
function showMessage(message) {
    // 创建或获取消息容器
    let messageContainer = document.getElementById('messageContainer');

    // 如果消息容器不存在，创建一个
    if (!messageContainer) {
        messageContainer = document.createElement('div');
        messageContainer.id = 'messageContainer';
        messageContainer.style.position = 'fixed';
        messageContainer.style.top = '20px';
        messageContainer.style.right = '20px';
        messageContainer.style.zIndex = '9999';
        document.body.appendChild(messageContainer);
    }

    // 创建成功消息元素
    const messageElement = document.createElement('div');
    messageElement.className = 'message success';
    messageElement.style.padding = '1rem';
    messageElement.style.marginBottom = '1rem';
    messageElement.style.borderRadius = '10px';
    messageElement.style.backgroundColor = '#e6f7e6';
    messageElement.style.color = '#2e7d32';
    messageElement.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
    messageElement.style.display = 'flex';
    messageElement.style.alignItems = 'center';
    messageElement.style.animation = 'slideIn 0.3s ease forwards';
    messageElement.style.transition = 'opacity 0.3s ease';

    // 添加成功图标和消息文本
    messageElement.innerHTML = `
        <i class="fas fa-check-circle" style="margin-right: 0.5rem; font-size: 1.2rem;"></i>
        <span>${message}</span>
    `;

    // 添加到消息容器
    messageContainer.appendChild(messageElement);

    // 添加动画样式（如果还没有添加）
    if (!document.getElementById('message-animation-style')) {
        const style = document.createElement('style');
        style.id = 'message-animation-style';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // 5秒后自动移除
    setTimeout(() => {
        messageElement.style.opacity = '0';
        setTimeout(() => {
            if (messageContainer.contains(messageElement)) {
                messageContainer.removeChild(messageElement);
            }
        }, 300);
    }, 5000);

    // 同时更新页面中的成功消息容器（如果存在）
    const successElement = document.getElementById('auth-message');
    if (successElement) {
        successElement.textContent = message;
        successElement.style.display = 'block';

        // 5秒后自动隐藏
        setTimeout(() => {
            successElement.style.display = 'none';
        }, 5000);
    }
}

// 更新用户界面
function updateUserUI(user) {
    const userNavArea = document.getElementById('userNavArea');

    if (!userNavArea) {
        console.error('未找到用户导航区域');
        return;
    }

    if (user) {
        // 用户已登录，显示用户头像和下拉菜单
        renderLoggedInUI(user, userNavArea);
    } else {
        // 用户未登录，显示登录/注册按钮
        renderLoggedOutUI(userNavArea);
    }
}

// 渲染已登录用户界面
async function renderLoggedInUI(user, container) {
    // 获取用户角色
    let userRole = 'user';
    try {
        if (window.firebaseService && typeof window.firebaseService.getUserRole === 'function') {
            userRole = await window.firebaseService.getUserRole(user.uid);
        } else if (window.firestoreUserApi && typeof window.firestoreUserApi.getUserRole === 'function') {
            userRole = await window.firestoreUserApi.getUserRole(user.uid);
        } else {
            // 尝试从 Firestore 获取用户角色
            const userData = await getUserData(user.uid);
            if (userData && userData.role) {
                userRole = userData.role;
            }
        }
    } catch (error) {
        console.error('获取用户角色失败:', error);
    }

    // 获取用户头像的第一个字母（如果没有显示名称，则使用邮箱的第一个字母）
    const firstLetter = (user.displayName || user.email || '用户').charAt(0).toUpperCase();

    // 创建用户头像和下拉菜单
    const userProfileHTML = `
        <div class="user-profile">
            ${user.photoURL ?
                `<img src="${user.photoURL}" alt="${user.displayName || '用户'}" class="user-avatar">` :
                `<div class="default-avatar">${firstLetter}</div>`
            }
            <div class="user-dropdown">
                <div class="user-info">
                    <div class="user-name">${user.displayName || '未设置昵称'}</div>
                    <div class="user-email">${user.email}</div>
                    <div class="user-role">${userRole}</div>
                </div>
                <div class="user-links">
                    <a href="profile.html" class="user-link">
                        <i class="fas fa-user"></i>
                        <span>个人资料</span>
                    </a>
                    <a href="profile-edit.html" class="user-link">
                        <i class="fas fa-edit"></i>
                        <span>编辑资料</span>
                    </a>
                    ${userRole === 'admin' ? `
                        <a href="admin.html" class="user-link">
                            <i class="fas fa-cog"></i>
                            <span>管理后台</span>
                        </a>
                    ` : ''}
                    <a href="#" class="user-link" id="logoutButton">
                        <i class="fas fa-sign-out-alt"></i>
                        <span>退出登录</span>
                    </a>
                </div>
            </div>
        </div>
    `;

    // 更新容器内容
    container.innerHTML = userProfileHTML;

    // 添加退出登录事件
    document.getElementById('logoutButton').addEventListener('click', (e) => {
        e.preventDefault();
        window.authService.auth.signOut().then(() => {
            showMessage('已成功退出登录');
            // 清除缓存和会话数据
            sessionStorage.clear();
            // 重定向到首页
            window.location.href = 'index.html';
        }).catch((error) => {
            console.error('退出登录失败:', error);
            showError('退出登录失败: ' + error.message);
        });
    });

    // 尝试从 Firestore 加载用户头像
    try {
        const userData = await getUserData(user.uid);
        if (userData && userData.photoURL && !user.photoURL) {
            // 如果 Firestore 中有头像但 Auth 中没有，更新界面
            const avatarElement = container.querySelector('.default-avatar');
            if (avatarElement) {
                const avatarContainer = avatarElement.parentElement;
                avatarContainer.innerHTML = `<img src="${userData.photoURL}" alt="${user.displayName || '用户'}" class="user-avatar">`;
            }
        }
    } catch (error) {
        console.error('获取用户数据失败:', error);
    }
}

// 渲染未登录用户界面
function renderLoggedOutUI(container) {
    // 创建登录/注册按钮
    const authButtonsHTML = `
        <div class="auth-buttons">
            <button class="auth-button secondary" id="loginButton">
                <i class="fas fa-sign-in-alt"></i>
                登录
            </button>
            <button class="auth-button primary" id="registerButton">
                <i class="fas fa-user-plus"></i>
                注册
            </button>
        </div>
    `;

    // 更新容器内容
    container.innerHTML = authButtonsHTML;

    // 添加登录/注册按钮事件
    document.getElementById('loginButton').addEventListener('click', () => {
        openModal('loginModal');
    });

    document.getElementById('registerButton').addEventListener('click', () => {
        openModal('registerModal');
    });
}

// 初始化登录/注册模态框
function initAuthModals() {
    // 检查模态框是否已存在
    if (document.getElementById('loginModal')) {
        return;
    }

    // 创建登录模态框
    const loginModalHTML = `
        <div class="modal" id="loginModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>登录</h2>
                    <span class="close-modal">&times;</span>
                </div>
                <div class="modal-body">
                    <form id="loginForm">
                        <div class="form-group">
                            <label for="loginEmail">邮箱</label>
                            <input type="email" id="loginEmail" required>
                        </div>
                        <div class="form-group">
                            <label for="loginPassword">密码</label>
                            <input type="password" id="loginPassword" required>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="form-button primary">登录</button>
                            <button type="button" class="form-button secondary" id="switchToRegister">注册账号</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;

    // 创建注册模态框
    const registerModalHTML = `
        <div class="modal" id="registerModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>注册</h2>
                    <span class="close-modal">&times;</span>
                </div>
                <div class="modal-body">
                    <form id="registerForm">
                        <div class="form-group">
                            <label for="registerEmail">邮箱</label>
                            <input type="email" id="registerEmail" required>
                        </div>
                        <div class="form-group">
                            <label for="registerDisplayName">昵称</label>
                            <input type="text" id="registerDisplayName" placeholder="请输入您的昵称">
                            <small class="form-hint">可选，留空将使用邮箱作为昵称</small>
                        </div>
                        <div class="form-group">
                            <label for="registerPassword">密码</label>
                            <input type="password" id="registerPassword" required>
                        </div>
                        <div class="form-group">
                            <label for="registerConfirmPassword">确认密码</label>
                            <input type="password" id="registerConfirmPassword" required>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="form-button primary">注册</button>
                            <button type="button" class="form-button secondary" id="switchToLogin">已有账号</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;

    // 将模态框添加到页面
    document.body.insertAdjacentHTML('beforeend', loginModalHTML);
    document.body.insertAdjacentHTML('beforeend', registerModalHTML);

    // 添加模态框事件
    addModalEvents();

    // 添加登录/注册表单事件
    addAuthFormEvents();
}

// 添加模态框事件
function addModalEvents() {
    // 关闭模态框
    document.querySelectorAll('.close-modal').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            closeAllModals();
        });
    });

    // 点击模态框外部关闭
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeAllModals();
            }
        });
    });

    // 切换到注册
    document.getElementById('switchToRegister').addEventListener('click', () => {
        closeModal('loginModal');
        openModal('registerModal');
    });

    // 切换到登录
    document.getElementById('switchToLogin').addEventListener('click', () => {
        closeModal('registerModal');
        openModal('loginModal');
    });
}

// 添加登录/注册表单事件
function addAuthFormEvents() {
    // 登录表单提交
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        // 禁用提交按钮
        const submitButton = e.target.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 登录中...';

        try {
            await window.authService.auth.signInWithEmailAndPassword(email, password);
            showMessage('登录成功');
            closeAllModals();
        } catch (error) {
            console.error('登录失败:', error);

            // 处理常见错误
            let errorMessage = '登录失败';

            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage = '账号不存在，请检查您的邮箱地址';
                    break;
                case 'auth/wrong-password':
                    errorMessage = '密码错误，请重新输入';
                    break;
                case 'auth/invalid-email':
                    errorMessage = '邮箱格式不正确';
                    break;
                case 'auth/user-disabled':
                    errorMessage = '账号已被禁用';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = '登录尝试次数过多，请稍后再试';
                    break;
                default:
                    errorMessage = '登录失败，请检查您的账号和密码';
            }

            showError(errorMessage);
        } finally {
            // 恢复提交按钮
            submitButton.disabled = false;
            submitButton.textContent = '登录';
        }
    });

    // 注册表单提交
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('registerEmail').value;
        const displayName = document.getElementById('registerDisplayName').value.trim();
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;

        // 检查密码是否匹配
        if (password !== confirmPassword) {
            showError('两次输入的密码不一致');
            return;
        }

        // 禁用提交按钮
        const submitButton = e.target.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 注册中...';

        try {
            // 创建用户
            const userCredential = await window.authService.auth.createUserWithEmailAndPassword(email, password);

            // 设置用户昵称
            if (displayName) {
                await userCredential.user.updateProfile({
                    displayName: displayName
                });
            }

            // 创建用户资料
            try {
                await createOrUpdateUserRecord(userCredential.user);
            } catch (profileError) {
                console.error('创建用户资料失败:', profileError);
                // 不显示错误，继续注册流程
            }

            // 发送验证邮件
            try {
                console.log('开始发送验证邮件...');

                // 设置验证邮件参数
                const actionCodeSettings = {
                    url: window.location.origin + '/verify-email.html?email=' + encodeURIComponent(email),
                    handleCodeInApp: false
                };

                // 发送验证邮件
                await userCredential.user.sendEmailVerification(actionCodeSettings);

                console.log('验证邮件发送成功!');

                // 显示成功消息
                showMessage('注册成功，验证邮件已发送到您的邮箱，请查收并点击验证链接');
            } catch (emailError) {
                console.error('发送验证邮件失败:', emailError);
                showError('注册成功，但发送验证邮件失败: ' + emailError.message);
            }

            closeAllModals();
        } catch (error) {
            console.error('注册失败:', error);

            // 处理常见错误
            let errorMessage = '注册失败';

            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = '邮箱已被注册，请直接登录或使用其他邮箱';
                    break;
                case 'auth/invalid-email':
                    errorMessage = '邮箱格式不正确';
                    break;
                case 'auth/weak-password':
                    errorMessage = '密码弱，请使用至少6个字符的强密码';
                    break;
                case 'auth/operation-not-allowed':
                    errorMessage = '邮箱/密码注册功能已禁用';
                    break;
                default:
                    errorMessage = '注册失败，请稍后再试';
            }

            showError(errorMessage);
        } finally {
            // 恢复提交按钮
            submitButton.disabled = false;
            submitButton.textContent = '注册';
        }
    });
}

// 打开模态框
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        // 添加动画类
        setTimeout(() => {
            modal.querySelector('.modal-content').classList.add('modal-open');
        }, 10);
    }
}

// 关闭模态框
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.querySelector('.modal-content').classList.remove('modal-open');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
}

// 关闭所有模态框
function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.querySelector('.modal-content').classList.remove('modal-open');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    });
}

// 获取用户数据
async function getUserData(uid) {
    try {
        // 优先使用 REST API
        if (window.firestoreUserApi && typeof window.firestoreUserApi.getUserData === 'function') {
            console.log('使用 firestoreUserApi 获取用户数据');
            return window.firestoreUserApi.getUserData(uid);
        }

        // 其次使用 firebaseService
        if (window.firebaseService && typeof window.firebaseService.getUserData === 'function') {
            console.log('使用 firebaseService 获取用户数据');
            return window.firebaseService.getUserData(uid);
        }

        // 如果都没有，抛出错误
        throw new Error('找不到可用的用户数据获取方法');
    } catch (error) {
        console.error('获取用户数据失败:', error);
        return null;
    }
}

// 创建或更新用户记录
async function createOrUpdateUserRecord(user) {
    try {
        console.log('创建或更新用户记录:', user.uid);

        // 优先使用 REST API
        if (window.firestoreUserApi && typeof window.firestoreUserApi.createUserRecord === 'function') {
            console.log('使用 firestoreUserApi 创建用户记录');
            return window.firestoreUserApi.createUserRecord(user);
        }

        // 其次使用 firebaseService
        if (window.firebaseService && typeof window.firebaseService.createUserRecord === 'function') {
            console.log('使用 firebaseService 创建用户记录');
            return window.firebaseService.createUserRecord(user);
        }

        // 如果都没有，尝试使用 REST API 直接写入
        if (window.writeToFirestoreViaREST && typeof window.writeToFirestoreViaREST === 'function') {
            console.log('使用 writeToFirestoreViaREST 创建用户记录');
            return window.writeToFirestoreViaREST(user);
        }

        // 如果都没有，抛出错误
        throw new Error('找不到可用的用户记录创建方法');
    } catch (error) {
        console.error('创建或更新用户记录失败:', error);
        throw error;
    }
}

// 处理邮箱验证页面
function handleVerifyEmailPage(user) {
    // 检查是否在邮箱验证页面
    if (getCurrentPage() !== 'verify-email.html') return;

    console.log('处理邮箱验证页面');

    // 获取页面元素
    const verifyEmailContent = document.getElementById('verify-email-content');
    if (!verifyEmailContent) {
        console.error('未找到邮箱验证内容容器');
        return;
    }

    // 清空加载中的内容
    verifyEmailContent.innerHTML = '';

    // 如果邮箱已验证，显示成功消息并重定向
    if (user.emailVerified) {
        verifyEmailContent.innerHTML = `
            <div class="auth-message" style="display: block;">
                您的邮箱已验证成功！正在返回首页...
            </div>
        `;

        // 2秒后重定向到首页
        setTimeout(() => {
            redirectTo('index.html');
        }, 2000);

        return;
    }

    // 显示验证邮箱内容
    verifyEmailContent.innerHTML = `
        <h3>验证您的邮箱</h3>
        <p>我们已向以下邮箱发送了验证链接：</p>

        <div class="email-info">
            <i class="fas fa-envelope"></i>
            <span>${user.email}</span>
        </div>

        <p>请点击邮件中的验证链接完成验证。如果您没有收到邮件，请检查垃圾邮件或垃圾箱。</p>

        <div class="verification-steps">
            <div class="step">
                <div class="step-number">1</div>
                <div class="step-content">
                    <h4>检查您的邮箱</h4>
                    <p>打开您的邮箱并查找来自“狐狸小姐”的邮件</p>
                </div>
            </div>

            <div class="step">
                <div class="step-number">2</div>
                <div class="step-content">
                    <h4>点击验证链接</h4>
                    <p>在邮件中点击“验证邮箱”按钮</p>
                </div>
            </div>

            <div class="step">
                <div class="step-number">3</div>
                <div class="step-content">
                    <h4>刷新状态</h4>
                    <p>验证完成后，返回此页面并点击“我已验证，刷新状态”按钮</p>
                </div>
            </div>
        </div>

        <div class="form-actions">
            <button id="resend-verification" class="auth-button secondary">
                <i class="fas fa-paper-plane"></i> 重新发送验证邮件
            </button>
            <button id="refresh-status" class="auth-button primary">
                <i class="fas fa-sync-alt"></i> 我已验证，刷新状态
            </button>
        </div>

        <div class="form-actions" style="margin-top: 1rem;">
            <button id="logout" class="auth-button">
                <i class="fas fa-sign-out-alt"></i> 退出登录
            </button>
        </div>
    `;

    // 重新发送验证邮件按钮
    const resendButton = document.getElementById('resend-verification');
    if (resendButton) {
        resendButton.addEventListener('click', function() {
            // 禁用按钮，防止重复点击
            resendButton.disabled = true;
            resendButton.textContent = '发送中...';

            // 发送验证邮件
            user.sendEmailVerification()
                .then(() => {
                    showMessage('验证邮件已发送，请查收');

                    // 60秒后恢复按钮
                    setTimeout(() => {
                        resendButton.disabled = false;
                        resendButton.innerHTML = '<i class="fas fa-paper-plane"></i> 重新发送验证邮件';
                    }, 60000); // 60秒冷却时间

                    // 显示冷却时间倒计时
                    let countdown = 60;
                    const countdownInterval = setInterval(() => {
                        countdown--;
                        if (countdown <= 0) {
                            clearInterval(countdownInterval);
                        } else {
                            resendButton.textContent = `请等待 ${countdown} 秒后重试`;
                        }
                    }, 1000);
                })
                .catch(error => {
                    console.error('发送验证邮件失败:', error);
                    showError('发送验证邮件失败: ' + error.message);

                    // 恢复按钮
                    resendButton.disabled = false;
                    resendButton.innerHTML = '<i class="fas fa-paper-plane"></i> 重新发送验证邮件';
                });
        });
    }

    // 刷新状态按钮
    const refreshButton = document.getElementById('refresh-status');
    if (refreshButton) {
        refreshButton.addEventListener('click', function() {
            // 禁用按钮，防止重复点击
            refreshButton.disabled = true;
            refreshButton.textContent = '刷新中...';

            // 重新加载用户信息
            user.reload()
                .then(() => {
                    console.log('用户信息已刷新');

                    // 检查邮箱是否已验证
                    if (user.emailVerified) {
                        showMessage('您的邮箱已验证成功！');
                        setTimeout(() => {
                            redirectTo('index.html');
                        }, 2000);
                    } else {
                        showError('邮箱尚未验证，请检查您的邮箱并点击验证链接。');

                        // 恢复按钮
                        refreshButton.disabled = false;
                        refreshButton.innerHTML = '<i class="fas fa-sync-alt"></i> 我已验证，刷新状态';
                    }
                })
                .catch(error => {
                    console.error('刷新用户信息失败:', error);
                    showError('刷新状态失败，请稍后重试。');

                    // 恢复按钮
                    refreshButton.disabled = false;
                    refreshButton.innerHTML = '<i class="fas fa-sync-alt"></i> 我已验证，刷新状态';
                });
        });
    }

    // 退出登录按钮
    const logoutButton = document.getElementById('logout');
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            window.authService.auth.signOut().then(() => {
                console.log('用户已退出登录');
                redirectTo('login.html');
            }).catch(error => {
                console.error('退出登录失败:', error);
                showError('退出登录失败: ' + error.message);
            });
        });
    }
}

// 处理个人资料页面
async function handleProfilePage(user) {
    // 检查是否在个人资料页面
    if (getCurrentPage() !== 'profile.html') return;

    console.log('处理个人资料页面');

    // 获取页面元素
    const profileContent = document.getElementById('profile-content');
    if (!profileContent) {
        console.error('未找到个人资料内容容器');
        return;
    }

    // 显示加载中状态
    profileContent.innerHTML = `
        <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
            <span>正在加载个人资料...</span>
        </div>
    `;

    try {
        // 获取用户数据
        const userData = await getUserData(user.uid);

        if (!userData) {
            profileContent.innerHTML = `
                <div class="auth-error" style="display: block;">
                    无法加载用户数据，请刷新页面重试。
                </div>
            `;
            return;
        }

        // 获取用户角色名称
        const roleNames = {
            [USER_ROLES.USER]: '普通用户',
            [USER_ROLES.BRONZE]: '青铜级用户',
            [USER_ROLES.SILVER]: '白银级用户',
            [USER_ROLES.GOLD]: '黄金级用户',
            [USER_ROLES.ADMIN]: '管理员'
        };

        const roleName = roleNames[userData.role] || '普通用户';

        // 格式化日期
        const formatDate = (timestamp) => {
            if (!timestamp) return '未知';

            let date;
            try {
                if (typeof timestamp === 'string') {
                    // 处理 ISO 格式的日期字符串
                    date = new Date(timestamp);
                } else if (timestamp.toDate) {
                    // 处理 Firestore 时间戳
                    date = timestamp.toDate();
                } else if (timestamp.seconds) {
                    // 处理 Firestore 时间戳对象
                    date = new Date(timestamp.seconds * 1000);
                } else {
                    // 处理其他格式
                    date = new Date(timestamp);
                }

                return date.toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            } catch (error) {
                console.error('格式化日期失败:', error, timestamp);
                return '未知';
            }
        };

        // 渲染个人资料页面
        profileContent.innerHTML = `
            <div class="profile-header">
                <div class="profile-content">
                    <div class="profile-avatar-container">
                        ${userData.photoURL ?
                            `<img src="${userData.photoURL}" alt="用户头像" class="profile-avatar">` :
                            `<div class="profile-default-avatar">${(userData.displayName || user.email || '用户').charAt(0).toUpperCase()}</div>`
                        }
                    </div>
                    <div class="profile-info">
                        <h2 class="profile-name">${userData.displayName || '未设置昵称'}</h2>
                        <div class="profile-email">
                            <i class="fas fa-envelope"></i>
                            <span>${userData.email}</span>
                            ${user.emailVerified ?
                                `<span class="verified-badge"><i class="fas fa-check-circle"></i> 已验证</span>` :
                                `<span class="unverified-badge"><i class="fas fa-exclamation-circle"></i> 未验证</span>`
                            }
                        </div>
                        <div class="profile-role">
                            <span class="role-badge ${userData.role}">${roleName}</span>
                        </div>
                        <div class="profile-actions">
                            <a href="profile-edit.html" class="profile-action primary">
                                <i class="fas fa-edit"></i> 编辑资料
                            </a>
                            <button id="change-password-button" class="profile-action secondary">
                                <i class="fas fa-key"></i> 修改密码
                            </button>
                            ${!user.emailVerified ?
                                `<button id="verify-email-button" class="profile-action secondary">
                                    <i class="fas fa-envelope"></i> 验证邮箱
                                </button>` : ''
                            }
                        </div>
                    </div>
                </div>
            </div>

            <div class="profile-sections">
                <div class="profile-section">
                    <h3 class="profile-section-title">账号信息</h3>
                    <div class="info-list">
                        <div class="info-item">
                            <div class="info-label">注册时间</div>
                            <div class="info-value">${formatDate(userData.createdAt)}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">最近登录</div>
                            <div class="info-value">${formatDate(userData.lastLoginAt)}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">最近活动</div>
                            <div class="info-value">${formatDate(userData.lastActiveAt)}</div>
                        </div>
                    </div>
                </div>

                <div class="profile-section">
                    <h3 class="profile-section-title">昵称历史</h3>
                    <div class="section-content">
                        ${userData.nameHistory && userData.nameHistory.length > 0 ?
                            `<div class="name-history-list">
                                ${userData.nameHistory.map((item, index) => `
                                    <div class="name-history-item">
                                        <div class="name-history-number">${index + 1}</div>
                                        <div class="name-history-content">
                                            <div class="name-history-name">${item.displayName || item.name}</div>
                                            <div class="name-history-date">${formatDate(item.changedAt || item.timestamp)}</div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>` :
                            `<div class="empty-list">没有昵称变更记录</div>`
                        }
                    </div>
                </div>
            </div>
        `;

        // 添加修改密码按钮事件
        const changePasswordButton = document.getElementById('change-password-button');
        if (changePasswordButton) {
            changePasswordButton.addEventListener('click', function() {
                // 创建修改密码模态框
                createChangePasswordModal();

                // 打开模态框
                openModal('changePasswordModal');
            });
        }

        // 添加验证邮箱按钮事件
        const verifyEmailButton = document.getElementById('verify-email-button');
        if (verifyEmailButton) {
            verifyEmailButton.addEventListener('click', function() {
                // 禁用按钮，防止重复点击
                verifyEmailButton.disabled = true;
                verifyEmailButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 发送中...';

                // 发送验证邮件
                user.sendEmailVerification()
                    .then(() => {
                        showMessage('验证邮件已发送，请查收');

                        // 重定向到验证邮箱页面
                        setTimeout(() => {
                            redirectTo('verify-email.html');
                        }, 2000);
                    })
                    .catch(error => {
                        console.error('发送验证邮件失败:', error);
                        showError('发送验证邮件失败: ' + error.message);

                        // 恢复按钮
                        verifyEmailButton.disabled = false;
                        verifyEmailButton.innerHTML = '<i class="fas fa-envelope"></i> 验证邮箱';
                    });
            });
        }

    } catch (error) {
        console.error('加载个人资料失败:', error);

        profileContent.innerHTML = `
            <div class="auth-error" style="display: block;">
                加载个人资料失败: ${error.message}
                <button id="retry-load-profile" class="auth-button">重试</button>
            </div>
        `;

        // 添加重试按钮事件
        const retryButton = document.getElementById('retry-load-profile');
        if (retryButton) {
            retryButton.addEventListener('click', function() {
                handleProfilePage(user);
            });
        }
    }
}

// 创建修改密码模态框
function createChangePasswordModal() {
    // 检查模态框是否已存在
    if (document.getElementById('changePasswordModal')) {
        return;
    }

    // 创建修改密码模态框
    const changePasswordModalHTML = `
        <div class="modal" id="changePasswordModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>修改密码</h2>
                    <span class="close-modal">&times;</span>
                </div>
                <div class="modal-body">
                    <form id="changePasswordForm">
                        <div class="form-group">
                            <label for="currentPassword">当前密码</label>
                            <input type="password" id="currentPassword" required>
                        </div>
                        <div class="form-group">
                            <label for="newPassword">新密码</label>
                            <input type="password" id="newPassword" required>
                        </div>
                        <div class="form-group">
                            <label for="confirmNewPassword">确认新密码</label>
                            <input type="password" id="confirmNewPassword" required>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="form-button primary">修改密码</button>
                            <button type="button" class="form-button secondary close-modal-button">取消</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;

    // 将模态框添加到页面
    document.body.insertAdjacentHTML('beforeend', changePasswordModalHTML);

    // 添加关闭模态框事件
    document.querySelector('#changePasswordModal .close-modal').addEventListener('click', () => {
        closeModal('changePasswordModal');
    });

    document.querySelector('#changePasswordModal .close-modal-button').addEventListener('click', () => {
        closeModal('changePasswordModal');
    });

    // 点击模态框外部关闭
    document.getElementById('changePasswordModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('changePasswordModal')) {
            closeModal('changePasswordModal');
        }
    });

    // 添加表单提交事件
    document.getElementById('changePasswordForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmNewPassword = document.getElementById('confirmNewPassword').value;

        // 检查新密码是否匹配
        if (newPassword !== confirmNewPassword) {
            showError('两次输入的新密码不一致');
            return;
        }

        // 禁用提交按钮
        const submitButton = e.target.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 处理中...';

        try {
            // 获取当前用户
            const user = window.authService.auth.currentUser;

            // 重新认证用户
            const credential = firebase.auth.EmailAuthProvider.credential(
                user.email,
                currentPassword
            );

            await user.reauthenticateWithCredential(credential);

            // 更新密码
            await user.updatePassword(newPassword);

            showMessage('密码已成功更新');
            closeModal('changePasswordModal');

        } catch (error) {
            console.error('修改密码失败:', error);

            // 处理常见错误
            let errorMessage = '修改密码失败: ' + error.message;

            if (error.code === 'auth/wrong-password') {
                errorMessage = '当前密码不正确';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = '新密码弱，请使用至少6个字符的强密码';
            }

            showError(errorMessage);

        } finally {
            // 恢复提交按钮
            submitButton.disabled = false;
            submitButton.textContent = '修改密码';
        }
    });
}

// 处理个人资料编辑页面
async function handleProfileEditPage(user) {
    // 检查是否在个人资料编辑页面
    if (getCurrentPage() !== 'profile-edit.html') return;

    console.log('处理个人资料编辑页面');

    // 获取页面元素
    const profileEditContent = document.getElementById('profile-edit-content');
    if (!profileEditContent) {
        console.error('未找到个人资料编辑内容容器');
        return;
    }

    // 显示加载中状态
    profileEditContent.innerHTML = `
        <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
            <span>正在加载个人资料...</span>
        </div>
    `;

    try {
        // 获取用户数据
        const userData = await getUserData(user.uid);

        if (!userData) {
            profileEditContent.innerHTML = `
                <div class="auth-error" style="display: block;">
                    无法加载用户数据，请刷新页面重试。
                </div>
            `;
            return;
        }

        // 渲染个人资料编辑页面
        profileEditContent.innerHTML = `
            <form id="profile-edit-form" class="edit-form">
                <div class="avatar-upload">
                    <div class="avatar-preview" id="avatar-preview">
                        ${userData.photoURL ?
                            `<img src="${userData.photoURL}" alt="用户头像" id="avatar-preview-image">` :
                            `<div class="profile-default-avatar" id="avatar-preview-text">${(userData.displayName || user.email || '用户').charAt(0).toUpperCase()}</div>`
                        }
                    </div>
                    <div class="avatar-actions">
                        <button type="button" class="avatar-button primary" id="upload-avatar-btn">
                            <i class="fas fa-upload"></i> 上传头像
                        </button>
                        <button type="button" class="avatar-button secondary" id="remove-avatar-btn">
                            <i class="fas fa-trash"></i> 移除头像
                        </button>
                        <input type="file" id="avatar-upload" accept="image/*" style="display: none;">
                    </div>
                </div>

                <div class="form-group">
                    <label for="display-name" class="form-label">昵称</label>
                    <input type="text" id="display-name" class="form-input" value="${userData.displayName || ''}" placeholder="请输入昵称">
                </div>

                <div class="form-group">
                    <label for="email" class="form-label">邮箱</label>
                    <input type="email" id="email" class="form-input" value="${userData.email}" disabled>
                    ${user.emailVerified ?
                        `<div class="verified-badge"><i class="fas fa-check-circle"></i> 已验证</div>` :
                        `<div class="unverified-badge"><i class="fas fa-exclamation-circle"></i> 未验证</div>`
                    }
                </div>

                <div class="form-actions">
                    <a href="profile.html" class="form-button secondary">
                        <i class="fas fa-arrow-left"></i> 取消
                    </a>
                    <button type="submit" class="form-button primary">
                        <i class="fas fa-save"></i> 保存更改
                    </button>
                </div>
            </form>
        `;

        // 添加头像上传按钮事件
        const uploadAvatarBtn = document.getElementById('upload-avatar-btn');
        if (uploadAvatarBtn) {
            uploadAvatarBtn.addEventListener('click', function() {
                document.getElementById('avatar-upload').click();
            });
        }

        // 添加头像移除按钮事件
        const removeAvatarBtn = document.getElementById('remove-avatar-btn');
        if (removeAvatarBtn) {
            removeAvatarBtn.addEventListener('click', function() {
                const avatarPreview = document.getElementById('avatar-preview');
                avatarPreview.innerHTML = `<div class="profile-default-avatar" id="avatar-preview-text">${(userData.displayName || user.email || '用户').charAt(0).toUpperCase()}</div>`;
                // 清空文件输入
                document.getElementById('avatar-upload').value = '';
            });
        }

        // 添加头像上传事件
        const avatarUpload = document.getElementById('avatar-upload');
        if (avatarUpload) {
            avatarUpload.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (!file) return;

                // 检查文件类型
                if (!file.type.match('image.*')) {
                    showError('请选择图片文件');
                    return;
                }

                // 检查文件大小
                if (file.size > 5 * 1024 * 1024) { // 5MB
                    showError('图片大小不能超过5MB');
                    return;
                }

                // 预览图片
                const reader = new FileReader();
                reader.onload = function(e) {
                    const previewImage = document.getElementById('avatar-preview-image');
                    const previewText = document.getElementById('avatar-preview-text');

                    if (previewImage) {
                        // 更新现有图片
                        previewImage.src = e.target.result;
                    } else if (previewText) {
                        // 替换默认头像为图片
                        const avatarPreview = previewText.parentElement;
                        avatarPreview.innerHTML = `<img src="${e.target.result}" alt="用户头像" id="avatar-preview-image">`;
                    }
                };
                reader.readAsDataURL(file);
            });
        }

        // 添加表单提交事件
        const profileEditForm = document.getElementById('profile-edit-form');
        if (profileEditForm) {
            profileEditForm.addEventListener('submit', async function(e) {
                e.preventDefault();

                // 获取表单数据
                const displayName = document.getElementById('display-name').value.trim();
                const avatarFile = document.getElementById('avatar-upload').files[0];

                // 禁用提交按钮
                const submitButton = e.target.querySelector('button[type="submit"]');
                submitButton.disabled = true;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 保存中...';

                try {
                    // 更新用户资料
                    await updateUserProfile(user, displayName, avatarFile);

                    showMessage('个人资料已成功更新');

                    // 重定向到个人资料页面
                    setTimeout(() => {
                        redirectTo('profile.html');
                    }, 2000);

                } catch (error) {
                    console.error('更新个人资料失败:', error);
                    showError('更新个人资料失败: ' + error.message);

                    // 恢复提交按钮
                    submitButton.disabled = false;
                    submitButton.innerHTML = '<i class="fas fa-save"></i> 保存更改';
                }
            });
        }

    } catch (error) {
        console.error('加载个人资料编辑页面失败:', error);

        profileEditContent.innerHTML = `
            <div class="auth-error" style="display: block;">
                加载个人资料编辑页面失败: ${error.message}
                <button id="retry-load-profile-edit" class="auth-button">重试</button>
            </div>
        `;

        // 添加重试按钮事件
        const retryButton = document.getElementById('retry-load-profile-edit');
        if (retryButton) {
            retryButton.addEventListener('click', function() {
                handleProfileEditPage(user);
            });
        }
    }
}

// 更新用户资料
async function updateUserProfile(user, displayName, avatarFile) {
    try {
        console.log('更新用户资料:', user.uid);

        // 初始化更新对象
        const updates = {};
        let photoURL = user.photoURL;

        // 如果有新头像，先上传
        if (avatarFile) {
            photoURL = await uploadUserAvatar(user.uid, avatarFile);
        }

        // 检查昵称是否变更
        if (displayName !== user.displayName) {
            // 获取当前用户数据，以更新昵称历史记录
            try {
                const userData = await getUserData(user.uid);
                if (userData && userData.displayName && userData.displayName !== displayName) {
                    console.log('昵称变更，需要更新历史记录');
                    console.log('旧昵称:', userData.displayName);
                    console.log('新昵称:', displayName);
                }
            } catch (error) {
                console.error('获取用户数据失败，无法更新昵称历史记录:', error);
            }

            updates.displayName = displayName;
        }

        // 如果有新头像，更新头像 URL
        if (photoURL !== user.photoURL) {
            updates.photoURL = photoURL;
        }

        console.log('准备更新的数据:', updates);

        // 使用 REST API 更新用户资料
        if (window.firestoreUserApi && typeof window.firestoreUserApi.updateUserProfile === 'function') {
            console.log('使用 firestoreUserApi.updateUserProfile 更新用户资料');
            await window.firestoreUserApi.updateUserProfile(user.uid, updates);
        } else if (window.firebaseService && typeof window.firebaseService.updateUserProfile === 'function') {
            console.log('使用 firebaseService.updateUserProfile 更新用户资料');
            await window.firebaseService.updateUserProfile(user.uid, updates);
        } else {
            throw new Error('找不到可用的用户资料更新方法');
        }

        // 更新 Firebase Auth 中的用户资料
        await user.updateProfile({
            displayName: displayName || user.displayName,
            photoURL: photoURL || user.photoURL
        });

        console.log('用户资料更新成功');
        return true;

    } catch (error) {
        console.error('更新用户资料失败:', error);
        throw error;
    }
}

// 上传用户头像
async function uploadUserAvatar(uid, file) {
    try {
        console.log('上传用户头像:', uid);

        // 优先使用 REST API
        if (window.firestoreUserApi && typeof window.firestoreUserApi.uploadUserAvatar === 'function') {
            console.log('使用 firestoreUserApi 上传头像');
            return window.firestoreUserApi.uploadUserAvatar(uid, file);
        }

        // 其次使用 firebaseService
        if (window.firebaseService && typeof window.firebaseService.uploadUserAvatar === 'function') {
            console.log('使用 firebaseService 上传头像');
            return window.firebaseService.uploadUserAvatar(uid, file);
        }

        // 如果都没有，抛出错误
        throw new Error('找不到可用的头像上传方法');

    } catch (error) {
        console.error('上传用户头像失败:', error);
        throw error;
    }
}

// 处理当前页面
function handleCurrentPage(user) {
    const currentPage = getCurrentPage();
    console.log('处理当前页面:', currentPage);

    // 根据当前页面执行相应的处理函数
    switch (currentPage) {
        case 'verify-email.html':
            handleVerifyEmailPage(user);
            break;

        case 'profile.html':
            handleProfilePage(user);
            break;

        case 'profile-edit.html':
            handleProfileEditPage(user);
            break;
    }
}

// 在页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('页面加载完成，初始化认证功能');
    initAuth();
});

// 导出模块
window.authUnified = {
    initAuth,
    updateUserUI,
    handleAuthStateChanged,
    handleCurrentPage,
    handleVerifyEmailPage,
    handleProfilePage,
    handleProfileEditPage,
    createOrUpdateUserRecord,
    getUserData,
    updateUserProfile,
    uploadUserAvatar,
    showMessage,
    showError,
    redirectTo,
    getCurrentPage,
    openModal,
    closeModal,
    closeAllModals
};