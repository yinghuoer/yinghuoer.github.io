// 用户认证相关功能

// 初始化Firebase Auth
function initAuth() {
    // 检查Firebase是否已初始化
    if (!window.firebase) {
        console.error('Firebase未初始化');
        return;
    }

    // 获取Auth实例
    const auth = firebase.auth();

    // 监听认证状态变化
    auth.onAuthStateChanged(user => {
        updateUserUI(user);
    });

    // 初始化登录/注册模态框
    initAuthModals();
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
        userRole = await window.firebaseService.getUserRole(user.uid);
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
                    <a href="../profile.html" class="user-link">
                        <i class="fas fa-user"></i>
                        <span>个人资料</span>
                    </a>
                    <a href="../profile-edit.html" class="user-link">
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
        firebase.auth().signOut().then(() => {
            showMessage('已成功退出登录');
        }).catch((error) => {
            showError('退出登录失败: ' + error.message);
        });
    });
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
            await firebase.auth().signInWithEmailAndPassword(email, password);
            showMessage('登录成功');
            closeAllModals();
        } catch (error) {
            showError('登录失败: ' + error.message);
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
            const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);

            // 创建用户资料
            await window.firebaseService.createUserProfile(userCredential.user.uid, {
                email: email,
                displayName: '',
                bio: '',
                role: 'user',
                createdAt: new Date().toISOString()
            });

            showMessage('注册成功');
            closeAllModals();
        } catch (error) {
            showError('注册失败: ' + error.message);
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

// 显示成功消息
function showMessage(message) {
    const messageContainer = document.getElementById('messageContainer');

    if (!messageContainer) {
        console.error('未找到消息容器');
        return;
    }

    const messageElement = document.createElement('div');
    messageElement.className = 'message success';
    messageElement.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;

    messageContainer.appendChild(messageElement);

    // 3秒后自动移除
    setTimeout(() => {
        messageElement.style.opacity = '0';
        setTimeout(() => {
            messageContainer.removeChild(messageElement);
        }, 300);
    }, 3000);
}

// 显示错误消息
function showError(message) {
    const messageContainer = document.getElementById('messageContainer');

    if (!messageContainer) {
        console.error('未找到消息容器');
        return;
    }

    const messageElement = document.createElement('div');
    messageElement.className = 'message error';
    messageElement.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
    `;

    messageContainer.appendChild(messageElement);

    // 3秒后自动移除
    setTimeout(() => {
        messageElement.style.opacity = '0';
        setTimeout(() => {
            messageContainer.removeChild(messageElement);
        }, 300);
    }, 3000);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initAuth);
