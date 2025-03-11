import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse, StoryContent, ApiProvider } from '@/types';
import { continueStory, setApiProvider, getApiProvider } from '@/lib/ai';
import { formatStoryToText, generateId, formatDate } from '@/utils';
import { getUser, saveUser } from '@/lib/dataService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storyContent, choice, wordCount, characterName, email, characterId, storyId } = body;

    if (!storyContent || !Array.isArray(storyContent) || storyContent.length === 0 || !choice || !wordCount || !characterName || !email || !characterId || !storyId) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '请提供有效的故事内容、选择、字数、角色名称、用户邮箱、角色ID和故事ID'
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

    // 设置用户选择的API提供商
    if (user.apiSettings?.provider) {
      console.log(`设置API提供商: ${user.apiSettings.provider}`);
      
      // 确保provider是有效的ApiProvider枚举值
      let provider = user.apiSettings.provider;
      if (provider !== ApiProvider.DEEPSEEK && provider !== ApiProvider.GOOGLE) {
        console.warn(`无效的API提供商: ${provider}，使用默认值: ${ApiProvider.DEEPSEEK}`);
        provider = ApiProvider.DEEPSEEK;
      }
      
      setApiProvider(provider as ApiProvider);
      console.log(`设置后的API提供商: ${getApiProvider()}`);
    }

    // 将故事内容转换为文本
    const storyText = formatStoryToText(storyContent);
    
    // 使用AI继续故事，传递角色属性
    const continuedStory = await continueStory(
      storyText, 
      choice, 
      wordCount, 
      characterName,
      character.attributes
    );

    // 创建玩家选择内容
    const playerChoice: StoryContent = {
      id: generateId(),
      text: choice,
      type: 'player-choice',
      timestamp: formatDate(),
      selectedChoice: choice
    };

    // 创建AI生成的故事内容
    const aiContent: StoryContent = {
      id: generateId(),
      text: continuedStory,
      type: 'ai',
      timestamp: formatDate(),
      wordCount
    };

    // 更新故事内容
    story.content.push(playerChoice, aiContent);
    story.updatedAt = formatDate();
    saveUser(user);

    return NextResponse.json<ApiResponse<StoryContent[]>>({
      success: true,
      data: [playerChoice, aiContent]
    });
  } catch (error) {
    console.error('继续故事失败:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '继续故事失败，请稍后再试'
    }, { status: 500 });
  }
} 