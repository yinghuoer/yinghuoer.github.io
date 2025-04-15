import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '时空枢纽 - 狐狸小姐',
  description: '狐狸小姐的博客，分享TRPG相关的文章、教程和心得',
};

// 模拟博客数据，实际应用中应该从数据库获取
const blogData = [
  {
    id: 1,
    title: "COC 7版规则详解与技巧分享",
    category: "规则解析",
    tags: ["COC", "规则书", "新手指南"],
    date: "2023-12-10",
    views: 856,
    excerpt: "《克苏鲁的呼唤》(Call of Cthulhu, COC)是一款经典的恐怖类TRPG游戏，本文将详细解析COC 7版的核心规则，包括技能检定、战斗系统、理智检定等，并分享一些实用的游戏技巧...",
    image: "/image/blog1.jpg",
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
    image: "/image/blog2.jpg",
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
    image: "/image/blog3.jpg",
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
    image: "/image/blog4.jpg",
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
    image: "/image/blog5.jpg",
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
    image: "/image/blog6.jpg",
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

export default function BlogPage() {
  const categories = getAllCategories();
  const tags = getAllTags();
  
  return (
    <div className="container">
      <div className="hero">
        <div className="hero-content">
          <h1 className="page-title">时空枢纽</h1>
          <p className="page-description">
            探索TRPG的无限可能，分享跑团经验和技巧
          </p>
        </div>
      </div>

      <main className="blog-container">
        <div className="blog-sidebar">
          <div className="sidebar-section">
            <h3 className="sidebar-title">分类</h3>
            <ul className="blog-categories">
              <li><a href="#" className="active">全部文章</a></li>
              {categories.map((category, index) => (
                <li key={index}><a href="#">{category}</a></li>
              ))}
            </ul>
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-title">标签</h3>
            <div className="tag-cloud">
              {tags.map((tag, index) => (
                <a href="#" className="tag" key={index}>{tag}</a>
              ))}
            </div>
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-title">搜索</h3>
            <div className="search-bar">
              <input type="text" className="search-input" placeholder="搜索文章..." />
              <button className="search-btn">
                <i className="fas fa-search"></i>
              </button>
            </div>
          </div>
        </div>

        <div className="blog-main">
          <div className="blog-content">
            {blogData.map(blog => (
              <article className="blog-card" key={blog.id}>
                <img src={blog.image} alt={blog.title} className="blog-image" />
                <div className="blog-info">
                  <h3>{blog.title}</h3>
                  <div className="blog-meta">
                    <span><i className="far fa-calendar"></i> {blog.date}</span>
                    <span><i className="far fa-folder"></i> {blog.category}</span>
                    <span><i className="far fa-eye"></i> {blog.views} 阅读</span>
                  </div>
                  <p className="blog-excerpt">{blog.excerpt}</p>
                  <Link href={blog.url} className="read-more">阅读全文 <i className="fas fa-arrow-right"></i></Link>
                </div>
              </article>
            ))}
          </div>

          <div className="pagination">
            <a href="#" className="pagination-item active">1</a>
            <a href="#" className="pagination-item">2</a>
            <a href="#" className="pagination-item">3</a>
            <a href="#" className="pagination-item">
              <i className="fas fa-chevron-right"></i>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
