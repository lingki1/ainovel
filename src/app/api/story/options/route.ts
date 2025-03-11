import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types';
import { generateStoryOptions } from '@/lib/ai';
import { formatStoryToText } from '@/utils';
import { getUser } from '@/lib/dataService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storyContent, characterName, email, characterId, storyId } = body;

    if (!storyContent || !Array.isArray(storyContent) || storyContent.length === 0 || !characterName || !email || !characterId || !storyId) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '请提供有效的故事内容、角色名称、用户邮箱、角色ID和故事ID'
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

    // 查找角色和故事
    const character = user.characters.find(c => c.id === characterId);
    if (!character) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '角色不存在'
      }, { status: 404 });
    }

    const story = character.stories.find(s => s.id === storyId);
    if (!story) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '故事不存在'
      }, { status: 404 });
    }

    // 将故事内容转换为文本
    const storyText = formatStoryToText(storyContent);
    
    // 使用AI生成故事选项
    const options = await generateStoryOptions(storyText, characterName);

    return NextResponse.json<ApiResponse<string[]>>({
      success: true,
      data: options
    });
  } catch (error) {
    console.error('生成故事选项失败:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '生成故事选项失败，请稍后再试'
    }, { status: 500 });
  }
} 