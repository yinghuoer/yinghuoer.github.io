// 使用统一的 Firebase 实例
console.log('初始化auth.js，检查firebaseInstances:', window.firebaseInstances);

// 使用不同的变量名，避免与其他文件冲突
const authService = {};

// 检查Firebase实例是否存在
if (window.firebaseInstances) {
    authService.auth = window.firebaseInstances.auth;
    authService.db = window.firebaseInstances.db;
    authService.rtdb = window.firebaseInstances.rtdb;
    authService.storage = window.firebaseInstances.storage;
} else {
    console.error('Firebase实例未初始化，尝试直接初始化');
    authService.auth = firebase.auth();
    authService.db = firebase.firestore();
    authService.rtdb = firebase.database();
    authService.storage = firebase.storage();
}

// 设置语言为中文
authService.auth.languageCode = 'zh-CN';

// 通用函数：显示错误消息
function showError(message) {
    const errorElement = document.getElementById('auth-error');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';

        // 5秒后自动隐藏错误消息
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }
}

// 通用函数：显示成功消息
function showMessage(message) {
    const messageElement = document.getElementById('auth-message');
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.style.display = 'block';

        // 5秒后自动隐藏成功消息
        setTimeout(() => {
            messageElement.style.display = 'none';
        }, 5000);
    }
}

// 通用函数：获取当前页面名称
function getCurrentPage() {
    const path = window.location.pathname;
    return path.substring(path.lastIndexOf('/') + 1);
}

// 通用函数：重定向到指定页面
function redirectTo(page) {
    window.location.href = page;
}

// 监听认证状态变化
authService.auth.onAuthStateChanged(user => {
    // 更新导航栏中的用户状态
    updateNavbar(user);

    // 根据当前页面执行特定操作
    const currentPage = getCurrentPage();

    if (user) {
        // 用户已登录
        console.log('用户已登录:', user.displayName || user.email);

        // 检查邮箱验证状态
        if (!user.emailVerified) {
            // 邮箱未验证
            console.log('用户邮箱未验证');

            // 如果不在验证邮箱页面或登录/注册页面，重定向到验证邮箱页面
            const allowedPages = ['verify-email.html', 'login.html', 'register.html'];
            if (!allowedPages.includes(currentPage)) {
                redirectTo('verify-email.html');
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

            case 'verify-email.html':
                // 处理邮箱验证页面
                handleVerifyEmailPage(user);
                break;

            case 'profile.html':
                // 处理个人资料页面
                handleProfilePage(user);
                break;

            case 'reset-password.html':
                // 已登录用户访问重置密码页面，重定向到个人资料页面
                redirectTo('profile.html');
                break;
        }
    } else {
        // 用户未登录
        console.log('用户未登录');

        // 需要登录才能访问的页面
        const protectedPages = ['profile.html', 'verify-email.html'];

        if (protectedPages.includes(currentPage)) {
            // 重定向到登录页面
            redirectTo('login.html');
        }
    }
});

// 更新导航栏中的用户状态
function updateNavbar(user) {
    // 检查是否已经存在用户菜单
    let userMenu = document.querySelector('.user-dropdown');

    // 如果存在旧的用户菜单，先移除
    if (userMenu) {
        userMenu.remove();
    }

    // 获取导航栏
    const nav = document.querySelector('nav ul');

    if (!nav) return;

    // 检查是否已经存在登录/注册按钮
    let authButtons = document.querySelector('.auth-nav-buttons');

    // 如果存在旧的按钮，先移除
    if (authButtons) {
        authButtons.remove();
    }

    if (user) {
        // 用户已登录，显示用户菜单
        const userDropdown = document.createElement('li');
        userDropdown.className = 'user-dropdown';

        // 初始化下拉菜单，使用默认头像
        const userInitial = user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase();
        let avatarHTML = `<div class="user-avatar">${userInitial}</div>`;

        // 初始化下拉菜单 - 只显示头像
        userDropdown.innerHTML = `
            <div class="user-dropdown-toggle">
                ${avatarHTML}
            </div>
            <div class="user-dropdown-menu">
                <div class="user-dropdown-header">
                    <span class="user-name">${user.displayName || user.email}</span>
                    <span class="user-email">${user.email}</span>
                </div>
                <div class="user-dropdown-divider"></div>
                <a href="../profile.html" class="user-dropdown-item">
                    <i class="fas fa-user"></i> 个人资料
                </a>
                ${!user.emailVerified ? `
                <a href="../verify-email.html" class="user-dropdown-item">
                    <i class="fas fa-envelope"></i> 验证邮箱
                </a>
                ` : ''}
                <div class="user-dropdown-divider"></div>
                <a href="#" class="user-dropdown-item" id="logout-link">
                    <i class="fas fa-sign-out-alt"></i> 退出登录
                </a>
            </div>
        `;

        // 尝试从 Firestore 加载用户头像
        if (window.firebaseService) {
            window.firebaseService.getUserData(user.uid)
                .then(userData => {
                    if (userData && userData.photoURL) {
                        // 如果有头像，更新头像
                        const avatarElement = userDropdown.querySelector('.user-avatar');
                        if (avatarElement) {
                            avatarElement.innerHTML = `<img src="${userData.photoURL}" alt="用户头像">`;
                        }
                    }
                })
                .catch(error => {
                    console.error('获取用户数据失败:', error);
                    // 如果获取失败，保留默认头像
                });
        }
        const dropdownToggle = userDropdown.querySelector('.user-dropdown-toggle');
        const dropdownMenu = userDropdown.querySelector('.user-dropdown-menu');

        dropdownToggle.addEventListener('click', function(e) {
            e.preventDefault();
            dropdownMenu.classList.toggle('show');
        });

        // 点击页面其他地方关闭下拉菜单
        document.addEventListener('click', function(e) {
            if (!userDropdown.contains(e.target)) {
                dropdownMenu.classList.remove('show');
            }
        });

        // 添加退出登录功能
        const logoutLink = document.getElementById('logout-link');
        if (logoutLink) {
            logoutLink.addEventListener('click', function(e) {
                e.preventDefault();
                auth.signOut().then(() => {
                    console.log('用户已退出登录');
                    redirectTo('index.html');
                }).catch(error => {
                    console.error('退出登录失败:', error);
                    showError('退出登录失败: ' + error.message);
                });
            });
        }

        // 将用户下拉菜单添加到导航栏
        nav.appendChild(userDropdown);
    } else {
        // 用户未登录，显示登录/注册按钮
        const authButtonsContainer = document.createElement('div');
        authButtonsContainer.className = 'auth-nav-buttons';

        authButtonsContainer.innerHTML = `
            <a href="../login.html" class="auth-nav-button login">登录</a>
            <a href="../register.html" class="auth-nav-button register">注册</a>
        `;

        // 将按钮添加到导航栏
        nav.parentNode.appendChild(authButtonsContainer);
    }
}

// 处理登录表单
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // 禁用提交按钮，防止重复提交
        const submitButton = loginForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = '登录中...';

        // 使用Firebase登录
        authService.auth.signInWithEmailAndPassword(email, password)
            .then(userCredential => {
                console.log('登录成功');

                // 确保用户记录存在于Firestore中
                const user = userCredential.user;

                // 直接创建用户记录到Firestore
                if (window.createUserDirectly) {
                    console.log('使用createUserDirectly直接创建用户记录');
                    window.createUserDirectly(user);
                } else {
                    console.log('createUserDirectly不存在，尝试使用firebaseService');

                    if (window.firebaseService && window.firebaseService.createUserRecord) {
                        console.log('使用firebaseService创建用户记录');
                        window.firebaseService.createUserRecord(user)
                            .catch(error => {
                                console.error('创建用户记录失败:', error);
                            });
                    }
                }

                // 检查邮箱是否已验证
                if (!user.emailVerified) {
                    // 邮箱未验证，重定向到验证邮箱页面
                    redirectTo('verify-email.html');
                } else {
                    // 邮箱已验证，重定向到首页或指定页面
                    const redirectUrl = getRedirectUrl();
                    redirectTo(redirectUrl || 'index.html');
                }
            })
            .catch(error => {
                console.error('登录失败:', error);

                // 根据错误代码显示不同的错误消息
                let errorMessage = '登录失败，请检查您的邮箱和密码。';

                switch (error.code) {
                    case 'auth/user-not-found':
                        errorMessage = '该邮箱未注册，请先注册账号。';
                        break;
                    case 'auth/wrong-password':
                        errorMessage = '密码错误，请重试。';
                        break;
                    case 'auth/invalid-email':
                        errorMessage = '邮箱格式不正确，请检查。';
                        break;
                    case 'auth/user-disabled':
                        errorMessage = '该账号已被禁用，请联系管理员。';
                        break;
                    case 'auth/too-many-requests':
                        errorMessage = '登录尝试次数过多，请稍后再试。';
                        break;
                }

                showError(errorMessage);

                // 恢复提交按钮
                submitButton.disabled = false;
                submitButton.textContent = '登录';
            });
    });

    // 忘记密码链接
    const forgotPasswordLink = document.getElementById('forgot-password');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            redirectTo('reset-password.html');
        });
    }
}

// 处理注册表单
const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const displayName = document.getElementById('display-name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        // 验证密码是否匹配
        if (password !== confirmPassword) {
            showError('两次输入的密码不一致，请重新输入。');
            return;
        }

        // 禁用提交按钮，防止重复提交
        const submitButton = registerForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = '注册中...';

        console.log('开始创建用户:', email);

        // 使用Firebase创建用户
        console.log('开始调用Firebase创建用户...');
        authService.auth.createUserWithEmailAndPassword(email, password)
            .then(userCredential => {
                console.log('注册成功, 用户ID:', userCredential.user.uid);

                // 更新用户资料
                const user = userCredential.user;
                console.log('开始更新用户资料:', displayName);
                return user.updateProfile({
                    displayName: displayName
                });
            })
            .then(() => {
                // 重新获取当前用户，确保用户资料已更新
                const user = authService.auth.currentUser;
                console.log('创建用户记录');

                // 创建用户记录在Firestore中
                console.log('尝试创建用户记录在Firestore中');

                // 直接创建用户记录到Firestore
                if (window.createUserDirectly) {
                    console.log('使用createUserDirectly直接创建用户记录');
                    window.createUserDirectly(user);
                } else {
                    console.log('createUserDirectly不存在，尝试使用firebaseService');

                    if (window.firebaseService && window.firebaseService.createUserRecord) {
                        console.log('使用firebaseService创建用户记录');
                        window.firebaseService.createUserRecord(user)
                            .catch(error => {
                                console.error('创建用户记录失败:', error);
                            });
                    }
                }

                // 发送邮箱验证
                console.log('开始发送验证邮件');
                return user.sendEmailVerification();


            })
            .then(() => {
                console.log('验证邮件已发送');
                // 显示成功消息
                showMessage('注册成功！验证邮件已发送到您的邮箱，请查收。');

                // 恢复提交按钮
                submitButton.disabled = false;
                submitButton.textContent = '注册';

                // 添加成功消息元素（如果不存在）
                if (!document.getElementById('auth-message')) {
                    const messageDiv = document.createElement('div');
                    messageDiv.id = 'auth-message';
                    messageDiv.className = 'auth-message';
                    const formElement = document.getElementById('register-form');
                    if (formElement && formElement.parentNode) {
                        formElement.parentNode.insertBefore(messageDiv, formElement);
                    }
                }

                // 延迟重定向，给用户时间看到成功消息
                setTimeout(() => {
                    console.log('准备重定向到验证邮箱页面');
                    // 重定向到验证邮箱页面
                    try {
                        window.location.href = 'verify-email.html';
                    } catch (e) {
                        console.error('重定向失败:', e);
                        alert('注册成功！请手动前往验证邮箱页面。');
                    }
                }, 2000);
            })
            .catch(error => {
                console.error('注册失败:', error);
                console.error('错误代码:', error.code);
                console.error('错误消息:', error.message);

                let errorMessage = '注册失败，请稍后重试。';

                switch (error.code) {
                    case 'auth/email-already-in-use':
                        errorMessage = '该邮箱已被注册，请使用其他邮箱或直接登录。';
                        break;
                    case 'auth/invalid-email':
                        errorMessage = '邮箱格式不正确，请检查。';
                        break;
                    case 'auth/weak-password':
                        errorMessage = '密码强度不足，请使用至少6个字符的密码。';
                        break;
                    case 'auth/operation-not-allowed':
                        errorMessage = '邮箱/密码注册功能未启用，请联系管理员。';
                        break;
                    case 'auth/network-request-failed':
                        errorMessage = '网络连接失败，请检查您的网络连接。';
                        break;
                    default:
                        errorMessage = `注册失败: ${error.message}`;
                        break;
                }

                showError(errorMessage);
                submitButton.disabled = false;
                submitButton.textContent = '注册';
            }); // ✅ <- 这里是 .catch 的结尾

    }); // ✅ <- 这里是 registerForm.addEventListener 的结尾
}


// 处理重置密码表单
const resetPasswordForm = document.getElementById('reset-password-form');
if (resetPasswordForm) {
    resetPasswordForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const email = document.getElementById('email').value;

        // 禁用提交按钮，防止重复提交
        const submitButton = resetPasswordForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = '发送中...';

        // 使用Firebase发送密码重置邮件
        authService.auth.sendPasswordResetEmail(email)
            .then(() => {
                console.log('密码重置邮件已发送');
                showMessage('密码重置链接已发送到您的邮箱，请查收。');

                // 清空输入框
                document.getElementById('email').value = '';

                // 恢复提交按钮
                submitButton.disabled = false;
                submitButton.textContent = '发送重置链接';
            })
            .catch(error => {
                console.error('发送密码重置邮件失败:', error);

                // 根据错误代码显示不同的错误消息
                let errorMessage = '发送密码重置邮件失败，请稍后重试。';

                switch (error.code) {
                    case 'auth/invalid-email':
                        errorMessage = '邮箱格式不正确，请检查。';
                        break;
                    case 'auth/user-not-found':
                        errorMessage = '该邮箱未注册，请先注册账号。';
                        break;
                }

                showError(errorMessage);

                // 恢复提交按钮
                submitButton.disabled = false;
                submitButton.textContent = '发送重置链接';
            });
    });
}

// 处理邮箱验证页面
function handleVerifyEmailPage(user) {
    // 检查是否在验证邮箱页面
    if (getCurrentPage() !== 'verify-email.html') return;

    // 显示用户邮箱
    const userEmailElement = document.getElementById('user-email');
    if (userEmailElement) {
        userEmailElement.textContent = user.email;
    }

    // 如果邮箱已验证，重定向到首页
    if (user.emailVerified) {
        showMessage('您的邮箱已验证成功！');
        setTimeout(() => {
            redirectTo('index.html');
        }, 2000);
        return;
    }

    // 自动发送验证邮件（如果是首次加载页面）
    if (!window.emailSentOnLoad) {
        window.emailSentOnLoad = true;

        // 发送验证邮件
        user.sendEmailVerification()
            .then(() => {
                console.log('验证邮件已自动发送');
                showMessage('验证邮件已发送到您的邮箱，请查收。');
            })
            .catch(error => {
                console.error('自动发送验证邮件失败:', error);
                // 如果自动发送失败，不显示错误，用户可以手动点击重新发送按钮
            });
    }

    // 重新发送验证邮件按钮
    const resendButton = document.getElementById('resend-verification');
    if (resendButton) {
        // 添加倒计时功能
        let countdownTimer;
        let countdown = 0;

        function startResendCountdown() {
            clearInterval(countdownTimer);
            countdown = 60; // 60秒倒计时
            resendButton.disabled = true;

            countdownTimer = setInterval(() => {
                countdown--;
                resendButton.textContent = `重新发送验证邮件 (${countdown}s)`;

                if (countdown <= 0) {
                    clearInterval(countdownTimer);
                    resendButton.disabled = false;
                    resendButton.textContent = '重新发送验证邮件';
                }
            }, 1000);
        }

        // 如果刚刚自动发送了邮件，启动倒计时
        if (window.emailSentOnLoad) {
            startResendCountdown();
        }

        resendButton.addEventListener('click', function() {
            // 禁用按钮，防止重复点击
            resendButton.disabled = true;
            resendButton.textContent = '发送中...';

            // 发送验证邮件
            user.sendEmailVerification()
                .then(() => {
                    console.log('验证邮件已重新发送');
                    showMessage('验证邮件已重新发送，请查收。');

                    // 启动倒计时
                    startResendCountdown();
                })
                .catch(error => {
                    console.error('发送验证邮件失败:', error);

                    // 根据错误代码显示不同的错误消息
                    let errorMessage = '发送验证邮件失败，请稍后重试。';

                    if (error.code === 'auth/too-many-requests') {
                        errorMessage = '发送次数过多，请稍后再试。';
                        // 如果发送次数过多，启动更长的倒计时
                        countdown = 120; // 2分钟
                    }

                    showError(errorMessage);

                    // 启动倒计时
                    startResendCountdown();
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
                        refreshButton.textContent = '我已验证，刷新状态';
                    }
                })
                .catch(error => {
                    console.error('刷新用户信息失败:', error);
                    showError('刷新状态失败，请稍后重试。');

                    // 恢复按钮
                    refreshButton.disabled = false;
                    refreshButton.textContent = '我已验证，刷新状态';
                });
        });
    }

    // 退出登录按钮
    const logoutButton = document.getElementById('logout');
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            authService.auth.signOut().then(() => {
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
function handleProfilePage(user) {
    // 检查是否在个人资料页面
    if (getCurrentPage() !== 'profile.html') return;

    // 获取个人资料内容容器
    const profileContent = document.getElementById('profile-content');
    if (!profileContent) return;

    // 清空加载中的内容
    profileContent.innerHTML = '';

    // 创建个人资料头部
    const profileHeader = document.createElement('div');
    profileHeader.className = 'profile-section profile-header';

    // 获取用户名首字母或使用默认图标
    const userInitial = user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase();

    profileHeader.innerHTML = `
        <div class="profile-avatar">${userInitial}</div>
        <div class="profile-info">
            <h3>${user.displayName || '未设置用户名'}</h3>
            <p class="profile-email"><i class="fas fa-envelope"></i>${user.email}</p>
            <span class="verification-status ${user.emailVerified ? 'verified' : 'not-verified'}">
                <i class="fas ${user.emailVerified ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
                ${user.emailVerified ? '邮箱已验证' : '邮箱未验证'}
            </span>
            <div class="profile-bio" id="profile-bio">
                <i class="fas fa-quote-left"></i>
                <span>加载中...</span>
                <i class="fas fa-quote-right"></i>
            </div>
        </div>
    `;

    profileContent.appendChild(profileHeader);

    // 尝试从 Firestore 获取用户头像和个人简介
    try {
        if (window.firebaseService && typeof window.firebaseService.getUserData === 'function') {
            window.firebaseService.getUserData(user.uid)
                .then(userData => {
                    // 获取并显示头像
                    if (userData && userData.photoURL) {
                        const avatarElement = profileHeader.querySelector('.profile-avatar');
                        avatarElement.innerHTML = `<img src="${userData.photoURL}" alt="用户头像" class="profile-avatar-img">`;
                    }

                    // 获取并显示个人简介
                    const bioElement = document.getElementById('profile-bio');
                    if (bioElement) {
                        if (userData && userData.bio) {
                            bioElement.innerHTML = `
                                <i class="fas fa-quote-left"></i>
                                <span>${userData.bio}</span>
                                <i class="fas fa-quote-right"></i>
                            `;
                        } else {
                            bioElement.innerHTML = `
                                <i class="fas fa-quote-left"></i>
                                <span class="empty-bio">还没有个人简介，<a href="../profile-edit.html">点击添加</a></span>
                                <i class="fas fa-quote-right"></i>
                            `;
                        }
                    }
                })
                .catch(error => {
                    // 静默处理错误，不显示给用户
                    console.error('获取用户数据失败:', error);

                    // 如果获取失败，显示默认的个人简介
                    const bioElement = document.getElementById('profile-bio');
                    if (bioElement) {
                        bioElement.innerHTML = `
                            <i class="fas fa-quote-left"></i>
                            <span class="empty-bio">还没有个人简介，<a href="../profile-edit.html">点击添加</a></span>
                            <i class="fas fa-quote-right"></i>
                        `;
                    }
                });
        } else {
            console.log('firebaseService.getUserData 不可用，使用默认头像和简介');

            // 显示默认的个人简介
            const bioElement = document.getElementById('profile-bio');
            if (bioElement) {
                bioElement.innerHTML = `
                    <i class="fas fa-quote-left"></i>
                    <span class="empty-bio">还没有个人简介，<a href="../profile-edit.html">点击添加</a></span>
                    <i class="fas fa-quote-right"></i>
                `;
            }
        }
    } catch (error) {
        // 静默处理错误，不显示给用户
        console.error('尝试获取用户数据时出错:', error);

        // 显示默认的个人简介
        const bioElement = document.getElementById('profile-bio');
        if (bioElement) {
            bioElement.innerHTML = `
                <i class="fas fa-quote-left"></i>
                <span class="empty-bio">还没有个人简介，<a href="../profile-edit.html">点击添加</a></span>
                <i class="fas fa-quote-right"></i>
            `;
        }
    }

    // 如果邮箱未验证，显示验证提示
    if (!user.emailVerified) {
        const verificationSection = document.createElement('div');
        verificationSection.className = 'profile-section';
        verificationSection.innerHTML = `
            <div class="auth-error" style="display: block;">
                您的邮箱尚未验证，某些功能可能受限。
                <a href="../verify-email.html" class="auth-link">立即验证</a>
            </div>
        `;
        profileContent.appendChild(verificationSection);
    }

    // 添加账号信息部分
    const accountSection = document.createElement('div');
    accountSection.className = 'profile-section';
    accountSection.innerHTML = `
        <h3><i class="fas fa-user-circle"></i> 账号信息</h3>
        <div class="account-info-item">
            <div class="account-info-label">
                <i class="fas fa-calendar-alt"></i>
                <span>注册时间</span>
            </div>
            <div class="account-info-value">${new Date(user.metadata.creationTime).toLocaleString()}</div>
        </div>
        <div class="account-info-item">
            <div class="account-info-label">
                <i class="fas fa-clock"></i>
                <span>上次登录</span>
            </div>
            <div class="account-info-value">${new Date(user.metadata.lastSignInTime).toLocaleString()}</div>
        </div>
    `;
    profileContent.appendChild(accountSection);

    // 添加账号操作部分
    const actionsSection = document.createElement('div');
    actionsSection.className = 'profile-section';
    actionsSection.innerHTML = `
        <h3><i class="fas fa-cog"></i> 账号操作</h3>
        <div class="profile-actions">
            <a href="../profile-edit.html" class="auth-button"><i class="fas fa-edit"></i> 编辑个人资料</a>
            <button id="change-password" class="auth-button secondary"><i class="fas fa-key"></i> 修改密码</button>
        </div>
    `;
    profileContent.appendChild(actionsSection);



    // 修改密码按钮
    const changePasswordButton = document.getElementById('change-password');
    if (changePasswordButton) {
        changePasswordButton.addEventListener('click', function() {
            // 创建修改密码表单
            profileContent.innerHTML = `
                <h3>修改密码</h3>
                <form id="change-password-form" class="auth-form">
                    <div class="form-group">
                        <label for="current-password">当前密码</label>
                        <input type="password" id="current-password" name="currentPassword" required>
                    </div>

                    <div class="form-group">
                        <label for="new-password">新密码</label>
                        <input type="password" id="new-password" name="newPassword" required minlength="6">
                        <small class="form-hint">密码至少需要6个字符</small>
                    </div>

                    <div class="form-group">
                        <label for="confirm-new-password">确认新密码</label>
                        <input type="password" id="confirm-new-password" name="confirmNewPassword" required minlength="6">
                    </div>

                    <button type="submit" class="auth-button">保存更改</button>
                    <button type="button" id="cancel-change-password" class="auth-button secondary">取消</button>
                </form>
            `;

            // 处理表单提交
            const changePasswordForm = document.getElementById('change-password-form');
            changePasswordForm.addEventListener('submit', function(e) {
                e.preventDefault();

                const currentPassword = document.getElementById('current-password').value;
                const newPassword = document.getElementById('new-password').value;
                const confirmNewPassword = document.getElementById('confirm-new-password').value;

                // 验证新密码是否匹配
                if (newPassword !== confirmNewPassword) {
                    showError('两次输入的新密码不一致，请重新输入。');
                    return;
                }

                // 禁用提交按钮，防止重复提交
                const submitButton = changePasswordForm.querySelector('button[type="submit"]');
                submitButton.disabled = true;
                submitButton.textContent = '保存中...';

                // 重新验证用户
                const credential = firebase.auth.EmailAuthProvider.credential(
                    user.email,
                    currentPassword
                );

                // 重新认证用户
                user.reauthenticateWithCredential(credential)
                    .then(() => {
                        // 更新密码
                        return user.updatePassword(newPassword);
                    })
                    .then(() => {
                        console.log('密码已更新');
                        showMessage('密码已成功更新！');

                        // 重新加载个人资料页面
                        setTimeout(() => {
                            handleProfilePage(user);
                        }, 1000);
                    })
                    .catch(error => {
                        console.error('更新密码失败:', error);

                        // 根据错误代码显示不同的错误消息
                        let errorMessage = '更新密码失败，请稍后重试。';

                        switch (error.code) {
                            case 'auth/wrong-password':
                                errorMessage = '当前密码错误，请重试。';
                                break;
                            case 'auth/weak-password':
                                errorMessage = '新密码强度不足，请使用至少6个字符的密码。';
                                break;
                            case 'auth/requires-recent-login':
                                errorMessage = '此操作需要您最近登录过，请重新登录后再试。';
                                // 退出登录并重定向到登录页面
                                authService.auth.signOut().then(() => {
                                    redirectTo('login.html');
                                });
                                break;
                        }

                        showError(errorMessage);

                        // 恢复提交按钮
                        submitButton.disabled = false;
                        submitButton.textContent = '保存更改';
                    });
            });

            // 取消按钮
            const cancelButton = document.getElementById('cancel-change-password');
            cancelButton.addEventListener('click', function() {
                handleProfilePage(user);
            });
        });
    }

    // 退出登录按钮
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            authService.auth.signOut().then(() => {
                console.log('用户已退出登录');
                redirectTo('index.html');
            }).catch(error => {
                console.error('退出登录失败:', error);
                showError('退出登录失败: ' + error.message);
            });
        });
    }
}
