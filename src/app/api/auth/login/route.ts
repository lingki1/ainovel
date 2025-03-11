import { NextRequest, NextResponse } from 'next/server';
import { isValidEmail } from '@/utils';
import { ApiResponse, User } from '@/types';
import { getUser, saveUser } from '@/lib/dataService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // 验证邮箱格式
    if (!email || !isValidEmail(email)) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '请提供有效的电子邮件地址'
      }, { status: 400 });
    }

    // 从数据文件中获取用户
    let user = getUser(email);

    // 如果用户不存在，创建新用户
    if (!user) {
      user = {
        email,
        characters: []
      };
      saveUser(user);
    }

    // 返回用户数据
    return NextResponse.json<ApiResponse<User>>({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('登录失败:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '登录处理失败，请稍后再试'
    }, { status: 500 });
  }
} 