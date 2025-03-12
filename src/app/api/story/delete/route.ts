import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types';
import { getUser, saveUser } from '@/lib/dataService';

// 删除故事
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storyId, characterId, email } = body;

    if (!storyId || !characterId || !email) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '请提供故事ID、角色ID和用户邮箱'
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

    // 查找角色
    const character = user.characters.find(c => c.id === characterId);
    if (!character) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '角色不存在'
      }, { status: 404 });
    }

    // 查找故事
    const storyIndex = character.stories.findIndex(s => s.id === storyId);
    if (storyIndex === -1) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '故事不存在'
      }, { status: 404 });
    }

    // 删除故事
    character.stories = character.stories.filter(s => s.id !== storyId);
    
    // 保存更新后的用户数据
    saveUser(user);

    return NextResponse.json<ApiResponse<{ id: string }>>({
      success: true,
      data: { id: storyId }
    });
  } catch (error) {
    console.error('删除故事失败:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '删除故事失败，请稍后再试'
    }, { status: 500 });
  }
} 