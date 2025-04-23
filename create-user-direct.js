/**
 * 直接创建用户记录到Firestore
 * 使用REST API方法，指定数据库ID
 */
function createUserDirectly(user) {
    console.log('开始创建用户记录:', user.uid);
    console.log('指定数据库ID: missfoxsanuser');
    console.log('用户信息:', {
        email: user.email,
        displayName: user.displayName || '',
        emailVerified: user.emailVerified,
        uid: user.uid
    });

    // 仅使用 REST API 方法
    if (window.writeToFirestoreViaREST) {
        console.log('使用 REST API 方法写入数据');
        window.writeToFirestoreViaREST(user)
            .then(success => {
                if (success) {
                    console.log('REST API 方法写入成功');
                } else {
                    console.error('REST API 方法失败');
                }
            })
            .catch(error => {
                console.error('REST API 方法出错:', error);
            });
    } else {
        console.error('REST API 方法不可用，无法创建用户记录');
        console.error('请确保 firestore-rest-api.js 文件已正确加载');
    }
}

// 导出函数
window.createUserDirectly = createUserDirectly;
