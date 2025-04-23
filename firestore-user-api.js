/**
 * 使用 Firebase REST API 处理用户资料相关的功能
 * 这个文件提供与原来 firebaseService 相同的接口，但使用 REST API 与 Firestore 通信
 */

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
 * @returns {Promise<boolean>} - 操作是否成功
 */
async function createUserRecord(user) {
    console.log('开始创建用户记录:', user.uid);

    try {
        // 使用 REST API 创建用户记录
        return await window.writeToFirestoreViaREST(user);
    } catch (error) {
        console.error('创建用户记录失败:', error);
        return false;
    }
}

/**
 * 获取用户数据
 * @param {string} uid - 用户ID
 * @returns {Promise<Object>} - 用户数据对象
 */
async function getUserData(uid) {
    console.log('开始获取用户数据:', uid);

    try {
        // 获取用户认证令牌
        const user = firebase.auth().currentUser;
        if (!user) {
            throw new Error('用户未登录');
        }

        const idToken = await user.getIdToken(true);

        // 构建 REST API URL
        const projectId = 'missfoxcounter';
        const databaseId = 'missfoxsanuser';
        const collectionName = 'users';
        const documentId = uid;

        const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/${collectionName}/${documentId}`;

        console.log('发送 GET 请求到:', url);

        // 发送 REST API 请求
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${idToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`获取用户数据失败: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('获取用户数据成功:', data);

        // 转换 Firestore REST API 格式为普通对象
        return convertFirestoreDocumentToObject(data);
    } catch (error) {
        console.error('获取用户数据失败:', error);
        return null;
    }
}

/**
 * 更新用户个人资料
 * @param {string} uid - 用户ID
 * @param {Object} profileData - 个人资料数据
 * @returns {Promise<boolean>} - 操作是否成功
 */
async function updateUserProfile(uid, profileData) {
    console.log('开始更新用户个人资料:', uid, profileData);

    try {
        // 获取用户认证令牌
        const user = firebase.auth().currentUser;
        if (!user) {
            throw new Error('用户未登录');
        }

        const idToken = await user.getIdToken(true);

        // 如果更新了显示名，需要先获取当前用户数据，以更新 nameHistory
        let nameHistory = [];
        if (profileData.displayName !== undefined) {
            try {
                const userData = await getUserData(uid);
                if (userData) {
                    // 获取当前的昵称历史记录
                    nameHistory = userData.nameHistory || [];

                    // 如果当前有显示名且与新显示名不同，将其添加到历史记录中
                    if (userData.displayName && userData.displayName !== profileData.displayName) {
                        const now = new Date().toISOString();
                        nameHistory.push({
                            displayName: userData.displayName,  // 使用 displayName 而不是 name
                            changedAt: now  // 使用 changedAt 而不是 timestamp
                        });
                        console.log('添加新的昵称历史记录:', userData.displayName);
                    }
                }
            } catch (error) {
                console.error('获取用户数据失败，无法更新昵称历史记录:', error);
                // 继续执行，不抛出错误
            }
        }

        // 构建 REST API URL
        const projectId = 'missfoxcounter';
        const databaseId = 'missfoxsanuser';
        const collectionName = 'users';
        const documentId = uid;

        // 构建更新掩码
        let updateMask = 'updateMask.fieldPaths=lastActiveAt';

        if (profileData.displayName !== undefined) {
            updateMask += '&updateMask.fieldPaths=displayName';
            updateMask += '&updateMask.fieldPaths=nameHistory';
        }

        if (profileData.bio !== undefined) {
            updateMask += '&updateMask.fieldPaths=bio';
        }

        if (profileData.photoURL !== undefined) {
            updateMask += '&updateMask.fieldPaths=photoURL';
        }

        const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/${collectionName}/${documentId}?${updateMask}`;

        console.log('发送 PATCH 请求到:', url);

        // 准备数据
        const now = new Date().toISOString();
        const data = {
            fields: {
                lastActiveAt: { timestampValue: now }
            }
        };

        // 添加个人资料数据
        if (profileData.displayName !== undefined) {
            data.fields.displayName = { stringValue: profileData.displayName };

            // 添加昵称历史记录
            data.fields.nameHistory = {
                arrayValue: {
                    values: nameHistory.map(item => ({
                        mapValue: {
                            fields: {
                                displayName: { stringValue: item.displayName || item.name },
                                changedAt: { stringValue: item.changedAt || item.timestamp }
                            }
                        }
                    }))
                }
            };

            console.log('昵称历史记录数据:', JSON.stringify(data.fields.nameHistory, null, 2));
        }

        if (profileData.bio !== undefined) {
            data.fields.bio = { stringValue: profileData.bio };
        }

        if (profileData.photoURL !== undefined) {
            if (profileData.photoURL === null) {
                data.fields.photoURL = { nullValue: null };
            } else {
                data.fields.photoURL = { stringValue: profileData.photoURL };
            }
        }

        console.log('请求数据:', JSON.stringify(data, null, 2));

        // 发送 REST API 请求
        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`更新用户个人资料失败: ${response.status} ${response.statusText}`);
        }

        const responseData = await response.json();
        console.log('更新用户个人资料成功:', responseData);

        return true;
    } catch (error) {
        console.error('更新用户个人资料失败:', error);
        return false;
    }
}

/**
 * 上传用户头像
 * @param {string} uid - 用户ID
 * @param {File} file - 头像文件
 * @returns {Promise<string>} - 头像URL
 */
async function uploadUserAvatar(uid, file) {
    console.log('开始上传用户头像:', uid, file.name, file.size);

    try {
        // 获取用户认证令牌
        const user = firebase.auth().currentUser;
        if (!user) {
            throw new Error('用户未登录');
        }

        // 获取当前用户数据，以获取当前头像URL
        let avatarHistory = [];
        try {
            const userData = await getUserData(uid);
            if (userData) {
                // 获取当前的头像历史记录
                avatarHistory = userData.avatarHistory || [];

                // 如果当前有头像，将其添加到历史记录中
                if (userData.photoURL) {
                    const now = new Date().toISOString();
                    avatarHistory.push({
                        url: userData.photoURL,
                        timestamp: now
                    });
                    console.log('添加新的头像历史记录:', userData.photoURL);
                }
            }
        } catch (error) {
            console.error('获取用户数据失败，无法更新头像历史记录:', error);
            // 继续执行，不抛出错误
        }

        // 使用 Firebase Storage SDK 上传文件
        // 注意：Storage API 不需要特殊处理，可以直接使用
        const storage = firebase.storage();
        const avatarRef = storage.ref().child(`avatars/${uid}`);

        console.log('开始上传文件...');
        const uploadTask = avatarRef.put(file);

        // 等待上传完成
        await uploadTask;
        console.log('文件上传成功');

        // 获取下载URL
        const downloadURL = await avatarRef.getDownloadURL();
        console.log('获取到下载URL:', downloadURL);

        // 更新用户资料中的头像URL和头像历史记录
        try {
            // 获取用户认证令牌
            const idToken = await user.getIdToken(true);

            // 构建 REST API URL
            const projectId = 'missfoxcounter';
            const databaseId = 'missfoxsanuser';
            const collectionName = 'users';
            const documentId = uid;

            const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/${collectionName}/${documentId}?updateMask.fieldPaths=photoURL&updateMask.fieldPaths=avatarHistory&updateMask.fieldPaths=lastActiveAt`;

            console.log('发送 PATCH 请求到:', url);

            // 准备数据
            const now = new Date().toISOString();
            const data = {
                fields: {
                    photoURL: { stringValue: downloadURL },
                    lastActiveAt: { timestampValue: now },
                    avatarHistory: {
                        arrayValue: {
                            values: avatarHistory.map(item => ({
                                mapValue: {
                                    fields: {
                                        url: { stringValue: item.url },
                                        timestamp: { stringValue: item.timestamp }
                                    }
                                }
                            }))
                        }
                    }
                }
            };

            console.log('请求数据:', JSON.stringify(data, null, 2));

            // 发送 REST API 请求
            const response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`更新用户头像URL失败: ${response.status} ${response.statusText}`);
            }

            const responseData = await response.json();
            console.log('更新用户头像URL成功:', responseData);
        } catch (error) {
            console.error('更新用户头像URL失败:', error);
            // 继续执行，不抛出错误
        }

        return downloadURL;
    } catch (error) {
        console.error('上传用户头像失败:', error);
        throw error;
    }
}

/**
 * 删除用户头像
 * @param {string} uid - 用户ID
 * @returns {Promise<boolean>} - 操作是否成功
 */
async function deleteUserAvatar(uid) {
    console.log('开始删除用户头像:', uid);

    try {
        // 获取用户认证令牌
        const user = firebase.auth().currentUser;
        if (!user) {
            throw new Error('用户未登录');
        }

        // 获取当前用户数据，以获取当前头像URL
        let avatarHistory = [];
        try {
            const userData = await getUserData(uid);
            if (userData) {
                // 获取当前的头像历史记录
                avatarHistory = userData.avatarHistory || [];

                // 如果当前有头像，将其添加到历史记录中
                if (userData.photoURL) {
                    const now = new Date().toISOString();
                    avatarHistory.push({
                        url: userData.photoURL,
                        timestamp: now
                    });
                    console.log('添加新的头像历史记录:', userData.photoURL);
                }
            }
        } catch (error) {
            console.error('获取用户数据失败，无法更新头像历史记录:', error);
            // 继续执行，不抛出错误
        }

        // 使用 Firebase Storage SDK 删除文件
        const storage = firebase.storage();
        const avatarRef = storage.ref().child(`avatars/${uid}`);

        try {
            // 尝试删除存储中的头像
            await avatarRef.delete();
            console.log('存储中的头像删除成功');
        } catch (error) {
            // 如果头像不存在，忽略错误
            console.log('头像文件不存在或已删除:', error);
        }

        // 更新用户资料，移除头像URL
        try {
            // 获取用户认证令牌
            const idToken = await user.getIdToken(true);

            // 构建 REST API URL
            const projectId = 'missfoxcounter';
            const databaseId = 'missfoxsanuser';
            const collectionName = 'users';
            const documentId = uid;

            const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/${collectionName}/${documentId}?updateMask.fieldPaths=photoURL&updateMask.fieldPaths=avatarHistory&updateMask.fieldPaths=lastActiveAt`;

            console.log('发送 PATCH 请求到:', url);

            // 准备数据
            const now = new Date().toISOString();
            const data = {
                fields: {
                    photoURL: { nullValue: null },
                    lastActiveAt: { timestampValue: now },
                    avatarHistory: {
                        arrayValue: {
                            values: avatarHistory.map(item => ({
                                mapValue: {
                                    fields: {
                                        url: { stringValue: item.url },
                                        timestamp: { stringValue: item.timestamp }
                                    }
                                }
                            }))
                        }
                    }
                }
            };

            console.log('请求数据:', JSON.stringify(data, null, 2));

            // 发送 REST API 请求
            const response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`更新用户资料失败: ${response.status} ${response.statusText}`);
            }

            const responseData = await response.json();
            console.log('更新用户资料成功:', responseData);
        } catch (error) {
            console.error('更新用户资料失败:', error);
            // 继续执行，不抛出错误
        }

        return true;
    } catch (error) {
        console.error('删除用户头像失败:', error);
        throw error;
    }
}

/**
 * 设置用户角色
 * @param {string} uid - 用户ID
 * @param {string} role - 角色名称
 * @returns {Promise<boolean>} - 操作是否成功
 */
async function setUserRole(uid, role) {
    console.log('设置用户角色:', uid, role);

    try {
        // 验证角色是否有效
        if (!Object.values(USER_ROLES).includes(role)) {
            throw new Error('无效的角色');
        }

        // 检查当前用户是否是管理员
        const isAdmin = await checkUserRoleLevel(USER_ROLES.ADMIN);
        if (!isAdmin) {
            throw new Error('没有权限设置用户角色');
        }

        // 获取用户认证令牌
        const user = firebase.auth().currentUser;
        if (!user) {
            throw new Error('用户未登录');
        }

        const idToken = await user.getIdToken(true);

        // 构建 REST API URL
        const projectId = 'missfoxcounter';
        const databaseId = 'missfoxsanuser';
        const collectionName = 'users';
        const documentId = uid;

        const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/${collectionName}/${documentId}?updateMask.fieldPaths=role&updateMask.fieldPaths=permissions&updateMask.fieldPaths=lastActiveAt`;

        console.log('发送 PATCH 请求到:', url);

        // 准备数据
        const now = new Date().toISOString();
        const data = {
            fields: {
                role: { stringValue: role },
                permissions: {
                    arrayValue: {
                        values: ROLE_PERMISSIONS[role].map(permission => ({ stringValue: permission }))
                    }
                },
                lastActiveAt: { timestampValue: now }
            }
        };

        console.log('请求数据:', JSON.stringify(data, null, 2));

        // 发送 REST API 请求
        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`设置用户角色失败: ${response.status} ${response.statusText}`);
        }

        const responseData = await response.json();
        console.log('设置用户角色成功:', responseData);

        return true;
    } catch (error) {
        console.error('设置用户角色失败:', error);
        throw error;
    }
}

/**
 * 检查用户权限
 * @param {string} permission - 所需权限
 * @returns {Promise<boolean>} - 用户是否具有所需权限
 */
async function checkUserPermission(permission) {
    console.log('检查用户权限:', permission);

    try {
        // 获取用户认证令牌
        const user = firebase.auth().currentUser;
        if (!user) {
            return false;
        }

        // 获取用户数据
        const userData = await getUserData(user.uid);
        if (!userData) {
            return false;
        }

        // 获取用户权限
        const userPermissions = userData.permissions || [];

        // 检查用户是否具有所需权限
        return userPermissions.includes(permission);
    } catch (error) {
        console.error('检查用户权限失败:', error);
        return false;
    }
}

/**
 * 检查用户角色等级
 * @param {string} requiredRole - 所需角色
 * @returns {Promise<boolean>} - 用户是否具有所需角色或更高角色
 */
async function checkUserRoleLevel(requiredRole) {
    console.log('检查用户角色等级:', requiredRole);

    try {
        // 获取用户认证令牌
        const user = firebase.auth().currentUser;
        if (!user) {
            return false;
        }

        // 获取用户数据
        const userData = await getUserData(user.uid);
        if (!userData) {
            return false;
        }

        // 获取用户角色
        const userRole = userData.role || USER_ROLES.USER;

        // 获取角色等级
        const userRoleLevel = ROLE_LEVELS[userRole] || 1;
        const requiredRoleLevel = ROLE_LEVELS[requiredRole] || 5;

        // 检查用户角色等级是否满足要求
        return userRoleLevel >= requiredRoleLevel;
    } catch (error) {
        console.error('检查用户角色等级失败:', error);
        return false;
    }
}

/**
 * 获取用户昵称历史记录
 * @param {string} uid - 用户ID
 * @returns {Promise<Array>} - 昵称历史记录数组
 */
async function getUserNameHistory(uid) {
    console.log('获取用户昵称历史记录:', uid);

    try {
        // 获取用户数据
        const userData = await getUserData(uid);
        if (!userData) {
            return [];
        }

        // 获取昵称历史记录
        return userData.nameHistory || [];
    } catch (error) {
        console.error('获取用户昵称历史记录失败:', error);
        return [];
    }
}

/**
 * 获取用户头像历史记录
 * @param {string} uid - 用户ID
 * @returns {Promise<Array>} - 头像历史记录数组
 */
async function getUserAvatarHistory(uid) {
    console.log('获取用户头像历史记录:', uid);

    try {
        // 获取用户数据
        const userData = await getUserData(uid);
        if (!userData) {
            return [];
        }

        // 获取头像历史记录
        return userData.avatarHistory || [];
    } catch (error) {
        console.error('获取用户头像历史记录失败:', error);
        return [];
    }
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
window.firestoreUserApi = {
    USER_ROLES,
    ROLE_LEVELS,
    PERMISSIONS,
    ROLE_PERMISSIONS,
    createUserRecord,
    getUserData,
    updateUserProfile,
    uploadUserAvatar,
    deleteUserAvatar,
    setUserRole,
    checkUserRoleLevel,
    checkUserPermission,
    getUserNameHistory,
    getUserAvatarHistory
};

// 为了兼容性，将函数添加到 window.firebaseService
if (!window.firebaseService) {
    window.firebaseService = {};
}

window.firebaseService.USER_ROLES = USER_ROLES;
window.firebaseService.ROLE_LEVELS = ROLE_LEVELS;
window.firebaseService.PERMISSIONS = PERMISSIONS;
window.firebaseService.ROLE_PERMISSIONS = ROLE_PERMISSIONS;
window.firebaseService.createUserRecord = createUserRecord;
window.firebaseService.getUserData = getUserData;
window.firebaseService.updateUserProfile = updateUserProfile;
window.firebaseService.uploadUserAvatar = uploadUserAvatar;
window.firebaseService.deleteUserAvatar = deleteUserAvatar;
window.firebaseService.setUserRole = setUserRole;
window.firebaseService.checkUserRoleLevel = checkUserRoleLevel;
window.firebaseService.checkUserPermission = checkUserPermission;
window.firebaseService.getUserNameHistory = getUserNameHistory;
window.firebaseService.getUserAvatarHistory = getUserAvatarHistory;

console.log('Firestore User API 初始化完成');
