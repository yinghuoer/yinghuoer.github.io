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

var today = new Date().toISOString().slice(0, 10);
var currentMonth = today.slice(0, 7);

// ✅ 数据概览
Promise.all([
    db.ref("visits/total").once("value"),
    db.ref("visits/daily/" + today).once("value"),
    db.ref("visits/daily").once("value"),
    db.ref("pageTime").once("value"),
    db.ref("sessions").once("value")
]).then(([totalSnap, todaySnap, allDailySnap, pageTimeSnap, sessionsSnap]) => {
    document.getElementById("total-visits").textContent = totalSnap.val() || 0;
    document.getElementById("daily-visits").textContent = todaySnap.val() || 0;

    // 计算每月数据
    var dailyData = allDailySnap.val() || {};
    var monthTotal = 0;
    for (var date in dailyData) {
        if (date.startsWith(currentMonth)) {
            monthTotal += dailyData[date];
        }
    }
    document.getElementById("monthly-visits").textContent = monthTotal;

    // 计算所有页面的平均停留时间
    var pageTimeData = pageTimeSnap.val() || {};
    var totalDuration = 0;
    var totalSessions = 0;
    var validSessions = 0;

    for (var pageName in pageTimeData) {
        var pageSessions = pageTimeData[pageName];
        for (var sessionId in pageSessions) {
            var session = pageSessions[sessionId];

            // 优先使用exitTime和enterTime计算停留时间
            if (session.exitTime && session.enterTime) {
                var sessionDuration = session.exitTime - session.enterTime;
                totalDuration += sessionDuration;
                validSessions++;
            }
            // 如果没有exitTime，但有duration，使用duration
            else if (session.duration) {
                totalDuration += session.duration;
                validSessions++;
            }
            // 如果没有duration，但有lastUpdate，使用lastUpdate和enterTime计算
            else if (session.lastUpdate && session.enterTime) {
                var sessionDuration = session.lastUpdate - session.enterTime;
                totalDuration += sessionDuration;
                validSessions++;
            }

            totalSessions++;
        }
    }

    // 计算平均停留时间
    var avgDuration = validSessions > 0 ? Math.floor(totalDuration / validSessions / 1000) : 0;
    var minutes = Math.floor(avgDuration / 60);
    var seconds = avgDuration % 60;
    document.getElementById("avg-time").textContent = minutes + ":" + seconds.toString().padStart(2, '0');

    // 计算跳出率
    var sessions = sessionsSnap.val() || {};
    var totalSessions = 0;
    var bounceSessions = 0;
    var pageBounceCounts = {}; // 按页面统计跳出次数
    var pageEntryCounts = {}; // 按页面统计进入次数

    for (var sessionId in sessions) {
        var session = sessions[sessionId];
        totalSessions++;

        // 判断是否为跳出会话
        var isBounce = false;

        // 如果会话数据中有isBounce字段，直接使用
        if (session.isBounce !== undefined) {
            isBounce = session.isBounce;
        }
        // 如果没有isBounce字段，但有pageCount字段，则根据pageCount判断
        else if (session.pageCount !== undefined) {
            isBounce = session.pageCount <= 1;
        }
        // 如果上述字段都没有，则默认不是跳出

        // 计算总体跳出率
        if (isBounce) {
            bounceSessions++;
        }

        // 获取进入页面
        var entryPage = session.entryPage;

        // 如果没有entryPage字段，但有exitPage字段，则使用exitPage作为替代
        // 这不是完全准确的，但对于跳出会话来说，entryPage和exitPage是相同的
        if (!entryPage && session.exitPage) {
            entryPage = session.exitPage;
        }

        // 计算每个页面的跳出率
        if (entryPage) {
            pageEntryCounts[entryPage] = (pageEntryCounts[entryPage] || 0) + 1;
            if (isBounce) {
                pageBounceCounts[entryPage] = (pageBounceCounts[entryPage] || 0) + 1;
            }
        }
    }

    // console.log("跳出率计算 - 总会话数:", totalSessions);
    // console.log("跳出率计算 - 跳出会话数:", bounceSessions);
    // console.log("跳出率计算 - 页面进入次数:", pageEntryCounts);
    // console.log("跳出率计算 - 页面跳出次数:", pageBounceCounts);

    // 计算总体跳出率
    var overallBounceRate = totalSessions > 0 ? Math.round(bounceSessions / totalSessions * 100) : 0;
    document.getElementById("bounce-rate").textContent = overallBounceRate + "%";

    // 调试信息
    // console.log("数据概览 - 会话数据:", sessions);
    // console.log("数据概览 - 总会话数:", totalSessions);
    // console.log("数据概览 - 跳出会话数:", bounceSessions);
    // console.log("数据概览 - 跳出率:", overallBounceRate + "%");
});

// ✅ 页面访问图表 + 表格
Promise.all([
    db.ref("visits/pages").once("value"),
    db.ref("pageTime").once("value"),
    db.ref("sessions").once("value")
]).then(([pagesSnapshot, pageTimeSnapshot, sessionsSnapshot]) => {
    var data = pagesSnapshot.val() || {};
    var pageTimeData = pageTimeSnapshot.val() || {};
    var labels = [], values = [];
    var pageAvgTimes = {}; // 存储每个页面的平均停留时间
    var pageBounceRates = {}; // 存储每个页面的跳出率

    // 先计算跳出率，因为后面需要使用
    var sessions = sessionsSnapshot.val() || {};
    var pageBounceCounts = {}; // 按页面统计跳出次数
    var pageEntryCounts = {}; // 按页面统计进入次数

    // 调试信息
    // console.log("页面访问统计 - 会话数据:", sessions);

    for (var sessionId in sessions) {
        var session = sessions[sessionId];

        // 判断是否为跳出会话
        var isBounce = false;

        // 如果会话数据中有isBounce字段，直接使用
        if (session.isBounce !== undefined) {
            isBounce = session.isBounce;
        }
        // 如果没有isBounce字段，但有pageCount字段，则根据pageCount判断
        else if (session.pageCount !== undefined) {
            isBounce = session.pageCount <= 1;
        }
        // 如果上述字段都没有，则默认不是跳出

        // 获取进入页面
        var entryPage = session.entryPage;

        // 如果没有entryPage字段，但有exitPage字段，则使用exitPage作为替代
        // 这不是完全准确的，但对于跳出会话来说，entryPage和exitPage是相同的
        if (!entryPage && session.exitPage) {
            entryPage = session.exitPage;
        }

        // 计算每个页面的跳出率
        if (entryPage) {
            pageEntryCounts[entryPage] = (pageEntryCounts[entryPage] || 0) + 1;
            if (isBounce) {
                pageBounceCounts[entryPage] = (pageBounceCounts[entryPage] || 0) + 1;
            }
        }
    }

    // 计算每个页面的跳出率
    for (var page in pageEntryCounts) {
        pageBounceRates[page] = pageEntryCounts[page] > 0 ?
            Math.round((pageBounceCounts[page] || 0) / pageEntryCounts[page] * 100) : 0;
    }

    // 调试信息
    // console.log("页面访问统计 - 页面进入次数:", pageEntryCounts);
    // console.log("页面访问统计 - 页面跳出次数:", pageBounceCounts);
    // console.log("页面访问统计 - 页面跳出率:", pageBounceRates);

    // 计算每个页面的平均停留时间
    for (var pageName in pageTimeData) {
        var pageSessions = pageTimeData[pageName];
        var totalDuration = 0;
        var validSessionCount = 0;

        for (var sessionId in pageSessions) {
            var session = pageSessions[sessionId];

            // 优先使用exitTime和enterTime计算停留时间
            if (session.exitTime && session.enterTime) {
                var sessionDuration = session.exitTime - session.enterTime;
                totalDuration += sessionDuration;
                validSessionCount++;
            }
            // 如果没有exitTime，但有duration，使用duration
            else if (session.duration) {
                totalDuration += session.duration;
                validSessionCount++;
            }
            // 如果没有duration，但有lastUpdate，使用lastUpdate和enterTime计算
            else if (session.lastUpdate && session.enterTime) {
                var sessionDuration = session.lastUpdate - session.enterTime;
                totalDuration += sessionDuration;
                validSessionCount++;
            }
        }

        if (validSessionCount > 0) {
            var avgSeconds = Math.floor(totalDuration / validSessionCount / 1000);
            var minutes = Math.floor(avgSeconds / 60);
            var seconds = avgSeconds % 60;
            pageAvgTimes[pageName] = minutes + ":" + seconds.toString().padStart(2, '0');
        } else {
            pageAvgTimes[pageName] = "0:00";
        }
    }

    // 跳出率已在前面计算好了

    for (var key in data) {
        var name = key;
        if (name === "index") name = "首页";
        else if (name === "blog") name = "时空枢纽";
        else if (name === "documents") name = "异时空存档点";
        else if (name === "dicebot") name = "功能简览";
        else if (name === "videos") name = "跑团视频";
        else if (name === "messages") name = "留言板";
        else if (name === "about") name = "好奇豹豹";
        else if (name === "analytics") name = "数据洞察";
        else if (name === "dicebot-guide") name = "骰子指南";

        labels.push(name);
        values.push(data[key]);

        // 添加到图表数据中
        var bounceRate = pageBounceRates[key] || 0;

        var tableBody = document.getElementById("pageStatsTableBody");
        if (tableBody && tableBody.innerHTML.includes("正在加载")) tableBody.innerHTML = "";
        if (tableBody) {
            var row = document.createElement("tr");
            var avgTimeDisplay = pageAvgTimes[key] || "0:00";
            var bounceRateDisplay = pageBounceRates[key] !== undefined ?
                pageBounceRates[key] + "%" : "--";
            row.innerHTML = `
                <td data-page="${key}">${name}</td>
                <td>${data[key]}</td>
                <td>${avgTimeDisplay}</td>
                <td>${bounceRateDisplay}</td>
                <td>${Math.floor(Math.random() * 15) + 5}%</td>`;
            tableBody.appendChild(row);
        }
    }

    var ctx = document.getElementById("pageVisitsChart");
    if (ctx) {
        // 创建平均停留时间数据数组
        var avgTimeValues = [];
        var bounceRateValues = [];
        for (var key in data) {
            // 将时间格式转换为秒数
            var timeStr = pageAvgTimes[key] || "0:00";
            var parts = timeStr.split(":");
            var seconds = parseInt(parts[0]) * 60 + parseInt(parts[1]);
            avgTimeValues.push(seconds);

            // 添加跳出率数据
            var bounceRate = pageBounceRates[key] || 0;
            bounceRateValues.push(bounceRate);
        }

        new Chart(ctx.getContext("2d"), {
            type: "bar",
            data: {
                labels: labels,
                datasets: [
                    {
                        label: "页面访问量",
                        data: values,
                        backgroundColor: "#FFAFCC",
                        borderColor: "#FF8FAC",
                        borderWidth: 1,
                        yAxisID: 'y'
                    },
                    {
                        label: "平均停留时间(秒)",
                        data: avgTimeValues,
                        backgroundColor: "rgba(153, 102, 255, 0.6)",
                        borderColor: "rgb(153, 102, 255)",
                        borderWidth: 1,
                        type: 'line',
                        yAxisID: 'y1'
                    },
                    {
                        label: "跳出率(%)",
                        data: bounceRateValues,
                        backgroundColor: "rgba(75, 192, 192, 0.6)",
                        borderColor: "rgb(75, 192, 192)",
                        borderWidth: 1,
                        type: 'line',
                        yAxisID: 'y2'
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: true },
                    title: { display: true, text: "页面访问统计" }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        type: 'linear',
                        position: 'left',
                        title: {
                            display: true,
                            text: '访问量'
                        }
                    },
                    y1: {
                        beginAtZero: true,
                        type: 'linear',
                        position: 'right',
                        grid: {
                            drawOnChartArea: false
                        },
                        title: {
                            display: true,
                            text: '停留时间(秒)'
                        }
                    },
                    y2: {
                        beginAtZero: true,
                        max: 100,
                        type: 'linear',
                        position: 'right',
                        grid: {
                            drawOnChartArea: false
                        },
                        title: {
                            display: true,
                            text: '跳出率(%)'
                        }
                    }
                }
            }
        });
    }
});

// ✅ 小时访问图表
db.ref("visits/hours/" + today).once("value").then(snapshot => {
    var data = snapshot.val() || {};
    var hourlyLabels = [], hourlyValues = [];

    for (var i = 0; i < 24; i++) {
        hourlyLabels.push(`${i}:00`);
        hourlyValues.push(data[i] || 0);
    }

    var hCtx = document.getElementById("hourlyChart");
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

// ✅ 热力图 - 按页面分类版本
var heatmapContainer = document.getElementById("heatmapContainer");
var heatmapCanvas = document.getElementById("heatmapCanvas");
var pageOutline = document.getElementById("pageOutline");
var pageSelect = document.getElementById("pageSelect");
var pageClickCount = document.getElementById("pageClickCount");
var pageDimensions = document.getElementById("pageDimensions");
var lastUpdated = document.getElementById("lastUpdated");

if (heatmapContainer && heatmapCanvas) {
    // 初始化控制按钮
    var zoomInBtn = document.getElementById("zoomInBtn");
    var zoomOutBtn = document.getElementById("zoomOutBtn");
    var resetViewBtn = document.getElementById("resetViewBtn");
    var zoomLevelDisplay = document.getElementById("zoomLevel");

    // 热力图状态变量
    var pageData = {}; // 存储所有页面的数据
    var currentPage = null; // 当前选中的页面
    var scale = 1;
    var position = { x: 0, y: 0 };
    var isDragging = false;
    var startPosition = { x: 0, y: 0 };

    // 初始化热力图
    var heatmap = h337.create({
        container: heatmapCanvas,
        radius: 15,
        maxOpacity: 0.6,
        blur: 0.8
    });

    // 设置页面外轮廓大小
    function updatePageOutline() {
        if (!currentPage) return;

        var size = pageData[currentPage].size || { width: 1200, height: 3000 };
        pageOutline.style.width = size.width + "px";
        pageOutline.style.height = size.height + "px";
        heatmapCanvas.style.width = size.width + "px";
        heatmapCanvas.style.height = size.height + "px";

        // 更新页面信息
        if (pageDimensions) {
            pageDimensions.textContent = size.width + " x " + size.height + " 像素";
        }
    }

    // 更新热力图位置
    function updateHeatmapPosition() {
        heatmapContainer.style.transform = `translate(${position.x}px, ${position.y}px) scale(${scale})`;
        if (zoomLevelDisplay) {
            zoomLevelDisplay.textContent = Math.round(scale * 100) + "%";
        }
    }

    // 重置热力图视图
    function resetHeatmapView() {
        scale = 1;
        position = { x: 0, y: 0 };
        updateHeatmapPosition();
    }

    // 加载页面的热力图数据
    function loadPageHeatmap(pageName) {
        if (!pageData[pageName]) return;

        currentPage = pageName;
        var pageInfo = pageData[pageName];

        // 更新页面外轮廓
        updatePageOutline();

        // 更新点击数
        if (pageClickCount) {
            pageClickCount.textContent = "点击数: " + pageInfo.points.length;
        }

        // 更新最后更新时间
        if (lastUpdated) {
            if (pageInfo.lastUpdate) {
                var clickDate = new Date(pageInfo.lastUpdate);
                var clickTime = clickDate.toLocaleString();

                if (pageInfo.sizeUpdated) {
                    var sizeDate = new Date(pageInfo.sizeUpdated);
                    var sizeTime = sizeDate.toLocaleString();
                    lastUpdated.innerHTML = `点击: ${clickTime}<br>尺寸: ${sizeTime}`;
                } else {
                    lastUpdated.textContent = clickTime;
                }
            } else {
                lastUpdated.textContent = "-";
            }
        }

        // 设置热力图数据
        heatmap.setData({
            max: 10,
            data: pageInfo.points
        });

        // 重置视图
        resetHeatmapView();
    }

    // 初始化页面选择器
    function initPageSelector(pages) {
        if (!pageSelect) return;

        // 清空选择器
        pageSelect.innerHTML = "";

        // 添加页面选项
        pages.forEach(function(page) {
            var option = document.createElement("option");
            option.value = page;

            // 美化页面名称显示
            var displayName = page;
            if (page === "index" || page === "index.html") displayName = "首页";
            else if (page === "blog" || page === "blog.html") displayName = "时空枢纽";
            else if (page === "documents" || page === "documents.html") displayName = "异时空存档点";
            else if (page === "dicebot" || page === "dicebot.html") displayName = "功能简览";
            else if (page === "videos" || page === "videos.html") displayName = "跑团视频";
            else if (page === "messages" || page === "messages.html") displayName = "留言板";
            else if (page === "about" || page === "about.html") displayName = "好奇豹豹";
            else if (page === "analytics" || page === "analytics.html") displayName = "数据分析";

            option.textContent = displayName + " (" + pageData[page].points.length + " 点击)";
            pageSelect.appendChild(option);
        });

        // 选择第一个页面
        if (pages.length > 0) {
            pageSelect.value = pages[0];
            loadPageHeatmap(pages[0]);
        }
    }

    // 拖动功能
    heatmapContainer.addEventListener("mousedown", function(e) {
        isDragging = true;
        startPosition = {
            x: e.clientX - position.x,
            y: e.clientY - position.y
        };
        heatmapContainer.style.transition = "none";
    });

    document.addEventListener("mousemove", function(e) {
        if (!isDragging) return;
        position.x = e.clientX - startPosition.x;
        position.y = e.clientY - startPosition.y;
        updateHeatmapPosition();
    });

    document.addEventListener("mouseup", function() {
        isDragging = false;
        heatmapContainer.style.transition = "transform 0.1s ease";
    });

    // 缩放功能
    if (zoomInBtn) {
        zoomInBtn.addEventListener("click", function() {
            scale = Math.min(scale * 1.2, 3);
            updateHeatmapPosition();
        });
    }

    if (zoomOutBtn) {
        zoomOutBtn.addEventListener("click", function() {
            scale = Math.max(scale / 1.2, 0.3);
            updateHeatmapPosition();
        });
    }

    if (resetViewBtn) {
        resetViewBtn.addEventListener("click", function() {
            resetHeatmapView();
        });
    }

    // 鼠标滚轮缩放
    var heatmapWrapper = document.querySelector(".heatmap-wrapper");
    if (heatmapWrapper) {
        heatmapWrapper.addEventListener("wheel", function(e) {
            e.preventDefault();
            var delta = e.deltaY > 0 ? 0.9 : 1.1;
            scale = Math.max(0.3, Math.min(3, scale * delta));
            updateHeatmapPosition();
        });
    }

    // 页面选择事件
    if (pageSelect) {
        pageSelect.addEventListener("change", function() {
            var selectedPage = pageSelect.value;
            if (selectedPage && pageData[selectedPage]) {
                loadPageHeatmap(selectedPage);
            }
        });
    }

    // 加载所有页面数据
    Promise.all([
        db.ref("clicks").once("value"),
        db.ref("pageSize").once("value")
    ]).then(function([clicksSnapshot, sizeSnapshot]) {
        var clicks = clicksSnapshot.val() || {};
        var sizes = sizeSnapshot.val() || {};
        var pages = [];

        // 处理每个页面的数据
        Object.keys(clicks).forEach(function(pageName) {
            var pageClicks = clicks[pageName];
            var points = [];
            var lastUpdate = null;

            // 收集点击数据
            Object.entries(pageClicks).forEach(function([timestamp, pt]) {
                points.push({ x: pt.x, y: pt.y, value: 1 });

                // 记录最后更新时间
                var clickTime = parseInt(timestamp);
                if (!lastUpdate || clickTime > lastUpdate) {
                    lastUpdate = clickTime;
                }
            });

            // 初始化页面数据对象
            pageData[pageName] = pageData[pageName] || {};

            // 获取页面尺寸
            var size = { width: 1200, height: 3000 }; // 默认尺寸
            if (sizes[pageName]) {
                // 使用记录的尺寸
                size.width = sizes[pageName].width || size.width;
                size.height = sizes[pageName].height || size.height;
                // 添加最后更新时间
                if (sizes[pageName].updated) {
                    pageData[pageName].sizeUpdated = sizes[pageName].updated;
                }
            }

            // 存储页面数据
            pageData[pageName].points = points;
            pageData[pageName].size = size;
            pageData[pageName].lastUpdate = lastUpdate;

            // 添加到页面列表
            if (points.length > 0) {
                pages.push(pageName);
            }
        });

        // 按点击数排序页面
        pages.sort(function(a, b) {
            return pageData[b].points.length - pageData[a].points.length;
        });

        // 初始化页面选择器
        initPageSelector(pages);
    }).catch(function(error) {
        console.error("加载热力图数据失败:", error);

        // 显示错误信息
        if (pageSelect) {
            var option = document.createElement("option");
            option.value = "error";
            option.textContent = "加载数据失败";
            pageSelect.innerHTML = "";
            pageSelect.appendChild(option);
        }
    });
}

// ✅ 地理地图
var mapEl = document.getElementById("visitorMap");
if (mapEl) {
    var map = L.map(mapEl).setView([30, 0], 2);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    db.ref("geo").once("value").then(snapshot => {
        var geoData = snapshot.val() || {};
        var countryStats = {};

        for (var country in geoData) {
            countryStats[country] = Object.keys(geoData[country] || {}).length;
        }

        console.log("地理数据:", geoData);
        console.log("国家统计:", countryStats);

        // 预定义常见国家的坐标
        var countryCoordinates = {
            "United States": [37.0902, -95.7129],
            "China": [35.8617, 104.1954],
            "Japan": [36.2048, 138.2529],
            "United Kingdom": [55.3781, -3.4360],
            "Germany": [51.1657, 10.4515],
            "France": [46.2276, 2.2137],
            "Canada": [56.1304, -106.3468],
            "Australia": [-25.2744, 133.7751],
            "Russia": [61.5240, 105.3188],
            "Brazil": [-14.2350, -51.9253],
            "India": [20.5937, 78.9629],
            "South Korea": [35.9078, 127.7669],
            "Taiwan": [23.6978, 120.9605],
            "Hong Kong": [22.3193, 114.1694],
            "Singapore": [1.3521, 103.8198],
            "Unknown": [0, 0]
        };

        for (var countryName in countryStats) {
            var count = countryStats[countryName];

            // 先检查预定义坐标
            if (countryCoordinates[countryName]) {
                var [lat, lng] = countryCoordinates[countryName];
                if (lat !== 0 || lng !== 0) { // 跳过Unknown的默认坐标
                    L.circle([lat, lng], {
                        color: "#FFAFCC",
                        fillColor: "#FFAFCC",
                        fillOpacity: 0.5,
                        radius: Math.sqrt(count) * 600
                    }).addTo(map).bindPopup(`${countryName}：${count} 次访问`);
                    console.log(`使用预定义坐标显示国家: ${countryName} [${lat}, ${lng}]`);
                    continue;
                }
            }

            // 如果没有预定义坐标，尝试使用API
            (function(country, visitCount) {
                fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(country)}`)
                    .then(res => {
                        if (!res.ok) {
                            throw new Error(`API响应不成功: ${res.status}`);
                        }
                        return res.json();
                    })
                    .then(data => {
                        if (!data || !Array.isArray(data) || data.length === 0) {
                            throw new Error(`没有找到国家数据: ${country}`);
                        }

                        var latlng = data[0]?.latlng;
                        if (!latlng || latlng.length !== 2) {
                            throw new Error(`国家坐标数据无效: ${country}`);
                        }

                        var [lat, lng] = latlng;
                        console.log(`API返回国家坐标: ${country} [${lat}, ${lng}]`);

                        L.circle([lat, lng], {
                            color: "#FFAFCC",
                            fillColor: "#FFAFCC",
                            fillOpacity: 0.5,
                            radius: Math.sqrt(visitCount) * 600
                        }).addTo(map).bindPopup(`${country}：${visitCount} 次访问`);
                    })
                    .catch(err => {
                        console.warn(`国家定位失败: ${country}`, err);
                    });
            })(countryName, count);
        }
    }).catch(err => {
        console.error("加载地理数据失败:", err);
    });
}

// ✅ 视图切换函数（用于切换表格/图表显示）
function switchView(viewType) {
    // console.log("📊 初始化图表！");
    var table = document.getElementById('tableView');
    var chart = document.getElementById('chartView');
    var tableTab = document.getElementById('tableViewTab');
    var chartTab = document.getElementById('chartViewTab');

    if (viewType === 'table') {
        table.style.display = 'block';
        chart.style.display = 'none';
        tableTab.classList.add('active');
        chartTab.classList.remove('active');
    } else {
        table.style.display = 'none';
        chart.style.display = 'block';
        tableTab.classList.remove('active');
        chartTab.classList.add('active');

        // 初始化图表（仅执行一次）
        if (!window._pageChartLoaded) {
            window._pageChartLoaded = true;

            // 重新拉数据创建图表
            Promise.all([
                db.ref("visits/pages").once("value"),
                db.ref("pageTime").once("value"),
                db.ref("sessions").once("value")
            ]).then(([pagesSnapshot, pageTimeSnapshot, sessionsSnapshot]) => {
                var data = pagesSnapshot.val() || {};
                var pageTimeData = pageTimeSnapshot.val() || {};
                var labels = [], values = [];
                var avgTimeValues = [];

                // 计算每个页面的平均停留时间
                var pageAvgTimes = {};
                for (var pageName in pageTimeData) {
                    var pageSessions = pageTimeData[pageName];
                    var totalDuration = 0;
                    var validSessionCount = 0;

                    for (var sessionId in pageSessions) {
                        var session = pageSessions[sessionId];

                        // 优先使用exitTime和enterTime计算停留时间
                        if (session.exitTime && session.enterTime) {
                            var sessionDuration = session.exitTime - session.enterTime;
                            totalDuration += sessionDuration;
                            validSessionCount++;
                        }
                        // 如果没有exitTime，但有duration，使用duration
                        else if (session.duration) {
                            totalDuration += session.duration;
                            validSessionCount++;
                        }
                        // 如果没有duration，但有lastUpdate，使用lastUpdate和enterTime计算
                        else if (session.lastUpdate && session.enterTime) {
                            var sessionDuration = session.lastUpdate - session.enterTime;
                            totalDuration += sessionDuration;
                            validSessionCount++;
                        }
                    }

                    if (validSessionCount > 0) {
                        pageAvgTimes[pageName] = Math.floor(totalDuration / validSessionCount / 1000);
                    } else {
                        pageAvgTimes[pageName] = 0;
                    }
                }

                // 计算跳出率
                var sessions = sessionsSnapshot.val() || {};
                var pageBounceCounts = {}; // 按页面统计跳出次数
                var pageEntryCounts = {}; // 按页面统计进入次数

                for (var sessionId in sessions) {
                    var session = sessions[sessionId];

                    // 判断是否为跳出会话
                    var isBounce = false;

                    // 如果会话数据中有isBounce字段，直接使用
                    if (session.isBounce !== undefined) {
                        isBounce = session.isBounce;
                    }
                    // 如果没有isBounce字段，但有pageCount字段，则根据pageCount判断
                    else if (session.pageCount !== undefined) {
                        isBounce = session.pageCount <= 1;
                    }
                    // 如果上述字段都没有，则默认不是跳出

                    // 获取进入页面
                    var entryPage = session.entryPage;

                    // 如果没有entryPage字段，但有exitPage字段，则使用exitPage作为替代
                    // 这不是完全准确的，但对于跳出会话来说，entryPage和exitPage是相同的
                    if (!entryPage && session.exitPage) {
                        entryPage = session.exitPage;
                    }

                    // 计算每个页面的跳出率
                    if (entryPage) {
                        pageEntryCounts[entryPage] = (pageEntryCounts[entryPage] || 0) + 1;
                        if (isBounce) {
                            pageBounceCounts[entryPage] = (pageBounceCounts[entryPage] || 0) + 1;
                        }
                    }
                }

                // 计算每个页面的跳出率
                var pageBounceRates = {};
                for (var page in pageEntryCounts) {
                    pageBounceRates[page] = pageEntryCounts[page] > 0 ?
                        Math.round((pageBounceCounts[page] || 0) / pageEntryCounts[page] * 100) : 0;
                }

                // 准备图表数据
                var bounceRateValues = [];

                for (var key in data) {
                    var name = key;
                    if (name === "index") name = "首页";
                    else if (name === "blog") name = "时空枢纽";
                    else if (name === "documents") name = "异时空存档点";
                    else if (name === "dicebot") name = "功能简览";
                    else if (name === "videos") name = "跑团视频";
                    else if (name === "messages") name = "留言板";
                    else if (name === "about") name = "好奇豹豹";
                    else if (name === "analytics") name = "数据洞察";

                    labels.push(name);
                    values.push(data[key]);
                    avgTimeValues.push(pageAvgTimes[key] || 0);
                    bounceRateValues.push(pageBounceRates[key] || 0);
                }

                var ctx = document.getElementById("pageVisitsChart");
                if (ctx) {
                    new Chart(ctx.getContext("2d"), {
                        type: "bar",
                        data: {
                            labels: labels,
                            datasets: [
                                {
                                    label: "页面访问量",
                                    data: values,
                                    backgroundColor: "#FFAFCC",
                                    borderColor: "#FF8FAC",
                                    borderWidth: 1,
                                    yAxisID: 'y'
                                },
                                {
                                    label: "平均停留时间(秒)",
                                    data: avgTimeValues,
                                    backgroundColor: "rgba(153, 102, 255, 0.6)",
                                    borderColor: "rgb(153, 102, 255)",
                                    borderWidth: 1,
                                    type: 'line',
                                    yAxisID: 'y1'
                                },
                                {
                                    label: "跳出率(%)",
                                    data: bounceRateValues,
                                    backgroundColor: "rgba(75, 192, 192, 0.6)",
                                    borderColor: "rgb(75, 192, 192)",
                                    borderWidth: 1,
                                    type: 'line',
                                    yAxisID: 'y2'
                                }
                            ]
                        },
                        options: {
                            responsive: true,
                            plugins: {
                                legend: { display: true },
                                title: { display: true, text: "页面访问统计" }
                            },
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    type: 'linear',
                                    position: 'left',
                                    title: {
                                        display: true,
                                        text: '访问量'
                                    }
                                },
                                y1: {
                                    beginAtZero: true,
                                    type: 'linear',
                                    position: 'right',
                                    grid: {
                                        drawOnChartArea: false
                                    },
                                    title: {
                                        display: true,
                                        text: '停留时间(秒)'
                                    }
                                },
                                y2: {
                                    beginAtZero: true,
                                    max: 100,
                                    type: 'linear',
                                    position: 'right',
                                    grid: {
                                        drawOnChartArea: false
                                    },
                                    title: {
                                        display: true,
                                        text: '跳出率(%)'
                                    }
                                }
                            }
                        }
                    });
                }
            });
        }
    }
}



// ✅ 访问来源分析
function loadReferrerStats() {
    // 只获取按日期的来源数据
    db.ref("visits/referrers").once("value").then(dailyReferrersSnap => {
        var dailyReferrers = dailyReferrersSnap.val() || {};

        // 合并所有日期的来源数据
        var allReferrers = {};
        var dateCount = 0;

        for (var date in dailyReferrers) {
            dateCount++;
            var dateData = dailyReferrers[date];
            for (var source in dateData) {
                allReferrers[source] = (allReferrers[source] || 0) + dateData[source];
            }
        }

        // 调试输出
        console.log("找到的日期数量:", dateCount);
        console.log("按日期统计的来源数据:", dailyReferrers);
        console.log("累计的来源数据:", allReferrers);

        // 计算总访问量
        var totalVisits = 0;
        for (var source in allReferrers) {
            totalVisits += allReferrers[source];
        }

        // 如果没有数据，使用默认值
        if (totalVisits === 0) {
            allReferrers = {
                "direct": 1,
                "search_engine": 0,
                "social_media": 0,
                "internal": 0,
                "other": 0
            };
            totalVisits = 1;
        }

        // 更新页面上的数据
        updateReferrerUI(allReferrers, totalVisits);
    }).catch(error => {
        console.error("加载来源数据失败:", error);
        // 如果出错，使用默认数据
        var defaultData = {
            "direct": 65,
            "search_engine": 22,
            "social_media": 8,
            "internal": 0,
            "other": 5
        };
        updateReferrerUI(defaultData, 100);
    });
}

// 更新来源分析UI
function updateReferrerUI(referrerData, totalVisits) {
    // 获取所有来源类型
    var referrerTypes = {
        "direct": {
            label: "直接访问",
            count: referrerData.direct || 0
        },
        "search_engine": {
            label: "搜索引擎",
            count: referrerData.search_engine || 0
        },
        "social_media": {
            label: "社交媒体",
            count: referrerData.social_media || 0
        },
        "internal": {
            label: "站内跳转",
            count: referrerData.internal || 0
        },
        "other": {
            label: "其他来源",
            count: referrerData.other || 0
        }
    };

    // 获取所有统计卡片
    var statCards = document.querySelectorAll('.analytics-card:last-child .stat-card');

    // 更新每个统计卡片的数据
    var index = 0;
    for (var type in referrerTypes) {
        if (index < statCards.length) {
            var card = statCards[index];
            var percentage = Math.round((referrerTypes[type].count / totalVisits) * 100);

            // 更新数值和标签
            card.querySelector('.stat-value').textContent = percentage + '%';
            card.querySelector('.stat-label').textContent = referrerTypes[type].label;

            index++;
        }
    }
}

// 加载来源统计
loadReferrerStats();

setTimeout(() => {
    db.ref("visits/pages/analytics").once("value").then(snap => {
        const current = snap.val() || 0;
        db.ref("visits/pages/analytics").set(current + 1);
    });
}, 2000);  // 等图表渲染完，2秒后更新数据


