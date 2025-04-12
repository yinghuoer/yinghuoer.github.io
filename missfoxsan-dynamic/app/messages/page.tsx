import { Metadata } from 'next';
import CommentForm from '@/components/CommentForm';
import CommentList from '@/components/CommentList';

export const metadata: Metadata = {
  title: '留言板 - 狐狸小姐',
  description: '欢迎在狐狸小姐的留言板上分享您的想法和反馈',
};

export default function MessagesPage() {
  return (
    <div className="messages-container">
      <h1 className="page-title">留言板</h1>
      <p className="page-description">
        欢迎在这里留下您的想法、问题或建议。我们非常重视您的反馈！
      </p>
      
      <div className="messages-content">
        <CommentForm />
        <CommentList />
      </div>
    </div>
  );
}
