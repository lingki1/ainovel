import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse, Story, StoryContent, ApiProvider } from '@/types';
import { generateId, formatDate } from '@/utils';
import { generateStoryBeginning, setApiProvider, getApiProvider } from '@/lib/ai';
import { getUser, saveUser } from '@/lib/dataService';

export async function POST(request: NextRequest) {
  try {
    console.log('收到创建故事POST请求');
    
    // 解析请求体
    const rawBody = await request.text();
    console.log('原始请求体:', rawBody);
    
    let body;
    try {
      body = JSON.parse(rawBody);
      console.log('解析后的请求体:', body);
    } catch (e) {
      console.error('JSON解析错误:', e);
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '无效的JSON格式'
      }, { status: 400 });
    }
    
    const { characterId, keywords, email } = body;

    // 验证请求参数
    if (!characterId) {
      console.error('缺少角色ID');
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '请提供角色ID'
      }, { status: 400 });
    }
    
    if (!keywords) {
      console.error('缺少关键词');
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '请提供故事关键词'
      }, { status: 400 });
    }
    
    if (!Array.isArray(keywords)) {
      console.error('关键词不是数组');
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '关键词必须是数组格式'
      }, { status: 400 });
    }
    
    if (keywords.length === 0) {
      console.error('关键词数组为空');
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '请至少提供一个关键词'
      }, { status: 400 });
    }
    
    if (!email) {
      console.error('缺少用户邮箱');
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '请提供用户邮箱'
      }, { status: 400 });
    }

    // 获取用户数据
    const user = getUser(email);
    if (!user) {
      console.error('用户不存在:', email);
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '用户不存在'
      }, { status: 404 });
    }

    // 查找角色
    const character = user.characters.find(c => c.id === characterId);
    if (!character) {
      console.error('角色不存在:', characterId);
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
    console.log('开始生成故事，角色:', character.name, '关键词:', keywords.join(', '));
    const storyBeginning = await generateStoryBeginning(
      keywords, 
      character.name,
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
    
    console.log('故事创建成功，ID:', newStory.id);

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