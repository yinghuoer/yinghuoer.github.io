// 管理员页面脚本

// 确保 Firebase 服务已加载
if (!window.firebaseService) {
    console.error('Firebase 服务未加载');
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', async function() {
    // 等待用户认证状态
    // 使用统一的 Firebase 实例
    const { auth } = window.firebaseInstances;
    auth.onAuthStateChanged(async function(user) {
        if (user) {
            try {
                // 检查用户是否是管理员
                const isAdmin = await window.firebaseService.checkUserRoleLevel(window.firebaseService.USER_ROLES.ADMIN);

                if (isAdmin) {
                    // 如果是管理员，显示管理员内容
                    document.getElementById('admin-content').style.display = 'block';
                    document.getElementById('unauthorized-content').style.display = 'none';

                    // 加载管理员内容
                    loadAdminContent();
                } else {
                    // 如果不是管理员，显示未授权内容
                    document.getElementById('admin-content').style.display = 'none';
                    document.getElementById('unauthorized-content').style.display = 'block';
                }
            } catch (error) {
                console.error('检查管理员权限失败:', error);
                showError('检查管理员权限失败: ' + error.message);
            }
        } else {
            // 用户未登录，显示未授权内容
            document.getElementById('admin-content').style.display = 'none';
            document.getElementById('unauthorized-content').style.display = 'block';
        }
    });
});

// 显示错误消息
function showError(message) {
    const errorElement = document.getElementById('admin-error');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';

        // 5秒后自动隐藏错误消息
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }
}

// 显示成功消息
function showMessage(message) {
    const messageElement = document.getElementById('admin-message');
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.style.display = 'block';

        // 5秒后自动隐藏成功消息
        setTimeout(() => {
            messageElement.style.display = 'none';
        }, 5000);
    }
}

// 加载管理员内容
function loadAdminContent() {
    const adminContent = document.getElementById('admin-content');
    if (!adminContent) return;

    // 清空内容
    adminContent.innerHTML = '';

    // 创建用户管理部分
    const userManagementSection = document.createElement('div');
    userManagementSection.className = 'admin-section';
    userManagementSection.innerHTML = `
        <h3>用户管理</h3>
        <div class="admin-filters">
            <div class="admin-search">
                <input type="text" id="user-search" placeholder="搜索用户...">
            </div>
            <div class="admin-filter">
                <select id="role-filter">
                    <option value="">所有角色</option>
                    <option value="user">普通用户</option>
                    <option value="bronze">青铜用户</option>
                    <option value="silver">白银用户</option>
                    <option value="gold">黄金用户</option>
                    <option value="admin">管理员</option>
                </select>
            </div>
        </div>
        <div class="users-table-container">
            <table class="users-table">
                <thead>
                    <tr>
                        <th>用户ID</th>
                        <th>邮箱</th>
                        <th>用户名</th>
                        <th>角色</th>
                        <th>注册时间</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody id="users-table-body">
                    <tr>
                        <td colspan="6" class="loading-cell">
                            <div class="loading-spinner">
                                <i class="fas fa-spinner fa-spin"></i> 加载中...
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="admin-pagination" id="users-pagination">
            <!-- 分页按钮将通过JavaScript动态生成 -->
        </div>
    `;

    adminContent.appendChild(userManagementSection);

    // 加载用户数据
    loadUsers();

    // 添加搜索和过滤功能
    const userSearch = document.getElementById('user-search');
    const roleFilter = document.getElementById('role-filter');

    if (userSearch) {
        userSearch.addEventListener('input', function() {
            loadUsers();
        });
    }

    if (roleFilter) {
        roleFilter.addEventListener('change', function() {
            loadUsers();
        });
    }
}

// 当前页码和每页显示数量
let currentPage = 1;
const itemsPerPage = 10;

// 加载用户数据
async function loadUsers() {
    const tableBody = document.getElementById('users-table-body');
    if (!tableBody) return;

    // 显示加载中
    tableBody.innerHTML = `
        <tr>
            <td colspan="6" class="loading-cell">
                <div class="loading-spinner">
                    <i class="fas fa-spinner fa-spin"></i> 加载中...
                </div>
            </td>
        </tr>
    `;

    // 获取搜索和过滤条件
    const searchTerm = document.getElementById('user-search')?.value.toLowerCase() || '';
    const roleFilter = document.getElementById('role-filter')?.value || '';

    try {
        // 使用新的 firebaseService 获取用户
        let users;

        if (searchTerm || roleFilter) {
            // 如果有搜索或过滤条件，使用搜索函数
            users = await window.firebaseService.searchUsers(searchTerm, roleFilter);
        } else {
            // 否则获取所有用户
            users = await window.firebaseService.getAllUsers(itemsPerPage, null);
        }

        // 如果没有用户
        if (!users || users.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-cell">
                        没有找到用户
                    </td>
                </tr>
            `;

            // 清空分页
            document.getElementById('users-pagination').innerHTML = '';

            return;
        }

        // 按注册时间排序（最新的在前面）
        users.sort((a, b) => {
            const timeA = a.createdAt ? (a.createdAt.seconds ? a.createdAt.seconds * 1000 : a.createdAt) : 0;
            const timeB = b.createdAt ? (b.createdAt.seconds ? b.createdAt.seconds * 1000 : b.createdAt) : 0;
            return timeB - timeA;
        });

        // 计算总页数
        const totalPages = Math.ceil(users.length / itemsPerPage);

        // 确保当前页码有效
        if (currentPage > totalPages) {
            currentPage = totalPages || 1;
        }

        // 分页
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedUsers = users.slice(startIndex, endIndex);

        // 生成表格内容
        let tableContent = '';

        paginatedUsers.forEach(user => {
            // 格式化创建时间
            let createdAt = '未知';
            if (user.createdAt) {
                const date = user.createdAt.seconds ?
                    new Date(user.createdAt.seconds * 1000) :
                    new Date(user.createdAt);
                createdAt = date.toLocaleString();
            }

            // 昵称历史记录数量
            const nameHistoryCount = user.nameHistory ? user.nameHistory.length : 0;

            tableContent += `
                <tr>
                    <td>${user.id}</td>
                    <td>${user.email}</td>
                    <td>
                        ${user.displayName || '未设置'}
                        ${nameHistoryCount > 0 ? `<span class="history-badge" title="有${nameHistoryCount}条昵称历史"><i class="fas fa-history"></i></span>` : ''}
                    </td>
                    <td>
                        <select class="user-role-select" data-uid="${user.id}">
                            <option value="user" ${user.role === 'user' ? 'selected' : ''}>普通用户</option>
                            <option value="bronze" ${user.role === 'bronze' ? 'selected' : ''}>青铜用户</option>
                            <option value="silver" ${user.role === 'silver' ? 'selected' : ''}>白银用户</option>
                            <option value="gold" ${user.role === 'gold' ? 'selected' : ''}>黄金用户</option>
                            <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>管理员</option>
                        </select>
                    </td>
                    <td>${createdAt}</td>
                    <td>
                        <button class="user-action-button save-role-button" data-uid="${user.id}">保存</button>
                    </td>
                </tr>
            `;
        });

        tableBody.innerHTML = tableContent;

        // 添加保存角色按钮事件
        document.querySelectorAll('.save-role-button').forEach(button => {
            button.addEventListener('click', async function() {
                const uid = this.getAttribute('data-uid');
                const roleSelect = document.querySelector(`.user-role-select[data-uid="${uid}"]`);

                if (uid && roleSelect) {
                    const newRole = roleSelect.value;

                    // 禁用按钮，防止重复点击
                    this.disabled = true;
                    this.textContent = '保存中...';

                    try {
                        // 设置用户角色
                        await window.firebaseService.setUserRole(uid, newRole);

                        // 更新成功
                        showMessage(`用户角色已更新为 ${newRole}`);

                        // 恢复按钮
                        this.disabled = false;
                        this.textContent = '已保存';

                        // 2秒后恢复按钮文本
                        setTimeout(() => {
                            this.textContent = '保存';
                        }, 2000);
                    } catch (error) {
                        console.error('更新用户角色失败:', error);
                        showError('更新用户角色失败: ' + error.message);

                        // 恢复按钮
                        this.disabled = false;
                        this.textContent = '保存';
                    }
                }
            });
        });

        // 更新分页
        updatePagination(totalPages);
    } catch (error) {
        console.error('获取用户失败:', error);
        showError('获取用户失败: ' + error.message);

        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="error-cell">
                    加载用户失败: ${error.message}
                </td>
            </tr>
        `;
    }
}

// 更新分页
function updatePagination(totalPages) {
    const paginationContainer = document.getElementById('users-pagination');
    if (!paginationContainer) return;

    // 清空分页
    paginationContainer.innerHTML = '';

    // 如果只有一页，不显示分页
    if (totalPages <= 1) return;

    // 添加上一页按钮
    const prevButton = document.createElement('button');
    prevButton.className = 'pagination-button prev-button';
    prevButton.textContent = '上一页';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            loadUsers();
        }
    });
    paginationContainer.appendChild(prevButton);

    // 添加页码按钮
    const maxPageButtons = 5; // 最多显示5个页码按钮
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

    // 调整startPage，确保显示maxPageButtons个按钮
    if (endPage - startPage + 1 < maxPageButtons && startPage > 1) {
        startPage = Math.max(1, endPage - maxPageButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.className = `pagination-button page-button ${i === currentPage ? 'active' : ''}`;
        pageButton.textContent = i;
        pageButton.addEventListener('click', function() {
            currentPage = i;
            loadUsers();
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
            loadUsers();
        }
    });
    paginationContainer.appendChild(nextButton);
}
