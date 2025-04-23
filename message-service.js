// 留言板服务类 - 处理所有留言相关操作

// 使用统一的 Firebase 实例
const { auth, db, storage } = window.firebaseInstances;

// 留言状态
const MESSAGE_STATUS = {
    PENDING: 'pending',    // 待审核
    APPROVED: 'approved',  // 已批准
    REJECTED: 'rejected'   // 已拒绝
};

// 每页留言数量
const MESSAGES_PER_PAGE = 10;

/**
 * 发布新留言
 * @param {string} content - 留言内容
 * @param {string} parentId - 父留言ID（可选，用于回复）
 * @returns {Promise<string>} - 新留言ID
 */
async function postMessage(content, parentId = null) {
    try {
        // 检查用户是否登录
        const user = auth.currentUser;
        if (!user) {
            throw new Error('请先登录');
        }

        // 检查内容是否为空
        if (!content || content.trim() === '') {
            throw new Error('留言内容不能为空');
        }

        // 获取用户数据
        const userData = await db.collection('users').doc(user.uid).get();
        if (!userData.exists) {
            throw new Error('用户数据不存在');
        }

        const userInfo = userData.data();

        // 检查用户权限，决定留言状态
        let status = MESSAGE_STATUS.PENDING;

        // 如果用户是青铜及以上级别，留言直接批准
        if (userInfo.role && ['bronze', 'silver', 'gold', 'admin'].includes(userInfo.role)) {
            status = MESSAGE_STATUS.APPROVED;
        }

        // 如果是回复，检查父留言是否存在
        if (parentId) {
            const parentMessage = await db.collection('messages').doc(parentId).get();
            if (!parentMessage.exists) {
                throw new Error('回复的留言不存在');
            }

            // 更新父留言的回复计数
            await db.collection('messages').doc(parentId).update({
                replyCount: firebase.firestore.FieldValue.increment(1)
            });
        }

        // 创建新留言
        const messageData = {
            content: content.trim(),
            userId: user.uid,
            userDisplayName: userInfo.displayName || user.email,
            userPhotoURL: userInfo.photoURL || null,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            likes: [],
            likeCount: 0,
            parentId: parentId,
            replyCount: 0,
            status: status
        };

        // 添加到Firestore
        const messageRef = await db.collection('messages').add(messageData);

        // 更新用户活跃时间
        if (window.firebaseService) {
            window.firebaseService.updateUserActivity(user.uid);
        }

        return messageRef.id;
    } catch (error) {
        console.error('发布留言失败:', error);
        throw error;
    }
}

/**
 * 获取留言列表
 * @param {number} page - 页码
 * @param {string} sortBy - 排序方式（time/likes）
 * @param {string} parentId - 父留言ID（可选，用于获取回复）
 * @returns {Promise<Array>} - 留言数组
 */
async function getMessages(page = 1, sortBy = 'time', parentId = null) {
    try {
        // 构建查询
        let query = db.collection('messages')
            .where('status', '==', MESSAGE_STATUS.APPROVED);

        // 如果是获取回复，添加parentId条件
        if (parentId) {
            query = query.where('parentId', '==', parentId);
        } else {
            // 如果是获取主留言，只获取parentId为null的
            query = query.where('parentId', '==', null);
        }

        // 根据排序方式设置排序
        if (sortBy === 'likes') {
            query = query.orderBy('likeCount', 'desc').orderBy('createdAt', 'desc');
        } else {
            query = query.orderBy('createdAt', 'desc');
        }

        // 分页
        const startIndex = (page - 1) * MESSAGES_PER_PAGE;
        query = query.limit(MESSAGES_PER_PAGE);

        // 执行查询
        const snapshot = await query.get();

        // 处理结果
        const messages = [];
        snapshot.forEach(doc => {
            messages.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return messages;
    } catch (error) {
        console.error('获取留言失败:', error);
        throw error;
    }
}

/**
 * 获取待审核留言
 * @param {number} page - 页码
 * @returns {Promise<Array>} - 留言数组
 */
async function getPendingMessages(page = 1) {
    try {
        // 检查用户是否是管理员
        const user = auth.currentUser;
        if (!user) {
            throw new Error('请先登录');
        }

        // 检查用户权限
        const isAdmin = await window.firebaseService.checkUserRoleLevel(window.firebaseService.USER_ROLES.ADMIN);
        if (!isAdmin) {
            throw new Error('权限不足');
        }

        // 构建查询
        let query = db.collection('messages')
            .where('status', '==', MESSAGE_STATUS.PENDING)
            .orderBy('createdAt', 'desc');

        // 分页
        const startIndex = (page - 1) * MESSAGES_PER_PAGE;
        query = query.limit(MESSAGES_PER_PAGE);

        // 执行查询
        const snapshot = await query.get();

        // 处理结果
        const messages = [];
        snapshot.forEach(doc => {
            messages.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return messages;
    } catch (error) {
        console.error('获取待审核留言失败:', error);
        throw error;
    }
}

/**
 * 审核留言
 * @param {string} messageId - 留言ID
 * @param {boolean} approve - 是否批准
 * @returns {Promise} - Firestore操作Promise
 */
async function reviewMessage(messageId, approve) {
    try {
        // 检查用户是否是管理员
        const user = auth.currentUser;
        if (!user) {
            throw new Error('请先登录');
        }

        // 检查用户权限
        const isAdmin = await window.firebaseService.checkUserRoleLevel(window.firebaseService.USER_ROLES.ADMIN);
        if (!isAdmin) {
            throw new Error('权限不足');
        }

        // 更新留言状态
        return db.collection('messages').doc(messageId).update({
            status: approve ? MESSAGE_STATUS.APPROVED : MESSAGE_STATUS.REJECTED,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error('审核留言失败:', error);
        throw error;
    }
}

/**
 * 删除留言
 * @param {string} messageId - 留言ID
 * @returns {Promise} - Firestore操作Promise
 */
async function deleteMessage(messageId) {
    try {
        // 检查用户是否登录
        const user = auth.currentUser;
        if (!user) {
            throw new Error('请先登录');
        }

        // 获取留言数据
        const messageDoc = await db.collection('messages').doc(messageId).get();
        if (!messageDoc.exists) {
            throw new Error('留言不存在');
        }

        const messageData = messageDoc.data();

        // 检查用户权限
        const isAdmin = await window.firebaseService.checkUserRoleLevel(window.firebaseService.USER_ROLES.ADMIN);
        if (messageData.userId !== user.uid && !isAdmin) {
            throw new Error('权限不足');
        }

        // 如果有父留言，更新父留言的回复计数
        if (messageData.parentId) {
            await db.collection('messages').doc(messageData.parentId).update({
                replyCount: firebase.firestore.FieldValue.increment(-1)
            });
        }

        // 删除留言
        return db.collection('messages').doc(messageId).delete();
    } catch (error) {
        console.error('删除留言失败:', error);
        throw error;
    }
}

/**
 * 点赞/取消点赞留言
 * @param {string} messageId - 留言ID
 * @returns {Promise<boolean>} - 是否点赞
 */
async function toggleLike(messageId) {
    try {
        // 检查用户是否登录
        const user = auth.currentUser;
        if (!user) {
            throw new Error('请先登录');
        }

        // 获取留言数据
        const messageRef = db.collection('messages').doc(messageId);
        const messageDoc = await messageRef.get();

        if (!messageDoc.exists) {
            throw new Error('留言不存在');
        }

        const messageData = messageDoc.data();

        // 检查用户是否已点赞
        const likes = messageData.likes || [];
        const hasLiked = likes.includes(user.uid);

        // 更新点赞状态
        if (hasLiked) {
            // 取消点赞
            await messageRef.update({
                likes: firebase.firestore.FieldValue.arrayRemove(user.uid),
                likeCount: firebase.firestore.FieldValue.increment(-1)
            });
            return false;
        } else {
            // 点赞
            await messageRef.update({
                likes: firebase.firestore.FieldValue.arrayUnion(user.uid),
                likeCount: firebase.firestore.FieldValue.increment(1)
            });
            return true;
        }
    } catch (error) {
        console.error('点赞操作失败:', error);
        throw error;
    }
}

/**
 * 检查用户是否已点赞
 * @param {string} messageId - 留言ID
 * @returns {Promise<boolean>} - 是否已点赞
 */
async function hasLiked(messageId) {
    try {
        // 检查用户是否登录
        const user = auth.currentUser;
        if (!user) {
            return false;
        }

        // 获取留言数据
        const messageDoc = await db.collection('messages').doc(messageId).get();
        if (!messageDoc.exists) {
            return false;
        }

        const messageData = messageDoc.data();
        const likes = messageData.likes || [];

        return likes.includes(user.uid);
    } catch (error) {
        console.error('检查点赞状态失败:', error);
        return false;
    }
}

/**
 * 获取留言总数
 * @param {string} parentId - 父留言ID（可选，用于获取回复数）
 * @returns {Promise<number>} - 留言总数
 */
async function getMessageCount(parentId = null) {
    try {
        // 构建查询
        let query = db.collection('messages')
            .where('status', '==', MESSAGE_STATUS.APPROVED);

        // 如果是获取回复，添加parentId条件
        if (parentId) {
            query = query.where('parentId', '==', parentId);
        } else {
            // 如果是获取主留言，只获取parentId为null的
            query = query.where('parentId', '==', null);
        }

        // 执行查询
        const snapshot = await query.count().get();
        return snapshot.data().count;
    } catch (error) {
        console.error('获取留言总数失败:', error);
        throw error;
    }
}

/**
 * 实时监听新留言
 * @param {function} callback - 回调函数，接收新留言数组
 * @param {string} parentId - 父留言ID（可选，用于监听回复）
 * @returns {function} - 取消监听的函数
 */
function listenToNewMessages(callback, parentId = null) {
    try {
        // 构建查询
        let query = db.collection('messages')
            .where('status', '==', MESSAGE_STATUS.APPROVED);

        // 如果是监听回复，添加parentId条件
        if (parentId) {
            query = query.where('parentId', '==', parentId);
        } else {
            // 如果是监听主留言，只监听parentId为null的
            query = query.where('parentId', '==', null);
        }

        // 按创建时间排序，最新的在前面
        query = query.orderBy('createdAt', 'desc');

        // 限制返回数量
        query = query.limit(MESSAGES_PER_PAGE);

        // 开始监听
        return query.onSnapshot(snapshot => {
            const messages = [];
            snapshot.forEach(doc => {
                messages.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            callback(messages);
        });
    } catch (error) {
        console.error('监听新留言失败:', error);
        throw error;
    }
}

// 导出函数
window.messageService = {
    MESSAGE_STATUS,
    MESSAGES_PER_PAGE,
    postMessage,
    getMessages,
    getPendingMessages,
    reviewMessage,
    deleteMessage,
    toggleLike,
    hasLiked,
    getMessageCount,
    listenToNewMessages
};
