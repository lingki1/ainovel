import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types';
import { getUser, saveUser } from '@/lib/dataService';

// 删除角色
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { characterId, email } = body;

    if (!characterId || !email) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '请提供角色ID和用户邮箱'
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

    // 检查角色是否存在
    const characterIndex = user.characters.findIndex(character => character.id === characterId);
    if (characterIndex === -1) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '角色不存在'
      }, { status: 404 });
    }

    // 删除角色
    user.characters = user.characters.filter(character => character.id !== characterId);
    saveUser(user);

    return NextResponse.json<ApiResponse<{ id: string }>>({
      success: true,
      data: { id: characterId }
    });
  } catch (error) {
    console.error('删除角色失败:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '删除角色失败，请稍后再试'
    }, { status: 500 });
  }
} 