'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function CommentForm() {
  const { data: session } = useSession();
  const [comment, setComment] = useState('');
  const [category, setCategory] = useState('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      setSubmitStatus({
        type: 'error',
        message: '请先登录后再发表评论',
      });
      return;
    }
    
    if (!comment.trim()) {
      setSubmitStatus({
        type: 'error',
        message: '评论内容不能为空',
      });
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });
    
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: comment,
          category,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '提交评论失败');
      }
      
      // 清空表单
      setComment('');
      
      // 显示成功消息
      setSubmitStatus({
        type: 'success',
        message: '评论提交成功！',
      });
      
      // 刷新页面以显示新评论
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      console.error('提交评论错误:', error);
      setSubmitStatus({
        type: 'error',
        message: error instanceof Error ? error.message : '提交评论失败，请稍后重试',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!session) {
    return (
      <div className="comment-form-container">
        <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
          <p style={{ marginBottom: '1rem' }}>请登录后发表评论</p>
          <Link href="/auth/signin" className="btn primary-btn">
            登录
          </Link>
          <span style={{ margin: '0 1rem' }}>或</span>
          <Link href="/auth/signup" className="btn secondary-btn">
            注册
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="comment-form-container">
      <h2 style={{ marginBottom: '1.5rem' }}>发表留言</h2>
      
      {submitStatus.type && (
        <div
          style={{
            padding: '0.75rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            backgroundColor: submitStatus.type === 'success' ? '#d4edda' : '#f8d7da',
            color: submitStatus.type === 'success' ? '#155724' : '#721c24',
          }}
        >
          {submitStatus.message}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="comment">您的留言</label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="请输入您的留言..."
            rows={4}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="category">分类</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="general">一般留言</option>
            <option value="question">问题咨询</option>
            <option value="suggestion">建议反馈</option>
            <option value="appreciation">感谢支持</option>
          </select>
        </div>
        
        <button 
          type="submit" 
          className="submit-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? '提交中...' : '发表留言'}
        </button>
      </form>
    </div>
  );
}
