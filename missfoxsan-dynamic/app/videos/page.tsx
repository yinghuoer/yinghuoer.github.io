import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '跑团视频 - 狐狸小姐',
  description: '狐狸小姐的TRPG跑团视频集合，包含各种规则系统的实际游戏录像',
};

// 模拟视频数据，实际应用中应该从数据库获取
const videosData = [
  {
    id: 1,
    title: "《午夜面具》COC跑团实录 第一集",
    category: "COC",
    tags: ["COC", "恐怖", "实录"],
    date: "2023-12-15",
    views: 1256,
    duration: "2:45:30",
    thumbnail: "/image/video1.jpg",
    url: "https://www.bilibili.com/video/BV1234567890",
    description: "《午夜面具》是一个原创的COC模组，故事发生在1920年代的阿卡姆，调查员们需要调查一系列与神秘面具相关的失踪事件。本视频是该模组的第一集跑团实录。",
    featured: true
  },
  {
    id: 2,
    title: "《失落的矿井》DND跑团实录 第一集",
    category: "DND",
    tags: ["DND", "奇幻", "实录"],
    date: "2023-12-10",
    views: 987,
    duration: "3:15:45",
    thumbnail: "/image/video2.jpg",
    url: "https://www.bilibili.com/video/BV1234567891",
    description: "《失落的矿井》是一个适合1-4级角色的DND 5e冒险模组。玩家们将探索一座被遗弃的矿井，与各种怪物战斗，解开古老的谜题，最终找到传说中的宝藏。本视频是该模组的第一集跑团实录。",
    featured: true
  },
  {
    id: 3,
    title: "COC新手入门指南",
    category: "教程",
    tags: ["COC", "新手指南", "教程"],
    date: "2023-12-05",
    views: 2345,
    duration: "45:20",
    thumbnail: "/image/video3.jpg",
    url: "https://www.bilibili.com/video/BV1234567892",
    description: "这个视频详细介绍了《克苏鲁的呼唤》(Call of Cthulhu, COC)的基本规则和游戏流程，适合完全没有接触过TRPG的新手观看。内容包括角色创建、技能检定、战斗系统和理智检定等核心机制。",
    featured: false
  },
  {
    id: 4,
    title: "DND 5e职业详解：战士",
    category: "教程",
    tags: ["DND", "职业指南", "教程"],
    date: "2023-12-01",
    views: 1876,
    duration: "38:15",
    thumbnail: "/image/video4.jpg",
    url: "https://www.bilibili.com/video/BV1234567893",
    description: "这个视频详细介绍了DND 5e中战士职业的特点、能力和玩法技巧。包括各个子职业的分析、装备选择建议、多级发展路线以及实战中的战术运用。",
    featured: false
  },
  {
    id: 5,
    title: "《午夜面具》COC跑团实录 第二集",
    category: "COC",
    tags: ["COC", "恐怖", "实录"],
    date: "2023-11-25",
    views: 1123,
    duration: "2:55:10",
    thumbnail: "/image/video5.jpg",
    url: "https://www.bilibili.com/video/BV1234567894",
    description: "《午夜面具》COC模组的第二集跑团实录。调查员们深入调查神秘面具的来源，发现了一个隐藏在阿卡姆市中心的秘密组织。",
    featured: false
  },
  {
    id: 6,
    title: "《失落的矿井》DND跑团实录 第二集",
    category: "DND",
    tags: ["DND", "奇幻", "实录"],
    date: "2023-11-20",
    views: 876,
    duration: "3:05:30",
    thumbnail: "/image/video6.jpg",
    url: "https://www.bilibili.com/video/BV1234567895",
    description: "《失落的矿井》DND模组的第二集跑团实录。冒险者们在矿井深处遭遇了强大的敌人，并发现了关于矿井历史的重要线索。",
    featured: false
  },
  {
    id: 7,
    title: "如何成为一名优秀的KP",
    category: "教程",
    tags: ["KP指南", "跑团技巧", "教程"],
    date: "2023-11-15",
    views: 2156,
    duration: "52:40",
    thumbnail: "/image/video7.jpg",
    url: "https://www.bilibili.com/video/BV1234567896",
    description: "这个视频分享了如何成为一名优秀的KP（守秘人/游戏主持人）的技巧和经验。内容包括故事设计、NPC塑造、场景描述、规则掌握以及如何处理各种突发状况。",
    featured: false
  },
  {
    id: 8,
    title: "角色扮演技巧分享",
    category: "教程",
    tags: ["角色扮演", "表演技巧", "教程"],
    date: "2023-11-10",
    views: 1765,
    duration: "48:25",
    thumbnail: "/image/video8.jpg",
    url: "https://www.bilibili.com/video/BV1234567897",
    description: "这个视频分享了如何在TRPG中进行精彩的角色扮演的技巧。内容包括角色性格塑造、语言表达、情绪表现以及如何与其他玩家进行互动。",
    featured: false
  }
];

// 获取特色视频
function getFeaturedVideos() {
  return videosData.filter(video => video.featured);
}

export default function VideosPage() {
  const featuredVideos = getFeaturedVideos();
  const featuredVideo = featuredVideos.length > 0 ? featuredVideos[0] : null;
  
  return (
    <div className="container">
      <div className="hero">
        <div className="hero-content">
          <h1 className="page-title">跑团视频</h1>
          <p className="page-description">
            精彩的TRPG实录视频，记录每一次难忘的冒险
          </p>
        </div>
      </div>

      <main className="videos-container">
        {featuredVideo && (
          <section className="featured-video">
            <h2 className="section-title">精选视频</h2>
            <div className="featured-video-container">
              <div className="featured-video-player">
                <img 
                  src={featuredVideo.thumbnail} 
                  alt={featuredVideo.title} 
                  className="featured-thumbnail"
                />
                <div className="play-button">
                  <i className="fas fa-play"></i>
                </div>
              </div>
              <div className="featured-video-info">
                <h3>{featuredVideo.title}</h3>
                <div className="video-meta">
                  <span><i className="far fa-calendar"></i> {featuredVideo.date}</span>
                  <span><i className="far fa-clock"></i> {featuredVideo.duration}</span>
                  <span><i className="far fa-eye"></i> {featuredVideo.views} 观看</span>
                </div>
                <div className="featured-video-description">
                  <p>{featuredVideo.description}</p>
                </div>
                <div className="video-tags">
                  {featuredVideo.tags.map((tag, index) => (
                    <span className="video-tag" key={index}>{tag}</span>
                  ))}
                </div>
                <a href={featuredVideo.url} target="_blank" rel="noopener noreferrer" className="btn primary-btn" style={{ marginTop: '1.5rem' }}>
                  <i className="fab fa-bilibili"></i> 在B站观看
                </a>
              </div>
            </div>
          </section>
        )}

        <section className="video-collection">
          <h2 className="section-title">所有视频</h2>

          <div className="video-filters">
            <button className="filter-btn active" data-filter="all">全部</button>
            <button className="filter-btn" data-filter="coc">COC</button>
            <button className="filter-btn" data-filter="dnd">DND</button>
            <button className="filter-btn" data-filter="other">其他系统</button>
            <button className="filter-btn" data-filter="tutorial">教程</button>
          </div>

          <div className="video-grid">
            {videosData.map(video => (
              <div className="video-card" key={video.id}>
                <div className="video-thumbnail">
                  <img src={video.thumbnail} alt={video.title} />
                  <div className="video-duration">{video.duration}</div>
                  <div className="play-button">
                    <i className="fas fa-play"></i>
                  </div>
                </div>
                <div className="video-info">
                  <h3 className="video-title">{video.title}</h3>
                  <div className="video-meta">
                    <span><i className="far fa-calendar"></i> {video.date}</span>
                    <span><i className="far fa-eye"></i> {video.views}</span>
                  </div>
                  <div className="video-category">
                    <span className="category-badge">{video.category}</span>
                  </div>
                  <a href={video.url} target="_blank" rel="noopener noreferrer" className="watch-btn">
                    观看视频
                  </a>
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
        </section>
      </main>
    </div>
  );
}
