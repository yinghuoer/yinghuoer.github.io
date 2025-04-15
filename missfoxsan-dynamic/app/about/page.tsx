import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '好奇豹豹 - 狐狸小姐',
  description: '了解狐狸小姐的角色设定、项目背景和创作者信息',
};

export default function AboutPage() {
  return (
    <div className="container">
      <div className="hero">
        <div className="hero-content">
          <h1 className="page-title">好奇豹豹</h1>
          <p className="page-description">
            了解狐狸小姐的角色设定、项目背景和创作者信息
          </p>
        </div>
      </div>

      <main className="about-container">
        <section className="character-profile">
          <div className="character-image">
            <div className="placeholder-character-image">
              <img src="/image/fox立绘.jpg" alt="Fox Character" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
          <div className="character-info">
            <h2 className="character-name">狐狸小姐 (Miss Foxsan)</h2>
            <div className="character-title">TRPG骰点机器人 | 跑团助手 | 时空旅行者</div>

            <div className="personality-traits">
              <div className="trait"><i className="fas fa-smile"></i> 活泼开朗</div>
              <div className="trait"><i className="fas fa-brain"></i> 聪颖&腹黑</div>
              <div className="trait"><i className="fas fa-heart"></i> 热心助人</div>
              <div className="trait"><i className="fas fa-magic"></i> 充满好奇</div>
              <div className="trait"><i className="fas fa-star"></i> 神秘色彩</div>
            </div>

            <div className="character-quote">
              "让我来帮你掷骰子吧！不过，命运的走向可不仅仅取决于骰子哦~"
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2 className="section-title">关于Miss Foxsan</h2>
          <div className="about-content">
            <img src="/image/gubao.jpg" className="placeholder-thumbnail about-image" />
            <p>Miss Foxsan是一个为TRPG（桌面角色扮演游戏）爱好者提供骰点服务的免费公益机器人。她的设计灵感来源于东方神话中的狐仙形象，聪明、机智且略带神秘。</p>
            <p>这个项目始于2021年初，最初只是一个简单的骰点工具，用于满足创作者自己和朋友们的跑团需求。随着时间的推移，Miss Foxsan不断发展壮大，功能也越来越丰富。从最初的基本骰点，到现在支持多种TRPG系统，再到能够记录跑团历史、提供数据分析等高级功能。</p>
            <p>Miss Foxsan的核心理念是"让跑团更简单，让故事更精彩"。我们希望通过提供便捷、友好的骰点服务，让玩家们能够专注于故事的创作和角色的扮演，而不是被繁琐的规则和计算所困扰。</p>
            <p>作为一个公益项目，Miss Foxsan完全免费提供给所有TRPG爱好者使用。我们不断听取用户的反馈和建议，努力改进和完善各项功能，为TRPG社区贡献自己的一份力量。</p>
            <p>感谢所有支持和使用Miss Foxsan的朋友们，是你们的鼓励和支持让这个项目能够不断成长和进步。我们将继续努力，为TRPG爱好者提供更好的服务。</p>
          </div>
        </section>

        <section className="timeline-section">
          <h2 className="section-title">发展历程</h2>
          <div className="timeline">
            <div className="timeline-item">
              <div className="timeline-date">2021年1月</div>
              <div className="timeline-content">
                <h3>项目启动</h3>
                <p>Miss Foxsan项目正式启动，最初只是一个简单的骰点机器人，支持基本的骰点功能。</p>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-date">2021年6月</div>
              <div className="timeline-content">
                <h3>多系统支持</h3>
                <p>增加了对COC、DND、WOD等多种TRPG系统的支持，丰富了骰点功能。</p>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-date">2022年3月</div>
              <div className="timeline-content">
                <h3>角色卡管理</h3>
                <p>添加了角色卡管理功能，允许用户创建、编辑和管理自己的角色卡。</p>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-date">2022年9月</div>
              <div className="timeline-content">
                <h3>跑团历史记录</h3>
                <p>增加了跑团历史记录功能，可以保存和查看过去的跑团记录。</p>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-date">2023年2月</div>
              <div className="timeline-content">
                <h3>AI对话功能</h3>
                <p>引入了AI对话功能，使Miss Foxsan能够与用户进行更自然的交流。</p>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-date">2023年8月</div>
              <div className="timeline-content">
                <h3>网站上线</h3>
                <p>Miss Foxsan官方网站正式上线，提供更全面的服务和资源。</p>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-date">2024年4月</div>
              <div className="timeline-content">
                <h3>用户系统上线</h3>
                <p>网站增加用户注册和登录功能，提供更个性化的服务体验。</p>
              </div>
            </div>
          </div>
        </section>

        <section className="faq-section">
          <h2 className="section-title">常见问题</h2>
          <div className="faq-list">
            <div className="faq-item">
              <div className="faq-question">
                <h3>如何邀请Miss Foxsan到我的Discord服务器？</h3>
                <i className="fas fa-chevron-down"></i>
              </div>
              <div className="faq-answer">
                <p>点击<a href="https://discord.com/oauth2/authorize?client_id=1255774481918595152&permissions=8&integration_type=0&scope=bot" target="_blank" rel="noopener noreferrer">这个链接</a>，按照指示将Miss Foxsan添加到您的Discord服务器。您需要拥有服务器的管理员权限才能完成此操作。</p>
              </div>
            </div>

            <div className="faq-item">
              <div className="faq-question">
                <h3>如何在QQ群中使用Miss Foxsan？</h3>
                <i className="fas fa-chevron-down"></i>
              </div>
              <div className="faq-answer">
                <p>您可以添加Miss Foxsan的QQ号（初号机：3989736640，二号机：1783352478）为好友，然后将其邀请到您的QQ群中。建议同时加入用户交流群（241639081）获取最新的更新和帮助。</p>
              </div>
            </div>

            <div className="faq-item">
              <div className="faq-question">
                <h3>Miss Foxsan支持哪些TRPG系统？</h3>
                <i className="fas fa-chevron-down"></i>
              </div>
              <div className="faq-answer">
                <p>Miss Foxsan目前支持以下TRPG系统：</p>
                <ul>
                  <li>克苏鲁的呼唤 (Call of Cthulhu, COC) 6版和7版</li>
                  <li>龙与地下城 (Dungeons & Dragons, DND) 5版</li>
                  <li>黑暗世界 (World of Darkness, WOD)</li>
                  <li>黑暗编年史 (Chronicles of Darkness, CoD)</li>
                  <li>FATE/Fudge</li>
                  <li>共鸣性怪异 (Emoklore)</li>
                  <li>无限恐怖</li>
                  <li>赛博朋克红 (Cyberpunk RED)</li>
                </ul>
                <p>我们还在不断添加对更多系统的支持。</p>
              </div>
            </div>

            <div className="faq-item">
              <div className="faq-question">
                <h3>Miss Foxsan是免费的吗？</h3>
                <i className="fas fa-chevron-down"></i>
              </div>
              <div className="faq-answer">
                <p>是的，Miss Foxsan是一个完全免费的公益项目，所有功能都可以免费使用。我们不会收取任何费用，也不会在使用过程中强制展示广告。</p>
                <p>如果您喜欢Miss Foxsan并希望支持我们的工作，可以通过分享给更多的TRPG爱好者或提供反馈和建议来帮助我们。</p>
              </div>
            </div>

            <div className="faq-item">
              <div className="faq-question">
                <h3>我可以为Miss Foxsan贡献代码或内容吗？</h3>
                <i className="fas fa-chevron-down"></i>
              </div>
              <div className="faq-answer">
                <p>当然可以！我们非常欢迎社区成员的贡献。如果您有兴趣参与Miss Foxsan的开发或内容创作，请通过以下方式联系我们：</p>
                <ul>
                  <li>加入我们的Discord服务器：<a href="https://discord.gg/Bkx8dJxyTB" target="_blank" rel="noopener noreferrer">https://discord.gg/Bkx8dJxyTB</a></li>
                  <li>加入QQ用户群：241639081</li>
                  <li>在B站私信：<a href="https://space.bilibili.com/2876867" target="_blank" rel="noopener noreferrer">https://space.bilibili.com/2876867</a></li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="contact-section">
          <h2 className="section-title">联系我们</h2>
          <div className="contact-methods">
            <div className="contact-method">
              <i className="fab fa-discord"></i>
              <h3>Discord</h3>
              <p>加入我们的Discord服务器获取帮助和最新更新</p>
              <a href="https://discord.gg/Bkx8dJxyTB" target="_blank" rel="noopener noreferrer" className="btn small-btn">加入服务器</a>
            </div>

            <div className="contact-method">
              <i className="fab fa-qq"></i>
              <h3>QQ群</h3>
              <p>加入超时空管理总局用户交流群</p>
              <a href="https://qm.qq.com/q/JGWS55Fb2O" target="_blank" rel="noopener noreferrer" className="btn small-btn">加入QQ群</a>
            </div>

            <div className="contact-method">
              <i className="fab fa-bilibili"></i>
              <h3>哔哩哔哩</h3>
              <p>关注我们的B站账号获取视频教程和更新</p>
              <a href="https://space.bilibili.com/2876867" target="_blank" rel="noopener noreferrer" className="btn small-btn">访问B站主页</a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
