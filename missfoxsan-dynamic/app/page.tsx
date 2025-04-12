import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export default async function Home() {
  const session = await getServerSession(authOptions);
  
  return (
    <main className="container">
      <div className="hero">
        <div className="hero-content">
          <h1>欢迎来到狐狸小姐的世界！</h1>
          <p>
            狐狸小姐是一个免费公益机器人，为TRPG游戏提供骰点服务，并内置娱乐项目和AI对话功能。
          </p>
          <div className="hero-buttons">
            <Link href="/messages" className="btn primary-btn">
              查看留言板
            </Link>
            <Link href="/dicebot" className="btn secondary-btn">
              了解骰点功能
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <img src="/image/missfoxtrasp.PNG" alt="狐狸小姐" />
        </div>
      </div>

      <section className="features">
        <h2 className="section-title">主要功能</h2>
        <div className="feature-cards">
          <Link href="/dicebot" className="feature-card">
            <div className="card-icon">
              <i className="fas fa-dice"></i>
            </div>
            <h3>骰点服务</h3>
            <p>支持多种TRPG规则系统的骰点功能，包括COC、DND等。</p>
            <div className="more-link">
              <span>了解更多</span>
              <i className="fas fa-arrow-right"></i>
            </div>
          </Link>

          <Link href="/character" className="feature-card">
            <div className="card-icon">
              <i className="fas fa-robot"></i>
            </div>
            <h3>AI对话</h3>
            <p>与Miss Foxsan进行智能对话，获取帮助或纯粹聊天。</p>
            <div className="more-link">
              <span>了解更多</span>
              <i className="fas fa-arrow-right"></i>
            </div>
          </Link>

          <Link href="/about" className="feature-card">
            <div className="card-icon">
              <i className="fas fa-gamepad"></i>
            </div>
            <h3>娱乐功能</h3>
            <p>包括抽卡、点歌、表情包制作等多种娱乐功能。</p>
            <div className="more-link">
              <span>了解更多</span>
              <i className="fas fa-arrow-right"></i>
            </div>
          </Link>

          <Link href="/history" className="feature-card">
            <div className="card-icon">
              <i className="fas fa-history"></i>
            </div>
            <h3>历史记录</h3>
            <p>查看跑团历史记录和数据统计，追踪您的冒险历程。</p>
            <div className="more-link">
              <span>了解更多</span>
              <i className="fas fa-arrow-right"></i>
            </div>
          </Link>
        </div>
      </section>

      <section className="platforms">
        <h2 className="section-title">可用平台</h2>
        <div className="platform-cards">
          <div className="platform">
            <img src="/image/dc01.JPEG" alt="Discord" style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover' }} />
            <h3>Discord</h3>
            <p>在Discord上使用狐狸小姐</p>
            <ol style={{ textAlign: 'left', margin: '1rem 0' }}>
              <li>点击下方链接邀请机器人</li>
              <li>在服务器中使用骰点命令</li>
              <li>享受便捷的骰点服务！</li>
            </ol>
            <a href="https://discord.com/oauth2/authorize?client_id=1255774481918595152&permissions=8&integration_type=0&scope=bot" className="btn small-btn" target="_blank" rel="noopener noreferrer">
              邀请到Discord
            </a>
          </div>

          <div className="platform">
            <img src="/image/qq01.jpg" alt="QQ初号机" style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover' }} />
            <h3>QQ初号机</h3>
            <p>西幻/现代风格的骰点机器人</p>
            <ol style={{ textAlign: 'left', margin: '1rem 0' }}>
              <li>添加初号机为好友并邀请到群中</li>
              <li>在群聊中输入骰点命令</li>
              <li>享受便捷的骰点服务！</li>
            </ol>
            <div style={{ textAlign: 'center', margin: '1rem 0' }}>
              <p><strong>QQ号码：</strong> 3989736640</p>
            </div>
            <a href="#" className="btn small-btn">添加初号机</a>
          </div>

          <div className="platform">
            <img src="/image/qq02.jpg" alt="QQ二号机" style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover' }} />
            <h3>QQ二号机</h3>
            <p>古风/和风风格的骰点机器人</p>
            <ol style={{ textAlign: 'left', margin: '1rem 0' }}>
              <li>添加二号机为好友并邀请到群中</li>
              <li>在群聊中输入骰点命令</li>
              <li>享受便捷的骰点服务！</li>
            </ol>
            <div style={{ textAlign: 'center', margin: '1rem 0' }}>
              <p><strong>QQ号码：</strong> 1783352478</p>
              <p><strong>用户群：</strong> 241639081</p>
            </div>
            <a href="#" className="btn small-btn">添加二号机</a>
          </div>
        </div>
      </section>
    </main>
  );
}
