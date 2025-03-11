import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse, Story, StoryContent } from '@/types';
import { generateId, formatDate } from '@/utils';
import { generateStoryBeginning } from '@/lib/ai';
import { getUser, saveUser } from '@/lib/dataService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { characterId, keywords, characterName, email } = body;

    if (!characterId || !keywords || !Array.isArray(keywords) || keywords.length === 0 || !characterName || !email) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '请提供角色ID、角色名称、用户邮箱和故事关键词'
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

    // 使用AI生成故事开端
    const storyBeginning = await generateStoryBeginning(keywords, characterName);
    
    // 创建故事内容
    const storyContent: StoryContent = {
      id: generateId(),
      text: storyBeginning,
      type: 'ai',
      timestamp: formatDate()
    };

    // 创建新故事
    const newStory: Story = {
      id: generateId(),
      title: `基于 ${keywords.join(', ')} 的故事`,
      keywords,
      createdAt: formatDate(),
      updatedAt: formatDate(),
      content: [storyContent]
    };

    // 添加故事到角色
    character.stories.push(newStory);
    saveUser(user);

    return NextResponse.json<ApiResponse<Story>>({
      success: true,
      data: newStory
    });
  } catch (error) {
    console.error('创建故事失败:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '创建故事失败，请稍后再试'
    }, { status: 500 });
  }
} 