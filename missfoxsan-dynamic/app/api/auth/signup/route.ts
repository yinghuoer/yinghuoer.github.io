import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const body = await req.json();
    const { name, email, password } = body;
    
    // 验证输入
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: '请填写所有必填字段' },
        { status: 400 }
      );
    }
    
    // 检查邮箱是否已存在
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: '该邮箱已被注册' },
        { status: 409 }
      );
    }
    
    // 加密密码
    const hashedPassword = await hash(password, 12);
    
    // 创建用户
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });
    
    // 移除密码字段
    const userWithoutPassword = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    };
    
    return NextResponse.json(
      { message: '注册成功', user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: '注册失败', error },
      { status: 500 }
    );
  }
}
