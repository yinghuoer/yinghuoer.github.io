// 文档数据
const documentsData = [
    {
        id: 1,
        title: "你也想复活彼得三吗？- 后日谈（乐鸽子君迁子车）",
        category: "后日谈存档",
        tags: ["COC", "后日谈", "密大", "彼得三"],
        date: "2023-06-15",
        views: 856,
        excerpt: "卡维、米娅、乔和瑟琳四人因费萨南教授那近乎偏执的坚持，意外避开了那场席卷一切的爆炸。尽管他们未能成功研发出真正的复活术，但劫后余生的庆幸感却如潮水般淹没了他们的心头——至少，他们还活着。",
        image: "image/peter3-1.jpg",
        url: "docs/peter3-afterstory1.html",
        featured: true
    },
    {
        id: 2,
        title: "你也想复活彼得三吗？- 后日谈（兽人龟星夜车）",
        category: "后日谈存档",
        tags: ["COC", "后日谈", "活人园", "彼得三"],
        date: "2023-06-15",
        views: 782,
        excerpt: "后台休息室中。一名年轻貌美的女性正端坐在镜子前，柔顺的金色长发乖巧的盘在她的脑后。慕娜·卡德莉雅，这位后起之秀对着镜子里的自己微微一笑，勾起的红唇为她稍稍的冲散了一点这不好相处的气场。",
        image: "image/peter3-2.jpg",
        url: "docs/peter3-afterstory2.html",
        featured: true
    },
    {
        id: 3,
        title: "COC 7版规则书中文版",
        category: "规则书",
        tags: ["COC", "规则书", "克苏鲁"],
        date: "2023-10-15",
        views: 2356,
        excerpt: "《克苏鲁的呼唤》(Call of Cthulhu, COC) 第7版规则书的中文翻译版本，包含完整的游戏规则、技能系统、战斗机制和理智系统等内容，是进行COC跑团的必备参考资料。",
        image: "image/doc1.jpg",
        url: "#",
        downloadUrl: "#",
        featured: false
    },
    {
        id: 4,
        title: "《迷雾小镇》模组资料",
        category: "模组资料",
        tags: ["COC", "模组", "克苏鲁"],
        date: "2023-09-28",
        views: 1845,
        excerpt: "《迷雾小镇》是一个原创的COC模组，讲述了调查员们前往一个被迷雾笼罩的小镇，调查一系列神秘失踪事件的故事。本文档包含完整的模组设定、NPC资料、地图和剧情线索。",
        image: "image/doc2.jpg",
        url: "#",
        downloadUrl: "#",
        featured: false
    },
    {
        id: 5,
        title: "DND 5e 角色卡模板",
        category: "角色卡模板",
        tags: ["DND", "角色卡"],
        date: "2023-09-15",
        views: 1532,
        excerpt: "为DND 5e设计的详细角色卡模板，包含属性、技能、装备、法术和背景故事等所有必要信息。提供PDF和可编辑的Word格式，方便玩家使用和打印。",
        image: "image/doc3.jpg",
        url: "#",
        downloadUrl: "#",
        featured: false
    },
    {
        id: 6,
        title: "新手KP指南",
        category: "KP/GM指南",
        tags: ["COC", "KP指南"],
        date: "2023-08-20",
        views: 2145,
        excerpt: "专为初次担任COC守秘人(KP)的玩家编写的指南，详细介绍了如何准备和运行一场成功的跑团，包括规则解释、剧情设计、NPC扮演和场景描述等方面的技巧和建议。",
        image: "image/doc4.jpg",
        url: "#",
        downloadUrl: "#",
        featured: false
    },
    {
        id: 7,
        title: "《龙与地下城》战斗指南",
        category: "规则书",
        tags: ["DND", "规则书"],
        date: "2023-08-05",
        views: 1876,
        excerpt: "详细解析DND 5e的战斗系统，包括先攻、行动、反应、移动和战术选择等内容。适合新手和有经验的玩家参考，帮助你在战斗中做出更明智的决策。",
        image: "image/doc5.jpg",
        url: "#",
        downloadUrl: "#",
        featured: false
    },
    {
        id: 8,
        title: "《古墓探险》后日谈存档",
        category: "后日谈存档",
        tags: ["DND", "后日谈"],
        date: "2023-07-25",
        views: 1245,
        excerpt: "记录了一次DND 5e的完整跑团过程，讲述了一群冒险者探索古代遗迹的故事。包含详细的对话记录、战斗描述和角色互动，是了解DND游戏流程的好资料。",
        image: "image/doc6.jpg",
        url: "#",
        downloadUrl: "#",
        featured: false
    },
    {
        id: 9,
        title: "《永夜》后日谈完整存档",
        category: "后日谈存档",
        tags: ["COC", "后日谈", "永夜"],
        date: "2023-07-10",
        views: 1320,
        excerpt: "《永夜》是一个原创的COC模组，讲述了调查员们在一个永远不会天亮的小镇中的冒险。这是完整的后日谈存档，记录了角色们在事件结束后的生活。",
        image: "image/doc7.jpg",
        url: "#",
        featured: false
    },
    {
        id: 10,
        title: "新手PL指南",
        category: "PL指南",
        tags: ["COC", "PL指南"],
        date: "2023-06-30",
        views: 1890,
        excerpt: "专为初次参与TRPG的玩家编写的指南，详细介绍了如何创建角色、理解规则、与其他玩家互动以及融入游戏世界的技巧和建议。",
        image: "image/doc8.jpg",
        url: "#",
        downloadUrl: "#",
        featured: false
    }
];

// 获取所有分类
function getAllCategories() {
    const categories = new Set();
    documentsData.forEach(doc => {
        categories.add(doc.category);
    });
    return Array.from(categories);
}

// 获取所有标签
function getAllTags() {
    const tags = new Set();
    documentsData.forEach(doc => {
        doc.tags.forEach(tag => {
            tags.add(tag);
        });
    });
    return Array.from(tags);
}

// 获取特色文档
function getFeaturedDocuments() {
    return documentsData.filter(doc => doc.featured);
}

// 搜索文档
function searchDocuments(query) {
    query = query.toLowerCase();
    return documentsData.filter(doc => {
        return (
            doc.title.toLowerCase().includes(query) ||
            doc.excerpt.toLowerCase().includes(query) ||
            doc.category.toLowerCase().includes(query) ||
            doc.tags.some(tag => tag.toLowerCase().includes(query))
        );
    });
}

// 按分类筛选文档
function filterByCategory(category) {
    if (category === '全部文档') {
        return documentsData;
    }
    return documentsData.filter(doc => doc.category === category);
}

// 按标签筛选文档
function filterByTag(tag) {
    return documentsData.filter(doc => doc.tags.includes(tag));
}

// 分页功能
function paginateDocuments(documents, page, perPage = 6) {
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    return documents.slice(startIndex, endIndex);
}

// 获取总页数
function getTotalPages(documents, perPage = 6) {
    return Math.ceil(documents.length / perPage);
}
