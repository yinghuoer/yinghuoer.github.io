/**
 * 使用 Firebase REST API 处理留言相关的功能
 * 这个文件提供与原来 messageService 相同的接口，但使用 REST API 与 Firestore 通信
 */

// 初始化 Firebase
const auth = firebase.auth();

/**
 * 获取留言列表
 * @param {number} page - 页码
 * @param {number} limit - 每页数量
 * @param {string} sortBy - 排序方式 ('time' 或 'likes')
 * @returns {Promise<Object>} - 包含留言列表和总页数的对象
 */
async function getMessages(page = 1, limit = 10, sortBy = 'time') {
    console.log('获取留言列表:', page, limit, sortBy);

    try {
        // 获取用户认证令牌
        const user = firebase.auth().currentUser;
        let idToken = null;

        if (user) {
            idToken = await user.getIdToken(true);
        }

        // 构建 REST API URL
        const projectId = 'missfoxcounter';
        const databaseId = 'missfoxsanuser';
        const collectionName = 'messages';

        // 计算分页参数
        const offset = (page - 1) * limit;

        // 构建查询参数
        let url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/${collectionName}`;

        // 发送 REST API 请求
        const response = await fetch(url, {
            method: 'GET',
            headers: idToken ? {
                'Authorization': `Bearer ${idToken}`
            } : {}
        });

        if (!response.ok) {
            throw new Error(`获取留言列表失败: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('获取留言列表成功:', data);

        // 转换 Firestore REST API 格式为普通对象
        let messages = [];
        if (data.documents) {
            messages = data.documents.map(doc => {
                const id = doc.name.split('/').pop();
                const messageData = convertFirestoreDocumentToObject(doc);
                return { id, ...messageData };
            });

            // 根据排序方式排序
            if (sortBy === 'time') {
                messages.sort((a, b) => {
                    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                    return timeB - timeA; // 降序，最新的在前面
                });
            } else if (sortBy === 'likes') {
                messages.sort((a, b) => {
                    const likesA = a.likes ? a.likes.length : 0;
                    const likesB = b.likes ? b.likes.length : 0;
                    return likesB - likesA; // 降序，点赞多的在前面
                });
            }

            // 分页
            messages = messages.slice(offset, offset + limit);
        }

        // 计算总页数
        const totalMessages = data.documents ? data.documents.length : 0;
        const totalPages = Math.ceil(totalMessages / limit);

        return {
            messages,
            totalPages
        };
    } catch (error) {
        console.error('获取留言列表失败:', error);
        throw error;
    }
}

/**
 * 发布留言
 * @param {Object} messageData - 留言数据
 * @returns {Promise<string>} - 留言ID
 */
async function postMessage(messageData) {
    console.log('发布留言:', messageData);

    try {
        // 检查用户是否登录
        const user = firebase.auth().currentUser;
        if (!user) {
            throw new Error('用户未登录');
        }

        const idToken = await user.getIdToken(true);

        // 构建 REST API URL
        const projectId = 'missfoxcounter';
        const databaseId = 'missfoxsanuser';
        const collectionName = 'messages';

        const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/${collectionName}`;

        console.log('发送 POST 请求到:', url);

        // 准备数据
        const now = new Date().toISOString();
        const data = {
            fields: {
                content: { stringValue: messageData.content },
                category: { stringValue: messageData.category || 'general' },
                userId: { stringValue: user.uid },
                userDisplayName: { stringValue: user.displayName || user.email.split('@')[0] },
                userEmail: { stringValue: user.email },
                userPhotoURL: user.photoURL ? { stringValue: user.photoURL } : { nullValue: null },
                createdAt: { timestampValue: now },
                updatedAt: { timestampValue: now },
                status: { stringValue: 'pending' }, // 默认为待审核状态
                likes: { arrayValue: { values: [] } },
                replies: { arrayValue: { values: [] } }
            }
        };

        console.log('请求数据:', JSON.stringify(data, null, 2));

        // 发送 REST API 请求
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`发布留言失败: ${response.status} ${response.statusText}`);
        }

        const responseData = await response.json();
        console.log('发布留言成功:', responseData);

        // 从响应中提取留言ID
        const messageId = responseData.name.split('/').pop();

        return messageId;
    } catch (error) {
        console.error('发布留言失败:', error);
        throw error;
    }
}

/**
 * 点赞/取消点赞
 * @param {string} messageId - 留言ID
 * @returns {Promise<boolean>} - 是否点赞
 */
async function toggleLike(messageId) {
    console.log('点赞/取消点赞:', messageId);

    try {
        // 检查用户是否登录
        const user = firebase.auth().currentUser;
        if (!user) {
            throw new Error('用户未登录');
        }

        const idToken = await user.getIdToken(true);

        // 构建 REST API URL
        const projectId = 'missfoxcounter';
        const databaseId = 'missfoxsanuser';
        const collectionName = 'messages';

        // 首先获取当前留言数据
        const getUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/${collectionName}/${messageId}`;

        console.log('发送 GET 请求到:', getUrl);

        // 发送 GET 请求
        const getResponse = await fetch(getUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${idToken}`
            }
        });

        if (!getResponse.ok) {
            throw new Error(`获取留言数据失败: ${getResponse.status} ${getResponse.statusText}`);
        }

        const messageData = await getResponse.json();
        console.log('获取留言数据成功:', messageData);

        // 转换 Firestore REST API 格式为普通对象
        const message = convertFirestoreDocumentToObject(messageData);

        // 检查用户是否已点赞
        const likes = message.likes || [];
        const userIndex = likes.indexOf(user.uid);

        // 更新点赞数组
        let isLiked = false;
        if (userIndex === -1) {
            // 添加点赞
            likes.push(user.uid);
            isLiked = true;
        } else {
            // 取消点赞
            likes.splice(userIndex, 1);
            isLiked = false;
        }

        // 构建更新请求
        const updateUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/${collectionName}/${messageId}?updateMask.fieldPaths=likes`;

        console.log('发送 PATCH 请求到:', updateUrl);

        // 准备数据
        const data = {
            fields: {
                likes: {
                    arrayValue: {
                        values: likes.map(uid => ({ stringValue: uid }))
                    }
                }
            }
        };

        console.log('请求数据:', JSON.stringify(data, null, 2));

        // 发送 PATCH 请求
        const updateResponse = await fetch(updateUrl, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify(data)
        });

        if (!updateResponse.ok) {
            throw new Error(`更新点赞状态失败: ${updateResponse.status} ${updateResponse.statusText}`);
        }

        const updateData = await updateResponse.json();
        console.log('更新点赞状态成功:', updateData);

        return isLiked;
    } catch (error) {
        console.error('点赞/取消点赞失败:', error);
        throw error;
    }
}

/**
 * 审核留言
 * @param {string} messageId - 留言ID
 * @param {string} status - 审核状态 ('approved' 或 'rejected')
 * @param {boolean} featured - 是否精选
 * @returns {Promise<boolean>} - 操作是否成功
 */
async function reviewMessage(messageId, status, featured = false) {
    console.log('审核留言:', messageId, status, featured ? '精选' : '');

    try {
        // 检查用户是否登录
        const user = firebase.auth().currentUser;
        if (!user) {
            throw new Error('用户未登录');
        }

        // 检查用户是否是管理员
        const isAdmin = await window.firestoreUserApi.checkUserRoleLevel(window.firestoreUserApi.USER_ROLES.ADMIN);
        if (!isAdmin) {
            throw new Error('没有权限审核留言');
        }

        const idToken = await user.getIdToken(true);

        // 构建 REST API URL
        const projectId = 'missfoxcounter';
        const databaseId = 'missfoxsanuser';
        const collectionName = 'messages';

        let url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/${collectionName}/${messageId}?updateMask.fieldPaths=status&updateMask.fieldPaths=reviewedBy&updateMask.fieldPaths=reviewedAt`;

        // 如果是精选，添加 featured 字段
        if (featured) {
            url += '&updateMask.fieldPaths=featured';
        }

        console.log('发送 PATCH 请求到:', url);

        // 准备数据
        const now = new Date().toISOString();
        const data = {
            fields: {
                status: { stringValue: status },
                reviewedBy: { stringValue: user.uid },
                reviewedAt: { timestampValue: now }
            }
        };

        // 如果是精选，添加 featured 字段
        if (featured) {
            data.fields.featured = { booleanValue: true };
        }

        console.log('请求数据:', JSON.stringify(data, null, 2));

        // 发送 PATCH 请求
        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`审核留言失败: ${response.status} ${response.statusText}`);
        }

        const responseData = await response.json();
        console.log('审核留言成功:', responseData);

        return true;
    } catch (error) {
        console.error('审核留言失败:', error);
        throw error;
    }
}

/**
 * 获取精选留言
 * @returns {Promise<Array>} - 精选留言列表
 */
async function getFeaturedMessages() {
    console.log('获取精选留言');

    try {
        // 获取用户认证令牌
        const user = firebase.auth().currentUser;
        let idToken = null;

        if (user) {
            idToken = await user.getIdToken(true);
        }

        // 构建 REST API URL
        const projectId = 'missfoxcounter';
        const databaseId = 'missfoxsanuser';
        const collectionName = 'messages';

        // 构建查询参数
        const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/${collectionName}`;

        console.log('发送 GET 请求到:', url);

        // 发送 GET 请求
        const response = await fetch(url, {
            method: 'GET',
            headers: idToken ? {
                'Authorization': `Bearer ${idToken}`
            } : {}
        });

        if (!response.ok) {
            throw new Error(`获取精选留言失败: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('获取留言数据成功:', data);

        // 转换 Firestore REST API 格式为普通对象
        let messages = [];
        if (data.documents) {
            messages = data.documents.map(doc => {
                const id = doc.name.split('/').pop();
                const messageData = convertFirestoreDocumentToObject(doc);
                return { id, ...messageData };
            });

            // 过滤出精选留言
            messages = messages.filter(message => message.featured === true && message.status === 'approved');

            // 按时间排序
            messages.sort((a, b) => {
                const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return timeB - timeA; // 降序，最新的在前面
            });
        }

        return messages;
    } catch (error) {
        console.error('获取精选留言失败:', error);
        throw error;
    }
}

/**
 * 获取待审核留言
 * @returns {Promise<Array>} - 待审核留言列表
 */
async function getPendingMessages() {
    console.log('获取待审核留言');

    try {
        // 检查用户是否登录
        const user = firebase.auth().currentUser;
        if (!user) {
            throw new Error('用户未登录');
        }

        // 检查用户是否是管理员
        const isAdmin = await window.firestoreUserApi.checkUserRoleLevel(window.firestoreUserApi.USER_ROLES.ADMIN);
        if (!isAdmin) {
            throw new Error('没有权限获取待审核留言');
        }

        const idToken = await user.getIdToken(true);

        // 构建 REST API URL
        const projectId = 'missfoxcounter';
        const databaseId = 'missfoxsanuser';
        const collectionName = 'messages';

        // 构建查询参数
        const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/${collectionName}`;

        console.log('发送 GET 请求到:', url);

        // 发送 GET 请求
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${idToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`获取待审核留言失败: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('获取留言数据成功:', data);

        // 转换 Firestore REST API 格式为普通对象
        let messages = [];
        if (data.documents) {
            messages = data.documents.map(doc => {
                const id = doc.name.split('/').pop();
                const messageData = convertFirestoreDocumentToObject(doc);
                return { id, ...messageData };
            });

            // 过滤出待审核留言
            messages = messages.filter(message => message.status === 'pending');

            // 按时间排序
            messages.sort((a, b) => {
                const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return timeB - timeA; // 降序，最新的在前面
            });
        }

        return messages;
    } catch (error) {
        console.error('获取待审核留言失败:', error);
        throw error;
    }
}

/**
 * 监听新留言
 * @param {Function} callback - 回调函数，接收新留言作为参数
 * @returns {Function} - 取消监听的函数
 */
function listenToNewMessages(callback) {
    console.log('开始监听新留言');

    // 由于 REST API 不支持实时监听，我们使用轮询方式模拟
    let lastFetchTime = new Date().getTime();

    // 每 10 秒检查一次新留言
    const intervalId = setInterval(async () => {
        try {
            // 获取最新留言
            const result = await getMessages(1, 10, 'time');

            // 确保 messages 是数组
            const messages = result.messages || [];

            // 过滤出新留言
            const newMessages = messages.filter(message => {
                const messageTime = message.createdAt ? new Date(message.createdAt).getTime() : 0;
                return messageTime > lastFetchTime;
            });

            // 更新最后获取时间
            if (newMessages.length > 0) {
                lastFetchTime = new Date().getTime();

                // 调用回调函数
                for (const message of newMessages) {
                    callback(message);
                }
            }
        } catch (error) {
            console.error('监听新留言失败:', error);
        }
    }, 10000);

    // 返回取消监听的函数
    return function() {
        clearInterval(intervalId);
        console.log('停止监听新留言');
    };
}

/**
 * 将 Firestore REST API 格式的文档转换为普通对象
 * @param {Object} document - Firestore REST API 格式的文档
 * @returns {Object} - 普通对象
 */
function convertFirestoreDocumentToObject(document) {
    if (!document || !document.fields) {
        return null;
    }

    const result = {};

    for (const [key, value] of Object.entries(document.fields)) {
        result[key] = convertFirestoreValueToNative(value);
    }

    return result;
}

/**
 * 将 Firestore REST API 格式的值转换为原生 JavaScript 值
 * @param {Object} value - Firestore REST API 格式的值
 * @returns {*} - 原生 JavaScript 值
 */
function convertFirestoreValueToNative(value) {
    if (value.stringValue !== undefined) {
        return value.stringValue;
    } else if (value.integerValue !== undefined) {
        return parseInt(value.integerValue, 10);
    } else if (value.doubleValue !== undefined) {
        return parseFloat(value.doubleValue);
    } else if (value.booleanValue !== undefined) {
        return value.booleanValue;
    } else if (value.nullValue !== undefined) {
        return null;
    } else if (value.timestampValue !== undefined) {
        return new Date(value.timestampValue);
    } else if (value.arrayValue !== undefined) {
        return (value.arrayValue.values || []).map(convertFirestoreValueToNative);
    } else if (value.mapValue !== undefined) {
        return convertFirestoreDocumentToObject(value.mapValue);
    } else {
        return null;
    }
}

// 导出函数
window.messageService = {
    getMessages,
    postMessage,
    toggleLike,
    reviewMessage,
    getPendingMessages,
    getFeaturedMessages,
    listenToNewMessages
};

console.log('Message Service REST 初始化完成');
