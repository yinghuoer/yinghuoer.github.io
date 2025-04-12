import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/mongoose';
import Comment from '@/models/Comment';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: NextRequest) {
  await dbConnect();

  try {
    const comments = await Comment.find({})
      .populate('user', 'name image')
      .sort({ createdAt: -1 });
    
    return NextResponse.json(comments);
  } catch (error) {
    return NextResponse.json(
      { message: '获取评论失败', error },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  // 检查用户是否已登录
  if (!session || !session.user) {
    return NextResponse.json(
      { message: '请先登录' },
      { status: 401 }
    );
  }

  await dbConnect();

  try {
    const body = await req.json();
    const { text, category } = body;
    
    if (!text || !category) {
      return NextResponse.json(
        { message: '评论内容和分类不能为空' },
        { status: 400 }
      );
    }
    
    const comment = await Comment.create({
      text,
      category,
      user: session.user.id,
    });
    
    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: '创建评论失败', error },
      { status: 500 }
    );
  }
}
