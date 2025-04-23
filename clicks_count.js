// 使用统一的 Firebase 实例
const { rtdb } = window.firebaseInstances;
var db = rtdb; // 保持兼容性

// ✅ 当前页面识别
var fullPath = window.location.pathname;
var page = fullPath.substring(fullPath.lastIndexOf('/') + 1) || 'index';
page = page.replace('.html', ''); // index.html -> index
var isAnalyticsPage = page === "analytics";

var today = new Date().toISOString().slice(0, 10);
var hour = new Date().getHours();
var pageEnterTime = Date.now(); // 记录进入页面的时间

// ✅ 获取来源信息
var referrer = document.referrer || "direct";
var referrerDomain = "direct";

// 如果有来源，提取域名
if (referrer && referrer !== "direct") {
    try {
        var urlObj = new URL(referrer);
        referrerDomain = urlObj.hostname;

        // 对常见搜索引擎和社交媒体进行分类
        if (referrerDomain.includes("google") ||
            referrerDomain.includes("bing") ||
            referrerDomain.includes("baidu") ||
            referrerDomain.includes("sogou") ||
            referrerDomain.includes("so.com")) {
            referrerDomain = "search_engine";
        } else if (referrerDomain.includes("weibo") ||
                   referrerDomain.includes("t.co") ||
                   referrerDomain.includes("facebook") ||
                   referrerDomain.includes("twitter") ||
                   referrerDomain.includes("instagram") ||
                   referrerDomain.includes("douyin") ||
                   referrerDomain.includes("tiktok")) {
            referrerDomain = "social_media";
        } else if (referrerDomain === window.location.hostname) {
            referrerDomain = "internal";
        } else {
            referrerDomain = "other";
        }
    } catch (e) {
        console.warn("解析来源URL失败:", e);
        referrerDomain = "other";
    }
}

console.log("访问来源:", referrerDomain, referrer);

// ✅ 会话跟踪与跳出率计算
var SESSION_TIMEOUT = 30 * 60 * 1000; // 30分钟会话超时

// 获取或创建会话ID
var sessionId = localStorage.getItem('foxseal_sessionId');
var sessionStart = parseInt(localStorage.getItem('foxseal_sessionStart') || '0');
var pageCount = parseInt(localStorage.getItem('foxseal_pageCount') || '0');
var isNewSession = false;

// 检查会话是否有效（如果超时或不存在则创建新会话）
if (!sessionId || (Date.now() - sessionStart) > SESSION_TIMEOUT) {
    // 创建新会话
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    sessionStart = Date.now();
    pageCount = 1;
    isNewSession = true;

    // 存储会话信息
    localStorage.setItem('foxseal_sessionId', sessionId);
    localStorage.setItem('foxseal_sessionStart', sessionStart.toString());
    localStorage.setItem('foxseal_pageCount', '1');
    localStorage.setItem('foxseal_entryPage', page);

    // 记录新会话
    if (!isAnalyticsPage) {
        var sessionData = {
            startTime: sessionStart,
            startTimeISO: new Date(sessionStart).toISOString(),
            entryPage: page,
            pageCount: 1,
            isBounce: true, // 默认为跳出，如果访问多个页面则更新
            lastUpdate: Date.now(),
            lastPage: page,
            referrer: referrer,
            referrerDomain: referrerDomain
        };

        console.log("创建新会话:", sessionId, sessionData);

        db.ref(`sessions/${sessionId}`).set(sessionData);
    }
} else {
    // 现有会话，更新页面计数
    pageCount++;
    localStorage.setItem('foxseal_pageCount', pageCount.toString());

    // 更新会话信息
    if (!isAnalyticsPage) {
        var updateData = {
            pageCount: pageCount,
            isBounce: false, // 访问了多个页面，不是跳出
            lastPage: page,
            lastUpdate: Date.now(),
            lastUpdateISO: new Date().toISOString()
        };

        console.log("更新现有会话:", sessionId, updateData);

        db.ref(`sessions/${sessionId}`).update(updateData);
    }
}

// ✅ 记录访问量（跳过 analytics 页面本身）
if (!isAnalyticsPage) {
    db.ref("visits/total").transaction(val => (val || 0) + 1);
    db.ref("visits/daily/" + today).transaction(val => (val || 0) + 1);
    db.ref("visits/pages/" + page).transaction(val => (val || 0) + 1);
    db.ref("visits/hours/" + today + "/" + hour).transaction(val => (val || 0) + 1);

    // 记录每日来源统计
    db.ref(`visits/referrers/${today}/${referrerDomain}`).transaction(val => (val || 0) + 1);
}

// ✅ 页面动态展示（所有页面都可展示）
db.ref("visits/total").on("value", snap => {
    var el = document.getElementById("total-counter");
    if (el) el.innerText = `共计 ${snap.val() || 0} 位旅者，已在此处留下灵魂的投影。`;
});
db.ref("visits/daily/" + today).on("value", snap => {
    var el = document.getElementById("daily-counter");
    if (el) el.innerText = `而今日，又有 ${snap.val() || 0} 人推开了命运之门……`;
});

// ✅ 记录页面尺寸（跳过 analytics）
if (!isAnalyticsPage) {
    // 页面加载完成后记录尺寸
    window.addEventListener("load", function() {
        // 获取页面实际尺寸（考虑滚动区域）
        var pageWidth = Math.max(
            document.documentElement.scrollWidth,
            document.body.scrollWidth,
            document.documentElement.clientWidth
        );
        var pageHeight = Math.max(
            document.documentElement.scrollHeight,
            document.body.scrollHeight,
            document.documentElement.clientHeight
        );

        // 记录页面尺寸
        db.ref(`pageSize/${page}`).set({
            width: pageWidth,
            height: pageHeight,
            updated: new Date().toISOString()
        });

        console.log(`页面尺寸已记录: ${page} (${pageWidth}x${pageHeight})`);
    });

    // ✅ 点击热力图记录
    document.addEventListener("click", function (e) {
        // 获取相对于文档的点击位置（考虑滚动）
        var x = e.pageX;
        var y = e.pageY;
        var timestamp = Date.now();

        db.ref(`clicks/${page}/${timestamp}`).set({
            x: x,
            y: y,
            time: new Date().toISOString()
        });
    });
}

// ✅ IP 地理记录（跳过 analytics）
if (!isAnalyticsPage) {
    // 检查缓存中是否有地理位置数据
    var cachedGeoData = localStorage.getItem('foxseal_geoData');
    var lastGeoFetch = localStorage.getItem('foxseal_lastGeoFetch');
    var now = Date.now();
    var ONE_DAY = 24 * 60 * 60 * 1000; // 24小时的毫秒数

    // 如果有缓存数据且不超过24小时，直接使用缓存数据
    if (cachedGeoData && lastGeoFetch && (now - parseInt(lastGeoFetch)) < ONE_DAY) {
        try {
            var geoData = JSON.parse(cachedGeoData);
            var country = geoData.country_name || "Unknown";
            var city = geoData.city || "Unknown";
            var timestamp = Date.now();
            db.ref(`geo/${country}/${timestamp}`).set({
                city: city,
                time: new Date().toISOString()
            });
            console.log("使用缓存的地理位置数据:", country, city);
        } catch (e) {
            console.warn("解析缓存的地理数据失败:", e);
            // 缓存数据无效，清除缓存
            localStorage.removeItem('foxseal_geoData');
            localStorage.removeItem('foxseal_lastGeoFetch');
        }
    } else {
        // 尝试多个地理位置 API
        fetchGeoLocation()
            .then(data => {
                if (!data) throw new Error("所有API请求失败");

                var country = data.country_name || "Unknown";
                var city = data.city || "Unknown";
                var timestamp = Date.now();

                // 存储到 Firebase
                db.ref(`geo/${country}/${timestamp}`).set({
                    city: city,
                    time: new Date().toISOString()
                });

                // 缓存地理数据
                localStorage.setItem('foxseal_geoData', JSON.stringify(data));
                localStorage.setItem('foxseal_lastGeoFetch', now.toString());

                console.log("获取并缓存新的地理位置数据:", country, city);
            })
            .catch(error => {
                console.warn("地理位置获取失败:", error);

                // 如果所有API都失败，使用“未知”作为默认值
                var timestamp = Date.now();
                db.ref(`geo/Unknown/${timestamp}`).set({
                    city: "Unknown",
                    time: new Date().toISOString()
                });
            });
    }
}

// 尝试多个地理位置 API
async function fetchGeoLocation() {
    // 尝试的API列表
    const apis = [
        { url: 'https://ipapi.co/json/', responseType: 'json' },
        { url: 'https://ipinfo.io/json', responseType: 'json' },
        { url: 'https://api.ipdata.co?api-key=test', responseType: 'json' },
        { url: 'https://api.ipgeolocation.io/ipgeo?apiKey=API_KEY', responseType: 'json' } // 替换为您的API密钥
    ];

    // 对每个API进行尝试，直到成功或全部失败
    for (const api of apis) {
        try {
            const response = await fetch(api.url, {
                method: 'GET',
                headers: { 'Accept': 'application/json' },
                timeout: 5000 // 5秒超时
            });

            if (!response.ok) {
                console.warn(`API ${api.url} 返回状态码: ${response.status}`);
                continue; // 尝试下一个API
            }

            const data = await response.json();

            // 根据不同API的响应格式标准化数据
            return standardizeGeoData(data, api.url);

        } catch (error) {
            console.warn(`API ${api.url} 请求失败:`, error);
            // 继续尝试下一个API
        }
    }

    // 所有API都失败了
    return null;
}

// 标准化不同API的地理数据格式
function standardizeGeoData(data, apiUrl) {
    // 默认值
    let standardData = {
        country_name: "Unknown",
        city: "Unknown"
    };

    try {
        if (apiUrl.includes('ipapi.co')) {
            // ipapi.co格式
            standardData.country_name = data.country_name || data.country || "Unknown";
            standardData.city = data.city || "Unknown";
        }
        else if (apiUrl.includes('ipinfo.io')) {
            // ipinfo.io格式
            standardData.country_name = data.country_name || data.country || "Unknown";
            standardData.city = data.city || "Unknown";
        }
        else if (apiUrl.includes('ipdata.co')) {
            // ipdata.co格式
            standardData.country_name = data.country_name || "Unknown";
            standardData.city = data.city || "Unknown";
        }
        else if (apiUrl.includes('ipgeolocation.io')) {
            // ipgeolocation.io格式
            standardData.country_name = data.country_name || "Unknown";
            standardData.city = data.city || "Unknown";
        }
    } catch (e) {
        console.warn('标准化地理数据失败:', e);
    }

    return standardData;
}

// ✅ 记录页面停留时间
if (!isAnalyticsPage) {
    // 生成唯一的会话ID
    var sessionId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);

    // 将会话ID存储在localStorage中，以便在页面刷新时保持一致
    localStorage.setItem('currentSessionId', sessionId);

    // 记录进入页面的时间
    db.ref(`pageTime/${page}/${sessionId}`).set({
        enterTime: pageEnterTime,
        enterTimeISO: new Date(pageEnterTime).toISOString(),
        page: page
    });

    // 定期更新停留时间（每30秒）
    var updateInterval = setInterval(function() {
        var currentTime = Date.now();
        var stayDuration = currentTime - pageEnterTime;

        db.ref(`pageTime/${page}/${sessionId}`).update({
            lastUpdate: currentTime,
            lastUpdateISO: new Date(currentTime).toISOString(),
            duration: stayDuration
        });
    }, 30000); // 30秒更新一次

    // 页面可见性变化时更新数据
    document.addEventListener('visibilitychange', function() {
        var currentTime = Date.now();
        var stayDuration = currentTime - pageEnterTime;

        if (document.visibilityState === 'hidden') {
            // 页面隐藏时更新数据
            db.ref(`pageTime/${page}/${sessionId}`).update({
                lastUpdate: currentTime,
                lastUpdateISO: new Date(currentTime).toISOString(),
                duration: stayDuration,
                status: 'hidden'
            });
        } else {
            // 页面可见时更新数据
            db.ref(`pageTime/${page}/${sessionId}`).update({
                lastUpdate: currentTime,
                lastUpdateISO: new Date(currentTime).toISOString(),
                duration: stayDuration,
                status: 'visible'
            });
        }
    });

    // 页面关闭或跳转时记录离开时间
    window.addEventListener('beforeunload', function() {
        var exitTime = Date.now();
        var stayDuration = exitTime - pageEnterTime;

        // 清除定时器
        clearInterval(updateInterval);

        // 更新会话结束信息
        if (!isAnalyticsPage) {
            // 获取当前会话的entryPage和isBounce值
            var entryPage = localStorage.getItem('foxseal_entryPage') || page;
            var isBounce = pageCount <= 1; // 如果只访问了一个页面，则是跳出

            // 使用navigator.sendBeacon方法更新会话信息
            var sessionData = JSON.stringify({
                endTime: exitTime,
                endTimeISO: new Date(exitTime).toISOString(),
                duration: exitTime - sessionStart,
                exitPage: page,
                entryPage: entryPage,
                isBounce: isBounce,
                pageCount: pageCount,
                status: 'completed'
            });

            console.log("结束会话数据:", sessionId, JSON.parse(sessionData));

            navigator.sendBeacon(`https://missfoxcounter-default-rtdb.firebaseio.com/sessions/${sessionId}.json?x-http-method-override=PATCH`, sessionData);
        }

        // 使用navigator.sendBeacon方法，更可靠地发送数据
        var exitData = JSON.stringify({
            enterTime: pageEnterTime,
            enterTimeISO: new Date(pageEnterTime).toISOString(),
            exitTime: exitTime,
            exitTimeISO: new Date(exitTime).toISOString(),
            duration: stayDuration,
            status: 'exited',
            page: page
        });

        navigator.sendBeacon(`https://missfoxcounter-default-rtdb.firebaseio.com/pageTime/${page}/${sessionId}.json`, exitData);
    });

    // 如果浏览器不支持sendBeacon，使用同步XHR作为备用
    if (!navigator.sendBeacon) {
        window.addEventListener('beforeunload', function() {
            var exitTime = Date.now();
            var stayDuration = exitTime - pageEnterTime;

            // 更新会话信息
            if (!isAnalyticsPage) {
                var xhr1 = new XMLHttpRequest();
                xhr1.open('PATCH', `https://missfoxcounter-default-rtdb.firebaseio.com/sessions/${sessionId}.json`, false);
                xhr1.setRequestHeader('Content-Type', 'application/json');
                // 获取当前会话的entryPage和isBounce值
                var entryPage = localStorage.getItem('foxseal_entryPage') || page;
                var isBounce = pageCount <= 1; // 如果只访问了一个页面，则是跳出

                var sessionEndData = {
                    endTime: exitTime,
                    endTimeISO: new Date(exitTime).toISOString(),
                    duration: exitTime - sessionStart,
                    exitPage: page,
                    entryPage: entryPage,
                    isBounce: isBounce,
                    pageCount: pageCount,
                    status: 'completed'
                };

                console.log("结束会话数据 (XHR):", sessionId, sessionEndData);

                xhr1.send(JSON.stringify(sessionEndData));
            }

            // 更新页面停留时间
            var xhr2 = new XMLHttpRequest();
            xhr2.open('PUT', `https://missfoxcounter-default-rtdb.firebaseio.com/pageTime/${page}/${sessionId}.json`, false);
            xhr2.setRequestHeader('Content-Type', 'application/json');
            xhr2.send(JSON.stringify({
                enterTime: pageEnterTime,
                enterTimeISO: new Date(pageEnterTime).toISOString(),
                exitTime: exitTime,
                exitTimeISO: new Date(exitTime).toISOString(),
                duration: stayDuration,
                status: 'exited',
                page: page
            }));
        });
    }
}