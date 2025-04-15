import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '异时空存档点 - 狐狸小姐',
  description: '狐狸小姐的文档库，包含TRPG规则书、模组、后日谈和各种资源',
};

// 模拟文档数据，实际应用中应该从数据库获取
const documentsData = [
  {
    id: 1,
    title: "你也想复活彼得三吗？- 后日谈（乐鸽子君迁子车）",
    category: "后日谈存档",
    tags: ["COC", "后日谈", "密大", "彼得三"],
    date: "2023-06-15",
    views: 856,
    excerpt: "卡维、米娅、乔和瑟琳四人因费萨南教授那近乎偏执的坚持，意外避开了那场席卷一切的爆炸。尽管他们未能成功研发出真正的复活术，但劫后余生的庆幸感却如潮水般淹没了他们的心头——至少，他们还活着。",
    image: "/image/peter3-1.jpg",
    url: "/docs/peter3-afterstory1",
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
    image: "/image/peter3-2.jpg",
    url: "/docs/peter3-afterstory2",
    featured: true
  },
  {
    id: 3,
    title: "COC 7版规则书中文版",
    category: "规则书",
    tags: ["COC", "规则书", "7版"],
    date: "2023-06-10",
    views: 2345,
    excerpt: "《克苏鲁的呼唤》(Call of Cthulhu, COC)第7版规则书的中文翻译版本，包含完整的游戏规则、设定和背景资料。适合新手和老玩家参考使用。",
    image: "/image/doc1.jpg",
    url: "#",
    downloadUrl: "#",
    featured: false
  },
  {
    id: 4,
    title: "DND 5e玩家手册中文版",
    category: "规则书",
    tags: ["DND", "规则书", "5e"],
    date: "2023-06-05",
    views: 1987,
    excerpt: "《龙与地下城》(Dungeons & Dragons, DND)第5版玩家手册的中文翻译版本，包含角色创建、职业、种族、法术和装备等核心规则。",
    image: "/image/doc2.jpg",
    url: "#",
    downloadUrl: "#",
    featured: false
  },
  {
    id: 5,
    title: "午夜面具 - COC模组",
    category: "模组",
    tags: ["COC", "模组", "恐怖"],
    date: "2023-06-01",
    views: 1456,
    excerpt: "《午夜面具》是一个适合3-5名玩家，游戏时长约4-6小时的COC模组。故事发生在1920年代的阿卡姆，调查员们需要调查一系列与神秘面具相关的失踪事件。",
    image: "/image/doc3.jpg",
    url: "#",
    downloadUrl: "#",
    featured: false
  },
  {
    id: 6,
    title: "失落的矿井 - DND模组",
    category: "模组",
    tags: ["DND", "模组", "冒险"],
    date: "2023-05-25",
    views: 1234,
    excerpt: "《失落的矿井》是一个适合1-4级角色的DND 5e冒险模组。玩家们将探索一座被遗弃的矿井，与各种怪物战斗，解开古老的谜题，最终找到传说中的宝藏。",
    image: "/image/doc4.jpg",
    url: "#",
    downloadUrl: "#",
    featured: false
  },
  {
    id: 7,
    title: "TRPG新手指南",
    category: "教程",
    tags: ["新手指南", "入门"],
    date: "2023-05-20",
    views: 2567,
    excerpt: "这份指南专为TRPG新手设计，详细介绍了什么是桌面角色扮演游戏，如何开始你的第一次游戏，以及常见规则系统的基本概念和术语解释。",
    image: "/image/doc5.jpg",
    url: "#",
    downloadUrl: "#",
    featured: false
  },
  {
    id: 8,
    title: "KP进阶技巧",
    category: "教程",
    tags: ["KP指南", "进阶技巧"],
    date: "2023-05-15",
    views: 1876,
    excerpt: "这份指南面向有一定经验的KP（守秘人/游戏主持人），提供了一系列进阶技巧，包括如何设计引人入胜的剧情，如何处理棘手的玩家问题，以及如何提升游戏的沉浸感和趣味性。",
    image: "/image/doc6.jpg",
    url: "#",
    downloadUrl: "#",
    featured: false
  },
  {
    id: 9,
    title: "角色扮演艺术",
    category: "教程",
    tags: ["角色扮演", "表演技巧"],
    date: "2023-05-10",
    views: 1543,
    excerpt: "这份指南探讨了TRPG中角色扮演的艺术，提供了如何创建有深度的角色，如何通过语言、动作和决策展现角色个性，以及如何在游戏中处理角色成长和变化的技巧。",
    image: "/image/doc7.jpg",
    url: "#",
    downloadUrl: "#",
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
    image: "/image/doc8.jpg",
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

export default function DocumentsPage() {
  const categories = getAllCategories();
  const tags = getAllTags();
  const featuredDocs = getFeaturedDocuments();
  
  return (
    <div className="container">
      <div className="hero">
        <div className="hero-content">
          <h1 className="page-title">异时空存档点</h1>
          <p className="page-description">
            收集整理各类TRPG资源，包括规则书、模组、后日谈和教程
          </p>
        </div>
      </div>

      <main className="documents-container">
        {featuredDocs.length > 0 && (
          <section className="featured-documents">
            <h2 className="section-title">精选文档</h2>
            <div className="featured-documents-grid">
              {featuredDocs.map(doc => (
                <div className="featured-document" key={doc.id}>
                  <div className="featured-document-image">
                    <img src={doc.image} alt={doc.title} />
                  </div>
                  <div className="featured-document-content">
                    <h3>{doc.title}</h3>
                    <div className="document-meta">
                      <span><i className="far fa-calendar"></i> {doc.date}</span>
                      <span><i className="far fa-folder"></i> {doc.category}</span>
                      <span><i className="far fa-eye"></i> {doc.views} 阅读</span>
                    </div>
                    <p>{doc.excerpt}</p>
                    <Link href={doc.url} className="btn primary-btn">阅读全文</Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="documents-main">
          <div className="documents-sidebar">
            <div className="sidebar-section">
              <h3 className="sidebar-title">分类</h3>
              <ul className="documents-categories">
                <li><a href="#" className="active">全部文档</a></li>
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
                <input type="text" className="search-input" placeholder="搜索文档..." />
                <button className="search-btn">
                  <i className="fas fa-search"></i>
                </button>
              </div>
            </div>
          </div>

          <div className="documents-content">
            <div className="documents-grid">
              {documentsData.map(doc => (
                <div className="document-card" key={doc.id}>
                  <div className="document-image">
                    <img src={doc.image} alt={doc.title} />
                  </div>
                  <div className="document-info">
                    <h3>{doc.title}</h3>
                    <div className="document-meta">
                      <span><i className="far fa-calendar"></i> {doc.date}</span>
                      <span><i className="far fa-folder"></i> {doc.category}</span>
                    </div>
                    <p className="document-excerpt">{doc.excerpt}</p>
                    <div className="document-actions">
                      <Link href={doc.url} className="btn small-btn">阅读</Link>
                      {doc.downloadUrl && (
                        <Link href={doc.downloadUrl} className="btn secondary-btn">
                          <i className="fas fa-download"></i> 下载
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
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
        </div>
      </main>
    </div>
  );
}
