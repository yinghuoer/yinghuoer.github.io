// 留言板页面脚本

// 当前页码
let currentPage = 1;
// 排序方式
let currentSort = 'time';
// 是否正在加载
let isLoading = false;
// 留言监听器
let messagesListener = null;

// 加载精选留言
async function loadFeaturedMessages() {
    try {
        // 获取精选留言容器
        const featuredMessagesContainer = document.querySelector('.featured-messages');
        if (!featuredMessagesContainer) return;

        // 尝试使用 API 获取精选留言
        if (window.messageService && typeof window.messageService.getFeaturedMessages === 'function') {
            try {
                const featuredMessages = await window.messageService.getFeaturedMessages();

                // 如果有精选留言，替换默认的精选留言
                if (featuredMessages && featuredMessages.length > 0) {
                    // 清空容器，保留标题
                    const title = featuredMessagesContainer.querySelector('.section-title');
                    featuredMessagesContainer.innerHTML = '';
                    featuredMessagesContainer.appendChild(title);

                    // 添加精选留言
                    featuredMessages.forEach(message => {
                        const featuredMessageElement = document.createElement('div');
                        featuredMessageElement.className = 'featured-message';

                        // 格式化时间
                        let createdAt = '未知时间';
                        if (message.createdAt) {
                            if (message.createdAt.seconds) {
                                createdAt = new Date(message.createdAt.seconds * 1000).toLocaleString();
                            } else if (message.createdAt instanceof Date) {
                                createdAt = message.createdAt.toLocaleString();
                            } else if (typeof message.createdAt === 'string') {
                                createdAt = new Date(message.createdAt).toLocaleString();
                            }
                        }

                        // 获取用户名的首字母作为头像
                        const initial = (message.userDisplayName || 'U').charAt(0).toUpperCase();

                        // 构建 HTML
                        featuredMessageElement.innerHTML = `
                            <div class="message-header">
                                <div class="message-author">
                                    <div class="author-avatar">${initial}</div>
                                    <div>
                                        <div class="author-name">${message.userDisplayName || '匿名用户'}</div>
                                        <div class="message-date">${createdAt}</div>
                                    </div>
                                    <span class="featured-badge">精选</span>
                                </div>
                            </div>
                            <div class="message-content">
                                <p>${message.content}</p>
                            </div>
                            <div class="message-footer">
                                <div class="message-meta">
                                    <i class="fas fa-tag"></i> ${getCategoryName(message.category || 'general')}
                                </div>
                                <div class="message-actions">
                                    <a href="#" class="message-action-button"><i class="far fa-heart"></i> 喜欢</a>
                                    <a href="#" class="message-action-button"><i class="far fa-comment"></i> 回复</a>
                                </div>
                            </div>
                        `;

                        featuredMessagesContainer.appendChild(featuredMessageElement);
                    });
                }
            } catch (error) {
                console.error('加载精选留言失败:', error);
            }
        }
    } catch (error) {
        console.error('加载精选留言失败:', error);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化留言表单
    initMessageForm();

    // 初始化排序按钮
    initSortButtons();

    // 初始化管理员审核区域
    initAdminReviewSection();

    // 加载精选留言
    loadFeaturedMessages();

    // 加载留言列表
    loadMessages();

    // 监听新留言
    startMessagesListener();
});

// 初始化留言表单
function initMessageForm() {
    const messageForm = document.getElementById('message-form');
    const messageContent = document.getElementById('message-content');
    const charCount = document.getElementById('char-count');
    const loginPrompt = document.getElementById('login-prompt');
    const messageFormContent = document.getElementById('message-form-content');
    const userAvatar = document.getElementById('user-avatar');
    const userName = document.getElementById('user-name');

    // 监听用户认证状态
    // 使用统一的 Firebase 实例
    const { auth } = window.firebaseInstances;
    auth.onAuthStateChanged(function(user) {
        if (user) {
            // 用户已登录，显示留言表单
            loginPrompt.style.display = 'none';
            messageFormContent.style.display = 'block';

            // 加载用户信息
            window.firebaseService.getUserData(user.uid)
                .then(userData => {
                    if (userData) {
                        // 设置用户名
                        userName.textContent = userData.displayName || user.email;

                        // 设置用户头像
                        if (userData.photoURL) {
                            userAvatar.innerHTML = `<img src="${userData.photoURL}" alt="用户头像">`;
                        } else {
                            // 使用首字母作为默认头像
                            const initial = (userData.displayName || user.email).charAt(0).toUpperCase();
                            userAvatar.textContent = initial;
                        }
                    }
                })
                .catch(error => {
                    console.error('加载用户信息失败:', error);
                    // 在加载失败时使用默认值
                    userName.textContent = user.email.split('@')[0];
                    const initial = user.email.charAt(0).toUpperCase();
                    userAvatar.textContent = initial;
                });
        } else {
            // 用户未登录，显示登录提示
            loginPrompt.style.display = 'block';
            messageFormContent.style.display = 'none';
        }
    });

    // 监听留言内容变化，更新字符计数
    if (messageContent) {
        messageContent.addEventListener('input', function() {
            const count = this.value.length;
            charCount.textContent = count;

            // 如果超过500字符，禁用提交按钮
            if (count > 500) {
                document.getElementById('submit-message').disabled = true;
                charCount.style.color = 'red';
            } else {
                document.getElementById('submit-message').disabled = false;
                charCount.style.color = '';
            }
        });
    }

    // 监听表单提交
    if (messageForm) {
        messageForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // 获取留言内容
            const content = messageContent.value.trim();

            // 验证内容
            if (!content) {
                showNotification('请输入留言内容', 'error');
                return;
            }

            if (content.length > 500) {
                showNotification('留言内容不能超过500字符', 'error');
                return;
            }

            // 禁用提交按钮
            const submitButton = document.getElementById('submit-message');
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 提交中...';

            try {
                // 发布留言
                if (window.messageService && typeof window.messageService.postMessage === 'function') {
                    // 获取分类
                    const categorySelect = document.getElementById('category');
                    const category = categorySelect ? categorySelect.value : 'general';

                    await window.messageService.postMessage({
                        content: content,
                        category: category
                    });
                } else {
                    console.log('没有可用的留言发布方法，使用模拟发布');
                    // 模拟发布成功
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }

                // 清空表单
                messageContent.value = '';
                charCount.textContent = '0';

                // 显示成功消息
                showNotification('留言发布成功！', 'success');

                // 恢复提交按钮
                submitButton.disabled = false;
                submitButton.textContent = '发表留言';

                // 不需要重新加载留言列表，实时监听器会自动更新
                // loadMessages();
            } catch (error) {
                console.error('发布留言失败:', error);
                showNotification('发布留言失败: ' + error.message, 'error');

                // 恢复提交按钮
                submitButton.disabled = false;
                submitButton.textContent = '发表留言';
            }
        });
    }
}

// 初始化排序按钮
function initSortButtons() {
    const timeButton = document.getElementById('sort-by-time');
    const likesButton = document.getElementById('sort-by-likes');

    if (timeButton && likesButton) {
        timeButton.addEventListener('click', function() {
            if (currentSort !== 'time') {
                currentSort = 'time';
                timeButton.classList.add('active');
                likesButton.classList.remove('active');
                loadMessages();
            }
        });

        likesButton.addEventListener('click', function() {
            if (currentSort !== 'likes') {
                currentSort = 'likes';
                likesButton.classList.add('active');
                timeButton.classList.remove('active');
                loadMessages();
            }
        });
    }
}

// 初始化管理员审核区域
async function initAdminReviewSection() {
    try {
        // 检查用户是否是管理员
        let isAdmin = false;

        if (window.firestoreUserApi && typeof window.firestoreUserApi.checkUserRoleLevel === 'function') {
            isAdmin = await window.firestoreUserApi.checkUserRoleLevel(window.firestoreUserApi.USER_ROLES.ADMIN);
        } else if (window.firebaseService && typeof window.firebaseService.checkUserRoleLevel === 'function') {
            isAdmin = await window.firebaseService.checkUserRoleLevel(window.firebaseService.USER_ROLES.ADMIN);
        } else {
            console.log('没有可用的管理员权限检查方法');
            return;
        }

        if (isAdmin) {
            // 显示管理员审核区域
            document.getElementById('admin-review-section').style.display = 'block';

            // 加载待审核留言
            loadPendingMessages();
        }
    } catch (error) {
        console.error('检查管理员权限失败:', error);
    }
}

// 加载待审核留言
async function loadPendingMessages() {
    try {
        // 获取待审核留言
        let pendingMessages = [];

        if (window.messageService && typeof window.messageService.getPendingMessages === 'function') {
            pendingMessages = await window.messageService.getPendingMessages();

            // 显示待审核留言数量
            const adminReviewTitle = document.querySelector('.admin-review-title');
            if (adminReviewTitle) {
                adminReviewTitle.innerHTML = `<i class="fas fa-shield-alt"></i> 待审核留言 <span class="badge">${pendingMessages.length}</span>`;
            }
        } else {
            console.log('没有可用的待审核留言获取方法');
            return;
        }

        // 获取审核列表容器
        const reviewList = document.getElementById('admin-review-list');

        // 清空容器
        reviewList.innerHTML = '';

        // 添加审核按钮
        const adminActions = document.createElement('div');
        adminActions.className = 'admin-actions';
        adminActions.innerHTML = `
            <button class="admin-action-button approve-all"><i class="fas fa-check"></i> 批量批准</button>
            <button class="admin-action-button refresh"><i class="fas fa-sync"></i> 刷新</button>
        `;
        reviewList.appendChild(adminActions);

        // 添加批量批准功能
        adminActions.querySelector('.approve-all').addEventListener('click', async () => {
            if (confirm('确定要批准所有待审核留言吗？')) {
                try {
                    for (const message of pendingMessages) {
                        if (window.messageService && typeof window.messageService.reviewMessage === 'function') {
                            await window.messageService.reviewMessage(message.id, 'approved');
                        }
                    }
                    alert('所有留言已批准');
                    loadPendingMessages(); // 重新加载待审核留言
                    loadMessages(); // 重新加载留言列表
                } catch (error) {
                    console.error('批量批准失败:', error);
                    alert('批量批准失败: ' + error.message);
                }
            }
        });

        // 添加刷新功能
        adminActions.querySelector('.refresh').addEventListener('click', () => {
            loadPendingMessages();
        });

        if (pendingMessages.length === 0) {
            // 没有待审核留言
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'admin-review-empty';
            emptyDiv.innerHTML = '没有待审核留言';
            reviewList.appendChild(emptyDiv);
            return;
        }

        // 添加待审核留言
        pendingMessages.forEach(message => {
            const messageElement = document.createElement('div');
            messageElement.className = 'admin-review-item';

            // 格式化时间
            const createdAt = message.createdAt ? new Date(message.createdAt.seconds * 1000).toLocaleString() : '未知时间';

            messageElement.innerHTML = `
                <div class="message-user-info">
                    <div class="message-avatar">
                        ${message.userPhotoURL ? `<img src="${message.userPhotoURL}" alt="用户头像">` : message.userDisplayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div class="message-user-name">${message.userDisplayName}</div>
                        <div class="message-time">${createdAt}</div>
                    </div>
                </div>
                <div class="message-content">${message.content}</div>
                <div class="admin-review-actions">
                    <button class="admin-approve-button" data-id="${message.id}">批准</button>
                    <button class="admin-reject-button" data-id="${message.id}">拒绝</button>
                    <button class="admin-feature-button" data-id="${message.id}">精选</button>
                </div>
            `;

            reviewList.appendChild(messageElement);
        });

        // 添加批准按钮事件
        document.querySelectorAll('.admin-approve-button').forEach(button => {
            button.addEventListener('click', async function() {
                const messageId = this.getAttribute('data-id');

                try {
                    // 批准留言
                    if (window.messageService && typeof window.messageService.reviewMessage === 'function') {
                        await window.messageService.reviewMessage(messageId, 'approved');
                    } else {
                        console.log('没有可用的留言审核方法');
                        // 模拟审核成功
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }

                    // 移除留言元素
                    this.closest('.admin-review-item').remove();

                    // 显示成功消息
                    showNotification('留言已批准', 'success');

                    // 重新加载留言列表
                    loadMessages();

                    // 检查是否还有待审核留言
                    if (document.querySelectorAll('.admin-review-item').length === 0) {
                        document.getElementById('admin-review-list').innerHTML = '<div class="admin-review-empty">没有待审核留言</div>';
                    }
                } catch (error) {
                    console.error('批准留言失败:', error);
                    showNotification('批准留言失败: ' + error.message, 'error');
                }
            });
        });

        // 添加拒绝按钮事件
        document.querySelectorAll('.admin-reject-button').forEach(button => {
            button.addEventListener('click', async function() {
                const messageId = this.getAttribute('data-id');

                try {
                    // 拒绝留言
                    if (window.messageService && typeof window.messageService.reviewMessage === 'function') {
                        await window.messageService.reviewMessage(messageId, 'rejected');
                    } else {
                        console.log('没有可用的留言审核方法');
                        // 模拟审核成功
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }

                    // 移除留言元素
                    this.closest('.admin-review-item').remove();

                    // 显示成功消息
                    showNotification('留言已拒绝', 'success');

                    // 检查是否还有待审核留言
                    if (document.querySelectorAll('.admin-review-item').length === 0) {
                        document.getElementById('admin-review-list').innerHTML = '<div class="admin-review-empty">没有待审核留言</div>';
                    }
                } catch (error) {
                    console.error('拒绝留言失败:', error);
                    showNotification('拒绝留言失败: ' + error.message, 'error');
                }
            });
        });

        // 添加精选按钮事件
        document.querySelectorAll('.admin-feature-button').forEach(button => {
            button.addEventListener('click', async function() {
                const messageId = this.getAttribute('data-id');

                try {
                    // 精选留言
                    if (window.messageService && typeof window.messageService.reviewMessage === 'function') {
                        await window.messageService.reviewMessage(messageId, 'approved', true);

                        // 移除留言元素
                        this.closest('.admin-review-item').remove();

                        // 显示成功消息
                        showNotification('留言已精选，将显示在精选区域', 'success');

                        // 重新加载精选留言
                        loadFeaturedMessages();

                        // 不需要重新加载留言列表，实时监听器会自动更新
                        // loadMessages();

                        // 检查是否还有待审核留言
                        if (document.querySelectorAll('.admin-review-item').length === 0) {
                            document.getElementById('admin-review-list').innerHTML = '<div class="admin-review-empty">没有待审核留言</div>';
                        }
                    } else {
                        console.log('没有可用的留言精选方法');
                        // 模拟审核成功
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        showNotification('留言已精选（模拟）', 'success');
                    }
                } catch (error) {
                    console.error('精选留言失败:', error);
                    showNotification('精选留言失败: ' + error.message, 'error');
                }
            });
        });
    } catch (error) {
        console.error('加载待审核留言失败:', error);
        document.getElementById('admin-review-list').innerHTML = `
            <div class="admin-review-error">
                加载待审核留言失败: ${error.message}
            </div>
        `;
    }
}

// 加载留言列表
async function loadMessages() {
    if (isLoading) return;

    isLoading = true;

    // 显示加载中
    document.getElementById('message-list').innerHTML = `
        <div class="message-loading">
            <i class="fas fa-spinner fa-spin"></i> 加载中...
        </div>
    `;

    try {
        // 尝试使用不同的 API 获取留言
        let messages = [];
        let totalPages = 1;

        if (window.messageService && typeof window.messageService.getMessages === 'function') {
            try {
                console.log('使用 messageService.getMessages 获取留言');
                const result = await window.messageService.getMessages(currentPage, 10, currentSort);
                messages = result.messages;
                totalPages = result.totalPages;
            } catch (error) {
                console.error('使用 messageService.getMessages 获取留言失败:', error);
                // 使用页面上的示例留言
                console.log('使用页面上的示例留言');
                // 不需要实际加载，因为示例留言已经在 HTML 中
                isLoading = false;
                document.getElementById('message-list').style.display = 'block';
                return;
            }
        } else {
            console.log('没有可用的留言获取方法，使用示例留言');
            // 不需要实际加载，因为示例留言已经在 HTML 中
            isLoading = false;
            document.getElementById('message-list').style.display = 'block';
            return;
        }

        // 获取留言列表容器
        const messageList = document.getElementById('message-list');

        // 清空容器
        messageList.innerHTML = '';

        if (messages.length === 0) {
            // 没有留言
            document.getElementById('message-empty').style.display = 'block';
            document.getElementById('message-pagination').innerHTML = '';
            isLoading = false;
            return;
        }

        // 隐藏空状态
        document.getElementById('message-empty').style.display = 'none';

        // 添加留言
        messages.forEach(message => {
            const messageElement = createMessageElement(message);
            messageList.appendChild(messageElement);
        });

        // 更新分页
        updatePagination(totalPages);
    } catch (error) {
        console.error('加载留言失败:', error);
        document.getElementById('message-list').innerHTML = `
            <div class="message-error">
                加载留言失败: ${error.message}
            </div>
        `;
    } finally {
        isLoading = false;
    }
}

// 获取分类名称
function getCategoryName(category) {
    const categoryNames = {
        'general': '一般留言',
        'feedback': '功能反馈',
        'bug': '问题报告',
        'suggestion': '建议',
        'other': '其他'
    };

    return categoryNames[category] || '一般留言';
}

// 创建留言元素
function createMessageElement(message) {
    const messageElement = document.createElement('div');
    messageElement.className = 'message-item';
    messageElement.setAttribute('data-id', message.id);

    // 添加分类属性
    const category = message.category || 'general';
    messageElement.setAttribute('data-category', category);

    // 格式化时间
    let createdAt = '未知时间';
    if (message.createdAt) {
        if (message.createdAt.seconds) {
            // Firestore Timestamp 格式
            createdAt = new Date(message.createdAt.seconds * 1000).toLocaleString();
        } else if (message.createdAt instanceof Date) {
            // Date 对象
            createdAt = message.createdAt.toLocaleString();
        } else if (typeof message.createdAt === 'string') {
            // ISO 字符串
            createdAt = new Date(message.createdAt).toLocaleString();
        }
    }

    // 检查用户是否已点赞
    const hasLiked = message.likes && message.likes.includes(auth.currentUser?.uid);

    messageElement.innerHTML = `
        <div class="message-item-header">
            <div class="message-user-info">
                <div class="message-avatar">
                    ${message.userPhotoURL ? `<img src="${message.userPhotoURL}" alt="用户头像">` : message.userDisplayName.charAt(0).toUpperCase()}
                </div>
                <div>
                    <div class="message-user-name">${message.userDisplayName}</div>
                    <div class="message-time">${createdAt}</div>
                </div>
            </div>
        </div>
        <div class="message-content">${message.content}</div>
        <div class="message-footer">
            <div class="message-meta">
                <i class="fas fa-tag"></i> ${getCategoryName(category)}
            </div>
            <div class="message-actions">
            <button class="message-action-button like-button ${hasLiked ? 'liked' : ''}" data-id="${message.id}">
                <i class="fas fa-heart"></i> ${message.likeCount || 0}
            </button>
            <button class="message-action-button reply-button" data-id="${message.id}">
                <i class="fas fa-reply"></i> 回复
            </button>
            ${message.userId === auth.currentUser?.uid ? `
                <button class="message-action-button delete-button" data-id="${message.id}">
                    <i class="fas fa-trash-alt"></i> 删除
                </button>
            ` : ''}
        </div>
        ${message.replyCount > 0 ? `
            <div class="message-reply-count">
                <button class="show-replies-button" data-id="${message.id}">
                    <i class="fas fa-comments"></i> 查看${message.replyCount}条回复
                </button>
            </div>
        ` : ''}
        <div class="message-replies" id="replies-${message.id}" style="display: none;"></div>
        <div class="message-reply-form" id="reply-form-${message.id}" style="display: none;">
            <textarea class="message-textarea message-reply-textarea" placeholder="写下你的回复..." id="reply-content-${message.id}"></textarea>
            <div class="message-form-footer">
                <button class="message-submit-button submit-reply-button" data-id="${message.id}">回复</button>
                <button class="message-action-button cancel-reply-button" data-id="${message.id}">取消</button>
            </div>
        </div>
    `;

    return messageElement;
}

// 更新分页
function updatePagination(totalPages) {
    const paginationContainer = document.getElementById('message-pagination');

    // 清空容器
    paginationContainer.innerHTML = '';

    if (totalPages <= 1) {
        return;
    }

    // 添加上一页按钮
    const prevButton = document.createElement('button');
    prevButton.className = 'pagination-button prev-button';
    prevButton.textContent = '上一页';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            loadMessages();
            // 滚动到页面顶部
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
    paginationContainer.appendChild(prevButton);

    // 添加页码按钮
    const maxPageButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

    if (endPage - startPage + 1 < maxPageButtons && startPage > 1) {
        startPage = Math.max(1, endPage - maxPageButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.className = `pagination-button page-button ${i === currentPage ? 'active' : ''}`;
        pageButton.textContent = i;
        pageButton.addEventListener('click', function() {
            if (i !== currentPage) {
                currentPage = i;
                loadMessages();
                // 滚动到页面顶部
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
        paginationContainer.appendChild(pageButton);
    }

    // 添加下一页按钮
    const nextButton = document.createElement('button');
    nextButton.className = 'pagination-button next-button';
    nextButton.textContent = '下一页';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', function() {
        if (currentPage < totalPages) {
            currentPage++;
            loadMessages();
            // 滚动到页面顶部
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
    paginationContainer.appendChild(nextButton);
}

// 开始监听新留言
function startMessagesListener() {
    // 如果已经有监听器，先停止
    if (messagesListener) {
        messagesListener();
    }

    // 检查是否有可用的监听方法
    if (window.messageService && typeof window.messageService.listenToNewMessages === 'function') {
        try {
            // 开始监听
            messagesListener = window.messageService.listenToNewMessages(function(message) {
                // 如果当前是第一页且按时间排序，添加新留言
                if (currentPage === 1 && currentSort === 'time') {
                    // 获取留言列表容器
                    const messageList = document.getElementById('message-list');

                    // 隐藏空状态
                    document.getElementById('message-empty').style.display = 'none';

                    // 创建新留言元素
                    const messageElement = createMessageElement(message);

                    // 将新留言添加到列表开头
                    if (messageList.firstChild) {
                        messageList.insertBefore(messageElement, messageList.firstChild);
                    } else {
                        messageList.appendChild(messageElement);
                    }

                    // 应用当前分类筛选
                    const activeCategory = window.currentCategory || 'all';
                    const messageCategory = message.category || 'general';

                    if (activeCategory !== 'all' && messageCategory !== activeCategory) {
                        messageElement.style.display = 'none';
                    }

                    // 添加事件监听器
                    addMessageEventListeners();
                }
            });
        } catch (error) {
            console.error('监听新留言失败:', error);
        }
    } else {
        console.log('没有可用的留言监听方法');
    }
}

// 添加留言事件监听器
function addMessageEventListeners() {
    // 点赞按钮
    document.querySelectorAll('.like-button').forEach(button => {
        button.addEventListener('click', async function() {
            // 检查用户是否登录
            if (!auth.currentUser) {
                showNotification('请先登录', 'error');
                return;
            }

            const messageId = this.getAttribute('data-id');

            try {
                // 点赞/取消点赞
                const isLiked = await window.messageService.toggleLike(messageId);

                // 更新按钮样式
                if (isLiked) {
                    this.classList.add('liked');
                    // 增加点赞数
                    const likeCount = parseInt(this.textContent.trim()) || 0;
                    this.innerHTML = `<i class="fas fa-heart"></i> ${likeCount + 1}`;
                } else {
                    this.classList.remove('liked');
                    // 减少点赞数
                    const likeCount = parseInt(this.textContent.trim()) || 0;
                    this.innerHTML = `<i class="fas fa-heart"></i> ${Math.max(0, likeCount - 1)}`;
                }
            } catch (error) {
                console.error('点赞操作失败:', error);
                showNotification('点赞操作失败: ' + error.message, 'error');
            }
        });
    });

    // 回复按钮
    document.querySelectorAll('.reply-button').forEach(button => {
        button.addEventListener('click', function() {
            // 检查用户是否登录
            if (!auth.currentUser) {
                showNotification('请先登录', 'error');
                return;
            }

            const messageId = this.getAttribute('data-id');
            const replyForm = document.getElementById(`reply-form-${messageId}`);

            // 显示回复表单
            replyForm.style.display = 'block';

            // 聚焦到回复输入框
            document.getElementById(`reply-content-${messageId}`).focus();
        });
    });

    // 取消回复按钮
    document.querySelectorAll('.cancel-reply-button').forEach(button => {
        button.addEventListener('click', function() {
            const messageId = this.getAttribute('data-id');
            const replyForm = document.getElementById(`reply-form-${messageId}`);

            // 隐藏回复表单
            replyForm.style.display = 'none';

            // 清空回复内容
            document.getElementById(`reply-content-${messageId}`).value = '';
        });
    });

    // 提交回复按钮
    document.querySelectorAll('.submit-reply-button').forEach(button => {
        button.addEventListener('click', async function() {
            // 检查用户是否登录
            if (!auth.currentUser) {
                showNotification('请先登录', 'error');
                return;
            }

            const messageId = this.getAttribute('data-id');
            const replyContent = document.getElementById(`reply-content-${messageId}`).value.trim();

            // 验证内容
            if (!replyContent) {
                showNotification('请输入回复内容', 'error');
                return;
            }

            if (replyContent.length > 500) {
                showNotification('回复内容不能超过500字符', 'error');
                return;
            }

            // 禁用提交按钮
            this.disabled = true;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 提交中...';

            try {
                // 发布回复
                await window.messageService.postMessage(replyContent, messageId);

                // 清空回复内容
                document.getElementById(`reply-content-${messageId}`).value = '';

                // 隐藏回复表单
                document.getElementById(`reply-form-${messageId}`).style.display = 'none';

                // 显示成功消息
                showNotification('回复发布成功！', 'success');

                // 恢复提交按钮
                this.disabled = false;
                this.textContent = '回复';

                // 不需要重新加载留言列表，实时监听器会自动更新
                // loadMessages();
            } catch (error) {
                console.error('发布回复失败:', error);
                showNotification('发布回复失败: ' + error.message, 'error');

                // 恢复提交按钮
                this.disabled = false;
                this.textContent = '回复';
            }
        });
    });

    // 查看回复按钮
    document.querySelectorAll('.show-replies-button').forEach(button => {
        button.addEventListener('click', async function() {
            const messageId = this.getAttribute('data-id');
            const repliesContainer = document.getElementById(`replies-${messageId}`);

            // 如果回复已经显示，则隐藏
            if (repliesContainer.style.display === 'block') {
                repliesContainer.style.display = 'none';
                this.innerHTML = `<i class="fas fa-comments"></i> 查看${this.getAttribute('data-count')}条回复`;
                return;
            }

            // 显示加载中
            repliesContainer.innerHTML = `
                <div class="message-loading">
                    <i class="fas fa-spinner fa-spin"></i> 加载回复中...
                </div>
            `;
            repliesContainer.style.display = 'block';

            try {
                // 获取回复列表
                const replies = await window.messageService.getMessages(1, 'time', messageId);

                // 清空容器
                repliesContainer.innerHTML = '';

                if (replies.length === 0) {
                    // 没有回复
                    repliesContainer.innerHTML = '<div class="message-empty">暂无回复</div>';
                    return;
                }

                // 添加回复
                replies.forEach(reply => {
                    const replyElement = document.createElement('div');
                    replyElement.className = 'message-reply-item';

                    // 格式化时间
                    const createdAt = reply.createdAt ? new Date(reply.createdAt.seconds * 1000).toLocaleString() : '未知时间';

                    replyElement.innerHTML = `
                        <div class="message-user-info">
                            <div class="message-avatar">
                                ${reply.userPhotoURL ? `<img src="${reply.userPhotoURL}" alt="用户头像">` : reply.userDisplayName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div class="message-user-name">${reply.userDisplayName}</div>
                                <div class="message-time">${createdAt}</div>
                            </div>
                        </div>
                        <div class="message-content">${reply.content}</div>
                    `;

                    repliesContainer.appendChild(replyElement);
                });

                // 更新按钮文本
                this.innerHTML = `<i class="fas fa-comments"></i> 收起回复`;
                this.setAttribute('data-count', replies.length);
            } catch (error) {
                console.error('加载回复失败:', error);
                repliesContainer.innerHTML = `
                    <div class="message-error">
                        加载回复失败: ${error.message}
                    </div>
                `;
            }
        });
    });

    // 删除按钮
    document.querySelectorAll('.delete-button').forEach(button => {
        button.addEventListener('click', async function() {
            // 检查用户是否登录
            if (!auth.currentUser) {
                showNotification('请先登录', 'error');
                return;
            }

            const messageId = this.getAttribute('data-id');

            // 确认删除
            if (!confirm('确定要删除这条留言吗？')) {
                return;
            }

            try {
                // 删除留言
                await window.messageService.deleteMessage(messageId);

                // 移除留言元素
                document.querySelector(`.message-item[data-id="${messageId}"]`).remove();

                // 显示成功消息
                showNotification('留言已删除', 'success');

                // 检查是否还有留言
                if (document.querySelectorAll('.message-item').length === 0) {
                    document.getElementById('message-empty').style.display = 'block';
                }
            } catch (error) {
                console.error('删除留言失败:', error);
                showNotification('删除留言失败: ' + error.message, 'error');
            }
        });
    });
}

// 显示通知
function showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = message;

    // 添加到页面
    document.body.appendChild(notification);

    // 显示通知
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    // 3秒后隐藏通知
    setTimeout(() => {
        notification.classList.remove('show');

        // 动画结束后移除元素
        notification.addEventListener('transitionend', function() {
            notification.remove();
        });
    }, 3000);
}
