// Firebase服务封装

// 初始化Firebase服务
window.firebaseService = {
    // 获取用户资料
    getUserProfile: async function(userId) {
        try {
            const userDoc = await firebase.firestore().collection('users').doc(userId).get();
            if (userDoc.exists) {
                return userDoc.data();
            } else {
                return {};
            }
        } catch (error) {
            console.error('获取用户资料失败:', error);
            throw error;
        }
    },
    
    // 创建用户资料
    createUserProfile: async function(userId, profileData) {
        try {
            await firebase.firestore().collection('users').doc(userId).set(profileData);
            return true;
        } catch (error) {
            console.error('创建用户资料失败:', error);
            throw error;
        }
    },
    
    // 更新用户资料
    updateUserProfile: async function(userId, profileData) {
        try {
            await firebase.firestore().collection('users').doc(userId).update(profileData);
            return true;
        } catch (error) {
            console.error('更新用户资料失败:', error);
            throw error;
        }
    },
    
    // 删除用户资料
    deleteUserProfile: async function(userId) {
        try {
            await firebase.firestore().collection('users').doc(userId).delete();
            return true;
        } catch (error) {
            console.error('删除用户资料失败:', error);
            throw error;
        }
    },
    
    // 获取用户角色
    getUserRole: async function(userId) {
        try {
            const userDoc = await firebase.firestore().collection('users').doc(userId).get();
            if (userDoc.exists && userDoc.data().role) {
                return userDoc.data().role;
            } else {
                return 'user';
            }
        } catch (error) {
            console.error('获取用户角色失败:', error);
            return 'user';
        }
    },
    
    // 更新用户角色
    updateUserRole: async function(userId, role, adminId) {
        try {
            // 检查操作者是否为管理员
            const adminDoc = await firebase.firestore().collection('users').doc(adminId).get();
            if (!adminDoc.exists || adminDoc.data().role !== 'admin') {
                throw new Error('只有管理员可以更改用户角色');
            }
            
            // 更新用户角色
            await firebase.firestore().collection('users').doc(userId).update({
                role: role,
                roleUpdatedAt: new Date().toISOString(),
                roleUpdatedBy: adminId
            });
            
            return true;
        } catch (error) {
            console.error('更新用户角色失败:', error);
            throw error;
        }
    },
    
    // 获取用户活动记录
    getUserActivity: async function(userId, limit = 10) {
        try {
            const activitySnapshot = await firebase.firestore()
                .collection('activities')
                .where('userId', '==', userId)
                .orderBy('timestamp', 'desc')
                .limit(limit)
                .get();
            
            return activitySnapshot.docs.map(doc => doc.data());
        } catch (error) {
            console.error('获取用户活动记录失败:', error);
            return [];
        }
    },
    
    // 获取用户收藏内容
    getUserFavorites: async function(userId, limit = 10) {
        try {
            const favoritesSnapshot = await firebase.firestore()
                .collection('favorites')
                .where('userId', '==', userId)
                .orderBy('timestamp', 'desc')
                .limit(limit)
                .get();
            
            return favoritesSnapshot.docs.map(doc => doc.data());
        } catch (error) {
            console.error('获取用户收藏内容失败:', error);
            return [];
        }
    }
};
