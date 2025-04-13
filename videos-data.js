// 视频数据
const videosData = [
    {
        id: 1,
        title: "《迷雾小镇》第一章：抵达",
        category: "coc",
        tags: ["COC", "克苏鲁神话", "恐怖"],
        date: "2023-06-01",
        views: 8721,
        duration: "45:22",
        description: "调查员们接到委托，前往被迷雾笼罩的小镇调查一系列神秘失踪事件。",
        thumbnail: "image/video-placeholder.jpg",
        url: "https://space.bilibili.com/",
        featured: false
    },
    {
        id: 2,
        title: "《迷雾小镇》第二章：调查",
        category: "coc",
        tags: ["COC", "克苏鲁神话", "恐怖"],
        date: "2023-06-05",
        views: 7532,
        duration: "52:18",
        description: "调查员们开始在小镇上调查，发现了一些不寻常的线索和诡异的居民。",
        thumbnail: "image/video-placeholder.jpg",
        url: "https://space.bilibili.com/",
        featured: false
    },
    {
        id: 3,
        title: "《迷雾小镇》第三章：真相",
        category: "coc",
        tags: ["COC", "克苏鲁神话", "恐怖"],
        date: "2023-06-10",
        views: 9124,
        duration: "58:45",
        description: "调查员们揭开了小镇的可怕秘密，面对隐藏在迷雾背后的恐怖存在。",
        thumbnail: "image/video-placeholder.jpg",
        url: "https://space.bilibili.com/",
        featured: false
    },
    {
        id: 4,
        title: "《迷雾小镇》完整实录",
        category: "coc",
        tags: ["COC", "克苏鲁神话", "恐怖", "完整实录"],
        date: "2023-06-15",
        views: 12345,
        duration: "2:46:25",
        description: "这是一部完整的COC跑团实录，讲述了调查员们前往一个被迷雾笼罩的小镇，调查一系列神秘失踪事件的故事。在这次冒险中，玩家们将面对小镇的诡异氛围、不可名状的恐怖存在，以及隐藏在迷雾背后的可怕真相。",
        thumbnail: "image/video-placeholder.jpg",
        url: "https://space.bilibili.com/",
        featured: true
    },
    {
        id: 5,
        title: "《龙与地下城》第一集：冒险的开始",
        category: "dnd",
        tags: ["DND", "奇幻", "冒险"],
        date: "2023-05-15",
        views: 6543,
        duration: "1:05:32",
        description: "一群冒险者在酒馆相遇，接受了一个神秘委托，踏上了冒险之旅。",
        thumbnail: "image/video-placeholder.jpg",
        url: "https://space.bilibili.com/",
        featured: false
    },
    {
        id: 6,
        title: "《龙与地下城》第二集：古墓探险",
        category: "dnd",
        tags: ["DND", "奇幻", "冒险"],
        date: "2023-05-22",
        views: 5987,
        duration: "1:12:47",
        description: "冒险者们探索一座古老的墓穴，面对各种陷阱和守卫，寻找传说中的宝藏。",
        thumbnail: "image/video-placeholder.jpg",
        url: "https://space.bilibili.com/",
        featured: false
    },
    {
        id: 7,
        title: "《无限恐怖》：异世界生存",
        category: "other",
        tags: ["无限恐怖", "科幻", "生存"],
        date: "2023-04-10",
        views: 4321,
        duration: "42:19",
        description: "一群普通人被卷入轮回世界，必须在充满危险的异世界中生存下来。",
        thumbnail: "image/video-placeholder.jpg",
        url: "https://space.bilibili.com/",
        featured: false
    },
    {
        id: 8,
        title: "COC新手教程：如何创建调查员",
        category: "tutorial",
        tags: ["教程", "COC", "新手指南"],
        date: "2023-03-20",
        views: 12876,
        duration: "25:14",
        description: "详细讲解如何创建一个COC调查员角色，包括属性分配、技能选择和背景设定。",
        thumbnail: "image/video-placeholder.jpg",
        url: "https://space.bilibili.com/",
        featured: false
    },
    {
        id: 9,
        title: "如何使用Miss Foxsan骰点机器人",
        category: "tutorial",
        tags: ["教程", "骰点机器人", "新手指南"],
        date: "2023-02-15",
        views: 15432,
        duration: "18:36",
        description: "详细介绍Miss Foxsan骰点机器人的各种功能和使用方法，帮助新手快速上手。",
        thumbnail: "image/video-placeholder.jpg",
        url: "https://space.bilibili.com/",
        featured: false
    },
    {
        id: 10,
        title: "《龙与地下城》第三集：魔法森林",
        category: "dnd",
        tags: ["DND", "奇幻", "冒险"],
        date: "2023-05-29",
        views: 5432,
        duration: "1:08:23",
        description: "冒险者们穿越一片神秘的魔法森林，遇到各种奇幻生物和隐藏的危险。",
        thumbnail: "image/video-placeholder.jpg",
        url: "https://space.bilibili.com/",
        featured: false
    },
    {
        id: 11,
        title: "《龙与地下城》第四集：龙巢",
        category: "dnd",
        tags: ["DND", "奇幻", "冒险", "龙"],
        date: "2023-06-05",
        views: 7654,
        duration: "1:15:42",
        description: "冒险者们终于找到了传说中的龙巢，准备面对这次冒险的最终BOSS。",
        thumbnail: "image/video-placeholder.jpg",
        url: "https://space.bilibili.com/",
        featured: false
    },
    {
        id: 12,
        title: "《永夜》第一章：黑暗降临",
        category: "other",
        tags: ["永夜", "奇幻", "黑暗"],
        date: "2023-04-20",
        views: 3456,
        duration: "48:27",
        description: "在一个永远没有太阳的世界里，一群幸存者努力寻找生存的希望。",
        thumbnail: "image/video-placeholder.jpg",
        url: "https://space.bilibili.com/",
        featured: false
    },
    {
        id: 13,
        title: "《永夜》第二章：光明使者",
        category: "other",
        tags: ["永夜", "奇幻", "黑暗"],
        date: "2023-04-27",
        views: 3210,
        duration: "52:36",
        description: "幸存者们发现了一个古老的预言，关于能够带回光明的神秘使者。",
        thumbnail: "image/video-placeholder.jpg",
        url: "https://space.bilibili.com/",
        featured: false
    },
    {
        id: 14,
        title: "DND新手教程：职业选择指南",
        category: "tutorial",
        tags: ["教程", "DND", "新手指南"],
        date: "2023-03-10",
        views: 9876,
        duration: "32:18",
        description: "详细介绍DND中各个职业的特点、优势和劣势，帮助新手选择适合自己的职业。",
        thumbnail: "image/video-placeholder.jpg",
        url: "https://space.bilibili.com/",
        featured: false
    },
    {
        id: 15,
        title: "如何成为一名优秀的DM",
        category: "tutorial",
        tags: ["教程", "DND", "主持人"],
        date: "2023-03-05",
        views: 11234,
        duration: "40:52",
        description: "分享成为一名优秀的地下城主（DM）的技巧和经验，包括故事构建、NPC设计和战斗平衡等方面。",
        thumbnail: "image/video-placeholder.jpg",
        url: "https://space.bilibili.com/",
        featured: false
    },
    {
        id: 16,
        title: "《深海恐惧》：海底调查",
        category: "coc",
        tags: ["COC", "克苏鲁神话", "恐怖", "海洋"],
        date: "2023-02-28",
        views: 6789,
        duration: "1:02:45",
        description: "调查员们乘坐潜水艇前往深海，调查一系列神秘的海底异常现象。",
        thumbnail: "image/video-placeholder.jpg",
        url: "https://space.bilibili.com/",
        featured: false
    }
];

// 获取特色视频
function getFeaturedVideo() {
    return videosData.find(video => video.featured) || videosData[0];
}

// 按分类筛选视频
function filterVideosByCategory(category) {
    if (category === 'all') {
        return videosData;
    }
    return videosData.filter(video => video.category === category);
}

// 分页功能
function paginateVideos(videos, page, perPage = 8) {
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    return videos.slice(startIndex, endIndex);
}

// 获取总页数
function getTotalPages(videos, perPage = 8) {
    return Math.ceil(videos.length / perPage);
}

// 格式化数字（例如：1234 -> 1,234）
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
