'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface User {
  _id: string;
  name: string;
  image?: string;
}

interface Comment {
  _id: string;
  text: string;
  category: string;
  user: User;
  createdAt: string;
}

export default function CommentList() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');
  
  useEffect(() => {
    fetchComments();
  }, []);
  
  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/comments');
      
      if (!response.ok) {
        throw new Error('获取评论失败');
      }
      
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error('获取评论错误:', error);
      setError('获取评论失败，请刷新页面重试');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };
  
  const filteredComments = activeCategory === 'all'
    ? comments
    : comments.filter(comment => comment.category === activeCategory);
  
  if (loading) {
    return <div className="loading">加载评论中...</div>;
  }
  
  if (error) {
    return <div className="error">{error}</div>;
  }
  
  return (
    <div className="comments-container">
      <h2 style={{ marginBottom: '1.5rem' }}>留言列表</h2>
      
      <div className="category-filter">
        <button
          className={activeCategory === 'all' ? 'active' : ''}
          onClick={() => handleCategoryChange('all')}
        >
          全部
        </button>
        <button
          className={activeCategory === 'general' ? 'active' : ''}
          onClick={() => handleCategoryChange('general')}
        >
          一般留言
        </button>
        <button
          className={activeCategory === 'question' ? 'active' : ''}
          onClick={() => handleCategoryChange('question')}
        >
          问题咨询
        </button>
        <button
          className={activeCategory === 'suggestion' ? 'active' : ''}
          onClick={() => handleCategoryChange('suggestion')}
        >
          建议反馈
        </button>
        <button
          className={activeCategory === 'appreciation' ? 'active' : ''}
          onClick={() => handleCategoryChange('appreciation')}
        >
          感谢支持
        </button>
      </div>
      
      {filteredComments.length === 0 ? (
        <div className="no-comments">暂无评论</div>
      ) : (
        <div className="comments-list">
          {filteredComments.map((comment) => (
            <div key={comment._id} className="comment-item">
              <div className="comment-header">
                <div className="user-info">
                  {comment.user.image ? (
                    <Image
                      src={comment.user.image}
                      alt={comment.user.name}
                      width={40}
                      height={40}
                      className="user-avatar"
                    />
                  ) : (
                    <div className="user-avatar-placeholder">
                      {comment.user.name.charAt(0)}
                    </div>
                  )}
                  <span className="user-name">{comment.user.name}</span>
                </div>
                <span className="comment-date">
                  {new Date(comment.createdAt).toLocaleDateString('zh-CN')}
                </span>
              </div>
              <div className="comment-content">{comment.text}</div>
              <div className="comment-category">
                {comment.category === 'general' && '一般留言'}
                {comment.category === 'question' && '问题咨询'}
                {comment.category === 'suggestion' && '建议反馈'}
                {comment.category === 'appreciation' && '感谢支持'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
