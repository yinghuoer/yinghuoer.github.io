'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';

export default function Header() {
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  return (
    <header>
      <nav className="navbar">
        <Link href="/" className="logo">
          <img src="/image/qq01.jpg" alt="狐狸小姐" width={40} height={40} />
          <span>狐狸小姐</span>
        </Link>

        <div className="nav-links">
          <Link href="/">首页</Link>
          <Link href="/dicebot">骰点功能</Link>
          <Link href="/character">角色设定</Link>
          <Link href="/messages">留言板</Link>
          <Link href="/about">关于</Link>
        </div>

        <div className="auth-buttons">
          {status === 'loading' ? (
            <div>加载中...</div>
          ) : session ? (
            <div className="user-menu">
              <div className="user-button" onClick={toggleUserMenu}>
                {session.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || '用户'}
                    width={32}
                    height={32}
                    className="user-avatar"
                  />
                ) : (
                  <div className="user-avatar-placeholder">
                    {session.user?.name?.charAt(0) || 'U'}
                  </div>
                )}
                <span>{session.user?.name}</span>
                <i className="fas fa-chevron-down"></i>
              </div>
              <div className={`user-dropdown ${userMenuOpen ? 'active' : ''}`}>
                <Link href="/profile" className="user-dropdown-item">
                  个人资料
                </Link>
                <div className="user-dropdown-divider"></div>
                <button
                  className="user-dropdown-item"
                  onClick={() => signOut()}
                  style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  退出登录
                </button>
              </div>
            </div>
          ) : (
            <>
              <Link href="/auth/signin" className="btn small-btn">
                登录
              </Link>
              <Link href="/auth/signup" className="btn secondary-btn">
                注册
              </Link>
            </>
          )}
        </div>

        <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
          <i className="fas fa-bars"></i>
        </button>
      </nav>

      <div className={`mobile-menu ${mobileMenuOpen ? 'active' : ''}`}>
        <div className="mobile-menu-header">
          <Link href="/" className="logo">
            <img src="/image/qq01.jpg" alt="狐狸小姐" width={40} height={40} />
            <span>狐狸小姐</span>
          </Link>
          <button className="mobile-menu-close" onClick={toggleMobileMenu}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="mobile-nav-links">
          <Link href="/" onClick={toggleMobileMenu}>首页</Link>
          <Link href="/dicebot" onClick={toggleMobileMenu}>骰点功能</Link>
          <Link href="/character" onClick={toggleMobileMenu}>角色设定</Link>
          <Link href="/messages" onClick={toggleMobileMenu}>留言板</Link>
          <Link href="/about" onClick={toggleMobileMenu}>关于</Link>
        </div>
        <div className="mobile-auth-buttons">
          {status === 'loading' ? (
            <div>加载中...</div>
          ) : session ? (
            <div style={{ padding: '1rem 0' }}>
              <div style={{ marginBottom: '1rem' }}>
                已登录为: {session.user?.name}
              </div>
              <Link href="/profile" className="btn small-btn" style={{ marginRight: '1rem' }} onClick={toggleMobileMenu}>
                个人资料
              </Link>
              <button
                className="btn secondary-btn"
                onClick={() => {
                  signOut();
                  toggleMobileMenu();
                }}
                style={{ background: 'none', border: '1px solid #333' }}
              >
                退出登录
              </button>
            </div>
          ) : (
            <div style={{ padding: '1rem 0' }}>
              <Link href="/auth/signin" className="btn small-btn" style={{ marginRight: '1rem' }} onClick={toggleMobileMenu}>
                登录
              </Link>
              <Link href="/auth/signup" className="btn secondary-btn" onClick={toggleMobileMenu}>
                注册
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
