import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse, ApiSettings } from '@/types';
import { getUser, saveUser } from '@/lib/dataService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, apiSettings } = body;

    if (!email || !apiSettings) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '请提供有效的邮箱和API设置'
      }, { status: 400 });
    }

    // 获取用户数据
    const user = getUser(email);
    if (!user) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '用户不存在'
      }, { status: 404 });
    }

    // 更新API设置
    user.apiSettings = {
      ...(user.apiSettings || {}),
      ...apiSettings
    } as ApiSettings;

    // 保存用户数据
    saveUser(user);

    console.log(`用户 ${email} 的API设置已更新为: ${user.apiSettings.provider}`);

    return NextResponse.json<ApiResponse<{ provider: string }>>({
      success: true,
      data: { provider: user.apiSettings.provider }
    });
  } catch (error) {
    console.error('更新API设置失败:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '更新API设置失败，请稍后再试'
    }, { status: 500 });
  }
} 