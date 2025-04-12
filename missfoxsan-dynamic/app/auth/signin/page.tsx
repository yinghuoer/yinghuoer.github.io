'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('请填写所有字段');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });
      
      if (result?.error) {
        setError(result.error);
      } else {
        // 登录成功，重定向到首页
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      console.error('登录错误:', error);
      setError('登录失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="auth-container">
      <h1>登录</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="email">邮箱</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">密码</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <button 
          type="submit" 
          className="auth-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? '登录中...' : '登录'}
        </button>
      </form>
      
      <div className="auth-divider">
        <span>或</span>
      </div>
      
      <button
        onClick={() => signIn('google', { callbackUrl: '/' })}
        className="google-button"
      >
        <i className="fab fa-google"></i>
        使用Google账号登录
      </button>
      
      <p className="auth-link">
        还没有账号？ <Link href="/auth/signup">注册</Link>
      </p>
    </div>
  );
}
