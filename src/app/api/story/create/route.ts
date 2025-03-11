import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse, Story, StoryContent, ApiProvider } from '@/types';
import { generateId, formatDate } from '@/utils';
import { generateStoryBeginning, setApiProvider, getApiProvider } from '@/lib/ai';
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

    // 使用AI生成故事开端，传递角色属性
    const storyBeginning = await generateStoryBeginning(
      keywords, 
      characterName,
      character.attributes
    );
    
    // 创建故事内容
    const storyContent: StoryContent = {
      id: generateId(),
      text: storyBeginning,
      type: 'ai',
      timestamp: formatDate(),
      wordCount: 1000 // 设置初始故事的字数
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