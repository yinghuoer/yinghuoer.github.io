// 博客文章数据
const blogData = [
    {
        id: 1,
        title: "COC 7版规则详解与技巧分享",
        category: "规则解析",
        tags: ["COC", "规则书", "新手指南"],
        date: "2023-12-10",
        views: 856,
        excerpt: "《克苏鲁的呼唤》(Call of Cthulhu, COC)是一款经典的恐怖类TRPG游戏，本文将详细解析COC 7版的核心规则，包括技能检定、战斗系统、理智检定等，并分享一些实用的游戏技巧...",
        image: "image/blog1.jpg",
        url: "#",
        featured: false
    },
    {
        id: 2,
        title: "我的第一次跑团经历",
        category: "创意灵感",
        tags: ["新手指南", "COC", "角色扮演"],
        date: "2023-11-28",
        views: 723,
        excerpt: "还记得我第一次接触跑团是在大学时期，朋友邀请我参加一个COC的团，当时对这种游戏完全没有概念。本文将分享我的第一次跑团经历，以及这次经历如何改变了我对桌游的看法...",
        image: "image/blog2.jpg",
        url: "#",
        featured: false
    },
    {
        id: 3,
        title: "如何设计引人入胜的剧情",
        category: "跑团技巧",
        tags: ["故事构建", "世界观", "跑团技巧"],
        date: "2023-11-15",
        views: 912,
        excerpt: "一个好的TRPG剧本需要有吸引人的故事背景、丰富的NPC设定、合理的冲突设置和多样化的解决方案。本文将分享如何设计一个能够吸引玩家、让他们沉浸其中的跑团剧情...",
        image: "image/blog3.jpg",
        url: "#",
        featured: false
    },
    {
        id: 4,
        title: "骰子机器人使用进阶技巧",
        category: "骰子机器人",
        tags: ["骰子机器人", "新手指南"],
        date: "2023-11-05",
        views: 678,
        excerpt: "骰子机器人是现代跑团的重要工具，特别是在线上跑团中。本文将介绍Miss Foxsan骰子机器人的一些进阶用法，包括自定义骰点表达式、角色卡管理、日志记录等功能的详细使用方法...",
        image: "image/blog4.jpg",
        url: "#",
        featured: false
    },
    {
        id: 5,
        title: "DND 5e职业选择指南",
        category: "角色创建",
        tags: ["DND", "角色创建", "新手指南"],
        date: "2023-10-25",
        views: 845,
        excerpt: "在《龙与地下城》(D&D)中，职业选择是创建角色的核心步骤之一。本文将详细介绍DND 5e中的各个职业特点、优势和劣势，帮助新手玩家找到最适合自己的职业...",
        image: "image/blog5.jpg",
        url: "#",
        featured: false
    },
    {
        id: 6,
        title: "跑团中的即兴表演技巧",
        category: "跑团技巧",
        tags: ["即兴表演", "角色扮演", "跑团技巧"],
        date: "2023-10-15",
        views: 732,
        excerpt: "即兴表演是TRPG中不可或缺的一部分，无论是作为GM还是玩家。本文将分享一些提升即兴表演能力的实用技巧，帮助你在跑团中创造更生动、更有趣的角色和场景...",
        image: "image/blog6.jpg",
        url: "#",
        featured: false
    },
    {
        id: 7,
        title: "如何成为一名优秀的跑团主持人",
        category: "跑团技巧",
        tags: ["跑团技巧", "新手指南", "故事构建"],
        date: "2023-12-15",
        views: 1024,
        excerpt: "作为一名跑团主持人（KP/GM/DM），不仅需要熟悉规则，还需要具备良好的叙事能力、即兴发挥能力和团队协调能力。本文将分享我多年跑团经验中总结的一些技巧和心得...",
        image: "image/blog-featured.jpg",
        url: "#",
        featured: true
    },
    {
        id: 8,
        title: "TRPG中的世界观构建",
        category: "创意灵感",
        tags: ["世界观", "故事构建", "创意灵感"],
        date: "2023-10-05",
        views: 689,
        excerpt: "一个引人入胜的世界观是一个成功TRPG游戏的基础。本文将探讨如何构建一个丰富、连贯且有深度的游戏世界，包括地理环境、历史背景、文化传统、政治体系等方面的设计思路...",
        image: "image/blog7.jpg",
        url: "#",
        featured: false
    },
    {
        id: 9,
        title: "COC模组推荐：初学者必玩的五个经典模组",
        category: "模组推荐",
        tags: ["COC", "模组推荐", "新手指南"],
        date: "2023-09-20",
        views: 935,
        excerpt: "对于刚接触《克苏鲁的呼唤》的玩家来说，选择一个合适的入门模组非常重要。本文推荐五个适合新手的经典COC模组，这些模组难度适中、故事精彩、规则简单，是入门COC的绝佳选择...",
        image: "image/blog8.jpg",
        url: "#",
        featured: false
    },
    {
        id: 10,
        title: "如何处理跑团中的意外状况",
        category: "跑团技巧",
        tags: ["跑团技巧", "即兴表演"],
        date: "2023-09-10",
        views: 712,
        excerpt: "在TRPG游戏中，无论准备得多么充分，总会遇到各种意外情况。本文将分享如何应对玩家出人意料的行动、规则争议、游戏节奏问题等常见的跑团意外状况...",
        image: "image/blog9.jpg",
        url: "#",
        featured: false
    }
];

// 获取所有分类
function getAllCategories() {
    const categories = new Set();
    blogData.forEach(blog => {
        categories.add(blog.category);
    });
    return Array.from(categories);
}

// 获取所有标签
function getAllTags() {
    const tags = new Set();
    blogData.forEach(blog => {
        blog.tags.forEach(tag => {
            tags.add(tag);
        });
    });
    return Array.from(tags);
}

// 获取特色文章
function getFeaturedPosts() {
    return blogData.filter(blog => blog.featured);
}

// 搜索文章
function searchBlogs(query) {
    query = query.toLowerCase();
    return blogData.filter(blog => {
        return (
            blog.title.toLowerCase().includes(query) ||
            blog.excerpt.toLowerCase().includes(query) ||
            blog.category.toLowerCase().includes(query) ||
            blog.tags.some(tag => tag.toLowerCase().includes(query))
        );
    });
}

// 按分类筛选文章
function filterByCategory(category) {
    if (category === '全部文章') {
        return blogData;
    }
    return blogData.filter(blog => blog.category === category);
}

// 按标签筛选文章
function filterByTag(tag) {
    return blogData.filter(blog => blog.tags.includes(tag));
}

// 分页功能
function paginateBlogs(blogs, page, perPage = 6) {
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    return blogs.slice(startIndex, endIndex);
}

// 获取总页数
function getTotalPages(blogs, perPage = 6) {
    return Math.ceil(blogs.length / perPage);
}
