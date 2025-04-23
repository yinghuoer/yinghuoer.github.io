// Firebase服务类 - 处理所有Firebase操作

// 使用统一的 Firebase 实例
// 使用不同的变量名，避免与其他文件冲突
const firebaseService = {};

// 检查Firebase实例是否存在
if (window.firebaseInstances) {
    firebaseService.auth = window.firebaseInstances.auth;
    firebaseService.db = window.firebaseInstances.db;
    firebaseService.rtdb = window.firebaseInstances.rtdb;
    firebaseService.storage = window.firebaseInstances.storage;
} else {
    console.error('Firebase实例未初始化，尝试直接初始化');
    firebaseService.auth = firebase.auth();
    firebaseService.db = firebase.firestore();
    firebaseService.rtdb = firebase.database();
    firebaseService.storage = firebase.storage();
}

// 用户角色定义
const USER_ROLES = {
    USER: 'user',       // 普通用户
    BRONZE: 'bronze',   // 青铜级用户
    SILVER: 'silver',   // 白银级用户
    GOLD: 'gold',       // 黄金级用户
    ADMIN: 'admin'      // 管理员
};

// 角色等级（用于比较）
const ROLE_LEVELS = {
    [USER_ROLES.USER]: 1,
    [USER_ROLES.BRONZE]: 2,
    [USER_ROLES.SILVER]: 3,
    [USER_ROLES.GOLD]: 4,
    [USER_ROLES.ADMIN]: 5
};

// 权限定义
const PERMISSIONS = {
    READ_PUBLIC: 'read:public',           // 读取公开内容
    READ_AFTERSTORY1: 'read:afterstory1', // 读取后日谈1
    READ_AFTERSTORY2: 'read:afterstory2', // 读取后日谈2
    MANAGE_USERS: 'manage:users'          // 管理用户
};

// 角色对应的权限
const ROLE_PERMISSIONS = {
    [USER_ROLES.USER]: [
        PERMISSIONS.READ_PUBLIC
    ],
    [USER_ROLES.BRONZE]: [
        PERMISSIONS.READ_PUBLIC,
        PERMISSIONS.READ_AFTERSTORY1
    ],
    [USER_ROLES.SILVER]: [
        PERMISSIONS.READ_PUBLIC,
        PERMISSIONS.READ_AFTERSTORY1,
        PERMISSIONS.READ_AFTERSTORY2
    ],
    [USER_ROLES.GOLD]: [
        PERMISSIONS.READ_PUBLIC,
        PERMISSIONS.READ_AFTERSTORY1,
        PERMISSIONS.READ_AFTERSTORY2
    ],
    [USER_ROLES.ADMIN]: [
        PERMISSIONS.READ_PUBLIC,
        PERMISSIONS.READ_AFTERSTORY1,
        PERMISSIONS.READ_AFTERSTORY2,
        PERMISSIONS.MANAGE_USERS
    ]
};

/**
 * 创建用户记录
 * @param {Object} user - Firebase Auth用户对象
 * @returns {Promise} - Firestore操作Promise
 */
async function createUserRecord(user) {
    try {
        console.log('开始创建用户记录:', user.uid);

        // 检查网络连接
        if (!navigator.onLine) {
            console.error('网络连接已断开，无法创建用户记录');
            throw new Error('网络连接已断开，请检查您的网络连接');
        }

        // 直接使用 window.firebaseInstances.db
        console.log('window.firebaseInstances:', window.firebaseInstances);
        const firestoreDb = window.firebaseInstances.db;
        console.log('firestoreDb:', firestoreDb);

        // 测试Firestore实例是否可用
        if (firestoreDb) {
            try {
                console.log('测试Firestore实例是否可用');
                const testCollection = firestoreDb.collection('test');
                console.log('testCollection:', testCollection);
                console.log('Firestore实例可用');
            } catch (testError) {
                console.error('Firestore实例测试失败:', testError);
            }
        }

        if (!firestoreDb) {
            console.error('Firestore未初始化，无法获取 window.firebaseInstances.db');

            // 尝试直接初始化Firestore
            console.log('尝试直接初始化Firestore');
            const directDb = firebase.firestore();
            console.log('直接初始化的Firestore:', directDb);

            // 如果直接初始化成功，使用这个实例
            if (directDb) {
                console.log('使用直接初始化的Firestore实例');
                return createUserRecordWithDb(user, directDb);
            }

            throw new Error('Firestore未初始化');
        }
        console.log('Firestore实例获取成功')

        // 使用初始化好的Firestore实例创建用户记录
        return createUserRecordWithDb(user, firestoreDb);
    } catch (error) {
        console.error('创建用户记录失败:', error);
        throw error;
    }
}

/**
 * 使用指定的Firestore实例创建用户记录
 * @param {Object} user - Firebase Auth用户对象
 * @param {Object} db - Firestore实例
 * @returns {Promise} - Firestore操作Promise
 */
async function createUserRecordWithDb(user, db) {
    try {
        console.log('使用指定的Firestore实例创建用户记录:', user.uid);

        // 检查用户是否已存在
        console.log('检查用户记录是否存在...');
        console.log('users集合:', db.collection('users'));
        console.log('用户ID:', user.uid);
        console.log('用户文档引用:', db.collection('users').doc(user.uid));

        try {
            const userDoc = await db.collection('users').doc(user.uid).get();
            console.log('获取用户文档成功:', userDoc);
            console.log('用户文档是否存在:', userDoc.exists);

            if (userDoc.exists) {
                console.log('用户记录已存在，更新登录时间');
                // 用户已存在，更新登录时间
                try {
                    const updateResult = await db.collection('users').doc(user.uid).update({
                        lastLoginAt: firebase.firestore.FieldValue.serverTimestamp(),
                        lastActiveAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    console.log('更新登录时间成功:', updateResult);
                    return updateResult;
                } catch (updateError) {
                    console.error('更新登录时间失败:', updateError);
                    throw updateError;
                }
        }

            } else {
                console.log('创建新用户记录');
                // 创建新用户记录
                const userData = {
                    email: user.email,
                    displayName: user.displayName || '',
                    photoURL: user.photoURL || null,
                    role: USER_ROLES.USER, // 默认角色为普通用户
                    permissions: ROLE_PERMISSIONS[USER_ROLES.USER],
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    lastLoginAt: firebase.firestore.FieldValue.serverTimestamp(),
                    lastActiveAt: firebase.firestore.FieldValue.serverTimestamp(),
                    nameHistory: [] // 初始化昵称历史记录
                };

                console.log('将用户数据写入Firestore:', userData);
                try {
                    const setResult = await db.collection('users').doc(user.uid).set(userData);
                    console.log('用户记录创建成功:', setResult);
                    return true;
                } catch (setError) {
                    console.error('用户记录创建失败:', setError);
                    throw setError;
                }
            }
        } catch (getUserError) {
            console.error('获取用户文档失败:', getUserError);
            throw getUserError;
        }
    } catch (error) {
        console.error('创建用户记录失败:', error);
        throw error;
    }
}

/**
 * 更新用户最后登录时间
 * @param {string} uid - 用户ID
 * @returns {Promise} - Firestore操作Promise
 */
async function updateUserLastLogin(uid) {
    try {
        const firestoreDb = window.firebaseInstances.db;
        if (!firestoreDb) {
            console.error('Firestore未初始化，无法获取 window.firebaseInstances.db');
            throw new Error('Firestore未初始化');
        }

        return firestoreDb.collection('users').doc(uid).update({
            lastLoginAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error('更新用户登录时间失败:', error);
        throw error;
    }
}

/**
 * 更新用户活跃时间
 * @param {string} uid - 用户ID
 * @returns {Promise} - Firestore操作Promise
 */
async function updateUserActivity(uid) {
    if (!uid) return Promise.resolve();

    try {
        const firestoreDb = window.firebaseInstances.db;
        if (!firestoreDb) {
            console.error('Firestore未初始化，无法获取 window.firebaseInstances.db');
            return Promise.resolve(); // 不抛出错误，避免影响用户体验
        }

        return firestoreDb.collection('users').doc(uid).update({
            lastActiveAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error('更新用户活跃时间失败:', error);
        // 不抛出错误，避免影响用户体验
        return Promise.resolve();
    }
}

/**
 * 获取用户数据
 * @param {string} uid - 用户ID
 * @returns {Promise<Object>} - 用户数据对象
 */
async function getUserData(uid) {
    try {
        const firestoreDb = window.firebaseInstances.db;
        if (!firestoreDb) {
            console.error('Firestore未初始化，无法获取 window.firebaseInstances.db');
            throw new Error('Firestore未初始化');
        }

        const doc = await firestoreDb.collection('users').doc(uid).get();
        if (!doc.exists) {
            return null;
        }
        return doc.data();
    } catch (error) {
        console.error('获取用户数据失败:', error);
        throw error;
    }
}

/**
 * 更新用户显示名称
 * @param {string} uid - 用户ID
 * @param {string} newDisplayName - 新显示名称
 * @returns {Promise} - Firestore操作Promise
 */
async function updateUserDisplayName(uid, newDisplayName) {
    try {
        // 获取当前用户数据
        const userDoc = await firebaseService.db.collection('users').doc(uid).get();
        if (!userDoc.exists) {
            throw new Error('用户不存在');
        }

        const userData = userDoc.data();
        const currentDisplayName = userData.displayName;

        // 如果显示名称没有变化，直接返回
        if (currentDisplayName === newDisplayName) {
            return Promise.resolve();
        }

        // 准备更新数据
        const updateData = {
            displayName: newDisplayName,
            lastActiveAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        // 如果有当前显示名称，添加到历史记录
        if (currentDisplayName) {
            updateData.nameHistory = firebase.firestore.FieldValue.arrayUnion({
                displayName: currentDisplayName,
                changedAt: firebase.firestore.FieldValue.serverTimestamp(),
                activeUntil: firebase.firestore.FieldValue.serverTimestamp()
            });
        }

        // 更新用户数据
        return firebaseService.db.collection('users').doc(uid).update(updateData);
    } catch (error) {
        console.error('更新用户显示名称失败:', error);
        throw error;
    }
}

/**
 * 更新用户个人资料
 * @param {string} uid - 用户ID
 * @param {Object} profileData - 个人资料数据
 * @returns {Promise} - Firestore操作Promise
 */
async function updateUserProfile(uid, profileData) {
    try {
        // 如果包含显示名称，单独处理
        if (profileData.displayName !== undefined) {
            await updateUserDisplayName(uid, profileData.displayName);
            delete profileData.displayName; // 从profileData中移除，避免重复更新
        }

        // 添加活跃时间
        profileData.lastActiveAt = firebase.firestore.FieldValue.serverTimestamp();

        // 更新其他资料
        return firebaseService.db.collection('users').doc(uid).update(profileData);
    } catch (error) {
        console.error('更新用户个人资料失败:', error);
        throw error;
    }
}

/**
 * 上传用户头像
 * @param {string} uid - 用户ID
 * @param {File} file - 头像文件
 * @returns {Promise<string>} - 头像URL
 */
async function uploadUserAvatar(uid, file) {
    try {
        console.log('开始上传用户头像:', uid, file.name, file.size);

        // 检查网络连接
        if (!navigator.onLine) {
            throw new Error('网络连接已断开，请检查您的网络连接');
        }

        // 检查Firebase Storage是否初始化
        if (!firebaseService.storage) {
            console.error('Firebase Storage未初始化');
            // 尝试直接初始化
            firebaseService.storage = firebase.storage();
        }

        // 创建存储引用
        console.log('创建存储引用');
        const avatarRef = firebaseService.storage.ref().child(`avatars/${uid}`);
        console.log('存储引用创建成功:', avatarRef);

        // 上传文件
        console.log('开始上传文件...');
        const uploadTask = avatarRef.put(file);

        // 监听上传进度
        uploadTask.on('state_changed',
            (snapshot) => {
                // 上传进度
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('上传进度:', progress.toFixed(2) + '%');
            },
            (error) => {
                // 上传错误
                console.error('文件上传错误:', error);
                throw error;
            }
        );

        // 等待上传完成
        await uploadTask;
        console.log('文件上传成功');

        // 获取下载URL
        console.log('获取文件下载URL...');
        const downloadURL = await avatarRef.getDownloadURL();
        console.log('获取到下载URL:', downloadURL);

        // 更新用户资料
        console.log('更新用户资料...');
        await firebaseService.db.collection('users').doc(uid).update({
            photoURL: downloadURL,
            lastActiveAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('用户资料更新成功');

        return downloadURL;
    } catch (error) {
        console.error('上传用户头像失败:', error);
        // 返回更详细的错误信息
        if (error.code === 'storage/unauthorized') {
            throw new Error('没有权限上传文件，请检查Firebase Storage规则');
        } else if (error.code === 'storage/canceled') {
            throw new Error('文件上传已取消');
        } else if (error.code === 'storage/unknown') {
            throw new Error('发生未知错误，请检查网络连接并重试');
        }
        throw error;
    }
}

/**
 * 删除用户头像
 * @param {string} uid - 用户ID
 * @returns {Promise} - Firestore操作Promise
 */
async function deleteUserAvatar(uid) {
    try {
        console.log('开始删除用户头像:', uid);

        // 检查网络连接
        if (!navigator.onLine) {
            throw new Error('网络连接已断开，请检查您的网络连接');
        }

        // 检查Firebase Storage是否初始化
        if (!firebaseService.storage) {
            console.error('Firebase Storage未初始化');
            // 尝试直接初始化
            firebaseService.storage = firebase.storage();
        }

        // 创建存储引用
        console.log('创建存储引用');
        const avatarRef = firebaseService.storage.ref().child(`avatars/${uid}`);
        console.log('存储引用创建成功:', avatarRef);

        try {
            // 尝试删除存储中的头像
            console.log('尝试删除存储中的头像...');
            await avatarRef.delete();
            console.log('存储中的头像删除成功');
        } catch (error) {
            // 如果头像不存在，忽略错误
            console.log('头像文件不存在或已删除:', error);
            if (error.code !== 'storage/object-not-found') {
                console.error('删除存储中的头像失败:', error);
            }
        }

        // 更新用户资料
        console.log('更新用户资料...');
        await firebaseService.db.collection('users').doc(uid).update({
            photoURL: null,
            lastActiveAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('用户资料更新成功');

        return true;
    } catch (error) {
        console.error('删除用户头像失败:', error);
        // 返回更详细的错误信息
        if (error.code === 'storage/unauthorized') {
            throw new Error('没有权限删除文件，请检查Firebase Storage规则');
        } else if (error.code === 'storage/canceled') {
            throw new Error('文件删除已取消');
        } else if (error.code === 'storage/unknown') {
            throw new Error('发生未知错误，请检查网络连接并重试');
        }
        throw error;
    }
}

/**
 * 设置用户角色
 * @param {string} uid - 用户ID
 * @param {string} role - 角色名称
 * @returns {Promise} - Firestore操作Promise
 */
async function setUserRole(uid, role) {
    try {
        // 验证角色是否有效
        if (!Object.values(USER_ROLES).includes(role)) {
            throw new Error('无效的角色');
        }

        // 检查当前用户是否是管理员
        const currentUser = firebaseService.auth.currentUser;
        if (!currentUser) {
            throw new Error('用户未登录');
        }

        const currentUserData = await getUserData(currentUser.uid);
        if (!currentUserData || currentUserData.role !== USER_ROLES.ADMIN) {
            throw new Error('权限不足');
        }

        // 更新用户角色
        return firebaseService.db.collection('users').doc(uid).update({
            role: role,
            permissions: ROLE_PERMISSIONS[role]
        });
    } catch (error) {
        console.error('设置用户角色失败:', error);
        throw error;
    }
}

/**
 * 检查用户是否有特定权限
 * @param {string} permission - 权限名称
 * @returns {Promise<boolean>} - 是否有权限
 */
async function checkUserPermission(permission) {
    try {
        const user = firebaseService.auth.currentUser;
        if (!user) return false;

        const userData = await getUserData(user.uid);
        if (!userData) return false;

        // 更新活跃时间
        updateUserActivity(user.uid);

        // 检查用户是否有该权限
        return userData.permissions && userData.permissions.includes(permission);
    } catch (error) {
        console.error('检查权限失败:', error);
        return false;
    }
}

/**
 * 检查用户角色是否达到指定级别
 * @param {string} requiredRole - 所需角色
 * @returns {Promise<boolean>} - 是否达到要求
 */
async function checkUserRoleLevel(requiredRole) {
    try {
        const user = firebaseService.auth.currentUser;
        if (!user) return false;

        const userData = await getUserData(user.uid);
        if (!userData || !userData.role) return false;

        // 更新活跃时间
        updateUserActivity(user.uid);

        const userRoleLevel = ROLE_LEVELS[userData.role] || 0;
        const requiredRoleLevel = ROLE_LEVELS[requiredRole] || 999;

        return userRoleLevel >= requiredRoleLevel;
    } catch (error) {
        console.error('检查角色级别失败:', error);
        return false;
    }
}

/**
 * 获取所有用户
 * @param {number} limit - 限制返回数量
 * @param {string} startAfter - 起始用户ID
 * @returns {Promise<Array>} - 用户数组
 */
async function getAllUsers(limit = 50, startAfter = null) {
    try {
        // 检查当前用户是否是管理员
        const isAdmin = await checkUserRoleLevel(USER_ROLES.ADMIN);
        if (!isAdmin) {
            throw new Error('权限不足');
        }

        // 构建查询
        let query = firebaseService.db.collection('users').orderBy('createdAt', 'desc');

        // 如果有起始点，添加到查询
        if (startAfter) {
            const startDoc = await firebaseService.db.collection('users').doc(startAfter).get();
            if (startDoc.exists) {
                query = query.startAfter(startDoc);
            }
        }

        // 限制返回数量
        query = query.limit(limit);

        // 执行查询
        const snapshot = await query.get();

        // 处理结果
        const users = [];
        snapshot.forEach(doc => {
            users.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return users;
    } catch (error) {
        console.error('获取所有用户失败:', error);
        throw error;
    }
}

/**
 * 搜索用户
 * @param {string} searchTerm - 搜索关键词
 * @param {string} roleFilter - 角色过滤
 * @returns {Promise<Array>} - 用户数组
 */
async function searchUsers(searchTerm, roleFilter = null) {
    try {
        // 检查当前用户是否是管理员
        const isAdmin = await checkUserRoleLevel(USER_ROLES.ADMIN);
        if (!isAdmin) {
            throw new Error('权限不足');
        }

        // 构建基本查询
        let query = firebaseService.db.collection('users');

        // 如果有角色过滤，添加到查询
        if (roleFilter) {
            query = query.where('role', '==', roleFilter);
        }

        // 执行查询
        const snapshot = await query.get();

        // 处理结果
        let users = [];
        snapshot.forEach(doc => {
            users.push({
                id: doc.id,
                ...doc.data()
            });
        });

        // 如果有搜索关键词，在内存中过滤
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            users = users.filter(user =>
                (user.email && user.email.toLowerCase().includes(term)) ||
                (user.displayName && user.displayName.toLowerCase().includes(term)) ||
                user.id.toLowerCase().includes(term)
            );
        }

        return users;
    } catch (error) {
        console.error('搜索用户失败:', error);
        throw error;
    }
}

/**
 * 获取用户昵称历史
 * @param {string} uid - 用户ID
 * @returns {Promise<Array>} - 昵称历史数组
 */
async function getUserNameHistory(uid) {
    try {
        const userData = await getUserData(uid);
        if (!userData) return [];

        return userData.nameHistory || [];
    } catch (error) {
        console.error('获取用户昵称历史失败:', error);
        throw error;
    }
}

// 添加服务方法到firebaseService对象
firebaseService.USER_ROLES = USER_ROLES;
firebaseService.PERMISSIONS = PERMISSIONS;
firebaseService.ROLE_LEVELS = ROLE_LEVELS;
firebaseService.createUserRecord = createUserRecord;
firebaseService.updateUserLastLogin = updateUserLastLogin;
firebaseService.updateUserActivity = updateUserActivity;
firebaseService.getUserData = getUserData;
firebaseService.updateUserDisplayName = updateUserDisplayName;
firebaseService.updateUserProfile = updateUserProfile;
firebaseService.uploadUserAvatar = uploadUserAvatar;
firebaseService.deleteUserAvatar = deleteUserAvatar;
firebaseService.setUserRole = setUserRole;
firebaseService.checkUserPermission = checkUserPermission;
firebaseService.checkUserRoleLevel = checkUserRoleLevel;
firebaseService.getAllUsers = getAllUsers;
firebaseService.searchUsers = searchUsers;
firebaseService.getUserNameHistory = getUserNameHistory;

// 导出服务对象
window.firebaseService = firebaseService;

// 监听用户认证状态变化
if (firebaseService.auth) {
    firebaseService.auth.onAuthStateChanged(user => {
        if (user) {
            // 用户已登录
            createUserRecord(user)
                .catch(error => {
                    console.error('处理用户数据失败:', error);
                });
        }
    });
}
