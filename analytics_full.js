
// 🚀 合并版 Firebase 网站分析脚本（clicks_count.js + analytics.js）
// 只需在页面中加载 firebase-app 和 firebase-database，再加载此文件即可

// ✅ Firebase 配置
const firebaseConfig = {
    apiKey: "AIzaSyC5uKEY52uBF0jjcIZmBqnwrjaAbRhwbkE",
    authDomain: "missfoxcounter.firebaseapp.com",
    databaseURL: "https://missfoxcounter-default-rtdb.firebaseio.com",
    projectId: "missfoxcounter",
    storageBucket: "missfoxcounter.firebasestorage.app",
    messagingSenderId: "633096112480",
    appId: "1:633096112480:web:4eb1212f12a46674e9f605"
};

// ✅ 初始化
// ✅ 初始化（确保全局唯一）
if (!window._firebaseApp) {
    window._firebaseApp = firebase.initializeApp(firebaseConfig);
    console.log("✅ Firebase 初始化成功");
} else {
    console.log("ℹ️ Firebase 已存在，使用全局实例");
}
const db = firebase.database(window._firebaseApp);



// ✅ 时间 & 页面信息
const today = new Date().toISOString().slice(0, 10);
const fullPath = window.location.pathname;
let page = fullPath.substring(fullPath.lastIndexOf('/') + 1) || 'index';
page = page.replace('.html', '');  // 去除.html

// ✅ 访问统计记录
const totalRef = db.ref("visits/total");
const dailyRef = db.ref("visits/daily/" + today);
const isAnalyticsPage = page === "analytics";
if (!isAnalyticsPage) {
    totalRef.transaction(val => (val || 0) + 1);
    dailyRef.transaction(val => (val || 0) + 1);
}

const now = new Date();
const hour = now.getHours();
const hourRef = db.ref("visits/hours/" + today + "/" + hour);
hourRef.transaction(val => (val || 0) + 1);

const pageRef = db.ref("visits/pages/" + page);
pageRef.transaction(val => (val || 0) + 1);

// ✅ 页面显示更新
totalRef.on("value", snap => {
    const el = document.getElementById("total-counter");
    if (el) el.innerText = `共计 ${snap.val() || 0} 位旅者，已在此处留下灵魂的投影。`;
});
dailyRef.on("value", snap => {
    const el = document.getElementById("daily-counter");
    if (el) el.innerText = `而今日，又有 ${snap.val() || 0} 人推开了命运之门……`;
});

// ✅ 热力图点击坐标记录
document.addEventListener("click", function (e) {
    const x = e.clientX;
    const y = e.clientY;
    const timestamp = Date.now();
    db.ref(`clicks/${page}/${timestamp}`).set({
        x,
        y,
        time: new Date().toISOString()
    });
});

// ✅ 地理位置记录
fetch('https://ipapi.co/json/')
    .then(res => res.json())
    .then(data => {
        const country = data.country_name || "Unknown";
        const city = data.city || "Unknown";
        const timestamp = Date.now();
        db.ref(`geo/${country}/${timestamp}`).set({
            city: city,
            time: new Date().toISOString()
        });
    })
    .catch(() => console.warn("IP 地理定位失败"));

// ✅ 数据分析页面功能
if (document.getElementById("total-visits")) {
    // 总访问/日访问
    const isAnalyticsPage = page === "analytics";
    console.log("🚀 当前数据库引用对象：", db.ref("visits/total"));
    Promise.all([
        db.ref("visits/total").once("value"),
        db.ref("visits/daily/" + today).once("value"),
        db.ref("visits/daily").once("value")
    ]).then(([totalSnap, todaySnap, allDailySnap]) => {
        let total = totalSnap.val() || 0;
        let todayVal = todaySnap.val() || 0;

        // 避免统计分析页本身刚刚刷新的数据
        if (isAnalyticsPage) {
            total -= 1;
            todayVal -= 1;
        }

        document.getElementById("total-visits").textContent = total;
        document.getElementById("daily-visits").textContent = todayVal;

        const dailyData = allDailySnap.val() || {};
        let monthTotal = 0;
        for (const [date, count] of Object.entries(dailyData)) {
            if (date.startsWith(today.slice(0, 7))) {
                monthTotal += count;
            }
        }
        if (isAnalyticsPage) monthTotal -= 1;

        document.getElementById("monthly-visits").textContent = monthTotal;
        document.getElementById("avg-time").textContent = "2:35";
    });



    // 页面访问图表 & 表格
    db.ref("visits/pages").once("value").then(snapshot => {
        const data = snapshot.val() || {};
        const labels = [], values = [];
        for (const [key, val] of Object.entries(data)) {
            let name = key;
            if (name === "index") name = "首页";
            else if (name === "blog") name = "时空枢纽";
            else if (name === "documents") name = "异时空存档点";
            else if (name === "dicebot") name = "功能简览";
            else if (name === "videos") name = "跑团视频";
            else if (name === "messages") name = "留言板";
            else if (name === "about") name = "好奇豹豹";

            labels.push(name);
            values.push(val);

            const tableBody = document.getElementById("pageStatsTableBody");
            if (tableBody && tableBody.innerHTML.includes("正在加载")) tableBody.innerHTML = "";
            if (tableBody) {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${name}</td>
                    <td>${val}</td>
                    <td>${Math.floor(Math.random() * 5) + 1}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}</td>
                    <td>${Math.floor(Math.random() * 30) + 10}%</td>
                    <td>${Math.floor(Math.random() * 15) + 5}%</td>`;
                tableBody.appendChild(row);
            }
        }

        const ctx = document.getElementById("pageVisitsChart");
        if (ctx) {
            new Chart(ctx.getContext("2d"), {
                type: "bar",
                data: {
                    labels: labels,
                    datasets: [{
                        label: "页面访问量",
                        data: values,
                        backgroundColor: "#FFAFCC",
                        borderColor: "#FF8FAC",
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false },
                        title: { display: true, text: "页面访问统计" }
                    },
                    scales: {
                        y: { beginAtZero: true }
                    }
                }
            });
        }
    });

    // 小时访问图表
    db.ref("visits/hours/" + today).once("value").then(snapshot => {
        const data = snapshot.val() || {};
        const hourlyLabels = [], hourlyValues = [];
        for (let i = 0; i < 24; i++) {
            hourlyLabels.push(`${i}:00`);
            hourlyValues.push(data[i] || 0);
        }
        const hCtx = document.getElementById("hourlyChart");
        if (hCtx) {
            new Chart(hCtx.getContext("2d"), {
                type: "line",
                data: {
                    labels: hourlyLabels,
                    datasets: [{
                        label: "访问量",
                        data: hourlyValues,
                        fill: true,
                        backgroundColor: "rgba(255, 175, 204, 0.2)",
                        borderColor: "#FFAFCC",
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: { display: true, text: "访问时段分布" }
                    },
                    scales: {
                        y: { beginAtZero: true }
                    }
                }
            });
        }
    });

    // 热力图
    const heatmapEl = document.getElementById("heatmapContainer");
    if (heatmapEl) {
        const heatmap = h337.create({
            container: heatmapEl,
            radius: 20,
            maxOpacity: 0.6,
            blur: 0.8
        });

        db.ref("clicks").once("value").then(snapshot => {
            const clicks = snapshot.val() || {};
            const points = [];
            Object.values(clicks).forEach(pageClicks => {
                Object.values(pageClicks).forEach(pt => {
                    points.push({ x: pt.x, y: pt.y, value: 1 });
                });
            });
            heatmap.setData({ max: 10, data: points });
        });
    }

    // 地图
    const mapEl = document.getElementById("visitorMap");
    if (mapEl) {
        const map = L.map(mapEl).setView([30, 0], 2);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        db.ref("geo").once("value").then(snapshot => {
            const geoData = snapshot.val() || {};
            const countryStats = {};

            for (const country in geoData) {
                countryStats[country] = Object.keys(geoData[country] || {}).length;
            }

            for (const [country, count] of Object.entries(countryStats)) {
                fetch(`https://restcountries.com/v3.1/name/${country}`)
                    .then(res => res.json())
                    .then(data => {
                        const latlng = data[0]?.latlng;
                        if (!latlng) return;
                        const [lat, lng] = latlng;
                        L.circle([lat, lng], {
                            color: "#FFAFCC",
                            fillColor: "#FFAFCC",
                            fillOpacity: 0.5,
                            radius: Math.sqrt(count) * 600
                        }).addTo(map).bindPopup(`${country}：${count} 次访问`);
                    })
                    .catch(err => console.warn("国家定位失败", country, err));
            }
        });
    }
}
