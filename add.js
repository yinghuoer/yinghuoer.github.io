// ✅ Firebase 初始化（共享）
if (!window._firebaseApp) {
    window._firebaseConfig = {
        apiKey: "AIzaSyC5uKEY52uBF0jjcIZmBqnwrjaAbRhwbkE",
        authDomain: "missfoxcounter.firebaseapp.com",
        databaseURL: "https://missfoxcounter-default-rtdb.firebaseio.com",
        projectId: "missfoxcounter",
        storageBucket: "missfoxcounter.firebasestorage.app",
        messagingSenderId: "633096112480",
        appId: "1:633096112480:web:4eb1212f12a46674e9f605"
    };
    window._firebaseApp = firebase.initializeApp(window._firebaseConfig);
}
var db = window._firebaseDB || firebase.database(window._firebaseApp);
window._firebaseDB = db;

// ✅ 地理地图加载完毕后（analytics 页面记录访问）
db.ref("visits/pages/analytics").transaction(val => (val || 0) + 1);
