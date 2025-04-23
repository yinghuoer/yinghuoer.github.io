// Firebase 初始化文件
// 统一初始化 Firebase 并导出实例，避免多次初始化

// 检查是否已经初始化
if (!window.firebaseInstances) {
    // Firebase 配置
    const firebaseConfig = {
        apiKey: "AIzaSyC5uKEY52uBF0jjcIZmBqnwrjaAbRhwbkE",
        authDomain: "missfoxcounter.firebaseapp.com",
        databaseURL: "https://missfoxcounter-default-rtdb.firebaseio.com",
        projectId: "missfoxcounter",
        storageBucket: "missfoxcounter.appspot.com",
        messagingSenderId: "633096112480",
        appId: "1:633096112480:web:4eb1212f12a46674e9f605"
    };

    // 初始化 Firebase
    let firebaseApp;
    if (!firebase.apps.length) {
        firebaseApp = firebase.initializeApp(firebaseConfig);
    } else {
        firebaseApp = firebase.apps[0];
    }

    // 导出 Firebase 实例
    window.firebaseInstances = {
        app: firebaseApp,
        auth: firebase.auth(),
        db: firebase.firestore(),
        rtdb: firebase.database(),
        storage: firebase.storage()
    };

    console.log('Firebase 初始化完成');
} else {
    console.log('Firebase 已经初始化');
}
