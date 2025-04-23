/**
 * 留言板服务
 * 处理留言的获取、发布、审核等功能
 */

// 使用立即执行函数表达式(IIFE)创建一个独立的作用域
(function() {
    // 每页显示的留言数量
    const MESSAGES_PER_PAGE = 10;

    // 获取 Firestore 实例
    let messageDb;
    try {
        // 尝试使用 window.firebaseInstances.db
        if (window.firebaseInstances && window.firebaseInstances.db) {
            messageDb = window.firebaseInstances.db;
            console.log('使用 window.firebaseInstances.db 初始化 messageDb');
        } else {
            // 如果不存在，直接初始化
            messageDb = firebase.firestore();
            console.log('使用 firebase.firestore() 初始化 messageDb');
        }
    } catch (error) {
        console.error('初始化 Firestore 失败:', error);
        // 创建一个空对象作为后备
        messageDb = {};
    }

    /**
     * 获取留言列表
     * @param {number} page - 页码
     * @param {string} sortBy - 排序方式，'time'或'likes'
     * @returns {Promise<Array>} - 留言列表
     */
    async function getMessages(page = 1, sortBy = 'time') {
        try {
            console.log(`获取第 ${page} 页留言，排序方式: ${sortBy}`);
            
            // 构建查询
            let query = messageDb.collection('messages')
                .where('status', '==', 'approved');
            
            // 根据排序方式设置排序
            if (sortBy === 'likes') {
                query = query.orderBy('likeCount', 'desc').orderBy('createdAt', 'desc');
            } else {
                query = query.orderBy('createdAt', 'desc');
            }
            
            // 分页
            query = query.limit(MESSAGES_PER_PAGE).offset((page - 1) * MESSAGES_PER_PAGE);
            
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
            
            console.log(`获取到 ${messages.length} 条留言`);
            return messages;
        } catch (error) {
            console.error('获取留言失败:', error);
            throw error;
        }
    }

    /**
     * 获取待审核的留言列表
     * @returns {Promise<Array>} - 待审核的留言列表
     */
    async function getPendingMessages() {
        try {
            console.log('获取待审核留言');
            
            // 构建查询
            const query = messageDb.collection('messages')
                .where('status', '==', 'pending')
                .orderBy('createdAt', 'desc');
            
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
            
            console.log(`获取到 ${messages.length} 条待审核留言`);
            return messages;
        } catch (error) {
            console.error('获取待审核留言失败:', error);
            throw error;
        }
    }

    /**
     * 获取留言总数
     * @returns {Promise<number>} - 留言总数
     */
    async function getMessageCount() {
        try {
            console.log('获取留言总数');
            
            // 获取已审核通过的留言总数
            const snapshot = await messageDb.collection('messages')
                .where('status', '==', 'approved')
                .get();
            
            console.log(`留言总数: ${snapshot.size}`);
            return snapshot.size;
        } catch (error) {
            console.error('获取留言总数失败:', error);
            throw error;
        }
    }

    /**
     * 发布留言
     * @param {string} content - 留言内容
     * @returns {Promise<void>} - 无返回值
     */
    async function postMessage(content) {
        try {
            console.log('发布留言:', content);
            
            // 获取当前用户
            const user = firebase.auth().currentUser;
            if (!user) {
                throw new Error('用户未登录');
            }
            
            // 准备留言数据
            const message = {
                content: content,
                userId: user.uid,
                userEmail: user.email,
                userName: user.displayName || user.email.split('@')[0],
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'pending', // 默认为待审核状态
                likeCount: 0,
                likes: [],
                category: document.getElementById('category').value || 'general'
            };
            
            // 添加留言
            await messageDb.collection('messages').add(message);
            
            console.log('留言发布成功');
        } catch (error) {
            console.error('发布留言失败:', error);
            throw error;
        }
    }

    /**
     * 点赞留言
     * @param {string} messageId - 留言ID
     * @returns {Promise<void>} - 无返回值
     */
    async function likeMessage(messageId) {
        try {
            console.log('点赞留言:', messageId);
            
            // 获取当前用户
            const user = firebase.auth().currentUser;
            if (!user) {
                throw new Error('用户未登录');
            }
            
            // 获取留言引用
            const messageRef = messageDb.collection('messages').doc(messageId);
            
            // 获取留言数据
            const doc = await messageRef.get();
            if (!doc.exists) {
                throw new Error('留言不存在');
            }
            
            const messageData = doc.data();
            const likes = messageData.likes || [];
            
            // 检查用户是否已点赞
            if (likes.includes(user.uid)) {
                // 已点赞，取消点赞
                await messageRef.update({
                    likes: firebase.firestore.FieldValue.arrayRemove(user.uid),
                    likeCount: firebase.firestore.FieldValue.increment(-1)
                });
                console.log('取消点赞成功');
                return false;
            } else {
                // 未点赞，添加点赞
                await messageRef.update({
                    likes: firebase.firestore.FieldValue.arrayUnion(user.uid),
                    likeCount: firebase.firestore.FieldValue.increment(1)
                });
                console.log('点赞成功');
                return true;
            }
        } catch (error) {
            console.error('点赞留言失败:', error);
            throw error;
        }
    }

    /**
     * 审核留言
     * @param {string} messageId - 留言ID
     * @param {string} status - 审核状态，'approved'或'rejected'
     * @returns {Promise<void>} - 无返回值
     */
    async function reviewMessage(messageId, status) {
        try {
            console.log(`审核留言 ${messageId}, 状态: ${status}`);
            
            // 获取当前用户
            const user = firebase.auth().currentUser;
            if (!user) {
                throw new Error('用户未登录');
            }
            
            // 检查用户是否是管理员
            const isAdmin = await checkIsAdmin(user.uid);
            if (!isAdmin) {
                throw new Error('没有权限审核留言');
            }
            
            // 更新留言状态
            await messageDb.collection('messages').doc(messageId).update({
                status: status,
                reviewedAt: firebase.firestore.FieldValue.serverTimestamp(),
                reviewedBy: user.uid
            });
            
            console.log('审核留言成功');
        } catch (error) {
            console.error('审核留言失败:', error);
            throw error;
        }
    }

    /**
     * 检查用户是否是管理员
     * @param {string} uid - 用户ID
     * @returns {Promise<boolean>} - 是否是管理员
     */
    async function checkIsAdmin(uid) {
        try {
            // 尝试使用 firestoreUserApi
            if (window.firestoreUserApi && typeof window.firestoreUserApi.checkUserRoleLevel === 'function') {
                return await window.firestoreUserApi.checkUserRoleLevel('admin');
            }
            
            // 尝试使用 firebaseService
            if (window.firebaseService && typeof window.firebaseService.checkUserRoleLevel === 'function') {
                return await window.firebaseService.checkUserRoleLevel('admin');
            }
            
            // 如果都不可用，直接查询用户数据
            const doc = await messageDb.collection('users').doc(uid).get();
            if (!doc.exists) {
                return false;
            }
            
            const userData = doc.data();
            return userData.role === 'admin';
        } catch (error) {
            console.error('检查管理员权限失败:', error);
            return false;
        }
    }

    /**
     * 监听新留言
     * @param {Function} callback - 回调函数，接收留言列表作为参数
     * @returns {Function} - 取消监听的函数
     */
    function listenToNewMessages(callback) {
        try {
            console.log('开始监听新留言');
            
            // 创建查询
            const query = messageDb.collection('messages')
                .where('status', '==', 'approved')
                .orderBy('createdAt', 'desc')
                .limit(MESSAGES_PER_PAGE);
            
            // 添加监听器
            const unsubscribe = query.onSnapshot(snapshot => {
                const messages = [];
                snapshot.forEach(doc => {
                    messages.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                
                console.log(`监听到 ${messages.length} 条留言`);
                callback(messages);
            }, error => {
                console.error('监听新留言失败:', error);
            });
            
            return unsubscribe;
        } catch (error) {
            console.error('设置留言监听器失败:', error);
            // 返回一个空函数作为后备
            return function() {};
        }
    }

    /**
     * 监听待审核留言
     * @param {Function} callback - 回调函数，接收留言列表作为参数
     * @returns {Function} - 取消监听的函数
     */
    function listenToPendingMessages(callback) {
        try {
            console.log('开始监听待审核留言');
            
            // 创建查询
            const query = messageDb.collection('messages')
                .where('status', '==', 'pending')
                .orderBy('createdAt', 'desc');
            
            // 添加监听器
            const unsubscribe = query.onSnapshot(snapshot => {
                const messages = [];
                snapshot.forEach(doc => {
                    messages.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                
                console.log(`监听到 ${messages.length} 条待审核留言`);
                callback(messages);
            }, error => {
                console.error('监听待审核留言失败:', error);
            });
            
            return unsubscribe;
        } catch (error) {
            console.error('设置待审核留言监听器失败:', error);
            // 返回一个空函数作为后备
            return function() {};
        }
    }

    // 导出 messageService 对象
    window.messageService = {
        MESSAGES_PER_PAGE,
        getMessages,
        getPendingMessages,
        getMessageCount,
        postMessage,
        likeMessage,
        reviewMessage,
        listenToNewMessages,
        listenToPendingMessages
    };

    console.log('留言板服务初始化完成');
})();
