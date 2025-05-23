import Link from 'next/link';

export default function Footer() {
  return (
    <footer>
      <div className="footer-container">
        <div className="footer-section">
          <h3>关于狐狸小姐</h3>
          <p>
            狐狸小姐是一个免费公益机器人，为TRPG游戏提供骰点服务，并内置娱乐项目和AI对话功能。
          </p>
          <div className="social-icons">
            <a href="https://qm.qq.com/q/JGWS55Fb2O" target="_blank" rel="noopener noreferrer" aria-label="QQ">
              <i className="fab fa-qq"></i>
            </a>
            <a href="https://discord.gg/Bkx8dJxyTB" target="_blank" rel="noopener noreferrer" aria-label="Discord">
              <i className="fab fa-discord"></i>
            </a>
            <a href="https://space.bilibili.com/2876867" target="_blank" rel="noopener noreferrer" aria-label="Bilibili">
              <i className="fab fa-bilibili"></i>
            </a>
          </div>
        </div>

        <div className="footer-section">
          <h3>快速链接</h3>
          <ul className="quick-links">
            <li>
              <Link href="/">首页</Link>
            </li>
            <li>
              <Link href="/blog">时空枢纽</Link>
            </li>
            <li>
              <Link href="/documents">异时空存档点</Link>
            </li>
            <li>
              <Link href="/dicebot">功能简览</Link>
            </li>
            <li>
              <Link href="/videos">跑团视频</Link>
            </li>
            <li>
              <Link href="/messages">留言板</Link>
            </li>
            <li>
              <Link href="/about">好奇豹豹</Link>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>联系我们</h3>
          <ul className="contact-list">
            <li>
              <i className="fas fa-user"></i> 骰主：荧惑
            </li>
            <li>
              <i className="fab fa-qq"></i> QQ：863867914
            </li>
            <li>
              <i className="fas fa-users"></i> 用户群：241639081
            </li>
            <li>
              <i className="fab fa-discord"></i> Discord：
              <a
                href="https://discord.com/oauth2/authorize?client_id=1255774481918595152&permissions=8&integration_type=0&scope=bot"
                target="_blank"
                rel="noopener noreferrer"
              >
                邀请链接
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="copyright">
        <p>&copy; 2025 Miss Foxsan. 保留所有权利。</p>
      </div>
    </footer>
  );
}
