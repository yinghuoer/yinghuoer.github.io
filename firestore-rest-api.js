/**
 * 使用 Firebase REST API 直接写入 Firestore
 * 这样我们可以明确指定数据库 ID
 */

// 获取 Firebase 认证令牌并使用 REST API 写入 Firestore
async function writeToFirestoreViaREST(user) {
    console.log('尝试使用 REST API 写入 Firestore，指定数据库 ID: missfoxsanuser');

    try {
        // 获取用户认证令牌
        const idToken = await user.getIdToken(true);
        console.log('获取到用户认证令牌');

        // 准备用户数据 - 使用正确的 Firestore REST API 格式
        const userData = {
            fields: {
                email: { stringValue: user.email },
                displayName: { stringValue: user.displayName || '' },
                photoURL: { stringValue: user.photoURL || '' },
                role: { stringValue: 'user' },
                permissions: { arrayValue: { values: [{ stringValue: 'read:public' }] } },
                createdAt: { timestampValue: new Date().toISOString() },
                lastLoginAt: { timestampValue: new Date().toISOString() },
                lastActiveAt: { timestampValue: new Date().toISOString() },
                nameHistory: { arrayValue: { values: [] } }
            }
        };

        // 构建正确的 REST API URL，明确指定数据库 ID
        const projectId = 'missfoxcounter';
        const databaseId = 'missfoxsanuser'; // 明确指定数据库 ID
        const collectionName = 'users';
        const documentId = user.uid;

        console.log('使用的数据库 ID:', databaseId);

        // 正确的 REST API 端点
        const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/${collectionName}/${documentId}`;

        console.log('发送 REST API 请求到:', url);
        console.log('请求数据:', JSON.stringify(userData, null, 2));

        // 发送 REST API 请求
        const response = await fetch(url, {
            method: 'PATCH', // 使用 PATCH 更新文档
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify(userData)
        });

        console.log('响应状态码:', response.status);

        if (response.ok) {
            const data = await response.json();
            console.log('REST API 写入成功:', data);
            return true;
        } else {
            let errorText = '';
            try {
                const errorData = await response.json();
                errorText = JSON.stringify(errorData);
                console.error('REST API 写入失败:', response.status, errorData);
            } catch (e) {
                errorText = await response.text();
                console.error('REST API 写入失败:', response.status, errorText);
            }

            // 尝试使用 POST 方法
            return tryPostMethod(user, idToken, projectId, databaseId);
        }
    } catch (error) {
        console.error('REST API 写入出错:', error);
        return false;
    }
}

// 尝试使用 POST 方法
async function tryPostMethod(user, idToken, projectId, databaseId) {
    try {
        console.log('尝试使用 POST 方法创建文档');

        // 准备用户数据
        const userData = {
            fields: {
                email: { stringValue: user.email },
                displayName: { stringValue: user.displayName || '' },
                photoURL: { stringValue: user.photoURL || '' },
                role: { stringValue: 'user' },
                permissions: { arrayValue: { values: [{ stringValue: 'read:public' }] } },
                createdAt: { timestampValue: new Date().toISOString() },
                lastLoginAt: { timestampValue: new Date().toISOString() },
                lastActiveAt: { timestampValue: new Date().toISOString() },
                nameHistory: { arrayValue: { values: [] } }
            }
        };

        // 使用 POST 方法的 URL
        const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/users?documentId=${user.uid}`;

        console.log('发送 POST 请求到:', url);
        console.log('使用的数据库 ID:', databaseId);
        console.log('请求数据:', JSON.stringify(userData, null, 2));

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify(userData)
        });

        console.log('POST 响应状态码:', response.status);

        if (response.ok) {
            const data = await response.json();
            console.log('POST 方法写入成功:', data);
            return true;
        } else {
            let errorText = '';
            try {
                const errorData = await response.json();
                errorText = JSON.stringify(errorData);
                console.error('POST 方法失败:', response.status, errorData);
            } catch (e) {
                errorText = await response.text();
                console.error('POST 方法失败:', response.status, errorText);
            }

            // 尝试使用 PUT 方法
            return tryPutMethod(user, idToken, projectId, databaseId);
        }
    } catch (error) {
        console.error('POST 方法出错:', error);
        return tryPutMethod(user, idToken, projectId, databaseId);
    }
}

// 尝试使用 PUT 方法
async function tryPutMethod(user, idToken, projectId, databaseId) {
    try {
        console.log('尝试使用 PUT 方法替换文档');

        // 准备用户数据
        const userData = {
            fields: {
                email: { stringValue: user.email },
                displayName: { stringValue: user.displayName || '' },
                photoURL: { stringValue: user.photoURL || '' },
                role: { stringValue: 'user' },
                permissions: { arrayValue: { values: [{ stringValue: 'read:public' }] } },
                createdAt: { timestampValue: new Date().toISOString() },
                lastLoginAt: { timestampValue: new Date().toISOString() },
                lastActiveAt: { timestampValue: new Date().toISOString() },
                nameHistory: { arrayValue: { values: [] } }
            }
        };

        // 使用 PUT 方法的 URL
        const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/users/${user.uid}`;

        console.log('发送 PUT 请求到:', url);
        console.log('使用的数据库 ID:', databaseId);
        console.log('请求数据:', JSON.stringify(userData, null, 2));

        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify(userData)
        });

        console.log('PUT 响应状态码:', response.status);

        if (response.ok) {
            const data = await response.json();
            console.log('PUT 方法写入成功:', data);
            return true;
        } else {
            let errorText = '';
            try {
                const errorData = await response.json();
                errorText = JSON.stringify(errorData);
                console.error('PUT 方法失败:', response.status, errorData);
            } catch (e) {
                errorText = await response.text();
                console.error('PUT 方法失败:', response.status, errorText);
            }
            return false;
        }
    } catch (error) {
        console.error('PUT 方法出错:', error);
        return false;
    }
}

// 导出函数
window.writeToFirestoreViaREST = writeToFirestoreViaREST;
